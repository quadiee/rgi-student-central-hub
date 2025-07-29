
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Users, 
  BarChart3, 
  MessageSquare, 
  Calendar, 
  FileText, 
  AlertTriangle,
  Video,
  Settings,
  Bell,
  TrendingUp,
  DollarSign,
  GraduationCap
} from 'lucide-react';

const StrategicActionCenter: React.FC = () => {
  const criticalActions = [
    {
      id: 'board-meeting',
      title: 'Board Meeting',
      description: 'Schedule next board meeting',
      icon: Calendar,
      priority: 'high',
      action: () => console.log('Board meeting')
    },
    {
      id: 'financial-review',
      title: 'Financial Review',
      description: 'Q3 financial analysis due',
      icon: DollarSign,
      priority: 'medium',
      action: () => console.log('Financial review')
    },
    {
      id: 'emergency-alert',
      title: 'Emergency Alert',
      description: 'Broadcast to all stakeholders',
      icon: AlertTriangle,
      priority: 'critical',
      action: () => console.log('Emergency alert')
    }
  ];

  const quickActions = [
    {
      category: 'Communication',
      actions: [
        { title: 'All Faculty', icon: MessageSquare, count: 24 },
        { title: 'Department Heads', icon: Users, count: 5 },
        { title: 'Student Body', icon: GraduationCap, count: 1248 },
        { title: 'Board Members', icon: Video, count: 7 }
      ]
    },
    {
      category: 'Analytics',
      actions: [
        { title: 'Executive Report', icon: FileText, count: null },
        { title: 'Performance Metrics', icon: TrendingUp, count: null },
        { title: 'Financial Dashboard', icon: BarChart3, count: null },
        { title: 'System Settings', icon: Settings, count: null }
      ]
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-500 text-white hover:bg-red-600';
      case 'high':
        return 'bg-orange-500 text-white hover:bg-orange-600';
      case 'medium':
        return 'bg-blue-500 text-white hover:bg-blue-600';
      default:
        return 'bg-gray-500 text-white hover:bg-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Critical Actions */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-purple-600" />
              <span>Priority Actions</span>
            </CardTitle>
            <Badge variant="outline" className="bg-purple-100 text-purple-700 border-purple-200">
              {criticalActions.length} Pending
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {criticalActions.map((action) => (
              <div
                key={action.id}
                className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <action.icon className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{action.title}</p>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className={getPriorityBadge(action.priority)}>
                    {action.priority}
                  </Badge>
                  <Button
                    size="sm"
                    className={getPriorityColor(action.priority)}
                    onClick={action.action}
                  >
                    Action
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {quickActions.map((category) => (
          <Card key={category.category} className="border-gray-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-800">
                {category.category}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {category.actions.map((action, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center space-y-2 hover:bg-purple-50 hover:border-purple-200 transition-all group"
                  >
                    <action.icon className="w-5 h-5 text-gray-600 group-hover:text-purple-600" />
                    <span className="text-xs font-medium text-center">{action.title}</span>
                    {action.count && (
                      <Badge variant="secondary" className="text-xs px-1">
                        {action.count}
                      </Badge>
                    )}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StrategicActionCenter;
