import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import useLocalStorage from '../hooks/useLocalStorage';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import OrganizationForm from '../components/organizations/OrganizationForm';

// Helper component to display a label and value pair consistently
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

export default function OrganizationDetail() {
  const { id } = useParams();
  
  // 1. Fetch the exact same local database used by the OrganizationsList
  const [organizations, setOrganizations] = useLocalStorage('guidexr-organizations', []);
  
  // 2. Find the organization by ID.
  const org = organizations.find(o => o.id.toString() === id);

  // 3. Edit State
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 4. Handle Save
  const handleSaveOrg = (submittedData) => {
    setOrganizations((prev) => 
      prev.map((o) => (o.id === org.id ? { ...o, ...submittedData } : o))
    );
    setIsModalOpen(false);
  };

  // 5. Handle the "Not Found" State
  if (!org) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Organization Not Found</h1>
        <p className="text-gray-600 dark:text-gray-400 mb-8">
          The organization you are looking for does not exist or has been deleted.
        </p>
        <Link 
          to="/organizations" 
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm"
        >
          &larr; Return to Organizations
        </Link>
      </div>
    );
  }

  // Helpers to determine badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'active': return 'success';
      case 'inactive': return 'warning';
      case 'pending': return 'danger';
      default: return 'gray';
    }
  };

  const getPlanColor = (plan) => {
    switch (plan?.toLowerCase()) {
      case 'enterprise': return 'primary';
      case 'business': return 'success';
      case 'pro': return 'warning';
      default: return 'gray'; // Free
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-12">
      
      {/* Top Navigation */}
      <div className="mb-6 flex items-center justify-between">
        <Link to="/organizations" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline text-sm font-medium transition-colors">
          &larr; Back to Organizations
        </Link>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors shadow-sm"
        >
          Edit Organization
        </button>
      </div>

      {/* Header Profile Section */}
      <div className="bg-white dark:bg-gray-800 rounded-t-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 border-b-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            {/* Avatar Placeholder */}
            <div className="h-24 w-24 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 text-3xl font-bold uppercase shadow-sm">
              {org.organizationName?.charAt(0) || 'O'}
            </div>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">{org.organizationName}</h1>
              <p className="text-gray-500 dark:text-gray-400 flex items-center gap-2 font-mono">
                {org.organizationCode}
              </p>
            </div>
          </div>
          
          <div className="flex flex-col items-start md:items-end gap-3">
            <Badge variant={getStatusColor(org.status)}>
              {org.status || 'Active'}
            </Badge>
            <Badge variant={getPlanColor(org.subscriptionPlan)}>
              {org.subscriptionPlan || 'Free'}
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
                Organization Overview
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Organization Name" value={org.organizationName} />
                <DetailField label="Organization Code" value={org.organizationCode} />
                <DetailField label="Organization Type" value={org.organizationType} />
                <DetailField label="Industry" value={org.industry} />
                <DetailField label="Created Date" value={org.createdAt} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Location
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="City" value={org.city} />
                <DetailField label="Country" value={org.country} />
              </div>
            </section>

          </div>

          {/* Column 2 */}
          <div className="space-y-8">
            
            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Contact Information
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Contact Person (Owner)" value={org.ownerName} />
                <DetailField label="Email" value={org.ownerEmail} />
                <DetailField label="Phone Number" value={org.contactNumber} />
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                Statistics
              </h3>
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-5 border border-gray-100 dark:border-gray-700/50">
                <DetailField label="Total Users" value={org.totalUsers !== undefined ? org.totalUsers : 'Not available'} />
                <DetailField label="Total Experiences" value={org.totalExperiences !== undefined ? org.totalExperiences : 'Not available'} />
              </div>
            </section>

          </div>
        </div>

      </div>

      {/* Edit Modal Component */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Edit Organization"
      >
        <OrganizationForm 
          initialValues={org}
          onSubmit={handleSaveOrg} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}