
import React, { useState } from 'react';
import { Download, Calendar, Users, TrendingUp, FileText } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

const ReportGenerator: React.FC = () => {
  const [reportType, setReportType] = useState('attendance');
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  });
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const departments = ['CSE', 'ECE', 'MECH', 'CIVIL', 'EEE'];
  
  const reportTypes = [
    { id: 'attendance', label: 'Attendance Report', icon: Users, description: 'Student attendance summary' },
    { id: 'leave', label: 'Leave Report', icon: Calendar, description: 'Leave requests and approvals' },
    { id: 'performance', label: 'Performance Report', icon: TrendingUp, description: 'Academic performance analysis' },
    { id: 'summary', label: 'Summary Report', icon: FileText, description: 'Comprehensive overview' },
  ];

  const handleGenerateReport = async () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      toast({
        title: "Error",
        description: "Please select both start and end dates",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Success",
        description: `${reportTypes.find(r => r.id === reportType)?.label} generated successfully`,
      });

      // In a real implementation, this would trigger a download
      console.log('Report generated:', {
        type: reportType,
        dateRange,
        department: selectedDepartment
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-6">Generate Reports</h3>

        {/* Report Type Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Select Report Type
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {reportTypes.map((type) => {
              const Icon = type.icon;
              return (
                <div
                  key={type.id}
                  onClick={() => setReportType(type.id)}
                  className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                    reportType === type.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-5 h-5 ${
                      reportType === type.id ? 'text-blue-600' : 'text-gray-600'
                    }`} />
                    <div>
                      <h4 className={`font-medium ${
                        reportType === type.id ? 'text-blue-900' : 'text-gray-900'
                      }`}>
                        {type.label}
                      </h4>
                      <p className={`text-sm ${
                        reportType === type.id ? 'text-blue-700' : 'text-gray-600'
                      }`}>
                        {type.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Start Date
            </label>
            <input
              type="date"
              value={dateRange.startDate}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                startDate: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              End Date
            </label>
            <input
              type="date"
              value={dateRange.endDate}
              onChange={(e) => setDateRange(prev => ({
                ...prev,
                endDate: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Department
            </label>
            <select
              value={selectedDepartment}
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <div className="flex justify-end">
          <Button
            onClick={handleGenerateReport}
            disabled={isGenerating}
            className="flex items-center space-x-2"
          >
            <Download className="w-4 h-4" />
            <span>{isGenerating ? 'Generating...' : 'Generate Report'}</span>
          </Button>
        </div>
      </div>

      {/* Recent Reports */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Reports</h3>
        <div className="space-y-3">
          {[
            { name: 'Attendance Report - CSE', date: '2024-06-20', type: 'PDF' },
            { name: 'Leave Summary - All Departments', date: '2024-06-19', type: 'Excel' },
            { name: 'Performance Analysis - ECE', date: '2024-06-18', type: 'PDF' },
          ].map((report, index) => (
            <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <FileText className="w-5 h-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">{report.name}</p>
                  <p className="text-sm text-gray-600">{report.date} • {report.type}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ReportGenerator;
