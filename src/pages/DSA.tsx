import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import { AlgorithmVisualizer } from "@/components/DSA/AlgorithmVisualizer";
import {DataStructurePlayground} from "@/components/DSA/DataStructurePlayground";
import { CodeEditor } from "@/components/DSA/CodeEditor";
import { DSALearningModule } from "@/components/DSA/DSALearningModule";
import { GraphVisualizer } from "@/components/DSA/GraphVisualizer";
import { 
  Cpu, 
  Play, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  GitBranch,
  Layers,
  Zap,
  BarChart3,
  Check,
  Code2,
  Network
} from "lucide-react";
import { progressService } from "@/services/progressService";

const dsaTopics = [
  {
    id: "arrays-strings",
    title: "Arrays & Strings",
    description: "Master fundamental data structures with interactive manipulation",
    duration: "45 min",
    difficulty: "Beginner",
    icon: <Layers className="h-5 w-5" />,
    complexity: "O(1) - O(n)"
  },
  {
    id: "linked-lists", 
    title: "Linked Lists",
    description: "Explore dynamic data structures with pointer visualization",
    duration: "50 min",
    difficulty: "Beginner",
    icon: <GitBranch className="h-5 w-5" />,
    complexity: "O(1) - O(n)"
  },
  {
    id: "stacks-queues",
    title: "Stacks & Queues",
    description: "LIFO and FIFO operations with real-time animations",
    duration: "40 min",
    difficulty: "Beginner",
    icon: <Layers className="h-5 w-5" />,
    complexity: "O(1)"
  },
  {
    id: "trees",
    title: "Trees & BST",
    description: "Binary trees, traversals, and search operations",
    duration: "60 min",
    difficulty: "Intermediate",
    icon: <Network className="h-5 w-5" />,
    complexity: "O(log n) - O(n)"
  },
  {
    id: "graphs",
    title: "Graphs & Traversals",
    description: "BFS, DFS, and shortest path algorithms with visualization",
    duration: "70 min",
    difficulty: "Intermediate",
    icon: <Network className="h-5 w-5" />,
    complexity: "O(V + E)"
  },
  {
    id: "sorting",
    title: "Sorting Algorithms",
    description: "Compare bubble, merge, quick sort with performance analysis",
    duration: "55 min",
    difficulty: "Intermediate",
    icon: <BarChart3 className="h-5 w-5" />,
    complexity: "O(n log n)"
  },
  {
    id: "dynamic-programming",
    title: "Dynamic Programming",
    description: "Memoization and tabulation with classic problems",
    duration: "80 min",
    difficulty: "Advanced",
    icon: <Zap className="h-5 w-5" />,
    complexity: "O(n²) - O(n³)"
  },
  {
    id: "hash-tables",
    title: "Hash Tables",
    description: "Hash functions, collision resolution, and performance",
    duration: "45 min",
    difficulty: "Intermediate",
    icon: <Layers className="h-5 w-5" />,
    complexity: "O(1) avg"
  }
];

