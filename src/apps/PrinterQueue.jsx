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
  const [activeTab, setActiveTab] = useState('queue');

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
    return 'io-status io-status-queued';
  };

  const progressValue = metrics.activeJob ? metrics.progress : 0;
  const currentPage = metrics.activeJob ? Math.max(1, metrics.activeJob.currentPage || 1) : 0;

  return (
    <div className="io-simulation">
      <div className="io-header">
        <div>
          <h2>Printer Spooler</h2>
        </div>
        <div className="io-controls">
          <button className="btn btn-primary" onClick={startNextJob}>Start Next Job</button>
          <button className="btn btn-secondary" onClick={completeCurrentJob} disabled={!activeJob}>Complete Current</button>
          <button className="btn btn-secondary" onClick={resetIO}>Reset</button>
        </div>
      </div>

      {/* Main Layout: Sidebar + Tabbed Panel */}
      <div className="io-main-layout">
        
        {/* LEFT SIDEBAR: Printer Device & Progress (Merged) */}
        <aside className="io-sidebar">
          <section className="io-panel io-device-panel-merged">
            <div className="panel-title-row">
              <h3>Printer Device</h3>
              <span className={getStatusClass(metrics.deviceStatus)}>{metrics.deviceStatus}</span>
            </div>

            {/* Printer Device */}
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
            </div>

            {/* Progress Bar & Page Strip */}
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
          </section>
        </aside>

        {/* RIGHT PANEL: Tabbed Interface */}
        <section className="io-panel io-tabbed-panel">
          {/* Tab Headers */}
          <div className="io-tabs-header">
            <button
              className={`io-tab-button ${activeTab === 'queue' ? 'active' : ''}`}
              onClick={() => setActiveTab('queue')}
            >
              Spool Queue
            </button>
            <button
              className={`io-tab-button ${activeTab === 'logs' ? 'active' : ''}`}
              onClick={() => setActiveTab('logs')}
            >
              Event Log
            </button>
          </div>

          {/* Tab Content */}
          <div className="io-tabs-content">
            
            {/* Tab 1: Spool Queue & Submit Form */}
            {activeTab === 'queue' && (
              <div className="io-tab-pane io-tab-pane-queue">
                <h3>Spool Queue</h3>
                <div className="io-queue-wrapper">
                  <table className="io-table">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Job</th>
                        <th>Document</th>
                        <th>Status</th>
                        <th>Progress</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {ioState.jobs.map((job, index) => (
                        <tr key={job.id}>
                          <td>
                            <span className="io-queue-pos">#{index + 1}</span>
                          </td>
                          <td>{job.id}</td>
                          <td>
                            <div className="io-doc-cell" title={job.documentName}>{job.documentName}</div>
                            <div className="io-doc-meta">{job.processId} · {job.pagesPrinted}/{job.pages} pages</div>
                          </td>
                          <td><span className={getStatusClass(job.status)}>{job.status}</span></td>
                          <td>
                            <div className="io-cell-progress">
                              <div className="io-cell-progress-bar">
                                <div className="io-cell-progress-fill" style={{ width: `${job.progress}%` }} />
                              </div>
                              <span>{job.progress}%</span>
                            </div>
                          </td>
                          <td>
                            <button
                              className="io-action-btn"
                              disabled={job.status === 'Printing' || job.status === 'Completed'}
                              onClick={() => cancelPrintJob(job.id)}
                              title={`Cancel ${job.id}`}
                              aria-label={`Cancel ${job.id}`}
                            >
                              x
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {ioState.jobs.length === 0 && (
                    <p className="io-empty">No jobs in queue. Submit a print job to get started.</p>
                  )}
                </div>

                {/* Submit Form */}
                <div className="io-submit-form-wrapper">
                  <h4>Submit Print Job</h4>
                  <div className="io-form io-form-horizontal">
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
                    <button className="btn btn-primary btn-submit" onClick={handleSubmit}>Queue Job</button>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Event Log */}
            {activeTab === 'logs' && (
              <div className="io-tab-pane io-tab-pane-logs">
                <h3>Event Log</h3>
                <div className="io-log-wrapper">
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
                </div>

                <h4>Completed Jobs</h4>
                <div className="io-completed-wrapper">
                  {completedJobs.length > 0 ? (
                    <ul className="io-history">
                      {completedJobs.map((job) => (
                        <li key={`${job.id}-${job.completedAt}`}>{job.id} {job.documentName} completed</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="io-empty">No completed jobs yet.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PrinterQueue;
