import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import { 
  Network, 
  Play, 
  Clock, 
  Users, 
  Award,
  ArrowRight,
  Wifi,
  Globe,
  Shield,
  Layers3,
  Calculator,
  Server,
  Activity,
  BookOpen,
  Zap
} from "lucide-react";
import { useState } from "react";
import TCPHandshake from "@/components/networking/TCPHandshake";
import DNSResolution from "@/components/networking/DNSResolution";
import OSIModel from "@/components/networking/OSIModel";
import SubnetCalculator from "@/components/networking/SubnetCalculator";
import NetworkTopology from "@/components/networking/NetworkTopology";
import ProtocolAnalyzer from "@/components/networking/ProtocolAnalyzer";
import NetworkSecurityScanner from "@/components/networking/NetworkSecurityScanner";
import PerformanceMonitor from "@/components/networking/PerformanceMonitor";
import LearningAnalytics from "@/components/networking/LearningAnalytics";

const networkingTopics = [
  {
    id: "tcp-handshake",
    title: "TCP 3-Way Handshake",
    description: "Visualize connection establishment and termination",
    duration: "30 min",
    difficulty: "Beginner",
    icon: <Wifi className="h-5 w-5" />,
    component: TCPHandshake
  },
  {
    id: "dns-resolution",
    title: "DNS Resolution Process",
    description: "Follow domain name lookups from start to finish",
    duration: "40 min",
    difficulty: "Intermediate",
    icon: <Globe className="h-5 w-5" />,
    component: DNSResolution
  },
  {
    id: "osi-model",
    title: "OSI & TCP/IP Models",
    description: "Interactive layer-by-layer packet journey",
    duration: "50 min",
    difficulty: "Intermediate",
    icon: <Layers3 className="h-5 w-5" />,
    component: OSIModel
  },
  {
    id: "subnet-calculator",
    title: "Subnet Calculator",
    description: "Interactive subnet calculation and CIDR practice",
    duration: "45 min",
    difficulty: "Advanced",
    icon: <Calculator className="h-5 w-5" />,
    component: SubnetCalculator
  },
  {
    id: "network-topology",
    title: "Network Topology Builder",
    description: "Drag-and-drop network design and simulation",
    duration: "60 min",
    difficulty: "Advanced",
    icon: <Server className="h-5 w-5" />,
    component: NetworkTopology
  },
  {
    id: "protocol-analyzer",
    title: "Protocol Analyzer",
    description: "Analyze network packets and decode protocols",
    duration: "35 min",
    difficulty: "Intermediate",
    icon: <Activity className="h-5 w-5" />,
    component: ProtocolAnalyzer
  },
  {
    id: "security-scanner",
    title: "Network Security Scanner",
    description: "Scan networks for vulnerabilities and security issues",
    duration: "50 min",
    difficulty: "Advanced",
    icon: <Shield className="h-5 w-5" />,
    component: NetworkSecurityScanner
  },
  {
    id: "performance-monitor",
    title: "Performance Monitor",
    description: "Real-time network performance monitoring and metrics",
    duration: "40 min",
    difficulty: "Intermediate",
    icon: <Activity className="h-5 w-5" />,
    component: PerformanceMonitor
  },
  {
    id: "learning-analytics",
    title: "Learning Analytics",
    description: "Track your learning progress and achievements",
    duration: "25 min",
    difficulty: "Beginner",
    icon: <BookOpen className="h-5 w-5" />,
    component: LearningAnalytics
  }
];

export default function Networking() {
  const [selectedTopic, setSelectedTopic] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("overview");

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

  const selectedComponent = networkingTopics.find(topic => topic.id === selectedTopic)?.component;

  if (selectedTopic && selectedComponent) {
    const Component = selectedComponent;
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <Button
                variant="outline"
                onClick={() => setSelectedTopic(null)}
                className="mb-4"
              >
                ← Back to Networking Overview
              </Button>
              <h1 className="text-3xl font-bold">
                {networkingTopics.find(t => t.id === selectedTopic)?.title}
              </h1>
              <p className="text-muted-foreground">
                {networkingTopics.find(t => t.id === selectedTopic)?.description}
              </p>
            </div>
          </div>
          <Component />
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
              <Network className="mr-2 h-4 w-4" />
              Computer Networking
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Master Network Protocols
              <span className="block text-secondary">Through Interactive Simulations</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Explore TCP/IP, DNS, OSI models, subnetting, and network topologies with real-time visualizations and hands-on practice.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <Activity className="mr-2 h-4 w-4" />
                Real-time simulations
              </div>
              <div className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                Interactive learning
              </div>
              <div className="flex items-center">
                <Zap className="mr-2 h-4 w-4" />
                Hands-on practice
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="simulations">Simulations</TabsTrigger>
              <TabsTrigger value="tools">Tools</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview" className="mt-8">
              <div className="grid gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Network className="mr-2 h-5 w-5" />
                      What You'll Learn
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Protocol Understanding</h4>
                        <p className="text-sm text-muted-foreground">
                          Deep dive into TCP/IP, UDP, HTTP, DNS, and other essential network protocols
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Network Architecture</h4>
                        <p className="text-sm text-muted-foreground">
                          Learn OSI model, network layers, and how data flows through networks
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">IP Addressing</h4>
                        <p className="text-sm text-muted-foreground">
                          Master subnetting, CIDR notation, and IP address management
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Network Design</h4>
                        <p className="text-sm text-muted-foreground">
                          Build and simulate network topologies with routers, switches, and hosts
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Troubleshooting</h4>
                        <p className="text-sm text-muted-foreground">
                          Practice diagnosing and resolving common network issues
                        </p>
                      </div>
                      <div className="p-4 border rounded-lg">
                        <h4 className="font-semibold mb-2">Security Concepts</h4>
                        <p className="text-sm text-muted-foreground">
                          Understand network security, encryption, and secure protocols
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            
            <TabsContent value="simulations" className="mt-8">
              <div className="grid gap-6">
                {networkingTopics.slice(0, 3).map((topic, index) => (
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
                          Module {index + 1} of {networkingTopics.length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Start Simulation
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tools" className="mt-8">
              <div className="grid gap-6">
                {networkingTopics.slice(3).map((topic, index) => (
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
                          Tool {index + 1} of {networkingTopics.slice(3).length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Launch Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="advanced" className="mt-8">
              <div className="grid gap-6">
                {networkingTopics.slice(5, 8).map((topic, index) => (
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
                          Advanced Tool {index + 1} of {networkingTopics.slice(5, 8).length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          Launch Tool
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="analytics" className="mt-8">
              <div className="grid gap-6">
                {networkingTopics.slice(8).map((topic, index) => (
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
                          Analytics Tool {index + 1} of {networkingTopics.slice(8).length}
                        </div>
                        <Button 
                          className="bg-hero-gradient hover:opacity-90 transition-opacity"
                          onClick={() => setSelectedTopic(topic.id)}
                        >
                          <Play className="mr-2 h-4 w-4" />
                          View Analytics
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Button>
                      </div>
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