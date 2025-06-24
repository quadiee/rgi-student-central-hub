
import React, { useState, useEffect } from 'react';
import { Building, Users, DollarSign, AlertTriangle, TrendingUp } from 'lucide-react';
import { useEnhancedAuth } from '../../contexts/EnhancedAuthContext';
import { EnhancedFeeService } from '../../services/enhancedFeeService';
import { PrincipalInstitutionSummary, HODDepartmentSummary } from '../../types/enhancedTypes';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

const EnhancedPrincipalDashboard: React.FC = () => {
  const { user } = useEnhancedAuth();
  const [institutionSummary, setInstitutionSummary] = useState<PrincipalInstitutionSummary | null>(null);
  const [departmentSummaries, setDepartmentSummaries] = useState<HODDepartmentSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!user) return;
      
      try {
        setLoading(true);
        const [institutionData, departmentData] = await Promise.all([
          EnhancedFeeService.getPrincipalInstitutionSummary(),
          EnhancedFeeService.getHODDepartmentSummary(user)
        ]);
        
        setInstitutionSummary(institutionData);
        setDepartmentSummaries(departmentData);
      } catch (error) {
        console.error('Error loading principal dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!institutionSummary) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No institution data found</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Institution Dashboard</h2>
        <div className="text-sm text-gray-600">
          RGCE - Principal View
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Building className="w-4 h-4 mr-2" />
              Departments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionSummary.total_departments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Total Students
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{institutionSummary.total_students}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{institutionSummary.total_institution_fees.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Collection Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{institutionSummary.overall_collection_percentage}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Overdue Records
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{institutionSummary.overdue_records}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Department Performance</CardTitle>
        </CardHeader>
        <CardContent>
          {departmentSummaries.length === 0 ? (
            <div className="text-center py-4 text-gray-500">
              No department data available
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Department</th>
                    <th className="text-right py-2">Students</th>
                    <th className="text-right py-2">Total Fees</th>
                    <th className="text-right py-2">Collected</th>
                    <th className="text-right py-2">Pending</th>
                    <th className="text-right py-2">Collection %</th>
                  </tr>
                </thead>
                <tbody>
                  {departmentSummaries.map((dept) => (
                    <tr key={dept.department_id} className="border-b">
                      <td className="py-2 font-medium">
                        {dept.department_name} ({dept.department_code})
                      </td>
                      <td className="py-2 text-right">{dept.total_students}</td>
                      <td className="py-2 text-right">₹{dept.total_department_fees.toLocaleString()}</td>
                      <td className="py-2 text-right text-green-600">₹{dept.total_collected.toLocaleString()}</td>
                      <td className="py-2 text-right text-red-600">₹{dept.total_pending.toLocaleString()}</td>
                      <td className="py-2 text-right">
                        <span className={`font-medium ${
                          dept.collection_percentage >= 80 ? 'text-green-600' :
                          dept.collection_percentage >= 60 ? 'text-yellow-600' :
                          'text-red-600'
                        }`}>
                          {dept.collection_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EnhancedPrincipalDashboard;
