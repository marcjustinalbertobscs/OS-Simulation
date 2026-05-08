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
    getIOEvents,
    getPrinterMetrics,
  } = useOS();

  const [processId, setProcessId] = useState('P1');
  const [documentName, setDocumentName] = useState('memo.txt');
  const [pages, setPages] = useState(1);
  const [notes, setNotes] = useState('');

  const queuedJobs = getQueuedJobs();
  const completedJobs = getCompletedJobs();
  const activeJob = getActiveJob();
  const events = getIOEvents();
  const metrics = getPrinterMetrics();

  const handleSubmit = () => {
    if (!documentName.trim()) return;
    submitPrintJob({ processId, documentName, pages: Number(pages), notes });
    setDocumentName('');
    setNotes('');
    setPages(1);
  };

  const getStatusClass = (status) => {
    if (status === 'Printing') return 'io-status io-status-active';
    if (status === 'Completed') return 'io-status io-status-complete';
    if (status === 'Busy') return 'io-status io-status-active';
    if (status === 'Spooling') return 'io-status io-status-spooling';
    if (status === 'page') return 'io-event-badge io-event-page';
    if (status === 'sound') return 'io-event-badge io-event-sound';
    return 'io-status io-status-queued';
  };

  const progressValue = metrics.activeJob ? metrics.progress : 0;
  const currentPage = metrics.activeJob ? Math.max(1, metrics.activeJob.currentPage || 1) : 0;

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

      <div className="io-layout">
        <section className="io-panel io-panel-compact io-submit-panel">
          <div className="panel-title-row">
            <div>
              <h3>Submit Print Job</h3>
              <p>Queue a document for the printer spooler.</p>
            </div>
          </div>
          <div className="io-form io-form-tight">
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

        <section className="io-panel io-device-panel">
          <div className="panel-title-row">
            <div>
              <h3>Printer Device</h3>
              <p>Live device state and paper tray animation.</p>
            </div>
            <span className={getStatusClass(metrics.deviceStatus)}>{metrics.deviceStatus}</span>
          </div>

          <div className="printer-stage">
            <div className="printer-shell">
              <div className="printer-top">
                <div className="printer-led" />
                <div className="printer-label">OfficeJet Spooler</div>
              </div>

              <div className="paper-tray">
                <div className="tray-slot">
                  <div className={`paper-sheet ${metrics.activeJob ? 'printing' : ''}`}>
                    <div className="paper-lines">
                      <span />
                      <span />
                      <span />
                    </div>
                    {metrics.activeJob && (
                      <div className="paper-progress">
                        <div className="paper-progress-fill" style={{ width: `${progressValue}%` }} />
                      </div>
                    )}
                  </div>
                </div>
                <div className="tray-base" />
              </div>

              <div className="printer-meta">
                <div><strong>Active:</strong> {activeJob ? `${activeJob.id} ${activeJob.documentName}` : 'None'}</div>
                <div><strong>Queue:</strong> {queuedJobs.length}</div>
                <div><strong>Completed:</strong> {completedJobs.length}</div>
                <div><strong>Page:</strong> {metrics.activeJob ? `${currentPage}/${metrics.activeJob.pages}` : '-'}</div>
              </div>
            </div>

            <div className="io-progress-wrap">
              <div className="io-progress-label">
                <span>Print Progress</span>
                <span>{progressValue}%</span>
              </div>
              <div className="io-progress-bar">
                <div className="io-progress-fill" style={{ width: `${progressValue}%` }} />
              </div>
              <div className="io-page-strip">
                {Array.from({ length: metrics.activeJob ? metrics.activeJob.pages : 0 }, (_, index) => {
                  const pageNumber = index + 1;
                  const printed = metrics.activeJob && pageNumber <= (metrics.activeJob.pagesPrinted || 0);
                  const active = metrics.activeJob && pageNumber === currentPage && !printed;
                  return (
                    <span
                      key={pageNumber}
                      className={`io-page ${printed ? 'printed' : ''} ${active ? 'active' : ''}`.trim()}
                    >
                      {pageNumber}
                    </span>
                  );
                })}
              </div>
              <div className="io-page-text">
                {metrics.activeJob ? `Printing page ${currentPage} of ${metrics.activeJob.pages}` : 'No page currently printing'}
              </div>
            </div>
          </div>
        </section>

        <section className="io-panel io-queue-panel">
          <div className="panel-title-row">
            <div>
              <h3>Spool Queue</h3>
              <p>FIFO print jobs and their live page progress.</p>
            </div>
          </div>
          <table className="io-table">
            <thead>
              <tr>
                <th>Job</th>
                <th>Process</th>
                <th>Document</th>
                <th>Pages</th>
                <th>Status</th>
                <th>Progress</th>
                <th>Printed</th>
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
                  <td><span className={getStatusClass(job.status)}>{job.status}</span></td>
                  <td>{job.progress}%</td>
                  <td>{job.pagesPrinted}/{job.pages}</td>
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

      <section className="io-panel io-log-panel">
        <div className="panel-title-row">
          <div>
            <h3>Event Log</h3>
            <p>Printer activity, page-by-page cues, and sound markers.</p>
          </div>
        </div>
        {events.length > 0 ? (
          <ul className="io-history">
            {events.map((event) => (
              <li key={event.id} className={`io-event io-event-${event.type}`}>
                <span>{event.message}</span>
                <span className="io-event-time">{new Date(event.timestamp).toLocaleTimeString()}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="io-empty">No printer activity yet.</p>
        )}

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
