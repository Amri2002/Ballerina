import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Target, TrendingUp, Clock, Award, BookOpen, CheckCircle, Star } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface ModuleProgress {
  completed: number;
  total: number;
  progress: number;
  lastAccessed?: string;
  achievements: string[];
}

interface LearningAnalytics {
  userId: string;
  timestamp: string;
  modules: {
    tcpHandshake: ModuleProgress;
    dnsResolution: ModuleProgress;
    subnetCalculator: ModuleProgress;
    networkTopology: ModuleProgress;
    protocolAnalysis: ModuleProgress;
    securityScanning: ModuleProgress;
  };
  achievements: Achievement[];
  totalProgress: number;
  timeSpent: number;
  streak: number;
  level: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string;
  category: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

const LearningAnalytics: React.FC = () => {
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState<LearningAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);



  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/networking/analytics/user?userId=${user?.id || 'demo-user'}`);
        if (response.ok) {
          const data = await response.json();
          // Only set analytics if we have valid data
          if (data && data.modules && data.achievements) {
            setAnalytics(data);
          } else {
            setAnalytics(null);
          }
        } else {
          // No data available if API fails
          setAnalytics(null);
        }
      } catch (error) {
        console.error('Error fetching analytics:', error);
        setAnalytics(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [user?.id]);

  const getRarityColor = (rarity: string) => {
    const colors: { [key: string]: string } = {
      common: 'bg-gray-100 text-gray-800',
      rare: 'bg-blue-100 text-blue-800',
      epic: 'bg-purple-100 text-purple-800',
      legendary: 'bg-yellow-100 text-yellow-800'
    };
    return colors[rarity] || 'bg-gray-100 text-gray-800';
  };

  const getRarityIcon = (rarity: string) => {
    switch (rarity) {
      case 'legendary':
        return <Star className="h-4 w-4 text-yellow-600" />;
      case 'epic':
        return <Award className="h-4 w-4 text-purple-600" />;
      case 'rare':
        return <Trophy className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatTime = (minutes: number) => {
    if (!minutes || minutes <= 0) return '0h 0m';
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const getModuleIcon = (moduleName: string) => {
    const icons: { [key: string]: string } = {
      tcpHandshake: '🔗',
      dnsResolution: '🌐',
      subnetCalculator: '🧮',
      networkTopology: '🏗️',
      protocolAnalysis: '📊',
      securityScanning: '🛡️'
    };
    return icons[moduleName] || '📚';
  };

  const getModuleName = (moduleKey: string) => {
    const names: { [key: string]: string } = {
      tcpHandshake: 'TCP Handshake',
      dnsResolution: 'DNS Resolution',
      subnetCalculator: 'Subnet Calculator',
      networkTopology: 'Network Topology',
      protocolAnalysis: 'Protocol Analysis',
      securityScanning: 'Security Scanning'
    };
    return names[moduleKey] || moduleKey;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertDescription>
            No learning analytics data available. Complete some networking modules to see your progress and achievements.
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader>
            <CardTitle>Getting Started</CardTitle>
            <CardDescription>Start learning to unlock analytics and achievements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🔗</div>
                <div className="font-medium">TCP Handshake</div>
                <div className="text-sm text-gray-500">Learn the fundamentals</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🌐</div>
                <div className="font-medium">DNS Resolution</div>
                <div className="text-sm text-gray-500">Understand domain names</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-3xl mb-2">🧮</div>
                <div className="font-medium">Subnet Calculator</div>
                <div className="text-sm text-gray-500">Master IP addressing</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Target className="h-4 w-4 text-blue-600" />
              <span>Overall Progress</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{analytics.totalProgress || 0}%</div>
            <Progress value={analytics.totalProgress || 0} className="mt-2" />
            <p className="text-xs text-gray-500 mt-1">Level {analytics.level || 1}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Clock className="h-4 w-4 text-green-600" />
              <span>Time Spent</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatTime(analytics.timeSpent || 0)}</div>
            <p className="text-xs text-gray-500 mt-1">Total learning time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <Trophy className="h-4 w-4 text-yellow-600" />
              <span>Achievements</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{analytics.achievements?.length || 0}</div>
            <p className="text-xs text-gray-500 mt-1">Unlocked badges</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              <span>Streak</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{analytics.streak || 0} days</div>
            <p className="text-xs text-gray-500 mt-1">Learning streak</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Learning Progress</CardTitle>
          <CardDescription>Track your progress across all networking modules</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="modules" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="modules">Modules</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
              <TabsTrigger value="insights">Insights</TabsTrigger>
            </TabsList>

            <TabsContent value="modules" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.modules && Object.entries(analytics.modules).map(([key, module]) => (
                  <Card key={key} className="border-l-4 border-l-blue-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl">{getModuleIcon(key)}</span>
                          <div>
                            <div className="font-medium">{getModuleName(key)}</div>
                            <div className="text-sm text-gray-500">
                              {module?.completed || 0}/{module?.total || 0} completed
                            </div>
                          </div>
                        </div>
                        <Badge variant="outline">{module?.progress || 0}%</Badge>
                      </div>
                      <Progress value={module?.progress || 0} className="mb-3" />
                      {module?.lastAccessed && (
                        <div className="text-xs text-gray-500">
                          Last accessed: {new Date(module.lastAccessed).toLocaleDateString()}
                        </div>
                      )}
                      {module?.achievements && module.achievements.length > 0 && (
                        <div className="flex space-x-1 mt-2">
                          {module.achievements.map((achievementId) => {
                            const achievement = analytics.achievements?.find(a => a.id === achievementId);
                            return achievement ? (
                              <Badge key={achievementId} className={getRarityColor(achievement.rarity)}>
                                {achievement.icon} {achievement.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics.achievements?.map((achievement) => (
                  <Card key={achievement.id} className="border-l-4 border-l-yellow-500">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="text-3xl">{achievement.icon}</div>
                          <div>
                            <div className="font-medium">{achievement.name}</div>
                            <div className="text-sm text-gray-600">{achievement.description}</div>
                            <div className="text-xs text-gray-500 mt-1">
                              Unlocked: {new Date(achievement.unlockedAt).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getRarityIcon(achievement.rarity)}
                          <Badge className={getRarityColor(achievement.rarity)}>
                            {achievement.rarity}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="insights" className="space-y-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Learning Insights</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between p-2 bg-blue-50 rounded">
                        <span className="text-sm font-medium">Most Active Module</span>
                        <span className="text-sm text-blue-600">TCP Handshake</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-green-50 rounded">
                        <span className="text-sm font-medium">Best Performance</span>
                        <span className="text-sm text-green-600">Subnet Calculator</span>
                      </div>
                      <div className="flex items-center justify-between p-2 bg-yellow-50 rounded">
                        <span className="text-sm font-medium">Needs Attention</span>
                        <span className="text-sm text-yellow-600">Protocol Analysis</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-start space-x-2">
                        <BookOpen className="h-4 w-4 text-blue-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Complete Protocol Analysis</div>
                          <div className="text-gray-600">You're 25% through this module</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Target className="h-4 w-4 text-green-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Practice Security Scanning</div>
                          <div className="text-gray-600">Try advanced scan types</div>
                        </div>
                      </div>
                      <div className="flex items-start space-x-2">
                        <Trophy className="h-4 w-4 text-yellow-600 mt-0.5" />
                        <div className="text-sm">
                          <div className="font-medium">Achieve Network Architect</div>
                          <div className="text-gray-600">Design 3 more topologies</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Learning Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">6</div>
                        <div className="text-sm text-gray-600">Modules Available</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">18</div>
                        <div className="text-sm text-gray-600">Exercises Completed</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-purple-600">4</div>
                        <div className="text-sm text-gray-600">Achievements Unlocked</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-yellow-600">7</div>
                        <div className="text-sm text-gray-600">Day Streak</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Alert>
        <TrendingUp className="h-4 w-4" />
        <AlertDescription>
          Your learning analytics help track progress and provide personalized recommendations. 
          Keep learning to unlock more achievements and improve your networking skills!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default LearningAnalytics;
