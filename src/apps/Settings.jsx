import React, { useState } from 'react';
import { useSettings } from '../hooks/useOS';
import '../styles/apps.css';

/**
 * Settings App
 */

const Settings = () => {
  const { isDarkMode, accentColor, setDarkMode, setAccentColor } = useSettings();
  const [activeTab, setActiveTab] = useState('display');

  const accentColors = [
    '#0078d4', // Default Blue
    '#e81123', // Red
    '#107c10', // Green
    '#ffb900', // Yellow
    '#cf6679', // Pink
    '#8661c5', // Purple
  ];

  return (
    <div className="settings">
      {/* Tab navigation */}
      <div className="settings-tabs">
        <button
          className={`settings-tab ${activeTab === 'display' ? 'active' : ''}`}
          onClick={() => setActiveTab('display')}
        >
          🎨 Display
        </button>
        <button
          className={`settings-tab ${activeTab === 'system' ? 'active' : ''}`}
          onClick={() => setActiveTab('system')}
        >
          ⚙️ System
        </button>
        <button
          className={`settings-tab ${activeTab === 'about' ? 'active' : ''}`}
          onClick={() => setActiveTab('about')}
        >
          ℹ️ About
        </button>
      </div>

      {/* Tab content */}
      <div className="settings-content">
        {/* Display Tab */}
        {activeTab === 'display' && (
          <div className="settings-section">
            <h2>Display Settings</h2>

            {/* Dark mode toggle */}
            <div className="settings-item">
              <label>Dark Mode</label>
              <div className="toggle-switch">
                <input
                  type="checkbox"
                  checked={isDarkMode}
                  onChange={(e) => setDarkMode(e.target.checked)}
                  id="dark-mode-toggle"
                />
                <label htmlFor="dark-mode-toggle" className="toggle-label">
                  {isDarkMode ? 'On' : 'Off'}
                </label>
              </div>
            </div>

            {/* Accent color picker */}
            <div className="settings-item">
              <label>Accent Color</label>
              <div className="color-picker">
                {accentColors.map((color) => (
                  <button
                    key={color}
                    className={`color-swatch ${accentColor === color ? 'selected' : ''}`}
                    style={{ backgroundColor: color }}
                    onClick={() => setAccentColor(color)}
                    title={color}
                    aria-label={`Select color ${color}`}
                  >
                    {accentColor === color && '✓'}
                  </button>
                ))}
              </div>
            </div>

            {/* Theme preview */}
            <div className="settings-item">
              <label>Preview</label>
              <div className="theme-preview">
                <div className="preview-window">
                  <div className="preview-title-bar">Sample Window</div>
                  <div className="preview-content">This is how your OS will look with the current theme.</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* System Tab */}
        {activeTab === 'system' && (
          <div className="settings-section">
            <h2>System Information</h2>

            <div className="info-item">
              <label>Device Name</label>
              <div className="info-value">Windows OS Simulator</div>
            </div>

            <div className="info-item">
              <label>Processor</label>
              <div className="info-value">Virtual Intel Core i9-13900K</div>
            </div>

            <div className="info-item">
              <label>RAM</label>
              <div className="info-value">16 GB (15.8 GB usable)</div>
            </div>

            <div className="info-item">
              <label>System Type</label>
              <div className="info-value">64-bit Operating System</div>
            </div>

            <div className="info-item">
              <label>Disk Space</label>
              <div className="info-value">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '45%' }} />
                </div>
                <span>450 GB / 1 TB (45% used)</span>
              </div>
            </div>

            <div className="info-item">
              <label>Virtual Memory</label>
              <div className="info-value">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: '20%' }} />
                </div>
                <span>2 GB / 10 GB</span>
              </div>
            </div>
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="settings-section">
            <h2>About Windows OS Simulator</h2>

            <div className="about-content">
              <div className="about-item">
                <strong>Version</strong>
                <span>11.0.22621</span>
              </div>

              <div className="about-item">
                <strong>OS Build</strong>
                <span>22621.1825</span>
              </div>

              <div className="about-item">
                <strong>Edition</strong>
                <span>Web Edition</span>
              </div>

              <div className="about-item">
                <strong>Installation Date</strong>
                <span>{new Date().toLocaleDateString()}</span>
              </div>

              <div className="about-description">
                <p>
                  Windows OS Simulator is a React-based simulation of the Windows 11 operating system.
                  It features a fully functional desktop environment with draggable windows, a file system,
                  and built-in applications.
                </p>
              </div>

              <div className="about-buttons">
                <button className="btn-secondary">Check for Updates</button>
                <button className="btn-secondary">System Properties</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
