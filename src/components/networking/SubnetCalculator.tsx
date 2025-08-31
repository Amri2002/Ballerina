import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calculator, Network, Globe, Binary, Eye, EyeOff, RefreshCw, Copy, Check, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { networkingApi } from "@/services/networking-api";

interface SubnetInfo {
  networkAddress: string;
  broadcastAddress: string;
  firstHost: string;
  lastHost: string;
  subnetMask: string;
  wildcardMask: string;
  totalHosts: number;
  usableHosts: number;
  networkBits: number;
  hostBits: number;
  cidr: string;
  binaryMask: string;
  ipClass: string;
}

interface SubnetExercise {
  id: string;
  question: string;
  ipAddress: string;
  subnetMask: string;
  answer: SubnetInfo;
  userAnswer?: SubnetInfo;
  completed: boolean;
  isCorrect?: boolean;
  showFeedback?: boolean;
  userInputs?: {
    networkAddress?: string;
    broadcastAddress?: string;
    firstHost?: string;
    lastHost?: string;
    totalHosts?: string;
  };
}

export default function SubnetCalculator() {
  const [ipAddress, setIpAddress] = useState('192.168.1.0');
  const [subnetMask, setSubnetMask] = useState('255.255.255.0');
  const [cidr, setCidr] = useState('24');
  const [ipVersion, setIpVersion] = useState<'ipv4' | 'ipv6'>('ipv4');
  const [showBinary, setShowBinary] = useState(false);
  const [subnetInfo, setSubnetInfo] = useState<SubnetInfo | null>(null);
  const [exercises, setExercises] = useState<SubnetExercise[]>([]);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [copied, setCopied] = useState(false);

  // MongoDB Integration
  const [isLoading, setIsLoading] = useState(false);
  const [backendConnected, setBackendConnected] = useState(false);
  const [userProgress, setUserProgress] = useState<any>(null);
  
  // Hooks
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();

  // Generate practice exercises
  useEffect(() => {
    const generateExercises = (): SubnetExercise[] => {
      const exerciseData = [
        {
          ipAddress: '192.168.1.0',
          subnetMask: '255.255.255.0',
          cidr: '24'
        },
        {
          ipAddress: '10.0.0.0',
          subnetMask: '255.255.0.0',
          cidr: '16'
        },
        {
          ipAddress: '172.16.0.0',
          subnetMask: '255.255.255.128',
          cidr: '25'
        },
        {
          ipAddress: '192.168.0.0',
          subnetMask: '255.255.255.192',
          cidr: '26'
        },
        {
          ipAddress: '10.1.0.0',
          subnetMask: '255.255.255.240',
          cidr: '28'
        }
      ];

      return exerciseData.map((data, index) => ({
        id: `exercise-${index + 1}`,
        question: `Calculate subnet information for ${data.ipAddress}/${data.cidr}`,
        ipAddress: data.ipAddress,
        subnetMask: data.subnetMask,
        answer: calculateSubnetInfo(data.ipAddress, data.subnetMask),
        userInputs: {
          networkAddress: '',
          broadcastAddress: '',
          firstHost: '',
          lastHost: '',
          totalHosts: '',
        },
        completed: false,
        isCorrect: undefined,
        showFeedback: false,
      }));
    };

    setExercises(generateExercises());
    loadUserProgress();
  }, []);

  // Load user progress from backend
  const loadUserProgress = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setIsLoading(true);
      const progress = await networkingApi.getUserProgress(user.id);
      setUserProgress(progress);
      setBackendConnected(true);
      
      // Update exercises with saved progress
      if (progress && typeof progress === 'object' && 'subnetExercises' in progress) {
        const subnetExercises = (progress as any).subnetExercises;
        setExercises(prev => prev.map(exercise => {
          const savedProgress = subnetExercises.find((p: any) => p.exerciseId === exercise.id);
          if (savedProgress) {
            return {
              ...exercise,
              completed: savedProgress.completed,
              isCorrect: savedProgress.isCorrect,
              userInputs: savedProgress.userInputs || exercise.userInputs,
              showFeedback: savedProgress.completed
            };
          }
          return exercise;
        }));
      }
      
      toast({
        title: "Progress Loaded",
        description: "Your subnet practice progress has been loaded from the backend.",
      });
    } catch (error) {
      console.log("Could not load progress from backend:", error);
      setBackendConnected(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Save subnet calculation to backend
  const saveSubnetCalculation = async (subnetData: SubnetInfo) => {
    if (!isAuthenticated || !user) return;
    
    try {
      await networkingApi.calculateSubnet({
        userId: user.id,
        ipAddress: ipAddress,
        subnetMask: subnetMask,
        cidr: cidr
      });
      
      toast({
        title: "Calculation Saved",
        description: "Subnet calculation has been saved to your progress.",
      });
    } catch (error) {
      console.log("Could not save calculation to backend:", error);
    }
  };

  // Save exercise completion to backend
  const saveExerciseProgress = async (exerciseIndex: number, isCorrect: boolean) => {
    if (!isAuthenticated || !user) return;
    
    const exercise = exercises[exerciseIndex];
    try {
      await networkingApi.updateProgress({
        userId: user.id,
        module: 'networking',
        topic: 'subnet-calculator',
        progress: Math.round(((exercises.filter(e => e.completed).length + 1) / exercises.length) * 100)
      });
      
      // Save exercise result
      const exerciseData = {
        exerciseId: exercise.id,
        completed: true,
        isCorrect,
        userInputs: exercise.userInputs,
        correctAnswer: exercise.answer,
        timestamp: new Date().toISOString()
      };
      
      // Update local state
      setUserProgress(prev => ({
        ...prev,
        subnetExercises: [...(prev?.subnetExercises || []), exerciseData]
      }));
      
      toast({
        title: isCorrect ? "Excellent!" : "Keep Learning",
        description: isCorrect 
          ? "Correct answer! Progress saved to backend."
          : "Some answers were incorrect. Review and try again!",
        variant: isCorrect ? "default" : "destructive"
      });
    } catch (error) {
      console.log("Could not save exercise progress to backend:", error);
      toast({
        title: "Progress Not Saved",
        description: "Could not save progress to backend, but your answer has been checked.",
        variant: "destructive"
      });
    }
  };

  const ipToBinary = (ip: string): string => {
    return ip.split('.').map(octet => 
      parseInt(octet).toString(2).padStart(8, '0')
    ).join('.');
  };

  const binaryToIp = (binary: string): string => {
    return binary.split('.').map(bin => 
      parseInt(bin, 2).toString()
    ).join('.');
  };

  const calculateSubnetInfo = (ip: string, mask: string): SubnetInfo => {
    const ipParts = ip.split('.').map(Number);
    const maskParts = mask.split('.').map(Number);
    
    // Calculate network address
    const networkAddress = ipParts.map((part, i) => part & maskParts[i]).join('.');
    
    // Calculate broadcast address
    const wildcardMask = maskParts.map(part => 255 - part);
    const broadcastAddress = ipParts.map((part, i) => part | wildcardMask[i]).join('.');
    
    // Calculate first and last host
    const networkParts = networkAddress.split('.').map(Number);
    const broadcastParts = broadcastAddress.split('.').map(Number);
    
    const firstHost = networkParts.map((part, i) => 
      i === 3 ? part + 1 : part
    ).join('.');
    
    const lastHost = broadcastParts.map((part, i) => 
      i === 3 ? part - 1 : part
    ).join('.');
    
    // Calculate total hosts
    const hostBits = wildcardMask.reduce((sum, part) => sum + Math.log2(part + 1), 0);
    const totalHosts = Math.pow(2, hostBits);
    const usableHosts = totalHosts - 2;
    
    // Calculate CIDR
    const networkBits = maskParts.reduce((sum, part) => 
      sum + part.toString(2).split('1').length - 1, 0
    );
    
    // Determine IP class
    let ipClass = 'Unknown';
    if (ipParts[0] >= 1 && ipParts[0] <= 126) ipClass = 'A';
    else if (ipParts[0] >= 128 && ipParts[0] <= 191) ipClass = 'B';
    else if (ipParts[0] >= 192 && ipParts[0] <= 223) ipClass = 'C';
    else if (ipParts[0] >= 224 && ipParts[0] <= 239) ipClass = 'D';
    else if (ipParts[0] >= 240 && ipParts[0] <= 255) ipClass = 'E';
    
    return {
      networkAddress,
      broadcastAddress,
      firstHost,
      lastHost,
      subnetMask: mask,
      wildcardMask: wildcardMask.join('.'),
      totalHosts,
      usableHosts,
      networkBits,
      hostBits,
      cidr: `/${networkBits}`,
      binaryMask: ipToBinary(mask),
      ipClass
    };
  };

  const updateFromCidr = (newCidr: string) => {
    setCidr(newCidr);
    const cidrNum = parseInt(newCidr);
    const maskParts = [];
    
    for (let i = 0; i < 4; i++) {
      const bitsInOctet = Math.min(8, Math.max(0, cidrNum - i * 8));
      maskParts.push(bitsInOctet === 8 ? 255 : (256 - Math.pow(2, 8 - bitsInOctet)));
    }
    
    setSubnetMask(maskParts.join('.'));
  };

  const updateFromMask = (newMask: string) => {
    setSubnetMask(newMask);
    const maskParts = newMask.split('.').map(Number);
    const networkBits = maskParts.reduce((sum, part) => 
      sum + part.toString(2).split('1').length - 1, 0
    );
    setCidr(networkBits.toString());
  };

  useEffect(() => {
    if (ipAddress && subnetMask) {
      setSubnetInfo(calculateSubnetInfo(ipAddress, subnetMask));
    }
  }, [ipAddress, subnetMask]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateNewExercise = () => {
    const randomIp = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.0`;
    const randomCidr = Math.floor(Math.random() * 16) + 16; // CIDR 16-31
    const maskParts = [];
    
    for (let i = 0; i < 4; i++) {
      const bitsInOctet = Math.min(8, Math.max(0, randomCidr - i * 8));
      maskParts.push(bitsInOctet === 8 ? 255 : (256 - Math.pow(2, 8 - bitsInOctet)));
    }
    
    const randomMask = maskParts.join('.');
    
    setIpAddress(randomIp);
    setSubnetMask(randomMask);
    setCidr(randomCidr.toString());
  };

  const checkExercise = (exerciseIndex: number) => {
    const exercise = exercises[exerciseIndex];
    const calculated = calculateSubnetInfo(exercise.ipAddress, exercise.subnetMask);
    
    // Validate user inputs
    const userInputs = exercise.userInputs || {};
    const isCorrect = 
      userInputs.networkAddress === calculated.networkAddress &&
      userInputs.broadcastAddress === calculated.broadcastAddress &&
      userInputs.firstHost === calculated.firstHost &&
      userInputs.lastHost === calculated.lastHost &&
      userInputs.totalHosts === calculated.totalHosts.toString();
    
    setExercises(prev => prev.map((ex, index) => 
      index === exerciseIndex 
        ? { 
            ...ex, 
            userAnswer: calculated, 
            completed: true,
            isCorrect,
            showFeedback: true
          }
        : ex
    ));
    
    // Save progress to backend
    saveExerciseProgress(exerciseIndex, isCorrect);
  };

  const updateUserInput = (exerciseIndex: number, field: string, value: string) => {
    setExercises(prev => prev.map((ex, index) => 
      index === exerciseIndex 
        ? { 
            ...ex, 
            userInputs: { ...ex.userInputs, [field]: value },
            showFeedback: false,
            completed: false
          }
        : ex
    ));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        {/* <div>
          <h2 className="text-2xl font-bold">Subnet Calculator</h2>
          <p className="text-muted-foreground">
            Calculate subnet information, practice CIDR notation, and visualize IP addressing
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowBinary(!showBinary)}
          >
            {showBinary ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showBinary ? 'Hide' : 'Show'} Binary
          </Button>
        </div> */}
      </div>

      <Tabs defaultValue="calculator" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="calculator">Calculator</TabsTrigger>
          <TabsTrigger value="exercises">Practice Exercises</TabsTrigger>
          <TabsTrigger value="visualization">Visualization</TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-6">
          {/* Input Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Subnet Calculator
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="ip-version">IP Version</Label>
                  <Select value={ipVersion} onValueChange={(value: 'ipv4' | 'ipv6') => setIpVersion(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ipv4">IPv4</SelectItem>
                      <SelectItem value="ipv6">IPv6</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="ip-address">IP Address</Label>
                  <Input
                    id="ip-address"
                    value={ipAddress}
                    onChange={(e) => setIpAddress(e.target.value)}
                    placeholder="192.168.1.0"
                  />
                </div>
                
                <div>
                  <Label htmlFor="cidr">CIDR Notation</Label>
                  <Input
                    id="cidr"
                    value={cidr}
                    onChange={(e) => updateFromCidr(e.target.value)}
                    placeholder="24"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="subnet-mask">Subnet Mask</Label>
                  <Input
                    id="subnet-mask"
                    value={subnetMask}
                    onChange={(e) => updateFromMask(e.target.value)}
                    placeholder="255.255.255.0"
                  />
                </div>
                
                <div className="flex items-end">
                  <Button onClick={generateNewExercise} variant="outline" className="w-full">
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Random
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {subnetInfo && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <Card>
                <CardHeader>
                  <CardTitle>Subnet Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="font-medium">Network Address:</span>
                      <span className="font-mono">{subnetInfo.networkAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Broadcast Address:</span>
                      <span className="font-mono">{subnetInfo.broadcastAddress}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">First Host:</span>
                      <span className="font-mono">{subnetInfo.firstHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Last Host:</span>
                      <span className="font-mono">{subnetInfo.lastHost}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Subnet Mask:</span>
                      <span className="font-mono">{subnetInfo.subnetMask}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Wildcard Mask:</span>
                      <span className="font-mono">{subnetInfo.wildcardMask}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(JSON.stringify(subnetInfo, null, 2))}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? 'Copied!' : 'Copy Results'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Network Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{subnetInfo.totalHosts}</div>
                      <div className="text-sm text-blue-600">Total Hosts</div>
                    </div>
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">{subnetInfo.usableHosts}</div>
                      <div className="text-sm text-green-600">Usable Hosts</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Network Bits:</span>
                      <span className="font-mono">{subnetInfo.networkBits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Host Bits:</span>
                      <span className="font-mono">{subnetInfo.hostBits}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>IP Class:</span>
                      <Badge variant="outline">{subnetInfo.ipClass}</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>CIDR:</span>
                      <span className="font-mono">{subnetInfo.cidr}</span>
                    </div>
                  </div>
                  
                  {showBinary && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm font-medium mb-2">Binary Subnet Mask:</div>
                      <div className="font-mono text-xs">{subnetInfo.binaryMask}</div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="exercises" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Practice Exercises</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Calculate the subnet information and submit your answers to check if they're correct.
                  </p>
                </div>
                {isAuthenticated && (
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                    <span className="text-xs text-muted-foreground">
                      {backendConnected ? 'Backend Connected' : 'Backend Offline'}
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* Progress Summary */}
                {isAuthenticated && (
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-sm font-medium text-blue-800">Your Progress</h4>
                      <span className="text-sm text-blue-600">
                        {exercises.filter(e => e.completed).length} / {exercises.length} completed
                      </span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ 
                          width: `${(exercises.filter(e => e.completed).length / exercises.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    <div className="mt-2 text-xs text-blue-600">
                      {exercises.filter(e => e.completed && e.isCorrect).length} correct answers
                    </div>
                  </div>
                )}
                
                {exercises.map((exercise, index) => (
                  <div key={exercise.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium">Exercise {index + 1}</h4>
                      <Badge variant={
                        exercise.completed 
                          ? (exercise.isCorrect ? "default" : "destructive")
                          : "secondary"
                      }>
                        {exercise.completed 
                          ? (exercise.isCorrect ? "Correct!" : "Incorrect")
                          : "Pending"
                        }
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-3">{exercise.question}</p>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                      <div>
                        <span className="font-medium">IP Address:</span>
                        <span className="font-mono ml-2">{exercise.ipAddress}</span>
                      </div>
                      <div>
                        <span className="font-medium">Subnet Mask:</span>
                        <span className="font-mono ml-2">{exercise.subnetMask}</span>
                      </div>
                    </div>
                    
                    {/* User Input Fields */}
                    <div className="space-y-3 mb-4">
                      <h5 className="text-sm font-medium">Enter your answers:</h5>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <Label htmlFor={`network-${index}`} className="text-xs">Network Address</Label>
                          <Input
                            id={`network-${index}`}
                            value={exercise.userInputs?.networkAddress || ''}
                            onChange={(e) => updateUserInput(index, 'networkAddress', e.target.value)}
                            placeholder="192.168.1.0"
                            className="text-sm"
                            disabled={exercise.completed}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`broadcast-${index}`} className="text-xs">Broadcast Address</Label>
                          <Input
                            id={`broadcast-${index}`}
                            value={exercise.userInputs?.broadcastAddress || ''}
                            onChange={(e) => updateUserInput(index, 'broadcastAddress', e.target.value)}
                            placeholder="192.168.1.255"
                            className="text-sm"
                            disabled={exercise.completed}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`first-host-${index}`} className="text-xs">First Host</Label>
                          <Input
                            id={`first-host-${index}`}
                            value={exercise.userInputs?.firstHost || ''}
                            onChange={(e) => updateUserInput(index, 'firstHost', e.target.value)}
                            placeholder="192.168.1.1"
                            className="text-sm"
                            disabled={exercise.completed}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`last-host-${index}`} className="text-xs">Last Host</Label>
                          <Input
                            id={`last-host-${index}`}
                            value={exercise.userInputs?.lastHost || ''}
                            onChange={(e) => updateUserInput(index, 'lastHost', e.target.value)}
                            placeholder="192.168.1.254"
                            className="text-sm"
                            disabled={exercise.completed}
                          />
                        </div>
                        <div>
                          <Label htmlFor={`total-hosts-${index}`} className="text-xs">Total Hosts</Label>
                          <Input
                            id={`total-hosts-${index}`}
                            value={exercise.userInputs?.totalHosts || ''}
                            onChange={(e) => updateUserInput(index, 'totalHosts', e.target.value)}
                            placeholder="254"
                            className="text-sm"
                            disabled={exercise.completed}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Submit Button */}
                    <div className="flex items-center justify-between">
                      <Button
                        size="sm"
                        onClick={() => checkExercise(index)}
                        disabled={exercise.completed || !exercise.userInputs?.networkAddress}
                      >
                        {exercise.completed ? "Completed" : "Submit Answer"}
                      </Button>
                      
                      {exercise.completed && exercise.showFeedback && (
                        <div className="text-sm">
                          {exercise.isCorrect ? (
                            <span className="text-green-600 flex items-center">
                              <Check className="h-4 w-4 mr-1" />
                              All answers correct!
                            </span>
                          ) : (
                            <span className="text-red-600 flex items-center">
                              <XCircle className="h-4 w-4 mr-1" />
                              Some answers are incorrect
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {/* Feedback Section */}
                    {exercise.completed && exercise.showFeedback && exercise.userAnswer && (
                      <div className={`mt-4 p-3 rounded-lg ${
                        exercise.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                      }`}>
                        <div className="text-sm font-medium mb-2">
                          {exercise.isCorrect ? 'Correct Answers:' : 'Your Answers vs Correct Answers:'}
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                          <div className="flex justify-between">
                            <span>Network Address:</span>
                            <span className="font-mono">{exercise.userAnswer.networkAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Broadcast Address:</span>
                            <span className="font-mono">{exercise.userAnswer.broadcastAddress}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>First Host:</span>
                            <span className="font-mono">{exercise.userAnswer.firstHost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Last Host:</span>
                            <span className="font-mono">{exercise.userAnswer.lastHost}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Hosts:</span>
                            <span className="font-mono">{exercise.userAnswer.totalHosts}</span>
                          </div>
                        </div>
                        
                        {!exercise.isCorrect && (
                          <div className="mt-2 text-xs text-red-600">
                            <div className="font-medium mb-1">Your incorrect answers:</div>
                            {exercise.userInputs?.networkAddress !== exercise.userAnswer.networkAddress && (
                              <div>Network Address: {exercise.userInputs?.networkAddress} (should be {exercise.userAnswer.networkAddress})</div>
                            )}
                            {exercise.userInputs?.broadcastAddress !== exercise.userAnswer.broadcastAddress && (
                              <div>Broadcast Address: {exercise.userInputs?.broadcastAddress} (should be {exercise.userAnswer.broadcastAddress})</div>
                            )}
                            {exercise.userInputs?.firstHost !== exercise.userAnswer.firstHost && (
                              <div>First Host: {exercise.userInputs?.firstHost} (should be {exercise.userAnswer.firstHost})</div>
                            )}
                            {exercise.userInputs?.lastHost !== exercise.userAnswer.lastHost && (
                              <div>Last Host: {exercise.userInputs?.lastHost} (should be {exercise.userAnswer.lastHost})</div>
                            )}
                            {exercise.userInputs?.totalHosts !== exercise.userAnswer.totalHosts.toString() && (
                              <div>Total Hosts: {exercise.userInputs?.totalHosts} (should be {exercise.userAnswer.totalHosts})</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visualization" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Subnet Visualization</CardTitle>
            </CardHeader>
            <CardContent>
              {subnetInfo && (
                <div className="space-y-4">
                  {/* Binary Visualization */}
                  <div>
                    <h4 className="font-medium mb-2">Binary Representation</h4>
                    <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm">
                      <div className="mb-2">
                        <span className="text-gray-600">IP Address: </span>
                        <span>{ipToBinary(ipAddress)}</span>
                      </div>
                      <div className="mb-2">
                        <span className="text-gray-600">Subnet Mask: </span>
                        <span>{subnetInfo.binaryMask}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Network: </span>
                        <span>{ipToBinary(subnetInfo.networkAddress)}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Host Range Visualization */}
                  <div>
                    <h4 className="font-medium mb-2">Host Range</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-mono">{subnetInfo.networkAddress}</span>
                        <span className="text-blue-600">Network Address</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="font-mono">{subnetInfo.firstHost}</span>
                        <span className="text-green-600">First Usable Host</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="font-mono">{subnetInfo.lastHost}</span>
                        <span className="text-green-600">Last Usable Host</span>
                      </div>
                      <div className="flex items-center justify-between text-sm mt-1">
                        <span className="font-mono">{subnetInfo.broadcastAddress}</span>
                        <span className="text-red-600">Broadcast Address</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* CIDR Chart */}
                  <div>
                    <h4 className="font-medium mb-2">CIDR Chart</h4>
                    <div className="grid grid-cols-8 gap-1">
                      {Array.from({ length: 32 }, (_, i) => (
                        <div
                          key={i}
                          className={`h-8 rounded text-xs flex items-center justify-center ${
                            i < subnetInfo.networkBits 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}
                        >
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-2">
                      Network Bits: {subnetInfo.networkBits} | Host Bits: {subnetInfo.hostBits}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
