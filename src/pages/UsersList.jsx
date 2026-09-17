import { useState, useEffect, useMemo, useCallback } from 'react';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import DataGrid from '../components/data/DataGrid';
import FilterBar from '../components/filters/FilterBar';
import FilterSelect from '../components/filters/FilterSelect';
import useDebounce from '../hooks/useDebounce';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { getUsersWithPagination, searchUsers } from '../api/userApi';

const ITEMS_PER_PAGE = 10;

export default function UsersList() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalUsers, setTotalUsers] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [companyFilter, setCompanyFilter] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [sortFilter, setSortFilter] = useState("Newest First");
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Reset to page 1 on search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm]);

  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getUsersWithPagination(0, 0);
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || "Failed to fetch users. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Compute unique options for dropdowns directly from the current API page data
  // DummyJSON does not provide a global unique lists endpoint
  const uniqueCompanies = useMemo(() => {
    const companies = new Set(users.map(u => u.company?.name || 'Unassigned'));
    return Array.from(companies).sort();
  }, [users]);

  const uniqueRoles = useMemo(() => {
    const roles = new Set(users.map(u => u.role || 'user'));
    return Array.from(roles).sort();
  }, [users]);

  // Derived filtered and sorted array
  const filteredUsers = useMemo(() => {
    let result = users.filter((user) => {
      // 1. Search Match
      if (debouncedSearchTerm) {
        const term = debouncedSearchTerm.toLowerCase();
        const matchesName = `${user.firstName || ''} ${user.lastName || ''}`.toLowerCase().includes(term);
        const matchesEmail = (user.email || '').toLowerCase().includes(term);
        const matchesPhone = (user.phone || '').toLowerCase().includes(term);
        if (!matchesName && !matchesEmail && !matchesPhone) return false;
      }

      // 2. Company Match
      const userCompany = user.company?.name || 'Unassigned';
      if (companyFilter && userCompany !== companyFilter) return false;

      // 3. Role Match
      const userRole = user.role || 'user';
      if (roleFilter && userRole !== roleFilter) return false;

      return true;
    });

    // 3. Sorting
    result.sort((a, b) => {
      if (sortFilter === 'Name A-Z') {
        const nameA = (a.firstName || "").toLowerCase();
        const nameB = (b.firstName || "").toLowerCase();
        return nameA.localeCompare(nameB);
      }
      if (sortFilter === 'Name Z-A') {
        const nameA = (a.firstName || "").toLowerCase();
        const nameB = (b.firstName || "").toLowerCase();
        return nameB.localeCompare(nameA);
      }
      if (sortFilter === 'Oldest First') {
        return a.id - b.id; 
      }
      // Default: Newest First
      return b.id - a.id;
    });

    return result;
  }, [users, debouncedSearchTerm, companyFilter, roleFilter, sortFilter]);

  const handleClearFilters = () => {
    setSearchTerm("");
    setCompanyFilter("");
    setRoleFilter("");
    setSortFilter("Newest First");
    setCurrentPage(1);
  };

  const hasActiveFilters = debouncedSearchTerm || companyFilter || roleFilter || sortFilter !== "Newest First";

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  return (
    <div>
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
              label="Company" 
              value={companyFilter} 
              onChange={setCompanyFilter} 
              options={uniqueCompanies} 
              defaultLabel="All Companies" 
            />
            <FilterSelect 
              label="Role" 
              value={roleFilter} 
              onChange={setRoleFilter} 
              options={uniqueRoles} 
              defaultLabel="All Roles" 
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
      </div>

      {isLoading ? (
        <div className="flex items-center gap-3">
          <Spinner />
          <span className="text-gray-500">Fetching users from API...</span>
        </div>
      ) : error ? (
        <div className="p-6 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-900 shadow-sm flex flex-col items-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <Button onClick={fetchUsers} className="text-sm">Retry Request</Button>
        </div>
      ) : (
        <>
          {filteredUsers.length === 0 ? (
            <EmptyState
              title={users.length === 0 ? "No users found in the system." : "No users match your current filters."}
              description={users.length === 0 ? "Check your API connection or data source." : "Try adjusting your search or filters to see results."}
            >
              {hasActiveFilters && (
                <Button onClick={handleClearFilters} className="text-sm">
                  Clear Filters
                </Button>
              )}
            </EmptyState>
          ) : (
            <DataGrid 
              items={paginatedUsers} 
              onEdit={() => {}}
              onDelete={() => {}}
              footer={
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  isLoading={isLoading}
                  totalItems={filteredUsers.length}
                  pageSize={ITEMS_PER_PAGE}
                />
              }
            />
          )}
        </>
      )}
    </div>
  );
}
