import { useState, useMemo } from 'react';
import SettingsCard from '../components/settings/SettingsCard';
import SettingsRow from '../components/settings/SettingsRow';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toggle from '../components/ui/Toggle';
import { useTheme } from '../context/ThemeContext';

export default function Settings() {
  const { themeMode, setThemeMode } = useTheme();

  // Search filter query
  const [searchQuery, setSearchQuery] = useState('');

  // Notification / Feedback banner
  const [saveStatus, setSaveStatus] = useState('');
  const triggerFeedback = (msg) => {
    setSaveStatus(msg);
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // 1. General State
  const [general, setGeneral] = useState({
    workspaceName: 'GuideXR Admin',
    workspaceDescription: 'Spatial collaboration and enterprise extended reality management hub.',
    language: 'English',
    timeZone: 'UTC (GMT+00:00)',
    dateFormat: 'MM/DD/YYYY'
  });

  // 2. Appearance State
  const [appearance, setAppearance] = useState({
    compactMode: true,
    reduceMotion: false
  });

  // 3. Notifications State
  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    userActivity: true,
    orgUpdates: true,
    securityAlerts: true
  });

  // 4. Preferences State
  const [preferences, setPreferences] = useState({
    defaultDashboard: 'Dashboard Overview',
    rowsPerPage: '10',
    confirmDelete: true,
    autoRefresh: '1 minute'
  });

  const selectClasses =
    "w-full sm:w-60 px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors";

  // Search Index for filtering
  const searchableSettings = useMemo(() => [
    { name: 'Workspace Name', section: 'General' },
    { name: 'Workspace Description', section: 'General' },
    { name: 'Language', section: 'General' },
    { name: 'Time Zone', section: 'General' },
    { name: 'Date Format', section: 'General' },
    { name: 'Theme Mode (Light / Dark / System)', section: 'Appearance' },
    { name: 'Compact Layout', section: 'Appearance' },
    { name: 'Reduce Motion', section: 'Appearance' },
    { name: 'Email Notifications', section: 'Notifications' },
    { name: 'User Activity Notifications', section: 'Notifications' },
    { name: 'Organization Updates', section: 'Notifications' },
    { name: 'Security Alerts', section: 'Notifications' },
    { name: 'Default Dashboard Page', section: 'Preferences' },
    { name: 'Rows Per Page', section: 'Preferences' },
    { name: 'Confirm Before Deleting', section: 'Preferences' },
    { name: 'Auto-Refresh Dashboard Data', section: 'Preferences' },
    { name: 'Export Data', section: 'Data & Privacy' },
    { name: 'Download Account Data', section: 'Data & Privacy' },
    { name: 'Clear Local Preferences', section: 'Data & Privacy' },
    { name: 'About GuideXR Admin Dashboard', section: 'About' }
  ], []);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchableSettings.filter(
      s => s.name.toLowerCase().includes(q) || s.section.toLowerCase().includes(q)
    );
  }, [searchQuery, searchableSettings]);

  return (
    <div className="w-full space-y-4 sm:space-y-5 pb-8">
      {/* ----------------------------------------------------- */}
      {/* Top Search Bar (Compact & Full Width)                 */}
      {/* ----------------------------------------------------- */}
      <div className="bg-white dark:bg-gray-800 p-2.5 sm:p-3 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="w-full relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search settings..."
            aria-label="Search settings"
            className="w-full pl-9 pr-8 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50/50 dark:bg-gray-800/80 text-gray-900 dark:text-gray-100 placeholder-gray-400 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              aria-label="Clear search"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Save / Action Notification Banner */}
      {saveStatus && (
        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-sm rounded-lg border border-green-200 dark:border-green-800 flex items-center gap-2 transition-all">
          <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Search Filter Overlay (if user is actively typing) */}
      {searchQuery.trim() !== '' ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-4 space-y-3">
          <div className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Matching Settings ({searchResults.length})
          </div>
          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
              {searchResults.map((res, i) => (
                <div
                  key={i}
                  className="p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-between"
                >
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {res.name}
                    </div>
                    <div className="text-xs text-gray-400">
                      Section: {res.section}
                    </div>
                  </div>
                  <Badge variant="neutral">{res.section}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-sm text-gray-500">
              No settings found for "{searchQuery}".
            </div>
          )}
        </div>
      ) : (
        /* ----------------------------------------------------- */
        /* Unified Single-Page Settings Layout                   */
        /* ----------------------------------------------------- */
        <div className="space-y-4 sm:space-y-5">
          {/* Main 2-Column Responsive Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-5 items-start">
            
            {/* ================================================= */}
            {/* COLUMN 1: General & Preferences                   */}
            {/* ================================================= */}
            <div className="space-y-4 sm:space-y-5">
              
              {/* 1. General Settings */}
              <SettingsCard title="General">
                <SettingsRow label="Workspace Name">
                  <Input
                    value={general.workspaceName}
                    onChange={(e) => setGeneral(prev => ({ ...prev, workspaceName: e.target.value }))}
                    className="sm:w-60"
                    aria-label="Workspace Name"
                  />
                </SettingsRow>
                <SettingsRow label="Workspace Description">
                  <Input
                    value={general.workspaceDescription}
                    onChange={(e) => setGeneral(prev => ({ ...prev, workspaceDescription: e.target.value }))}
                    className="sm:w-60"
                    aria-label="Workspace Description"
                    placeholder="Brief description"
                  />
                </SettingsRow>
                <SettingsRow label="Language">
                  <select
                    value={general.language}
                    onChange={(e) => setGeneral(prev => ({ ...prev, language: e.target.value }))}
                    className={selectClasses}
                    aria-label="Language"
                  >
                    <option value="English">English (United States)</option>
                    <option value="Spanish">Español (Spanish)</option>
                    <option value="French">Français (French)</option>
                    <option value="German">Deutsch (German)</option>
                    <option value="Japanese">日本語 (Japanese)</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Time Zone">
                  <select
                    value={general.timeZone}
                    onChange={(e) => setGeneral(prev => ({ ...prev, timeZone: e.target.value }))}
                    className={selectClasses}
                    aria-label="Time Zone"
                  >
                    <option value="UTC (GMT+00:00)">UTC (GMT+00:00)</option>
                    <option value="America/New_York (GMT-05:00)">America/New_York (EST)</option>
                    <option value="America/Los_Angeles (GMT-08:00)">America/Los_Angeles (PST)</option>
                    <option value="Europe/London (GMT+00:00)">Europe/London (GMT)</option>
                    <option value="Asia/Singapore (GMT+08:00)">Asia/Singapore (SGT)</option>
                    <option value="Asia/Kolkata (GMT+05:30)">Asia/Kolkata (IST)</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Date Format">
                  <select
                    value={general.dateFormat}
                    onChange={(e) => setGeneral(prev => ({ ...prev, dateFormat: e.target.value }))}
                    className={selectClasses}
                    aria-label="Date Format"
                  >
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </SettingsRow>
                <div className="p-3 sm:px-5 bg-gray-50/60 dark:bg-gray-800/40 flex justify-end">
                  <Button onClick={() => triggerFeedback('General settings saved successfully')}>
                    Save Changes
                  </Button>
                </div>
              </SettingsCard>

              {/* 4. Preferences */}
              <SettingsCard title="Preferences">
                <SettingsRow label="Default Dashboard">
                  <select
                    value={preferences.defaultDashboard}
                    onChange={(e) => setPreferences(prev => ({ ...prev, defaultDashboard: e.target.value }))}
                    className={selectClasses}
                    aria-label="Default Dashboard"
                  >
                    <option value="Dashboard Overview">Dashboard Overview</option>
                    <option value="Analytics Insights">Analytics Insights</option>
                    <option value="Users Directory">Users Directory</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Rows Per Page">
                  <select
                    value={preferences.rowsPerPage}
                    onChange={(e) => setPreferences(prev => ({ ...prev, rowsPerPage: e.target.value }))}
                    className={selectClasses}
                    aria-label="Rows Per Page"
                  >
                    <option value="10">10 records (Compact)</option>
                    <option value="25">25 records (Default)</option>
                    <option value="50">50 records</option>
                    <option value="100">100 records (Dense)</option>
                  </select>
                </SettingsRow>
                <SettingsRow label="Confirm Before Deleting">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {preferences.confirmDelete ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle
                      checked={preferences.confirmDelete}
                      onChange={(checked) => setPreferences(prev => ({ ...prev, confirmDelete: checked }))}
                      aria-label="Confirm Before Deleting"
                    />
                  </div>
                </SettingsRow>
                <SettingsRow label="Auto-Refresh Dashboard Data">
                  <select
                    value={preferences.autoRefresh}
                    onChange={(e) => setPreferences(prev => ({ ...prev, autoRefresh: e.target.value }))}
                    className={selectClasses}
                    aria-label="Auto-Refresh Dashboard Data"
                  >
                    <option value="Disabled">Disabled</option>
                    <option value="30 seconds">Every 30 seconds</option>
                    <option value="1 minute">Every 1 minute</option>
                    <option value="5 minutes">Every 5 minutes</option>
                  </select>
                </SettingsRow>
              </SettingsCard>
            </div>

            {/* ================================================= */}
            {/* COLUMN 2: Appearance, Notifications, Data & Privacy */}
            {/* ================================================= */}
            <div className="space-y-4 sm:space-y-5">
              
              {/* 2. Appearance */}
              <SettingsCard title="Appearance">
                <SettingsRow label="Theme">
                  <div className="inline-flex p-1 bg-gray-100 dark:bg-gray-700/60 rounded-lg text-xs font-medium">
                    {['light', 'dark', 'system'].map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => setThemeMode(mode)}
                        className={`px-3 py-1 rounded-md capitalize transition-all ${
                          themeMode === mode
                            ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-sm font-semibold'
                            : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
                        }`}
                        aria-label={`Switch theme to ${mode}`}
                      >
                        {mode}
                      </button>
                    ))}
                  </div>
                </SettingsRow>
                <SettingsRow label="Compact Layout">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {appearance.compactMode ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle
                      checked={appearance.compactMode}
                      onChange={(checked) => setAppearance(prev => ({ ...prev, compactMode: checked }))}
                      aria-label="Compact Layout"
                    />
                  </div>
                </SettingsRow>
                <SettingsRow label="Reduce Motion">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {appearance.reduceMotion ? 'Enabled' : 'Disabled'}
                    </span>
                    <Toggle
                      checked={appearance.reduceMotion}
                      onChange={(checked) => setAppearance(prev => ({ ...prev, reduceMotion: checked }))}
                      aria-label="Reduce Motion"
                    />
                  </div>
                </SettingsRow>
              </SettingsCard>

              {/* 3. Notifications */}
              <SettingsCard title="Notifications">
                <SettingsRow label="Email Notifications">
                  <Toggle
                    checked={notifications.emailNotifications}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, emailNotifications: checked }))}
                    aria-label="Email Notifications"
                  />
                </SettingsRow>
                <SettingsRow label="User Activity Notifications">
                  <Toggle
                    checked={notifications.userActivity}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, userActivity: checked }))}
                    aria-label="User Activity Notifications"
                  />
                </SettingsRow>
                <SettingsRow label="Organization Updates">
                  <Toggle
                    checked={notifications.orgUpdates}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, orgUpdates: checked }))}
                    aria-label="Organization Updates"
                  />
                </SettingsRow>
                <SettingsRow label="Security Alerts">
                  <Toggle
                    checked={notifications.securityAlerts}
                    onChange={(checked) => setNotifications(prev => ({ ...prev, securityAlerts: checked }))}
                    aria-label="Security Alerts"
                  />
                </SettingsRow>
              </SettingsCard>

              {/* 5. Data & Privacy */}
              <SettingsCard title="Data & Privacy">
                <SettingsRow label="Export Data">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFeedback('Data export initiated (CSV/ZIP).')}
                  >
                    Export
                  </Button>
                </SettingsRow>
                <SettingsRow label="Download Account Data">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => triggerFeedback('Account data download requested (JSON).')}
                  >
                    Download
                  </Button>
                </SettingsRow>
                <SettingsRow label="Clear Local Preferences">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setPreferences({
                        defaultDashboard: 'Dashboard Overview',
                        rowsPerPage: '10',
                        confirmDelete: true,
                        autoRefresh: '1 minute'
                      });
                      triggerFeedback('Local preferences reset to defaults.');
                    }}
                  >
                    Reset
                  </Button>
                </SettingsRow>
              </SettingsCard>

            </div>
          </div>

          {/* ================================================= */}
          {/* 6. About Section (Full-Width Bottom Card)         */}
          {/* ================================================= */}
          <div className="w-full">
            <SettingsCard
              title="About"
              action={<Badge variant="info">Development</Badge>}
            >
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-sm">
                <div className="space-y-1">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    GuideXR Admin Dashboard
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>Version <strong className="font-mono text-gray-700 dark:text-gray-300">v1.0.0</strong></span>
                    <span>&bull;</span>
                    <span>Environment: <strong className="font-medium text-gray-700 dark:text-gray-300">Development</strong></span>
                  </div>
                </div>
                <div className="text-xs text-gray-400 dark:text-gray-500">
                  &copy; 2026 GuideXR Technologies, Inc. All rights reserved.
                </div>
              </div>
            </SettingsCard>
          </div>
        </div>
      )}
    </div>
  );
}