export default function DSA() {
  const [activeView, setActiveView] = useState<'overview' | 'visualizer' | 'playground' | 'code-editor' | 'graph-visualizer' | 'learning'>('overview');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [completedModules, setCompletedModules] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProgress = async () => {
      try {
        const progress = await progressService.getUserProgress();
        setCompletedModules(progress.completedModules);
      } catch (error) {
        console.error('Failed to fetch progress:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProgress();
  }, []);

  // Use app-wide color system for badges and cards
  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

  const complexityColors = {
    "O(1)": "bg-success/10 text-success border-success/20",
    "O(1) - O(n)": "bg-info/10 text-info border-info/20",
    "O(log n) - O(n)": "bg-info/10 text-info border-info/20",
    "O(n log n)": "bg-warning/10 text-warning border-warning/20",
    "O(V + E)": "bg-warning/10 text-warning border-warning/20",
    "O(n²) - O(n³)": "bg-destructive/10 text-destructive border-destructive/20",
    "O(1) avg": "bg-success/10 text-success border-success/20"
  };

  // Add completion status to each topic
  const dsaTopicsWithProgress = dsaTopics.map(topic => ({
    ...topic,
    completed: completedModules.includes(topic.id)
  }));

  if (activeView === 'learning' && selectedModule) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <Button 
            variant="outline" 
            onClick={() => {
              setActiveView('overview');
              setSelectedModule(null);
            }}
            className="mb-4"
          >
            ← Back to DSA Overview
          </Button>
          <DSALearningModule 
            moduleId={selectedModule} 
            onComplete={() => {
              setActiveView('overview');
              setSelectedModule(null);
              // Refresh progress after completion
              progressService.getUserProgress()
                .then(progress => setCompletedModules(progress.completedModules))
                .catch(console.error);
            }}
          />
        </div>
      </div>
    );
  }

  if (activeView === 'visualizer') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Algorithm Visualizer</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <AlgorithmVisualizer />
        </div>
      </div>
    );
  }

  if (activeView === 'playground') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Data Structure Playground</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <DataStructurePlayground />
        </div>
      </div>
    );
  }

  if (activeView === 'graph-visualizer') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Graph Algorithms</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <GraphVisualizer />
        </div>
      </div>
    );
  }

  if (activeView === 'code-editor') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Code Editor & Challenges</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <CodeEditor />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
  <section className="py-16 bg-hero-gradient text-primary-foreground">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm text-primary-foreground">
              <Cpu className="mr-2 h-4 w-4" />
              Data Structures & Algorithms
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Master DSA with
              <span className="block text-secondary">Interactive Learning</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Visualize algorithms, play with data structures, and solve coding challenges with real-time performance analysis and step-by-step explanations.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Step-by-step
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Interactive
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Performance metrics
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Content */}
  <section className="py-16 bg-card-gradient">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="concepts" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="concepts">Core Concepts</TabsTrigger>
              <TabsTrigger value="visualizer">Sorting</TabsTrigger>
              <TabsTrigger value="playground">Data Structures</TabsTrigger>
              <TabsTrigger value="graphs">Graph Algorithms</TabsTrigger>
              <TabsTrigger value="coding">Code Editor</TabsTrigger>
            </TabsList>
            
            <TabsContent value="concepts" className="mt-8">
              <div className="grid gap-6">
                {dsaTopicsWithProgress.map((topic, index) => (
                  <Card key={topic.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 bg-card text-card-foreground border border-border">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                            topic.completed 
                              ? 'bg-success/10 text-success' 
                              : 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground'
                          } transition-colors`}>
                            {topic.completed ? <Check className="h-5 w-5" /> : topic.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg font-semibold">
                              {topic.title}
                            </CardTitle>
                            <CardDescription className="text-muted-foreground">
                              {topic.description}
                            </CardDescription>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 flex-wrap">
                          <Badge variant="outline" className={difficultyColors[topic.difficulty as keyof typeof difficultyColors]}>
                            {topic.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {topic.duration}
                          </Badge>
                          <Badge variant="outline" className={complexityColors[topic.complexity as keyof typeof complexityColors]}>
                            {topic.complexity}
                          </Badge>
                          {topic.completed && (
                            <Badge variant="secondary" className="bg-success/10 text-success">
                              Completed
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Module {index + 1} of {dsaTopics.length}
                        </div>
                        <Button 
                          className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setSelectedModule(topic.id);
                            setActiveView('learning');
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          {topic.completed ? 'Review' : 'Start Learning'}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="visualizer" className="mt-8">
              <Card className="h-96 flex items-center justify-center bg-card text-card-foreground border border-border">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Cpu className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Sorting Algorithm Visualizer</h3>
                  <p className="text-muted-foreground max-w-md">
                    Watch bubble sort, quick sort, merge sort, and insertion sort algorithms execute step-by-step with real-time performance metrics.
                  </p>
                  <Button 
                    className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={() => setActiveView('visualizer')}
                  >
                    Launch Visualizer
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="playground" className="mt-8">
              <Card className="h-96 flex items-center justify-center bg-card text-card-foreground border border-border">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center text-secondary mx-auto">
                    <Network className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Data Structure Playground</h3>
                  <p className="text-muted-foreground max-w-md">
                    Interactive playground for arrays, linked lists, stacks, queues, trees, and graphs. Manipulate data structures in real-time.
                  </p>
                  <Button 
                    className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={() => setActiveView('playground')}
                  >
                    Open Playground
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="graphs" className="mt-8">
              <Card className="h-96 flex items-center justify-center bg-card text-card-foreground border border-border">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-info/10 flex items-center justify-center text-info mx-auto">
                    <Network className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Graph Algorithm Visualizer</h3>
                  <p className="text-muted-foreground max-w-md">
                    Visualize BFS, DFS, and Dijkstra's algorithm on interactive graphs. Build your own graphs and watch algorithms traverse them.
                  </p>
                  <Button 
                    className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={() => setActiveView('graph-visualizer')}
                  >
                    Explore Graphs
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="coding" className="mt-8">
              <Card className="h-96 flex items-center justify-center bg-card text-card-foreground border border-border">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Code2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Code Editor & Challenges</h3>
                  <p className="text-muted-foreground max-w-md">
                    Solve coding problems with our built-in editor. Get instant feedback, test cases, and complexity analysis.
                  </p>
                  <Button 
                    className="bg-hero-gradient text-primary-foreground hover:opacity-90 transition-opacity"
                    onClick={() => setActiveView('code-editor')}
                  >
                    Start Coding
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