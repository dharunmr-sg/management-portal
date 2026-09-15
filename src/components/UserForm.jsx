import { useState, useEffect } from 'react';
import Input from './ui/Input';
import Button from './ui/Button';
import { isRequired, isValidEmail, isValidPhone, isValidUrl } from '../utils/validators';

export default function UserForm({ initialData, onSubmit, onCancel }) {
  // 1. Set Initial Form Values
  // We use a single object instead of 5 different useStates!
  // If `initialData` is provided (e.g., when Editing), we pre-fill the form.
  // Otherwise, we start with completely blank strings.
  const [formData, setFormData] = useState(
    initialData || {
      name: '',
      email: '',
      phone: '',
      company: '',
      website: ''
    }
  );

  // --- NEW: Validation State ---
  // This object will hold any error messages (e.g., { email: "Please enter a valid email" })
  const [errors, setErrors] = useState({});

  // --- NEW: Reset Form when Selected User Changes ---
  // If the parent switches from "Add" (null) to "Edit" (user object),
  // React will NOT recreate this component from scratch. We must use `useEffect`
  // to force the `useState` to update whenever `initialData` changes!
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', email: '', phone: '', company: '', website: '' });
    }
    // Clear any lingering errors from a previous attempt
    setErrors({});
  }, [initialData]);

  // 2. One Change Handler to Rule Them All!
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
    
    // Optional Pro-Tip: Clear the specific error the moment the user starts typing to fix it!
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // --- NEW: The Validation Logic ---
  const validate = () => {
    const newErrors = {};

    if (!isRequired(formData.name)) {
      newErrors.name = "Full Name is required.";
    }

    if (!isRequired(formData.email)) {
      newErrors.email = "Email Address is required.";
    } else if (!isValidEmail(formData.email)) {
      newErrors.email = "Please enter a valid email address.";
    }

    if (!isRequired(formData.phone)) {
      newErrors.phone = "Phone Number is required.";
    } else if (!isValidPhone(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number (at least 7 characters).";
    }

    if (!isRequired(formData.company)) {
      newErrors.company = "Company Name is required.";
    }

    // Website is purely optional, so we only validate it IF they typed something!
    if (formData.website && !isValidUrl(formData.website)) {
      newErrors.website = "Please enter a valid URL (e.g., https://example.com).";
    }

    // Save the errors to our state so the UI can display them!
    setErrors(newErrors);
    
    // If the newErrors object has absolutely zero keys, the form is perfectly valid!
    return Object.keys(newErrors).length === 0;
  };

  // 3. Handle Form Submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // CRITICAL: Stop submission if validation fails!
    if (validate()) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Full Name *
        </label>
        <Input 
          name="name" 
          value={formData.name} 
          onChange={handleChange} 
          error={errors.name}
          placeholder="Jane Doe" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Email Address *
        </label>
        <Input 
          type="email"
          name="email" 
          value={formData.email} 
          onChange={handleChange} 
          error={errors.email}
          placeholder="jane@example.com" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Phone Number *
        </label>
        <Input 
          name="phone" 
          value={formData.phone} 
          onChange={handleChange} 
          error={errors.phone}
          placeholder="(555) 123-4567" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Company Name *
        </label>
        <Input 
          name="company" 
          value={formData.company} 
          onChange={handleChange} 
          error={errors.company}
          placeholder="Acme Corp" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Website (Optional)
        </label>
        <Input 
          name="website" 
          value={formData.website} 
          onChange={handleChange} 
          error={errors.website}
          placeholder="https://example.com" 
        />
      </div>

      {/* Buttons Area */}
      <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
        {/* We use type="button" here so clicking Cancel DOES NOT accidentally submit the form! */}
        <button 
          type="button" 
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
        >
          Cancel
        </button>
        
        {/* This button has type="submit" by default (or omitted), so it triggers handleSubmit */}
        <Button>
          Save User
        </Button>
      </div>
    </form>
  );
}
