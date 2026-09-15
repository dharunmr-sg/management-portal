import { useState } from 'react';

export default function usePagination(items, itemsPerPage) {
  // We ONLY store the current page number in state!
  const [currentPage, setCurrentPage] = useState(1);

  // We mathematically derive the total pages on the fly!
  const totalPages = Math.ceil(items.length / itemsPerPage);

  // We mathematically calculate which slice of the array to show!
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = items.slice(startIndex, endIndex);

  // Helper functions to change the page
  const next = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const prev = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return { currentPage, totalPages, currentItems, next, prev };
}
