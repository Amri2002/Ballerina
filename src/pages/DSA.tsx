import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import { 
  GitBranch, 
  Play, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  BarChart3,
  TreePine,
  Hash,
  Layers
} from "lucide-react";

const algorithms = [
  {
    id: "sorting",
    title: "Sorting Algorithms",
    description: "Visualize bubble sort, merge sort, quicksort and more",
    duration: "45 min",
    difficulty: "Beginner",
    completed: false,
    icon: <BarChart3 className="h-5 w-5" />
  },
  {
    id: "trees",
    title: "Tree Traversals",
    description: "DFS, BFS, and tree manipulation algorithms",
    duration: "60 min", 
    difficulty: "Intermediate",
    completed: false,
    icon: <TreePine className="h-5 w-5" />
  },
  {
    id: "hashing",
    title: "Hash Tables",
    description: "Hash functions, collision resolution, and performance",
    duration: "40 min",
    difficulty: "Intermediate", 
    completed: false,
    icon: <Hash className="h-5 w-5" />
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    description: "LIFO and FIFO data structures with real-world examples",
    duration: "35 min",
    difficulty: "Beginner",
    completed: false,
    icon: <Layers className="h-5 w-5" />
  }
];

export default function DSA() {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<string | null>(null);

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-hero-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              <GitBranch className="mr-2 h-4 w-4" />
              Data Structures & Algorithms
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Visualize Algorithms
              <span className="block text-secondary">In Real-Time</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Master sorting algorithms, tree traversals, and data structures through interactive visualizations and step-by-step code execution.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Self-paced
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Beginner friendly
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Certificate included
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="lessons" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="lessons">Lessons</TabsTrigger>
              <TabsTrigger value="playground">Playground</TabsTrigger>
              <TabsTrigger value="challenges">Challenges</TabsTrigger>
            </TabsList>
            
            <TabsContent value="lessons" className="mt-8">
              <div className="grid gap-6">
                {algorithms.map((algorithm, index) => (
                  <Card key={algorithm.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {algorithm.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold">
                              {algorithm.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {algorithm.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={difficultyColors[algorithm.difficulty as keyof typeof difficultyColors]}>
                            {algorithm.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {algorithm.duration}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Lesson {index + 1} of {algorithms.length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedAlgorithm(algorithm.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Lesson
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="playground" className="mt-8">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Play className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Interactive Playground</h3>
                  <p className="text-muted-foreground max-w-md">
                    Experiment with algorithms using custom input data. Test edge cases and see how algorithms perform with different datasets.
                  </p>
                  <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
                    Launch Playground
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="challenges" className="mt-8">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Coding Challenges</h3>
                  <p className="text-muted-foreground max-w-md">
                    Put your knowledge to the test with hands-on coding challenges. Get instant feedback and hints when you're stuck.
                  </p>
                  <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
                    Start Challenges
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}