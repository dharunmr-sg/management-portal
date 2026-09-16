import { useState, useEffect, useMemo } from 'react';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import UserForm from '../components/users/UserForm';
import DataGrid from '../components/data/DataGrid';
import FilterBar from '../components/filters/FilterBar';
import FilterSelect from '../components/filters/FilterSelect';
import useDebounce from '../hooks/useDebounce';
import usePagination from '../hooks/usePagination';
import useLocalStorage from '../hooks/useLocalStorage';

const defaultNewUser = {
  firstName: '',
  lastName: '',
  username: '',
  email: '',
  phone: '',
  profilePhoto: null,
  dob: '',
  gender: '',
  country: '',
  state: '',
  city: '',
  organization: '',
  jobTitle: '',
  role: 'Viewer',
  status: 'Active',
  password: '',
  confirmPassword: '',
  emailNotifications: true,
  twoFactorAuth: false,
  notes: ''
};

const defaultUsers = [
  { id: 1, name: "Leanne Graham", firstName: "Leanne", lastName: "Graham", email: "leanne@acme.com", phone: "+1 555-0101", role: "Admin", status: "Active", organization: "Acme Corp", jobTitle: "Senior Director", city: "San Francisco", createdAt: "2024-01-10" },
  { id: 2, name: "Ervin Howell", firstName: "Ervin", lastName: "Howell", email: "ervin@ghi.org", phone: "+1 555-0102", role: "Editor", status: "Active", organization: "Global Health Institute", jobTitle: "Lead Analyst", city: "London", createdAt: "2024-01-15" },
  { id: 3, name: "Clementine Bauch", firstName: "Clementine", lastName: "Bauch", email: "clem@edutech.edu", phone: "+1 555-0103", role: "Creator", status: "Active", organization: "EduTech Academy", jobTitle: "Designer", city: "Toronto", createdAt: "2024-01-20" },
  { id: 4, name: "Patricia Lebsack", firstName: "Patricia", lastName: "Lebsack", email: "patricia@apex.com", phone: "+1 555-0104", role: "Viewer", status: "Inactive", organization: "Apex Training Solutions", jobTitle: "Coordinator", city: "Sydney", createdAt: "2024-02-01" },
  { id: 5, name: "Chelsey Dietrich", firstName: "Chelsey", lastName: "Dietrich", email: "chelsey@nova.io", phone: "+1 555-0105", role: "Admin", status: "Active", organization: "Nova Startups", jobTitle: "CTO", city: "Austin", createdAt: "2024-02-05" },
  { id: 6, name: "Dennis Schulist", firstName: "Dennis", lastName: "Schulist", email: "dennis@mot.gov", phone: "+1 555-0106", role: "Viewer", status: "Suspended", organization: "Ministry of Transport", jobTitle: "Specialist", city: "Wellington", createdAt: "2024-02-12" },
  { id: 7, name: "Kurtis Weissnat", firstName: "Kurtis", lastName: "Weissnat", email: "kurtis@pioneer.com", phone: "+1 555-0107", role: "Editor", status: "Active", organization: "Pioneer Robotics", jobTitle: "Robotics Engineer", city: "Berlin", createdAt: "2024-02-18" },
  { id: 8, name: "Nicholas Runolf", firstName: "Nicholas", lastName: "Runolf", email: "nicholas@starlight.net", phone: "+1 555-0108", role: "Creator", status: "Active", organization: "Starlight Media", jobTitle: "Producer", city: "Los Angeles", createdAt: "2024-02-25" },
  { id: 9, name: "Glenna Reichert", firstName: "Glenna", lastName: "Reichert", email: "glenna@unity.org", phone: "+1 555-0109", role: "Admin", status: "Active", organization: "Unity Hospital Network", jobTitle: "Admin", city: "Singapore", createdAt: "2024-03-01" },
  { id: 10, name: "Clementina DuBuque", firstName: "Clementina", lastName: "DuBuque", email: "clementina@techcorp.com", phone: "+1 555-0110", role: "Viewer", status: "Active", organization: "TechCorp Logistics", jobTitle: "Manager", city: "Tokyo", createdAt: "2024-03-05" },
  { id: 11, name: "Marcus Vance", firstName: "Marcus", lastName: "Vance", email: "marcus.vance@quantum.com", phone: "+1 555-0111", role: "Admin", status: "Active", organization: "Quantum Dynamics", jobTitle: "Head of Engineering", city: "Boston", createdAt: "2024-03-10" },
  { id: 12, name: "Sophia Chen", firstName: "Sophia", lastName: "Chen", email: "sophia.chen@horizon.edu", phone: "+1 555-0112", role: "Editor", status: "Active", organization: "Horizon Learning Lab", jobTitle: "Curriculum Lead", city: "Seattle", createdAt: "2024-03-15" },
  { id: 13, name: "David Miller", firstName: "David", lastName: "Miller", email: "david.m@biogenix.com", phone: "+1 555-0113", role: "Viewer", status: "Inactive", organization: "BioGenix Pharmaceuticals", jobTitle: "Technician", city: "Basel", createdAt: "2024-03-20" },
  { id: 14, name: "Emily Watson", firstName: "Emily", lastName: "Watson", email: "emily.w@cloudscale.io", phone: "+1 555-0114", role: "Creator", status: "Active", organization: "CloudScale Systems", jobTitle: "DevOps Architect", city: "Denver", createdAt: "2024-03-25" },
  { id: 15, name: "Carlos Mendez", firstName: "Carlos", lastName: "Mendez", email: "carlos.m@metro.gov", phone: "+1 555-0115", role: "Viewer", status: "Active", organization: "Metro Urban Council", jobTitle: "Urban Planner", city: "Madrid", createdAt: "2024-04-01" },
  { id: 16, name: "Rachel Green", firstName: "Rachel", lastName: "Green", email: "rachel.g@vantage.com", phone: "+1 555-0116", role: "Admin", status: "Active", organization: "Vantage Financial Group", jobTitle: "VP Risk", city: "New York", createdAt: "2024-04-05" },
  { id: 17, name: "Liam Patel", firstName: "Liam", lastName: "Patel", email: "liam.patel@solaris.com", phone: "+1 555-0117", role: "Editor", status: "Active", organization: "Solaris Renewable Energy", jobTitle: "Systems Analyst", city: "Phoenix", createdAt: "2024-04-10" },
  { id: 18, name: "Ava Robinson", firstName: "Ava", lastName: "Robinson", email: "ava.r@nextgenai.io", phone: "+1 555-0118", role: "Creator", status: "Active", organization: "NextGen AI Labs", jobTitle: "AI Researcher", city: "San Jose", createdAt: "2024-04-15" },
  { id: 19, name: "James Wilson", firstName: "James", lastName: "Wilson", email: "james.w@pinnacle.com", phone: "+1 555-0119", role: "Viewer", status: "Inactive", organization: "Pinnacle Sports Academy", jobTitle: "Coach", city: "Chicago", createdAt: "2024-04-20" },
  { id: 20, name: "Olivia Taylor", firstName: "Olivia", lastName: "Taylor", email: "olivia.t@bluewave.edu", phone: "+1 555-0120", role: "Creator", status: "Active", organization: "BlueWave Marine Research", jobTitle: "Scientist", city: "Miami", createdAt: "2024-04-25" },
  { id: 21, name: "Ethan Anderson", firstName: "Ethan", lastName: "Anderson", email: "ethan.a@cybershield.com", phone: "+1 555-0121", role: "Admin", status: "Active", organization: "CyberShield Security", jobTitle: "Security Architect", city: "Atlanta", createdAt: "2024-05-01" },
  { id: 22, name: "Isabella Martinez", firstName: "Isabella", lastName: "Martinez", email: "isabella.m@artisan.io", phone: "+1 555-0122", role: "Viewer", status: "Suspended", organization: "Artisan Craft Studio", jobTitle: "Designer", city: "Portland", createdAt: "2024-05-05" },
  { id: 23, name: "Noah Thomas", firstName: "Noah", lastName: "Thomas", email: "noah.t@summithealth.org", phone: "+1 555-0123", role: "Editor", status: "Active", organization: "Summit Health Alliance", jobTitle: "Health Admin", city: "Dallas", createdAt: "2024-05-10" },
  { id: 24, name: "Mia Jackson", firstName: "Mia", lastName: "Jackson", email: "mia.j@terraform.com", phone: "+1 555-0124", role: "Viewer", status: "Active", organization: "TerraForm Agriculture", jobTitle: "Agronomist", city: "Des Moines", createdAt: "2024-05-15" },
  { id: 25, name: "Lucas White", firstName: "Lucas", lastName: "White", email: "lucas.w@orbitsat.com", phone: "+1 555-0125", role: "Editor", status: "Active", organization: "Orbit Satellite Telecom", jobTitle: "Network Engineer", city: "Houston", createdAt: "2024-05-20" }
];

