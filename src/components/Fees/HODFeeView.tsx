
import React, { useState, useEffect } from 'react';
import { Users, TrendingUp, AlertTriangle, FileText, Eye } from 'lucide-react';
import { Button } from '../ui/button';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useToast } from '../ui/use-toast';
import { RealFeeService } from '../../services/realFeeService';
import { FeeRecord } from '../../types';
import { useIsMobile } from '../../hooks/use-mobile';

const HODFeeView: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();
  const [feeRecords, setFeeRecords] = useState<FeeRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedClass, setSelectedClass] = useState('all');

  useEffect(() => {
    fetchFeeRecords();
  }, [user]);

  const fetchFeeRecords = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const records = await RealFeeService.getFeeRecords(user);
      setFeeRecords(records);
    } catch (error) {
      console.error('Error fetching fee records:', error);
      toast({
        title: "Error",
        description: "Failed to fetch fee records",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Calculate statistics
  const totalStudents = new Set(feeRecords.map(record => record.studentId)).size;
  const totalCollected = feeRecords
    .filter(record => record.status === 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const totalPending = feeRecords
    .filter(record => record.status !== 'Paid')
    .reduce((sum, record) => sum + record.amount, 0);
  const overdue = feeRecords
    .filter(record => record.status === 'Overdue')
    .reduce((sum, record) => sum + record.amount, 0);
  const collectionRate = totalCollected + totalPending > 0 
    ? (totalCollected / (totalCollected + totalPending)) * 100 
    : 0;

  // Group by class/year (mock data for demonstration)
  const classWiseData = [
    { class: '1st Year - A', students: Math.floor(totalStudents * 0.2), collected: totalCollected * 0.2, pending: totalPending * 0.2 },
    { class: '2nd Year - A', students: Math.floor(totalStudents * 0.25), collected: totalCollected * 0.25, pending: totalPending * 0.25 },
    { class: '3rd Year - A', students: Math.floor(totalStudents * 0.3), collected: totalCollected * 0.3, pending: totalPending * 0.3 },
    { class: '4th Year - A', students: Math.floor(totalStudents * 0.25), collected: totalCollected * 0.25, pending: totalPending * 0.25 }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading department fee data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold text-gray-800`}>
          {user?.department} Department Fee Management
        </h2>
        <Button variant="outline" size={isMobile ? 'sm' : 'default'}>
          <FileText className="w-4 h-4 mr-2" />
          Generate Report
        </Button>
      </div>

      {/* Department Stats */}
      <div className={`grid ${isMobile ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-4'} gap-4`}>
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Students</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-blue-600`}>
                {totalStudents}
              </p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-blue-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collected</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-green-600`}>
                ₹{(totalCollected / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-green-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Pending</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-yellow-600`}>
                ₹{(totalPending / 100000).toFixed(1)}L
              </p>
            </div>
            <div className="p-2 bg-yellow-100 rounded-lg">
              <AlertTriangle className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-yellow-600`} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Collection Rate</p>
              <p className={`${isMobile ? 'text-lg' : 'text-2xl'} font-bold text-purple-600`}>
                {collectionRate.toFixed(1)}%
              </p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <TrendingUp className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-purple-600`} />
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-xl shadow-lg p-1">
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} gap-1`}>
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'classwise', label: 'Class-wise' },
            { id: 'students', label: 'Students' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span className={`font-medium ${isMobile ? 'text-sm' : ''}`}>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'classwise' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Class-wise Fee Collection</h3>
          </div>

          {isMobile ? (
            <div className="space-y-4">
              {classWiseData.map(cls => (
                <div key={cls.class} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">{cls.class}</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Students:</span>
                      <p className="font-medium">{cls.students}</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Collection Rate:</span>
                      <p className="font-medium text-green-600">
                        {((cls.collected / (cls.collected + cls.pending)) * 100).toFixed(1)}%
                      </p>
                    </div>
                    <div>
                      <span className="text-gray-500">Collected:</span>
                      <p className="font-medium">₹{(cls.collected / 100000).toFixed(1)}L</p>
                    </div>
                    <div>
                      <span className="text-gray-500">Pending:</span>
                      <p className="font-medium text-yellow-600">₹{(cls.pending / 100000).toFixed(1)}L</p>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button size="sm" variant="outline" className="w-full">
                      <Eye className="w-4 h-4 mr-2" />
                      View Students
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Class</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Students</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Collected</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pending</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {classWiseData.map(cls => {
                    const rate = (cls.collected / (cls.collected + cls.pending)) * 100;
                    return (
                      <tr key={cls.class} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {cls.class}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {cls.students}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                          ₹{(cls.collected / 100000).toFixed(1)}L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-600 font-medium">
                          ₹{(cls.pending / 100000).toFixed(1)}L
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            rate >= 90 ? 'bg-green-100 text-green-800' :
                            rate >= 75 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {rate.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <Button size="sm" variant="outline">
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'students' && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Individual Student Fee Status</h3>
          
          {feeRecords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No student fee records found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {feeRecords.slice(0, 10).map(record => (
                <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                  <div className={`flex ${isMobile ? 'flex-col space-y-3' : 'items-center justify-between'}`}>
                    <div>
                      <h4 className="font-medium text-gray-900">Student ID: {record.studentId}</h4>
                      <div className="text-sm text-gray-600 mt-1">
                        <span>Amount: ₹{record.amount.toLocaleString()}</span>
                        <span className="mx-2">•</span>
                        <span>Due: {new Date(record.dueDate).toLocaleDateString()}</span>
                        <span className="mx-2">•</span>
                        <span>Semester: {record.semester}</span>
                      </div>
                    </div>
                    <div className={`flex items-center space-x-3 ${isMobile ? 'w-full justify-between' : ''}`}>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        record.status === 'Paid' ? 'bg-green-100 text-green-800' :
                        record.status === 'Overdue' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {record.status}
                      </span>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HODFeeView;
