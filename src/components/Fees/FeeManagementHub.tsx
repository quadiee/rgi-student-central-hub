
import React, { useState } from 'react';
import { BarChart3, FileText, Award, User, CreditCard, TrendingUp, PieChart, Users, Download } from 'lucide-react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { useIsMobile } from '../../hooks/use-mobile';
import EnhancedFeeManagement from './EnhancedFeeManagement';
import ScholarshipManagement from './ScholarshipManagement';
import StudentFeeView from './StudentFeeView';
import StudentPaymentPortal from './StudentPaymentPortal';
import DepartmentAnalytics from './DepartmentAnalytics';
import FeeTypeAnalytics from './FeeTypeAnalytics';
import BatchFeeProcessor from './BatchFeeProcessor';
import AdminReportGenerator from './AdminReportGenerator';
import RealTimeStats from '../Dashboard/RealTimeStats';

interface Tab {
  id: string;
  label: string;
  icon: React.ComponentType<any>;
  component: React.FC<any>;
  roles: string[];
}

const FeeManagementHub: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const isMobile = useIsMobile();

  const canAccess = (roles: string[]) => {
    return user?.role && roles.includes(user.role);
  };

  const tabs = [
    {
      id: 'overview',
      label: 'Overview',
      icon: BarChart3,
      component: () => <RealTimeStats />,
      roles: ['student', 'hod', 'principal', 'admin', 'chairman']
    },
    {
      id: 'fees',
      label: 'Fee Records',
      icon: FileText,
      component: () => <EnhancedFeeManagement />,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      id: 'scholarships',
      label: 'Scholarships',
      icon: Award,
      component: () => <ScholarshipManagement />,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      id: 'student-view',
      label: 'My Fees',
      icon: User,
      component: () => <StudentFeeView />,
      roles: ['student']
    },
    {
      id: 'payment',
      label: 'Payment Portal',
      icon: CreditCard,
      component: () => <StudentPaymentPortal />,
      roles: ['student']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: TrendingUp,
      component: () => <DepartmentAnalytics />,
      roles: ['hod', 'principal', 'admin', 'chairman']
    },
    {
      id: 'fee-analytics',
      label: 'Fee Type Analytics',
      icon: PieChart,
      component: () => <FeeTypeAnalytics />,
      roles: ['principal', 'admin', 'chairman']
    },
    {
      id: 'batch-operations',
      label: 'Batch Operations',
      icon: Users,
      component: () => <BatchFeeProcessor open={false} onOpenChange={() => {}} selectedStudents={[]} onProcessComplete={() => {}} />,
      roles: ['admin', 'principal', 'chairman']
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: Download,
      component: () => <AdminReportGenerator />,
      roles: ['hod', 'principal', 'admin', 'chairman']
    }
  ].filter(tab => canAccess(tab.roles));

  const ActiveTabComponent = tabs.find(tab => tab.id === activeTab)?.component || (() => <p>Tab not found</p>);

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-semibold mb-4">Fee Management Hub</h1>

        {/* Tab Navigation */}
        <div className={`flex ${isMobile ? 'overflow-x-auto' : 'flex-wrap'} mb-6`}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`px-4 py-2 rounded-lg ${activeTab === tab.id
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} mr-2 mb-2 flex items-center`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon className="h-5 w-5 mr-2" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Active Tab Content */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <ActiveTabComponent />
        </div>
      </div>
    </div>
  );
};

export default FeeManagementHub;
