import React, { useState, useEffect } from 'react';
import { useFileSystem } from '../hooks/useOS';
import '../styles/apps.css';

/**
 * Word Processor App - MS Word Simulation
 */

const WordProcessor = () => {
  const { createFile, updateFileContent, getDirectoryContents } = useFileSystem();
  const [content, setContent] = useState('');
  const [currentFile, setCurrentFile] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showOpenDialog, setShowOpenDialog] = useState(false);
  const [showPrintDialog, setShowPrintDialog] = useState(false);
  const [showPrintQueue, setShowPrintQueue] = useState(false);
  const [fileName, setFileName] = useState('Document1.docx');
  const [currentFolder, setCurrentFolder] = useState('C:\\Users\\Documents');
  const [printQueue, setPrintQueue] = useState([]);
  const [printSettings, setPrintSettings] = useState({
    copies: 1,
    orientation: 'portrait',
    paperSize: 'A4',
    colorMode: 'color',
    printer: 'Default Printer',
  });
  const [fontSize, setFontSize] = useState(12);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);
  const [isUnderline, setIsUnderline] = useState(false);
  const [alignment, setAlignment] = useState('left');

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

  // Create new document
  const handleNew = () => {
    if (isDirty) {
      if (window.confirm('Save changes to ' + (currentFile || 'Document1.docx') + '?')) {
        handleSave();
      }
    }
    setContent('');
    setCurrentFile(null);
    setIsDirty(false);
    setFileName('Document1.docx');
    setFontSize(12);
    setFontFamily('Arial');
    setIsBold(false);
    setIsItalic(false);
    setIsUnderline(false);
    setAlignment('left');
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

  // Print functionality
  const handlePrint = () => {
    setShowPrintDialog(true);
  };

  const handleConfirmPrint = () => {
    if (content.trim()) {
      const printJob = {
        id: Date.now(),
        fileName: currentFile || 'Document1.docx',
        status: 'printing',
        progress: 0,
        settings: { ...printSettings },
        createdAt: new Date().toLocaleString(),
        pages: Math.ceil(content.length / 2000),
      };

      setPrintQueue((prev) => [...prev, printJob]);
      setShowPrintDialog(false);

      // Simulate printing progress
      let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress >= 100) {
          clearInterval(interval);
          setPrintQueue((prev) =>
            prev.map((job) =>
              job.id === printJob.id ? { ...job, status: 'completed', progress: 100 } : job
            )
          );
        } else {
          setPrintQueue((prev) =>
            prev.map((job) =>
              job.id === printJob.id ? { ...job, progress: Math.min(progress, 99) } : job
            )
          );
        }
      }, 1000);
    }
  };

  const handleCancelPrintJob = (jobId) => {
    setPrintQueue((prev) => prev.filter((job) => job.id !== jobId));
  };

  const handleClearCompletedJobs = () => {
    setPrintQueue((prev) => prev.filter((job) => job.status !== 'completed'));
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey) {
        if (e.key === 's' || e.key === 'S') {
          e.preventDefault();
          handleSave();
        } else if (e.key === 'n' || e.key === 'N') {
          e.preventDefault();
          handleNew();
        } else if (e.key === 'o' || e.key === 'O') {
          e.preventDefault();
          handleOpen();
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handlePrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentFile, isDirty, content]);

  return (
    <div className="flex h-full w-full flex-col bg-white">
      {/* Menu Bar */}
      <div className="border-b border-gray-300 bg-gray-100 px-4 py-2">
        <div className="flex gap-4 text-sm font-semibold">
          <button
            onClick={handleNew}
            className="rounded px-3 py-1 hover:bg-gray-200"
            title="Ctrl+N"
          >
            File
          </button>
          <button
            onClick={handleOpen}
            className="rounded px-3 py-1 hover:bg-gray-200"
            title="Ctrl+O"
          >
            Open
          </button>
          <button
            onClick={handleSave}
            className="rounded px-3 py-1 hover:bg-gray-200"
            title="Ctrl+S"
          >
            Save
          </button>
          <button
            onClick={handleSaveAs}
            className="rounded px-3 py-1 hover:bg-gray-200"
          >
            Save As
          </button>
          <div className="border-l border-gray-300"></div>
          <button
            onClick={handlePrint}
            className="rounded px-3 py-1 hover:bg-gray-200"
            title="Ctrl+P"
          >
            Print
          </button>
          <button
            onClick={() => setShowPrintQueue(!showPrintQueue)}
            className="relative rounded px-3 py-1 hover:bg-gray-200"
          >
            Print Queue
            {printQueue.length > 0 && (
              <span className="absolute right-1 top-0 inline-flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                {printQueue.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-300 bg-gray-50 px-4 py-2">
        <div className="flex gap-2">
          {/* Font Family */}
          <select
            value={fontFamily}
            onChange={(e) => setFontFamily(e.target.value)}
            className="rounded border border-gray-300 px-2 py-1 text-sm"
          >
            <option>Arial</option>
            <option>Times New Roman</option>
            <option>Courier New</option>
            <option>Georgia</option>
            <option>Verdana</option>
          </select>

          {/* Font Size */}
          <input
            type="number"
            min="8"
            max="72"
            value={fontSize}
            onChange={(e) => setFontSize(parseInt(e.target.value))}
            className="w-12 rounded border border-gray-300 px-2 py-1 text-sm"
          />

          <div className="border-l border-gray-300"></div>

          {/* Bold */}
          <button
            onClick={() => setIsBold(!isBold)}
            className={`rounded px-2 py-1 font-bold ${
              isBold ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
          >
            B
          </button>

          {/* Italic */}
          <button
            onClick={() => setIsItalic(!isItalic)}
            className={`rounded px-2 py-1 italic ${
              isItalic ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
          >
            I
          </button>

          {/* Underline */}
          <button
            onClick={() => setIsUnderline(!isUnderline)}
            className={`rounded px-2 py-1 underline ${
              isUnderline ? 'bg-blue-200' : 'hover:bg-gray-200'
            }`}
          >
            U
          </button>

          <div className="border-l border-gray-300"></div>

          {/* Alignment */}
          <button
            onClick={() => setAlignment('left')}
            className={`rounded px-2 py-1 ${alignment === 'left' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="Left Align"
          >
            ⬅️
          </button>
          <button
            onClick={() => setAlignment('center')}
            className={`rounded px-2 py-1 ${alignment === 'center' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="Center Align"
          >
            ↔️
          </button>
          <button
            onClick={() => setAlignment('right')}
            className={`rounded px-2 py-1 ${alignment === 'right' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
            title="Right Align"
          >
            ➡️
          </button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="border-b border-gray-300 bg-gray-50 px-4 py-1 text-xs text-gray-600">
        <div className="flex justify-between">
          <span>{currentFile || 'Untitled Document'}</span>
          <span>
            {isDirty ? '● Unsaved' : 'Saved'} | Words: {content.split(/\s+/).filter(Boolean).length} | Characters:
            {content.length}
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={content}
          onChange={handleContentChange}
          className="h-full w-full resize-none border-none p-6 font-serif focus:outline-none"
          style={{
            fontFamily: fontFamily,
            fontSize: `${fontSize}px`,
            fontWeight: isBold ? 'bold' : 'normal',
            fontStyle: isItalic ? 'italic' : 'normal',
            textDecoration: isUnderline ? 'underline' : 'none',
            textAlign: alignment,
          }}
          placeholder="Start typing your document..."
          spellCheck="true"
        />
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="w-96 rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-semibold">
              Save Document
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">File Name:</label>
                <input
                  type="text"
                  value={fileName}
                  onChange={(e) => setFileName(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Folder:</label>
                <input
                  type="text"
                  value={currentFolder}
                  onChange={(e) => setCurrentFolder(e.target.value)}
                  className="w-full rounded border border-gray-300 px-3 py-2"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmSave}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Dialog */}
      {showOpenDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="w-96 rounded-lg border border-gray-300 bg-white shadow-lg max-h-96">
            <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-semibold">
              Open Document
            </div>
            <div className="p-4 space-y-4">
              <div className="text-sm text-gray-600 mb-2">Recent Files:</div>
              <div className="border border-gray-300 rounded p-2 max-h-48 overflow-y-auto">
                {getDirectoryContents(currentFolder).files.map((file) => (
                  <div
                    key={file.name}
                    onClick={() =>
                      handleLoadFile(`${currentFolder}\\${file.name}`)
                    }
                    className="cursor-pointer rounded px-2 py-1 hover:bg-blue-100"
                  >
                    {file.name}
                  </div>
                ))}
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowOpenDialog(false)}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Dialog */}
      {showPrintDialog && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="w-full max-w-md rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-semibold">
              Print Document
            </div>
            <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="block text-sm font-medium mb-1">Printer:</label>
                <select
                  value={printSettings.printer}
                  onChange={(e) =>
                    setPrintSettings({ ...printSettings, printer: e.target.value })
                  }
                  className="w-full rounded border border-gray-300 px-3 py-2"
                >
                  <option>Default Printer</option>
                  <option>HP LaserJet Pro</option>
                  <option>Canon ImageRunner</option>
                  <option>Xerox WorkCentre</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Copies:</label>
                  <input
                    type="number"
                    min="1"
                    max="999"
                    value={printSettings.copies}
                    onChange={(e) =>
                      setPrintSettings({ ...printSettings, copies: parseInt(e.target.value) })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Paper Size:</label>
                  <select
                    value={printSettings.paperSize}
                    onChange={(e) =>
                      setPrintSettings({ ...printSettings, paperSize: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option>A4</option>
                    <option>Letter</option>
                    <option>A3</option>
                    <option>Legal</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Orientation:</label>
                  <select
                    value={printSettings.orientation}
                    onChange={(e) =>
                      setPrintSettings({ ...printSettings, orientation: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="portrait">Portrait</option>
                    <option value="landscape">Landscape</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Color Mode:</label>
                  <select
                    value={printSettings.colorMode}
                    onChange={(e) =>
                      setPrintSettings({ ...printSettings, colorMode: e.target.value })
                    }
                    className="w-full rounded border border-gray-300 px-3 py-2"
                  >
                    <option value="color">Color</option>
                    <option value="grayscale">Grayscale</option>
                    <option value="blackwhite">Black & White</option>
                  </select>
                </div>
              </div>

              <div className="rounded bg-gray-50 p-3 text-sm">
                <div className="font-semibold mb-1">Preview:</div>
                <div className="text-gray-600">
                  <div>Document: {currentFile || 'Document1.docx'}</div>
                  <div>Pages: {Math.ceil(content.length / 2000)}</div>
                  <div>Copies: {printSettings.copies}</div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  onClick={() => setShowPrintDialog(false)}
                  className="rounded border border-gray-300 px-4 py-2 hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmPrint}
                  className="rounded bg-blue-500 px-4 py-2 text-white hover:bg-blue-600"
                >
                  Print
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Queue */}
      {showPrintQueue && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 z-50">
          <div className="w-full max-w-2xl rounded-lg border border-gray-300 bg-white shadow-lg">
            <div className="border-b border-gray-300 bg-gray-100 px-4 py-2 font-semibold flex justify-between items-center">
              <span>Print Queue ({printQueue.length} jobs)</span>
              <button
                onClick={() => setShowPrintQueue(false)}
                className="text-gray-600 hover:text-gray-900"
              >
                ✕
              </button>
            </div>
            <div className="p-4 max-h-96 overflow-y-auto">
              {printQueue.length === 0 ? (
                <div className="text-center text-gray-500 py-8">No print jobs</div>
              ) : (
                <div className="space-y-3">
                  {printQueue.map((job) => (
                    <div
                      key={job.id}
                      className="border border-gray-300 rounded p-3 bg-gray-50"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-sm">{job.fileName}</div>
                          <div className="text-xs text-gray-600 mt-1">
                            <div>Printer: {job.settings.printer}</div>
                            <div>Pages: {job.pages} | Copies: {job.settings.copies}</div>
                            <div>Size: {job.settings.paperSize} | Mode: {job.settings.colorMode}</div>
                            <div>Created: {job.createdAt}</div>
                          </div>
                        </div>
                        <span
                          className={`text-xs font-semibold px-2 py-1 rounded ${
                            job.status === 'completed'
                              ? 'bg-green-200 text-green-800'
                              : 'bg-blue-200 text-blue-800'
                          }`}
                        >
                          {job.status}
                        </span>
                      </div>
                      <div className="mb-2">
                        <div className="w-full bg-gray-300 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              job.status === 'completed'
                                ? 'bg-green-500'
                                : 'bg-blue-500'
                            }`}
                            style={{ width: `${job.progress}%` }}
                          ></div>
                        </div>
                        <div className="text-xs text-gray-600 mt-1">
                          {job.progress}%
                        </div>
                      </div>
                      {job.status !== 'completed' && (
                        <button
                          onClick={() => handleCancelPrintJob(job.id)}
                          className="text-xs text-red-600 hover:text-red-800"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
              {printQueue.some((job) => job.status === 'completed') && (
                <div className="mt-4 pt-4 border-t border-gray-300">
                  <button
                    onClick={handleClearCompletedJobs}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Clear Completed Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WordProcessor;
