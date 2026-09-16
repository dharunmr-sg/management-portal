import { useState, useEffect } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isRequired, isValidEmail } from '../../utils/validators';

// Helper component for accessible required labels
const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
    {children} {required && <span aria-hidden="true" className="text-red-500 ml-0.5">*</span>}
    {required && <span className="sr-only">required</span>}
  </label>
);

export default function OrganizationForm({ initialValues, onSubmit, onCancel }) {
  // 1. Initialize our form state with the exact fields we need
  const [formData, setFormData] = useState({
    organizationName: '',
    organizationCode: '',
    organizationType: '',
    industry: '',
    ownerName: '',
    ownerEmail: '',
    contactNumber: '',
    alternateContactNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    country: '',
    postalCode: '',
    website: '',
    subscriptionPlan: '',
    status: 'Active',
    description: '',
    ...initialValues // Override with any passed-in values (for Edit mode)
  });

  // 2. Track validation errors for every field
  const [errors, setErrors] = useState({});

  // 3. Centralized change handler that automatically clears errors when the user types!
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    // If there was an error for this field, clear it immediately
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null
      }));
    }
  };

  // 4. Validate the entire form before saving
  const validateForm = () => {
    const newErrors = {};

    if (!isRequired(formData.organizationName)) newErrors.organizationName = "Organization Name is required";
    if (!isRequired(formData.organizationCode)) newErrors.organizationCode = "Organization Code is required";
    if (!isRequired(formData.organizationType)) newErrors.organizationType = "Organization Type is required";
    if (!isRequired(formData.ownerName)) newErrors.ownerName = "Owner Name is required";
    if (!isRequired(formData.ownerEmail)) {
      newErrors.ownerEmail = "Owner Email is required";
    } else if (!isValidEmail(formData.ownerEmail)) {
      newErrors.ownerEmail = "Please enter a valid email address";
    }
    if (!isRequired(formData.contactNumber)) newErrors.contactNumber = "Contact Number is required";
    if (!isRequired(formData.city)) newErrors.city = "City is required";
    if (!isRequired(formData.country)) newErrors.country = "Country is required";
    if (!isRequired(formData.subscriptionPlan)) newErrors.subscriptionPlan = "Subscription Plan is required";

    setErrors(newErrors);
    
    // Return true if the newErrors object has absolutely no keys (meaning 0 errors!)
    return Object.keys(newErrors).length === 0;
  };

  // 5. Handle form submission safely
  const handleSubmit = (e) => {
    e.preventDefault(); // Stop the browser from refreshing the page!

    if (validateForm()) {
      onSubmit(formData);
    }
  };

  // Reusable tailwind classes for select and textarea elements to match Input.jsx
  const inputStyles = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const defaultBorder = "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const errorBorder = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      
      {/* ------------------------------------------- */}
      {/* SECTION 1: Core Organization Info           */}
      {/* ------------------------------------------- */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Organization Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="organizationName" required>Organization Name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              placeholder="Acme Corp"
              value={formData.organizationName}
              onChange={handleChange}
              error={errors.organizationName}
            />
          </div>
          <div>
            <Label htmlFor="organizationCode" required>Organization Code</Label>
            <Input
              id="organizationCode"
              name="organizationCode"
              placeholder="ACM-001"
              value={formData.organizationCode}
              onChange={handleChange}
              error={errors.organizationCode}
            />
          </div>
          <div>
            <Label htmlFor="organizationType" required>Organization Type</Label>
            <select
              id="organizationType"
              name="organizationType"
              value={formData.organizationType}
              onChange={handleChange}
              className={`${inputStyles} ${errors.organizationType ? errorBorder : defaultBorder}`}
            >
              <option value="">Select Type...</option>
              <option value="Educational">Educational</option>
              <option value="Corporate">Corporate</option>
              <option value="Training Center">Training Center</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Government">Government</option>
              <option value="Startup">Startup</option>
            </select>
            {errors.organizationType && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.organizationType}</p>}
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="Technology"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 2: Owner & Contact                  */}
      {/* ------------------------------------------- */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Primary Contact
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="ownerName" required>Owner Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              placeholder="Jane Doe"
              value={formData.ownerName}
              onChange={handleChange}
              error={errors.ownerName}
            />
          </div>
          <div>
            <Label htmlFor="ownerEmail" required>Owner Email</Label>
            <Input
              id="ownerEmail"
              type="email"
              name="ownerEmail"
              placeholder="jane@example.com"
              value={formData.ownerEmail}
              onChange={handleChange}
              error={errors.ownerEmail}
            />
          </div>
          <div>
            <Label htmlFor="contactNumber" required>Contact Number</Label>
            <Input
              id="contactNumber"
              name="contactNumber"
              placeholder="+1 (555) 123-4567"
              value={formData.contactNumber}
              onChange={handleChange}
              error={errors.contactNumber}
            />
          </div>
          <div>
            <Label htmlFor="alternateContactNumber">Alternate Contact</Label>
            <Input
              id="alternateContactNumber"
              name="alternateContactNumber"
              placeholder="+1 (555) 987-6543"
              value={formData.alternateContactNumber}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 3: Location                         */}
      {/* ------------------------------------------- */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Location
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="123 Innovation Drive"
              value={formData.addressLine1}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              placeholder="Suite 500"
              value={formData.addressLine2}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="city" required>City</Label>
            <Input
              id="city"
              name="city"
              placeholder="San Francisco"
              value={formData.city}
              onChange={handleChange}
              error={errors.city}
            />
          </div>
          <div>
            <Label htmlFor="state">State / Province</Label>
            <Input
              id="state"
              name="state"
              placeholder="CA"
              value={formData.state}
              onChange={handleChange}
            />
          </div>
          <div>
            <Label htmlFor="country" required>Country</Label>
            <Input
              id="country"
              name="country"
              placeholder="United States"
              value={formData.country}
              onChange={handleChange}
              error={errors.country}
            />
          </div>
          <div>
            <Label htmlFor="postalCode">Postal Code</Label>
            <Input
              id="postalCode"
              name="postalCode"
              placeholder="94103"
              value={formData.postalCode}
              onChange={handleChange}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 4: Settings                         */}
      {/* ------------------------------------------- */}
      <div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white uppercase tracking-wider mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">
          Settings & Additional Info
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="subscriptionPlan" required>Subscription Plan</Label>
            <select
              id="subscriptionPlan"
              name="subscriptionPlan"
              value={formData.subscriptionPlan}
              onChange={handleChange}
              className={`${inputStyles} ${errors.subscriptionPlan ? errorBorder : defaultBorder}`}
            >
              <option value="">Select Plan...</option>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Business">Business</option>
              <option value="Enterprise">Enterprise</option>
            </select>
            {errors.subscriptionPlan && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.subscriptionPlan}</p>}
          </div>
          <div>
            <Label htmlFor="status" required>Status</Label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputStyles} ${defaultBorder}`}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={3}
              placeholder="Enter a brief description of the organization..."
              value={formData.description}
              onChange={handleChange}
              className={`${inputStyles} ${defaultBorder}`}
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* FORM CONTROLS                               */}
      {/* ------------------------------------------- */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
        >
          Save Organization
        </Button>
      </div>
      
    </form>
  );
}