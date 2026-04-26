# OS Final Project - Windows Simulation

A comprehensive Windows-like operating system simulation built with React and Vite. Features multiple applications including a full-featured MS Word simulation.

## Applications

### Word Processor 📄
A professional document editor with word processing capabilities:

#### Features:
- **Document Management**: Create, open, save, and save-as functionality
- **Text Formatting**: 
  - Multiple font families (Arial, Times New Roman, Courier New, Georgia, Verdana)
  - Font size adjustment (8px to 72px)
  - Bold, Italic, and Underline text styling
  - Text alignment (Left, Center, Right)
  
- **Printing System**: 
  - Print dialog with comprehensive options:
    - Printer selection (Default, HP LaserJet Pro, Canon ImageRunner, Xerox WorkCentre)
    - Number of copies (1-999)
    - Paper size selection (A4, Letter, A3, Legal)
    - Orientation (Portrait/Landscape)
    - Color mode (Color, Grayscale, Black & White)
  - Print preview showing document details
  
- **Print Queue Management**:
  - Real-time print job tracking with progress indicators
  - Job status display (printing/completed)
  - Cancel individual print jobs
  - Clear completed jobs
  - Queue badge showing number of pending jobs
  
- **File System Integration**:
  - Save documents to file manager (supports .docx files)
  - Auto-save functionality every 30 seconds
  - Load files from File Manager
  - File path and status tracking
  
- **Statistics**:
  - Word count
  - Character count
  - Save status indicator
  - File path display

#### Keyboard Shortcuts:
- **Ctrl+N**: New document
- **Ctrl+O**: Open document
- **Ctrl+S**: Save document
- **Ctrl+P**: Print document

### Other Applications:
- File Explorer - Browse and manage files
- Notepad - Simple text editor
- Calculator - Basic calculator
- Settings - System settings
- Process Manager - Monitor processes
- CPU Scheduler - Scheduling simulator
- Memory Manager - Memory management simulator
- Task Manager - Task monitoring

## Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

## Architecture

- **Frontend**: React with Tailwind CSS
- **State Management**: Context API
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom styles

## Project Structure

```
src/
├── apps/                    # Application components
│   ├── WordProcessor.jsx    # MS Word simulation
│   ├── Calculator.jsx
│   ├── Notepad.jsx
│   └── ...
├── components/              # UI components
├── context/                 # React Context
├── hooks/                   # Custom hooks
├── store/                   # State management
├── styles/                  # Global styles
└── utils/                   # Utilities and constants
```
