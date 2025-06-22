
import React, { useState } from 'react';
import { Calendar, FileText, Send, Upload } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

const MobileLeaveForm: React.FC = () => {
  const [formData, setFormData] = useState({
    fromDate: '',
    toDate: '',
    reason: '',
    courseCode: '',
    attachment: null as File | null
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.fromDate || !formData.toDate || !formData.reason) {
      toast({
        title: "Error",
        description: "Please fill all required fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast({
        title: "Success",
        description: "Leave request submitted successfully",
      });
      setFormData({
        fromDate: '',
        toDate: '',
        reason: '',
        courseCode: '',
        attachment: null
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
      setFormData(prev => ({ ...prev, attachment: file }));
    } else {
      toast({
        title: "Error",
        description: "File size should be less than 5MB",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center space-x-2 mb-6">
        <FileText className="w-6 h-6 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-800">Request Leave</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              From Date *
            </label>
            <input
              type="date"
              value={formData.fromDate}
              onChange={(e) => setFormData(prev => ({ ...prev, fromDate: e.target.value }))}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Calendar className="w-4 h-4 inline mr-1" />
              To Date *
            </label>
            <input
              type="date"
              value={formData.toDate}
              onChange={(e) => setFormData(prev => ({ ...prev, toDate: e.target.value }))}
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
            onChange={(e) => setFormData(prev => ({ ...prev, courseCode: e.target.value }))}
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
            Reason *
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="w-4 h-4 inline mr-1" />
            Attachment (Optional)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
              <p className="text-sm text-gray-600">
                {formData.attachment ? formData.attachment.name : 'Tap to upload document'}
              </p>
              <p className="text-xs text-gray-500">PDF, JPG, PNG (Max 5MB)</p>
            </label>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg"
        >
          <Send className="w-5 h-5 mr-2" />
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
    </div>
  );
};

export default MobileLeaveForm;
