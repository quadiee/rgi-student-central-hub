
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, BarChart3, Calendar, Plus, Search, Eye, Settings, Download } from 'lucide-react';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import FacultyCreationModal from './FacultyCreationModal';

interface EnhancedFacultyMember {
  faculty_id: string;
  user_id: string;
  name: string;
  email: string;
  employee_code: string;
  designation: string;
  department_name: string;
  department_code: string;
  joining_date: string;
  phone: string | null;
  gender: string | null;
  age: number | null;
  years_of_experience: number | null;
  is_active: boolean;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  current_address: string | null;
  blood_group: string | null;
  marital_status: string | null;
  total_attendance_days: number;
  present_days: number;
  absent_days: number;
  attendance_percentage: number;
}

const DesktopFacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const { enhancedFacultyList, loading, fetchEnhancedFacultyList } = useFacultyAttendance();
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showCreationModal, setShowCreationModal] = useState(false);

  React.useEffect(() => {
    fetchEnhancedFacultyList();
  }, []);

  const getThemeColors = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-600 to-blue-600';
      case 'admin':
        return 'from-red-600 to-orange-600';
      case 'principal':
        return 'from-green-600 to-teal-600';
      default:
        return 'from-blue-600 to-purple-600';
    }
  };

  const filteredFaculty = enhancedFacultyList.filter(faculty => {
    const matchesSearch = faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         faculty.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || faculty.department_name === departmentFilter;
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && faculty.is_active) ||
                         (statusFilter === 'inactive' && !faculty.is_active);
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getUniqueValues = (key: keyof EnhancedFacultyMember): string[] => {
    return Array.from(new Set(
      enhancedFacultyList
        .map(faculty => faculty[key])
        .filter(value => value != null && value !== '')
        .map(value => String(value))
    ));
  };

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 75) return 'text-yellow-600';
    return 'text-red-600';
  };

  const quickStats = [
    {
      title: 'Total Faculty',
      value: filteredFaculty.length,
      change: '+3 this month',
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Active Faculty',
      value: filteredFaculty.filter(f => f.is_active).length,
      change: 'Currently active',
      icon: Users,
      color: 'green'
    },
    {
      title: 'Departments',
      value: getUniqueValues('department_name').length,
      change: 'Total departments',
      icon: BarChart3,
      color: 'purple'
    },
    {
      title: 'Avg. Attendance',
      value: `${(filteredFaculty.reduce((sum, f) => sum + f.attendance_percentage, 0) / filteredFaculty.length || 0).toFixed(1)}%`,
      change: '+2% this week',
      icon: Calendar,
      color: 'indigo'
    }
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'faculty-list', label: 'Faculty Directory', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Faculty Management</h1>
          <p className="text-muted-foreground">
            Comprehensive faculty management and analytics dashboard
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export Data
          </Button>
          <Button variant="outline" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
          <Button 
            onClick={() => setShowCreationModal(true)}
            className={`gap-2 bg-gradient-to-r ${getThemeColors()} text-white hover:opacity-90`}
          >
            <Plus className="h-4 w-4" />
            Add Faculty
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id}
              value={tab.id}
              className="gap-2"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickStats.map((stat, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <p className="text-2xl font-bold">{stat.value}</p>
                      <p className="text-xs text-muted-foreground">{stat.change}</p>
                    </div>
                    <stat.icon className={`h-8 w-8 text-${stat.color}-600`} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => setShowCreationModal(true)}
                >
                  <Plus className="h-6 w-6" />
                  Add Faculty
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Calendar className="h-6 w-6" />
                  Mark Attendance
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <BarChart3 className="h-6 w-6" />
                  View Reports
                </Button>
                <Button variant="outline" className="h-20 flex-col gap-2">
                  <Download className="h-6 w-6" />
                  Export Data
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="faculty-list" className="space-y-6">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty by name, employee code, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Departments</SelectItem>
                  {getUniqueValues('department_name').map(dept => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Faculty List */}
          <div className="space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              <div className="grid gap-4">
                {filteredFaculty.map((faculty) => (
                  <Card key={faculty.faculty_id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-3">
                            <h3 className="text-xl font-semibold">{faculty.name}</h3>
                            <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                              {faculty.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                            {faculty.gender && (
                              <Badge variant="outline">{faculty.gender}</Badge>
                            )}
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                            <div><span className="font-medium">Employee ID:</span> {faculty.employee_code}</div>
                            <div><span className="font-medium">Designation:</span> {faculty.designation}</div>
                            <div><span className="font-medium">Department:</span> {faculty.department_name}</div>
                            <div><span className="font-medium">Email:</span> {faculty.email}</div>
                            {faculty.phone && (
                              <div><span className="font-medium">Phone:</span> {faculty.phone}</div>
                            )}
                            {faculty.age && (
                              <div><span className="font-medium">Age:</span> {faculty.age} years</div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-3">
                          <div className="text-center">
                            <p className={`text-3xl font-bold ${getAttendanceColor(faculty.attendance_percentage)}`}>
                              {faculty.attendance_percentage.toFixed(1)}%
                            </p>
                            <p className="text-sm text-muted-foreground">Attendance</p>
                            <p className="text-xs text-muted-foreground">
                              {faculty.present_days}/{faculty.total_attendance_days} days
                            </p>
                          </div>
                          
                          <Button variant="outline" className="gap-2">
                            <Eye className="h-4 w-4" />
                            View Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">Advanced analytics coming soon</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Creation Modal */}
      <FacultyCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onSuccess={fetchEnhancedFacultyList}
      />
    </div>
  );
};

export default DesktopFacultyManagement;
