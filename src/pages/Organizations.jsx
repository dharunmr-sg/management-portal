import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import Badge from '../components/ui/Badge';
import OrganizationForm from '../components/organizations/OrganizationForm';
import FilterBar from '../components/filters/FilterBar';
import FilterSelect from '../components/filters/FilterSelect';
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
  { id: 10, organizationName: "TechCorp Logistics", organizationCode: "TCL-010", organizationType: "Corporate", ownerName: "Michael Chang", ownerEmail: "mchang@techcorp.com", contactNumber: "+1 555-1010", industry: "Logistics", subscriptionPlan: "Pro", status: "Inactive", totalUsers: 25, totalExperiences: 2, country: "Japan", city: "Tokyo", createdAt: "2024-01-20" },
  { id: 11, organizationName: "Quantum Dynamics", organizationCode: "QDN-011", organizationType: "Corporate", ownerName: "Marcus Vance", ownerEmail: "mvance@quantum.com", contactNumber: "+1 555-1111", industry: "Technology", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 310, totalExperiences: 19, country: "USA", city: "Boston", createdAt: "2024-02-14" },
  { id: 12, organizationName: "Horizon Learning Lab", organizationCode: "HLL-012", organizationType: "Educational", ownerName: "Sophia Chen", ownerEmail: "schen@horizon.edu", contactNumber: "+1 555-1212", industry: "Education", subscriptionPlan: "Pro", status: "Active", totalUsers: 540, totalExperiences: 28, country: "USA", city: "Seattle", createdAt: "2024-02-28" },
  { id: 13, organizationName: "BioGenix Pharmaceuticals", organizationCode: "BGP-013", organizationType: "Healthcare", ownerName: "David Miller", ownerEmail: "dmiller@biogenix.com", contactNumber: "+41 22 555 1313", industry: "Healthcare", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 820, totalExperiences: 31, country: "Switzerland", city: "Basel", createdAt: "2024-03-10" },
  { id: 14, organizationName: "CloudScale Systems", organizationCode: "CSS-014", organizationType: "Startup", ownerName: "Emily Watson", ownerEmail: "ewatson@cloudscale.io", contactNumber: "+1 555-1414", industry: "Software", subscriptionPlan: "Business", status: "Active", totalUsers: 95, totalExperiences: 7, country: "USA", city: "Denver", createdAt: "2024-03-22" },
  { id: 15, organizationName: "Metro Urban Council", organizationCode: "MUC-015", organizationType: "Government", ownerName: "Carlos Mendez", ownerEmail: "cmendez@metro.gov", contactNumber: "+34 91 555 1515", industry: "Public Sector", subscriptionPlan: "Enterprise", status: "Inactive", totalUsers: 410, totalExperiences: 15, country: "Spain", city: "Madrid", createdAt: "2023-10-18" },
  { id: 16, organizationName: "Vantage Financial Group", organizationCode: "VFG-016", organizationType: "Corporate", ownerName: "Rachel Green", ownerEmail: "rgreen@vantage.com", contactNumber: "+1 555-1616", industry: "Finance", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 1500, totalExperiences: 52, country: "USA", city: "New York", createdAt: "2023-12-05" },
  { id: 17, organizationName: "Solaris Renewable Energy", organizationCode: "SRE-017", organizationType: "Corporate", ownerName: "Liam Patel", ownerEmail: "lpatel@solaris.com", contactNumber: "+1 555-1717", industry: "Clean Energy", subscriptionPlan: "Business", status: "Active", totalUsers: 220, totalExperiences: 11, country: "USA", city: "Phoenix", createdAt: "2024-01-08" },
  { id: 18, organizationName: "NextGen AI Labs", organizationCode: "NGA-018", organizationType: "Startup", ownerName: "Ava Robinson", ownerEmail: "arobinson@nextgenai.io", contactNumber: "+1 555-1818", industry: "Artificial Intelligence", subscriptionPlan: "Free", status: "Pending", totalUsers: 18, totalExperiences: 2, country: "USA", city: "San Jose", createdAt: "2024-06-11" },
  { id: 19, organizationName: "Pinnacle Sports Academy", organizationCode: "PSA-019", organizationType: "Training Center", ownerName: "James Wilson", ownerEmail: "jwilson@pinnacle.com", contactNumber: "+1 555-1919", industry: "Athletics", subscriptionPlan: "Pro", status: "Active", totalUsers: 130, totalExperiences: 9, country: "USA", city: "Chicago", createdAt: "2024-04-03" },
  { id: 20, organizationName: "BlueWave Marine Research", organizationCode: "BWM-020", organizationType: "Educational", ownerName: "Olivia Taylor", ownerEmail: "otaylor@bluewave.edu", contactNumber: "+1 555-2020", industry: "Marine Science", subscriptionPlan: "Business", status: "Active", totalUsers: 75, totalExperiences: 6, country: "USA", city: "Miami", createdAt: "2024-05-12" },
  { id: 21, organizationName: "CyberShield Security", organizationCode: "CSS-021", organizationType: "Corporate", ownerName: "Ethan Anderson", ownerEmail: "eanderson@cybershield.com", contactNumber: "+1 555-2121", industry: "Cybersecurity", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 640, totalExperiences: 26, country: "USA", city: "Atlanta", createdAt: "2024-02-01" },
  { id: 22, organizationName: "Artisan Craft Studio", organizationCode: "ACS-022", organizationType: "Startup", ownerName: "Isabella Martinez", ownerEmail: "imartinez@artisan.io", contactNumber: "+1 555-2222", industry: "Creative Arts", subscriptionPlan: "Free", status: "Inactive", totalUsers: 8, totalExperiences: 1, country: "USA", city: "Portland", createdAt: "2024-07-15" },
  { id: 23, organizationName: "Summit Health Alliance", organizationCode: "SHA-023", organizationType: "Healthcare", ownerName: "Noah Thomas", ownerEmail: "nthomas@summithealth.org", contactNumber: "+1 555-2323", industry: "Healthcare", subscriptionPlan: "Pro", status: "Active", totalUsers: 390, totalExperiences: 14, country: "USA", city: "Dallas", createdAt: "2024-03-18" },
  { id: 24, organizationName: "TerraForm Agriculture", organizationCode: "TFA-024", organizationType: "Corporate", ownerName: "Mia Jackson", ownerEmail: "mjackson@terraform.com", contactNumber: "+1 555-2424", industry: "Agritech", subscriptionPlan: "Business", status: "Active", totalUsers: 180, totalExperiences: 8, country: "USA", city: "Des Moines", createdAt: "2024-04-29" },
  { id: 25, organizationName: "Orbit Satellite Telecom", organizationCode: "OST-025", organizationType: "Corporate", ownerName: "Lucas White", ownerEmail: "lwhite@orbitsat.com", contactNumber: "+1 555-2525", industry: "Telecommunications", subscriptionPlan: "Enterprise", status: "Active", totalUsers: 910, totalExperiences: 37, country: "USA", city: "Houston", createdAt: "2023-11-14" }
];

