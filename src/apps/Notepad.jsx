import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useOS';
import '../styles/apps.css';

/**
 * Notepad App
 */

const Notepad = ({ initialFilePath }) => {
  const { createFile, updateFileContent, getDirectoryContents, getFile } = useFileSystem();
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [fileName, setFileName] = useState('untitled.txt');
  const [currentFolder, setCurrentFolder] = useState('C:\\Users\\Documents');

  // Load initial file if provided
  useEffect(() => {
    if (initialFilePath && initialFilePath !== 'notepad') {
      const file = getFile(initialFilePath);
      if (file) {
        setContent(file.content || '');
        setCurrentFile(file.path);
        setFileName(file.name);
        setCurrentFolder(file.parent);
        setIsDirty(false);
      }
    }
  }, [initialFilePath, getFile]);

  // Auto-save every 30 seconds if dirty
  useEffect(() => {
    const timer = setInterval(() => {
      if (isDirty && currentFile) {
        updateFileContent(currentFile, content);
        setIsDirty(false);
      }
    }, 30000);
    return () => clearInterval(timer);
  }, [isDirty, currentFile, content, updateFileContent]);

  // Handle content change
  const handleContentChange = (e) => {
    setContent(e.target.value);
    setIsDirty(true);
  };

  // Create new file
  const handleNew = () => {
    if (isDirty) {
      if (window.confirm('Save changes to ' + (currentFile || 'untitled.txt') + '?')) {
        handleSave();
      }
    }
    setContent('');
    setCurrentFile(null);
    setIsDirty(false);
  };

  // Save file
  const handleSave = () => {
    if (!currentFile) {
      setShowSaveDialog(true);
    } else {
      updateFileContent(currentFile, content);
      setIsDirty(false);
    }
  };

  // Save as
  const handleSaveAs = () => {
    setShowSaveDialog(true);
  };

  // Confirm save with dialog
  const handleConfirmSave = () => {
    if (fileName.trim()) {
      const filePath = `${currentFolder}\\${fileName}`;
      if (currentFile === filePath) {
        updateFileContent(currentFile, content);
      } else {
        createFile(currentFolder, fileName, content);
      }
      setCurrentFile(filePath);
      setIsDirty(false);
      setShowSaveDialog(false);
    }
  };

  // Open file
  const handleOpen = () => {
    setShowOpenDialog(true);
  };

  // Load file
  const handleLoadFile = (filePath) => {
    const files = getDirectoryContents(filePath.substring(0, filePath.lastIndexOf('\\'))).files;
    const file = files.find((f) => `${f.parent}\\${f.name}` === filePath);
    if (file) {
      setContent(file.content);
      setCurrentFile(filePath);
      setIsDirty(false);
      setShowOpenDialog(false);
    }
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          // Save logic
          if (!currentFile) {
            setShowSaveDialog(true);
          } else {
            updateFileContent(currentFile, content);
            setIsDirty(false);
          }
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          // New logic
          if (isDirty) {
            if (window.confirm('Save changes to ' + (currentFile || 'untitled.txt') + '?')) {
              if (currentFile) {
                updateFileContent(currentFile, content);
              }
            }
          }
          setContent('');
          setCurrentFile(null);
          setIsDirty(false);
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          setShowOpenDialog(true);
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isDirty, currentFile, content, updateFileContent]);

  return (
    <div className="notepad">
      {/* Menu bar */}
      <div className="notepad-menu">
        <button onClick={handleNew} title="New (Ctrl+N)">
          📄 New
        </button>
        <button onClick={handleOpen} title="Open (Ctrl+O)">
          📂 Open
        </button>
        <button onClick={handleSave} title="Save (Ctrl+S)">
          💾 Save
        </button>
        <button onClick={handleSaveAs} title="Save As">
          💾 Save As
        </button>
        <span className="menu-spacer" />
        <span className="file-indicator">
          {currentFile ? currentFile.split('\\').pop() : 'untitled.txt'}
          {isDirty ? ' *' : ''}
        </span>
      </div>

      {/* Text editor */}
      <textarea
        className="notepad-textarea"
        value={content}
        onChange={handleContentChange}
        placeholder="Start typing..."
        spellCheck="false"
      />

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h2>Save As</h2>
            <div className="form-group">
              <label>File name:</label>
              <input
                type="text"
                value={fileName}
                onChange={(e) => setFileName(e.target.value)}
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Location:</label>
              <div className="location-selector">
                <button onClick={() => setCurrentFolder('C:\\Users\\Desktop')}>Desktop</button>
                <button onClick={() => setCurrentFolder('C:\\Users\\Documents')}>Documents</button>
                <button onClick={() => setCurrentFolder('C:\\Users\\Downloads')}>Downloads</button>
              </div>
            </div>
            <div className="modal-buttons">
              <button onClick={handleConfirmSave} className="btn-primary">
                Save
              </button>
              <button onClick={() => setShowSaveDialog(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Open dialog */}
      {showOpenDialog && (
        <div className="modal-overlay">
          <div className="modal-dialog">
            <h2>Open File</h2>
            <div className="file-browser">
              {currentFolder && (
                <button
                  onClick={() => setCurrentFolder(currentFolder.substring(0, currentFolder.lastIndexOf('\\')))}
                  className="file-item"
                >
                  ...
                </button>
              )}
              {getDirectoryContents(currentFolder).files.map((file) => (
                <button
                  key={file.name}
                  onClick={() => handleLoadFile(`${currentFolder}\\${file.name}`)}
                  className="file-item"
                >
                  📄 {file.name}
                </button>
              ))}
              {getDirectoryContents(currentFolder).files.length === 0 && (
                <div className="empty-file-browser">No files in this folder</div>
              )}
            </div>
            <div className="modal-buttons">
              <button onClick={() => setShowOpenDialog(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Notepad;
