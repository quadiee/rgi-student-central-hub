
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  Users, 
  TrendingUp, 
  BookOpen, 
  Award,
  UserPlus,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  GraduationCap,
  Clock,
  Star,
  Target,
  Briefcase,
  Calendar
} from 'lucide-react';
import { Input } from '../../ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { useInstitutionalStats } from '../../../hooks/useInstitutionalStats';

const ChairmanFacultyDesktop: React.FC = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { stats: institutionalStats, loading: statsLoading } = useInstitutionalStats();

  const facultyMetrics = [
    {
      title: 'Total Faculty',
      value: statsLoading ? '...' : institutionalStats.totalFaculty.toLocaleString(),
      change: '+8.3%',
      trend: 'up',
      description: 'Full-time and part-time faculty',
      icon: Users,
      color: 'blue',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Active Faculty',
      value: statsLoading ? '...' : institutionalStats.activeFaculty.toLocaleString(),
      change: '+5.7%',
      trend: 'up',
      description: 'Currently teaching faculty',
      icon: GraduationCap,
      color: 'green',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    {
      title: 'Faculty Rating',
      value: '4.6/5',
      change: '+0.3',
      trend: 'up',
      description: 'Average student rating',
      icon: Star,
      color: 'yellow',
      bgGradient: 'from-yellow-500/10 to-orange-500/10'
    },
    {
      title: 'Research Papers',
      value: '142',
      change: '+23%',
      trend: 'up',
      description: 'Published this year',
      icon: BookOpen,
      color: 'purple',
      bgGradient: 'from-purple-500/10 to-indigo-500/10'
    }
  ];

  const departmentFaculty = [
    { name: 'Computer Science', faculty: 24, phd: 18, experience: '12.5 years', rating: 4.7 },
    { name: 'Mechanical Engineering', faculty: 22, phd: 16, experience: '14.2 years', rating: 4.6 },
    { name: 'Electronics & Communication', faculty: 20, phd: 14, experience: '11.8 years', rating: 4.5 },
    { name: 'Civil Engineering', faculty: 18, phd: 12, experience: '15.3 years', rating: 4.4 },
    { name: 'Information Technology', faculty: 16, phd: 11, experience: '9.7 years', rating: 4.6 }
  ];

  const performanceMetrics = [
    { title: 'Teaching Excellence', value: 92, description: 'Faculty with excellent ratings' },
    { title: 'Research Activity', value: 78, description: 'Active researchers' },
    { title: 'Professional Development', value: 85, description: 'Ongoing training programs' },
    { title: 'Industry Collaboration', value: 68, description: 'Industry partnerships' }
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-100',
      green: 'text-green-600 bg-green-100',
      purple: 'text-purple-600 bg-purple-100',
      yellow: 'text-yellow-600 bg-yellow-100'
    };
    return colorMap[color as keyof typeof colorMap] || colorMap.blue;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Faculty Excellence</h1>
          <p className="text-lg text-gray-600">Comprehensive faculty management and performance oversight</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search faculty, departments..."
              className="pl-10 w-80"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button variant="chairman" size="sm">
            <UserPlus className="w-4 h-4 mr-2" />
            Add Faculty
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {facultyMetrics.map((metric, index) => (
          <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${metric.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-3 rounded-xl ${getColorClasses(metric.color)} group-hover:scale-110 transition-transform duration-300`}>
                  <metric.icon className="w-6 h-6" />
                </div>
                <div className="flex items-center space-x-1">
                  <ArrowUpRight className="w-4 h-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">{metric.change}</span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-bold text-gray-900">{metric.value}</div>
                <div className="text-sm font-medium text-gray-700">{metric.title}</div>
                <div className="text-xs text-gray-500">{metric.description}</div>
              </div>
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </Card>
        ))}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-2xl p-2 h-14">
          <TabsTrigger value="overview" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <BookOpen className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="departments" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Users className="w-4 h-4 mr-2" />
            Departments
          </TabsTrigger>
          <TabsTrigger value="performance" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <TrendingUp className="w-4 h-4 mr-2" />
            Performance
          </TabsTrigger>
          <TabsTrigger value="development" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Target className="w-4 h-4 mr-2" />
            Development
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Faculty Distribution */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  <span>Faculty Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentFaculty.slice(0, 3).map((dept, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-blue-500 text-white' : 
                          index === 1 ? 'bg-green-500 text-white' : 
                          'bg-purple-500 text-white'
                        }`}>
                          {dept.faculty}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{dept.name}</div>
                          <div className="text-sm text-gray-500">{dept.phd} PhDs</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">★ {dept.rating}</div>
                        <div className="text-sm text-gray-500">{dept.experience}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Performance Metrics */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-green-600" />
                  <span>Performance Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {performanceMetrics.map((metric, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{metric.title}</span>
                        <span className="text-lg font-bold text-gray-900">{metric.value}%</span>
                      </div>
                      <Progress value={metric.value} className="h-2 mb-1" />
                      <div className="text-xs text-gray-500">{metric.description}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Department-wise Faculty Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departmentFaculty.map((dept, index) => (
                  <div key={index} className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <Users className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{dept.name}</h3>
                          <p className="text-sm text-gray-500">{dept.faculty} faculty members</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{dept.phd}</div>
                          <div className="text-sm text-gray-500">PhD</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-gray-900">{dept.experience}</div>
                          <div className="text-sm text-gray-500">Avg. Exp.</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-yellow-600">★ {dept.rating}</div>
                          <div className="text-sm text-gray-500">Rating</div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Edit className="w-4 h-4 mr-2" />
                              Manage
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Teaching Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Excellent (4.5+)</span>
                    <span className="font-medium">68%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Good (4.0-4.4)</span>
                    <span className="font-medium">24%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Average (3.5-3.9)</span>
                    <span className="font-medium">7%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Below Average</span>
                    <span className="font-medium">1%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Research Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Publications</span>
                    <span className="font-medium">142</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Citations</span>
                    <span className="font-medium">1,247</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Patents</span>
                    <span className="font-medium">23</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Projects</span>
                    <span className="font-medium">67</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg">Qualifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">PhD</span>
                    <span className="font-medium">72%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Masters</span>
                    <span className="font-medium">28%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Industry Experience</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Certifications</span>
                    <span className="font-medium">89%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="development" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Development Programs</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Teaching Excellence</span>
                      <Badge variant="outline" className="bg-green-100 text-green-700">Active</Badge>
                    </div>
                    <div className="text-xs text-green-600">24 faculty enrolled</div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Research Methodology</span>
                      <Badge variant="outline" className="bg-blue-100 text-blue-700">Ongoing</Badge>
                    </div>
                    <div className="text-xs text-blue-600">18 faculty enrolled</div>
                  </div>
                  
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Technology Integration</span>
                      <Badge variant="outline" className="bg-purple-100 text-purple-700">Starting</Badge>
                    </div>
                    <div className="text-xs text-purple-600">32 faculty enrolled</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span>Upcoming Events</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">Faculty Development Workshop</span>
                      <Badge variant="outline">Dec 15</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Professional growth and skills enhancement</div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">Research Symposium</span>
                      <Badge variant="outline">Dec 20</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Annual research presentation and networking</div>
                  </div>
                  
                  <div className="p-4 bg-white rounded-lg border border-gray-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-800">Industry Connect</span>
                      <Badge variant="outline">Dec 25</Badge>
                    </div>
                    <div className="text-xs text-gray-600">Industry-academia collaboration meet</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ChairmanFacultyDesktop;
