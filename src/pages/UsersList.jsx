import { useState, useEffect } from 'react';
import Spinner from '../components/ui/Spinner';
import Input from '../components/ui/Input';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import UserForm from '../components/UserForm';
import DataGrid from '../components/data/DataGrid';
import useDebounce from '../hooks/useDebounce';
import usePagination from '../hooks/usePagination';
import useLocalStorage from '../hooks/useLocalStorage';

export default function UsersList() {
  // --- NEW: Hybrid Data Architecture ---
  // We swapped useState for useLocalStorage! Now, every time setUsers is called,
  // the array is automatically stringified and saved to the browser's hard drive.
  const [users, setUsers] = useLocalStorage('guidexr-users', []);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [userToDelete, setUserToDelete] = useState(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  useEffect(() => {
    // --- NEW: Offline Support / Local Storage Check ---
    // Because useLocalStorage loads synchronously, if there was data on the hard drive,
    // the users array is already populated! We can skip the API call entirely.
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

  const filteredUsers = users.filter((user) => 
    user.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  // Determine the ideal number of items per page based on screen width!
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

    // Run once on mount
    handleResize();

    // Listen for window resize
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Apply our pagination hook using the dynamic itemsPerPage!
  const { currentPage, totalPages, currentItems, next, prev } = usePagination(filteredUsers, itemsPerPage);

  // --- NEW: Universal Save Handler ---
  // This function handles BOTH Add and Edit!
  const handleSaveUser = (submittedData) => {
    if (editingUser) {
      // EDIT MODE
      // We use array.map() to loop through every user.
      // If the ID matches, we replace the old object with the newly submitted data!
      setUsers((prevUsers) => 
        prevUsers.map((user) => (user.id === submittedData.id ? submittedData : user))
      );
    } else {
      // ADD MODE
      const newUser = {
        ...submittedData,
        id: Date.now() // Fake ID
      };
      // Brand new array with the new user at the front!
      setUsers((prevUsers) => [newUser, ...prevUsers]);
    }

    // Close the modal
    setIsModalOpen(false);
  };

  // --- NEW: Delete Handler ---
  const handleDeleteUser = () => {
    // We use array.filter() to keep everyone EXCEPT the one we want to delete!
    setUsers((prevUsers) => prevUsers.filter((u) => u.id !== userToDelete.id));
    
    // Close the modal
    setUserToDelete(null);
  };

  return (
    <div>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Users Directory</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1 text-sm">Manage and view all registered users.</p>
        </div>
        
        <Button onClick={() => {
          setEditingUser(null); // Ensure we clear any old edit data!
          setIsModalOpen(true);
        }}>
          + Add New User
        </Button>
      </div>
      
      {/* Search Bar */}
      <div className="w-full md:w-72 mb-6">
        <Input 
          placeholder="Search by name..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
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
              <p className="text-gray-500 dark:text-gray-400">No users found matching "{searchTerm}"</p>
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
          initialData={editingUser}
          onSubmit={handleSaveUser} 
          onCancel={() => setIsModalOpen(false)} 
        />
      </Modal>

      {/* --- NEW: The Delete Confirmation Modal --- */}
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
