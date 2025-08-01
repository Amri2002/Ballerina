import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Header } from "@/components/Navigation/Header";
import { 
  BookOpen, 
  Target, 
  Users, 
  Award,
  ArrowRight,
  CheckCircle,
  Lightbulb,
  Globe,
  Zap
} from "lucide-react";

export default function About() {
  const features = [
    {
      icon: <Target className="h-6 w-6" />,
      title: "Visual Learning First",
      description: "Every concept is taught through interactive visualizations and real-time simulations"
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Self-Paced Learning",
      description: "Learn at your own speed with AI-powered guidance and instant feedback"
    },
    {
      icon: <Award className="h-6 w-6" />,
      title: "Industry-Relevant Skills",
      description: "Master the concepts that matter most in real-world software development"
    },
    {
      icon: <Lightbulb className="h-6 w-6" />,
      title: "Adaptive Content",
      description: "Personalized learning paths that adapt to your progress and understanding"
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Learners" },
    { number: "50+", label: "Interactive Modules" },
    { number: "95%", label: "Completion Rate" },
    { number: "4.9/5", label: "Average Rating" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      {/* Hero Section */}
      <section className="py-20 bg-hero-gradient text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Revolutionizing
              <span className="block text-secondary">CS Education</span>
            </h1>
            
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              CodeVista transforms complex computer science concepts into interactive, visual experiences. 
              We believe learning should be engaging, intuitive, and accessible to everyone.
            </p>
            
            <div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="space-y-8">
                <div>
                  <h2 className="text-4xl font-bold text-foreground mb-6">
                    Our Mission
                  </h2>
                  <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                    Traditional computer science education relies heavily on static content and theoretical explanations. 
                    This creates a steep learning curve, especially for visual learners who benefit from seeing concepts in action.
                  </p>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    CodeVista bridges this gap by making abstract concepts tangible through interactive visualizations, 
                    real-time simulations, and hands-on practice environments.
                  </p>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">Interactive Learning</h3>
                      <p className="text-muted-foreground">Hands-on practice with immediate feedback</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">Visual Simulations</h3>
                      <p className="text-muted-foreground">See algorithms and data structures in action</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-primary mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-foreground">Self-Guided Learning</h3>
                      <p className="text-muted-foreground">Learn at your own pace without external dependencies</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="relative">
                <div className="w-full h-96 bg-card-gradient rounded-2xl shadow-lg flex items-center justify-center">
                  <div className="text-center space-y-4">
                    <Globe className="h-16 w-16 text-primary mx-auto" />
                    <h3 className="text-xl font-semibold text-foreground">Global Impact</h3>
                    <p className="text-muted-foreground max-w-xs">
                      Empowering learners worldwide with accessible, high-quality computer science education
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-foreground mb-4">
                What Makes Us Different
              </h2>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Our approach to computer science education focuses on understanding through interaction
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <Card key={index} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                  <CardHeader>
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-xl font-semibold">
                      {feature.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2 className="text-4xl font-bold text-foreground">
              Built with Modern Technology
            </h2>
            <p className="text-xl text-muted-foreground">
              Our platform leverages cutting-edge web technologies to deliver smooth, 
              interactive learning experiences across all devices.
            </p>
            
            <div className="flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <Zap className="h-8 w-8" />
              </div>
            </div>
            
            <Button size="lg" className="bg-hero-gradient hover:opacity-90 transition-opacity">
              Start Learning Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}