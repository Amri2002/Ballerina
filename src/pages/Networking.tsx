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
  Layers3
} from "lucide-react";

const networkingTopics = [
  {
    id: "tcp-handshake",
    title: "TCP 3-Way Handshake",
    description: "Visualize connection establishment and termination",
    duration: "30 min",
    difficulty: "Beginner",
    icon: <Wifi className="h-5 w-5" />
  },
  {
    id: "dns-resolution",
    title: "DNS Resolution Process",
    description: "Follow domain name lookups from start to finish",
    duration: "40 min",
    difficulty: "Intermediate",
    icon: <Globe className="h-5 w-5" />
  },
  {
    id: "osi-model",
    title: "OSI & TCP/IP Models",
    description: "Interactive layer-by-layer packet journey",
    duration: "50 min",
    difficulty: "Intermediate",
    icon: <Layers3 className="h-5 w-5" />
  },
  {
    id: "security-protocols",
    title: "Network Security",
    description: "HTTPS, TLS, and encryption in network communication",
    duration: "45 min",
    difficulty: "Advanced",
    icon: <Shield className="h-5 w-5" />
  }
];

export default function Networking() {
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
              <Network className="mr-2 h-4 w-4" />
              Computer Networking
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold leading-tight">
              Understand Networks
              <span className="block text-secondary">Through Simulation</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Master network protocols, packet flow, and communication models through real-time simulations and interactive packet tracing.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                Interactive simulations
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4" />
                Real-world scenarios
              </div>
              <div className="flex items-center">
                <Award className="mr-2 h-4 w-4" />
                Hands-on labs
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Content */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="simulations" className="max-w-6xl mx-auto">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="simulations">Simulations</TabsTrigger>
              <TabsTrigger value="packet-tracer">Packet Tracer</TabsTrigger>
              <TabsTrigger value="labs">Virtual Labs</TabsTrigger>
            </TabsList>
            
            <TabsContent value="simulations" className="mt-8">
              <div className="grid gap-6">
                {networkingTopics.map((topic, index) => (
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
                        <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
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
            
            <TabsContent value="packet-tracer" className="mt-8">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
                    <Network className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Packet Trace Visualizer</h3>
                  <p className="text-muted-foreground max-w-md">
                    Capture and analyze network packets in real-time. See how data flows through network layers and understand protocol interactions.
                  </p>
                  <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
                    Launch Packet Tracer
                  </Button>
                </div>
              </Card>
            </TabsContent>
            
            <TabsContent value="labs" className="mt-8">
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
                    <Award className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Virtual Network Labs</h3>
                  <p className="text-muted-foreground max-w-md">
                    Practice networking concepts in safe, virtual environments. Configure routers, set up VLANs, and troubleshoot network issues.
                  </p>
                  <Button className="bg-hero-gradient hover:opacity-90 transition-opacity">
                    Access Labs
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