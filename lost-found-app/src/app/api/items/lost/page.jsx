'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Search, 
  MapPin, 
  Calendar, 
  Tag, 
  FileText, 
  Image as ImageIcon, 
  DollarSign, 
  Phone,
  ChevronLeft,
  ChevronRight,
  Check,
  AlertCircle,
  Package,
  X
} from 'lucide-react';

export default function ReportLostItemPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form data
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    locationLost: '',
    locationDetails: '',
    dateLost: '',
    color: '',
    brand: '',
    distinguishingFeatures: '',
    contactInfo: '',
    rewardAmount: '',
    tags: [],
    images: [] // Will store base64 strings
  });

  const [imagePreviews, setImagePreviews] = useState([]); // For displaying previews
  const [currentTag, setCurrentTag] = useState('');

  // Categories
  const categories = [
    { value: 'electronics', label: 'Electronics', icon: '📱', color: 'bg-blue-100 text-blue-700 border-blue-300' },
    { value: 'documents', label: 'Documents', icon: '📄', color: 'bg-green-100 text-green-700 border-green-300' },
    { value: 'keys', label: 'Keys', icon: '🔑', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
    { value: 'bags', label: 'Bags & Luggage', icon: '🎒', color: 'bg-purple-100 text-purple-700 border-purple-300' },
    { value: 'clothing', label: 'Clothing', icon: '👕', color: 'bg-pink-100 text-pink-700 border-pink-300' },
    { value: 'accessories', label: 'Accessories', icon: '⌚', color: 'bg-indigo-100 text-indigo-700 border-indigo-300' },
    { value: 'books', label: 'Books', icon: '📚', color: 'bg-red-100 text-red-700 border-red-300' },
    { value: 'jewelry', label: 'Jewelry', icon: '💍', color: 'bg-amber-100 text-amber-700 border-amber-300' },
    { value: 'sports', label: 'Sports Equipment', icon: '⚽', color: 'bg-lime-100 text-lime-700 border-lime-300' },
    { value: 'other', label: 'Other', icon: '📦', color: 'bg-gray-100 text-gray-700 border-gray-300' }
  ];

  // Update form data
  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add tag
  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      updateFormData('tags', [...formData.tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  // Remove tag
  const removeTag = (tagToRemove) => {
    updateFormData('tags', formData.tags.filter(tag => tag !== tagToRemove));
  };

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Handle image upload with base64 conversion
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    
    if (formData.images.length + files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }

    const newImages = [];
    const newPreviews = [];

    for (const file of files) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError(`${file.name} is not an image`);
        continue;
      }

      // Validate file size (10MB)
      if (file.size > 10 * 1024 * 1024) {
        setError(`${file.name} exceeds 10MB limit`);
        continue;
      }

      try {
        // Convert to base64
        const base64 = await fileToBase64(file);
        newImages.push(base64);
        newPreviews.push(base64); // Use base64 for preview
      } catch (err) {
        console.error('Error converting image:', err);
        setError(`Failed to process ${file.name}`);
      }
    }

    // Update state with new images
    updateFormData('images', [...formData.images, ...newImages]);
    setImagePreviews([...imagePreviews, ...newPreviews]);
  };

  // Remove image
  const removeImage = (indexToRemove) => {
    updateFormData('images', formData.images.filter((_, index) => index !== indexToRemove));
    setImagePreviews(imagePreviews.filter((_, index) => index !== indexToRemove));
  };

  // Validate step
  const validateStep = () => {
    switch (step) {
      case 1:
        if (!formData.title.trim()) {
          setError('Please enter an item title');
          return false;
        }
        if (!formData.category) {
          setError('Please select a category');
          return false;
        }
        break;
      case 2:
        if (!formData.description.trim()) {
          setError('Please provide a description');
          return false;
        }
        break;
      case 3:
        if (!formData.locationLost.trim()) {
          setError('Please specify where you lost the item');
          return false;
        }
        if (!formData.dateLost) {
          setError('Please select the date you lost the item');
          return false;
        }
        break;
    }
    setError('');
    return true;
  };

  // Next step
  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  // Previous step
  const prevStep = () => {
    setError('');
    setStep(step - 1);
  };

  // Submit form
  const handleSubmit = async () => {
    if (!validateStep()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          status: 'lost',
          itemStatus: 'active'
        })
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to report item');
        setLoading(false);
        return;
      }

      // Success - redirect to item details or dashboard
      router.push(`/items/${data.item.id}`);

    } catch (err) {
      console.error('Submit error:', err);
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-orange-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/dashboard" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-r from-red-600 to-orange-600 p-2 rounded-xl group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-800">Lost & Found</h1>
            </Link>
            <Link 
              href="/dashboard"
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              Cancel
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="bg-gradient-to-r from-red-600 to-orange-600 p-4 rounded-2xl">
              <Search className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3">Report Lost Item</h1>
          <p className="text-gray-600 text-lg">
            Help us help you find your lost belongings. Fill out the details below.
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3, 4].map((num) => (
              <div key={num} className="flex items-center">
                <div className={`
                  w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all
                  ${step >= num 
                    ? 'bg-gradient-to-r from-red-600 to-orange-600 text-white scale-110' 
                    : 'bg-gray-200 text-gray-500'}
                `}>
                  {step > num ? <Check className="w-6 h-6" /> : num}
                </div>
                {num < 4 && (
                  <div className={`
                    h-1 w-16 md:w-32 mx-2 transition-all
                    ${step > num ? 'bg-gradient-to-r from-red-600 to-orange-600' : 'bg-gray-200'}
                  `} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600">
            <span>Basic Info</span>
            <span>Description</span>
            <span>Location</span>
            <span>Additional</span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-3xl shadow-xl p-8 md:p-12 border border-gray-100">
          {/* Error Message */}
          {error && (
            <div className="mb-6 flex items-center gap-3 text-red-600 bg-red-50 p-4 rounded-2xl border-2 border-red-200">
              <AlertCircle className="w-6 h-6 flex-shrink-0" />
              <span className="text-sm font-medium">{error}</span>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Basic Information</h2>

              {/* Item Title */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  What did you lose? *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => updateFormData('title', e.target.value)}
                  placeholder="e.g., Black iPhone 13, Blue Backpack, Silver Watch"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-lg text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-3">
                  Category *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {categories.map((cat) => (
                    <button
                      key={cat.value}
                      type="button"
                      onClick={() => updateFormData('category', cat.value)}
                      className={`
                        p-4 rounded-xl border-2 transition-all transform hover:scale-105 text-left
                        ${formData.category === cat.value 
                          ? `${cat.color} border-current shadow-lg scale-105` 
                          : 'bg-white border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-3xl">{cat.icon}</span>
                        <span className="font-semibold text-sm">{cat.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Color & Brand */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Color
                  </label>
                  <input
                    type="text"
                    value={formData.color}
                    onChange={(e) => updateFormData('color', e.target.value)}
                    placeholder="e.g., Black, Blue, Red"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => updateFormData('brand', e.target.value)}
                    placeholder="e.g., Apple, Nike, Samsung"
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Description */}
          {step === 2 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Detailed Description</h2>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Describe your item in detail *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateFormData('description', e.target.value)}
                  rows={6}
                  placeholder="Provide as much detail as possible. Include size, unique features, condition, etc."
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-lg resize-none text-gray-900 placeholder-gray-400"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {formData.description.length} characters
                </p>
              </div>

              {/* Distinguishing Features */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Distinguishing Features
                </label>
                <textarea
                  value={formData.distinguishingFeatures}
                  onChange={(e) => updateFormData('distinguishingFeatures', e.target.value)}
                  rows={3}
                  placeholder="Any scratches, stickers, unique marks, or modifications?"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Tags (Keywords)
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                    placeholder="Add keywords (press Enter)"
                    className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium"
                  >
                    Add
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-100 text-red-700 rounded-full text-sm font-medium"
                    >
                      {tag}
                      <button
                        onClick={() => removeTag(tag)}
                        className="hover:bg-red-200 rounded-full p-1 transition-colors"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Location & Date */}
          {step === 3 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Where & When</h2>

              {/* Location */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-red-600" />
                  Where did you lose it? *
                </label>
                <input
                  type="text"
                  value={formData.locationLost}
                  onChange={(e) => updateFormData('locationLost', e.target.value)}
                  placeholder="e.g., Library Building, Cafeteria, Parking Lot B"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-lg text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Location Details */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Additional Location Details
                </label>
                <textarea
                  value={formData.locationDetails}
                  onChange={(e) => updateFormData('locationDetails', e.target.value)}
                  rows={3}
                  placeholder="Provide more specific details about the location"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all resize-none"
                />
              </div>

              {/* Date Lost */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-red-600" />
                  When did you lose it? *
                </label>
                <input
                  type="date"
                  value={formData.dateLost}
                  onChange={(e) => updateFormData('dateLost', e.target.value)}
                  max={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Step 4: Additional Info */}
          {step === 4 && (
            <div className="space-y-6 animate-fadeIn">
              <h2 className="text-2xl font-bold text-gray-800 mb-6">Additional Information</h2>

              {/* Images */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-red-600" />
                  Upload Photos (Optional)
                </label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-red-500 transition-colors">
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                    disabled={formData.images.length >= 5}
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 font-medium">Click to upload images</p>
                    <p className="text-sm text-gray-500 mt-1">PNG, JPG up to 10MB each (Max 5 images)</p>
                    <p className="text-sm text-gray-600 font-medium mt-2">
                      {formData.images.length}/5 images uploaded
                    </p>
                  </label>
                </div>

                {imagePreviews.length > 0 && (
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    {imagePreviews.map((img, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={img}
                          alt={`Upload ${index + 1}`}
                          className="w-full h-32 object-cover rounded-xl"
                        />
                        <button
                          type="button"
                          onClick={() => removeImage(index)}
                          className="absolute top-2 right-2 bg-red-600 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Contact Info */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-red-600" />
                  Contact Information
                </label>
                <input
                  type="text"
                  value={formData.contactInfo}
                  onChange={(e) => updateFormData('contactInfo', e.target.value)}
                  placeholder="Phone number or preferred contact method"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-gray-900 placeholder-gray-400"
                />
              </div>

              {/* Reward */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-red-600" />
                  Reward Amount (Optional)
                </label>
                <input
                  type="number"
                  value={formData.rewardAmount}
                  onChange={(e) => updateFormData('rewardAmount', e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-100 focus:outline-none transition-all text-lg text-gray-900 placeholder-gray-400"
                />
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-10 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={prevStep}
              disabled={step === 1}
              className="px-6 py-3 text-gray-600 hover:text-gray-800 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ChevronLeft className="w-5 h-5" />
              Previous
            </button>

            {step < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Next Step
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl hover:from-red-700 hover:to-orange-700 transition-all font-bold flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Check className="w-5 h-5" />
                    Report Lost Item
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
