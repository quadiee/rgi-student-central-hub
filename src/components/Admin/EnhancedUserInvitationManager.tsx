import React, { useState, useEffect } from 'react';
import { Mail, Upload, Users, Send, Download, AlertCircle } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface BulkInvitation {
  email: string;
  role: string;
  department: string;
  name?: string;
  rollNumber?: string;
  employeeId?: string;
}

interface Department {
  id: string;
  name: string;
  code: string;
}

const EnhancedUserInvitationManager: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [invitations, setInvitations] = useState<BulkInvitation[]>([]);
  const [csvData, setCsvData] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setDepartments(data || []);
    } catch (error) {
      console.error('Error loading departments:', error);
    }
  };

  const downloadTemplate = () => {
    const csvContent = `email,role,department,name,rollNumber,employeeId
student1@example.com,student,CSE,John Doe,CS001,
hod1@example.com,hod,CSE,Jane Smith,,EMP001
faculty1@example.com,faculty,ECE,Bob Johnson,,EMP002`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'invitation_template.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const parseCsvData = () => {
    if (!csvData.trim()) {
      toast({
        title: "Error",
        description: "Please paste CSV data",
        variant: "destructive"
      });
      return;
    }

    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      
      const requiredHeaders = ['email', 'role', 'department'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        toast({
          title: "Error",
          description: `Missing required columns: ${missingHeaders.join(', ')}`,
          variant: "destructive"
        });
        return;
      }

      const parsedInvitations: BulkInvitation[] = [];
      
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const invitation: BulkInvitation = {
          email: '',
          role: '',
          department: ''
        };
        
        headers.forEach((header, index) => {
          const value = values[index] || '';
          switch (header) {
            case 'email':
              invitation.email = value;
              break;
            case 'role':
              invitation.role = value;
              break;
            case 'department':
              invitation.department = value;
              break;
            case 'name':
              invitation.name = value;
              break;
            case 'rollNumber':
              invitation.rollNumber = value;
              break;
            case 'employeeId':
              invitation.employeeId = value;
              break;
          }
        });
        
        if (invitation.email && invitation.role && invitation.department) {
          parsedInvitations.push(invitation);
        }
      }
      
      setInvitations(parsedInvitations);
      
      toast({
        title: "Success",
        description: `Parsed ${parsedInvitations.length} invitations from CSV`,
      });
    } catch (error) {
      console.error('Error parsing CSV:', error);
      toast({
        title: "Error",
        description: "Failed to parse CSV data. Please check the format.",
        variant: "destructive"
      });
    }
  };

  const sendBulkInvitations = async () => {
    if (invitations.length === 0) {
      toast({
        title: "Error",
        description: "No invitations to send",
        variant: "destructive"
      });
      return;
    }

    setSendingInvitations(true);
    
    try {
      let successCount = 0;
      let errorCount = 0;
      
      for (const invitation of invitations) {
        try {
          const { error } = await supabase
            .from('user_invitations')
            .insert({
              email: invitation.email,
              role: invitation.role as any,
              department: invitation.department as any,
              roll_number: invitation.rollNumber || null,
              employee_id: invitation.employeeId || null,
              // removed invited_by and user dependency for no-auth
              is_active: true,
              expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
            });

          if (error) {
            console.error(`Error sending invitation to ${invitation.email}:`, error);
            errorCount++;
          } else {
            successCount++;
          }
        } catch (error) {
          console.error(`Error processing invitation for ${invitation.email}:`, error);
          errorCount++;
        }
      }
      
      toast({
        title: "Bulk Invitations Sent",
        description: `Successfully sent ${successCount} invitations. ${errorCount} failed.`,
      });
      
      // Clear the data after sending
      setInvitations([]);
      setCsvData('');
      
    } catch (error) {
      console.error('Error sending bulk invitations:', error);
      toast({
        title: "Error",
        description: "Failed to send bulk invitations",
        variant: "destructive"
      });
    } finally {
      setSendingInvitations(false);
    }
  };

  // NO permission/auth check here, open to everyone who can see the page

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Bulk User Invitations</h3>
        <Button
          onClick={downloadTemplate}
          variant="outline"
          className="flex items-center space-x-2"
        >
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </Button>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-blue-800">
            <p className="font-medium">How to send bulk invitations:</p>
            <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Download the CSV template using the button above</li>
              <li>Fill in the user details (email, role, department are required)</li>
              <li>Copy and paste the CSV content into the text area below</li>
              <li>Click "Parse CSV" to preview the invitations</li>
              <li>Click "Send Invitations" to send all invitations</li>
            </ol>
          </div>
        </div>
      </div>

      {/* CSV Input */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">CSV Data Input</h4>
        <textarea
          value={csvData}
          onChange={(e) => setCsvData(e.target.value)}
          placeholder="Paste your CSV data here..."
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-4">
          <Button
            onClick={parseCsvData}
            className="flex items-center space-x-2"
            disabled={!csvData.trim()}
          >
            <Upload className="w-4 h-4" />
            <span>Parse CSV</span>
          </Button>
        </div>
      </div>

      {/* Invitations Preview */}
      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold text-gray-800">
              Invitations Preview ({invitations.length})
            </h4>
            <Button
              onClick={sendBulkInvitations}
              disabled={sendingInvitations}
              className="flex items-center space-x-2"
            >
              <Send className="w-4 h-4" />
              <span>{sendingInvitations ? 'Sending...' : 'Send All Invitations'}</span>
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Roll/Employee ID</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {invitations.map((invitation, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{invitation.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{invitation.role}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{invitation.department}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{invitation.name || '-'}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {invitation.rollNumber || invitation.employeeId || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedUserInvitationManager;