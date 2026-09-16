import { useParams, Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import Badge from '../components/ui/Badge';

// Helper component to display a label and value pair consistently
const DetailField = ({ label, value }) => {
  // Determine if the value is empty
  const isEmpty = value === null || value === undefined || value === '';
  
  return (
    <div className="flex flex-col py-3 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
      <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">{label}</span>
      <span className="text-base text-gray-900 dark:text-gray-100">
        {isEmpty ? (
          <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>
        ) : (
          value
        )}
      </span>
    </div>
  );
};

export default function UserDetail() {
  const { id } = useParams();
  
  // 1. Fetch the exact same local database used by the UsersList
  const [users] = useLocalStorage('guidexr-users', []);
  
  // 2. Find the user by ID. 
  // We use toString() just in case the URL parameter is a string but the data is an integer.
  const user = users.find(u => u.id.toString() === id);

  // 3. Handle the "Not Found" State
  if (!user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The user you are looking for does not exist or has been deleted.
        </p>
        <Link 
          to="/users" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          &larr; Return to Users Directory
        </Link>
      </div>
    );
  }

  // Helper to determine status badge color
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'suspended': return 'danger';
      default: return 'gray';
    }
  };

  // Helper to construct the full name gracefully
  const fullName = user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Top Navigation */}
      <div className="mb-6">
        <Link to="/users" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors">
          &larr; Back to Users
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 border-b-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar Placeholder */}
            <div className="h-24 w-24 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-3xl font-bold uppercase shadow-sm">
              {fullName.charAt(0)}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{fullName}</h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {user.email || 'No email provided'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
            <Badge variant={getStatusColor(user.status)}>
              {user.status || 'Active'}
            </Badge>
            <Badge variant="primary">
              {user.role || 'Viewer'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 pt-6">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
          
          {/* Column 1 */}
          <div className="space-y-8">
            
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Personal Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="First Name" value={user.firstName || (user.name ? user.name.split(' ')[0] : '')} />
                <DetailField label="Last Name" value={user.lastName || (user.name ? user.name.split(' ').slice(1).join(' ') : '')} />
                <DetailField label="Username" value={user.username} />
                <DetailField label="Phone" value={user.phone} />
                <DetailField label="Date of Birth" value={user.dob} />
                <DetailField label="Gender" value={user.gender} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Location
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="City" value={user.city || user.address?.city} />
                <DetailField label="State / Province" value={user.state} />
                <DetailField label="Country" value={user.country} />
              </div>
            </section>

          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Professional Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Organization" value={user.organization || user.company?.name} />
                <DetailField label="Job Title" value={user.jobTitle} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Security & Preferences
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField 
                  label="Email Notifications" 
                  value={user.emailNotifications !== undefined ? (user.emailNotifications ? 'Enabled' : 'Disabled') : null} 
                />
                <DetailField 
                  label="Two-Factor Auth" 
                  value={user.twoFactorAuth !== undefined ? (user.twoFactorAuth ? 'Enabled' : 'Disabled') : null} 
                />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Additional Notes
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <p className="text-gray-900 dark:text-gray-100 text-sm whitespace-pre-wrap">
                  {user.notes || <span className="text-gray-400 dark:text-gray-500 italic">Not provided</span>}
                </p>
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
