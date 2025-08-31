import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Trophy, 
  Clock, 
  CheckCircle, 
  Lock, 
  Play, 
  BarChart3, 
  Network, 
  Shield, 
  Zap,
  Globe,
  Server,
  Router,
  Wifi,
  AlertTriangle,
  Check,
  X
} from "lucide-react";

interface NetworkingChallenge {
  id: string;
  title: string;
  description: string;
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  timeLimit: number; // in minutes
  module: string;
  category: string;
  completed: boolean;
  locked: boolean;
  type: "multiple-choice" | "calculation" | "simulation" | "analysis" | "design";
  question: string;
  options?: string[];
  correctAnswer: any;
  hints: string[];
  explanation: string;
  tags: string[];
}

const networkingChallenges: NetworkingChallenge[] = [
  // TCP Handshake Challenges
  {
    id: "tcp_001",
    title: "TCP Three-Way Handshake",
    description: "Complete the TCP connection establishment process",
    difficulty: "Easy",
    points: 100,
    timeLimit: 15,
    module: "tcp",
    category: "TCP Handshake",
    completed: false,
    locked: false,
    type: "simulation",
    question: "Arrange the TCP handshake steps in the correct order: SYN, SYN-ACK, ACK",
    correctAnswer: ["SYN", "SYN-ACK", "ACK"],
    hints: ["Think about who initiates the connection", "The server must acknowledge the client's SYN"],
    explanation: "TCP three-way handshake: 1) Client sends SYN, 2) Server responds with SYN-ACK, 3) Client sends ACK",
    tags: ["TCP", "Handshake", "Connection Establishment"]
  },
  {
    id: "tcp_002",
    title: "TCP State Machine",
    description: "Identify the correct TCP connection states",
    difficulty: "Medium",
    points: 150,
    timeLimit: 20,
    module: "tcp",
    category: "TCP States",
    completed: false,
    locked: false,
    type: "multiple-choice",
    question: "What state does a TCP connection enter after receiving a FIN segment?",
    options: ["ESTABLISHED", "TIME_WAIT", "CLOSE_WAIT", "FIN_WAIT_1"],
    correctAnswer: "CLOSE_WAIT",
    hints: ["This state occurs when the remote endpoint initiates closure", "The connection is waiting for the application to close"],
    explanation: "CLOSE_WAIT state occurs when the remote endpoint sends a FIN, indicating it wants to close the connection",
    tags: ["TCP", "Connection States", "FIN"]
  },

  // DNS Resolution Challenges
  {
    id: "dns_001",
    title: "DNS Query Types",
    description: "Match DNS record types with their purposes",
    difficulty: "Easy",
    points: 100,
    timeLimit: 15,
    module: "dns",
    category: "DNS Records",
    completed: false,
    locked: false,
    type: "multiple-choice",
    question: "Which DNS record type maps a domain name to an IPv4 address?",
    options: ["AAAA", "A", "CNAME", "MX"],
    correctAnswer: "A",
    hints: ["This record type is for IPv4 addresses", "IPv6 uses a different record type"],
    explanation: "A records map domain names to IPv4 addresses, while AAAA records map to IPv6 addresses",
    tags: ["DNS", "A Record", "IPv4"]
  },
  {
    id: "dns_002",
    title: "DNS Resolution Path",
    description: "Trace the DNS resolution process from root to authoritative server",
    difficulty: "Medium",
    points: 200,
    timeLimit: 25,
    module: "dns",
    category: "DNS Resolution",
    completed: false,
    locked: false,
    type: "simulation",
    question: "Trace the DNS resolution for 'www.example.com' through the hierarchy",
    correctAnswer: ["Root Server", "Top-Level Domain Server (.com)", "Authoritative Server (example.com)"],
    hints: ["Start from the root DNS servers", "Then go to the top-level domain", "Finally to the authoritative server"],
    explanation: "DNS resolution follows a hierarchical path: Root → TLD → Authoritative server",
    tags: ["DNS", "Resolution", "Hierarchy"]
  },

  // Subnet Calculation Challenges
  {
    id: "subnet_001",
    title: "Basic Subnet Masking",
    description: "Calculate network address and broadcast address",
    difficulty: "Easy",
    points: 150,
    timeLimit: 20,
    module: "subnet",
    category: "Subnet Calculations",
    completed: false,
    locked: false,
    type: "calculation",
    question: "For IP address 192.168.1.100 with subnet mask 255.255.255.0, what is the network address?",
    correctAnswer: "192.168.1.0",
    hints: ["Perform a bitwise AND operation", "Network address is the first address in the subnet"],
    explanation: "192.168.1.100 AND 255.255.255.0 = 192.168.1.0 (network address)",
    tags: ["Subnet", "Network Address", "Bitwise Operations"]
  },
  {
    id: "subnet_002",
    title: "CIDR Notation",
    description: "Convert between CIDR notation and subnet masks",
    difficulty: "Medium",
    points: 200,
    timeLimit: 25,
    module: "subnet",
    category: "CIDR",
    completed: false,
    locked: false,
    type: "calculation",
    question: "What is the subnet mask for CIDR notation /26?",
    correctAnswer: "255.255.255.192",
    hints: ["/26 means 26 bits are set to 1", "Convert 26 ones to decimal"],
    explanation: "/26 = 11111111.11111111.11111111.11000000 = 255.255.255.192",
    tags: ["CIDR", "Subnet Mask", "Binary Conversion"]
  },

  // Network Topology Challenges
  {
    id: "topology_001",
    title: "Star Topology Design",
    description: "Design a star network topology for a small office",
    difficulty: "Easy",
    points: 150,
    timeLimit: 20,
    module: "topology",
    category: "Network Design",
    completed: false,
    locked: false,
    type: "design",
    question: "Design a star topology for 5 computers and 1 printer",
    correctAnswer: "Central switch/hub with all devices connected to it",
    hints: ["All devices connect to a central point", "Think about the most efficient way to connect multiple devices"],
    explanation: "Star topology: All devices connect to a central switch/hub, providing easy management and fault isolation",
    tags: ["Topology", "Star Network", "Network Design"]
  },
  {
    id: "topology_002",
    title: "Redundant Paths",
    description: "Identify critical points of failure in a network topology",
    difficulty: "Hard",
    points: 300,
    timeLimit: 30,
    module: "topology",
    category: "Network Resilience",
    completed: false,
    locked: true,
    type: "analysis",
    question: "In a tree topology, what happens if the root node fails?",
    correctAnswer: "Entire network becomes unreachable",
    hints: ["Think about the hierarchical structure", "What happens to branches when the root is removed?"],
    explanation: "In a tree topology, the root node is a single point of failure. If it fails, all child nodes lose connectivity",
    tags: ["Topology", "Single Point of Failure", "Network Resilience"]
  },

  // Protocol Analysis Challenges
  {
    id: "protocol_001",
    title: "HTTP vs HTTPS",
    description: "Compare HTTP and HTTPS protocols",
    difficulty: "Easy",
    points: 100,
    timeLimit: 15,
    module: "protocol",
    category: "Protocol Comparison",
    completed: false,
    locked: false,
    type: "multiple-choice",
    question: "Which protocol provides encryption for web traffic?",
    options: ["HTTP", "HTTPS", "FTP", "SMTP"],
    correctAnswer: "HTTPS",
    hints: ["Look for the 'S' in the protocol name", "This protocol secures HTTP traffic"],
    explanation: "HTTPS (HTTP Secure) uses SSL/TLS encryption to secure web traffic, while HTTP sends data in plain text",
    tags: ["HTTP", "HTTPS", "Encryption", "Security"]
  },
  {
    id: "protocol_002",
    title: "Protocol Headers",
    description: "Analyze network protocol headers",
    difficulty: "Medium",
    points: 200,
    timeLimit: 25,
    module: "protocol",
    category: "Header Analysis",
    completed: false,
    locked: false,
    type: "analysis",
    question: "What does the TTL field in an IP header represent?",
    correctAnswer: "Time To Live - prevents infinite routing loops",
    hints: ["Think about what happens if a packet gets stuck in routing", "This field decreases at each hop"],
    explanation: "TTL (Time To Live) prevents packets from circulating indefinitely by limiting the number of hops they can traverse",
    tags: ["IP Protocol", "TTL", "Routing", "Header Fields"]
  },

  // Network Security Challenges
  {
    id: "security_001",
    title: "Firewall Rules",
    description: "Configure basic firewall rules",
    difficulty: "Medium",
    points: 200,
    timeLimit: 25,
    module: "security",
    category: "Firewall Configuration",
    completed: false,
    locked: false,
    type: "simulation",
    question: "Create a firewall rule to allow only HTTP (port 80) and HTTPS (port 443) traffic",
    correctAnswer: "Allow ports 80 and 443, deny all other ports",
    hints: ["HTTP uses port 80", "HTTPS uses port 443", "Default deny policy"],
    explanation: "Firewall rule: ALLOW ports 80, 443; DENY all other ports. This follows the principle of least privilege",
    tags: ["Firewall", "Ports", "Security Rules", "HTTP/HTTPS"]
  },
  {
    id: "security_002",
    title: "VLAN Segmentation",
    description: "Design VLANs for network security",
    difficulty: "Hard",
    points: 300,
    timeLimit: 30,
    module: "security",
    category: "VLAN Design",
    completed: false,
    locked: true,
    type: "design",
    question: "Design VLANs to separate guest, employee, and management networks",
    correctAnswer: "VLAN 10 (Guest), VLAN 20 (Employee), VLAN 30 (Management)",
    hints: ["Separate networks by security requirements", "Management network needs highest security"],
    explanation: "VLAN segmentation improves security by isolating different types of traffic and limiting access between networks",
    tags: ["VLAN", "Network Segmentation", "Security", "Traffic Isolation"]
  },

  // Performance Monitoring Challenges
  {
    id: "performance_001",
    title: "Bandwidth Calculation",
    description: "Calculate network bandwidth requirements",
    difficulty: "Easy",
    points: 150,
    timeLimit: 20,
    module: "performance",
    category: "Bandwidth",
    completed: false,
    locked: false,
    type: "calculation",
    question: "If 100 users each need 1 Mbps, what's the total bandwidth requirement?",
    correctAnswer: "100 Mbps",
    hints: ["Multiply users by individual bandwidth", "1 Mbps × 100 users"],
    explanation: "Total bandwidth = Users × Individual bandwidth = 100 × 1 Mbps = 100 Mbps",
    tags: ["Bandwidth", "Capacity Planning", "User Requirements"]
  },
  {
    id: "performance_002",
    title: "Latency Analysis",
    description: "Analyze network latency factors",
    difficulty: "Medium",
    points: 200,
    timeLimit: 25,
    module: "performance",
    category: "Latency",
    completed: false,
    locked: false,
    type: "analysis",
    question: "What factors contribute to network latency?",
    correctAnswer: ["Propagation delay, transmission delay, processing delay, queuing delay"],
    hints: ["Think about physical distance", "Consider data size and processing time"],
    explanation: "Network latency includes: propagation (distance), transmission (data size), processing (routers), and queuing delays",
    tags: ["Latency", "Network Performance", "Delay Factors"]
  }
];

