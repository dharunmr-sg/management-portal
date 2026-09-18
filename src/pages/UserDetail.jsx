import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useDataSource } from '../context/DataSourceContext';
import { getUnifiedUserById } from '../api/unifiedUserApi';
import Badge from '../components/ui/Badge';
import Spinner from '../components/ui/Spinner';

const DetailField = ({ label, value }) => {
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
  const { dataSource } = useDataSource();
  
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUser = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getUnifiedUserById(dataSource, id);
        setUser(data);
      } catch (err) {
        setError(err.message || 'Failed to fetch user details.');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, dataSource]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto py-12 flex flex-col items-center justify-center">
        <Spinner />
        <p className="mt-4 text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">User Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          {error || "The user you are looking for does not exist or has been deleted."}
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

  // DummyJSON provides image, firstName, lastName, email, phone, age, gender, username, etc.
  const fullName = `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User';
  const role = user.role || 'user';
  
  return (
    <div className="max-w-5xl mx-auto pb-6">
      
      {/* Top Navigation */}
      <div className="mb-4">
        <Link to="/users" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors">
          &larr; Back to Users
        </Link>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 border-b-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {user.image ? (
              <img src={user.image} alt={fullName} className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-gray-100 object-cover shadow-sm flex-shrink-0" />
            ) : (
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-2xl sm:text-3xl font-bold uppercase shadow-sm flex-shrink-0">
                {user.firstName ? user.firstName.charAt(0) : '?'}
              </div>
            )}
            
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">{fullName}</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
                {user.email || 'No email provided'}
              </p>
            </div>
          </div>
          
          <div className="flex flex-row md:flex-col items-start md:items-end gap-2">
            <Badge variant="primary">
              {role}
            </Badge>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="bg-white dark:bg-gray-800 rounded-b-xl shadow-sm border border-gray-200 dark:border-gray-700 p-5 sm:p-6 pt-4 sm:pt-5">
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6">
          
          {/* Column 1 */}
          <div className="space-y-5">
            
            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-2.5">
                Personal Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="First Name" value={user.firstName} />
                <DetailField label="Last Name" value={user.lastName} />
                <DetailField label="Username" value={user.username} />
                <DetailField label="Phone" value={user.phone} />
                <DetailField label="Age" value={user.age} />
                <DetailField label="Gender" value={user.gender} />
                <DetailField label="Birth Date" value={user.birthDate} />
              </div>
            </section>

          </div>

          {/* Column 2 */}
          <div className="space-y-5">

            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-2.5">
                Location
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Address" value={user.address?.address} />
                <DetailField label="City" value={user.address?.city} />
                <DetailField label="State / Province" value={user.address?.state} />
                <DetailField label="Country" value={user.address?.country} />
              </div>
            </section>
            
            <section>
              <h3 className="text-base font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-1.5 mb-2.5">
                Professional Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3.5 sm:p-4 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Company" value={user.company?.name} />
                <DetailField label="Department" value={user.company?.department} />
                <DetailField label="Job Title" value={user.company?.title} />
              </div>
            </section>

          </div>
        </div>

      </div>
    </div>
  );
}
