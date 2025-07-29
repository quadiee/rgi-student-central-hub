
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Users, BarChart3, Calendar, Plus, Filter, Search, Phone, Mail, MapPin } from 'lucide-react';
import { Input } from '../ui/input';
import SwipeableCard from '../Mobile/SwipeableCard';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import FacultyDetailsModal from './FacultyDetailsModal';

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

const MobileFacultyManagement: React.FC = () => {
  const { user } = useAuth();
  const { enhancedFacultyList, loading, fetchEnhancedFacultyList } = useFacultyAttendance();
  const [activeTab, setActiveTab] = useState('list');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFaculty, setSelectedFaculty] = useState<EnhancedFacultyMember | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  React.useEffect(() => {
    fetchEnhancedFacultyList();
  }, []);

  const getThemeColors = () => {
    switch (user?.role) {
      case 'chairman':
        return 'from-purple-500 to-blue-500';
      case 'admin':
        return 'from-red-500 to-orange-500';
      case 'principal':
        return 'from-green-500 to-teal-500';
      default:
        return 'from-blue-500 to-purple-500';
    }
  };

  const filteredFaculty = enhancedFacultyList.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const quickStats = [
    { label: 'Total Faculty', value: filteredFaculty.length, color: 'blue' },
    { label: 'Active', value: filteredFaculty.filter(f => f.is_active).length, color: 'green' },
    { label: 'Male', value: filteredFaculty.filter(f => f.gender === 'Male').length, color: 'purple' },
    { label: 'Female', value: filteredFaculty.filter(f => f.gender === 'Female').length, color: 'pink' },
  ];

  const handleViewDetails = (faculty: EnhancedFacultyMember) => {
    setSelectedFaculty(faculty);
    setShowDetailsModal(true);
  };

  const tabs = [
    { id: 'list', label: 'Faculty', icon: Users },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'attendance', label: 'Attendance', icon: Calendar },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-sm border-b p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Faculty Management</h1>
            <p className="text-sm text-muted-foreground">
              {filteredFaculty.length} faculty members
            </p>
          </div>
          <div className="flex gap-2">
            <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4" />
                </Button>
              </SheetTrigger>
              <SheetContent>
                <SheetHeader>
                  <SheetTitle>Filter Faculty</SheetTitle>
                </SheetHeader>
                <div className="space-y-4 mt-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search faculty..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-4">
          {quickStats.map((stat, index) => (
            <Card key={index} className="p-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">{stat.value}</p>
                <p className="text-xs text-muted-foreground">{stat.label}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="px-4 mb-4">
        <div className="flex rounded-lg bg-muted p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? `bg-gradient-to-r ${getThemeColors()} text-white`
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="px-4">
        {activeTab === 'list' && (
          <div className="space-y-3">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : (
              filteredFaculty.map((faculty) => (
                <SwipeableCard
                  key={faculty.faculty_id}
                  onSwipeLeft={() => handleViewDetails(faculty)}
                  leftAction="View Details"
                >
                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-lg">{faculty.name}</h3>
                            <Badge variant={faculty.is_active ? 'default' : 'secondary'}>
                              {faculty.is_active ? 'Active' : 'Inactive'}
                            </Badge>
                          </div>
                          
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">ID:</span>
                              {faculty.employee_code}
                            </div>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3" />
                              {faculty.department_name}
                            </div>
                            <div className="flex items-center gap-2">
                              <Mail className="h-3 w-3" />
                              {faculty.email}
                            </div>
                            {faculty.phone && (
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {faculty.phone}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="text-center">
                          <div className={`text-2xl font-bold px-3 py-1 rounded-full ${getAttendanceColor(faculty.attendance_percentage)}`}>
                            {faculty.attendance_percentage.toFixed(0)}%
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Attendance</p>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{faculty.designation}</span>
                          {faculty.gender && <span> • {faculty.gender}</span>}
                          {faculty.age && <span> • {faculty.age} years</span>}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewDetails(faculty)}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </SwipeableCard>
              ))
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Department Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Analytics coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Attendance Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">Attendance tracking coming soon</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          className={`w-14 h-14 rounded-full shadow-lg hover:shadow-xl bg-gradient-to-r ${getThemeColors()} text-white`}
          onClick={() => {}}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Faculty Details Modal */}
      {showDetailsModal && selectedFaculty && (
        <FacultyDetailsModal
          isOpen={showDetailsModal}
          onClose={() => setShowDetailsModal(false)}
          faculty={selectedFaculty}
        />
      )}
    </div>
  );
};

export default MobileFacultyManagement;
