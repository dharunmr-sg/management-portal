import { useState, useRef } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';

/**
 * CsvImportModal — Reusable CSV import modal
 *
 * Props:
 *   isOpen       boolean
 *   onClose      () => void
 *   onImport     (file: File) => Promise<{ summary }>  — called with the selected file
 *   entityName   string  e.g. "Products" | "Users"
 *   onSuccess    () => void  — called after successful import to refresh the list
 */
export default function CsvImportModal({ isOpen, onClose, onImport, entityName = 'Records', onSuccess }) {
  const [file, setFile] = useState(null);
  const [fileError, setFileError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState(null); // summary from backend
  const [uploadError, setUploadError] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef(null);

  const reset = () => {
    setFile(null);
    setFileError('');
    setResult(null);
    setUploadError('');
    setIsUploading(false);
    setIsDragging(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const validateFile = (f) => {
    if (!f) return 'Please select a CSV file.';
    const isCsv = f.type === 'text/csv' || f.type === 'application/vnd.ms-excel' || f.name.toLowerCase().endsWith('.csv');
    if (!isCsv) return 'Only .csv files are accepted.';
    if (f.size === 0) return 'The selected file is empty.';
    return '';
  };

  const handleFileChange = (f) => {
    const err = validateFile(f);
    setFileError(err);
    setFile(err ? null : f);
    setResult(null);
    setUploadError('');
  };

  const handleInputChange = (e) => {
    handleFileChange(e.target.files[0] || null);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    handleFileChange(dropped);
  };

  const handleSubmit = async () => {
    if (!file) {
      setFileError('Please select a CSV file before importing.');
      return;
    }
    setIsUploading(true);
    setUploadError('');
    setResult(null);
    try {
      const res = await onImport(file);
      setResult(res.summary);
      if (res.summary.inserted > 0 && onSuccess) {
        onSuccess();
      }
    } catch (err) {
      setUploadError(err.message || 'Import failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Import ${entityName} from CSV`} size="md">
      <div className="space-y-4">

        {/* Instructions */}
        {!result && (
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Upload a <code className="text-xs bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded">.csv</code> file.
            The first row must be the header row. Only valid rows will be inserted into the database.
          </p>
        )}

        {/* Drop zone — hidden after result shown */}
        {!result && (
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                : 'border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => !isUploading && inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleInputChange}
              disabled={isUploading}
            />

            {/* Icon */}
            <div className="mx-auto mb-2 w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </div>

            {file ? (
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{file.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  {(file.size / 1024).toFixed(1)} KB — Click to replace
                </p>
              </div>
            ) : (
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Drag & drop a CSV file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Max 5 MB</p>
              </div>
            )}
          </div>
        )}

        {/* File validation error */}
        {fileError && (
          <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1.5">
            <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {fileError}
          </p>
        )}

        {/* Upload network error */}
        {uploadError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-4 py-3">
            <p className="text-sm text-red-700 dark:text-red-400 font-medium">Import failed</p>
            <p className="text-sm text-red-600 dark:text-red-400 mt-0.5">{uploadError}</p>
          </div>
        )}

        {/* ─── Result summary ─────────────────────────────────────────── */}
        {result && (
          <div className="space-y-3">
            {/* Stat pills */}
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <div className="rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 px-3 py-2 text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">Total Rows</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{result.total}</p>
              </div>
              <div className="rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 px-3 py-2 text-center">
                <p className="text-xs text-green-600 dark:text-green-400">Inserted</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-400">{result.inserted}</p>
              </div>
              <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/50 px-3 py-2 text-center">
                <p className="text-xs text-yellow-600 dark:text-yellow-400">Duplicates</p>
                <p className="text-lg font-bold text-yellow-700 dark:text-yellow-400">{result.duplicates}</p>
              </div>
              <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 px-3 py-2 text-center">
                <p className="text-xs text-red-600 dark:text-red-400">Invalid</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-400">{result.invalid}</p>
              </div>
            </div>

            {/* Success message */}
            {result.inserted > 0 && (
              <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/40 rounded-lg px-3 py-2">
                <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {result.inserted} {entityName.toLowerCase()} successfully imported into the database.
              </div>
            )}

            {/* Error detail table */}
            {result.errors && result.errors.length > 0 && (
              <div>
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                  Row Errors ({result.errors.length})
                </p>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 dark:border-gray-600 divide-y divide-gray-100 dark:divide-gray-700">
                  {result.errors.map((err, i) => (
                    <div key={i} className="flex items-start gap-3 px-3 py-2 text-xs">
                      <span className="flex-shrink-0 font-mono text-gray-400 dark:text-gray-500 w-12">
                        Row {err.row}
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">{err.reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Import another */}
            <button
              type="button"
              onClick={reset}
              className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
            >
              ← Import another file
            </button>
          </div>
        )}

        {/* ─── Action buttons ──────────────────────────────────────────── */}
        {!result && (
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
            <button
              type="button"
              onClick={handleClose}
              disabled={isUploading}
              className="text-sm text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <Button
              onClick={handleSubmit}
              disabled={isUploading || !file || !!fileError}
              className="flex items-center gap-2 text-sm"
            >
              {isUploading ? (
                <>  
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Importing…
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Import
                </>
              )}
            </Button>
          </div>
        )}

        {/* Close button shown after result */}
        {result && (
          <div className="flex justify-end pt-2 border-t border-gray-100 dark:border-gray-700">
            <Button onClick={handleClose} className="text-sm">
              Close
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
}
