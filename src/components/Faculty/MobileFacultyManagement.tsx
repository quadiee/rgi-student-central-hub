
import React, { useState } from 'react';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Users, Search, Plus, Phone, Mail, MapPin, Filter, MoreVertical } from 'lucide-react';
import { useFacultyAttendance } from '../../hooks/useFacultyAttendance';
import FacultyCreationModal from './FacultyCreationModal';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { cn } from '../../lib/utils';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreationModal, setShowCreationModal] = useState(false);
  const [showFilterSheet, setShowFilterSheet] = useState(false);

  React.useEffect(() => {
    fetchEnhancedFacultyList();
  }, []);

  const getRoleColors = () => {
    switch (user?.role) {
      case 'chairman':
        return {
          gradient: 'from-purple-500 to-blue-500',
          text: 'text-purple-600',
          bg: 'bg-purple-50',
          border: 'border-purple-200'
        };
      case 'admin':
        return {
          gradient: 'from-red-500 to-orange-500',
          text: 'text-red-600',
          bg: 'bg-red-50',
          border: 'border-red-200'
        };
      case 'principal':
        return {
          gradient: 'from-green-500 to-teal-500',
          text: 'text-green-600',
          bg: 'bg-green-50',
          border: 'border-green-200'
        };
      case 'hod':
        return {
          gradient: 'from-orange-500 to-yellow-500',
          text: 'text-orange-600',
          bg: 'bg-orange-50',
          border: 'border-orange-200'
        };
      default:
        return {
          gradient: 'from-blue-500 to-purple-500',
          text: 'text-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-200'
        };
    }
  };

  const colors = getRoleColors();

  const filteredFaculty = enhancedFacultyList.filter(faculty =>
    faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.employee_code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    faculty.department_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getAttendanceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600 bg-green-50 border-green-200';
    if (percentage >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const quickStats = [
    { 
      label: 'Total Faculty', 
      value: filteredFaculty.length, 
      color: colors.text,
      bgColor: colors.bg
    },
    { 
      label: 'Active', 
      value: filteredFaculty.filter(f => f.is_active).length, 
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    { 
      label: 'Male', 
      value: filteredFaculty.filter(f => f.gender === 'Male').length, 
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    { 
      label: 'Female', 
      value: filteredFaculty.filter(f => f.gender === 'Female').length, 
      color: 'text-pink-600',
      bgColor: 'bg-pink-50'
    },
  ];

  return (
    <div className="pb-20 min-h-screen bg-gradient-to-br from-gray-50 to-white">
      {/* Enhanced Header */}
      <div className={cn(
        "sticky top-0 z-10 backdrop-blur-lg border-b shadow-sm",
        colors.bg
      )}>
        <div className="p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className={cn(
                "text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent",
                colors.gradient.replace('from-', 'from-').replace('to-', 'to-')
              )}>
                Faculty Management
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {filteredFaculty.length} members • {user?.role?.toUpperCase()} View
              </p>
            </div>
            <div className="flex gap-2">
              <Sheet open={showFilterSheet} onOpenChange={setShowFilterSheet}>
                <SheetTrigger asChild>
                  <Button variant="outline" size="sm" className="min-h-[44px]">
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
                        className="pl-10 min-h-[44px]"
                      />
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name, code, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 min-h-[44px] bg-white/80 backdrop-blur-sm border-white/50 focus:bg-white transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Enhanced Quick Stats */}
      <div className="p-4">
        <div className="grid grid-cols-2 gap-3 mb-6">
          {quickStats.map((stat, index) => (
            <Card key={index} className={cn(
              "border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 animate-fade-in",
              stat.bgColor,
              `delay-${index * 100}`
            )}>
              <CardContent className="p-4">
                <div className="text-center">
                  <p className={cn(
                    "text-2xl font-bold",
                    stat.color
                  )}>
                    {stat.value}
                  </p>
                  <p className="text-xs text-gray-600 font-medium">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Enhanced Faculty List */}
        <div className="space-y-3">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            filteredFaculty.map((faculty, index) => (
              <Card 
                key={faculty.faculty_id} 
                className={cn(
                  "overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 animate-fade-in border-0 shadow-md",
                  `delay-${index * 50}`
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg text-gray-900">{faculty.name}</h3>
                        <Badge 
                          variant={faculty.is_active ? 'default' : 'secondary'} 
                          className={cn(
                            "text-xs",
                            faculty.is_active ? colors.text : ''
                          )}
                        >
                          {faculty.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-600 min-w-[40px]">ID:</span>
                          <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                            {faculty.employee_code}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-gray-600 min-w-[40px]">Role:</span>
                          <span>{faculty.designation}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-blue-500 flex-shrink-0" />
                          <span className="truncate">{faculty.department_name}</span>
                        </div>
                        {faculty.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-green-500 flex-shrink-0" />
                            <span className="truncate text-xs">{faculty.email}</span>
                          </div>
                        )}
                        {faculty.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-orange-500 flex-shrink-0" />
                            <span>{faculty.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end gap-3 ml-4">
                      <div className="text-center">
                        <div className={cn(
                          "text-lg font-bold px-3 py-1 rounded-full border",
                          getAttendanceColor(faculty.attendance_percentage)
                        )}>
                          {faculty.attendance_percentage.toFixed(0)}%
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">Attendance</p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="p-2">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Edit Details</DropdownMenuItem>
                          <DropdownMenuItem>View Attendance</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center mt-4 pt-3 border-t">
                    <div className="text-sm text-muted-foreground">
                      {faculty.gender && <span>{faculty.gender}</span>}
                      {faculty.age && <span> • {faculty.age} years</span>}
                      {faculty.years_of_experience && (
                        <span> • {faculty.years_of_experience} yrs exp</span>
                      )}
                    </div>
                    <Button variant="outline" size="sm" className="text-xs">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Enhanced Floating Action Button */}
      <div className="fixed bottom-20 right-4 z-50">
        <Button
          onClick={() => setShowCreationModal(true)}
          className={cn(
            "w-14 h-14 rounded-full shadow-xl hover:shadow-2xl text-white transition-all duration-300 transform hover:scale-110 bg-gradient-to-r",
            colors.gradient
          )}
        >
          <Plus className="h-6 w-6" />
        </Button>
        {/* Pulse ring */}
        <div className={cn(
          "absolute inset-0 rounded-full animate-ping opacity-30 bg-gradient-to-r",
          colors.gradient
        )} />
      </div>

      {/* Creation Modal */}
      <FacultyCreationModal
        isOpen={showCreationModal}
        onClose={() => setShowCreationModal(false)}
        onSuccess={fetchEnhancedFacultyList}
      />
    </div>
  );
};

export default MobileFacultyManagement;
