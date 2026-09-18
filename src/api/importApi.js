const BASE_URL = import.meta.env.VITE_LOCAL_API_URL || 'http://localhost:5000/api';

/**
 * Upload a CSV file to the Express backend for import.
 * Uses raw fetch with FormData (NOT localApiClient, which forces JSON Content-Type).
 */
async function uploadCsv(endpoint, file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    body: formData,
    // DO NOT set Content-Type — browser sets it automatically with boundary for multipart
  });

  const json = await response.json();

  if (!response.ok || json.success === false) {
    throw new Error(json.message || `Import failed with status ${response.status}`);
  }

  return json; // { success: true, summary: { total, inserted, duplicates, invalid, errors } }
}

export async function importProductsCSV(file) {
  return uploadCsv('/products/import', file);
}

export async function importUsersCSV(file) {
  return uploadCsv('/users/import', file);
}
