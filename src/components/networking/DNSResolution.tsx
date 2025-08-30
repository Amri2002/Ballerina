import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Play, Pause, RotateCcw, ArrowRight, CheckCircle, Clock, Search, Globe, Server, Database } from "lucide-react";

interface DNSQuery {
  id: string;
  domain: string;
  type: 'A' | 'AAAA' | 'MX' | 'CNAME';
  source: string;
  destination: string;
  status: 'pending' | 'sending' | 'received' | 'cached' | 'completed';
  response?: string;
  ttl?: number;
  timestamp: number;
}

interface DNSServer {
  id: string;
  name: string;
  type: 'recursive' | 'root' | 'tld' | 'authoritative';
  ip: string;
  status: 'idle' | 'querying' | 'responding' | 'cached';
  cache: Record<string, any>;
}

export default function DNSResolution() {
  const [domain, setDomain] = useState('example.com');
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [queries, setQueries] = useState<DNSQuery[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showCache, setShowCache] = useState(false);

  const dnsServers: DNSServer[] = [
    {
      id: 'recursive',
      name: 'Recursive Resolver',
      type: 'recursive',
      ip: '8.8.8.8',
      status: 'idle',
      cache: {}
    },
    {
      id: 'root',
      name: 'Root Server',
      type: 'root',
      ip: '198.41.0.4',
      status: 'idle',
      cache: {
        'com': { type: 'NS', value: 'a.gtld-servers.net', ttl: 86400 }
      }
    },
    {
      id: 'tld',
      name: 'TLD Server (.com)',
      type: 'tld',
      ip: '192.5.6.30',
      status: 'idle',
      cache: {
        'example.com': { type: 'NS', value: 'ns1.example.com', ttl: 3600 }
      }
    },
    {
      id: 'authoritative',
      name: 'Authoritative Server',
      type: 'authoritative',
      ip: '93.184.216.34',
      status: 'idle',
      cache: {
        'example.com': { type: 'A', value: '93.184.216.34', ttl: 300 }
      }
    }
  ];

  const [servers, setServers] = useState<DNSServer[]>(dnsServers);

  const dnsSteps = [
    {
      id: 1,
      name: "Local Cache Check",
      description: "Check local DNS cache first",
      duration: 1000
    },
    {
      id: 2,
      name: "Recursive Resolver",
      description: "Query recursive DNS server",
      duration: 1500
    },
    {
      id: 3,
      name: "Root Server Query",
      description: "Query root DNS server for TLD",
      duration: 2000
    },
    {
      id: 4,
      name: "TLD Server Query",
      description: "Query TLD server for authoritative server",
      duration: 2000
    },
    {
      id: 5,
      name: "Authoritative Server Query",
      description: "Query authoritative server for IP address",
      duration: 1500
    },
    {
      id: 6,
      name: "Response Caching",
      description: "Cache the response for future queries",
      duration: 1000
    }
  ];

  const startSimulation = () => {
    if (!domain.trim()) return;
    
    setIsPlaying(true);
    setProgress(0);
    setCurrentStep(0);
    setQueries([]);
    setServers(dnsServers.map(server => ({ ...server, status: 'idle' })));
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentStep(0);
    setQueries([]);
    setServers(dnsServers.map(server => ({ ...server, status: 'idle' })));
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
        return prev + 1;
      });
    }, 50);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Step progression
  useEffect(() => {
    if (!isPlaying) return;

    const stepProgress = progress / 100;
    const currentStepIndex = Math.floor(stepProgress * dnsSteps.length);
    
    if (currentStepIndex !== currentStep && currentStepIndex < dnsSteps.length) {
      setCurrentStep(currentStepIndex);
      
      // Simulate DNS query based on current step
      simulateDNSQuery(currentStepIndex);
    }
  }, [progress, isPlaying, currentStep]);

  const simulateDNSQuery = (stepIndex: number) => {
    const step = dnsSteps[stepIndex];
    let newQueries: DNSQuery[] = [];
    let updatedServers = [...servers];

    switch (stepIndex) {
      case 0: // Local cache check
        newQueries.push({
          id: `local-${Date.now()}`,
          domain,
          type: 'A',
          source: 'Client',
          destination: 'Local Cache',
          status: 'sending',
          timestamp: Date.now()
        });
        break;

      case 1: // Recursive resolver
        updatedServers[0].status = 'querying';
        newQueries.push({
          id: `recursive-${Date.now()}`,
          domain,
          type: 'A',
          source: 'Client',
          destination: 'Recursive Resolver (8.8.8.8)',
          status: 'sending',
          timestamp: Date.now()
        });
        break;

      case 2: // Root server
        updatedServers[0].status = 'responding';
        updatedServers[1].status = 'querying';
        newQueries.push({
          id: `root-${Date.now()}`,
          domain: 'com',
          type: 'NS',
          source: 'Recursive Resolver',
          destination: 'Root Server (198.41.0.4)',
          status: 'sending',
          response: 'a.gtld-servers.net',
          ttl: 86400,
          timestamp: Date.now()
        });
        break;

      case 3: // TLD server
        updatedServers[1].status = 'responding';
        updatedServers[2].status = 'querying';
        newQueries.push({
          id: `tld-${Date.now()}`,
          domain,
          type: 'NS',
          source: 'Recursive Resolver',
          destination: 'TLD Server (192.5.6.30)',
          status: 'sending',
          response: 'ns1.example.com',
          ttl: 3600,
          timestamp: Date.now()
        });
        break;

      case 4: // Authoritative server
        updatedServers[2].status = 'responding';
        updatedServers[3].status = 'querying';
        newQueries.push({
          id: `auth-${Date.now()}`,
          domain,
          type: 'A',
          source: 'Recursive Resolver',
          destination: 'Authoritative Server (93.184.216.34)',
          status: 'sending',
          response: '93.184.216.34',
          ttl: 300,
          timestamp: Date.now()
        });
        break;

      case 5: // Caching
        updatedServers[3].status = 'responding';
        updatedServers[0].status = 'cached';
        newQueries.push({
          id: `cache-${Date.now()}`,
          domain,
          type: 'A',
          source: 'Authoritative Server',
          destination: 'Client',
          status: 'cached',
          response: '93.184.216.34',
          ttl: 300,
          timestamp: Date.now()
        });
        break;
    }

    setQueries(prev => [...prev, ...newQueries]);
    setServers(updatedServers);
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case 'recursive':
        return <Search className="h-4 w-4" />;
      case 'root':
        return <Globe className="h-4 w-4" />;
      case 'tld':
        return <Server className="h-4 w-4" />;
      case 'authoritative':
        return <Database className="h-4 w-4" />;
      default:
        return <Server className="h-4 w-4" />;
    }
  };

  const getServerStatusColor = (status: string) => {
    switch (status) {
      case 'querying':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'responding':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cached':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getQueryStatusColor = (status: string) => {
    switch (status) {
      case 'sending':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'received':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cached':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">

      {/* Domain Input */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-end space-x-4">
            <div className="flex-1">
              <Label htmlFor="domain">Domain Name</Label>
              <Input
                id="domain"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="Enter domain name (e.g., example.com)"
                className="mt-1"
              />
            </div>
            <Button
              onClick={startSimulation}
              disabled={isPlaying || !domain.trim()}
            >
              <Search className="mr-2 h-4 w-4" />
              Resolve DNS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Controls */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <Button
                onClick={isPlaying ? pauseSimulation : startSimulation}
                disabled={progress === 100 || !domain.trim()}
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Start'} Simulation
              </Button>
              <Button variant="outline" onClick={resetSimulation}>
                <RotateCcw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Step {currentStep + 1} of {dnsSteps.length}
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
          <div className="mt-2 text-sm text-muted-foreground">
            Progress: {Math.round(progress)}%
          </div>
        </CardContent>
      </Card>

      {/* DNS Servers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {servers.map((server) => (
          <Card key={server.id} className="border-2 border-gray-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center">
                {getServerIcon(server.type)}
                <span className="ml-2">{server.name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">
                  IP: {server.ip}
                </div>
                <Badge 
                  variant="outline" 
                  className={getServerStatusColor(server.status)}
                >
                  {server.status}
                </Badge>
                {showCache && Object.keys(server.cache).length > 0 && (
                  <div className="mt-2">
                    <div className="text-xs font-medium mb-1">Cache:</div>
                    {Object.entries(server.cache).map(([key, value]) => (
                      <div key={key} className="text-xs bg-gray-50 p-1 rounded">
                        {key}: {value.value} (TTL: {value.ttl}s)
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Query Flow */}
      <Card>
        <CardHeader>
          <CardTitle>DNS Query Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {queries.map((query, index) => (
              <div
                key={query.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getQueryStatusColor(query.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {query.source} → {query.destination}
                    </div>
                    <div className="text-xs opacity-75">
                      {query.type} record for {query.domain}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  {query.response && (
                    <div className="text-xs font-medium">{query.response}</div>
                  )}
                  {query.ttl && (
                    <div className="text-xs opacity-75">TTL: {query.ttl}s</div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Resolution Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {dnsSteps.map((step, index) => (
              <div
                key={step.id}
                className={`flex items-center space-x-3 p-3 rounded-lg border ${
                  index === currentStep ? 'bg-blue-50 border-blue-200' :
                  index < currentStep ? 'bg-green-50 border-green-200' :
                  'bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex-shrink-0">
                  {index < currentStep ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : index === currentStep ? (
                    <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
                  ) : (
                    <div className="h-4 w-4 rounded-full border-2 border-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{step.name}</div>
                  <div className="text-xs text-muted-foreground">{step.description}</div>
                </div>
                <Badge variant="outline" className="text-xs">
                  {step.duration}ms
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
