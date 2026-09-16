import { useState } from 'react';
import Input from '../ui/Input';
import Button from '../ui/Button';
import { isRequired, isValidEmail } from '../../utils/validators';

// Helper component for accessible required labels
const Label = ({ htmlFor, children, required }) => (
  <label htmlFor={htmlFor} className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-0.5 truncate">
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
  const inputStyles = "w-full !px-2.5 !py-1.5 text-xs sm:text-sm border rounded-md shadow-sm focus:outline-none focus:ring-2 transition-colors duration-300 ease-in-out bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500";
  const defaultBorder = "border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500";
  const errorBorder = "border-red-500 focus:ring-red-500 focus:border-red-500";

  return (
    <form onSubmit={handleSubmit} className="space-y-2.5">
      
      {/* ------------------------------------------- */}
      {/* SECTION 1: Core Organization Info           */}
      {/* ------------------------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Organization Details
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <Label htmlFor="organizationName" required>Organization Name</Label>
            <Input
              id="organizationName"
              name="organizationName"
              placeholder="Acme Corp"
              value={formData.organizationName}
              onChange={handleChange}
              error={errors.organizationName}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
            {errors.organizationType && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.organizationType}</p>}
          </div>
          <div>
            <Label htmlFor="industry">Industry</Label>
            <Input
              id="industry"
              name="industry"
              placeholder="Technology"
              value={formData.industry}
              onChange={handleChange}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 2: Owner & Contact                  */}
      {/* ------------------------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Primary Contact
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div>
            <Label htmlFor="ownerName" required>Owner Name</Label>
            <Input
              id="ownerName"
              name="ownerName"
              placeholder="Jane Doe"
              value={formData.ownerName}
              onChange={handleChange}
              error={errors.ownerName}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 3: Location                         */}
      {/* ------------------------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Location
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
          <div className="sm:col-span-2">
            <Label htmlFor="addressLine1">Address Line 1</Label>
            <Input
              id="addressLine1"
              name="addressLine1"
              placeholder="123 Innovation Drive"
              value={formData.addressLine1}
              onChange={handleChange}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
            />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="addressLine2">Address Line 2</Label>
            <Input
              id="addressLine2"
              name="addressLine2"
              placeholder="Suite 500"
              value={formData.addressLine2}
              onChange={handleChange}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
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
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
            />
          </div>
        </div>
      </div>

      {/* ------------------------------------------- */}
      {/* SECTION 4: Settings & Description           */}
      {/* ------------------------------------------- */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
            Subscription & Details
          </span>
          <div className="h-px bg-gray-200 dark:bg-gray-700 flex-1"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-3 gap-y-2">
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
            {errors.subscriptionPlan && <p className="mt-0.5 text-xs text-red-600 dark:text-red-400">{errors.subscriptionPlan}</p>}
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
          <div className="sm:col-span-2">
            <Label htmlFor="website">Website</Label>
            <Input
              id="website"
              name="website"
              type="url"
              placeholder="https://example.com"
              value={formData.website}
              onChange={handleChange}
              className="!py-1.5 !px-2.5 text-xs sm:text-sm"
            />
          </div>
          <div className="col-span-1 sm:col-span-2 lg:col-span-4">
            <Label htmlFor="description">Description</Label>
            <textarea
              id="description"
              name="description"
              rows={2}
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
      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-3 border-t border-gray-200 dark:border-gray-700 -mx-5 sm:-mx-6 px-5 sm:px-6 mt-3 bg-white dark:bg-gray-800">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          className="w-full sm:w-auto !py-1.5 !px-4 text-xs sm:text-sm"
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          variant="primary"
          className="w-full sm:w-auto !py-1.5 !px-4 text-xs sm:text-sm shadow-sm"
        >
          Save Organization
        </Button>
      </div>
      
    </form>
  );
}