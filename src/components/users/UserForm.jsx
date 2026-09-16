import { useState } from 'react';
import Button from '../ui/Button';
import Input from '../ui/Input';

// Import pure, reusable validation functions
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
  <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 truncate">
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

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] : value
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.firstName)) newErrors.firstName = 'First name is required';
    else if (!isValidName(formData.firstName)) newErrors.firstName = 'Invalid characters';

    if (!isRequired(formData.lastName)) newErrors.lastName = 'Last name is required';
    else if (!isValidName(formData.lastName)) newErrors.lastName = 'Invalid characters';

    if (!isRequired(formData.username)) newErrors.username = 'Username is required';
    else if (!isValidUsername(formData.username)) newErrors.username = 'Invalid username format';

    if (!isRequired(formData.email)) newErrors.email = 'Email is required';
    else if (!isValidEmail(formData.email)) newErrors.email = 'Invalid email';

    if (!isRequired(formData.phone)) newErrors.phone = 'Phone number is required';
    else if (!isValidPhone(formData.phone)) newErrors.phone = 'Invalid phone';

    if (!isRequired(formData.country)) newErrors.country = 'Country is required';
    if (!isRequired(formData.state)) newErrors.state = 'State is required';
    if (!isRequired(formData.city)) newErrors.city = 'City is required';
    
    if (!isRequired(formData.organization)) newErrors.organization = 'Organization is required';
    if (!isRequired(formData.jobTitle)) newErrors.jobTitle = 'Job title is required';
    if (!isRequired(formData.role)) newErrors.role = 'Role is required';
    if (!isRequired(formData.status)) newErrors.status = 'Status is required';

    const isEditing = !!initialValues.username;
    
    if (!isEditing || formData.password.length > 0) {
      if (!isEditing && !isRequired(formData.password)) {
        newErrors.password = 'Password is required';
      } else if (!isValidPassword(formData.password)) {
        newErrors.password = 'Min 8 chars, 1 letter & 1 number';
      }

      if (!passwordsMatch(formData.password, formData.confirmPassword)) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault(); 
    const isValid = validateForm();
    if (!isValid) return;

    if (onSubmit) {
      onSubmit(formData); 
    }
  };

  const getFieldClasses = (fieldName) => {
    const base = "w-full px-2.5 py-1.5 text-xs sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-200 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
    const state = errors[fieldName] 
      ? "border-red-500 focus:ring-red-500 focus:border-red-500" 
      : "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
    return `${base} ${state}`;
  };

  const isEditing = !!initialValues.username;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {/* Section 1: Personal Information */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Personal Information
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <Label htmlFor="firstName" required>First Name</Label>
            <Input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} placeholder="Jane" error={errors.firstName} aria-invalid={!!errors.firstName} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="lastName" required>Last Name</Label>
            <Input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} placeholder="Doe" error={errors.lastName} aria-invalid={!!errors.lastName} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="username" required>Username</Label>
            <Input type="text" id="username" name="username" value={formData.username} onChange={handleChange} placeholder="janedoe99" error={errors.username} aria-invalid={!!errors.username} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="email" required>Email</Label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="jane@example.com" error={errors.email} aria-invalid={!!errors.email} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="phone" required>Phone Number</Label>
            <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} placeholder="(555) 123-4567" error={errors.phone} aria-invalid={!!errors.phone} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="dob">Date of Birth</Label>
            <Input type="date" id="dob" name="dob" value={formData.dob} onChange={handleChange} error={errors.dob} aria-invalid={!!errors.dob} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
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
            {errors.gender && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.gender}</p>}
          </div>
          <div>
            <Label htmlFor="profilePhoto">Profile Photo</Label>
            <input 
              type="file" 
              id="profilePhoto" 
              name="profilePhoto" 
              onChange={handleChange} 
              className="w-full text-xs text-gray-500 dark:text-gray-400 file:mr-2 file:py-1 file:px-2.5 file:rounded file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/30 dark:file:text-blue-400 transition-colors" 
              accept="image/*" 
            />
          </div>
        </div>
      </div>

      {/* Section 2: Professional & Location */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Professional & Location
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <Label htmlFor="organization" required>Organization</Label>
            <Input type="text" id="organization" name="organization" value={formData.organization} onChange={handleChange} placeholder="Acme Corp" error={errors.organization} aria-invalid={!!errors.organization} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="jobTitle" required>Job Title</Label>
            <Input type="text" id="jobTitle" name="jobTitle" value={formData.jobTitle} onChange={handleChange} placeholder="Software Engineer" error={errors.jobTitle} aria-invalid={!!errors.jobTitle} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="role" required>User Role</Label>
            <select id="role" name="role" value={formData.role} onChange={handleChange} className={getFieldClasses('role')} aria-invalid={!!errors.role}>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="Editor">Editor</option>
              <option value="Viewer">Viewer</option>
            </select>
            {errors.role && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.role}</p>}
          </div>
          <div>
            <Label htmlFor="status" required>Account Status</Label>
            <select id="status" name="status" value={formData.status} onChange={handleChange} className={getFieldClasses('status')} aria-invalid={!!errors.status}>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
            </select>
            {errors.status && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.status}</p>}
          </div>
          <div>
            <Label htmlFor="country" required>Country</Label>
            <select id="country" name="country" value={formData.country} onChange={handleChange} className={getFieldClasses('country')} aria-invalid={!!errors.country}>
              <option value="">Select country...</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
            </select>
            {errors.country && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.country}</p>}
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
            {errors.state && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.state}</p>}
          </div>
          <div className="sm:col-span-2 lg:col-span-2">
            <Label htmlFor="city" required>City</Label>
            <Input type="text" id="city" name="city" value={formData.city} onChange={handleChange} placeholder="San Francisco" error={errors.city} aria-invalid={!!errors.city} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
        </div>
      </div>

      {/* Section 3: Security & Notes */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Security & Details
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2 items-start">
          <div>
            <Label htmlFor="password" required={!isEditing}>Password</Label>
            <Input type="password" id="password" name="password" value={formData.password} onChange={handleChange} placeholder="********" error={errors.password} aria-invalid={!!errors.password} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input type="password" id="confirmPassword" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} placeholder="********" error={errors.confirmPassword} aria-invalid={!!errors.confirmPassword} className="!py-1.5 !px-2.5 text-xs sm:text-sm" />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <textarea 
              id="notes" 
              name="notes" 
              value={formData.notes} 
              onChange={handleChange} 
              rows={1} 
              className={getFieldClasses('notes')} 
              aria-invalid={!!errors.notes}
              placeholder="Any additional notes..."
            ></textarea>
            {errors.notes && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.notes}</p>}
          </div>
          <div className="pt-3.5 space-y-1">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="emailNotifications" 
                checked={formData.emailNotifications} 
                onChange={handleChange} 
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded cursor-pointer" 
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Email Notifications</span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input 
                type="checkbox" 
                name="twoFactorAuth" 
                checked={formData.twoFactorAuth} 
                onChange={handleChange} 
                className="h-3.5 w-3.5 text-blue-600 focus:ring-blue-500 border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded cursor-pointer" 
              />
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300">Enable 2FA</span>
            </label>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-2.5 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-end gap-2.5">
        {onCancel && (
          <Button type="button" onClick={onCancel} className="w-full sm:w-auto text-xs sm:text-sm py-1.5 px-4 bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto text-xs sm:text-sm py-1.5 px-4">
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}
