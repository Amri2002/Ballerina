import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/feature-card";
import { ModuleCard } from "@/components/ui/module-card";
import { Header } from "@/components/Navigation/Header";
import Forum from "./Forum";
import { 
  BookOpen, 
  Target, 
  Zap, 
  Users, 
  Award, 
  TrendingUp,
  GitBranch,
  Network,
  Database,
  Code,
  Play,
  ArrowRight,
  CheckCircle,
  Star
} from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-hero-gradient text-white">
        <div className="absolute inset-0 bg-black/10" />
        <div className="relative container mx-auto px-4 py-24 text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
              <Zap className="mr-2 h-4 w-4" />
              Interactive Learning Platform
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold leading-tight">
              Master Computer Science 
              <span className="block text-secondary">Visually</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transform abstract CS concepts into interactive experiences. 
              From algorithms to databases, learn by seeing and doing.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 transition-colors shadow-lg" asChild>
                <a href="/dashboard">
                  <Play className="mr-2 h-5 w-5" />
                  Start Learning Free
                </a>
              </Button>
              
            </div>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Self-paced learning
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                No prerequisites
              </div>
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4" />
                Instant feedback
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning Modules */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Choose Your Learning Path
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Dive deep into complex computer science topics with our interactive modules
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <ModuleCard
              title="Data Structures & Algorithms"
              description="Master sorting algorithms, tree traversals, and data structures through step-by-step visualizations and interactive coding challenges."
              features={[
                "Sorting algorithm animations",
                "Tree and graph traversals",
                "Interactive code simulation",
                "Memory visualization"
              ]}
              icon={<GitBranch className="h-6 w-6" />}
              href="/dsa"
             
            />
            
            <ModuleCard
              title="Computer Networking"
              description="Understand network protocols, packet flow, and communication models through real-time simulations and interactive diagrams."
              features={[
                "TCP/IP protocol simulation",
                "DNS resolution walkthrough",
                "Packet trace visualizer",
                "OSI model animations"
              ]}
              icon={<Network className="h-6 w-6" />}
              href="/networking"
          
            />
            
            <ModuleCard
              title="Database Systems"
              description="Learn SQL, database design, and ACID properties through interactive query builders and transaction simulations."
              features={[
                "SQL query visualizer",
                "ER diagram builder",
                "Transaction simulations",
                "Indexing demonstrations"
              ]}
              icon={<Database className="h-6 w-6" />}
              href="/databases"
            
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Why Choose CodeVista?
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We replace static lectures with dynamic, interactive learning experiences
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <FeatureCard
              icon={<Target className="h-6 w-6" />}
              title="Personalized Learning Paths"
              description="Adaptive content sequencing based on your progress and understanding level"
            />
            
            <FeatureCard
              icon={<Code className="h-6 w-6" />}
              title="Interactive Simulations"
              description="Step-by-step code execution with memory, variable, and stack visualizations"
              variant="highlight"
            />
            
            <FeatureCard
              icon={<Users className="h-6 w-6" />}
              title="Self-Guided Learning"
              description="No teacher required - AI-powered hints and tips guide you through every concept"
            />
            
            <FeatureCard
              icon={<Zap className="h-6 w-6" />}
              title="Real-Time Feedback"
              description="Instant validation and explanations for every step of your learning journey"
            />
            
            <FeatureCard
              icon={<TrendingUp className="h-6 w-6" />}
              title="Progress Analytics"
              description="Track your learning progress, identify weak spots, and celebrate achievements"
            />
            
            <FeatureCard
              icon={<Award className="h-6 w-6" />}
              title="Certificates & Achievements"
              description="Earn verified certificates and badges as you complete modules and challenges"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-card-gradient">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Ready to Transform Your Learning?
            </h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of students who have already mastered complex CS concepts through visual learning
            </p>
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <Star className="mr-1 h-4 w-4 text-yellow-500 fill-current" />
                <span>4.9/5 rating</span>
              </div>
              <span>•</span>
              <span>10,000+ learners</span>
              <span>•</span>
              <span>50+ interactive modules</span>
            </div>
            <Button size="lg" className="bg-hero-gradient hover:opacity-90 transition-opacity shadow-lg" asChild>
              <a href="/dashboard">
                <Play className="mr-2 h-5 w-5" />
                Start Your Journey Today
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex items-center space-x-2">
              <BookOpen className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold text-foreground">CodeVista</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 CodeVista. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