export default function UsersList() {
  const [users, setUsers] = useLocalStorage('guidexr-users', defaultUsers);
  
  const [isLoading, setIsLoading] = useState(false);
  const [error] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [orgFilter, setOrgFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("Newest First");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // If stored users has fewer than defaultUsers, update with the expanded list
    if (!users || users.length < defaultUsers.length) {
      setUsers(defaultUsers);
    }
    setIsLoading(false);
  }, []);

  // Compute unique options for dropdowns directly from the data
  const uniqueOrgs = useMemo(() => {
    const orgs = new Set(users.map(u => u.organization || 'Unassigned'));
    return Array.from(orgs).sort();
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role || 'Viewer'));
    return Array.from(roles).sort();
  }, [users]);

  const uniqueStatuses = useMemo(() => {
    const statuses = new Set(users.map(u => u.status || 'Active'));
    return Array.from(statuses).sort();
  }, [users]);

  // Derived filtered and sorted array
  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      // 1. Expanded Search
      const searchString = `${user.name || (user.firstName + " " + user.lastName)} ${user.email || ''} ${user.phone || ''} ${user.organization || 'Unassigned'} ${user.role || 'Viewer'}`.toLowerCase();
      if (debouncedSearchTerm && !searchString.includes(debouncedSearchTerm.toLowerCase())) {
        return false;
      }

      // 2. Organization Match
      const userOrg = user.organization || 'Unassigned';
      if (orgFilter && userOrg !== orgFilter) return false;

      // 3. Role Match
      const userRole = user.role || 'Viewer';
      if (roleFilter && userRole !== roleFilter) return false;

      // 4. Status Match
      const userStatus = user.status || 'Active';
      if (statusFilter && userStatus !== statusFilter) return false;

      return true;
    });

    // 5. Sorting
    result.sort((a, b) => {
      if (sortFilter === 'Name A-Z') {
        const nameA = (a.name || a.firstName || "").toLowerCase();
        const nameB = (b.name || b.firstName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortFilter === 'Name Z-A') {
        const nameA = (a.name || a.firstName || "").toLowerCase();
        const nameB = (b.name || b.firstName || "").toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortFilter === 'Oldest First') {
        return a.id - b.id; // Assuming lower IDs are older
      }
      // Default: Newest First
      return b.id - a.id;
    });

    return result;
  }, [users, debouncedSearchTerm, orgFilter, roleFilter, statusFilter, sortFilter]);

  // Determine the ideal number of items per page based on screen width
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

  const { currentPage, totalPages, currentItems, next, prev, jump } = usePagination(filteredUsers, itemsPerPage);

  // Reset pagination to page 1 whenever any filter changes
  useEffect(() => {
    if (jump) jump(1);
  }, [debouncedSearchTerm, orgFilter, roleFilter, statusFilter, sortFilter]);

  const handleSaveUser = (submittedData) => {
    const mappedData = {
      ...submittedData,
      name: `${submittedData.firstName || ''} ${submittedData.lastName || ''}`.trim()
    };

    if (editingUser) {
      mappedData.id = editingUser.id;
      setUsers((prevUsers) => 
        prevUsers.map((user) => (user.id === mappedData.id ? mappedData : user))
      );
    } else {
      mappedData.id = Date.now();
      setUsers((prevUsers) => [mappedData, ...prevUsers]);
    }

    setIsModalOpen(false);
  };

  const handleDeleteUser = () => {
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
    setUserToDelete(null);
  };

  const handleClearFilters = () => {
    setSearchTerm("");
    setOrgFilter("");
    setRoleFilter("");
    setStatusFilter("");
    setSortFilter("Newest First");
    if (jump) jump(1);
  };

  const hasActiveFilters = debouncedSearchTerm || orgFilter || roleFilter || statusFilter || sortFilter !== "Newest First";

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
                placeholder="Name, email, or phone..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClear={() => setSearchTerm('')}
              />
            </div>
            <FilterSelect 
              label="Organization" 
              value={orgFilter} 
              onChange={setOrgFilter} 
              options={uniqueOrgs} 
              defaultLabel="All Organizations" 
            />
            <FilterSelect 
              label="Role" 
              value={roleFilter} 
              onChange={setRoleFilter} 
              options={uniqueRoles} 
              defaultLabel="All Roles" 
            />
            <FilterSelect 
              label="Status" 
              value={statusFilter} 
              onChange={setStatusFilter} 
              options={uniqueStatuses} 
              defaultLabel="All Statuses" 
            />
            <FilterSelect 
              label="Sort By" 
              value={sortFilter} 
              onChange={setSortFilter} 
              options={["Newest First", "Oldest First", "Name A-Z", "Name Z-A"]} 
              defaultLabel="Sort By..." 
            />
          </FilterBar>
        </div>

        <div className="flex-shrink-0">
          <Button onClick={() => {
            setEditingUser(null);
            setIsModalOpen(true);
          }}>
            + Add New User
          </Button>
        </div>
      </div>

      {isLoading && (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-gray-500">Fetching users...</span>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 text-red-600 rounded-md border border-red-200">
          Error: {error}
        </div>
      )}

      {!isLoading && !error && (
        <>
          {filteredUsers.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-700">
              {users.length === 0 ? (
                <p className="text-gray-500 dark:text-gray-400">No users exist in the system. Click "+ Add New User" to get started!</p>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-4">
                  <p className="text-gray-500 dark:text-gray-400">No users match your current filters.</p>
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
            <DataGrid 
              items={currentItems} 
              onEdit={(user) => {
                setEditingUser(user);
                setIsModalOpen(true);
              }}
              onDelete={(user) => setUserToDelete(user)}
              footer={
                <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
                  <div className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users
                  </div>
                  {totalPages > 1 && (
                    <div className="flex items-center gap-2">
                      <Button onClick={prev} disabled={currentPage === 1}>
                        Previous
                      </Button>
                      <span className="text-sm font-medium text-gray-600 dark:text-gray-400 px-1">
                        Page {currentPage} of {totalPages}
                      </span>
                      <Button onClick={next} disabled={currentPage === totalPages}>
                        Next
                      </Button>
                    </div>
                  )}
                </div>
              }
            />
          )}
        </>
      )}

      {/* The Shared Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingUser ? "Edit User" : "Add New User"}
      >
        <UserForm 
          initialValues={editingUser || defaultNewUser}
          onSubmit={handleSaveUser} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* The Delete Confirmation Modal */}
      <Modal 
        isOpen={userToDelete !== null} 
        onClose={() => setUserToDelete(null)} 
        title="Confirm Deletion"
        size="sm"
      >
        <div className="text-gray-900 dark:text-gray-100">
          <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</p>
          
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors duration-300 ease-in-out"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteUser} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-300 ease-in-out font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
