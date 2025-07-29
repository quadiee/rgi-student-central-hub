
import React, { useState, useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';
import { useAuth } from '../../contexts/SupabaseAuthContext';
import FacultyDetailsModal from './FacultyDetailsModal';
import FacultyEditModal from './FacultyEditModal';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Search, Filter, Eye, Edit, Phone, Mail, Calendar, MapPin, Users } from 'lucide-react';
import { useIsMobile } from '../../hooks/use-mobile';

interface FacultyMember {
  id: string;
  name: string;
  email: string;
  employee_id: string;
  role: string;
  department_id: string;
  department_name: string;
  phone: string;
  is_active: boolean;
  created_at: string;
  profile_photo_url: string;
}

const FacultyListManagement: React.FC = () => {
  const { user } = useAuth();
  const isMobile = useIsMobile();
  const [faculty, setFaculty] = useState<FacultyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    fetchFaculty();
  }, [user]);

  const fetchFaculty = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Fetch faculty from profiles table where role is 'faculty'
      let query = supabase
        .from('profiles')
        .select(`
          id,
          name,
          email,
          employee_id,
          role,
          department_id,
          phone,
          is_active,
          created_at,
          profile_photo_url,
          departments:department_id (
            name
          )
        `)
        .eq('role', 'faculty');

      // Add department filter if user is HOD
      if (user.role === 'hod' && user.department_id) {
        query = query.eq('department_id', user.department_id);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching faculty:', error);
        throw error;
      }

      // Map the data to our interface
      const mappedData: FacultyMember[] = (data || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        email: item.email,
        employee_id: item.employee_id || '',
        role: item.role,
        department_id: item.department_id || '',
        department_name: item.departments?.name || 'Unknown',
        phone: item.phone || '',
        is_active: item.is_active,
        created_at: item.created_at,
        profile_photo_url: item.profile_photo_url || ''
      }));
      
      setFaculty(mappedData);
    } catch (error) {
      console.error('Error fetching faculty:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.employee_id.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDepartment = departmentFilter === 'all' || member.department_name === departmentFilter;
    
    return matchesSearch && matchesDepartment;
  });

  const handleViewDetails = (facultyMember: FacultyMember) => {
    setSelectedFaculty(facultyMember);
    setShowDetailsModal(true);
  };

  const handleEditFaculty = (facultyMember: FacultyMember) => {
    setSelectedFaculty(facultyMember);
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="rounded-full bg-muted h-12 w-12" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/4" />
                  <div className="h-3 bg-muted rounded w-1/3" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                <SelectItem value="Computer Science">Computer Science</SelectItem>
                <SelectItem value="Electronics">Electronics</SelectItem>
                <SelectItem value="Mechanical">Mechanical</SelectItem>
                <SelectItem value="Civil">Civil</SelectItem>
                <SelectItem value="Electrical">Electrical</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculty List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Users className="h-5 w-5" />
            Faculty Members ({filteredFaculty.length})
          </h3>
        </div>

        {filteredFaculty.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <Users className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No faculty members found.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredFaculty.map((member) => (
              <Card key={member.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={member.profile_photo_url} />
                        <AvatarFallback className="bg-primary/10 text-primary">
                          {member.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-semibold text-base truncate text-foreground">
                            {member.name}
                          </h4>
                          <Badge variant={member.is_active ? "default" : "secondary"}>
                            {member.is_active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1">
                          Faculty • {member.department_name}
                        </p>
                        <p className="text-sm text-muted-foreground mb-2">
                          ID: {member.employee_id || 'N/A'}
                        </p>
                        
                        <div className="space-y-1">
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Mail className="h-3 w-3 mr-1" />
                            <span className="truncate">{member.email}</span>
                          </div>
                          {member.phone && (
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Phone className="h-3 w-3 mr-1" />
                              <span>{member.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center text-xs text-muted-foreground">
                            <Calendar className="h-3 w-3 mr-1" />
                            <span>Joined: {new Date(member.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(member)}
                        className="w-full sm:w-auto"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEditFaculty(member)}
                        className="w-full sm:w-auto"
                      >
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      {selectedFaculty && showDetailsModal && (
        <FacultyDetailsModal
          faculty={selectedFaculty}
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedFaculty(null);
          }}
        />
      )}

      {selectedFaculty && showEditModal && (
        <FacultyEditModal
          faculty={selectedFaculty}
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setSelectedFaculty(null);
          }}
          onUpdate={fetchFaculty}
        />
      )}
    </div>
  );
};

export default FacultyListManagement;
