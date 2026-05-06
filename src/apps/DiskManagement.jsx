import React from 'react';
import { useFileSystem } from '../hooks/useOS';
import '../styles/apps.css';

const DiskManagement = () => {
  const { fileSystem } = useFileSystem();
  const files = fileSystem.files || {};
  
  // Calculate used space based on the size of all files
  const usedSpaceBytes = Object.values(files).reduce((total, file) => total + (file.size || 0), 0);
  
  // Change capacity to match the visual mock of ~237.63 GB (C: Drive)
  const TOTAL_SPACE = 237.63 * 1024 * 1024 * 1024; 
  const freeSpaceBytes = TOTAL_SPACE - usedSpaceBytes;
  
  // Calculate free space percentage
  const percentageFree = ((freeSpaceBytes / TOTAL_SPACE) * 100).toFixed(0);

  const formatBytes = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const tableData = [
    {
      volume: '(C:)',
      layout: 'Simple',
      type: 'Basic',
      fs: 'NTFS',
      status: 'Healthy (Boot, Page File, Crash Dump, Basic Data Partition)',
      capacity: formatBytes(TOTAL_SPACE),
      free: formatBytes(freeSpaceBytes),
      pctFree: `${percentageFree} %`
    },
    {
      volume: '(Disk 0 partition 1)',
      layout: 'Simple',
      type: 'Basic',
      fs: '',
      status: 'Healthy (EFI System Partition)',
      capacity: '100 MB',
      free: '100 MB',
      pctFree: '100 %'
    },
    {
      volume: '(Disk 0 partition 4)',
      layout: 'Simple',
      type: 'Basic',
      fs: '',
      status: 'Healthy (Recovery Partition)',
      capacity: '745 MB',
      free: '745 MB',
      pctFree: '100 %'
    }
  ];

  return (
    <div className="flex flex-col h-full w-full bg-[#f0f0f0] text-black font-sans text-xs select-none">
      {/* Top half: Table View */}
      <div className="flex-1 overflow-auto bg-white border-b-2 border-gray-400">
        <table className="w-full text-left border-collapse whitespace-nowrap">
          <thead className="bg-gray-100 border-b border-gray-300">
            <tr>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Volume</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Layout</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Type</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">File System</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Status</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Capacity</th>
              <th className="font-normal border-r border-gray-300 px-2 py-1">Free Space</th>
              <th className="font-normal px-2 py-1">% Free</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, i) => (
              <tr key={i} className="hover:bg-blue-50 cursor-default">
                <td className="px-2 py-1 flex items-center border-r border-transparent text-gray-900">
                  <span className="inline-block w-4 h-3 bg-gray-300 mr-2 border border-gray-500 rounded-sm shadow-sm"></span>
                  {row.volume}
                </td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.layout}</td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.type}</td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.fs}</td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.status}</td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.capacity}</td>
                <td className="px-2 py-1 border-r border-transparent text-gray-900">{row.free}</td>
                <td className="px-2 py-1 text-gray-900">{row.pctFree}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Bottom half: Graphical Diagram View */}
      <div className="flex-[1.2] overflow-auto bg-[#f0f0f0] p-2">
        <div className="flex border border-gray-400 bg-white mb-4 min-w-max shadow-sm">
          
          {/* Disk Info Panel */}
          <div className="w-32 bg-[#f0f0f0] border-r border-gray-400 flex flex-col justify-center items-start p-2 gap-1 text-xs">
            <div className="flex items-center gap-1 font-bold text-gray-900">
              <span className="inline-block w-3.5 h-2.5 bg-gray-400 border border-gray-600 rounded-sm shadow-sm relative mr-1">
                 <span className="absolute top-[1px] left-0 w-full h-[1px] bg-green-500"></span>
              </span>
              Disk 0
            </div>
            <div className="text-gray-900">Basic</div>
            <div className="text-gray-900">238.46 GB</div>
            <div className="text-gray-900">Online</div>
          </div>

          {/* Partition Blocks Panel */}
          <div className="flex-1 flex gap-1 p-1 bg-white items-stretch">
            
            {/* EFI Partition */}
            <div className="flex-shrink-0 border border-gray-400 flex flex-col rounded-sm overflow-hidden" style={{ width: '15%'}}>
              <div className="h-1.5 w-full bg-[#000080]"></div>
              <div className="p-1.5 flex flex-col justify-start flex-1 text-gray-900 bg-white">
                <span className="font-semibold">100 MB</span>
                <span>Healthy (EFI System Partition)</span>
              </div>
            </div>

            {/* C Drive Partition */}
            <div className="flex-grow border border-gray-400 flex flex-col rounded-sm overflow-hidden min-w-[200px]">
              <div className="h-1.5 w-full bg-[#000080]"></div>
              <div 
                className="p-1.5 flex flex-col justify-start flex-1 text-gray-900"
                style={{
                  backgroundColor: '#ffffff',
                  backgroundImage: 'repeating-linear-gradient(-45deg, transparent, transparent 3px, rgba(0,0,0,0.06) 3px, rgba(0,0,0,0.06) 6px)'
                }}
              >
                <span className="font-semibold">(C:)</span>
                <span>{formatBytes(TOTAL_SPACE)} NTFS</span>
                <span>Healthy (Boot, Page File, Crash Dump, Basic Data Partition)</span>
              </div>
            </div>

            {/* Recovery Partition */}
            <div className="flex-shrink-0 border border-gray-400 flex flex-col rounded-sm overflow-hidden" style={{ width: '20%'}}>
              <div className="h-1.5 w-full bg-[#000080]"></div>
              <div className="p-1.5 flex flex-col justify-start flex-1 text-gray-900 bg-white">
                <span className="font-semibold">745 MB</span>
                <span>Healthy (Recovery Partition)</span>
              </div>
            </div>
            
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskManagement;