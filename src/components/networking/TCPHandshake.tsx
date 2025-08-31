import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle, Clock, Activity, TrendingUp, AlertTriangle, Wifi, Server, Zap } from "lucide-react";
import { networkingApi } from '@/services/networking-api';
import { useAuth } from '@/contexts/AuthContext';

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
  isActive: boolean;
  isNext: boolean;
}

interface PerformanceMetrics {
  latency: number;
  throughput: number;
  packetLoss: number;
  retransmissions: number;
  timestamp: string;
  connectionTime: number;
  rtt: number;
  congestionWindow: number;
}

interface TroubleshootingIssue {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
  isActive: boolean;
  solution: string;
  timestamp: string;
}

export default function TCPHandshake() {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [userId, setUserId] = useState(user?.id || "demo-user");
  const [currentState, setCurrentState] = useState<string>('closed');
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
  const [troubleshootingIssues, setTroubleshootingIssues] = useState<TroubleshootingIssue[]>([]);
  const [showStateMachine, setShowStateMachine] = useState(false);
  const [simulationStartTime, setSimulationStartTime] = useState<number | null>(null);
  const [stateTransitionHistory, setStateTransitionHistory] = useState<Array<{state: string, timestamp: number, reason: string}>>([]);

  // Update userId when user changes
  useEffect(() => {
    setUserId(user?.id || "demo-user");
  }, [user]);

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
      icon: <Clock className="h-4 w-4" />,
      isActive: true,
      isNext: false
    },
    {
      id: 'listen',
      name: 'LISTEN',
      description: 'Server waiting for connection',
      status: 'listen',
      color: 'bg-blue-100 text-blue-800',
      icon: <Activity className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'syn-sent',
      name: 'SYN-SENT',
      description: 'Client sent SYN, waiting for SYN-ACK',
      status: 'syn-sent',
      color: 'bg-yellow-100 text-yellow-800',
      icon: <TrendingUp className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'syn-received',
      name: 'SYN-RECEIVED',
      description: 'Server received SYN, sent SYN-ACK',
      status: 'syn-received',
      color: 'bg-orange-100 text-orange-800',
      icon: <Activity className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'established',
      name: 'ESTABLISHED',
      description: 'Connection established, data transfer ready',
      status: 'established',
      color: 'bg-green-100 text-green-800',
      icon: <CheckCircle className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'fin-wait-1',
      name: 'FIN-WAIT-1',
      description: 'Client initiated connection close',
      status: 'fin-wait-1',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'fin-wait-2',
      name: 'FIN-WAIT-2',
      description: 'Client waiting for server FIN',
      status: 'fin-wait-2',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'close-wait',
      name: 'CLOSE-WAIT',
      description: 'Server received FIN, waiting to close',
      status: 'close-wait',
      color: 'bg-purple-100 text-purple-800',
      icon: <Clock className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'closing',
      name: 'CLOSING',
      description: 'Both sides closing simultaneously',
      status: 'closing',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'last-ack',
      name: 'LAST-ACK',
      description: 'Server sent FIN, waiting for ACK',
      status: 'last-ack',
      color: 'bg-red-100 text-red-800',
      icon: <AlertTriangle className="h-4 w-4" />,
      isActive: false,
      isNext: false
    },
    {
      id: 'time-wait',
      name: 'TIME-WAIT',
      description: 'Connection closing, waiting for timeout',
      status: 'time-wait',
      color: 'bg-gray-100 text-gray-800',
      icon: <Clock className="h-4 w-4" />,
      isActive: false,
      isNext: false
    }
  ];

  const [steps, setSteps] = useState<HandshakeStep[]>(handshakeSteps);
  const [states, setStates] = useState<StateMachineState[]>(stateMachineStates);

  // Function to update state machine based on simulation progress
  const updateStateMachine = (step: number) => {
    const newStates = [...states];
    
    // Reset all states
    newStates.forEach(state => {
      state.isActive = false;
      state.isNext = false;
    });

    // Set active states based on current step
    if (step === 0) {
      // Connection Establishment
      newStates.find(s => s.id === 'closed')!.isActive = true;
      newStates.find(s => s.id === 'syn-sent')!.isNext = true;
    } else if (step === 1) {
      // Data Transfer
      newStates.find(s => s.id === 'established')!.isActive = true;
    } else if (step === 2) {
      // Connection Termination
      newStates.find(s => s.id === 'fin-wait-1')!.isActive = true;
      newStates.find(s => s.id === 'close-wait')!.isNext = true;
    }

    setStates(newStates);
    
    // Update current state
    let newCurrentState = 'closed';
    if (step === 0) newCurrentState = 'syn-sent';
    else if (step === 1) newCurrentState = 'established';
    else if (step === 2) newCurrentState = 'fin-wait-1';
    
    setCurrentState(newCurrentState);
    
    // Add to transition history
    setStateTransitionHistory(prev => [...prev, {
      state: newCurrentState,
      timestamp: Date.now(),
      reason: `Step ${step + 1}: ${handshakeSteps[step].name}`
    }]);
  };

  // Function to generate performance metrics
  const generatePerformanceMetrics = (step: number) => {
    const baseLatency = 20 + Math.random() * 30; // 20-50ms
    const baseThroughput = 100 + Math.random() * 200; // 100-300 Mbps
    const basePacketLoss = Math.random() * 0.5; // 0-0.5%
    const baseRetransmissions = Math.floor(Math.random() * 3); // 0-2
    
    const metrics: PerformanceMetrics = {
      latency: baseLatency + (step * 5), // Latency increases with each step
      throughput: baseThroughput - (step * 20), // Throughput decreases slightly
      packetLoss: basePacketLoss + (step * 0.1), // Packet loss increases slightly
      retransmissions: baseRetransmissions + (step * 0.5), // Retransmissions increase
      timestamp: new Date().toISOString(),
      connectionTime: simulationStartTime ? Date.now() - simulationStartTime : 0,
      rtt: baseLatency * 2, // Round trip time
      congestionWindow: Math.max(1, 10 - step) // Congestion window decreases
    };
    
    setPerformanceMetrics(metrics);
  };

  // Function to update troubleshooting issues
  const updateTroubleshootingIssues = (step: number) => {
    const issues: TroubleshootingIssue[] = [];
    
    // Add issues based on current step and performance
    if (step === 0) {
      issues.push({
        id: 'syn-timeout',
        title: 'SYN Timeout Risk',
        description: 'Client waiting for SYN-ACK response',
        severity: 'medium',
        isActive: true,
        solution: 'Check server availability and network connectivity',
        timestamp: new Date().toISOString()
      });
    }
    
    if (step === 1 && performanceMetrics) {
      if (performanceMetrics.latency > 40) {
        issues.push({
          id: 'high-latency',
          title: 'High Latency Detected',
          description: `Current latency: ${performanceMetrics.latency.toFixed(1)}ms`,
          severity: 'high',
          isActive: true,
          solution: 'Check network congestion and optimize routing',
          timestamp: new Date().toISOString()
        });
      }
      
      if (performanceMetrics.packetLoss > 0.3) {
        issues.push({
          id: 'packet-loss',
          title: 'Packet Loss Detected',
          description: `Current packet loss: ${performanceMetrics.packetLoss.toFixed(2)}%`,
          severity: 'medium',
          isActive: true,
          solution: 'Check network quality and hardware connections',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    if (step === 2) {
      issues.push({
        id: 'connection-close',
        title: 'Connection Closing',
        description: 'Graceful termination in progress',
        severity: 'low',
        isActive: true,
        solution: 'Wait for connection to fully close',
        timestamp: new Date().toISOString()
      });
    }
    
    setTroubleshootingIssues(issues);
  };

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
    setSimulationStartTime(Date.now());
    setStateTransitionHistory([]);
    
    // Save start status to backend
    saveStepProgress("simulation_started", "active");
    
    // Reset all steps
    setSteps(handshakeSteps.map(step => ({ ...step, status: 'pending' })));
    
    // Initialize state machine
    updateStateMachine(0);
    
    // Initialize performance metrics
    generatePerformanceMetrics(0);
    
    // Initialize troubleshooting
    updateTroubleshootingIssues(0);
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
    setStates(stateMachineStates.map(state => ({ ...state, isActive: false, isNext: false })));
    setCurrentState('closed');
    setPerformanceMetrics(null);
    setTroubleshootingIssues([]);
    setStateTransitionHistory([]);
    setSimulationStartTime(null);
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
      
      // Update state machine
      updateStateMachine(newStep);
      
      // Update performance metrics
      generatePerformanceMetrics(newStep);
      
      // Update troubleshooting
      updateTroubleshootingIssues(newStep);
      
      // If this is the last step, save completion
      if (newStep === handshakeSteps.length - 1) {
        saveStepProgress("simulation_completed", "completed");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      const newStep = currentStep - 1;
      setCurrentStep(newStep);
      
      // Update state machine
      updateStateMachine(newStep);
      
      // Update performance metrics
      generatePerformanceMetrics(newStep);
      
      // Update troubleshooting
      updateTroubleshootingIssues(newStep);
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
      
      // Update state machine
      updateStateMachine(currentStepIndex);
      
      // Update performance metrics
      generatePerformanceMetrics(currentStepIndex);
      
      // Update troubleshooting
      updateTroubleshootingIssues(currentStepIndex);
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

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">

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
              <CardDescription>Visualize the TCP connection states and transitions in real-time</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {states.map((state) => (
                  <div
                    key={state.id}
                    className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                      state.isActive 
                        ? 'border-blue-500 bg-blue-50 shadow-lg scale-105' 
                        : state.isNext
                        ? 'border-yellow-500 bg-yellow-50 shadow-md'
                        : 'border-gray-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center space-x-2 mb-2">
                      {state.icon}
                      <span className="font-medium">{state.name}</span>
                    </div>
                    <p className="text-sm text-gray-600">{state.description}</p>
                    {state.isActive && (
                      <Badge className="mt-2 bg-blue-100 text-blue-800 animate-pulse">
                        Current State
                      </Badge>
                    )}
                    {state.isNext && (
                      <Badge className="mt-2 bg-yellow-100 text-yellow-800">
                        Next State
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
              
              {/* State Transition History */}
              {stateTransitionHistory.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-3">State Transition History</h3>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {stateTransitionHistory.slice(-5).reverse().map((transition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-sm">
                        <span className="font-medium">{transition.state}</span>
                        <span className="text-gray-600">{transition.reason}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(transition.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Metrics</CardTitle>
              <CardDescription>Real-time connection performance monitoring</CardDescription>
            </CardHeader>
            <CardContent>
              {performanceMetrics ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-blue-50">
                      <div className="text-2xl font-bold text-blue-600">{performanceMetrics.latency.toFixed(1)}ms</div>
                      <div className="text-sm text-gray-600">Latency</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-green-50">
                      <div className="text-2xl font-bold text-green-600">{performanceMetrics.throughput.toFixed(1)} Mbps</div>
                      <div className="text-sm text-gray-600">Throughput</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-red-50">
                      <div className="text-2xl font-bold text-red-600">{performanceMetrics.packetLoss.toFixed(2)}%</div>
                      <div className="text-sm text-gray-600">Packet Loss</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-orange-50">
                      <div className="text-2xl font-bold text-orange-600">{performanceMetrics.retransmissions}</div>
                      <div className="text-sm text-gray-600">Retransmissions</div>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 border rounded-lg bg-purple-50">
                      <div className="text-xl font-bold text-purple-600">{performanceMetrics.connectionTime}ms</div>
                      <div className="text-sm text-gray-600">Connection Time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-indigo-50">
                      <div className="text-xl font-bold text-indigo-600">{performanceMetrics.rtt.toFixed(1)}ms</div>
                      <div className="text-sm text-gray-600">Round Trip Time</div>
                    </div>
                    <div className="text-center p-4 border rounded-lg bg-teal-50">
                      <div className="text-xl font-bold text-teal-600">{performanceMetrics.congestionWindow}</div>
                      <div className="text-sm text-gray-600">Congestion Window</div>
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-gray-500">
                    Last updated: {new Date(performanceMetrics.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wifi className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>Start the simulation to see real-time performance metrics</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="troubleshooting" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Real-time Issues & Solutions</CardTitle>
              <CardDescription>Dynamic troubleshooting based on current simulation state and performance</CardDescription>
            </CardHeader>
            <CardContent>
              {troubleshootingIssues.length > 0 ? (
                <div className="space-y-4">
                  {troubleshootingIssues.map((issue) => (
                    <Alert key={issue.id} className={`border-2 ${getSeverityColor(issue.severity)}`}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <div className="flex items-center justify-between mb-2">
                          <strong>{issue.title}</strong>
                          <Badge className={getSeverityColor(issue.severity)}>
                            {issue.severity.toUpperCase()}
                          </Badge>
                        </div>
                        <p className="mb-2">{issue.description}</p>
                        <div className="bg-white/50 p-2 rounded text-sm">
                          <strong>Solution:</strong> {issue.solution}
                        </div>
                        <div className="text-xs text-gray-600 mt-2">
                          Detected: {new Date(issue.timestamp).toLocaleTimeString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-300" />
                  <p>No active issues detected. All systems are operating normally.</p>
                </div>
              )}
              
              {/* Common TCP Issues Reference */}
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3">Common TCP Handshake Issues</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-red-700 mb-2">SYN Flood Attack</h4>
                    <p className="text-sm text-gray-600">Server receives many SYN packets but no ACK responses. Implement SYN cookies or rate limiting.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-orange-700 mb-2">Connection Timeout</h4>
                    <p className="text-sm text-gray-600">Client doesn't receive SYN-ACK within timeout period. Check network connectivity and firewall settings.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-yellow-700 mb-2">Port Unreachable</h4>
                    <p className="text-sm text-gray-600">Server port is closed or blocked. Verify server is running and port is open.</p>
                  </div>
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <h4 className="font-medium text-blue-700 mb-2">High Latency</h4>
                    <p className="text-sm text-gray-600">Network congestion or routing issues. Optimize network paths and check for bottlenecks.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
