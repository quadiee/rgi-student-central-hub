import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import FacultyListManagement from './FacultyListManagement';
import FacultyAnalytics from './FacultyAnalytics';
import FacultyCreationModal from './FacultyCreationModal';
import FacultyEditModal from './FacultyEditModal';
import FacultyDetailsModal from './FacultyDetailsModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Users, UserPlus, BarChart3, BookOpen, Calendar, Award, TrendingUp } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface FacultyMember {
  id: string;
  faculty_id: string;
  user_id: string | null;
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department_name: string;
  joining_date: string;
  phone: string | null;
  is_active: boolean;
}

const FacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  if (!user || !['admin', 'principal', 'chairman', 'hod'].includes(user.role)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold">Access Denied</h3>
              <p className="text-muted-foreground">
                You don't have permission to access faculty management.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleEditFaculty = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setShowEditModal(true);
  };

  const handleViewDetails = (faculty: FacultyMember) => {
    setSelectedFaculty(faculty);
    setShowDetailsModal(true);
  };

  const handleEditModalClose = () => {
    setShowEditModal(false);
    setSelectedFaculty(null);
  };

  const handleDetailsModalClose = () => {
    setShowDetailsModal(false);
    setSelectedFaculty(null);
  };

  const quickStats = [
    {
      title: 'Total Faculty',
      value: '45',
      change: '+3 this month',
      icon: Users,
      color: 'text-primary'
    },
    {
      title: 'Active Courses',
      value: '128',
      change: '+12 this semester',
      icon: BookOpen,
      color: 'text-success'
    },
    {
      title: 'On Leave',
      value: '3',
      change: 'Currently',
      icon: Calendar,
      color: 'text-warning'
    },
    {
      title: 'Research Projects',
      value: '27',
      change: '+5 ongoing',
      icon: Award,
      color: 'text-purple-600'
    }
  ];

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Faculty Management</h1>
          <p className="text-muted-foreground">
            Comprehensive faculty information and management system
          </p>
        </div>
        <Button 
          onClick={() => setShowCreateModal(true)}
          className="w-full sm:w-auto"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          Add Faculty
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="faculty">Faculty</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">
                        {stat.change}
                      </p>
                    </div>
                    <stat.icon className={`h-8 w-8 ${stat.color}`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Frequently used faculty management actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <UserPlus className="h-6 w-6" />
                  <span>Add New Faculty</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  <span>Assign Courses</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Calendar className="h-6 w-6" />
                  <span>Manage Leaves</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Award className="h-6 w-6" />
                  <span>Evaluations</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <TrendingUp className="h-6 w-6" />
                  <span>Performance</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <BarChart3 className="h-6 w-6" />
                  <span>Reports</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty">
          <FacultyListManagement 
            onEditFaculty={handleEditFaculty}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>

        <TabsContent value="analytics">
          <FacultyAnalytics />
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Faculty Reports
              </CardTitle>
              <CardDescription>
                Generate comprehensive faculty reports
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Reports Coming Soon</h3>
                <p className="text-muted-foreground">
                  Advanced reporting features will be available soon.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Faculty Modal */}
      {showCreateModal && (
        <FacultyCreationModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {/* Edit Faculty Modal */}
      {showEditModal && selectedFaculty && (
        <FacultyEditModal
          isOpen={showEditModal}
          onClose={handleEditModalClose}
          faculty={selectedFaculty}
        />
      )}

      {/* Faculty Details Modal */}
      {showDetailsModal && selectedFaculty && (
        <FacultyDetailsModal
          isOpen={showDetailsModal}
          onClose={handleDetailsModalClose}
          faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default FacultyManagement;
