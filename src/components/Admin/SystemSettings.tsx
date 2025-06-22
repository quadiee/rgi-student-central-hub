
import React, { useState, useEffect } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';

interface SystemSettings {
  attendanceThreshold: number;
  semesterStartDate: string;
  semesterEndDate: string;
  hoursPerDay: number;
  workingDays: string[];
  emailDomain: string;
  autoNotifications: boolean;
  leaveApprovalWorkflow: boolean;
}

const SystemSettings: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings>({
    attendanceThreshold: 75,
    semesterStartDate: '2024-08-01',
    semesterEndDate: '2024-12-15',
    hoursPerDay: 8,
    workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
    emailDomain: '@rgce.edu.in',
    autoNotifications: true,
    leaveApprovalWorkflow: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const workingDaysOptions = [
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'
  ];

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      // In a real implementation, this would save to the database
      await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call
      
      toast({
        title: "Success",
        description: "System settings saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save system settings",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetSettings = () => {
    setSettings({
      attendanceThreshold: 75,
      semesterStartDate: '2024-08-01',
      semesterEndDate: '2024-12-15',
      hoursPerDay: 8,
      workingDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      emailDomain: '@rgce.edu.in',
      autoNotifications: true,
      leaveApprovalWorkflow: true,
    });
    toast({
      title: "Settings Reset",
      description: "Settings have been reset to default values",
    });
  };

  const handleWorkingDayChange = (day: string, checked: boolean) => {
    if (checked) {
      setSettings(prev => ({
        ...prev,
        workingDays: [...prev.workingDays, day]
      }));
    } else {
      setSettings(prev => ({
        ...prev,
        workingDays: prev.workingDays.filter(d => d !== day)
      }));
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-800">System Settings</h3>
        <div className="flex space-x-3">
          <Button
            variant="outline"
            onClick={handleResetSettings}
            className="flex items-center space-x-2"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reset</span>
          </Button>
          <Button
            onClick={handleSaveSettings}
            disabled={isLoading}
            className="flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>{isLoading ? 'Saving...' : 'Save Settings'}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Attendance Settings */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">Attendance Settings</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendance Threshold (%)
            </label>
            <input
              type="number"
              min="50"
              max="100"
              value={settings.attendanceThreshold}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                attendanceThreshold: parseInt(e.target.value) || 75
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Students below this percentage will be marked as at-risk
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hours per Day
            </label>
            <input
              type="number"
              min="1"
              max="12"
              value={settings.hoursPerDay}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                hoursPerDay: parseInt(e.target.value) || 8
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Academic Calendar */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">Academic Calendar</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester Start Date
            </label>
            <input
              type="date"
              value={settings.semesterStartDate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                semesterStartDate: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Semester End Date
            </label>
            <input
              type="date"
              value={settings.semesterEndDate}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                semesterEndDate: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Working Days */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">Working Days</h4>
          <div className="grid grid-cols-2 gap-2">
            {workingDaysOptions.map(day => (
              <label key={day} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={settings.workingDays.includes(day)}
                  onChange={(e) => handleWorkingDayChange(day, e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">{day}</span>
              </label>
            ))}
          </div>
        </div>

        {/* System Configuration */}
        <div className="space-y-4">
          <h4 className="text-md font-medium text-gray-700 border-b pb-2">System Configuration</h4>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Domain
            </label>
            <input
              type="text"
              value={settings.emailDomain}
              onChange={(e) => setSettings(prev => ({
                ...prev,
                emailDomain: e.target.value
              }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="space-y-3">
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.autoNotifications}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  autoNotifications: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Auto Notifications</span>
            </label>

            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={settings.leaveApprovalWorkflow}
                onChange={(e) => setSettings(prev => ({
                  ...prev,
                  leaveApprovalWorkflow: e.target.checked
                }))}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Enable Leave Approval Workflow</span>
            </label>
          </div>
        </div>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h5 className="text-sm font-medium text-blue-800 mb-2">Settings Summary</h5>
        <div className="text-sm text-blue-700 space-y-1">
          <p>• Attendance threshold: {settings.attendanceThreshold}%</p>
          <p>• Working days: {settings.workingDays.length} days per week</p>
          <p>• Semester: {settings.semesterStartDate} to {settings.semesterEndDate}</p>
          <p>• Auto notifications: {settings.autoNotifications ? 'Enabled' : 'Disabled'}</p>
        </div>
      </div>
    </div>
  );
};

export default SystemSettings;
