/**
 * Memory Store - manages fixed memory partition allocation and deallocation
 * Fixed partitions: 4 partitions of 256KB each (1MB total)
 */

const PARTITION_SIZE = 256; // KB
const TOTAL_PARTITIONS = 4;

export const memoryActions = {
  // Initialize state with fixed memory partitions
  initState: () => ({
    partitions: Array.from({ length: TOTAL_PARTITIONS }, (_, i) => ({
      id: `PART${i}`,
      startAddress: i * PARTITION_SIZE,
      size: PARTITION_SIZE,
      allocated: false,
      processId: null,
      allocatedAt: null,
    })),
    totalMemory: PARTITION_SIZE * TOTAL_PARTITIONS,
  }),

  // Allocate memory to a process
  allocateMemory: (state, processId, requiredSize) => {
    // Find first available partition with enough size
    const partitionToAllocate = state.partitions.find(
      (p) => !p.allocated && p.size >= requiredSize
    );

    if (!partitionToAllocate) {
      console.warn(
        `Not enough memory. Required: ${requiredSize}KB, Available: ${state.partitions
          .filter((p) => !p.allocated)
          .reduce((sum, p) => sum + p.size, 0)}KB`
      );
      return state;
    }

    return {
      ...state,
      partitions: state.partitions.map((p) =>
        p.id === partitionToAllocate.id
          ? {
              ...p,
              allocated: true,
              processId,
              allocatedAt: Date.now(),
            }
          : p
      ),
    };
  },

  // Deallocate memory from a process
  deallocateMemory: (state, processId) => {
    return {
      ...state,
      partitions: state.partitions.map((p) =>
        p.processId === processId
          ? {
              ...p,
              allocated: false,
              processId: null,
              allocatedAt: null,
            }
          : p
      ),
    };
  },

  // Deallocate all memory for terminating process
  deallocateProcessMemory: (state, processId) => {
    return memoryActions.deallocateMemory(state, processId);
  },

  // Get memory status
  getMemoryStatus: (state) => {
    const allocatedMemory = state.partitions
      .filter((p) => p.allocated)
      .reduce((sum, p) => sum + p.size, 0);
    const freeMemory = state.totalMemory - allocatedMemory;
    const utilizationPercent = (allocatedMemory / state.totalMemory) * 100;

    return {
      totalMemory: state.totalMemory,
      allocatedMemory,
      freeMemory,
      utilizationPercent,
      partitions: state.partitions,
    };
  },

  // Get partitions
  getPartitions: (state) => {
    return state.partitions;
  },

  // Get allocations for a process
  getProcessAllocations: (state, processId) => {
    return state.partitions.filter((p) => p.processId === processId);
  },

  // Check if memory is available
  isMemoryAvailable: (state, requiredSize) => {
    const totalFree = state.partitions
      .filter((p) => !p.allocated)
      .reduce((sum, p) => sum + p.size, 0);
    return totalFree >= requiredSize;
  },

  // Get memory utilization percentage
  getUtilizationPercent: (state) => {
    const allocatedMemory = state.partitions
      .filter((p) => p.allocated)
      .reduce((sum, p) => sum + p.size, 0);
    return (allocatedMemory / state.totalMemory) * 100;
  },

  // Reset memory
  resetMemory: () => {
    return memoryActions.initState();
  },
};
