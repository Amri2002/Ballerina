import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle, Clock, Activity, TrendingUp, AlertTriangle } from "lucide-react";
import { networkingApi } from '@/services/networking-api';

interface Packet {
  id: string;
  type: 'SYN' | 'SYN-ACK' | 'ACK' | 'FIN' | 'FIN-ACK';
  source: 'client' | 'server';
  destination: 'client' | 'server';
  status: 'pending' | 'sending' | 'received' | 'completed';
  data?: string;
  timestamp: number;
}

interface HandshakeStep {
  id: number;
  name: string;
  description: string;
  packets: Packet[];
  status: 'pending' | 'active' | 'completed';
}

interface StateMachineState {
  id: string;
  name: string;
  description: string;
  status: 'closed' | 'listen' | 'syn-sent' | 'syn-received' | 'established' | 'fin-wait-1' | 'fin-wait-2' | 'close-wait' | 'closing' | 'last-ack' | 'time-wait';
  color: string;
  icon: React.ReactNode;
}

interface PerformanceMetrics {
  latency: number;
  throughput: number;
  packetLoss: number;
  retransmissions: number;
  timestamp: string;
}

export default function TCPHandshake() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [userId, setUserId] = useState("demo-user");
  const [currentState, setCurrentState] = useState<string>('closed');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [errorScenarios, setErrorScenarios] = useState<string[]>([]);
  const [showStateMachine, setShowStateMachine] = useState(false);

  const handshakeSteps: HandshakeStep[] = [
    {
      id: 1,
      name: "Connection Establishment",
      description: "TCP Three-Way Handshake",
      packets: [
        {
          id: "syn",
          type: "SYN",
          source: "client",
          destination: "server",
          status: "pending",
          data: "SYN=1, seq=x",
          timestamp: Date.now()
        },
        {
          id: "syn-ack",
          type: "SYN-ACK",
          source: "server",
          destination: "client",
          status: "pending",
          data: "SYN=1, ACK=1, seq=y, ack=x+1",
          timestamp: Date.now()
        },
        {
          id: "ack",
          type: "ACK",
          source: "client",
          destination: "server",
          status: "pending",
          data: "ACK=1, seq=x+1, ack=y+1",
          timestamp: Date.now()
        }
      ],
      status: "pending"
    },
    {
      id: 2,
      name: "Data Transfer",
      description: "Reliable data transmission",
      packets: [
        {
          id: "data-1",
          type: "ACK",
          source: "client",
          destination: "server",
          status: "pending",
          data: "Data: Hello Server",
          timestamp: Date.now()
        },
        {
          id: "data-2",
          type: "ACK",
          source: "server",
          destination: "client",
          status: "pending",
          data: "Data: Hello Client",
          timestamp: Date.now()
        }
      ],
      status: "pending"
    },
    {
      id: 3,
      name: "Connection Termination",
      description: "Graceful connection close",
      packets: [
        {
          id: "fin-1",
          type: "FIN",
          source: "client",
          destination: "server",
          status: "pending",
          data: "FIN=1, seq=u",
          timestamp: Date.now()
        },
        {
          id: "fin-ack-1",
          type: "FIN-ACK",
          source: "server",
          destination: "client",
          status: "pending",
          data: "ACK=1, ack=u+1",
          timestamp: Date.now()
        },
        {
          id: "fin-2",
          type: "FIN",
          source: "server",
          destination: "client",
          status: "pending",
          data: "FIN=1, seq=v",
          timestamp: Date.now()
        },
        {
          id: "fin-ack-2",
          type: "FIN-ACK",
          source: "client",
          destination: "server",
          status: "pending",
          data: "ACK=1, ack=v+1",
          timestamp: Date.now()
        }
      ],
      status: "pending"
    }
  ];

  const stateMachineStates: StateMachineState[] = [
    {
      id: 'closed',
      name: 'CLOSED',
      description: 'No connection exists',
      status: 'closed',
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'listen',
      name: 'LISTEN',
      description: 'Server waiting for connection',
      status: 'listen',
      color: 'bg-blue-100 text-blue-800',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'syn-sent',
      name: 'SYN-SENT',
      description: 'Client sent SYN, waiting for SYN-ACK',
      status: 'syn-sent',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <TrendingUp className="h-4 w-4" />
    },
    {
      id: 'syn-received',
      name: 'SYN-RECEIVED',
      description: 'Server received SYN, sent SYN-ACK',
      status: 'syn-received',
      color: 'bg-orange-100 text-orange-800',
      icon: <Activity className="h-4 w-4" />
    },
    {
      id: 'established',
      name: 'ESTABLISHED',
      description: 'Connection established, data transfer ready',
      status: 'established',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-4 w-4" />
    },
    {
      id: 'fin-wait-1',
      name: 'FIN-WAIT-1',
      description: 'Client initiated connection close',
      status: 'fin-wait-1',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'fin-wait-2',
      name: 'FIN-WAIT-2',
      description: 'Client waiting for server FIN',
      status: 'fin-wait-2',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'close-wait',
      name: 'CLOSE-WAIT',
      description: 'Server received FIN, waiting to close',
      status: 'close-wait',
      color: 'bg-purple-100 text-purple-800',
      icon: <Clock className="h-4 w-4" />
    },
    {
      id: 'closing',
      name: 'CLOSING',
      description: 'Both sides closing simultaneously',
      status: 'closing',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'last-ack',
      name: 'LAST-ACK',
      description: 'Server sent FIN, waiting for ACK',
      status: 'last-ack',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />
    },
    {
      id: 'time-wait',
      name: 'TIME-WAIT',
      description: 'Connection closing, waiting for timeout',
      status: 'time-wait',
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="h-4 w-4" />
    }
  ];

  const [steps, setSteps] = useState<HandshakeStep[]>(handshakeSteps);

  // Function to save step progress to backend
  const saveStepProgress = async (stepName: string, status: string) => {
    try {
      const stepData = {
        userId: userId,
        step: stepName,
        status: status
      };
      
      console.log('Saving step progress:', stepData);
      
      const response = await networkingApi.saveTCPHandshake(stepData);
      console.log('Backend response:', response);
      
      // You can show a success message here
      console.log('Step progress saved successfully!');
      
    } catch (error) {
      console.error('Failed to save step progress:', error);
      // You can show an error message here
    }
  };

  const startSimulation = () => {
    setIsPlaying(true);
    setCurrentStep(0);
    setProgress(0);
    
    // Save start status to backend
    saveStepProgress("simulation_started", "active");
    
    // Reset all steps
    setSteps(handshakeSteps.map(step => ({ ...step, status: 'pending' })));
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setProgress(0);
    setPackets([]);
    setSteps(handshakeSteps.map(step => ({ ...step, status: 'pending' })));
  };

  const nextStep = () => {
    if (currentStep < handshakeSteps.length - 1) {
      const newStep = currentStep + 1;
      setCurrentStep(newStep);
      
      // Save step completion to backend
      const stepName = handshakeSteps[currentStep].name;
      saveStepProgress(stepName, "completed");
      
      // Update progress
      const newProgress = ((newStep + 1) / handshakeSteps.length) * 100;
      setProgress(newProgress);
      
      // If this is the last step, save completion
      if (newStep === handshakeSteps.length - 1) {
        saveStepProgress("simulation_completed", "completed");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Simulation logic
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          setIsPlaying(false);
          return 100;
        }
        return prev + 2;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Step progression
  useEffect(() => {
    if (!isPlaying) return;

    const stepProgress = progress / 100;
    const currentStepIndex = Math.floor(stepProgress * steps.length);
    
    if (currentStepIndex !== currentStep && currentStepIndex < steps.length) {
      setCurrentStep(currentStepIndex);
      
      // Update step status
      setSteps(prev => prev.map((step, index) => {
        if (index < currentStepIndex) {
          return { ...step, status: 'completed' as const };
        } else if (index === currentStepIndex) {
          return { ...step, status: 'active' as const };
        }
        return step;
      }));

      // Add packets for current step
      const currentStepData = steps[currentStepIndex];
      setPackets(prev => [...prev, ...currentStepData.packets]);
    }
  }, [progress, isPlaying, currentStep, steps]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'active':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getPacketStatusColor = (status: string) => {
    switch (status) {
      case 'sending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'received':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'completed':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">TCP Three-Way Handshake</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStateMachine(!showStateMachine)}
          >
            {showStateMachine ? 'Hide' : 'Show'} State Machine
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowDetails(!showDetails)}
          >
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      <Tabs defaultValue="simulation" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="simulation">Simulation</TabsTrigger>
          <TabsTrigger value="state-machine">State Machine</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
        </TabsList>

        <TabsContent value="simulation" className="space-y-6">
          {/* Controls */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={isPlaying ? pauseSimulation : startSimulation}
                    disabled={progress === 100}
                  >
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                    {isPlaying ? 'Pause' : 'Start'} Simulation
                  </Button>
                  <Button variant="outline" onClick={resetSimulation}>
                    <RotateCcw className="h-4 w-4" />
                    Reset
                  </Button>
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={prevStep}
                    disabled={currentStep === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={nextStep}
                    disabled={currentStep === steps.length - 1}
                  >
                    Next
                  </Button>
                </div>
              </div>
              
              <Progress value={progress} className="w-full" />
              <div className="mt-2 text-sm text-muted-foreground">
                Progress: {Math.round(progress)}% - Step {currentStep + 1} of {steps.length}
              </div>
            </CardContent>
          </Card>

      {/* Network Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Client */}
        <Card className="border-2 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
              Client
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packets
                .filter(p => p.source === 'client')
                .map(packet => (
                  <div
                    key={packet.id}
                    className={`p-2 rounded border text-xs ${getPacketStatusColor(packet.status)}`}
                  >
                    <div className="font-medium">{packet.type}</div>
                    {showDetails && (
                      <div className="text-xs opacity-75">{packet.data}</div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        {/* Network */}
        <Card className="border-2 border-gray-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-center">Network</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packets.map(packet => (
                <div
                  key={packet.id}
                  className={`p-2 rounded border text-xs ${getPacketStatusColor(packet.status)}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{packet.type}</span>
                    <ArrowRight className="h-3 w-3" />
                  </div>
                  {showDetails && (
                    <div className="text-xs opacity-75 mt-1">{packet.data}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Server */}
        <Card className="border-2 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center">
              <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
              Server
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {packets
                .filter(p => p.source === 'server')
                .map(packet => (
                  <div
                    key={packet.id}
                    className={`p-2 rounded border text-xs ${getPacketStatusColor(packet.status)}`}
                  >
                    <div className="font-medium">{packet.type}</div>
                    {showDetails && (
                      <div className="text-xs opacity-75">{packet.data}</div>
                    )}
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Handshake Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  step.status === 'active' ? 'bg-blue-50 border-blue-200' :
                  step.status === 'completed' ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {getStatusIcon(step.status)}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{step.name}</div>
                  <div className="text-sm text-muted-foreground">{step.description}</div>
                </div>
                <Badge variant="outline">
                  {step.packets.length} packets
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
        </TabsContent>

        <TabsContent value="state-machine" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>TCP State Machine</CardTitle>
              <CardDescription>Visualize the TCP connection states and transitions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {stateMachineStates.map((state) => (
                  <div
                    key={state.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      currentState === state.id 
                        ? 'border-blue-500 bg-blue-50' 
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {state.icon}
                      <span className="font-medium">{state.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{state.description}</p>
                    {currentState === state.id && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800">
                        Current State
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Monitor connection performance and timing</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceMetrics ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">{performanceMetrics.latency}ms</div>
                    <div className="text-sm text-gray-600">Latency</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">{performanceMetrics.throughput} Mbps</div>
                    <div className="text-sm text-gray-600">Throughput</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">{performanceMetrics.packetLoss}%</div>
                    <div className="text-sm text-gray-600">Packet Loss</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">{performanceMetrics.retransmissions}</div>
                    <div className="text-sm text-gray-600">Retransmissions</div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Start the simulation to see performance metrics
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Common Issues & Solutions</CardTitle>
              <CardDescription>Learn about TCP handshake problems and how to resolve them</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>SYN Flood Attack:</strong> Server receives many SYN packets but no ACK responses.
                    Solution: Implement SYN cookies or rate limiting.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Connection Timeout:</strong> Client doesn't receive SYN-ACK within timeout period.
                    Solution: Check network connectivity and firewall settings.
                  </AlertDescription>
                </Alert>
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Port Unreachable:</strong> Server port is closed or blocked.
                    Solution: Verify server is running and port is open.
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
