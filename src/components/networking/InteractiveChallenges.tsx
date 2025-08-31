import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Play, 
  RotateCcw, 
  Check, 
  X, 
  ArrowRight, 
  Server, 
  Globe, 
  Network, 
  Router, 
  Shield, 
  Zap,
  BarChart3,
  Wifi,
  Activity,
  CheckCircle
} from "lucide-react";

interface InteractiveChallenge {
  id: string;
  title: string;
  description: string;
  module: string;
  type: "simulation" | "drag-drop" | "interactive-tool" | "visual-builder";
  difficulty: "Easy" | "Medium" | "Hard";
  points: number;
  completed: boolean;
}

const interactiveChallenges: InteractiveChallenge[] = [
  {
    id: "tcp_sim",
    title: "TCP Handshake Simulator",
    description: "Build a TCP connection step by step",
    module: "tcp",
    type: "simulation",
    difficulty: "Easy",
    points: 150,
    completed: false
  },
  {
    id: "dns_tracer",
    title: "DNS Resolution Tracer",
    description: "Trace DNS queries through the hierarchy",
    module: "dns",
    type: "simulation",
    difficulty: "Medium",
    points: 200,
    completed: false
  },
  {
    id: "subnet_builder",
    title: "Subnet Builder",
    description: "Create and configure subnets interactively",
    module: "subnet",
    type: "interactive-tool",
    difficulty: "Medium",
    points: 250,
    completed: false
  },
  {
    id: "topology_designer",
    title: "Network Topology Designer",
    description: "Design network layouts with drag & drop",
    module: "topology",
    type: "visual-builder",
    difficulty: "Hard",
    points: 300,
    completed: false
  },
  {
    id: "protocol_analyzer",
    title: "Protocol Packet Analyzer",
    description: "Analyze and decode network packets",
    module: "protocol",
    type: "interactive-tool",
    difficulty: "Medium",
    points: 200,
    completed: false
  },
  {
    id: "firewall_config",
    title: "Firewall Rule Builder",
    description: "Configure firewall rules interactively",
    module: "security",
    type: "interactive-tool",
    difficulty: "Hard",
    points: 300,
    completed: false
  },
  {
    id: "performance_monitor",
    title: "Network Performance Monitor",
    description: "Monitor and analyze network performance",
    module: "performance",
    type: "interactive-tool",
    difficulty: "Medium",
    points: 200,
    completed: false
  }
];

