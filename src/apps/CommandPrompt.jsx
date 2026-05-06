import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useFileSystem, useOS, useProcesses, useWindow } from '../hooks/useOS';
import { APP_TYPES, ALL_APPS } from '../utils/constants';
import { fileSystemActions } from '../store/fileSystemStore';

const ROOT_PATH = 'C:\\';
const HOME_PATH = 'C:\\Users\\Desktop';
const SCRIPTS_PATH = 'C:\\Users\\Documents\\Scripts';

const sampleScripts = {
  'backup.bat':
    'rem Back up project notes\nmkdir C:\\Users\\Documents\\Backup\ncopy C:\\Users\\Desktop\\Project Brief.txt C:\\Users\\Documents\\Backup\necho Backup completed at %DATE% %TIME%',
  'launch-apps.bat':
    'rem Launch simulated applications\nstart notepad\nstart file-explorer\nstart task-manager\ntasklist',
  'network-check.bat':
    'rem Network diagnostic automation\nipconfig\nping gateway.local\nnetstat\nconnect fileserver.local 445',
  'setup-workspace.bat':
    'rem Create folders and reusable files\nset PROJECT=OSDemo\nmkdir C:\\Users\\Desktop\\%PROJECT%\nwrite C:\\Users\\Desktop\\%PROJECT%\\readme.txt Project workspace created\nif exist C:\\Users\\Desktop\\%PROJECT%\\readme.txt echo Workspace ready',
};

const normalizePath = (path) => {
  if (!path) return ROOT_PATH;
  const normalized = path.replace(/[\\/]+/g, '\\').replace(/\\$/, '');
  if (/^c:$/i.test(normalized)) return ROOT_PATH;
  if (/^c:\\/i.test(normalized)) return `C:${normalized.slice(2)}`;
  return normalized;
};

const joinPath = (parentPath, child) =>
  parentPath === ROOT_PATH ? `${ROOT_PATH}${child}` : `${parentPath}\\${child}`;

const getBaseName = (path) => {
  if (path === ROOT_PATH) return ROOT_PATH;
  const parts = normalizePath(path).split('\\');
  return parts[parts.length - 1];
};

const getParentPath = (path) => {
  const normalized = normalizePath(path);
  if (normalized === ROOT_PATH) return ROOT_PATH;
  const lastSeparator = normalized.lastIndexOf('\\');
  return lastSeparator <= 2 ? ROOT_PATH : normalized.slice(0, lastSeparator);
};

