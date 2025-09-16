'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { User, Mail, Phone, MessageSquare } from 'lucide-react';

interface ClientFormProps {
  bookingData: any;
  onUpdate: (data: any) => void;
  onNext: () => void;
  isLoading: boolean;
}

interface FormErrors {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
}

export function ClientForm({ bookingData, onUpdate, onNext, isLoading }: ClientFormProps) {
  const [formData, setFormData] = useState({
    clientName: bookingData.clientName || '',
    clientEmail: bookingData.clientEmail || '',
    clientPhone: bookingData.clientPhone || '',
    notes: bookingData.notes || ''
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState({
    clientName: false,
    clientEmail: false,
    clientPhone: false
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    // Basic phone validation - at least 10 digits
    const phoneRegex = /^[\+]?[\d\s\-\(\)]{10,}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
  };

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (!formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }

    if (!formData.clientEmail.trim()) {
      newErrors.clientEmail = 'Email is required';
    } else if (!validateEmail(formData.clientEmail)) {
      newErrors.clientEmail = 'Please enter a valid email address';
    }

    if (!formData.clientPhone.trim()) {
      newErrors.clientPhone = 'Phone number is required';
    } else if (!validatePhone(formData.clientPhone)) {
      newErrors.clientPhone = 'Please enter a valid phone number';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Update parent component
    onUpdate({ ...bookingData, [field]: value });
  };

  const handleBlur = (field: string) => {
    setTouched(prev => ({ ...prev, [field]: true }));

    // Validate individual field on blur
    const newErrors = { ...errors };

    if (field === 'clientName' && !formData.clientName.trim()) {
      newErrors.clientName = 'Name is required';
    }

    if (field === 'clientEmail') {
      if (!formData.clientEmail.trim()) {
        newErrors.clientEmail = 'Email is required';
      } else if (!validateEmail(formData.clientEmail)) {
        newErrors.clientEmail = 'Please enter a valid email address';
      }
    }

    if (field === 'clientPhone') {
      if (!formData.clientPhone.trim()) {
        newErrors.clientPhone = 'Phone number is required';
      } else if (!validatePhone(formData.clientPhone)) {
        newErrors.clientPhone = 'Please enter a valid phone number';
      }
    }

    setErrors(newErrors);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({
      clientName: true,
      clientEmail: true,
      clientPhone: true
    });

    if (validateForm()) {
      onNext();
    }
  };

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const cleaned = value.replace(/\D/g, '');

    // Format as (XXX) XXX-XXXX for US numbers
    if (cleaned.length <= 3) {
      return cleaned;
    } else if (cleaned.length <= 6) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    } else {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6, 10)}`;
    }
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('clientPhone', formatted);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Your Details
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please provide your contact information for the booking.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="clientName" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Full Name *
          </Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="clientName"
              type="text"
              value={formData.clientName}
              onChange={(e) => handleInputChange('clientName', e.target.value)}
              onBlur={() => handleBlur('clientName')}
              placeholder="Enter your full name"
              className={`pl-10 ${
                errors.clientName && touched.clientName
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.clientName && touched.clientName && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.clientName}</p>
          )}
        </div>

        {/* Email Field */}
        <div className="space-y-2">
          <Label htmlFor="clientEmail" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Email Address *
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="clientEmail"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => handleInputChange('clientEmail', e.target.value)}
              onBlur={() => handleBlur('clientEmail')}
              placeholder="your.email@example.com"
              className={`pl-10 ${
                errors.clientEmail && touched.clientEmail
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.clientEmail && touched.clientEmail && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.clientEmail}</p>
          )}
        </div>

        {/* Phone Field */}
        <div className="space-y-2">
          <Label htmlFor="clientPhone" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Phone Number *
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              id="clientPhone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => handlePhoneChange(e.target.value)}
              onBlur={() => handleBlur('clientPhone')}
              placeholder="(555) 123-4567"
              className={`pl-10 ${
                errors.clientPhone && touched.clientPhone
                  ? 'border-red-500 focus:border-red-500 focus:ring-red-500'
                  : 'border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500'
              }`}
              disabled={isLoading}
            />
          </div>
          {errors.clientPhone && touched.clientPhone && (
            <p className="text-sm text-red-600 dark:text-red-400">{errors.clientPhone}</p>
          )}
        </div>

        {/* Notes Field */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Additional Notes (Optional)
          </Label>
          <div className="relative">
            <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Anything specific you'd like to mention about this session?"
              rows={4}
              className="pl-10 resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Optional: Share any specific requirements, questions, or preferences for your session.
          </p>
        </div>

        {/* Form Footer */}
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                'Continue'
              )}
            </Button>
          </div>

          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
            By continuing, you agree to share your contact information for booking purposes.
          </p>
        </div>
      </form>
    </div>
  );
}
