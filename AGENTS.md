# AGENTS.md

## Project Goal
Build a simple command-line operating system simulator for learning core OS concepts, not a real OS.

## Required Features
### 1. Process Management
- Simulate at least 3 processes.
- Show process states: `Ready`, `Running`, `Waiting`, `Terminated`.
- Display current process state in a table or similar console view.

### 2. CPU Scheduling
- Implement one scheduling algorithm only.
- Use either `FCFS` or `Round Robin`.
- Show execution order and waiting time.
- Include a simple text-based Gantt chart if possible.

### 3. Memory Management
- Simulate fixed memory partitions.
- Allocate and deallocate memory for processes.
- Show memory usage in the console.

### 4. File System
- Simulate a simple in-memory file list.
- Support `create`, `delete`, and `display contents`.
- Do not use real disk access unless explicitly needed.

### 5. I/O Simulation
- Simulate one I/O device such as a printer.
- Queue I/O requests with basic spooling behavior.

## Suggested Implementation Rules
- Keep the simulator small and easy to explain.
- Prefer clear console output over complex UI.
- Use comments to explain OS concepts where they are simulated.
- Keep state transitions and resource updates explicit and easy to trace.

## Deliverables To Support
- Source code with comments.
- Short report explaining the program and OS concepts used.
- Sample console output suitable for screenshots.
- Live presentation readiness.

## Good Output Expectations
- Show process lifecycle clearly.
- Show scheduling order clearly.
- Show memory allocation changes clearly.
- Show file operations clearly.
- Show I/O queue activity clearly.

## Recommended Scope
- One language only: Python, C/C++, or Java.
- One scheduling algorithm.
- Simple fixed-partition memory model.
- In-memory files only.
- Single I/O device simulation.
