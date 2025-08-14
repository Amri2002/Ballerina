import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import { 
  ArrowLeft,
  Trophy,
  Star,
  Clock,
  CheckCircle,
  Lock,
  Play,
  BarChart3,
  TreePine,
  Hash,
  Layers
} from "lucide-react";

const challenges = [
  {
    id: 1,
    title: "Two Sum",
    description: "Find two numbers in an array that add up to a target sum",
    difficulty: "Easy",
    points: 100,
    timeLimit: "30 min",
    completed: true,
    locked: false,
    category: "Arrays",
    icon: <BarChart3 className="h-4 w-4" />,
    tags: ["Arrays", "Hash Table"]
  },
  {
    id: 2,
    title: "Valid Parentheses",
    description: "Determine if parentheses are properly matched using a stack",
    difficulty: "Easy",
    points: 150,
    timeLimit: "20 min",
    completed: true,
    locked: false,
    category: "Stack",
    icon: <Layers className="h-4 w-4" />,
    tags: ["Stack", "String"]
  },
  {
    id: 3,
    title: "Binary Tree Inorder Traversal",
    description: "Traverse a binary tree in inorder fashion",
    difficulty: "Medium",
    points: 200,
    timeLimit: "45 min",
    completed: false,
    locked: false,
    category: "Trees",
    icon: <TreePine className="h-4 w-4" />,
    tags: ["Tree", "DFS", "Recursion"]
  },
  {
    id: 4,
    title: "Group Anagrams",
    description: "Group strings that are anagrams of each other",
    difficulty: "Medium",
    points: 250,
    timeLimit: "40 min",
    completed: false,
    locked: false,
    category: "Hashing",
    icon: <Hash className="h-4 w-4" />,
    tags: ["Hash Table", "String", "Sorting"]
  },
  {
    id: 5,
    title: "Merge k Sorted Lists",
    description: "Merge k sorted linked lists into one sorted list",
    difficulty: "Hard",
    points: 400,
    timeLimit: "60 min",
    completed: false,
    locked: true,
    category: "Linked Lists",
    icon: <Layers className="h-4 w-4" />,
    tags: ["Linked List", "Divide and Conquer", "Heap"]
  },
  {
    id: 6,
    title: "Serialize Binary Tree",
    description: "Design an algorithm to serialize and deserialize a binary tree",
    difficulty: "Hard",
    points: 500,
    timeLimit: "75 min",
    completed: false,
    locked: true,
    category: "Trees",
    icon: <TreePine className="h-4 w-4" />,
    tags: ["Tree", "DFS", "BFS", "Design"]
  }
];

const achievements = [
  { id: 1, title: "First Steps", description: "Complete your first challenge", icon: "🎯", unlocked: true },
  { id: 2, title: "Speed Demon", description: "Solve 3 challenges in under 20 minutes each", icon: "⚡", unlocked: true },
  { id: 3, title: "Tree Explorer", description: "Complete all tree-related challenges", icon: "🌳", unlocked: false },
  { id: 4, title: "Hash Master", description: "Master all hashing challenges", icon: "#️⃣", unlocked: false },
  { id: 5, title: "Algorithm Guru", description: "Complete all challenges with optimal solutions", icon: "🧠", unlocked: false },
];

