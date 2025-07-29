
import React, { useState, useEffect } from 'react';
import { Mail, Upload, Send, Download } from 'lucide-react';
import { Button } from '../ui/button';
import { useToast } from '../ui/use-toast';
import { supabase } from '../../integrations/supabase/client';

interface BulkInvitation {
  email: string;
  role: string;
  department_id: string;
  department_name?: string;
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
  const [sendingInvitations, setSendingInvitations] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const loadDepartments = async () => {
      const { data } = await supabase
        .from('departments')
        .select('*')
        .eq('is_active', true)
        .order('name');
      setDepartments(data || []);
    };
    loadDepartments();
  }, []);

  const downloadTemplate = () => {
    const csvContent = `email,role,department_code,name,rollNumber,employeeId
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
      toast({ title: "Error", description: "Please paste CSV data", variant: "destructive" });
      return;
    }
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].split(',').map(h => h.trim());
      const requiredHeaders = ['email', 'role', 'department_code'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      if (missingHeaders.length > 0) {
        toast({ title: "Error", description: `Missing required columns: ${missingHeaders.join(', ')}`, variant: "destructive" });
        return;
      }
      
      const parsed: BulkInvitation[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const invitation: any = { email: '', role: '', department_id: '' };
        
        headers.forEach((header, idx) => {
          const value = values[idx] || '';
          if (header === 'email') invitation.email = value;
          if (header === 'role') invitation.role = value;
          if (header === 'department_code') {
            // Find department by code
            const dept = departments.find(d => d.code === value);
            if (dept) {
              invitation.department_id = dept.id;
              invitation.department_name = dept.name;
            }
          }
          if (header === 'name') invitation.name = value;
          if (header === 'rollNumber') invitation.rollNumber = value;
          if (header === 'employeeId') invitation.employeeId = value;
        });
        
        if (invitation.email && invitation.role && invitation.department_id) {
          parsed.push(invitation);
        }
      }
      
      setInvitations(parsed);
      toast({ title: "Success", description: `Parsed ${parsed.length} invitations from CSV` });
    } catch {
      toast({ title: "Error", description: "Failed to parse CSV data. Please check the format.", variant: "destructive" });
    }
  };

  const sendBulkInvitations = async () => {
    if (invitations.length === 0) {
      toast({ title: "Error", description: "No invitations to send", variant: "destructive" });
      return;
    }
    setSendingInvitations(true);
    let successCount = 0;
    let errorCount = 0;
    
    for (const invitation of invitations) {
      try {
        // Insert a single invitation object
        const { data, error } = await supabase
          .from('user_invitations')
          .insert({
            email: invitation.email,
            role: invitation.role as any,
            department_id: invitation.department_id,
            roll_number: invitation.rollNumber || null,
            employee_id: invitation.employeeId || null,
            is_active: true,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
          })
          .select()
          .single();

        if (error || !data) {
          console.error('Error inserting invitation:', error);
          errorCount++;
          continue;
        }

        // Trigger email using the edge function
        const { error: sendError } = await supabase.functions.invoke("send-invitation", {
          body: {
            email: invitation.email,
            role: invitation.role,
            departmentId: invitation.department_id,
            invitedBy: null,
            invitationId: data.id
          }
        });

        if (sendError) {
          console.error('Error sending invitation email:', sendError);
          errorCount++;
        } else {
          successCount++;
        }
      } catch (err) {
        console.error('Exception in invitation process:', err);
        errorCount++;
      }
    }
    
    toast({
      title: "Bulk Invitations Sent",
      description: `Successfully sent ${successCount} invitations. ${errorCount} failed.`,
      variant: errorCount > 0 ? "destructive" : undefined
    });
    setInvitations([]);
    setCsvData('');
    setSendingInvitations(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-800">Bulk User Invitations</h3>
        <Button onClick={downloadTemplate} variant="outline" className="flex items-center space-x-2">
          <Download className="w-4 h-4" />
          <span>Download Template</span>
        </Button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <div className="flex items-start space-x-2">
          <Mail className="w-5 h-5 text-blue-600 mt-0.5" />
          <div className="text-blue-800">
            <p className="font-medium">How to send bulk invitations:</p>
            <ol className="text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Download the CSV template using the button above</li>
              <li>Fill in the user details (email, role, department_code are required)</li>
              <li>Copy and paste the CSV content into the text area below</li>
              <li>Click "Parse CSV" to preview the invitations</li>
              <li>Click "Send Invitations" to send all invitations</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <h4 className="text-md font-semibold text-gray-800 mb-4">CSV Data Input</h4>
        <textarea
          value={csvData}
          onChange={e => setCsvData(e.target.value)}
          placeholder="Paste your CSV data here..."
          className="w-full h-40 p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <div className="flex justify-end mt-4">
          <Button onClick={parseCsvData} className="flex items-center space-x-2" disabled={!csvData.trim()}>
            <Upload className="w-4 h-4" />
            <span>Parse CSV</span>
          </Button>
        </div>
      </div>

      {invitations.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-md font-semibold text-gray-800">Invitations Preview ({invitations.length})</h4>
            <Button onClick={sendBulkInvitations} disabled={sendingInvitations} className="flex items-center space-x-2">
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
                {invitations.map((invitation, idx) => (
                  <tr key={idx} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">{invitation.email}</td>
                    <td className="px-4 py-2 text-sm text-gray-900 capitalize">{invitation.role}</td>
                    <td className="px-4 py-2 text-sm text-gray-900">{invitation.department_name}</td>
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