export default function Organizations() {
  const [organizations, setOrganizations] = useLocalStorage('guidexr-organizations', defaultOrganizations);
  
  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState(null);
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [planFilter, setPlanFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("Newest First");

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    if (!organizations || organizations.length < defaultOrganizations.length) {
      setOrganizations(defaultOrganizations);
    }
  }, []);

  // Compute unique options directly from current organizations data
  const uniqueTypes = useMemo(() => {
    const types = new Set(organizations.map(o => o.organizationType || 'Other'));
    return Array.from(types).sort();
  }, [organizations]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(organizations.map(o => o.status || 'Active'));
    return Array.from(statuses).sort();
  }, [organizations]);

  const uniquePlans = useMemo(() => {
    const plans = new Set(organizations.map(o => o.subscriptionPlan || 'Free'));
    return Array.from(plans).sort();
  }, [organizations]);

  // Derived filtered and sorted array
  const filteredOrgs = useMemo(() => {
    let result = organizations.filter((org) => {
      // 1. Expanded Search
      const searchString = `${org.organizationName} ${org.organizationCode} ${org.organizationType || ''} ${org.ownerName} ${org.ownerEmail} ${org.country} ${org.city} ${org.industry}`.toLowerCase();
      if (debouncedSearchTerm && !searchString.includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // 2. Type Match
      const orgType = org.organizationType || 'Other';
      if (typeFilter && orgType !== typeFilter) return false;

      // 3. Status Match
      const orgStatus = org.status || 'Active';
      if (statusFilter && orgStatus !== statusFilter) return false;

      // 4. Plan Match
      const orgPlan = org.subscriptionPlan || 'Free';
      if (planFilter && orgPlan !== planFilter) return false;

      return true;
    });

    // 5. Sorting
    result.sort((a, b) => {
      if (sortFilter === 'Name A-Z') {
        return (a.organizationName || "").localeCompare(b.organizationName || "");
      }
      if (sortFilter === 'Name Z-A') {
        return (b.organizationName || "").localeCompare(a.organizationName || "");
      }
      if (sortFilter === 'Most Users') {
        return (b.totalUsers || 0) - (a.totalUsers || 0);
      }
      if (sortFilter === 'Oldest First') {
        return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
      }
      // Default: Newest First
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [organizations, debouncedSearchTerm, typeFilter, statusFilter, planFilter, sortFilter]);

  // Determine items per page based on screen width (10 for laptop/desktop)
  const [itemsPerPage, setItemsPerPage] = useState(10);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerPage(10); // Laptops (lg): 10 records per page
      } else if (width >= 768) {
        setItemsPerPage(10); // Tablets (md): 10 records
      } else {
        setItemsPerPage(5); // Phones (< md): 5 records
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { currentPage, totalPages, currentItems, next, prev, jump } = usePagination(filteredOrgs, itemsPerPage);

  // Reset to page 1 whenever any filter changes
  useEffect(() => {
    if (jump) jump(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, typeFilter, statusFilter, planFilter, sortFilter]);

  // Handlers
  const handleSaveOrg = (submittedData) => {
    if (editingOrg) {
      setOrganizations((prev) => 
        prev.map((org) => (org.id === editingOrg.id ? { ...org, ...submittedData } : org))
      );
    } else {
      const newOrg = {
        ...submittedData,
        id: Date.now(),
        totalUsers: 0,
        totalExperiences: 0,
        createdAt: new Date().toISOString().split('T')[0]
      };
      setOrganizations((prev) => [newOrg, ...prev]);
    }
    setIsModalOpen(false);
  };

  const handleDeleteClick = (org) => {
    if (window.confirm(`Are you sure you want to delete ${org.organizationName}?`)) {
      setOrganizations((prev) => prev.filter(o => o.id !== org.id));
    }
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setTypeFilter("");
    setStatusFilter("");
    setPlanFilter("");
    setSortFilter("Newest First");
    if (jump) jump(1);
  };

  const hasActiveFilters = debouncedSearchTerm || typeFilter || statusFilter || planFilter || sortFilter !== "Newest First";

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
      {/* Filter and Add Action on the same line, with Add button separated from the filter card */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-4">
        <div className="flex-1">
          <FilterBar onClear={handleClearFilters} showClear={hasActiveFilters} className="mb-0">
            <div className="flex-1 min-w-[170px]">
              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1 uppercase tracking-wider">
                Search
              </label>
              <Input 
                placeholder="Search organizations..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>
            <FilterSelect 
              label="Organization Type" 
              value={typeFilter} 
              onChange={setTypeFilter} 
              options={uniqueTypes} 
              defaultLabel="All Types" 
            />
            <FilterSelect 
              label="Status" 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={uniqueStatuses} 
              defaultLabel="All Statuses" 
            />
            <FilterSelect 
              label="Plan" 
              value={planFilter} 
              onChange={setPlanFilter} 
              options={uniquePlans} 
              defaultLabel="All Plans" 
            />
            <FilterSelect 
              label="Sort By" 
              value={sortFilter} 
              onChange={setSortFilter} 
              options={["Newest First", "Oldest First", "Name A-Z", "Name Z-A", "Most Users"]} 
              defaultLabel="Sort By..." 
            />
          </FilterBar>
        </div>

        <div className="flex-shrink-0">
          <Button onClick={() => {
            setEditingOrg(null);
            setIsModalOpen(true);
          }}>
            + Add Organization
          </Button>
        </div>
      </div>
      
      {/* Main Content Area */}
      {filteredOrgs.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
          {organizations.length === 0 ? (
            <p className="text-gray-500 dark:text-gray-400">No organizations available yet. Click "+ Add Organization" to get started!</p>
          ) : (
            <div className="flex flex-col items-center justify-center space-y-4">
              <p className="text-gray-500 dark:text-gray-400">No organizations match your current filters.</p>
              {hasActiveFilters && (
                <button 
                  onClick={handleClearFilters}
                  className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline focus:outline-none"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-fixed w-full min-w-[900px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="w-[13%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Org ID
                  </th>
                  <th scope="col" className="w-[21%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Organization
                  </th>
                  <th scope="col" className="w-[14%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th scope="col" className="w-[13%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Plan
                  </th>
                  <th scope="col" className="w-[11%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Users
                  </th>
                  <th scope="col" className="w-[13%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="w-[15%] px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {currentItems.map((org) => (
                  <tr key={org.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-300 ease-in-out group">
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-mono font-medium text-gray-600 dark:text-gray-300 truncate">
                      {org.organizationCode || `ORG-${String(org.id).padStart(3, '0')}`}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold uppercase text-xs">
                          {org.organizationName.charAt(0)}
                        </div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white truncate">
                          {org.organizationName}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300 truncate">
                      {org.organizationType}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={getPlanColor(org.subscriptionPlan)}>{org.subscriptionPlan}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium text-gray-700 dark:text-gray-300">
                      {org.totalUsers ?? 0}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <Badge variant={getStatusColor(org.status)}>{org.status}</Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-left text-sm font-medium">
                      <div className="flex items-center gap-3">
                        <Link 
                          to={`/organizations/${org.id}`}
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 focus:outline-none"
                          aria-label={`View ${org.organizationName}`}
                        >
                          View
                        </Link>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Table Footer at the end of the table */}
          <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
            <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
              Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrgs.length)} of {filteredOrgs.length} organizations
            </div>
            {totalPages > 1 && (
              <div className="flex items-center gap-2">
                <Button onClick={prev} disabled={currentPage === 1} variant="secondary">
                  Previous
                </Button>
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                  Page {currentPage} of {totalPages}
                </span>
                <Button onClick={next} disabled={currentPage === totalPages} variant="secondary">
                  Next
                </Button>
              </div>
            )}
          </div>
        </div>
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