import { useState } from 'react';
import Card from '../components/ui/Card';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Toggle from '../components/ui/Toggle';
import { useTheme } from '../context/ThemeContext';
import { isRequired, isValidEmail, isValidPhone } from '../utils/validators';

export default function Settings() {
  const { isDarkMode, toggleTheme } = useTheme();

  // ----------------------------------------
  // Profile State & Validation
  // ----------------------------------------
  const [profile, setProfile] = useState({
    fullName: 'Jane Admin',
    email: 'admin@guidexr.com',
    phone: '+1 (555) 123-4567'
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [profileSaveStatus, setProfileSaveStatus] = useState('');

  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
    if (profileErrors[name]) {
      setProfileErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  const handleSaveProfile = () => {
    const newErrors = {};
    if (!isRequired(profile.fullName)) newErrors.fullName = "Full Name is required";
    if (!isRequired(profile.email)) {
      newErrors.email = "Email is required";
    } else if (!isValidEmail(profile.email)) {
      newErrors.email = "Invalid email format";
    }
    if (!isRequired(profile.phone)) {
      newErrors.phone = "Phone Number is required";
    } else if (!isValidPhone(profile.phone)) {
      newErrors.phone = "Invalid phone format";
    }

    setProfileErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      setProfileSaveStatus('Saved successfully');
      setTimeout(() => setProfileSaveStatus(''), 3000);
    }
  };

  // ----------------------------------------
  // Notifications State
  // ----------------------------------------
  const [notifications, setNotifications] = useState({
    email: true,
    newUsers: true,
    orgUpdates: false,
    systemAlerts: true
  });

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // ----------------------------------------
  // Security State
  // ----------------------------------------
  const [twoFactor, setTwoFactor] = useState(false);

  // ----------------------------------------
  // App Preferences State
  // ----------------------------------------
  const [preferences, setPreferences] = useState({
    language: 'English',
    dateFormat: 'MM/DD/YYYY',
    compactSidebar: false,
    autoRefresh: true
  });

  const handlePrefToggle = (key) => {
    setPreferences(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Shared generic input style
  const selectStyles = "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100";

  return (
    <div className="max-w-4xl space-y-6 pb-12">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">
          Manage your account, application preferences, and dashboard settings.
        </p>
      </div>

      {/* ----------------------------------------------------- */}
      {/* A. Profile Settings */}
      {/* ----------------------------------------------------- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Profile Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Full Name</label>
              <Input 
                name="fullName"
                value={profile.fullName} 
                onChange={handleProfileChange}
                error={profileErrors.fullName}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email Address</label>
              <Input 
                name="email"
                type="email"
                value={profile.email} 
                onChange={handleProfileChange}
                error={profileErrors.email}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone Number</label>
              <Input 
                name="phone"
                value={profile.phone} 
                onChange={handleProfileChange}
                error={profileErrors.phone}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Account Role</label>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="primary">Administrator</Badge>
                <span className="text-xs text-gray-500 dark:text-gray-400">System level access</span>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-6 flex items-center gap-4 border-t border-gray-100 dark:border-gray-700 pt-4">
          <Button variant="primary" onClick={handleSaveProfile}>Save Changes</Button>
          {profileSaveStatus && (
            <span className="text-sm font-medium text-green-600 dark:text-green-400 animate-pulse">
              {profileSaveStatus}
            </span>
          )}
        </div>
      </Card>

      {/* ----------------------------------------------------- */}
      {/* B. Appearance Settings */}
      {/* ----------------------------------------------------- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Appearance Settings</h2>
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Customize how the dashboard looks on your device.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <button 
              onClick={() => isDarkMode && toggleTheme()}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                !isDarkMode 
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400' 
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
              }`}
            >
              ☀️ Light Mode
            </button>
            <button 
              onClick={() => !isDarkMode && toggleTheme()}
              className={`flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 font-medium transition-colors ${
                isDarkMode 
                  ? 'border-blue-600 bg-blue-50 text-blue-700 dark:border-blue-500 dark:bg-blue-900/30 dark:text-blue-400' 
                  : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-750'
              }`}
            >
              🌙 Dark Mode
            </button>
          </div>
        </div>
      </Card>

      {/* ----------------------------------------------------- */}
      {/* C. Notification Settings */}
      {/* ----------------------------------------------------- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Notification Settings</h2>
        <div className="space-y-6">
          <Toggle 
            label="Email Notifications" 
            description="Receive daily summary emails."
            checked={notifications.email} 
            onChange={() => handleNotificationToggle('email')} 
          />
          <Toggle 
            label="New User Notifications" 
            description="Alert me when a new user registers."
            checked={notifications.newUsers} 
            onChange={() => handleNotificationToggle('newUsers')} 
          />
          <Toggle 
            label="Organization Updates" 
            description="Alert me when an organization upgrades their plan."
            checked={notifications.orgUpdates} 
            onChange={() => handleNotificationToggle('orgUpdates')} 
          />
          <Toggle 
            label="System Alerts" 
            description="Critical system downtime and maintenance notifications."
            checked={notifications.systemAlerts} 
            onChange={() => handleNotificationToggle('systemAlerts')} 
          />
        </div>
      </Card>

      {/* ----------------------------------------------------- */}
      {/* D. Security Settings */}
      {/* ----------------------------------------------------- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security Settings</h2>
        <div className="space-y-6">
          <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-1">Password</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">Ensure your account is using a long, random password to stay secure.</p>
            <Button variant="secondary">Change Password</Button>
          </div>
          <div className="border-b border-gray-100 dark:border-gray-700 pb-6">
            <Toggle 
              label="Two-Factor Authentication (2FA)" 
              description="Add an extra layer of security to your account."
              checked={twoFactor} 
              onChange={setTwoFactor} 
            />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-2">Active Sessions</h3>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 border border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Windows PC • Chrome</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Current Session • San Francisco, USA</p>
              </div>
              <Badge variant="success">Active Now</Badge>
            </div>
          </div>
        </div>
      </Card>

      {/* ----------------------------------------------------- */}
      {/* E. Application Preferences */}
      {/* ----------------------------------------------------- */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Preferences</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
            <select 
              value={preferences.language}
              onChange={(e) => setPreferences(prev => ({ ...prev, language: e.target.value }))}
              className={selectStyles}
            >
              <option value="English">English</option>
              <option value="Tamil">Tamil</option>
              <option value="Hindi">Hindi</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
            <select 
              value={preferences.dateFormat}
              onChange={(e) => setPreferences(prev => ({ ...prev, dateFormat: e.target.value }))}
              className={selectStyles}
            >
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="md:col-span-2 space-y-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <Toggle 
              label="Compact Sidebar" 
              description="Reduce sidebar width to maximize workspace area."
              checked={preferences.compactSidebar} 
              onChange={() => handlePrefToggle('compactSidebar')} 
            />
            <Toggle 
              label="Auto Refresh Dashboard" 
              description="Automatically fetch new analytics data every 5 minutes."
              checked={preferences.autoRefresh} 
              onChange={() => handlePrefToggle('autoRefresh')} 
            />
          </div>
        </div>
      </Card>
      
    </div>
  );
}