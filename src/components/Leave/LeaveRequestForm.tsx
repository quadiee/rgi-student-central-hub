
import React, { useState } from 'react';
import { Calendar, Clock, FileText, Send } from 'lucide-react';
import { Button } from '../ui/button';
import { LeaveRequest } from '../../types';
import { useToast } from '../ui/use-toast';

const LeaveRequestForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    courseCode: ''
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Basic validation
    const validationErrors: string[] = [];
    if (!formData.fromDate) validationErrors.push('From date is required');
    if (!formData.toDate) validationErrors.push('To date is required');
    if (!formData.reason || formData.reason.length < 10) {
      validationErrors.push('Reason must be at least 10 characters');
    }
    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      validationErrors.push('From date cannot be after to date');
    }
    
    if (validationErrors.length > 0) {
      setErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    try {
      // Simulate leave request submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });

      // Reset form
      setFormData({
        fromDate: '',
        toDate: '',
        reason: '',
        courseCode: ''
      });
      setErrors([]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit leave request",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors.length > 0) {
      setErrors([]);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="w-5 h-5 text-blue-500" />
        <h3 className="text-lg font-semibold text-gray-800">Request Leave</h3>
      </div>

      {errors.length > 0 && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          {errors.map((error, index) => (
            <p key={index} className="text-red-600 text-sm">{error}</p>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              From Date
            </label>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => handleInputChange('fromDate', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              To Date
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => handleInputChange('toDate', e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Course (Optional)
          </label>
          <select
            value={formData.courseCode}
            onChange={(e) => handleInputChange('courseCode', e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">All Courses</option>
            <option value="CSE301">CSE301 - Data Structures</option>
            <option value="CSE302">CSE302 - Database Management</option>
            <option value="CSE303">CSE303 - Operating Systems</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <FileText className="w-4 h-4 inline mr-1" />
            Reason
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => handleInputChange('reason', e.target.value)}
            placeholder="Please provide a detailed reason for your leave request..."
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
            required
            minLength={10}
          />
          <p className="text-sm text-gray-500 mt-1">
            Minimum 10 characters required
          </p>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700"
          >
            <Send className="w-4 h-4" />
            <span>{isSubmitting ? 'Submitting...' : 'Submit Request'}</span>
          </Button>
        </div>
      </form>
    </div>
  );
};

export default LeaveRequestForm;
