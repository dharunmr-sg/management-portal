import Button from './Button';

export default function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  isLoading,
  totalItems,
  pageSize 
}) {
  if (totalPages <= 1) {
    if (totalItems !== undefined && totalItems > 0) {
      // Just render the text if there's only 1 page but we still want to show count
      return (
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
          <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
            Showing {totalItems} of {totalItems} items
          </div>
        </div>
      );
    }
    return null;
  }

  const handlePrevPage = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  return (
    <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row items-center justify-between gap-3 bg-gray-50/50 dark:bg-gray-800/50">
      <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 font-medium">
        {totalItems !== undefined && pageSize !== undefined ? (
          <>
            Showing {Math.min((currentPage - 1) * pageSize + 1, totalItems)} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
          </>
        ) : (
          `Page ${currentPage} of ${totalPages}`
        )}
      </div>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          onClick={handlePrevPage}
          disabled={currentPage === 1 || isLoading}
          className="!py-1.5 !px-3 text-xs font-medium transition-colors !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-400 !text-white disabled:!bg-gray-100 disabled:!text-gray-400 dark:disabled:!bg-gray-800 dark:disabled:!text-gray-500 disabled:!opacity-100"
        >
          Previous
        </Button>
        <span className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 px-1 hidden sm:inline-block">
          Page {currentPage} of {totalPages}
        </span>
        <Button
          type="button"
          onClick={handleNextPage}
          disabled={currentPage === totalPages || isLoading}
          className="!py-1.5 !px-3 text-xs font-medium transition-colors !bg-blue-600 hover:!bg-blue-700 dark:!bg-blue-500 dark:hover:!bg-blue-400 !text-white disabled:!bg-gray-100 disabled:!text-gray-400 dark:disabled:!bg-gray-800 dark:disabled:!text-gray-500 disabled:!opacity-100"
        >
          Next
        </Button>
      </div>
    </div>
  );
}