const splitArgs = (input) => {
  const matches = input.match(/"[^"]*"|'[^']*'|\S+/g) || [];
  return matches.map((item) => item.replace(/^["']|["']$/g, ''));
};

const splitCommands = (line) => {
  const commands = [];
  let current = '';
  let quote = null;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if ((char === '"' || char === "'") && line[index - 1] !== '\\') {
      quote = quote === char ? null : quote || char;
    }

    if (!quote && char === '&' && next === '&') {
      if (current.trim()) commands.push(current.trim());
      current = '';
      index += 1;
      continue;
    }

    if (!quote && char === ';') {
      if (current.trim()) commands.push(current.trim());
      current = '';
      continue;
    }

    current += char;
  }

  if (current.trim()) commands.push(current.trim());
  return commands;
};

const resolvePath = (input, currentPath) => {
  if (!input || input === '.') return currentPath;
  if (input === '..') return getParentPath(currentPath);
  if (input.startsWith('~')) return normalizePath(input.replace('~', HOME_PATH));
  if (/^[a-z]:/i.test(input)) return normalizePath(input);

  const parts = input.replace(/[\\/]+/g, '\\').split('\\').filter(Boolean);
  let resolved = currentPath;
  parts.forEach((part) => {
    if (part === '.') return;
    if (part === '..') {
      resolved = getParentPath(resolved);
      return;
    }
    resolved = joinPath(resolved, part);
  });
  return normalizePath(resolved);
};

// Helper: Parse command flags (/s, /y, /q, /a, /v, /p)
const parseFlags = (args) => {
  const flags = {};
  const remaining = [];
  args.forEach((arg) => {
    if (/^\/[a-z]$/i.test(arg)) {
      flags[arg.toLowerCase()] = true;
    } else {
      remaining.push(arg);
    }
  });
  return { flags, remaining };
};

// Helper: Format file size for display
const formatSize = (bytes) => {
  if (bytes === undefined) return '      ';
  const size = Number(bytes) || 0;
  if (size < 1024) return String(size).padStart(6);
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)}K`.padStart(6);
  return `${(size / (1024 * 1024)).toFixed(1)}M`.padStart(6);
};

const makeLine = (text, type = 'output') => ({ id: crypto.randomUUID(), text, type });

const stableNumber = (value, modulo, offset = 0) =>
  [...String(value)].reduce((sum, char) => sum + char.charCodeAt(0), 0) % modulo + offset;

const CommandPrompt = () => {
  const fs = useFileSystem();
  const { fileSystem, createFolder, createFile, updateFileContent, deleteItem, moveItem, getFile, getFolder } = fs;
  const { processState, createProcess, updateProcessState, deleteProcess } = useProcesses();
  const { openWindow, windows } = useWindow();
  const { memoryState, isDarkMode, accentColor } = useOS();

  const [currentPath, setCurrentPath] = useState(HOME_PATH);
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([
    makeLine('OS Simulator Command Prompt [Version 1.0.2605]', 'system'),
    makeLine('Type help for commands. Sample scripts live in C:\\Users\\Documents\\Scripts.', 'system'),
  ]);
  const [commandHistory, setCommandHistory] = useState([]);
  const [variables, setVariables] = useState({
    USERNAME: 'Student',
    COMPUTERNAME: 'OS-SIM',
    HOMEPATH: HOME_PATH,
  });

  const outputRef = useRef(null);
  const inputRef = useRef(null);
  const shadowFsRef = useRef(fileSystem);
  const historyIndexRef = useRef(null);

  useEffect(() => {
    shadowFsRef.current = fileSystem;
  }, [fileSystem]);

  useEffect(() => {
    if (!getFolder(SCRIPTS_PATH)) {
      createFolder('C:\\Users\\Documents', 'Scripts');
    }

    Object.entries(sampleScripts).forEach(([fileName, content]) => {
      const scriptPath = joinPath(SCRIPTS_PATH, fileName);
      if (!getFile(scriptPath)) {
        createFile(SCRIPTS_PATH, fileName, content);
      }
    });
  }, [createFile, createFolder, getFile, getFolder]);

  useEffect(() => {
    outputRef.current?.scrollTo({ top: outputRef.current.scrollHeight });
  }, [history]);

  const systemStats = useMemo(() => {
    const usedMemory = memoryState.partitions
      ?.filter((partition) => partition.allocated)
      .reduce((sum, partition) => sum + partition.size, 0) || 0;
    const totalMemory = memoryState.totalMemory || 1024;
    return {
      files: Object.keys(fileSystem.files).length,
      folders: Object.keys(fileSystem.folders).length,
      totalMemory,
      usedMemory,
    };
  }, [fileSystem, memoryState]);

  const emit = (lines) => {
    const normalizedLines = Array.isArray(lines) ? lines : [lines];
    setHistory((current) => [
      ...current,
      ...normalizedLines.flatMap((line) =>
        String(line)
          .split('\n')
          .map((text) => makeLine(text))
      ),
    ]);
  };

  const mutateShadow = (updater) => {
    shadowFsRef.current = updater(shadowFsRef.current);
  };

  const expandVariables = (command) => {
    const now = new Date();
    return command.replace(/%([^%]+)%/g, (_, rawName) => {
      const name = rawName.toUpperCase();
      if (name === 'CD') return currentPath;
      if (name === 'DATE') return now.toLocaleDateString();
      if (name === 'TIME') return now.toLocaleTimeString();
      return variables[name] ?? '';
    });
  };

  const itemExists = (path) => Boolean(shadowFsRef.current.files[path] || shadowFsRef.current.folders[path]);
  const folderExists = (path) => Boolean(shadowFsRef.current.folders[path]);
  const fileExists = (path) => Boolean(shadowFsRef.current.files[path]);
  const readFile = (path) => shadowFsRef.current.files[path] || null;

  const writeFile = (filePath, content) => {
    const normalizedPath = normalizePath(filePath);
    const parentPath = getParentPath(normalizedPath);
    const fileName = getBaseName(normalizedPath);

    if (!folderExists(parentPath)) {
      return [`The system cannot find the path specified: ${parentPath}`];
    }

    if (fileExists(normalizedPath)) {
      mutateShadow((state) => fileSystemActions.updateFileContent(state, normalizedPath, content));
      updateFileContent(normalizedPath, content);
      return [`Wrote ${content.length} byte(s) to ${normalizedPath}`];
    }

    mutateShadow((state) => fileSystemActions.createFile(state, parentPath, fileName, content));
    createFile(parentPath, fileName, content);
    return [`Created ${normalizedPath}`];
  };

  const executeScript = (filePath, depth) => {
    if (depth > 6) return ['Script nesting limit exceeded.'];
    const file = readFile(filePath);
    if (!file) return [`Script not found: ${filePath}`];

    const outputs = [`Running ${filePath}`];
    const lines = file.content.split(/\r?\n/);
    
    // Build label map
    const labels = {};
    lines.forEach((line, index) => {
      const labelMatch = line.match(/^\s*:([a-zA-Z0-9_-]+)\s*$/);
      if (labelMatch) {
        labels[labelMatch[1].toLowerCase()] = index;
      }
    });

    // Script state
    let echoOn = true;
    let currentLine = 0;
    const localVars = new Map();

    // Execute with goto support
    while (currentLine < lines.length) {
      const line = lines[currentLine];
      const trimmed = line.trim();
      
      // Skip empty and comment lines
      if (!trimmed || /^(rem\b|::|#)/i.test(trimmed)) {
        currentLine += 1;
        continue;
      }

      // Handle @echo off at line start
      if (/^@echo\s+off$/i.test(trimmed)) {
        echoOn = false;
        currentLine += 1;
        continue;
      }

      if (/^@echo\s+on$/i.test(trimmed)) {
        echoOn = true;
        currentLine += 1;
        continue;
      }

      // Handle setlocal
      if (/^setlocal$/i.test(trimmed)) {
        localVars.clear();
        currentLine += 1;
        continue;
      }

      // Handle endlocal
      if (/^endlocal$/i.test(trimmed)) {
        localVars.clear();
        currentLine += 1;
        continue;
      }

      // Handle goto
      const gotoMatch = trimmed.match(/^goto\s+([a-zA-Z0-9_-]+)$/i);
      if (gotoMatch) {
        const targetLabel = gotoMatch[1].toLowerCase();
        if (targetLabel in labels) {
          currentLine = labels[targetLabel];
          continue;
        }
        outputs.push(`Label not found: ${targetLabel}`);
        currentLine += 1;
        continue;
      }

      // Handle pause
      if (/^pause\s*$/i.test(trimmed)) {
        outputs.push('Press any key to continue...');
        currentLine += 1;
        continue;
      }

      // Handle labels (skip)
      if (/^\s*:[a-zA-Z0-9_-]/i.test(trimmed)) {
        currentLine += 1;
        continue;
      }

      // Output the line if echo is on
      if (echoOn && !trimmed.startsWith('@')) {
        outputs.push(`> ${trimmed}`);
      }

      // Execute command
      const cmdOutputs = executeCommand(trimmed, depth + 1);
      outputs.push(...cmdOutputs);

      currentLine += 1;
    }

    return outputs;
  };

  const handleIf = (command, depth) => {
    const existMatch = command.match(/^if\s+(not\s+)?exist\s+(.+?)\s+(.+)$/i);
    if (existMatch) {
      const negate = Boolean(existMatch[1]);
      const targetPath = resolvePath(existMatch[2].replace(/^["']|["']$/g, ''), currentPath);
      const shouldRun = itemExists(targetPath) !== negate;
      return shouldRun ? executeCommand(existMatch[3], depth + 1) : [];
    }

    const compareMatch = command.match(/^if\s+("?[^=]+?"?)==("?[^=]+?"?)\s+(.+)$/i);
    if (compareMatch) {
      const left = compareMatch[1].replace(/^"|"$/g, '');
      const right = compareMatch[2].replace(/^"|"$/g, '');
      return left === right ? executeCommand(compareMatch[3], depth + 1) : [];
    }

    return ['Invalid IF syntax. Try: if exist file.txt echo Found'];
  };

  const executeCommand = (rawCommand, depth = 0) => {
    if (depth > 8) return ['Command nesting limit exceeded.'];

    const command = expandVariables(rawCommand).trim();
    if (!command) return [];
    if (/^(rem\b|::|#)/i.test(command)) return [];
    if (/^if\s+/i.test(command)) return handleIf(command, depth);

    const args = splitArgs(command);
    const cmd = args[0]?.toLowerCase();
    const rest = command.slice(args[0]?.length || 0).trim();

    switch (cmd) {
      case 'help':
        return [
          'File Operations:',
          '  dir [/s] [path]       - List directory (recursive with /s)',
          '  cd [path]             - Change directory',
          '  mkdir <path>          - Create folder (supports nested: mkdir a\\b\\c)',
          '  rmdir <path>          - Remove folder',
          '  copy [/y] [/s] <src> <tgt> - Copy file/folder (/y=overwrite, /s=recursive)',
          '  move [/y] <src> <tgt> - Move file/folder (/y=overwrite)',
          '  del [/s] [/q] <path>  - Delete file/folder (/s=recursive, /q=quiet)',
          '  type <file>           - Display file contents',
          '  write <file> <text>   - Write to file',
          '  append <file> <text>  - Append to file',
          '  ren <old> <new>       - Rename file/folder',
          '  tree [path]           - Show directory tree',
          '  attrib [path]         - Show/set file attributes',
          '  vol [drive]           - Show volume information',
          '  drives                - List available drives',
          '',
          'Process Management:',
          '  tasklist [/v] [/m]    - List processes (/v=verbose, /m=modules)',
          '  taskkill [/f] <pid>   - Terminate process (/f=force)',
          '  wmic process [list]   - WMI Command for process info',
          '  start [/wait] <app>   - Start application (/wait=wait for completion)',
          '',
          'Batch Script Commands:',
          '  run <script.bat>      - Execute script',
          '  call <script.bat>     - Call script (with return)',
          '  set NAME=value        - Set variable',
          '  pause                 - Pause execution',
          '  @echo off             - Suppress output',
          '  @echo on              - Show commands',
          '  goto :label           - Jump to label',
          '  :label                - Define label',
          '  setlocal/endlocal     - Local variable scope',
          '  if exist <path> <cmd> - Conditional execution',
          '',
          'System Commands:',
          '  systeminfo            - Show system information',
          '  ver                   - Show OS version',
          '  whoami                - Show current user',
          '  date [/t]             - Show current date',
          '  time [/t]             - Show current time',
          '',
          'Network Commands:',
          '  ping [-n <count>] [-w <timeout>] <host> - Test connection',
          '  ipconfig [/all] [/release] [/renew]    - Show network config',
          '  netstat [-an] [-p <proto>]              - Show network statistics',
          '  nslookup <hostname> [server]            - DNS lookup',
          '  tracert <host>                          - Trace route to host',
          '  connect <host> [port]                   - Test connection',
          '',
          'Other: cls, echo, help',
        ];
      case 'cls':
        setHistory([]);
        return [];
      case 'echo': {
        if (/^echo\s+(on|off)$/i.test(command)) {
          return [`Echo is ${args[1].toLowerCase()}`];
        }
        return [rest || ''];
      }
      case 'pause':
        return ['Press any key to continue...'];
      case 'pwd':
      case 'cd':
      case 'chdir': {
        if (!args[1]) return [currentPath];
        const nextPath = resolvePath(args.slice(1).join(' '), currentPath);
        if (!folderExists(nextPath)) {
          return [`The system cannot find the path specified: ${nextPath}`];
        }
        setCurrentPath(nextPath);
        return [];
      }
      case 'dir':
      case 'ls': {
        const { flags, remaining } = parseFlags(args.slice(1));
        const targetPath = remaining.length > 0 ? remaining.join(' ') : '';
        const dirPath = resolvePath(targetPath || currentPath, currentPath);
        const folder = shadowFsRef.current.folders[dirPath];
        if (!folder) return [`The system cannot find the path specified: ${dirPath}`];
        
        const rows = [` Directory of ${dirPath}`, '', ' Volume in drive C: is OS-SIM'];
        const allItems = [];
        let fileCount = 0;
        let folderCount = 0;
        let totalSize = 0;

        const collectItems = (path) => {
          const f = shadowFsRef.current.folders[path];
          (f.children || []).forEach((name) => {
            const childPath = joinPath(path, name);
            const isFolder = !!shadowFsRef.current.folders[childPath];
            const isFile = !!shadowFsRef.current.files[childPath];
            
            if (isFolder) {
              allItems.push({ name, path: childPath, isFolder: true, updatedAt: shadowFsRef.current.folders[childPath].updatedAt });
              folderCount += 1;
            } else if (isFile) {
              const file = shadowFsRef.current.files[childPath];
              const size = file.size || 0;
              allItems.push({ name, path: childPath, isFolder: false, size, updatedAt: file.updatedAt });
              totalSize += size;
              fileCount += 1;
            }
            
            // Recursively collect if /s flag set
            if (flags['/s'] && isFolder) {
              collectItems(childPath);
            }
          });
        };

        collectItems(dirPath);
        
        // Sort and display
        allItems.sort((a, b) => {
          if (a.isFolder !== b.isFolder) return b.isFolder - a.isFolder;
          return a.name.localeCompare(b.name);
        });

        allItems.forEach((item) => {
          if (item.isFolder) {
            rows.push(`${item.updatedAt || ''}    <DIR>          ${item.name}`);
          } else {
            rows.push(`${item.updatedAt || ''} ${formatSize(item.size)} ${item.name}`);
          }
        });

        rows.push('', `             ${fileCount} File(s) ${totalSize} bytes`, `             ${folderCount} Dir(s)`);
        return rows;
      }
      case 'tree': {
        const dirPath = resolvePath(args.slice(1).join(' ') || currentPath, currentPath);
        if (!folderExists(dirPath)) return [`Directory not found: ${dirPath}`];
        const lines = [dirPath];
        const walk = (path, depthLevel) => {
          const folder = shadowFsRef.current.folders[path];
          (folder.children || []).forEach((name) => {
            const childPath = joinPath(path, name);
            lines.push(`${'  '.repeat(depthLevel)}|-- ${name}`);
            if (shadowFsRef.current.folders[childPath]) walk(childPath, depthLevel + 1);
          });
        };
        walk(dirPath, 1);
        return lines;
      }
      case 'mkdir':
      case 'md': {
        if (!args[1]) return ['Syntax: mkdir <folder>'];
        const folderPath = resolvePath(args.slice(1).join(' '), currentPath);
        
        // Support nested directory creation: mkdir a\b\c
        const parts = normalizePath(folderPath).split('\\').filter(Boolean);
        let current = parts[0].endsWith(':') ? parts[0] + '\\' : ROOT_PATH;
        const results = [];
        
        for (let i = (current === ROOT_PATH ? 0 : 1); i < parts.length; i += 1) {
          const part = parts[i];
          if (!part || part.endsWith(':')) continue;
          const nextPath = current === ROOT_PATH ? `${ROOT_PATH}${part}` : joinPath(current, part);
          
          if (!folderExists(nextPath)) {
            mutateShadow((state) => fileSystemActions.createFolder(state, current, part));
            createFolder(current, part);
            results.push(`Created directory ${nextPath}`);
          }
          current = nextPath;
        }
        
        return results.length > 0 ? results : [`Item already exists: ${folderPath}`];
      }
      case 'rmdir':
      case 'rd': {
        if (!args[1]) return ['Syntax: rmdir <folder>'];
        const folderPath = resolvePath(args.slice(1).join(' '), currentPath);
        if (!folderExists(folderPath)) return [`Directory not found: ${folderPath}`];
        mutateShadow((state) => fileSystemActions.deleteItem(state, folderPath));
        deleteItem(folderPath);
        return [`Removed directory ${folderPath}`];
      }
      case 'type':
      case 'cat': {
        if (!args[1]) return ['Syntax: type <file>'];
        const filePath = resolvePath(args.slice(1).join(' '), currentPath);
        const file = readFile(filePath);
        if (!file) return [`The system cannot find the file specified: ${filePath}`];
        const lines = (file.content || '').split('\n');
        return lines;
      }
      case 'attrib': {
        if (!args[1]) {
          // Show all files in current directory with attributes
          const folder = shadowFsRef.current.folders[currentPath];
          if (!folder || !folder.children) return [];
          const results = [];
          folder.children.forEach((name) => {
            const childPath = joinPath(currentPath, name);
            const isFolder = !!shadowFsRef.current.folders[childPath];
            const attrs = isFolder ? 'D' : 'A';
            results.push(`${attrs} ${childPath}`);
          });
          return results;
        }
        
        const remaining = args.slice(1).filter((arg) => !/^\//.test(arg));
        if (remaining.length === 0) return ['Syntax: attrib <file or folder>'];
        
        const targetPath = resolvePath(remaining.join(' '), currentPath);
        if (!itemExists(targetPath)) return [`The system cannot find the file specified: ${targetPath}`];
        
        const isFolder = folderExists(targetPath);
        const attrs = isFolder ? 'D' : 'A';
        return [`${attrs} ${targetPath}`];
      }
      case 'vol': {
        const { remaining } = parseFlags(args.slice(1));
        const drive = remaining.length > 0 ? remaining[0].toUpperCase() : 'C:';
        return [
          ` Volume in drive ${drive} is OS-SIM`,
          ` Volume Serial Number is 1234-5678`,
          '',
          ` Directory of ${drive}\\`,
          '',
          ' Disk space: 1000 MB total, 750 MB available',
        ];
      }
      case 'drives':
      case 'drivelist': {
        return [
          'Logical Drives:',
          ' C: (1000 MB) - Local Disk',
          ' D: (500 MB) - Optical Drive',
          ' E: (2000 MB) - USB Flash Drive',
        ];
      }
      case 'write':
      case 'edit': {
        if (!args[1]) return ['Syntax: write <file> <text>'];
        const filePath = resolvePath(args[1], currentPath);
        const content = args.slice(2).join(' ');
        return writeFile(filePath, content);
      }
      case 'append': {
        if (!args[1]) return ['Syntax: append <file> <text>'];
        const filePath = resolvePath(args[1], currentPath);
        const existing = readFile(filePath)?.content || '';
        return writeFile(filePath, `${existing}${existing ? '\n' : ''}${args.slice(2).join(' ')}`);
      }
      case 'del':
      case 'erase': {
        const { flags, remaining } = parseFlags(args.slice(1));
        if (remaining.length === 0) return ['Syntax: del [/s] [/q] <file or folder>'];
        
        const targetPath = resolvePath(remaining.join(' '), currentPath);
        
        if (!itemExists(targetPath)) return [`The system cannot find the file specified: ${targetPath}`];
        
        const results = [];
        const isFolder = folderExists(targetPath);
        
        if (isFolder) {
          if (!flags['/s']) {
            return [`Access is denied. To delete a folder, use: del /s <folder>`];
          }
          
          // Recursive delete
          const deleteRecursive = (path) => {
            const folder = shadowFsRef.current.folders[path];
            if (!folder || !folder.children) return;
            
            const childrenCopy = [...folder.children];
            childrenCopy.forEach((name) => {
              const childPath = joinPath(path, name);
              const isChildFolder = !!shadowFsRef.current.folders[childPath];
              
              if (isChildFolder) {
                deleteRecursive(childPath);
              } else {
                mutateShadow((state) => fileSystemActions.deleteItem(state, childPath));
                deleteItem(childPath);
                if (!flags['/q']) results.push(`Deleted ${childPath}`);
              }
            });
            
            mutateShadow((state) => fileSystemActions.deleteItem(state, path));
            deleteItem(path);
            if (!flags['/q']) results.push(`Deleted folder ${path}`);
          };
          
          deleteRecursive(targetPath);
        } else {
          // Single file delete
          mutateShadow((state) => fileSystemActions.deleteItem(state, targetPath));
          deleteItem(targetPath);
          if (!flags['/q']) results.push(`Deleted ${targetPath}`);
        }
        
        return results.length > 0 ? results : [`File(s) deleted.`];
      }
      case 'copy': {
        const { flags, remaining } = parseFlags(args.slice(1));
        if (remaining.length < 2) return ['Syntax: copy [/y] [/s] <source> <target>'];
        
        const sourcePath = resolvePath(remaining[0], currentPath);
        const targetPath = resolvePath(remaining[1], currentPath);
        
        if (!itemExists(sourcePath)) return [`The system cannot find the file specified: ${sourcePath}`];
        
        const results = [];
        const sourceIsFolder = folderExists(sourcePath);
        const targetIsFolder = folderExists(targetPath);
        
        if (sourceIsFolder && !flags['/s']) {
          return [`Cannot copy folder without /s flag. Use: copy /s <source-folder> <target-folder>`];
        }
        
        if (sourceIsFolder && targetIsFolder) {
          // Recursive copy
          const copyRecursive = (src, tgt) => {
            const srcFolder = shadowFsRef.current.folders[src];
            if (!srcFolder || !srcFolder.children) return;
            
            srcFolder.children.forEach((name) => {
              const srcChild = joinPath(src, name);
              const srcChildIsFolder = !!shadowFsRef.current.folders[srcChild];
              
              if (srcChildIsFolder) {
                const tgtChild = joinPath(tgt, name);
                if (!folderExists(tgtChild)) {
                  mutateShadow((state) => fileSystemActions.createFolder(state, tgt, name));
                  createFolder(tgt, name);
                }
                copyRecursive(srcChild, tgtChild);
              } else {
                const file = readFile(srcChild);
                if (file) {
                  const tgtFilePath = joinPath(tgt, name);
                  mutateShadow((state) => fileSystemActions.createFile(state, tgt, name, file.content));
                  createFile(tgt, name, file.content);
                  results.push(`Copied ${srcChild} to ${tgtFilePath}`);
                }
              }
            });
          };
          copyRecursive(sourcePath, targetPath);
        } else if (!sourceIsFolder && targetIsFolder) {
          // Single file copy
          const file = readFile(sourcePath);
          if (!file) return [`Cannot read file: ${sourcePath}`];
          
          const targetFile = joinPath(targetPath, getBaseName(sourcePath));
          if (fileExists(targetFile) && !flags['/y']) {
            return [`Overwrite ${targetFile}? (y/n) [Use /y to skip prompt]`];
          }
          
          mutateShadow((state) => fileSystemActions.createFile(state, targetPath, getBaseName(sourcePath), file.content));
          createFile(targetPath, getBaseName(sourcePath), file.content);
          results.push(`Copied ${sourcePath} to ${targetFile}`);
        } else {
          return [`Invalid target: ${targetPath}`];
        }
        
        return results.length > 0 ? results : [`1 file(s) copied.`];
      }
      case 'move': {
        const { flags, remaining } = parseFlags(args.slice(1));
        if (remaining.length < 2) return ['Syntax: move [/y] <source> <target-folder>'];
        
        const sourcePath = resolvePath(remaining[0], currentPath);
        const targetPath = resolvePath(remaining[1], currentPath);
        
        if (!itemExists(sourcePath)) return [`The system cannot find the file specified: ${sourcePath}`];
        if (!folderExists(targetPath)) return [`The system cannot find the path specified: ${targetPath}`];
        
        const sourceName = getBaseName(sourcePath);
        const targetItem = joinPath(targetPath, sourceName);
        
        if (itemExists(targetItem) && !flags['/y']) {
          return [`Overwrite ${targetItem}? (y/n) [Use /y to skip prompt]`];
        }
        
        mutateShadow((state) => fileSystemActions.moveItem(state, sourcePath, targetPath));
        moveItem(sourcePath, targetPath);
        return [`Moved ${sourcePath} to ${joinPath(targetPath, sourceName)}`];
      }
      case 'ren':
      case 'rename': {
        if (!args[1] || !args[2]) return ['Syntax: ren <path> <new-name>'];
        const sourcePath = resolvePath(args[1], currentPath);
        const targetParent = getParentPath(sourcePath);
        const nextPath = joinPath(targetParent, args[2]);
        if (!itemExists(sourcePath)) return [`Item not found: ${sourcePath}`];
        mutateShadow((state) => fileSystemActions.renameItem(state, sourcePath, args[2]));
        fs.renameItem(sourcePath, args[2]);
        return [`Renamed ${sourcePath} to ${nextPath}`];
      }
      case 'run':
      case 'call': {
        if (!args[1]) return ['Syntax: run <script.bat>'];
        const scriptPath = resolvePath(args.slice(1).join(' '), currentPath);
        return executeScript(scriptPath, depth + 1);
      }
      case 'set': {
        if (!rest) {
          return Object.entries(variables).map(([key, value]) => `${key}=${value}`);
        }
        const [name, ...valueParts] = rest.split('=');
        if (!name || valueParts.length === 0) return ['Syntax: set NAME=value'];
        const key = name.trim().toUpperCase();
        const value = valueParts.join('=').trim();
        setVariables((current) => ({ ...current, [key]: value }));
        return [`${key}=${value}`];
      }
      case 'tasklist': {
        const { flags } = parseFlags(args.slice(1));
        const simulatedWindows = windows.map((windowItem, index) => ({
          id: 900 + index,
          name: windowItem.title,
          state: windowItem.isMinimized ? 'Minimized' : 'Running',
          memory: stableNumber(windowItem.title, 50, 10) * 1024,
          cpu: stableNumber(windowItem.title, 100, 1),
        }));
        const processes = [
          ...processState.processes.map((process) => ({
            id: process.id,
            name: process.name,
            state: process.state,
            memory: stableNumber(process.name, 50, 5) * 1024,
            cpu: stableNumber(process.name, 100, 2),
          })),
          ...simulatedWindows,
        ];

        if (flags['/v']) {
          // Verbose output
          const header = 'Image Name                 PID        Session  CPU Time    Memory (MB)  State';
          const rows = processes.map((process) => 
            `${process.name.padEnd(26)} ${String(process.id).padEnd(10)} Console    ${String(Math.floor(process.memory / 1024)).padStart(6)} MB     ${process.state}`
          );
          return [header, ...rows];
        }

        if (flags['/m']) {
          // Show modules (simulated)
          const header = 'Image Name                 Module Name              Memory (MB)';
          const rows = processes.map((process) => 
            `${process.name.padEnd(26)} ${process.name.padEnd(24)} ${String(Math.floor(process.memory / 1024)).padStart(6)}`
          );
          return [header, ...rows];
        }

        // Default output
        return ['Image Name                 PID        State', ...processes.map((process) => `${process.name.padEnd(26)} ${String(process.id).padEnd(10)} ${process.state}`)];
      }
      case 'taskkill': {
        const { flags, remaining } = parseFlags(args.slice(1));
        const processId = remaining[0] || args.find((arg) => /^p/i.test(arg));
        
        if (!processId) return ['Syntax: taskkill [/f] <pid>'];
        
        const process = processState.processes.find((item) => item.id.toLowerCase() === processId.toLowerCase());
        if (!process) return [`Process not found: ${processId}`];
        
        const signal = flags['/f'] ? 'SIGKILL' : 'SIGTERM';
        updateProcessState(process.id, 'Terminated');
        deleteProcess(process.id);
        return [`SUCCESS: Sent ${signal} signal to process ${process.id} (${process.name}).`];
      }
      case 'start': {
        const { flags, remaining } = parseFlags(args.slice(1));
        if (remaining.length === 0) return ['Syntax: start [/wait] <app-name>'];
        
        const appName = remaining.join(' ').toLowerCase();
        const app = ALL_APPS.find((item) => item.id === appName || item.type === appName || item.label.toLowerCase() === appName);
        if (!app) return [`Application not found: ${appName}`];
        
        openWindow(app.type, app.id);
        createProcess(app.label, stableNumber(app.label, 5, 1), 2);
        
        if (flags['/wait']) {
          return [`Starting ${app.label}...`, 'Waiting for process to complete...'];
        }
        return [`Started ${app.label}`];
      }
      case 'wmic': {
        const { remaining } = parseFlags(args.slice(1));
        if (remaining.length === 0 || remaining[0].toLowerCase() !== 'process') {
          return ['Usage: wmic process list [brief|full]'];
        }
        
        const format = remaining[1] || 'brief';
        const processes = processState.processes.map((p) => ({
          name: p.name,
          id: p.id,
          state: p.state,
          memory: stableNumber(p.name, 50, 5) * 1024,
        }));

        if (format === 'full') {
          const header = 'Caption                    Name                       Priority  ProcessId  State                    WorkingSetSize';
          const rows = processes.map((p) => 
            `${p.name.padEnd(26)} ${p.name.padEnd(26)} 8         ${String(p.id).padEnd(9)} ${p.state.padEnd(24)} ${String(p.memory).padStart(6)}`
          );
          return [header, ...rows];
        }

        // Brief output
        const header = 'Name                       ProcessId  State';
        const rows = processes.map((p) => `${p.name.padEnd(26)} ${String(p.id).padEnd(10)} ${p.state}`);
        return [header, ...rows];
      }
      case 'systeminfo':
      case 'sysinfo': {
        const now = new Date();
        const bootTime = new Date(performance.timeOrigin);
        const uptime = Math.floor((now - bootTime) / 1000);
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMins = Math.floor((uptime % 3600) / 60);
        const memoryUtilization = systemStats.totalMemory > 0 
          ? Math.round((systemStats.usedMemory / systemStats.totalMemory) * 100) 
          : 0;
        
        return [
          'Host Name:                 OS-SIM',
          'OS Name:                   React Operating System Simulator',
          'OS Version:                1.0.2605 Build 19041',
          'OS Manufacturer:           React Foundation',
          'System Type:               Virtual Machine x64',
          'Registered Owner:          Student Workspace',
          '',
          `System Boot Time:          ${bootTime.toLocaleString()}`,
          `Uptime:                    ${uptimeHours} hours ${uptimeMins} minutes`,
          '',
          'Processor:                 Intel Core i7 (Simulated)',
          'Processor Count:           4',
          'Processor Speed:           2.8 GHz',
          `Total Physical Memory:     ${systemStats.totalMemory} MB`,
          `Available Memory:          ${Math.max(0, systemStats.totalMemory - systemStats.usedMemory)} MB`,
          `Memory Utilization:        ${memoryUtilization}%`,
          '',
          `Filesystem Objects:        ${systemStats.files} files, ${systemStats.folders} folders`,
          `Theme:                     ${isDarkMode ? 'Dark' : 'Light'}`,
          `Accent Color:              ${accentColor}`,
          '',
          'Network Adapter:           Simulated Wi-Fi Adapter',
          'IP Address:                192.168.56.21',
          'Subnet Mask:               255.255.255.0',
          'Default Gateway:           192.168.56.1',
        ];
      }
      case 'ver': {
        return [
          'OS Simulator Command Processor Version 1.0.2605',
          '',
          'React Operating System Simulator v1.0',
          'Build: 19041 Release',
        ];
      }
      case 'whoami':
        return ['os-sim\\student'];
      case 'date': {
        const { remaining } = parseFlags(args.slice(1));
        if (remaining.length > 0 && remaining[0].toUpperCase() === '/T') {
          return [new Date().toLocaleDateString()];
        }
        return [
          'Current Date: ' + new Date().toLocaleDateString(),
          'Enter new date (MM-DD-YYYY) [' + new Date().toLocaleDateString() + ']: ',
        ];
      }
      case 'time': {
        const { remaining } = parseFlags(args.slice(1));
        if (remaining.length > 0 && remaining[0].toUpperCase() === '/T') {
          return [new Date().toLocaleTimeString()];
        }
        return [
          'Current Time: ' + new Date().toLocaleTimeString(),
          'Enter new time (HH:MM:SS) [' + new Date().toLocaleTimeString() + ']: ',
        ];
      }
      case 'ipconfig': {
        const { flags } = parseFlags(args.slice(1));
        
        if (flags['/all']) {
          return [
            'Windows IP Configuration',
            '',
            'Host Name . . . . . . . . . . . . : OS-SIM',
            'Primary Dns Suffix  . . . . . . . : local',
            'Node Type . . . . . . . . . . . . : Hybrid',
            'IP Routing Enabled. . . . . . . . : No',
            'WINS Proxy Enabled. . . . . . . . : No',
            '',
            'Wireless LAN adapter Wi-Fi:',
            '   Connection-specific DNS Suffix  : local',
            '   Description . . . . . . . . . . : Intel(R) Wireless-AC 9560',
            '   Physical Address. . . . . . . . : 00-1A-2B-3C-4D-5E',
            '   DHCP Enabled. . . . . . . . . . : Yes',
            '   Autoconfiguration Enabled . . . : Yes',
            '   IPv4 Address. . . . . . . . . . : 192.168.56.21',
            '   Subnet Mask . . . . . . . . . . : 255.255.255.0',
            '   Default Gateway . . . . . . . . : 192.168.56.1',
            '   DNS Servers . . . . . . . . . . : 8.8.8.8 8.8.4.4',
            '   Lease Obtained. . . . . . . . . : Monday, May 06, 2024 10:00:00 AM',
            '   Lease Expires . . . . . . . . . : Wednesday, May 08, 2024 10:00:00 AM',
            '',
            'Ethernet adapter Ethernet:',
            '   Media State . . . . . . . . . . : Media disconnected',
            '   Connection-specific DNS Suffix  : ',
          ];
        }
        
        if (flags['/release']) {
          return ['The operation completed successfully.', 'IPv4 address released for adapter "Wi-Fi"'];
        }
        
        if (flags['/renew']) {
          return ['The operation completed successfully.', 'IPv4 address renewed for adapter "Wi-Fi": 192.168.56.21'];
        }
        
        return [
          'Windows IP Configuration',
          '',
          'Wireless LAN adapter Wi-Fi:',
          '   IPv4 Address. . . . . . . . . . . : 192.168.56.21',
          '   Subnet Mask . . . . . . . . . . . : 255.255.255.0',
          '   Default Gateway . . . . . . . . . : 192.168.56.1',
          '   DNS Servers . . . . . . . . . . . : 8.8.8.8',
        ];
      }
      case 'ping': {
        if (!args[1]) return ['Syntax: ping [-n count] [-w timeout] <host>'];
        
        let count = 4;
        let host = 'localhost';
        
        // Parse ping options
        for (let i = 1; i < args.length; i += 1) {
          if (args[i].toLowerCase() === '-n' && args[i + 1]) {
            count = Math.max(1, Math.min(100, parseInt(args[i + 1], 10)));
          }
          if (args[i].toLowerCase() === '-w' && args[i + 1]) {
            // timeout parameter parsed but not currently used in simulation
            Math.max(100, Math.min(60000, parseInt(args[i + 1], 10)));
          }
          if (!/^-/.test(args[i])) {
            host = args[i];
          }
        }
        
        const results = [
          `Pinging ${host} [192.168.56.${stableNumber(host, 80, 10)}] with 32 bytes of data:`,
        ];
        
        let lostPackets = 0;
        for (let i = 0; i < count; i += 1) {
          const rnd = stableNumber(`${host}${i}`, 100);
          if (rnd < 5) {
            results.push(`Request timed out.`);
            lostPackets += 1;
          } else {
            const rtt = stableNumber(`${host}${i}`, 40, 10);
            results.push(`Reply from 192.168.56.${stableNumber(host, 80, 10)}: bytes=32 time=${rtt}ms TTL=64`);
          }
        }
        
        results.push('');
        const lossPercent = Math.round((lostPackets / count) * 100);
        results.push(`Packets: Sent = ${count}, Received = ${count - lostPackets}, Lost = ${lostPackets} (${lossPercent}% loss)`);
        
        if (count - lostPackets > 0) {
          const minTime = 10;
          const maxTime = stableNumber(host, 40, 10);
          const avgTime = Math.round((minTime + maxTime) / 2);
          results.push(`Approximate round trip times in milli-seconds:`);
          results.push(`    Minimum = ${minTime}ms, Maximum = ${maxTime}ms, Average = ${avgTime}ms`);
        }
        
        return results;
      }
      case 'netstat': {
        let format = 'default';
        let proto = 'all';
        
        for (let i = 1; i < args.length; i += 1) {
          if (args[i] === '-an') format = 'numeric';
          if (args[i] === '-p' && args[i + 1]) proto = args[i + 1].toUpperCase();
        }
        
        let connections = [
          { proto: 'TCP', local: '192.168.56.21:5173', remote: '127.0.0.1:52384', state: 'ESTABLISHED' },
          { proto: 'TCP', local: '192.168.56.21:3001', remote: '*:*', state: 'LISTENING' },
          { proto: 'TCP', local: '127.0.0.1:27017', remote: '*:*', state: 'LISTENING' },
          { proto: 'UDP', local: '0.0.0.0:5353', remote: '*:*', state: '' },
          { proto: 'TCP', local: '192.168.56.21:443', remote: '10.0.0.5:58923', state: 'ESTABLISHED' },
        ];
        
        if (proto !== 'all') {
          connections = connections.filter((c) => c.proto === proto);
        }
        
        const header = format === 'numeric' 
          ? 'Proto  Local Address          Foreign Address        State'
          : 'Proto  Local Address          Foreign Address        State';
        
        const rows = connections.map((c) => 
          `${c.proto.padEnd(6)} ${c.local.padEnd(22)} ${c.remote.padEnd(23)} ${c.state}`
        );
        
        return [header, ...rows];
      }
      case 'nslookup': {
        if (!args[1]) return ['Syntax: nslookup <hostname> [server]'];
        
        const hostname = args[1];
        const servers = ['8.8.8.8', '8.8.4.4'];
        const server = args[2] || servers[0];
        
        return [
          `Server:  ${server}`,
          `Address: ${server}#53`,
          '',
          `Non-authoritative answer:`,
          `Name:    ${hostname}`,
          `Address: 203.0.113.${stableNumber(hostname, 254, 1)}`,
          `Aliases: ${hostname}`,
        ];
      }
      case 'tracert': {
        if (!args[1]) return ['Syntax: tracert <host>'];
        
        const host = args[1];
        const results = [
          `Tracing route to ${host} [192.168.56.${stableNumber(host, 80, 10)}] over a maximum of 30 hops:`,
          '',
        ];
        
        const hopCount = stableNumber(host, 6, 3);
        for (let i = 1; i <= hopCount; i += 1) {
          const rtt1 = stableNumber(`${host}${i}1`, 100, 5);
          const rtt2 = stableNumber(`${host}${i}2`, 100, 5);
          const rtt3 = stableNumber(`${host}${i}3`, 100, 5);
          const hopIp = `192.168.${stableNumber(`${host}${i}`, 254, 1)}.${stableNumber(`${host}${i}hop`, 254, 1)}`;
          results.push(`  ${i}    ${rtt1}ms  ${rtt2}ms  ${rtt3}ms    ${hopIp}`);
        }
        
        results.push('', `Trace complete.`);
        return results;
      }
      case 'connect': {
        const host = args[1];
        const port = args[2] || '80';
        if (!host) return ['Syntax: connect <host> [port]'];
        return [
          `Testing ${host}:${port} ...`,
          `Connection to ${host}:${port} succeeded in ${stableNumber(`${host}:${port}`, 40, 8)}ms.`,
        ];
      }
      default:
        if (cmd?.endsWith('.bat') || cmd?.endsWith('.cmd')) {
          return executeScript(resolvePath(args[0], currentPath), depth + 1);
        }
        return [`'${args[0]}' is not recognized as an internal or external command.`];
    }
  };

  const runInput = (commandText) => {
    const trimmed = commandText.trim();
    if (!trimmed) return;

    setHistory((current) => [...current, makeLine(`${currentPath}> ${trimmed}`, 'command')]);
    setCommandHistory((current) => [...current, trimmed].slice(-50));
    historyIndexRef.current = null;

    const outputs = splitCommands(trimmed).flatMap((command) => executeCommand(command));
    if (outputs.length > 0) emit(outputs);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    runInput(input);
    setInput('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'ArrowUp') {
      event.preventDefault();
      const current = historyIndexRef.current;
      const next = current === null ? commandHistory.length - 1 : Math.max(0, current - 1);
      historyIndexRef.current = next;
      setInput(commandHistory[next] || '');
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      const current = historyIndexRef.current;
      if (current === null) return;
      const next = current + 1;
      if (next >= commandHistory.length) {
        setInput('');
        historyIndexRef.current = null;
        return;
      }
      historyIndexRef.current = next;
      setInput(commandHistory[next] || '');
    }
  };

  return (
    <div
      className="flex h-full min-h-0 flex-col bg-[#0c1117] text-[#d8f3dc]"
      onClick={() => inputRef.current?.focus()}
    >
      <div className="flex items-center justify-between border-b border-white/10 bg-[#111827] px-4 py-2 text-xs">
        <span className="font-semibold text-cyan-200">Command Prompt</span>
        <span className="text-white/50">cwd: {currentPath}</span>
      </div>

      <div ref={outputRef} className="min-h-0 flex-1 overflow-auto px-4 py-3 font-mono text-[13px] leading-6">
        {history.map((line) => (
          <div
            key={line.id}
            className={
              line.type === 'command'
                ? 'whitespace-pre-wrap text-cyan-200'
                : line.type === 'system'
                  ? 'whitespace-pre-wrap text-emerald-200'
                  : 'whitespace-pre-wrap text-[#d8f3dc]'
            }
          >
            {line.text || ' '}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-white/10 px-4 py-3 font-mono text-[13px]">
        <span className="shrink-0 text-cyan-200">{currentPath}&gt;</span>
        <input
          ref={inputRef}
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
          spellCheck={false}
          className="min-w-0 flex-1 border-none bg-transparent text-[#f8fafc] outline-none"
          aria-label="Command input"
        />
      </form>
    </div>
  );
};

export default CommandPrompt;
