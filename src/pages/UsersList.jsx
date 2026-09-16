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

export default function UsersList() {
  const [users, setUsers] = useLocalStorage('guidexr-users', []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

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
    if (users.length > 0) {
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();

    const fetchUsers = async () => {
      try {
        const response = await fetch('https://jsonplaceholder.typicode.com/users', {
          signal: controller.signal
        });
        
        if (!response.ok) throw new Error("Failed to fetch users");
        const data = await response.json();
        
        setUsers(data);
        setError(null);
      } catch (err) {
        if (err.name !== 'AbortError') {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();

    return () => {
      controller.abort();
    };
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
  const [itemsPerPage, setItemsPerPage] = useState(6);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1024) {
        setItemsPerPage(6); // Laptops (lg): 3 cols * 2 rows
      } else if (width >= 768) {
        setItemsPerPage(10); // Tablets (md): 2 cols * 5 rows
      } else {
        setItemsPerPage(4); // Phones (< md): 1 col * 4 rows
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
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Manage and view all registered users.</p>
        </div>
        
        <Button onClick={() => {
          setEditingUser(null);
          setIsModalOpen(true);
        }}>
          + Add New User
        </Button>
      </div>

      {/* Advanced Filter Bar */}
      <FilterBar onClear={handleClearFilters} showClear={hasActiveFilters}>
        <div className="flex-1 min-w-[200px]">
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

      {/* Results Summary */}
      {!isLoading && !error && (
        <div className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-4">
          {filteredUsers.length > 0 ? (
            <>Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredUsers.length)} of {filteredUsers.length} users</>
          ) : (
            <>0 users found</>
          )}
        </div>
      )}
      
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
            <>
              <DataGrid 
                items={currentItems} 
                onEdit={(user) => {
                  setEditingUser(user);
                  setIsModalOpen(true);
                }}
                onDelete={(user) => setUserToDelete(user)}
              />
              
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-8 bg-white dark:bg-gray-800 p-4 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                  <Button onClick={prev} disabled={currentPage === 1}>
                    Previous
                  </Button>
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Page {currentPage} of {totalPages}
                  </span>
                  <Button onClick={next} disabled={currentPage === totalPages}>
                    Next
                  </Button>
                </div>
              )}
            </>
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
      >
        <div className="text-gray-900 dark:text-gray-100">
          <p>Are you sure you want to delete <strong>{userToDelete?.name}</strong>?</p>
          <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">This action cannot be undone.</p>
          
          <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button 
              onClick={() => setUserToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            >
              Cancel
            </button>
            <button 
              onClick={handleDeleteUser} 
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              Delete User
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
