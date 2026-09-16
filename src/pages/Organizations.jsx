import { useState, useEffect } from 'react';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import OrganizationForm from '../components/organizations/OrganizationForm';
import useDebounce from '../hooks/useDebounce';
import usePagination from '../hooks/usePagination';
import useLocalStorage from '../hooks/useLocalStorage';

const defaultOrganizations = [
  { id: 1, organizationName: "Acme Corp", organizationCode: "ACM-001", organizationType: "Corporate", ownerName: "Jane Doe", ownerEmail: "jane@acme.com", contactNumber: "+1 555-0101", industry: "Technology", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 145, totalExperiences: 12, country: "USA", city: "San Francisco", createdAt: "2024-01-15" },
  { id: 2, organizationName: "Global Health Institute", organizationCode: "GHI-002", organizationType: "Healthcare", ownerName: "John Smith", ownerEmail: "jsmith@ghi.org", contactNumber: "+1 555-0202", industry: "Healthcare", subscriptionPlan: "Pro", status: "Active", totalUsers: 45, totalExperiences: 3, country: "UK", city: "London", createdAt: "2024-02-10" },
  { id: 3, organizationName: "EduTech Academy", organizationCode: "EDU-003", organizationType: "Educational", ownerName: "Alice Johnson", ownerEmail: "alice@edutech.edu", contactNumber: "+1 555-0303", industry: "Education", subscriptionPlan: "Business", status: "Active", totalUsers: 850, totalExperiences: 34, country: "Canada", city: "Toronto", createdAt: "2024-03-05" },
  { id: 4, organizationName: "Apex Training Solutions", organizationCode: "ATS-004", organizationType: "Training Center", ownerName: "Robert Fox", ownerEmail: "robert@apex.com", contactNumber: "+1 555-0404", industry: "Professional Services", subscriptionPlan: "Pro", status: "Pending", totalUsers: 0, totalExperiences: 0, country: "Australia", city: "Sydney", createdAt: "2024-08-22" },
  { id: 5, organizationName: "Nova Startups", organizationCode: "NOV-005", organizationType: "Startup", ownerName: "Sarah Connor", ownerEmail: "sarah@nova.io", contactNumber: "+1 555-0505", industry: "Software", subscriptionPlan: "Free", status: "Active", totalUsers: 12, totalExperiences: 1, country: "USA", city: "Austin", createdAt: "2024-04-12" },
  { id: 6, organizationName: "Ministry of Transport", organizationCode: "MOT-006", organizationType: "Government", ownerName: "David Miller", ownerEmail: "dmiller@mot.gov", contactNumber: "+1 555-0606", industry: "Public Sector", subscriptionPlan: "Enterprise", status: "Inactive", totalUsers: 340, totalExperiences: 8, country: "New Zealand", city: "Wellington", createdAt: "2023-11-30" },
  { id: 7, organizationName: "Pioneer Robotics", organizationCode: "PIO-007", organizationType: "Corporate", ownerName: "Elena Rodriguez", ownerEmail: "elena@pioneer.com", contactNumber: "+1 555-0707", industry: "Manufacturing", subscriptionPlan: "Business", status: "Active", totalUsers: 56, totalExperiences: 5, country: "Germany", city: "Berlin", createdAt: "2024-05-18" },
  { id: 8, organizationName: "Starlight Media", organizationCode: "STR-008", organizationType: "Startup", ownerName: "Kevin Hart", ownerEmail: "kevin@starlight.net", contactNumber: "+1 555-0808", industry: "Entertainment", subscriptionPlan: "Free", status: "Active", totalUsers: 5, totalExperiences: 0, country: "USA", city: "Los Angeles", createdAt: "2024-07-01" },
  { id: 9, organizationName: "Unity Hospital Network", organizationCode: "UHN-009", organizationType: "Healthcare", ownerName: "Dr. Amanda Lee", ownerEmail: "alee@unity.org", contactNumber: "+1 555-0909", industry: "Healthcare", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 1200, totalExperiences: 42, country: "Singapore", city: "Singapore", createdAt: "2023-09-15" },
  { id: 10, organizationName: "TechCorp Logistics", organizationCode: "TCL-010", organizationType: "Corporate", ownerName: "Michael Chang", ownerEmail: "mchang@techcorp.com", contactNumber: "+1 555-1010", industry: "Logistics", subscriptionPlan: "Pro", status: "Inactive", totalUsers: 25, totalExperiences: 2, country: "Japan", city: "Tokyo", createdAt: "2024-01-20" }
];