export default function InteractiveChallenges() {
  const [selectedChallenge, setSelectedChallenge] = useState<InteractiveChallenge | null>(null);
  const [challengeState, setChallengeState] = useState<any>({});
  const [showResults, setShowResults] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);

  const startChallenge = (challenge: InteractiveChallenge) => {
    setSelectedChallenge(challenge);
    setChallengeState({});
    setShowResults(false);
    setIsCompleted(false);
  };

  const resetChallenge = () => {
    setChallengeState({});
    setShowResults(false);
    setIsCompleted(false);
  };

  const completeChallenge = () => {
    setIsCompleted(true);
    setShowResults(true);
  };

  const renderTCPHandshakeSimulator = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">TCP Three-Way Handshake Simulator</h3>
        <p className="text-muted-foreground">Build a TCP connection by arranging the steps in order</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5 text-blue-600" />
              Client
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Step 1: Send SYN</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Sequence Number" 
                  value={challengeState.clientSeq || ""}
                  onChange={(e) => setChallengeState({...challengeState, clientSeq: e.target.value})}
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setChallengeState({...challengeState, synSent: true})}
                  className={challengeState.synSent ? "bg-green-100 border-green-500" : ""}
                >
                  {challengeState.synSent ? <Check className="h-4 w-4" /> : "Send SYN"}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Step 3: Send ACK</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Acknowledgment Number" 
                  value={challengeState.clientAck || ""}
                  onChange={(e) => setChallengeState({...challengeState, clientAck: e.target.value})}
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setChallengeState({...challengeState, ackSent: true})}
                  className={challengeState.ackSent ? "bg-green-100 border-green-500" : ""}
                  disabled={!challengeState.synAckReceived}
                >
                  {challengeState.ackSent ? <Check className="h-4 w-4" /> : "Send ACK"}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Status:</div>
              <div className="text-sm text-muted-foreground">
                {challengeState.synSent && challengeState.ackSent ? "Connection Established" : 
                 challengeState.synSent ? "SYN Sent, Waiting for SYN-ACK" : "Ready to Send SYN"}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Server Side */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Server className="mr-2 h-5 w-5 text-green-600" />
              Server
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Step 2: Send SYN-ACK</Label>
              <div className="flex items-center space-x-2">
                <Input 
                  placeholder="Sequence Number" 
                  value={challengeState.serverSeq || ""}
                  onChange={(e) => setChallengeState({...challengeState, serverSeq: e.target.value})}
                />
                <Input 
                  placeholder="Acknowledgment Number" 
                  value={challengeState.serverAck || ""}
                  onChange={(e) => setChallengeState({...challengeState, serverAck: e.target.value})}
                />
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setChallengeState({...challengeState, synAckSent: true, synAckReceived: true})}
                  className={challengeState.synAckSent ? "bg-green-100 border-green-500" : ""}
                  disabled={!challengeState.synSent}
                >
                  {challengeState.synAckSent ? <Check className="h-4 w-4" /> : "Send SYN-ACK"}
                </Button>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Status:</div>
              <div className="text-sm text-muted-foreground">
                {challengeState.synAckSent ? "SYN-ACK Sent, Waiting for ACK" : 
                 challengeState.synSent ? "SYN Received, Ready to Send SYN-ACK" : "Waiting for SYN"}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={completeChallenge}
          disabled={!challengeState.synSent || !challengeState.synAckSent || !challengeState.ackSent}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Handshake
        </Button>
      </div>
    </div>
  );

  const renderDNSResolutionTracer = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">DNS Resolution Tracer</h3>
        <p className="text-muted-foreground">Trace the DNS resolution process for a domain name</p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center space-x-4">
          <Label htmlFor="domain">Domain Name:</Label>
          <Input 
            id="domain"
            placeholder="Enter domain (e.g., www.example.com)"
            value={challengeState.domain || ""}
            onChange={(e) => setChallengeState({...challengeState, domain: e.target.value})}
            className="w-64"
          />
          <Button onClick={() => setChallengeState({...challengeState, started: true})}>
            Start Resolution
          </Button>
        </div>

        {challengeState.started && (
          <div className="space-y-4">
            {/* Root DNS Servers */}
            <Card className={challengeState.rootQuery ? "border-green-500 bg-green-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-blue-600" />
                  Root DNS Servers
                  {challengeState.rootQuery && <Check className="ml-2 h-5 w-5 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Query: {challengeState.domain}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setChallengeState({...challengeState, rootQuery: true})}
                      disabled={challengeState.rootQuery}
                    >
                      {challengeState.rootQuery ? "Completed" : "Query Root"}
                    </Button>
                  </div>
                  {challengeState.rootQuery && (
                    <div className="text-sm text-green-600">
                      Response: Referral to .com TLD servers
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* TLD DNS Servers */}
            <Card className={challengeState.tldQuery ? "border-green-500 bg-green-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Globe className="mr-2 h-5 w-5 text-green-600" />
                  TLD DNS Servers (.com)
                  {challengeState.tldQuery && <Check className="ml-2 h-5 w-5 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Query: {challengeState.domain}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setChallengeState({...challengeState, tldQuery: true})}
                      disabled={!challengeState.rootQuery || challengeState.tldQuery}
                    >
                      {challengeState.tldQuery ? "Completed" : "Query TLD"}
                    </Button>
                  </div>
                  {challengeState.tldQuery && (
                    <div className="text-sm text-green-600">
                      Response: Referral to authoritative servers for example.com
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Authoritative DNS Servers */}
            <Card className={challengeState.authQuery ? "border-green-500 bg-green-50" : ""}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center">
                  <Server className="mr-2 h-5 w-5 text-purple-600" />
                  Authoritative DNS Servers
                  {challengeState.authQuery && <Check className="ml-2 h-5 w-5 text-green-600" />}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span>Query: {challengeState.domain}</span>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => setChallengeState({...challengeState, authQuery: true})}
                      disabled={!challengeState.tldQuery || challengeState.authQuery}
                    >
                      {challengeState.authQuery ? "Completed" : "Query Authoritative"}
                    </Button>
                  </div>
                  {challengeState.authQuery && (
                    <div className="text-sm text-green-600">
                      Response: A record - 93.184.216.34
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {challengeState.authQuery && (
          <div className="text-center">
            <Button onClick={completeChallenge} className="bg-green-600 hover:bg-green-700">
              <Check className="mr-2 h-4 w-4" />
              Complete DNS Resolution
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  const renderSubnetBuilder = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Subnet Builder</h3>
        <p className="text-muted-foreground">Create and configure subnets interactively</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Network Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>IP Address:</Label>
              <Input 
                placeholder="192.168.1.0"
                value={challengeState.ipAddress || ""}
                onChange={(e) => setChallengeState({...challengeState, ipAddress: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Subnet Mask:</Label>
              <div className="space-y-2">
                <Slider
                  value={[challengeState.cidr || 24]}
                  onValueChange={(value) => setChallengeState({...challengeState, cidr: value[0]})}
                  max={32}
                  min={8}
                  step={1}
                  className="w-full"
                />
                <div className="text-center text-sm text-muted-foreground">
                  CIDR: /{challengeState.cidr || 24}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Subnet Mask (Binary):</Label>
              <div className="p-2 bg-gray-100 rounded font-mono text-sm">
                {challengeState.cidr ? 
                  "1".repeat(challengeState.cidr) + "0".repeat(32 - challengeState.cidr) :
                  "11111111.11111111.11111111.00000000"
                }
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Subnet Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-blue-50 rounded-lg">
                <div className="text-sm font-medium text-blue-800">Network Address:</div>
                <div className="text-lg font-bold text-blue-900">
                  {challengeState.ipAddress ? 
                    challengeState.ipAddress.split('.').slice(0, 3).join('.') + '.0' : 
                    '192.168.1.0'
                  }
                </div>
              </div>

              <div className="p-3 bg-green-50 rounded-lg">
                <div className="text-sm font-medium text-green-800">Broadcast Address:</div>
                <div className="text-lg font-bold text-green-900">
                  {challengeState.ipAddress ? 
                    challengeState.ipAddress.split('.').slice(0, 3).join('.') + '.255' : 
                    '192.168.1.255'
                  }
                </div>
              </div>

              <div className="p-3 bg-purple-50 rounded-lg">
                <div className="text-sm font-medium text-purple-800">First Host:</div>
                <div className="text-lg font-bold text-purple-900">
                  {challengeState.ipAddress ? 
                    challengeState.ipAddress.split('.').slice(0, 3).join('.') + '.1' : 
                    '192.168.1.1'
                  }
                </div>
              </div>

              <div className="p-3 bg-orange-50 rounded-lg">
                <div className="text-sm font-medium text-orange-800">Last Host:</div>
                <div className="text-lg font-bold text-orange-900">
                  {challengeState.ipAddress ? 
                    challengeState.ipAddress.split('.').slice(0, 3).join('.') + '.254' : 
                    '192.168.1.254'
                  }
                </div>
              </div>
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium">Total Hosts:</div>
              <div className="text-lg font-bold">
                {challengeState.cidr ? Math.pow(2, 32 - challengeState.cidr) - 2 : 254}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button onClick={completeChallenge} className="bg-green-600 hover:bg-green-700">
          <Check className="mr-2 h-4 w-4" />
          Complete Subnet Configuration
        </Button>
      </div>
    </div>
  );

  const renderChallengeContent = (challenge: InteractiveChallenge) => {
    switch (challenge.id) {
      case "tcp_sim":
        return renderTCPHandshakeSimulator();
      case "dns_tracer":
        return renderDNSResolutionTracer();
      case "subnet_builder":
        return renderSubnetBuilder();
      case "topology_designer":
        return renderNetworkTopologyDesigner();
      case "protocol_analyzer":
        return renderProtocolPacketAnalyzer();
      case "firewall_config":
        return renderFirewallRuleBuilder();
      case "performance_monitor":
        return renderNetworkPerformanceMonitor();
      default:
        return (
          <div className="text-center py-8">
            <p className="text-muted-foreground">Interactive challenge coming soon!</p>
          </div>
        );
    }
  };

  const renderNetworkTopologyDesigner = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Network Topology Designer</h3>
        <p className="text-muted-foreground">Design network layouts by placing devices and connecting them</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Device Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Device Palette</CardTitle>
            <CardDescription>Drag devices to the canvas</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-blue-50 text-center"
                onClick={() => setChallengeState({...challengeState, selectedDevice: 'router'})}
              >
                <Router className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <div className="text-sm font-medium">Router</div>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-green-50 text-center"
                onClick={() => setChallengeState({...challengeState, selectedDevice: 'switch'})}
              >
                <Network className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <div className="text-sm font-medium">Switch</div>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-purple-50 text-center"
                onClick={() => setChallengeState({...challengeState, selectedDevice: 'server'})}
              >
                <Server className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <div className="text-sm font-medium">Server</div>
              </div>
              <div 
                className="p-3 border rounded-lg cursor-pointer hover:bg-orange-50 text-center"
                onClick={() => setChallengeState({...challengeState, selectedDevice: 'pc'})}
              >
                <Wifi className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <div className="text-sm font-medium">PC</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Network Canvas */}
        <div className="lg:col-span-2">
          <Card className="h-96">
            <CardHeader>
              <CardTitle>Network Canvas</CardTitle>
              <CardDescription>Click to place devices, drag to connect</CardDescription>
            </CardHeader>
            <CardContent className="relative h-80 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              {challengeState.devices?.map((device: any, index: number) => (
                <div
                  key={index}
                  className="absolute cursor-move p-2 bg-white border rounded shadow-sm"
                  style={{ left: device.x, top: device.y }}
                >
                  <div className="text-center">
                    {device.type === 'router' && <Router className="h-6 w-6 text-blue-600" />}
                    {device.type === 'switch' && <Network className="h-6 w-6 text-green-600" />}
                    {device.type === 'server' && <Server className="h-6 w-6 text-purple-600" />}
                    {device.type === 'pc' && <Wifi className="h-6 w-6 text-orange-600" />}
                    <div className="text-xs mt-1">{device.name}</div>
                  </div>
                </div>
              ))}
              
              {challengeState.connections?.map((conn: any, index: number) => (
                <svg
                  key={index}
                  className="absolute inset-0 pointer-events-none"
                  style={{ zIndex: 1 }}
                >
                  <line
                    x1={conn.from.x + 20}
                    y1={conn.from.y + 20}
                    x2={conn.to.x + 20}
                    y2={conn.to.y + 20}
                    stroke="black"
                    strokeWidth="2"
                    markerEnd="url(#arrowhead)"
                  />
                </svg>
              ))}
              
              <svg className="absolute inset-0" style={{ zIndex: 0 }}>
                <defs>
                  <marker
                    id="arrowhead"
                    markerWidth="10"
                    markerHeight="7"
                    refX="9"
                    refY="3.5"
                    orient="auto"
                  >
                    <polygon points="0 0, 10 3.5, 0 7" fill="black" />
                  </marker>
                </defs>
              </svg>

              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                {!challengeState.devices || challengeState.devices.length === 0 ? (
                  <div className="text-center">
                    <Network className="h-12 w-12 mx-auto mb-2" />
                    <p>Click devices from the palette to start building</p>
                  </div>
                ) : null}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="text-center space-y-4">
        <div className="flex items-center justify-center space-x-4">
          <Button 
            onClick={() => {
              const newDevice = {
                type: challengeState.selectedDevice || 'pc',
                name: `${challengeState.selectedDevice || 'pc'}_${(challengeState.devices?.length || 0) + 1}`,
                x: Math.random() * 300 + 50,
                y: Math.random() * 200 + 50
              };
              setChallengeState({
                ...challengeState,
                devices: [...(challengeState.devices || []), newDevice]
              });
            }}
            disabled={!challengeState.selectedDevice}
          >
            Add Device
          </Button>
          <Button 
            variant="outline"
            onClick={() => setChallengeState({...challengeState, devices: [], connections: []})}
          >
            Clear Canvas
          </Button>
        </div>
        
        <Button 
          onClick={completeChallenge}
          disabled={!challengeState.devices || challengeState.devices.length < 2}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Topology Design
        </Button>
      </div>
    </div>
  );

  const renderProtocolPacketAnalyzer = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Protocol Packet Analyzer</h3>
        <p className="text-muted-foreground">Analyze and decode network packets to understand protocols</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Packet Input */}
        <Card>
          <CardHeader>
            <CardTitle>Packet Data</CardTitle>
            <CardDescription>Enter packet data to analyze</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Protocol Type:</Label>
              <select 
                className="w-full p-2 border rounded"
                value={challengeState.protocol || 'tcp'}
                onChange={(e) => setChallengeState({...challengeState, protocol: e.target.value})}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="http">HTTP</option>
                <option value="dns">DNS</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Source Port:</Label>
              <Input 
                placeholder="12345"
                value={challengeState.sourcePort || ""}
                onChange={(e) => setChallengeState({...challengeState, sourcePort: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Destination Port:</Label>
              <Input 
                placeholder="80"
                value={challengeState.destPort || ""}
                onChange={(e) => setChallengeState({...challengeState, destPort: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Payload (Hex):</Label>
              <Input 
                placeholder="48656C6C6F20576F726C64"
                value={challengeState.payload || ""}
                onChange={(e) => setChallengeState({...challengeState, payload: e.target.value})}
              />
            </div>

            <Button 
              onClick={() => setChallengeState({...challengeState, analyzed: true})}
              className="w-full"
            >
              Analyze Packet
            </Button>
          </CardContent>
        </Card>

        {/* Analysis Results */}
        <Card>
          <CardHeader>
            <CardTitle>Packet Analysis</CardTitle>
            <CardDescription>Decoded packet information</CardDescription>
          </CardHeader>
          <CardContent>
            {challengeState.analyzed ? (
              <div className="space-y-4">
                <div className="p-3 bg-blue-50 rounded-lg">
                  <div className="text-sm font-medium text-blue-800">Protocol Analysis</div>
                  <div className="text-sm text-blue-600 mt-1">
                    Protocol: {challengeState.protocol?.toUpperCase()}
                  </div>
                  <div className="text-sm text-blue-600">
                    Source Port: {challengeState.sourcePort || 'N/A'}
                  </div>
                  <div className="text-sm text-blue-600">
                    Destination Port: {challengeState.destPort || 'N/A'}
                  </div>
                </div>

                <div className="p-3 bg-green-50 rounded-lg">
                  <div className="text-sm font-medium text-green-800">Port Analysis</div>
                  <div className="text-sm text-green-600 mt-1">
                    {challengeState.destPort === '80' ? 'HTTP Web Traffic' : 
                     challengeState.destPort === '443' ? 'HTTPS Secure Web Traffic' :
                     challengeState.destPort === '53' ? 'DNS Query' :
                     challengeState.destPort === '22' ? 'SSH Connection' :
                     'Custom Application Port'}
                  </div>
                </div>

                <div className="p-3 bg-purple-50 rounded-lg">
                  <div className="text-sm font-medium text-purple-800">Payload Decode</div>
                  <div className="text-sm text-purple-600 mt-1 font-mono">
                    {challengeState.payload ? 
                      Buffer.from(challengeState.payload, 'hex').toString('utf8') : 
                      'No payload'
                    }
                  </div>
                </div>

                <div className="p-3 bg-orange-50 rounded-lg">
                  <div className="text-sm font-medium text-orange-800">Security Analysis</div>
                  <div className="text-sm text-orange-600 mt-1">
                    {challengeState.protocol === 'http' ? '⚠️ Unencrypted traffic' :
                     challengeState.protocol === 'https' ? '✅ Encrypted traffic' :
                     challengeState.protocol === 'dns' ? '⚠️ DNS queries may be monitored' :
                     '🔒 Standard protocol'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <BarChart3 className="h-12 w-12 mx-auto mb-2" />
                <p>Enter packet data and click analyze to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={completeChallenge}
          disabled={!challengeState.analyzed}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Packet Analysis
        </Button>
      </div>
    </div>
  );

  const renderFirewallRuleBuilder = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Firewall Rule Builder</h3>
        <p className="text-muted-foreground">Configure firewall rules to secure your network</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rule Builder */}
        <Card>
          <CardHeader>
            <CardTitle>Create Firewall Rule</CardTitle>
            <CardDescription>Build rules to control network traffic</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Action:</Label>
              <select 
                className="w-full p-2 border rounded"
                value={challengeState.action || 'allow'}
                onChange={(e) => setChallengeState({...challengeState, action: e.target.value})}
              >
                <option value="allow">ALLOW</option>
                <option value="deny">DENY</option>
                <option value="drop">DROP</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Protocol:</Label>
              <select 
                className="w-full p-2 border rounded"
                value={challengeState.protocol || 'tcp'}
                onChange={(e) => setChallengeState({...challengeState, protocol: e.target.value})}
              >
                <option value="tcp">TCP</option>
                <option value="udp">UDP</option>
                <option value="icmp">ICMP</option>
                <option value="any">ANY</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label>Source IP:</Label>
              <Input 
                placeholder="192.168.1.0/24"
                value={challengeState.sourceIP || ""}
                onChange={(e) => setChallengeState({...challengeState, sourceIP: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Destination Port:</Label>
              <Input 
                placeholder="80,443"
                value={challengeState.destPort || ""}
                onChange={(e) => setChallengeState({...challengeState, destPort: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Description:</Label>
              <Input 
                placeholder="Allow web traffic from internal network"
                value={challengeState.description || ""}
                onChange={(e) => setChallengeState({...challengeState, description: e.target.value})}
              />
            </div>

            <Button 
              onClick={() => {
                const newRule = {
                  id: Date.now(),
                  action: challengeState.action,
                  protocol: challengeState.protocol,
                  sourceIP: challengeState.sourceIP,
                  destPort: challengeState.destPort,
                  description: challengeState.description
                };
                setChallengeState({
                  ...challengeState,
                  rules: [...(challengeState.rules || []), newRule],
                  action: 'allow',
                  protocol: 'tcp',
                  sourceIP: '',
                  destPort: '',
                  description: ''
                });
              }}
              className="w-full"
            >
              Add Rule
            </Button>
          </CardContent>
        </Card>

        {/* Rules List */}
        <Card>
          <CardHeader>
            <CardTitle>Firewall Rules</CardTitle>
            <CardDescription>Active firewall configuration</CardDescription>
          </CardHeader>
          <CardContent>
            {challengeState.rules && challengeState.rules.length > 0 ? (
              <div className="space-y-3">
                {challengeState.rules.map((rule: any) => (
                  <div key={rule.id} className="p-3 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge className={
                        rule.action === 'allow' ? 'bg-green-100 text-green-800' :
                        rule.action === 'deny' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {rule.action.toUpperCase()}
                      </Badge>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setChallengeState({
                          ...challengeState,
                          rules: challengeState.rules.filter((r: any) => r.id !== rule.id)
                        })}
                      >
                        Remove
                      </Button>
                    </div>
                    <div className="text-sm space-y-1">
                      <div><strong>Protocol:</strong> {rule.protocol.toUpperCase()}</div>
                      <div><strong>Source:</strong> {rule.sourceIP || 'ANY'}</div>
                      <div><strong>Port:</strong> {rule.destPort || 'ANY'}</div>
                      <div><strong>Description:</strong> {rule.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Shield className="h-12 w-12 mx-auto mb-2" />
                <p>No firewall rules configured yet</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={completeChallenge}
          disabled={!challengeState.rules || challengeState.rules.length === 0}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Firewall Configuration
        </Button>
      </div>
    </div>
  );

  const renderNetworkPerformanceMonitor = () => (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-semibold mb-2">Network Performance Monitor</h3>
        <p className="text-muted-foreground">Monitor and analyze network performance metrics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Test</CardTitle>
            <CardDescription>Configure and run network tests</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Test Duration (seconds):</Label>
              <Slider
                value={[challengeState.duration || 30]}
                onValueChange={(value) => setChallengeState({...challengeState, duration: value[0]})}
                max={120}
                min={10}
                step={10}
                className="w-full"
              />
              <div className="text-center text-sm text-muted-foreground">
                {challengeState.duration || 30} seconds
              </div>
            </div>

            <div className="space-y-2">
              <Label>Target Bandwidth (Mbps):</Label>
              <Input 
                placeholder="100"
                value={challengeState.targetBandwidth || ""}
                onChange={(e) => setChallengeState({...challengeState, targetBandwidth: e.target.value})}
              />
            </div>

            <div className="space-y-2">
              <Label>Packet Size (bytes):</Label>
              <select 
                className="w-full p-2 border rounded"
                value={challengeState.packetSize || '1500'}
                onChange={(e) => setChallengeState({...challengeState, packetSize: e.target.value})}
              >
                <option value="64">64 bytes</option>
                <option value="512">512 bytes</option>
                <option value="1500">1500 bytes</option>
                <option value="9000">9000 bytes (Jumbo)</option>
              </select>
            </div>

            <Button 
              onClick={() => {
                setChallengeState({...challengeState, testing: true});
                // Simulate test progress
                setTimeout(() => {
                  setChallengeState({
                    ...challengeState,
                    testing: false,
                    results: {
                      bandwidth: Math.floor(Math.random() * 100) + 50,
                      latency: Math.floor(Math.random() * 20) + 5,
                      packetLoss: Math.random() * 2,
                      jitter: Math.random() * 5
                    }
                  });
                }, 2000);
              }}
              disabled={challengeState.testing}
              className="w-full"
            >
              {challengeState.testing ? 'Running Test...' : 'Start Performance Test'}
            </Button>
          </CardContent>
        </Card>

        {/* Results Display */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Results</CardTitle>
            <CardDescription>Real-time network metrics</CardDescription>
          </CardHeader>
          <CardContent>
            {challengeState.results ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">Bandwidth</div>
                    <div className="text-lg font-bold text-blue-900">
                      {challengeState.results.bandwidth} Mbps
                    </div>
                    <div className="text-xs text-blue-600">
                      {challengeState.results.bandwidth >= 90 ? '✅ Excellent' :
                       challengeState.results.bandwidth >= 70 ? '⚠️ Good' :
                       challengeState.results.bandwidth >= 50 ? '⚠️ Fair' : '❌ Poor'}
                    </div>
                  </div>

                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Latency</div>
                    <div className="text-lg font-bold text-green-900">
                      {challengeState.results.latency} ms
                    </div>
                    <div className="text-xs text-green-600">
                      {challengeState.results.latency <= 10 ? '✅ Excellent' :
                       challengeState.results.latency <= 20 ? '⚠️ Good' :
                       challengeState.results.latency <= 50 ? '⚠️ Fair' : '❌ Poor'}
                    </div>
                  </div>

                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-sm font-medium text-purple-800">Packet Loss</div>
                    <div className="text-lg font-bold text-purple-900">
                      {challengeState.results.packetLoss.toFixed(2)}%
                    </div>
                    <div className="text-xs text-purple-600">
                      {challengeState.results.packetLoss <= 0.1 ? '✅ Excellent' :
                       challengeState.results.packetLoss <= 1 ? '⚠️ Good' :
                       challengeState.results.packetLoss <= 5 ? '⚠️ Fair' : '❌ Poor'}
                    </div>
                  </div>

                  <div className="p-3 bg-orange-50 rounded-lg">
                    <div className="text-sm font-medium text-orange-800">Jitter</div>
                    <div className="text-lg font-bold text-orange-900">
                      {challengeState.results.jitter.toFixed(1)} ms
                    </div>
                    <div className="text-xs text-orange-600">
                      {challengeState.results.jitter <= 2 ? '✅ Excellent' :
                       challengeState.results.jitter <= 5 ? '⚠️ Good' :
                       challengeState.results.jitter <= 10 ? '⚠️ Fair' : '❌ Poor'}
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm font-medium">Overall Performance</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {challengeState.results.bandwidth >= 80 && challengeState.results.latency <= 15 ? 
                      '🟢 Excellent - Network performing optimally' :
                     challengeState.results.bandwidth >= 60 && challengeState.results.latency <= 30 ? 
                      '🟡 Good - Network performing well' :
                     challengeState.results.bandwidth >= 40 && challengeState.results.latency <= 50 ? 
                      '🟠 Fair - Some performance issues detected' :
                      '🔴 Poor - Significant performance problems detected'}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-8">
                <Activity className="h-12 w-12 mx-auto mb-2" />
                <p>Run a performance test to see results</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="text-center">
        <Button 
          onClick={completeChallenge}
          disabled={!challengeState.results}
          className="bg-green-600 hover:bg-green-700"
        >
          <Check className="mr-2 h-4 w-4" />
          Complete Performance Analysis
        </Button>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Interactive Networking Challenges
        </h1>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Practice networking concepts with hands-on, interactive simulations and tools. Build real connections, trace DNS queries, and configure networks.
        </p>
      </div>

      {!selectedChallenge ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {interactiveChallenges.map((challenge) => (
            <Card key={challenge.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => startChallenge(challenge)}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <Badge variant="outline">{challenge.module.toUpperCase()}</Badge>
                  <Badge className={
                    challenge.difficulty === "Easy" ? "bg-green-100 text-green-800" :
                    challenge.difficulty === "Medium" ? "bg-yellow-100 text-yellow-800" :
                    "bg-red-100 text-red-800"
                  }>
                    {challenge.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{challenge.title}</CardTitle>
                <CardDescription>{challenge.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                    <Activity className="h-4 w-4" />
                    <span>{challenge.points} pts</span>
                  </div>
                  <Button size="sm" className="bg-hero-gradient hover:opacity-90">
                    <Play className="h-4 w-4 mr-2" />
                    Start
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="max-w-6xl mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">{selectedChallenge.title}</CardTitle>
                <CardDescription>{selectedChallenge.description}</CardDescription>
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="outline" onClick={resetChallenge}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Reset
                </Button>
                <Button variant="outline" onClick={() => setSelectedChallenge(null)}>
                  Back to Challenges
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {renderChallengeContent(selectedChallenge)}
          </CardContent>
        </Card>
      )}

      {showResults && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle className="text-center text-green-600">
                <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                Challenge Completed!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-muted-foreground">
                Great job! You've successfully completed the {selectedChallenge?.title} challenge.
              </p>
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">+{selectedChallenge?.points}</div>
                <div className="text-sm text-green-600">points earned</div>
              </div>
              <Button onClick={() => setSelectedChallenge(null)} className="w-full">
                Continue to Next Challenge
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
