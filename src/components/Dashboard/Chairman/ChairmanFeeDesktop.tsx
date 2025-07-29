
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Badge } from '../../ui/badge';
import { Button } from '../../ui/button';
import { Progress } from '../../ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../ui/tabs';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  CreditCard,
  Award,
  AlertCircle,
  Search,
  Filter,
  Download,
  Eye,
  Edit,
  MoreHorizontal,
  ArrowUpRight,
  ArrowDownRight,
  PieChart,
  BarChart3,
  FileText,
  CheckCircle,
  Clock,
  XCircle,
  Target,
  Sparkles
} from 'lucide-react';
import { Input } from '../../ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../../ui/dropdown-menu';
import { useFeeTypeAnalytics } from '../../../hooks/useFeeTypeAnalytics';
import { useScholarshipStats } from '../../../hooks/useScholarshipStats';
import { formatCurrency } from '../../../utils/feeValidation';

const ChairmanFeeDesktop: React.FC = () => {
  const [selectedView, setSelectedView] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  
  const { analytics, getTotalStats } = useFeeTypeAnalytics();
  const { stats: scholarshipStats, loading: scholarshipLoading } = useScholarshipStats();
  
  const totalStats = getTotalStats();
  const collectionRate = totalStats.totalFees > 0 ? (totalStats.totalCollected / totalStats.totalFees) * 100 : 0;

  const feeMetrics = [
    {
      title: 'Total Revenue',
      value: formatCurrency(totalStats.totalCollected),
      change: '+12.5%',
      trend: 'up',
      description: 'Total fees collected',
      icon: DollarSign,
      color: 'green',
      bgGradient: 'from-green-500/10 to-emerald-500/10'
    },
    {
      title: 'Collection Rate',
      value: `${collectionRate.toFixed(1)}%`,
      change: '+8.3%',
      trend: 'up',
      description: 'Overall collection efficiency',
      icon: Target,
      color: 'blue',
      bgGradient: 'from-blue-500/10 to-cyan-500/10'
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(totalStats.totalPending),
      change: '-15.2%',
      trend: 'down',
      description: 'Outstanding fees',
      icon: Clock,
      color: 'yellow',
      bgGradient: 'from-yellow-500/10 to-orange-500/10'
    },
    {
      title: 'Scholarships',
      value: scholarshipLoading ? '...' : formatCurrency(scholarshipStats.totalReceivedAmount),
      change: '+23.7%',
      trend: 'up',
      description: 'Financial aid distributed',
      icon: Award,
      color: 'purple',
      bgGradient: 'from-purple-500/10 to-indigo-500/10'
    }
  ];

  const feeTypePerformance = analytics.slice(0, 5).map(item => ({
    name: item.fee_type_name,
    collected: item.total_collected,
    pending: item.total_pending,
    rate: item.collection_percentage,
    students: item.total_students
  }));

  const monthlyTrends = [
    { month: 'Jan', collected: 2400000, target: 2500000 },
    { month: 'Feb', collected: 2600000, target: 2700000 },
    { month: 'Mar', collected: 2800000, target: 2900000 },
    { month: 'Apr', collected: 3100000, target: 3200000 },
    { month: 'May', collected: 2900000, target: 3000000 },
    { month: 'Jun', collected: 3300000, target: 3400000 }
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

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ? ArrowUpRight : ArrowDownRight;
  };

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Financial Management</h1>
          <p className="text-lg text-gray-600">Comprehensive financial oversight and fee collection analytics</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Search fees, students..."
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
            <FileText className="w-4 h-4 mr-2" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Enhanced Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {feeMetrics.map((metric, index) => {
          const TrendIcon = getTrendIcon(metric.trend);
          return (
            <Card key={index} className={`relative overflow-hidden bg-gradient-to-br ${metric.bgGradient} border-0 shadow-lg hover:shadow-xl transition-all duration-300 group cursor-pointer`}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-3 rounded-xl ${getColorClasses(metric.color)} group-hover:scale-110 transition-transform duration-300`}>
                    <metric.icon className="w-6 h-6" />
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendIcon className={`w-4 h-4 ${metric.trend === 'up' ? 'text-green-500' : 'text-red-500'}`} />
                    <span className={`text-sm font-medium ${metric.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                      {metric.change}
                    </span>
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
          );
        })}
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4 bg-gray-100 rounded-2xl p-2 h-14">
          <TabsTrigger value="overview" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <BarChart3 className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <PieChart className="w-4 h-4 mr-2" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="collections" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <CreditCard className="w-4 h-4 mr-2" />
            Collections
          </TabsTrigger>
          <TabsTrigger value="scholarships" className="rounded-xl text-sm font-medium h-10 data-[state=active]:bg-white data-[state=active]:shadow-md">
            <Sparkles className="w-4 h-4 mr-2" />
            Scholarships
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Collection Performance */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  <span>Collection Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {feeTypePerformance.slice(0, 3).map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-100 hover:shadow-md transition-shadow">
                      <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                          index === 0 ? 'bg-green-500 text-white' : 
                          index === 1 ? 'bg-blue-500 text-white' : 
                          'bg-purple-500 text-white'
                        }`}>
                          {item.rate.toFixed(0)}%
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{formatCurrency(item.collected)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium text-gray-900">{item.students}</div>
                        <div className="text-sm text-gray-500">Students</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Monthly Trends */}
            <Card className="shadow-lg border-0 bg-gradient-to-br from-white to-gray-50">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="w-5 h-5 text-blue-600" />
                  <span>Monthly Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyTrends.slice(-3).map((month, index) => (
                    <div key={index} className="p-4 bg-white rounded-lg border border-gray-100">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">{month.month}</span>
                        <span className="text-lg font-bold text-gray-900">{formatCurrency(month.collected)}</span>
                      </div>
                      <Progress value={(month.collected / month.target) * 100} className="h-2 mb-1" />
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Target: {formatCurrency(month.target)}</span>
                        <span>{((month.collected / month.target) * 100).toFixed(1)}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card className="shadow-lg border-0">
            <CardHeader>
              <CardTitle>Fee Type Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feeTypePerformance.map((item, index) => (
                  <div key={index} className="p-6 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                          <p className="text-sm text-gray-500">{item.students} students</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-6">
                        <div className="text-center">
                          <div className="font-medium text-green-600">{formatCurrency(item.collected)}</div>
                          <div className="text-sm text-gray-500">Collected</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-orange-600">{formatCurrency(item.pending)}</div>
                          <div className="text-sm text-gray-500">Pending</div>
                        </div>
                        <div className="text-center">
                          <div className="font-medium text-blue-600">{item.rate.toFixed(1)}%</div>
                          <div className="text-sm text-gray-500">Rate</div>
                        </div>
                        <div className="w-24">
                          <Progress value={item.rate} className="h-2" />
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

        <TabsContent value="collections" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>Collection Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Completed</span>
                    <span className="font-medium text-green-600">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">In Progress</span>
                    <span className="font-medium text-blue-600">15%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Pending</span>
                    <span className="font-medium text-orange-600">5%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Overdue</span>
                    <span className="font-medium text-red-600">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <span>Payment Methods</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Online Payment</span>
                    <span className="font-medium">65%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Bank Transfer</span>
                    <span className="font-medium">25%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Cash</span>
                    <span className="font-medium">8%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Others</span>
                    <span className="font-medium">2%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="text-lg flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5 text-orange-600" />
                  <span>Outstanding Issues</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Payment Delays</span>
                    <span className="font-medium text-orange-600">42</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Disputes</span>
                    <span className="font-medium text-red-600">8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Refunds Pending</span>
                    <span className="font-medium text-blue-600">15</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">System Issues</span>
                    <span className="font-medium text-purple-600">3</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="scholarships" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="w-5 h-5 text-purple-600" />
                  <span>Scholarship Distribution</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-purple-50 rounded-lg border border-purple-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-purple-800">Total Recipients</span>
                      <span className="text-lg font-bold text-purple-600">
                        {scholarshipStats.scholarshipStudents}
                      </span>
                    </div>
                    <div className="text-xs text-purple-600">
                      {formatCurrency(scholarshipStats.totalReceivedAmount)} distributed
                    </div>
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">PMSS Scholarships</span>
                      <span className="text-lg font-bold text-blue-600">
                        {scholarshipStats.pmssScholarships}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">Prime Minister's Scholarship</div>
                  </div>
                  
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">FG Scholarships</span>
                      <span className="text-lg font-bold text-green-600">
                        {scholarshipStats.fgScholarships}
                      </span>
                    </div>
                    <div className="text-xs text-green-600">First Generation Learners</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-0">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="w-5 h-5 text-green-600" />
                  <span>Impact Metrics</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-50 rounded-lg border border-green-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-green-800">Success Rate</span>
                      <span className="text-lg font-bold text-green-600">
                        {scholarshipStats.appliedScholarships > 0 ? 
                          ((scholarshipStats.receivedScholarships / scholarshipStats.appliedScholarships) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <Progress value={
                      scholarshipStats.appliedScholarships > 0 ? 
                        (scholarshipStats.receivedScholarships / scholarshipStats.appliedScholarships) * 100 : 0
                    } className="h-2" />
                  </div>
                  
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-blue-800">Applications</span>
                      <span className="text-lg font-bold text-blue-600">
                        {scholarshipStats.appliedScholarships}
                      </span>
                    </div>
                    <div className="text-xs text-blue-600">Total applications submitted</div>
                  </div>
                  
                  <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-yellow-800">Approved</span>
                      <span className="text-lg font-bold text-yellow-600">
                        {scholarshipStats.receivedScholarships}
                      </span>
                    </div>
                    <div className="text-xs text-yellow-600">Successfully approved scholarships</div>
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

export default ChairmanFeeDesktop;