export default function NetworkingChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<NetworkingChallenge | null>(null);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [challengeResults, setChallengeResults] = useState<Record<string, boolean>>({});
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const [isChallengeActive, setIsChallengeActive] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isChallengeActive && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            setIsChallengeActive(false);
            setShowResults(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isChallengeActive, timeRemaining]);

  const startChallenge = (challenge: NetworkingChallenge) => {
    setSelectedChallenge(challenge);
    setTimeRemaining(challenge.timeLimit * 60); // Convert to seconds
    setIsChallengeActive(true);
    setShowResults(false);
    setUserAnswers({});
  };

  const submitChallenge = () => {
    if (!selectedChallenge) return;

    let isCorrect = false;
    
    switch (selectedChallenge.type) {
      case "multiple-choice":
        isCorrect = userAnswers[selectedChallenge.id] === selectedChallenge.correctAnswer;
        break;
      case "calculation":
        isCorrect = userAnswers[selectedChallenge.id] === selectedChallenge.correctAnswer;
        break;
      case "simulation":
        isCorrect = JSON.stringify(userAnswers[selectedChallenge.id]) === JSON.stringify(selectedChallenge.correctAnswer);
        break;
      case "analysis":
        isCorrect = userAnswers[selectedChallenge.id] === selectedChallenge.correctAnswer;
        break;
      case "design":
        isCorrect = true; // Design challenges are subjective
        break;
    }

    setChallengeResults({ ...challengeResults, [selectedChallenge.id]: isCorrect });
    setShowResults(true);
    setIsChallengeActive(false);
  };

  const getModuleIcon = (module: string) => {
    switch (module) {
      case "tcp": return <Server className="h-4 w-4" />;
      case "dns": return <Globe className="h-4 w-4" />;
      case "subnet": return <Network className="h-4 w-4" />;
      case "topology": return <Router className="h-4 w-4" />;
      case "protocol": return <BarChart3 className="h-4 w-4" />;
      case "security": return <Shield className="h-4 w-4" />;
      case "performance": return <Zap className="h-4 w-4" />;
      default: return <Network className="h-4 w-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case "Easy": return "bg-green-100 text-green-800";
      case "Medium": return "bg-yellow-100 text-yellow-800";
      case "Hard": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const renderChallengeQuestion = (challenge: NetworkingChallenge) => {
    switch (challenge.type) {
      case "multiple-choice":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{challenge.question}</p>
            <div className="space-y-3">
              {challenge.options?.map((option, index) => (
                <label key={index} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name={`challenge_${challenge.id}`}
                    value={option}
                    onChange={(e) => setUserAnswers({ ...userAnswers, [challenge.id]: e.target.value })}
                    className="w-4 h-4 text-blue-600"
                  />
                  <span>{option}</span>
                </label>
              ))}
            </div>
          </div>
        );

      case "calculation":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{challenge.question}</p>
            <div className="space-y-2">
              <Label htmlFor="answer">Your Answer:</Label>
              <Input
                id="answer"
                placeholder="Enter your answer..."
                onChange={(e) => setUserAnswers({ ...userAnswers, [challenge.id]: e.target.value })}
              />
            </div>
          </div>
        );

      case "simulation":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{challenge.question}</p>
            <div className="space-y-2">
              <Label>Arrange the steps in order:</Label>
              <div className="grid grid-cols-1 gap-2">
                {challenge.correctAnswer.map((step: string, index: number) => (
                  <Input
                    key={index}
                    placeholder={`Step ${index + 1}`}
                    onChange={(e) => {
                      const newOrder = [...(userAnswers[challenge.id] || [])];
                      newOrder[index] = e.target.value;
                      setUserAnswers({ ...userAnswers, [challenge.id]: newOrder });
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        );

      case "analysis":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{challenge.question}</p>
            <div className="space-y-2">
              <Label htmlFor="analysis">Your Analysis:</Label>
              <Textarea
                id="analysis"
                placeholder="Provide your analysis..."
                rows={4}
                onChange={(e) => setUserAnswers({ ...userAnswers, [challenge.id]: e.target.value })}
              />
            </div>
          </div>
        );

      case "design":
        return (
          <div className="space-y-4">
            <p className="text-lg font-medium">{challenge.question}</p>
            <div className="space-y-2">
              <Label htmlFor="design">Your Design:</Label>
              <Textarea
                id="design"
                placeholder="Describe your network design..."
                rows={6}
                onChange={(e) => setUserAnswers({ ...userAnswers, [challenge.id]: e.target.value })}
              />
            </div>
          </div>
        );

      default:
        return <p className="text-lg font-medium">{challenge.question}</p>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Networking Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Test your networking knowledge with hands-on challenges covering TCP, DNS, subnetting, topology design, protocols, security, and performance monitoring.
        </p>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-8">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="tcp">TCP</TabsTrigger>
          <TabsTrigger value="dns">DNS</TabsTrigger>
          <TabsTrigger value="subnet">Subnet</TabsTrigger>
          <TabsTrigger value="topology">Topology</TabsTrigger>
          <TabsTrigger value="protocol">Protocol</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {["all", "tcp", "dns", "subnet", "topology", "protocol", "security", "performance"].map((tab) => (
          <TabsContent key={tab} value={tab} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {networkingChallenges
                .filter(challenge => tab === "all" || challenge.module === tab)
                .map((challenge) => (
                  <Card key={challenge.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {getModuleIcon(challenge.module)}
                          <Badge variant="outline">{challenge.category}</Badge>
                        </div>
                        <Badge className={getDifficultyColor(challenge.difficulty)}>
                          {challenge.difficulty}
                        </Badge>
                      </div>
                      <CardTitle className="text-lg">{challenge.title}</CardTitle>
                      <CardDescription className="line-clamp-2">
                        {challenge.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between text-sm text-muted-foreground">
                        <div className="flex items-center space-x-2">
                          <Trophy className="h-4 w-4" />
                          <span>{challenge.points} pts</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{challenge.timeLimit} min</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {challenge.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        {challenge.completed ? (
                          <div className="flex items-center space-x-2 text-green-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="text-sm font-medium">Completed</span>
                          </div>
                        ) : challenge.locked ? (
                          <div className="flex items-center space-x-2 text-gray-500">
                            <Lock className="h-4 w-4" />
                            <span className="text-sm font-medium">Locked</span>
                          </div>
                        ) : (
                          <Button 
                            onClick={() => startChallenge(challenge)}
                            className="w-full bg-hero-gradient hover:opacity-90"
                          >
                            <Play className="h-4 w-4 mr-2" />
                            Start Challenge
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Challenge Modal */}
      {selectedChallenge && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getModuleIcon(selectedChallenge.module)}
                  <div>
                    <CardTitle className="text-2xl">{selectedChallenge.title}</CardTitle>
                    <CardDescription>{selectedChallenge.description}</CardDescription>
                  </div>
                </div>
                <div className="text-right">
                  <Badge className={getDifficultyColor(selectedChallenge.difficulty)}>
                    {selectedChallenge.difficulty}
                  </Badge>
                  <div className="text-sm text-muted-foreground mt-1">
                    {selectedChallenge.points} points • {selectedChallenge.timeLimit} min
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6">
              {isChallengeActive && (
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Time Remaining:</span>
                    <span className="text-lg font-bold text-blue-600">
                      {Math.floor(timeRemaining / 60)}:{(timeRemaining % 60).toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>
              )}

              {renderChallengeQuestion(selectedChallenge)}

              {selectedChallenge.hints.length > 0 && (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <h4 className="font-medium text-yellow-800 mb-2">💡 Hints</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm text-yellow-700">
                    {selectedChallenge.hints.map((hint, index) => (
                      <li key={index}>{hint}</li>
                    ))}
                  </ul>
                </div>
              )}

              {showResults && (
                <Alert className={challengeResults[selectedChallenge.id] ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
                  {challengeResults[selectedChallenge.id] ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-red-600" />
                  )}
                  <AlertDescription className={challengeResults[selectedChallenge.id] ? "text-green-800" : "text-red-800"}>
                    {challengeResults[selectedChallenge.id] 
                      ? "🎉 Correct! Great job on this challenge!" 
                      : "❌ Not quite right. Keep learning and try again!"
                    }
                  </AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-3">
                {isChallengeActive && (
                  <Button onClick={submitChallenge} className="flex-1 bg-green-600 hover:bg-green-700">
                    Submit Answer
                  </Button>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setSelectedChallenge(null);
                    setIsChallengeActive(false);
                    setShowResults(false);
                    setUserAnswers({});
                  }}
                  className="flex-1"
                >
                  Close
                </Button>
              </div>

              {showResults && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="font-medium mb-2">📚 Explanation</h4>
                  <p className="text-sm text-gray-700">{selectedChallenge.explanation}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