export default function Organizations() {
  const [organizations, setOrganizations] = useLocalStorage('guidexr-organizations', defaultOrganizations);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  
  // Search State
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Filter Logic
  const filteredOrgs = organizations.filter((org) => {
    const searchString = `${org.organizationName} ${org.organizationCode} ${org.ownerName} ${org.industry} ${org.city}`.toLowerCase();
    return searchString.includes(debouncedSearchTerm.toLowerCase());
  });

  // Pagination Logic
  const itemsPerPage = 5; // Display 5 per page as requested
  const { currentPage, totalPages, currentItems, next, prev, jump } = usePagination(filteredOrgs, itemsPerPage);

  // Reset to page 1 whenever the search term changes!
  useEffect(() => {
    if (currentPage !== 1) {
      jump(1);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  // Handlers
  const handleSaveOrg = (submittedData) => {
    if (editingOrg) {
      // Edit Mode
      setOrganizations((prev) => 
        prev.map((org) => (org.id === editingOrg.id ? { ...org, ...submittedData } : org))
      );
    } else {
      // Add Mode
      const newOrg = {
        ...submittedData,
        id: Date.now(), // Generate a unique ID
        totalUsers: 0,
        totalExperiences: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOrganizations((prev) => [newOrg, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (org) => {
    // Stage 10 requests we do not implement fully functioning delete yet, 
    // just the UI placeholder, but we can easily wire it up or mock it if needed.
    // For now, we will just delete it directly or show an alert. 
    // Actually, "Even if delete functionality is not implemented yet" implies we don't have to build the confirmation modal.
    if (window.confirm(`Are you sure you want to delete ${org.organizationName}?`)) {
      setOrganizations((prev) => prev.filter(o => o.id !== org.id));
    }
  };

  // Badge Helpers
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
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Organizations</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Manage organizations and their workspace access.</p>
        </div>
        
        <Button onClick={() => {
          setEditingOrg(null);
          setIsModalOpen(true);
        }}>
          + Add Organization
        </Button>
      </div>

      {/* Search Bar & Summary */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="w-full md:w-72">
          <Input 
            placeholder="Search organizations..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onClear={() => setSearchTerm('')}
          />
        </div>
        
        {/* Results Summary */}
        {filteredOrgs.length > 0 && (
          <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrgs.length)} of {filteredOrgs.length} organizations
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {filteredOrgs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          {organizations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No organizations exist in the system. Click "+ Add Organization" to get started!</p>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-500 dark:text-gray-400">No organizations found matching "{searchTerm}"</p>
              <button 
                onClick={() => setSearchTerm('')}
                className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
              >
                Clear Search
              </button>
            </div>
          )}
        </div>
      ) : (
        <>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800/50">
                  <tr>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Organization
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Plan
                    </th>
                    <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Users / Exp.
                    </th>
                    <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-4 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentItems.map((org) => (
                    <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase">
                            {org.organizationName.charAt(0)}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {org.organizationName}
                            </div>
                            <div className="text-xs font-mono text-gray-500 dark:text-gray-400 mt-0.5">
                              {org.organizationCode}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-gray-100">{org.organizationType}</span>
                        <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{org.industry}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getPlanColor(org.subscriptionPlan)}>{org.subscriptionPlan}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center text-sm text-gray-500 dark:text-gray-400">
                        <div className="font-medium text-gray-900 dark:text-gray-100">{org.totalUsers}</div>
                        <div className="text-xs">{org.totalExperiences} Exp</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge variant={getStatusColor(org.status)}>{org.status}</Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
                          <button 
                            onClick={() => {
                              setEditingOrg(org);
                              setIsModalOpen(true);
                            }}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 focus:outline-none"
                            aria-label={`Edit ${org.organizationName}`}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(org)}
                            className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 focus:outline-none"
                            aria-label={`Delete ${org.organizationName}`}
                          >
                            Delete
                          </button>
                        </div>
                        {/* Fallback for touch devices where hover is not a thing */}
                        <div className="flex items-center justify-end gap-3 md:hidden">
                          <button onClick={() => { setEditingOrg(org); setIsModalOpen(true); }} className="text-indigo-600 dark:text-indigo-400">Edit</button>
                          <button onClick={() => handleDeleteClick(org)} className="text-red-600 dark:text-red-400">Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-6 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
              <Button onClick={prev} disabled={currentPage === 1} variant="secondary">
                Previous
              </Button>
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Page {currentPage} of {totalPages}
              </span>
              <Button onClick={next} disabled={currentPage === totalPages} variant="secondary">
                Next
              </Button>
            </div>
          )}
        </>
      )}

      {/* The Shared Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingOrg ? "Edit Organization" : "Add New Organization"}
      >
        <OrganizationForm 
          initialValues={editingOrg || {}}
          onSubmit={handleSaveOrg} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>
    </div>
  );
}