import React, { useState } from 'react';
import { useOS } from '../hooks/useOS';
import '../styles/io-simulation.css';

const PrinterQueue = () => {
  const {
    ioState,
    submitPrintJob,
    startNextJob,
    completeCurrentJob,
    cancelPrintJob,
    resetIO,
    getQueuedJobs,
    getCompletedJobs,
    getActiveJob,
  } = useOS();

  const [processId, setProcessId] = useState('P1');
  const [documentName, setDocumentName] = useState('memo.txt');
  const [pages, setPages] = useState(1);
  const [notes, setNotes] = useState('');

  const queuedJobs = getQueuedJobs();
  const completedJobs = getCompletedJobs();
  const activeJob = getActiveJob();

  const handleSubmit = () => {
    if (!documentName.trim()) return;
    submitPrintJob({ processId, documentName, pages: Number(pages), notes });
    setDocumentName('');
    setNotes('');
    setPages(1);
  };

  return (
    <div className="io-simulation">
      <div className="io-header">
        <div>
          <h2>Printer Spooler</h2>
          <p>Queued jobs wait until the printer is free.</p>
        </div>
        <div className="io-controls">
          <button className="btn btn-primary" onClick={startNextJob}>Start Next Job</button>
          <button className="btn btn-secondary" onClick={completeCurrentJob} disabled={!activeJob}>Complete Current</button>
          <button className="btn btn-secondary" onClick={resetIO}>Reset</button>
        </div>
      </div>

      <div className="io-grid">
        <section className="io-panel">
          <h3>Submit Print Job</h3>
          <div className="io-form">
            <label>
              Process
              <select value={processId} onChange={(e) => setProcessId(e.target.value)}>
                <option value="P1">P1</option>
                <option value="P2">P2</option>
                <option value="P3">P3</option>
              </select>
            </label>
            <label>
              Document
              <input value={documentName} onChange={(e) => setDocumentName(e.target.value)} />
            </label>
            <label>
              Pages
              <input type="number" min="1" value={pages} onChange={(e) => setPages(e.target.value)} />
            </label>
            <label>
              Notes
              <input value={notes} onChange={(e) => setNotes(e.target.value)} />
            </label>
            <button className="btn btn-primary" onClick={handleSubmit}>Queue Job</button>
          </div>
        </section>

        <section className="io-panel">
          <h3>Printer Status</h3>
          <div className="printer-card">
            <div><strong>Status:</strong> {ioState.printerStatus}</div>
            <div><strong>Active Job:</strong> {activeJob ? `${activeJob.id} - ${activeJob.documentName}` : 'None'}</div>
            <div><strong>Queued Jobs:</strong> {queuedJobs.length}</div>
          </div>
          <h4>Spool Queue</h4>
          <table className="io-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Process</th>
                <th>Document</th>
                <th>Pages</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {ioState.jobs.map((job) => (
                <tr key={job.id}>
                  <td>{job.id}</td>
                  <td>{job.processId}</td>
                  <td>{job.documentName}</td>
                  <td>{job.pages}</td>
                  <td>{job.status}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-danger"
                      disabled={job.status === 'Printing' || job.status === 'Completed'}
                      onClick={() => cancelPrintJob(job.id)}
                    >
                      Cancel
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </div>

      <section className="io-panel">
        <h3>Completed Jobs</h3>
        {completedJobs.length > 0 ? (
          <ul className="io-history">
            {completedJobs.map((job) => (
              <li key={`${job.id}-${job.completedAt}`}>{job.id} {job.documentName} completed</li>
            ))}
          </ul>
        ) : (
          <p className="io-empty">No completed jobs yet.</p>
        )}
      </section>
    </div>
  );
};

export default PrinterQueue;
