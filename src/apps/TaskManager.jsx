import React, { useState, useEffect } from 'react';
import ProcessManager from './ProcessManager';
import Scheduler from './Scheduler';
import MemoryManager from './MemoryManager';
import '../styles/task-manager.css';

/**
 * Task Manager App
 * Displays realistic system processes and performance metrics
 */

const TaskManager = () => {
  const [activeTab, setActiveTab] = useState('performance');
  const [processes, setProcesses] = useState([]);
  const [performance, setPerformance] = useState({
    cpu: { 
      usage: 6, 
      speed: 2.1, 
      baseSpeed: 2.8,
      cores: 4,
      logicalProcessors: 8,
      processes: 274,
      threads: 4093,
      handles: 147551,
      uptime: '1:14:18:25',
      l1: '256 KB',
      l2: '2.0 MB',
      l3: '4.0 MB',
      virtualization: 'Enabled',
      sockets: 1
    },
    memory: { usage: 63, total: 15.3, available: 5.7, used: 9.7 },
    disk: { usage: 2, speed: 2.8, name: 'SSD (NVMe)' },
    network: { down: '0 Kbps', up: '0 Kbps', ip: '192.168.1.1' },
    gpu: { name: 'AMD Radeon(TM) Graphics', usage: 1, temp: 49 },
  });
  const [cpuHistory, setCpuHistory] = useState(Array(60).fill(6));
  const [memoryHistory, setMemoryHistory] = useState(Array(60).fill(63));

  const systemProcesses = [
    { name: 'Code', pid: '10.1%', cpu: '10.1%', memory: '343.4 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Visual Studio Code', pid: '15.7%', cpu: '15.7%', memory: '109.7 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Code', pid: '8.2%', cpu: '8.2%', memory: '86.4 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'WebView2 GPU Process', pid: '0.4%', cpu: '0.4%', memory: '84.8 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Task Manager', pid: '4.4%', cpu: '4.4%', memory: '48.0 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Google Chrome', pid: '0%', cpu: '0%', memory: '32.5 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Search', pid: '0%', cpu: '0%', memory: '30.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'OneDrive', pid: '0%', cpu: '0%', memory: '29.4 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'powershell', pid: '0%', cpu: '0%', memory: '27.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'chrome', pid: '0%', cpu: '0%', memory: '20.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Service Host: State Repository ...', pid: '3.1%', cpu: '3.1%', memory: '19.3 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Google Chrome', pid: '0%', cpu: '0%', memory: '18.5 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'node', pid: '0%', cpu: '0%', memory: '13.6 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Service Host: Remote Procedu...', pid: '1.1%', cpu: '1.1%', memory: '10.3 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Utility: Network Service', pid: '0%', cpu: '0%', memory: '10.2 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Spare Renderer', pid: '0%', cpu: '0%', memory: '8.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'AsusSoftwareManagerAgent', pid: '0%', cpu: '0%', memory: '8.1 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Service Host: Network List Ser...', pid: '0.1%', cpu: '0.1%', memory: '6.0 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Service Host: Capability Acces...', pid: '0.1%', cpu: '0.1%', memory: '5.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'audiodg', pid: '0%', cpu: '0%', memory: '5.2 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Service Host: Task Scheduler', pid: '0%', cpu: '0%', memory: '4.5 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'Runtime Broker', pid: '0%', cpu: '0%', memory: '4.1 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'AsusAppService', pid: '0%', cpu: '0%', memory: '3.9 MB', disk: '0 MB/s', network: '0 Mbps' },
    { name: 'CTF Loader', pid: '0%', cpu: '0%', memory: '3.8 MB', disk: '0 MB/s', network: '0 Mbps' },
  ];

  useEffect(() => {
    setProcesses(systemProcesses);

    // Simulate performance metrics changes
    const interval = setInterval(() => {
      // Simulate random CPU/Memory variations
      const newCpuValue = Math.max(1, Math.min(80, 6 + (Math.random() - 0.5) * 15));
      const newMemoryValue = Math.max(50, Math.min(85, 63 + (Math.random() - 0.5) * 12));

      setCpuHistory((prev) => [...prev.slice(1), newCpuValue]);
      setMemoryHistory((prev) => [...prev.slice(1), newMemoryValue]);

      setPerformance((prev) => ({
        ...prev,
        cpu: { ...prev.cpu, usage: Math.round(newCpuValue) },
        memory: { ...prev.memory, usage: Math.round(newMemoryValue) },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const CPUGraph = ({ data, height = 150, width = 300, small = false }) => {
    const maxValue = 100;
    const actualWidth = small ? 80 : width;
    const actualHeight = small ? 40 : height;
    const points = data.map((value, i) => {
      const x = (i / (data.length - 1)) * actualWidth;
      const y = actualHeight - (value / maxValue) * actualHeight;
      return `${x},${y}`;
    });

    return (
      <svg width={actualWidth} height={actualHeight} className={`cpu-graph ${small ? 'small' : ''}`}>
        <polyline points={points.join(' ')} fill="none" stroke={small ? '#17b890' : '#00b7c3'} strokeWidth={small ? '1' : '2'} />
      </svg>
    );
  };

  return (
    <div className="task-manager-dark">
      <div className="tm-sidebar">
        <div className="sidebar-header">
          <h3>Task Manager</h3>
        </div>
        <nav className="sidebar-nav">
          {/* Processes */}
          <div 
            className={`sidebar-item ${activeTab === 'processes' ? 'active' : ''}`}
            onClick={() => setActiveTab('processes')}
          >
            <div className="sidebar-item-content">
              <span className="sidebar-label">Processes</span>
              <span className="sidebar-count">{processes.length}</span>
            </div>
          </div>

          {/* Performance */}
          <div 
            className={`sidebar-item ${activeTab === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveTab('performance')}
          >
            <div className="sidebar-item-content">
              <span className="sidebar-label">Performance</span>
            </div>
            <div className="sidebar-graphs">
              <div className="graph-item">
                <div className="graph-label">CPU: {performance.cpu.usage}%</div>
                <CPUGraph data={cpuHistory} small={true} />
              </div>
              <div className="graph-item">
                <div className="graph-label">Memory: {performance.memory.usage}%</div>
                <CPUGraph data={memoryHistory} small={true} />
              </div>
              <div className="graph-item">
                <div className="graph-label">Disk: {performance.disk.usage}%</div>
                <CPUGraph data={Array(60).fill(performance.disk.usage)} small={true} />
              </div>
              <div className="graph-item">
                <div className="graph-label">Wi-Fi: 0%</div>
                <CPUGraph data={Array(60).fill(0)} small={true} />
              </div>
              <div className="graph-item">
                <div className="graph-label">GPU: {performance.gpu.usage}%</div>
                <CPUGraph data={Array(60).fill(performance.gpu.usage)} small={true} />
              </div>
            </div>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'scheduler' ? 'active' : ''}`}
            onClick={() => setActiveTab('scheduler')}
          >
            <span className="sidebar-label">CPU Scheduler</span>
          </div>

          <div 
            className={`sidebar-item ${activeTab === 'memory' ? 'active' : ''}`}
            onClick={() => setActiveTab('memory')}
          >
            <span className="sidebar-label">Memory Manager</span>
          </div>

        </nav>

        <div className="sidebar-footer">
          <div 
            className={`sidebar-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <span className="sidebar-label">⚙️ Settings</span>
          </div>
        </div>
      </div>

      <div className="tm-main-content w-full h-full overflow-hidden">
        {activeTab === 'processes' && (
          <div className="tm-embedded-app h-full w-full overflow-hidden">
            <ProcessManager />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="tm-performance-dark">
            <div className="perf-main-grid">
              {/* Left column with all mini graphs and details */}
              <div className="perf-left">
                <div className="perf-mini-card">
                  <div className="perf-mini-header">CPU</div>
                  <div className="perf-mini-graph">
                    <CPUGraph data={cpuHistory} height={100} width={100} small={true} />
                  </div>
                  <div className="perf-mini-value">{performance.cpu.usage}%</div>
                  <div className="perf-mini-detail">2.10 GHz</div>
                </div>

                <div className="perf-mini-card">
                  <div className="perf-mini-header">Memory</div>
                  <div className="perf-mini-graph">
                    <CPUGraph data={memoryHistory} height={100} width={100} small={true} />
                  </div>
                  <div className="perf-mini-value">{performance.memory.usage}%</div>
                  <div className="perf-mini-detail">9.7/15.3 GB</div>
                </div>

                <div className="perf-mini-card">
                  <div className="perf-mini-header">Disk 0 (C:) SSD (NVMe)</div>
                  <div className="perf-mini-graph">
                    <CPUGraph data={Array(60).fill(performance.disk.usage)} height={100} width={100} small={true} />
                  </div>
                  <div className="perf-mini-value">{performance.disk.usage}%</div>
                  <div className="perf-mini-detail">2.8 GB/s</div>
                </div>

                <div className="perf-mini-card">
                  <div className="perf-mini-header">Wi-Fi</div>
                  <div className="perf-mini-graph">
                    <CPUGraph data={Array(60).fill(0)} height={100} width={100} small={true} />
                  </div>
                  <div className="perf-mini-value">0%</div>
                  <div className="perf-mini-detail">0 R 0 Kbps</div>
                </div>

                <div className="perf-mini-card">
                  <div className="perf-mini-header">GPU 0</div>
                  <div className="perf-mini-graph">
                    <CPUGraph data={Array(60).fill(performance.gpu.usage)} height={100} width={100} small={true} />
                  </div>
                  <div className="perf-mini-value">{performance.gpu.usage}%</div>
                  <div className="perf-mini-detail">AMD Radeon(TM)</div>
                </div>
              </div>

              {/* Right column with main CPU graph */}
              <div className="perf-right">
                <div className="perf-main-card cpu-main">
                  <div className="perf-main-header">
                    <h3>CPU</h3>
                    <span className="perf-main-gpu-name">AMD Ryzen 5 7520U with Radeon Graphics</span>
                  </div>
                  <div className="perf-graph-large">
                    <div className="graph-header">
                      <span className="graph-title">% Utilization</span>
                      <span className="graph-max">100%</span>
                    </div>
                    <svg className="cpu-graph-large" viewBox="0 0 1200 400" preserveAspectRatio="xMidYMid meet">
                      {/* Grid */}
                      <defs>
                        <linearGradient id="cpuGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" style={{ stopColor: '#00b7c3', stopOpacity: 0.4 }} />
                          <stop offset="100%" style={{ stopColor: '#00b7c3', stopOpacity: 0.05 }} />
                        </linearGradient>
                      </defs>
                      {/* Vertical grid lines */}
                      {Array.from({ length: 13 }).map((_, i) => (
                        <line
                          key={`v-${i}`}
                          x1={i * 100}
                          y1="0"
                          x2={i * 100}
                          y2="320"
                          stroke="#333"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Horizontal grid lines */}
                      {Array.from({ length: 5 }).map((_, i) => (
                        <line
                          key={`h-${i}`}
                          x1="0"
                          y1={i * 80}
                          x2="1200"
                          y2={i * 80}
                          stroke="#333"
                          strokeWidth="1"
                        />
                      ))}
                      {/* CPU line and area */}
                      <path
                        d={`M 0 ${400 - (cpuHistory[0] / 100) * 320} ${cpuHistory
                          .map(
                            (value, i) =>
                              `L ${(i / (cpuHistory.length - 1)) * 1200} ${400 - (value / 100) * 320}`
                          )
                          .join(' ')} L 1200 400 L 0 400 Z`}
                        fill="url(#cpuGradient)"
                        stroke="none"
                      />
                      <polyline
                        points={cpuHistory
                          .map(
                            (value, i) =>
                              `${(i / (cpuHistory.length - 1)) * 1200},${400 - (value / 100) * 320}`
                          )
                          .join(' ')}
                        fill="none"
                        stroke="#00b7c3"
                        strokeWidth="2"
                      />
                    </svg>
                    <div className="graph-footer">
                      <span className="graph-time">60 seconds</span>
                      <span className="graph-value">0</span>
                    </div>
                  </div>
                  <div className="perf-main-stats">
                    <div className="stat-row">
                      <span className="stat-label">Utilization</span>
                      <span className="stat-value">{performance.cpu.usage}%</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Speed</span>
                      <span className="stat-value">{performance.cpu.speed.toFixed(2)} GHz</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Processes</span>
                      <span className="stat-value">{performance.cpu.processes}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Threads</span>
                      <span className="stat-value">{performance.cpu.threads}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Handles</span>
                      <span className="stat-value">{performance.cpu.handles}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-row">
                      <span className="stat-label">Base speed:</span>
                      <span className="stat-value">{performance.cpu.baseSpeed.toFixed(2)} GHz</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Sockets:</span>
                      <span className="stat-value">{performance.cpu.sockets}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Cores:</span>
                      <span className="stat-value">{performance.cpu.cores}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Logical processors:</span>
                      <span className="stat-value">{performance.cpu.logicalProcessors}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">Virtualization:</span>
                      <span className="stat-value">{performance.cpu.virtualization}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">L1 cache:</span>
                      <span className="stat-value">{performance.cpu.l1}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">L2 cache:</span>
                      <span className="stat-value">{performance.cpu.l2}</span>
                    </div>
                    <div className="stat-row">
                      <span className="stat-label">L3 cache:</span>
                      <span className="stat-value">{performance.cpu.l3}</span>
                    </div>
                    <div className="stat-separator"></div>
                    <div className="stat-row">
                      <span className="stat-label">Up time</span>
                      <span className="stat-value">{performance.cpu.uptime}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'scheduler' && (
          <div className="tm-embedded-app h-full w-full overflow-hidden">
            <Scheduler />
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="tm-embedded-app h-full w-full overflow-hidden">
            <MemoryManager />
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="tm-placeholder">
            <p>Tab content not available in this simulator</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskManager;
