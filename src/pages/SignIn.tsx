import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Navigation/Header";
import { BookOpen, Eye, EyeOff, Mail, Lock, Code, GitBranch, Network, Database, CheckCircle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const success = await login(email, password);
    
    if (success) {
      toast({
        title: "Success!",
        description: "You have been signed in successfully.",
      });
      navigate("/dashboard");
    } else if (error) {
      toast({
        title: "Login Failed",
        description: error,
        variant: "destructive",
      });
    }
  };

  const features = [
    {
      icon: <Code className="h-6 w-6" />,
      title: "Interactive Learning",
      description: "Hands-on practice with real-time feedback"
    },
    {
      icon: <GitBranch className="h-6 w-6" />,
      title: "DSA Mastery",
      description: "Master algorithms with visual simulations"
    },
    {
      icon: <Network className="h-6 w-6" />,
      title: "Network Protocols",
      description: "Learn TCP/IP with live demonstrations"
    },
    {
      icon: <Database className="h-6 w-6" />,
      title: "Database Design",
      description: "Build ER diagrams and SQL queries"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex min-h-[calc(100vh-80px)]">
        {/* Left Side - Sign In Form */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-md">
            {/* CodeVista Branding Header */}
            {/* <div className="text-center mb-6">
              <div className="flex items-center justify-center space-x-2 mb-3">
                <BookOpen className="h-8 w-8 text-primary" />
                <span className="text-2xl font-bold text-foreground">CodeVista</span>
              </div>
            </div> */}

            <Card className="shadow-xl border-0 bg-white/50 backdrop-blur-sm">
              <CardHeader className="space-y-1 pb-3">
                <CardTitle className="text-xl text-center">Sign In</CardTitle>
                <CardDescription className="text-center text-sm">
                  Enter your credentials to access your account
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="space-y-1">
                    <Label htmlFor="email" className="text-sm">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 h-10"
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <Label htmlFor="password" className="text-sm">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="pl-10 pr-10 h-10"
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 top-2 h-5 w-5 p-0"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Link to="/forgot-password" className="text-xs text-primary hover:underline">
                      Forgot password?
                    </Link>
                  </div>

                  <Button type="submit" disabled={loading} className="w-full h-10 bg-hero-gradient hover:opacity-90 transition-all duration-200 shadow-lg">
                    {loading ? "Signing in..." : "Sign In"}
                  </Button>
                </form>

                <div className="mt-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-white px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <Button variant="outline" size="sm" className="h-9 text-xs">
                      Google
                    </Button>
                    <Button variant="outline" size="sm" className="h-9 text-xs">
                      GitHub
                    </Button>
                  </div>
                </div>

                <div className="text-center text-xs">
                  <span className="text-muted-foreground">Don't have an account? </span>
                  <Link to="/signup" className="text-primary hover:underline font-medium">
                    Sign up
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Side - Website Details */}
        <div className="flex-1 bg-hero-gradient text-white p-12 flex flex-col justify-center relative overflow-hidden">
          {/* Background decorative elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 via-purple-400/20 to-pink-400/20"></div>
          <div className="absolute top-10 right-10 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-10 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
          
          <div className="max-w-lg relative z-10 mx-auto text-center">
            {/* CodeVista Branding */}
            <div className="text-center mb-8">
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                  <BookOpen className="h-12 w-12 text-white drop-shadow-lg" />
                </div>
                <span className="text-5xl font-bold text-white drop-shadow-lg bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">CodeVista</span>
              </div>
              
              {/* Two lines of colorful text */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold text-white drop-shadow-lg">
                  Master Computer Science
                </h2>
                <p className="text-xl text-blue-100 font-medium leading-relaxed">
                  Interactive Learning Platform
                </p>
              </div>
            </div>
            
            {/* Decorative accent */}
            <div className="flex justify-center">
              <div className="w-20 h-1 bg-gradient-to-r from-blue-300 to-pink-300 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}