export default function DSAChallenges() {
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const difficultyColors = {
    Easy: "border-success text-success",
    Medium: "border-warning text-warning",
    Hard: "border-destructive text-destructive"
  };

  const categoryColors = {
    Arrays: "bg-primary/10 text-primary",
    Stack: "bg-info/10 text-info",
    Trees: "bg-success/10 text-success",
    Hashing: "bg-warning/10 text-warning",
    "Linked Lists": "bg-purple-100 text-purple-800"
  };

  const filteredChallenges = challenges.filter(challenge => {
    const difficultyMatch = selectedDifficulty === "all" || challenge.difficulty.toLowerCase() === selectedDifficulty;
    const categoryMatch = selectedCategory === "all" || challenge.category.toLowerCase() === selectedCategory.toLowerCase();
    return difficultyMatch && categoryMatch;
  });

  const totalPoints = challenges.filter(c => c.completed).reduce((sum, c) => sum + c.points, 0);
  const completedChallenges = challenges.filter(c => c.completed).length;
  const totalChallenges = challenges.length;
  const progress = (completedChallenges / totalChallenges) * 100;

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Header */}
      <section className="border-b bg-muted/30">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" asChild>
                <Link to="/dsa">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to DSA
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Coding Challenges</h1>
                <p className="text-muted-foreground">Test your algorithm skills with hands-on problems</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalPoints}</div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">
                {completedChallenges} of {totalChallenges} challenges completed
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-8">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="challenges" className="w-full">
            <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto">
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
              <TabsTrigger value="achievements">Achievements</TabsTrigger>
            </TabsList>
            
            <TabsContent value="challenges" className="mt-8">
              {/* Filters */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Difficulty:</span>
                  <div className="flex space-x-1">
                    {["all", "easy", "medium", "hard"].map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={selectedDifficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedDifficulty(difficulty)}
                        className="capitalize"
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">Category:</span>
                  <div className="flex space-x-1">
                    {["all", "arrays", "trees", "hashing", "stack"].map((category) => (
                      <Button
                        key={category}
                        variant={selectedCategory === category ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedCategory(category)}
                        className="capitalize"
                      >
                        {category}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Challenges Grid */}
              <div className="grid gap-6">
                {filteredChallenges.map((challenge) => (
                  <Card key={challenge.id} className={`group transition-all duration-300 ${
                    challenge.locked 
                      ? "opacity-60" 
                      : "hover:shadow-lg hover:-translate-y-1"
                  }`}>
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            challenge.completed 
                              ? "bg-success/10 text-success"
                              : challenge.locked
                              ? "bg-muted text-muted-foreground"
                              : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          }`}>
                            {challenge.locked ? (
                              <Lock className="h-5 w-5" />
                            ) : challenge.completed ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              challenge.icon
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <CardTitle className="text-lg font-semibold">
                                {challenge.title}
                              </CardTitle>
                              {challenge.completed && (
                                <CheckCircle className="h-5 w-5 text-success" />
                              )}
                            </div>
                            <CardDescription className="text-muted-foreground">
                              {challenge.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="text-right space-y-2">
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline" className={difficultyColors[challenge.difficulty as keyof typeof difficultyColors]}>
                              {challenge.difficulty}
                            </Badge>
                            <Badge variant="outline" className="text-muted-foreground">
                              <Clock className="mr-1 h-3 w-3" />
                              {challenge.timeLimit}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Star className="h-4 w-4 text-warning" />
                            <span>{challenge.points} pts</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Tags */}
                      <div className="flex flex-wrap gap-2 mt-3">
                        <Badge className={categoryColors[challenge.category as keyof typeof categoryColors]}>
                          {challenge.category}
                        </Badge>
                        {challenge.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Challenge #{challenge.id}
                        </div>
                        <Button 
                          className={challenge.completed ? "bg-success hover:bg-success/90" : "bg-hero-gradient hover:opacity-90 transition-opacity"}
                          disabled={challenge.locked}
                        >
                          {challenge.locked ? (
                            <>
                              <Lock className="mr-2 h-4 w-4" />
                              Locked
                            </>
                          ) : challenge.completed ? (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Completed
                            </>
                          ) : (
                            <>
                              <Play className="mr-2 h-4 w-4" />
                              Start Challenge
                            </>
                          )}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="achievements" className="mt-8">
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.map((achievement) => (
                  <Card key={achievement.id} className={`${
                    achievement.unlocked 
                      ? "border-success bg-success/5" 
                      : "opacity-60"
                  }`}>
                    <CardHeader className="text-center">
                      <div className="text-4xl mb-2">{achievement.icon}</div>
                      <CardTitle className={`${
                        achievement.unlocked ? "text-success" : "text-muted-foreground"
                      }`}>
                        {achievement.title}
                      </CardTitle>
                      <CardDescription>
                        {achievement.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="text-center">
                      {achievement.unlocked ? (
                        <Badge className="bg-success text-success-foreground">
                          <Trophy className="mr-1 h-3 w-3" />
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="text-muted-foreground">
                          <Lock className="mr-1 h-3 w-3" />
                          Locked
                        </Badge>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}