import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import { SqlQueryBuilder } from "@/components/Database/SqlQueryBuilder";
import { ErDiagramDesigner } from "@/components/Database/ERDiagramDesigner";
import { DatabaseDesignStudio } from "@/components/Database/DatabaseDesignStudio";
import { LearningModule } from "@/components/Database/LearningModule";
import { 
  Database, 
  Play, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  FileText,
  GitMerge,
  Lock,
  BarChart3
} from "lucide-react";

const databaseTopics = [
  {
    id: "sql-basics",
    title: "SQL Query Builder",
    description: "Interactive SQL learning with real-time execution plans",
    duration: "60 min",
    difficulty: "Beginner",
    icon: <FileText className="h-5 w-5" />
  },
  {
    id: "er-diagrams", 
    title: "ER Diagram Design",
    description: "Build entity-relationship diagrams with validation",
    duration: "45 min",
    difficulty: "Intermediate",
    icon: <GitMerge className="h-5 w-5" />
  },
  {
    id: "acid-properties",
    title: "ACID Transactions",
    description: "Simulate transaction isolation and consistency",
    duration: "50 min",
    difficulty: "Advanced",
    icon: <Lock className="h-5 w-5" />
  },
  {
    id: "indexing",
    title: "Database Indexing",
    description: "B-Tree navigation and performance optimization",
    duration: "40 min",
    difficulty: "Intermediate", 
    icon: <BarChart3 className="h-5 w-5" />
  }
];

export default function Databases() {
  const [activeView, setActiveView] = useState<'overview' | 'query-builder' | 'er-designer' | 'design-studio' | 'learning'>('overview');
  const [selectedModule, setSelectedModule] = useState<string | null>(null);

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

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
            ← Back to Database Overview
          </Button>
          <LearningModule 
            moduleId={selectedModule} 
            onComplete={() => {
              setActiveView('overview');
              setSelectedModule(null);
            }}
          />
        </div>
      </div>
    );
  }

  if (activeView === 'query-builder') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">SQL Query Builder</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <SqlQueryBuilder />
        </div>
      </div>
    );
  }

  if (activeView === 'er-designer') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">ER Diagram Designer</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <ErDiagramDesigner />
        </div>
      </div>
    );
  }

  if (activeView === 'design-studio') {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Database Design Studio</h1>
            <Button variant="outline" onClick={() => setActiveView('overview')}>
              ← Back to Overview
            </Button>
          </div>
          <DatabaseDesignStudio />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-16 bg-hero-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              <Database className="mr-2 h-4 w-4" />
              Database Systems
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Master Database
              <span className="block text-secondary">Design & Queries</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Learn SQL, database design, and ACID properties through interactive query builders, ER diagram tools, and transaction simulations.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Interactive queries
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Real databases
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Performance insights
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="concepts" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="concepts">Core Concepts</TabsTrigger>
              <TabsTrigger value="query-builder">Query Builder</TabsTrigger>
              <TabsTrigger value="design-tools">Design Tools</TabsTrigger>
            </TabsList>
            
            <TabsContent value="concepts" className="mt-8">
              <div className="grid gap-6">
                {databaseTopics.map((topic, index) => (
                  <Card key={topic.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                            {topic.icon}
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
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className={difficultyColors[topic.difficulty as keyof typeof difficultyColors]}>
                            {topic.difficulty}
                          </Badge>
                          <Badge variant="outline" className="text-muted-foreground">
                            <Clock className="mr-1 h-3 w-3" />
                            {topic.duration}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-muted-foreground">
                          Lesson {index + 1} of {databaseTopics.length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => {
                            setSelectedModule(topic.id);
                            setActiveView('learning');
                          }}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Learning
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="query-builder" className="mt-8">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Database className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Interactive SQL Builder</h3>
                  <p className="text-muted-foreground max-w-md">
                    Write and execute SQL queries against real databases. See execution plans, performance metrics, and get instant feedback on your queries.
                  </p>
                  <Button 
                    className="bg-hero-gradient hover:opacity-90 transition-opacity"
                    onClick={() => setActiveView('query-builder')}
                  >
                    Launch Query Builder
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="design-tools" className="mt-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-64 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-database/10 flex items-center justify-center text-database mx-auto">
                      <GitMerge className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">ER Diagram Designer</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Create entity-relationship diagrams with drag-and-drop interface and automatic SQL generation.
                    </p>
                    <Button 
                      className="bg-hero-gradient hover:opacity-90 transition-opacity"
                      onClick={() => setActiveView('er-designer')}
                    >
                      Open ER Designer
                    </Button>
                  </div>
                </Card>
                
                <Card className="h-64 flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                      <Database className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-semibold">Schema Design Studio</h3>
                    <p className="text-muted-foreground text-sm max-w-sm">
                      Design normalized database schemas with validation and optimization suggestions.
                    </p>
                    <Button 
                      className="bg-hero-gradient hover:opacity-90 transition-opacity"
                      onClick={() => setActiveView('design-studio')}
                    >
                      Open Design Studio
                    </Button>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </div>
  );
}