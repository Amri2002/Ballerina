import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Header } from "@/components/Navigation/Header";
import { useAuth } from "@/contexts/AuthContext";
import { dsaService } from "@/services/dsaService";
import { progressService } from "@/services/progressService";
import { 
  BookOpen, 
  Clock, 
  Award, 
  TrendingUp,
  PlayCircle,
  CheckCircle2,
  Calendar,
  Target
} from "lucide-react";

export default function Dashboard() {
  const { user } = useAuth();
  const [learningStats, setLearningStats] = useState([
    { title: "Modules Completed", value: "-", icon: <CheckCircle2 className="h-5 w-5" />, change: "" },
    { title: "Learning Streak", value: <span title="Not tracked yet">-</span>, icon: <Calendar className="h-5 w-5" />, change: <span title="No streak data in backend">days</span> },
    { title: "Certificates Earned", value: <span title="Not tracked yet">-</span>, icon: <Award className="h-5 w-5" />, change: <span title="No certificate data in backend"></span> },
    { title: "Study Time", value: <span title="Not tracked yet">-</span>, icon: <Clock className="h-5 w-5" />, change: <span title="No study time data in backend"></span> }
  ]);
  const [currentModules, setCurrentModules] = useState([]);
  const [achievements, setAchievements] = useState([]);

  useEffect(() => {
    async function fetchDashboardData() {
      // Fetch DSA progress
      const dsaProgress = await dsaService.getUserProgress();
      // Fetch Database progress
      const dbProgress = await progressService.getUserProgress();
      // Example: Combine all completed modules
      const completedCount = (dsaProgress.completedModules?.length || 0) + (dbProgress.completedModules?.length || 0);

      // Example: Fetch current modules (could be from user profile or progress)
      // Here, just show incomplete modules from DSA and Database
      const dsaModules = [
        { title: "Sorting Algorithms", subject: "Data Structures & Algorithms", difficulty: "Beginner", id: "sorting" },
        { title: "Dynamic Programming", subject: "Data Structures & Algorithms", difficulty: "Advanced", id: "dynamic-programming" }
      ];
      const dbModules = [
        { title: "SQL Joins", subject: "Database Systems", difficulty: "Intermediate", id: "sql-joins" }
      ];
      // Filter out completed
      const incompleteDsa = dsaModules.filter(m => !(dsaProgress.completedModules || []).includes(m.id));
      const incompleteDb = dbModules.filter(m => !(dbProgress.completedModules || []).includes(m.id));
      // Add dummy progress and timeRemaining for demo
      const allCurrent = [
        ...incompleteDsa.map(m => ({ ...m, progress: 0, timeRemaining: "20 min" })),
        ...incompleteDb.map(m => ({ ...m, progress: 0, timeRemaining: "30 min" }))
      ];
      setCurrentModules(allCurrent);

      // Example: Achievements
      const earnedAchievements = [];
      if (completedCount > 0) earnedAchievements.push({ name: "First Steps", description: "Completed your first module", earned: true });
      if ((dsaProgress.completedModules?.length || 0) >= 5) earnedAchievements.push({ name: "Algorithm Master", description: "Completed 5 DSA modules", earned: true });
      if ((dbProgress.completedModules?.length || 0) > 0) earnedAchievements.push({ name: "Database Explorer", description: "Completed a database module", earned: true });
      // Add locked achievements
      earnedAchievements.push({ name: "Learning Streak", description: "7 day learning streak", earned: false });
      setAchievements(earnedAchievements);

      // Example: Stats
      setLearningStats([
        { title: "Modules Completed", value: completedCount.toString(), icon: <CheckCircle2 className="h-5 w-5" />, change: `+${completedCount} this week` },
        { title: "Learning Streak", value: <span title="Not tracked yet">-</span>, icon: <Calendar className="h-5 w-5" />, change: <span title="No streak data in backend">days</span> },
        { title: "Certificates Earned", value: <span title="Not tracked yet">-</span>, icon: <Award className="h-5 w-5" />, change: <span title="No certificate data in backend"></span> },
        { title: "Study Time", value: <span title="Not tracked yet">-</span>, icon: <Clock className="h-5 w-5" />, change: <span title="No study time data in backend"></span> }
      ]);
    }
    fetchDashboardData();
  }, [user]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Welcome back, {user?.name || 'User'}!
          </h1>
          <p className="text-muted-foreground">Continue your computer science learning journey</p>
          <p className="text-sm text-muted-foreground/80 mt-1">Signed in as: {user?.email}</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {learningStats.map((stat, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className="text-primary">{stat.icon}</div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.change}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Continue Learning */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="mr-2 h-5 w-5" />
                  Continue Learning
                </CardTitle>
                <CardDescription>Pick up where you left off</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {currentModules.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">No modules in progress. Start a new module!</div>
                ) : (
                  currentModules.map((module, index) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-2">
                          <h3 className="font-semibold text-foreground">{module.title}</h3>
                          <Badge variant="outline" className="text-xs">
                            {module.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">{module.subject}</p>
                        <div className="flex items-center space-x-4">
                          <div className="flex-1">
                            <div className="flex justify-between text-xs text-muted-foreground mb-1">
                              <span>Progress</span>
                              <span>{module.progress}%</span>
                            </div>
                            <Progress value={module.progress} className="h-2" />
                          </div>
                          <div className="text-xs text-muted-foreground flex items-center">
                            <Clock className="mr-1 h-3 w-3" />
                            {module.timeRemaining}
                          </div>
                        </div>
                      </div>
                      <Button size="sm" className="ml-4">
                        <PlayCircle className="mr-2 h-4 w-4" />
                        Continue
                      </Button>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Achievements */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="mr-2 h-5 w-5" />
                  Achievements
                </CardTitle>
                <CardDescription>Your learning milestones</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div key={index} className={`flex items-start space-x-3 p-2 rounded-lg ${achievement.earned ? 'bg-primary/5' : 'opacity-50'}`}>
                    <div className={`mt-0.5 ${achievement.earned ? 'text-primary' : 'text-muted-foreground'}`}>
                      {achievement.earned ? <CheckCircle2 className="h-4 w-4" /> : <Target className="h-4 w-4" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{achievement.name}</p>
                      <p className="text-xs text-muted-foreground">{achievement.description}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Learning Goals */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <TrendingUp className="mr-2 h-5 w-5" />
                  This Week's Goal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Complete 3 modules</span>
                      <span>{typeof learningStats[0]?.value === 'string' ? learningStats[0].value : '0'}/3</span>
                    </div>
                    <Progress value={Math.min(100, Math.round((typeof learningStats[0]?.value === 'string' ? parseInt(learningStats[0].value) : 0) / 3 * 100))} className="h-2" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {(() => {
                      const completed = typeof learningStats[0]?.value === 'string' ? parseInt(learningStats[0].value) : 0;
                      const left = 3 - completed;
                      return `You're doing great! Complete ${left} more module${left === 1 ? '' : 's'} to reach your weekly goal.`;
                    })()}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}