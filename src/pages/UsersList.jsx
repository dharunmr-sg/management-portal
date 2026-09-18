import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getUnifiedUsers, createUnifiedUser, deleteUnifiedUser, bulkDeleteUnifiedUsers } from '../api/unifiedUserApi';
import { importUsersCSV } from '../api/importApi';
import { useDataSource } from '../context/DataSourceContext';
import { useToast } from '../context/ToastContext';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Modal from '../components/ui/Modal';
import Pagination from '../components/ui/Pagination';
import UserForm from '../components/users/UserForm';
import CsvImportModal from '../components/import/CsvImportModal';

// Helper custom hook for debouncing
function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export default function UsersList() {
  const { dataSource } = useDataSource();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { showToast } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [deleteUserItem, setDeleteUserItem] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [query, setQuery] = useState({
    page: 1,
    limit: 10,
    search: '',
    role: '',
    gender: '',
    sortBy: 'id',
    order: 'desc'
  });
  const [paginationInfo, setPaginationInfo] = useState({ total: 0, totalPages: 1 });
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebounce(searchInput, 500);

  useEffect(() => {
    setQuery(prev => ({ ...prev, search: debouncedSearch, page: 1 }));
  }, [debouncedSearch]);

  // Reset query on data source change
  useEffect(() => {
    setQuery({ page: 1, limit: 10, search: '', role: '', gender: '', sortBy: 'id', order: 'desc' });
    setSearchInput('');
    setSelectedIds(new Set());
  }, [dataSource]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getUnifiedUsers(dataSource, query);
      if (response && response.data) {
        setUsers(response.data);
        setPaginationInfo(response.pagination || { total: 0, totalPages: 1 });
      } else if (Array.isArray(response)) {
        setUsers(response);
        setPaginationInfo({ total: response.length, totalPages: 1 });
      } else {
        setUsers([]);
        setPaginationInfo({ total: 0, totalPages: 1 });
      }
      setSelectedIds(new Set());
    } catch (err) {
      if (dataSource === 'local') {
        setError('Unable to connect to the local database server. Please make sure the backend is running.');
      } else {
        setError(err.message || 'Failed to fetch users from external API.');
      }
    } finally {
      setLoading(false);
    }
  }, [dataSource, query]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      await createUnifiedUser(dataSource, data);
      
      if (dataSource === 'api') {
        showToast('User added successfully! (Mock API: Changes will not persist)', 'success');
      } else {
        showToast('User added successfully!', 'success');
      }
      setIsAddModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to add user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteConfirm = async () => {
    setIsSubmitting(true);
    try {
      await deleteUnifiedUser(dataSource, deleteUserItem.id);
      
      if (dataSource === 'api') {
        showToast('User deleted successfully! (Mock API: Changes will not persist)', 'success');
      } else {
        showToast('User deleted successfully!', 'success');
      }
      setDeleteUserItem(null);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBulkDeleteConfirm = async () => {
    setIsBulkDeleting(true);
    try {
      await bulkDeleteUnifiedUsers(dataSource, Array.from(selectedIds));
      if (dataSource === 'api') {
        showToast('Users deleted successfully! (Mock API)', 'success');
      } else {
        showToast('Users deleted successfully!', 'success');
      }
      setSelectedIds(new Set());
      setIsBulkDeleteModalOpen(false);
      fetchUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete users.', 'error');
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === users.length && users.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u.id)));
    }
  };

  const toggleSelectOne = (id) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const getRoleBadgeVariant = (role) => {
    const roleLower = (role || '').toLowerCase();
    if (roleLower === 'admin') return 'danger';
    if (roleLower === 'editor') return 'warning';
    if (roleLower === 'viewer') return 'neutral';
    return 'brand';
  };

  return (
    <div className="space-y-6 relative">


      {/* Action Row */}
      <div className="flex items-center gap-4">
        {/* Filter Bar */}
        <div className="flex-1 bg-white dark:bg-gray-800 p-3 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex items-center gap-4 overflow-x-auto">
          <div className="w-64 flex-shrink-0 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-sm dark:text-white"
              placeholder="Search users..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
          </div>
          
          <div className="flex-1 flex items-center gap-3 justify-end min-w-max">
            <select
              value={query.role}
              onChange={(e) => setQuery(p => ({ ...p, role: e.target.value, page: 1 }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Roles</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
              <option value="viewer">Viewer</option>
              <option value="user">User</option>
              <option value="moderator">Moderator</option>
            </select>
            <select
              value={query.gender}
              onChange={(e) => setQuery(p => ({ ...p, gender: e.target.value, page: 1 }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">All Genders</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            <select
              value={query.sortBy}
              onChange={(e) => setQuery(p => ({ ...p, sortBy: e.target.value }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="id">Sort by ID</option>
              <option value="first_name">Sort by Name</option>
            </select>
            <select
              value={query.order}
              onChange={(e) => setQuery(p => ({ ...p, order: e.target.value }))}
              className="block pl-3 pr-10 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 dark:text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>
        </div>

        {/* Buttons — only in Local DB mode */}
        {dataSource === 'local' && (
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 text-sm h-10 px-3 !bg-emerald-600 hover:!bg-emerald-700 dark:!bg-emerald-600 dark:hover:!bg-emerald-700"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              <span className="whitespace-nowrap">Import CSV</span>
            </Button>
            <Button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 text-sm h-10 px-3"
            >
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="whitespace-nowrap">Add User</span>
            </Button>
          </div>
        )}
      </div>

      {selectedIds.size > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 px-4 py-3 rounded-lg flex items-center justify-between border border-blue-100 dark:border-blue-800/50">
          <span className="text-sm font-medium">{selectedIds.size} users selected</span>
          <Button
            onClick={() => setIsBulkDeleteModalOpen(true)}
            className="!py-1 !px-3 text-xs !bg-red-100 !text-red-700 hover:!bg-red-200 dark:!bg-red-900/40 dark:!text-red-400 border-none shadow-none"
          >
            Delete Selected
          </Button>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
          <Spinner />
          <p className="mt-4 text-sm font-medium text-gray-500 dark:text-gray-400">
            {dataSource === 'local' ? 'Loading users from local backend...' : 'Loading users from external API...'}
          </p>
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900/50 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center mb-3">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
            Unable to Load Users
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 max-w-md mx-auto mb-4">
            {error}
          </p>
          <Button onClick={fetchUsers} className="inline-flex items-center gap-2 text-sm">
            Retry Request
          </Button>
        </div>
      ) : users.length === 0 ? (
        <EmptyState
          title={searchInput ? "No users match your search" : "No users found"}
          description={searchInput ? "Try adjusting your filters or search term." : "There are no users to display yet."}
        >
          {!searchInput && (
            <Button onClick={() => setIsAddModalOpen(true)} className="text-xs !py-1.5 !px-3">
              Add Your First User
            </Button>
          )}
        </EmptyState>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800/50">
                <tr>
                  <th scope="col" className="w-12 px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                      checked={selectedIds.size === users.length && users.length > 0}
                      onChange={toggleSelectAll}
                    />
                  </th>
                  <th scope="col" className="w-16 px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Email
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Phone
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Role
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Created
                  </th>
                  <th scope="col" className="px-4 py-3 text-right text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700 bg-white dark:bg-gray-800">
                {users.map((user) => {
                  const isSelected = selectedIds.has(user.id);
                  return (
                    <tr
                      key={user.id}
                      className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors cursor-pointer ${isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                      onClick={() => navigate(`/users/${user.id}`)}
                    >
                      <td className="px-4 py-3 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelectOne(user.id)}
                        />
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-xs font-mono text-gray-500 dark:text-gray-400">
                        #{user.id}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {user.image ? (
                            <img
                              src={user.image}
                              alt={user.first_name}
                              className="h-8 w-8 rounded-full object-cover flex-shrink-0"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'flex';
                              }}
                            />
                          ) : null}
                          <div
                            className={`h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900/30 items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400 flex-shrink-0 ${user.image ? 'hidden' : 'flex'}`}
                          >
                            {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">
                              {user.first_name} {user.last_name}
                            </span>
                            {user.username && (
                              <span className="block text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                @{user.username}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
                        {user.email || 'N/A'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400" onClick={(e) => e.stopPropagation()}>
                        {user.phone || 'N/A'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm" onClick={(e) => e.stopPropagation()}>
                        <Badge variant={getRoleBadgeVariant(user.role)}>
                          {user.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : 'User'}
                        </Badge>
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500" onClick={(e) => e.stopPropagation()}>
                        {user.created_at ? new Date(user.created_at).toLocaleDateString() : 'N/A'}
                      </td>

                      <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-2">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteUserItem(user);
                            }}
                            className="!py-1 !px-2.5 text-xs !bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-900/30 dark:!text-red-400 dark:hover:!bg-red-900/50 shadow-sm border border-red-200 dark:border-red-800"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination
            currentPage={query.page}
            totalPages={paginationInfo.totalPages}
            totalItems={paginationInfo.total}
            pageSize={query.limit}
            onPageChange={(page) => setQuery(p => ({ ...p, page }))}
          />
        </div>
      )}

      {/* Add User Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => !isSubmitting && setIsAddModalOpen(false)}
        title="Add New User"
        size="lg"
      >
        <UserForm
          onSubmit={handleAddSubmit}
          onCancel={() => setIsAddModalOpen(false)}
          isSubmitting={isSubmitting}
        />
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteUserItem}
        onClose={() => !isSubmitting && setDeleteUserItem(null)}
        title="Delete User"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{deleteUserItem?.first_name} {deleteUserItem?.last_name}</span>?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setDeleteUserItem(null)}
              disabled={isSubmitting}
              className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDeleteConfirm}
              disabled={isSubmitting}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              {isSubmitting ? 'Deleting...' : 'Delete User'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Bulk Delete Modal */}
      <Modal
        isOpen={isBulkDeleteModalOpen}
        onClose={() => !isBulkDeleting && setIsBulkDeleteModalOpen(false)}
        title="Delete Multiple Users"
        size="sm"
      >
        <div className="space-y-4 text-center">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 mx-auto flex items-center justify-center">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <p className="text-gray-700 dark:text-gray-300">
              Are you sure you want to delete <span className="font-semibold">{selectedIds.size}</span> users?
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">This action cannot be undone.</p>
          </div>
          <div className="flex justify-center gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button
              onClick={() => setIsBulkDeleteModalOpen(false)}
              disabled={isBulkDeleting}
              className="!bg-gray-100 hover:!bg-gray-200 dark:!bg-gray-700 dark:hover:!bg-gray-600 !text-gray-700 dark:!text-gray-200"
            >
              Cancel
            </Button>
            <Button
              onClick={handleBulkDeleteConfirm}
              disabled={isBulkDeleting}
              className="!bg-red-600 hover:!bg-red-700 !text-white"
            >
              {isBulkDeleting ? 'Deleting...' : 'Delete Users'}
            </Button>
          </div>
        </div>
      </Modal>
      <CsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onImport={importUsersCSV}
        entityName="Users"
        onSuccess={fetchUsers}
      />

    </div>
  );
}
