import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  Lock, 
  Play, 
  Network,
  Globe,
  Server,
  Router,
  Shield,
  Zap,
  BarChart3
} from "lucide-react";

interface NetworkingChallengesCardProps {
  onViewChallenges: () => void;
}

const challengeStats = {
  total: 16,
  completed: 0,
  available: 14,
  locked: 2,
  totalPoints: 2800
};

const moduleStats = [
  { module: "tcp", count: 2, icon: <Server className="h-4 w-4" />, color: "bg-blue-100 text-blue-800" },
  { module: "dns", count: 2, icon: <Globe className="h-4 w-4" />, color: "bg-green-100 text-green-800" },
  { module: "subnet", count: 2, icon: <Network className="h-4 w-4" />, color: "bg-purple-100 text-purple-800" },
  { module: "topology", count: 2, icon: <Router className="h-4 w-4" />, color: "bg-orange-100 text-orange-800" },
  { module: "protocol", count: 2, icon: <BarChart3 className="h-4 w-4" />, color: "bg-red-100 text-red-800" },
  { module: "security", count: 2, icon: <Shield className="h-4 w-4" />, color: "bg-yellow-100 text-yellow-800" },
  { module: "performance", count: 2, icon: <Zap className="h-4 w-4" />, color: "bg-indigo-100 text-indigo-800" }
];

export default function NetworkingChallengesCard({ onViewChallenges }: NetworkingChallengesCardProps) {
  return (
    <Card className="h-96 flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-600" />
            <CardTitle className="text-xl">Networking Challenges</CardTitle>
          </div>
          <Badge variant="outline" className="text-sm">
            {challengeStats.total} Challenges
          </Badge>
        </div>
        <CardDescription>
          Test your networking knowledge with hands-on challenges covering all networking concepts
        </CardDescription>
      </CardHeader>
      
      <CardContent className="flex-1 space-y-6">
        {/* Progress Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">{challengeStats.completed}/{challengeStats.total}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${(challengeStats.completed / challengeStats.total) * 100}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>{challengeStats.available} Available</span>
            <span>{challengeStats.locked} Locked</span>
            <span>{challengeStats.totalPoints} pts</span>
          </div>
        </div>

        {/* Module Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-muted-foreground">Challenges by Module</h4>
          <div className="grid grid-cols-2 gap-2">
            {moduleStats.map((stat) => (
              <div key={stat.module} className="flex items-center space-x-2 p-2 rounded-lg bg-gray-50">
                <div className={`p-1 rounded ${stat.color}`}>
                  {stat.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium capitalize truncate">{stat.module}</p>
                  <p className="text-xs text-muted-foreground">{stat.count} challenges</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="p-2 bg-blue-50 rounded-lg">
            <div className="text-lg font-bold text-blue-600">{challengeStats.available}</div>
            <div className="text-xs text-blue-600">Available</div>
          </div>
          <div className="p-2 bg-green-50 rounded-lg">
            <div className="text-lg font-bold text-green-600">{challengeStats.completed}</div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
          <div className="p-2 bg-yellow-50 rounded-lg">
            <div className="text-lg font-bold text-yellow-600">{challengeStats.totalPoints}</div>
            <div className="text-xs text-yellow-600">Points</div>
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={onViewChallenges}
          className="w-full bg-hero-gradient hover:opacity-90 transition-opacity"
        >
          <Play className="h-4 w-4 mr-2" />
          View All Challenges
        </Button>
      </CardContent>
    </Card>
  );
}
