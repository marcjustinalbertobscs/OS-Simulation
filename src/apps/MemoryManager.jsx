import React, { useState } from 'react';
import { useOS } from '../hooks/useOS';
import '../styles/process-scheduler.css';

/**
 * Memory Manager App
 * Simulates fixed memory partitions with allocation and deallocation
 * 4 partitions of 256KB each = 1MB total
 */

const MemoryManager = () => {
  const {
    processState,
    allocateMemory,
    deallocateMemory,
    getMemoryStatus,
    getMemoryPartitions,
  } = useOS();

  const [showAllocateDialog, setShowAllocateDialog] = useState(false);
  const [selectedProcess, setSelectedProcess] = useState('');
  const [showDeallocateDialog, setShowDeallocateDialog] = useState(false);
  const [selectedPartition, setSelectedPartition] = useState('');

  const memoryStatus = getMemoryStatus();
  const partitions = getMemoryPartitions();
  const processes = processState.processes;
  const allocatedPartitions = partitions.filter((p) => p.allocated);

  const handleAllocateMemory = () => {
    if (selectedProcess && selectedPartition) {
      const partition = partitions.find((p) => p.id === selectedPartition);
      if (partition) {
        allocateMemory(selectedProcess, partition.size);
        setSelectedProcess('');
        setSelectedPartition('');
        setShowAllocateDialog(false);
      }
    }
  };

  const handleDeallocateMemory = () => {
    if (selectedPartition) {
      const partition = partitions.find((p) => p.id === selectedPartition);
      if (partition && partition.processId) {
        deallocateMemory(partition.processId);
        setSelectedPartition('');
        setShowDeallocateDialog(false);
      }
    }
  };

  const getPartitionColor = (partition) => {
    if (!partition.allocated) {
      return '#e0e0e0';
    }
    // Use a hash of process ID for consistent colors
    const hash = partition.processId.charCodeAt(1);
    const hue = (hash * 60) % 360;
    return `hsl(${hue}, 70%, 60%)`;
  };

  return (
    <div className="memory-manager">
      <div className="memory-header">
        <h2>Memory Manager - Fixed Partitions</h2>
        <div className="memory-controls">
          <button
            className="btn btn-primary"
            onClick={() => setShowAllocateDialog(true)}
            disabled={partitions.every((p) => p.allocated)}
          >
            Allocate Memory
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => setShowDeallocateDialog(true)}
            disabled={allocatedPartitions.length === 0}
          >
            Deallocate Memory
          </button>
        </div>
      </div>

      {/* Allocation Dialog */}
      {showAllocateDialog && (
        <div className="memory-dialog-overlay" onClick={() => setShowAllocateDialog(false)}>
          <div className="memory-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Allocate Memory</h3>
            <div className="dialog-form">
              <div className="form-group">
                <label>Select Process:</label>
                <select
                  value={selectedProcess}
                  onChange={(e) => setSelectedProcess(e.target.value)}
                >
                  <option value="">Choose a process...</option>
                  {processes.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Select Free Partition:</label>
                <select
                  value={selectedPartition}
                  onChange={(e) => setSelectedPartition(e.target.value)}
                >
                  <option value="">Choose a partition...</option>
                  {partitions
                    .filter((p) => !p.allocated)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} (0x{p.startAddress.toString(16).padStart(4, '0')} - {p.size}KB)
                      </option>
                    ))}
                </select>
              </div>
              <div className="dialog-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowAllocateDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAllocateMemory}
                  disabled={!selectedProcess || !selectedPartition}
                >
                  Allocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Deallocation Dialog */}
      {showDeallocateDialog && (
        <div className="memory-dialog-overlay" onClick={() => setShowDeallocateDialog(false)}>
          <div className="memory-dialog" onClick={(e) => e.stopPropagation()}>
            <h3>Deallocate Memory</h3>
            <div className="dialog-form">
              <div className="form-group">
                <label>Select Allocated Partition:</label>
                <select
                  value={selectedPartition}
                  onChange={(e) => setSelectedPartition(e.target.value)}
                >
                  <option value="">Choose a partition...</option>
                  {partitions
                    .filter((p) => p.allocated)
                    .map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.id} - {p.processId} (0x{p.startAddress.toString(16).padStart(4, '0')} - {p.size}KB)
                      </option>
                    ))}
                </select>
              </div>
              <div className="dialog-buttons">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowDeallocateDialog(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleDeallocateMemory}
                  disabled={!selectedPartition}
                >
                  Deallocate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Memory Visualization */}
      <div className="memory-visualization">
        <h3>Memory Layout (Total: {memoryStatus.totalMemory}KB)</h3>
        <div className="memory-bars">
          {partitions.map((partition) => (
            <div key={partition.id} className="memory-partition-container">
              <div className="address-label">
                0x{partition.startAddress.toString(16).padStart(4, '0')}
              </div>
              <div
                className="memory-partition"
                style={{
                  backgroundColor: getPartitionColor(partition),
                  border: partition.allocated ? '2px solid #333' : '2px solid #ccc',
                }}
              >
                <div className="partition-info">
                  <div className="partition-id">{partition.id}</div>
                  <div className="partition-size">{partition.size}KB</div>
                  {partition.allocated && (
                    <div className="partition-process">{partition.processId}</div>
                  )}
                  {!partition.allocated && (
                    <div className="partition-free">FREE</div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Status */}
      <div className="memory-status">
        <h3>Memory Usage</h3>
        <div className="status-content">
          <div className="status-items">
            <div className="status-item">
              <span className="status-label">Total Memory:</span>
              <span className="status-value">{memoryStatus.totalMemory} KB</span>
            </div>
            <div className="status-item">
              <span className="status-label">Allocated:</span>
              <span className="status-value">{memoryStatus.allocatedMemory} KB</span>
            </div>
            <div className="status-item">
              <span className="status-label">Free:</span>
              <span className="status-value">{memoryStatus.freeMemory} KB</span>
            </div>
            <div className="status-item">
              <span className="status-label">Utilization:</span>
              <span className="status-value">{memoryStatus.utilizationPercent.toFixed(1)}%</span>
            </div>
          </div>

          <div className="utilization-bar">
            <div
              className="utilization-fill"
              style={{
                width: `${memoryStatus.utilizationPercent}%`,
              }}
            />
            <span className="utilization-text">
              {memoryStatus.utilizationPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      <div className="allocations-table-container">
        <h3>Memory Allocations</h3>
        {allocatedPartitions.length > 0 ? (
          <table className="allocations-table">
            <thead>
              <tr>
                <th>Partition</th>
                <th>Process ID</th>
                <th>Start Address</th>
                <th>Size (KB)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {allocatedPartitions.map((partition) => (
                <tr key={partition.id}>
                  <td>{partition.id}</td>
                  <td>{partition.processId}</td>
                  <td>0x{partition.startAddress.toString(16).padStart(4, '0')}</td>
                  <td>{partition.size}</td>
                  <td>
                    <span className="status-badge allocated">Allocated</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="empty-allocations">No memory allocated</p>
        )}
      </div>
    </div>
  );
};

export default MemoryManager;
