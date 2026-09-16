import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

// 1. Import our pure, reusable validation functions!
import {
  isRequired,
  isValidName,
  isValidUsername,
  isValidEmail,
  isValidPhone,
  isValidPassword,
  passwordsMatch
} from '../../utils/validators';

// Helper component for accessible required labels
const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    {children} {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
    {required && <span className="sr-only">required</span>}
  </label>
);

export default function UserForm({
  initialValues = {},
  onSubmit,
  onCancel,
  submitLabel = 'Save User',
  isSubmitting = false
}) {
  const [formData, setFormData] = useState({
    // Smartly map legacy "name" into our modern split fields if it exists!
    firstName: initialValues.firstName || (initialValues.name ? initialValues.name.split(' ')[0] : ''),
    lastName: initialValues.lastName || (initialValues.name ? initialValues.name.split(' ').slice(1).join(' ') : ''),
    username: initialValues.username || '',
    email: initialValues.email || '',
    phone: initialValues.phone || '',
    profilePhoto: null,
    dob: initialValues.dob || '',
    gender: initialValues.gender || '',
    country: initialValues.country || '',
    state: initialValues.state || '',
    // Smartly map legacy nested objects!
    city: initialValues.city || (initialValues.address?.city || ''),
    organization: initialValues.organization || (initialValues.company?.name || ''),
    jobTitle: initialValues.jobTitle || '',
    role: initialValues.role || 'Viewer',
    status: initialValues.status || 'Active',
    password: '',
    confirmPassword: '',
    emailNotifications: initialValues.emailNotifications ?? true,
    twoFactorAuth: initialValues.twoFactorAuth ?? false,
    notes: initialValues.notes || ''
  });

  // 2. Add Form-Level Error State
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));

    // 7. Clear errors when the user edits a field!
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // 4. Create local validateForm function
  const validateForm = () => {
    const newErrors = {};

    // Check required basic fields
    if (!isRequired(formData.firstName)) newErrors.firstName = 'First name is required';
    else if (!isValidName(formData.firstName)) newErrors.firstName = 'First name contains invalid characters';

    if (!isRequired(formData.lastName)) newErrors.lastName = 'Last name is required';
    else if (!isValidName(formData.lastName)) newErrors.lastName = 'Last name contains invalid characters';

    if (!isRequired(formData.username)) newErrors.username = 'Username is required';
    else if (!isValidUsername(formData.username)) newErrors.username = 'Username can only contain letters, numbers, hyphens, and underscores';

    if (!isRequired(formData.email)) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Please enter a valid email address';

    if (!isRequired(formData.phone)) newErrors.phone = 'Phone number is required';
    else if (!isValidPhone(formData.phone)) newErrors.phone = 'Please enter a valid phone number';

    if (!isRequired(formData.country)) newErrors.country = 'Country is required';
    if (!isRequired(formData.state)) newErrors.state = 'State is required';
    if (!isRequired(formData.city)) newErrors.city = 'City is required';
    
    if (!isRequired(formData.organization)) newErrors.organization = 'Organization is required';
    if (!isRequired(formData.jobTitle)) newErrors.jobTitle = 'Job title is required';
    if (!isRequired(formData.role)) newErrors.role = 'Role is required';
    if (!isRequired(formData.status)) newErrors.status = 'Status is required';

    // Conditional Password Validation (Only require it if creating a new user, OR if they started typing one)
    const isEditing = !!initialValues.username; // Simple heuristic: if we have a username already, we are editing
    
    if (!isEditing || formData.password.length > 0) {
      if (!isEditing && !isRequired(formData.password)) {
        newErrors.password = 'Password is required for new users';
      } else if (!isValidPassword(formData.password)) {
        newErrors.password = 'Password must be at least 8 characters and contain a number and a letter';
      }

      if (!passwordsMatch(formData.password, formData.confirmPassword)) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    
    // Return true if there are NO errors
    return Object.keys(newErrors).length === 0;
  };

  // 8. Validate on submit
  const handleSubmit = (e) => {
    e.preventDefault(); 
    
    const isValid = validateForm();
    if (!isValid) return; // Stop if validation failed!

    if (onSubmit) {
      onSubmit(formData); 
    }
  };

  // Helper for custom select/textarea styling to mimic Input.jsx
  const getFieldClasses = (fieldName) => {
    const base = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
    const state = errors[fieldName] 
      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    return `${base} ${state}`;
  };

  const isEditing = !!initialValues.username;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      
      {/* --- Personal Information --- */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Personal Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="firstName" required>First Name</Label>
            <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jane" error={errors.firstName} aria-invalid={!!errors.firstName} />
          </div>
          <div>
            <Label htmlFor="lastName" required>Last Name</Label>
            <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" error={errors.lastName} aria-invalid={!!errors.lastName} />
          </div>
          <div>
            <Label htmlFor="username" required>Username</Label>
            <Input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="janedoe99" error={errors.username} aria-invalid={!!errors.username} />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" error={errors.email} aria-invalid={!!errors.email} />
          </div>
          <div>
            <Label htmlFor="phone" required>Phone Number</Label>
            <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" error={errors.phone} aria-invalid={!!errors.phone} />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} error={errors.dob} aria-invalid={!!errors.dob} />
          </div>
          <div>
            <Label htmlFor="gender">Gender</Label>
            <select id="gender" name="gender" value={formData.gender} onChange={handleChange} className={getFieldClasses('gender')} aria-invalid={!!errors.gender}>
              <option value="">Select gender...</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
            {errors.gender && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>}
          </div>
          <div>
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <input 
              type="file" 
              id="profilePhoto" 
              name="profilePhoto" 
              onChange={handleChange} 
              className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 dark:hover:file:bg-blue-900/50 transition-colors" 
              accept="image/*" 
            />
          </div>
        </div>
      </div>

      {/* --- Location Information --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Location Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="country" required>Country</Label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} className={getFieldClasses('country')} aria-invalid={!!errors.country}>
              <option value="">Select country...</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
            {errors.country && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.country}</p>}
          </div>
          <div>
            <Label htmlFor="state" required>State / Province</Label>
            <select id="state" name="state" value={formData.state} onChange={handleChange} className={getFieldClasses('state')} aria-invalid={!!errors.state}>
              <option value="">Select state...</option>
              <option value="California">California</option>
              <option value="New York">New York</option>
              <option value="Texas">Texas</option>
              <option value="Ontario">Ontario</option>
            </select>
            {errors.state && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.state}</p>}
          </div>
          <div>
            <Label htmlFor="city" required>City</Label>
            <Input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="San Francisco" error={errors.city} aria-invalid={!!errors.city} />
          </div>
        </div>
      </div>

      {/* --- Professional Information --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Professional Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organization" required>Organization</Label>
            <Input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Acme Corp" error={errors.organization} aria-invalid={!!errors.organization} />
          </div>
          <div>
            <Label htmlFor="jobTitle" required>Job Title</Label>
            <Input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Software Engineer" error={errors.jobTitle} aria-invalid={!!errors.jobTitle} />
          </div>
          <div>
            <Label htmlFor="role" required>User Role</Label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={getFieldClasses('role')} aria-invalid={!!errors.role}>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            {errors.role && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.role}</p>}
          </div>
          <div>
            <Label htmlFor="status" required>Account Status</Label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className={getFieldClasses('status')} aria-invalid={!!errors.status}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            {errors.status && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.status}</p>}
          </div>
        </div>
      </div>

      {/* --- Security --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Security</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="password" required={!isEditing}>Password</Label>
            <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" error={errors.password} aria-invalid={!!errors.password} />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" error={errors.confirmPassword} aria-invalid={!!errors.confirmPassword} />
          </div>
        </div>
      </div>

      {/* --- Preferences --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Preferences</h3>
        <div className="flex flex-col space-y-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="emailNotifications" 
              checked={formData.emailNotifications} 
              onChange={handleChange} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-600 rounded cursor-pointer" 
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Receive Email Notifications</span>
          </label>
          <label className="flex items-center space-x-3 cursor-pointer">
            <input 
              type="checkbox" 
              name="twoFactorAuth" 
              checked={formData.twoFactorAuth} 
              onChange={handleChange} 
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:checked:bg-blue-600 rounded cursor-pointer" 
            />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Two-Factor Authentication (2FA)</span>
          </label>
        </div>
      </div>

      {/* --- Additional Information --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Additional Information</h3>
        <div className="w-full">
          <Label htmlFor="notes">Notes</Label>
          <textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleChange} 
            rows="4" 
            className={getFieldClasses('notes')} 
            aria-invalid={!!errors.notes}
            placeholder="Enter any additional notes here..."
          ></textarea>
          {errors.notes && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.notes}</p>}
        </div>
      </div>

      {/* --- Action Buttons --- */}
      <div className="pt-6 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
        {onCancel && (
          <Button type="button" onClick={onCancel} className="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>

    </form>
  );
}
