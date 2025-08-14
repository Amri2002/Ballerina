import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { networkingApi } from "@/services/networking-api";
import { 
  Network, 
  Server, 
  Monitor, 
  Wifi, 
  Cable, 
  Play, 
  Pause, 
  RotateCcw,
  ArrowRight,
  CheckCircle,
  Clock,
  Globe,
  Shield,
  Database,
  Activity,
  AlertTriangle,
  Zap,
  XCircle,
  CheckCircle2,
  Info,
  Save,
  Download
} from "lucide-react";

interface NetworkDevice {
  id: string;
  type: 'hub' | 'switch' | 'host' | 'server' | 'router' | 'bridge';
  name: string;
  x: number;
  y: number;
  ip?: string;
  status: 'online' | 'offline' | 'error' | 'failed';
  description: string;
  icon: React.ReactNode;
  color: string;
  isCentral?: boolean;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  type: 'ethernet' | 'fiber' | 'wireless';
  status: 'up' | 'down' | 'error';
  bandwidth?: number;
  description: string;
}

interface Packet {
  id: string;
  source: string;
  destination: string;
  data: string;
  timestamp: number;
  status: 'transmitting' | 'delivered' | 'dropped' | 'failed';
  path: string[];
  currentPosition: number;
  type: 'file' | 'data' | 'control';
  size?: number;
  color: string;
  progress: number;
}

interface TopologyType {
  id: string;
  name: string;
  description: string;
  devices: NetworkDevice[];
  connections: Connection[];
  advantages: string[];
  disadvantages: string[];
  failureScenarios: {
    description: string;
    devicesToFail: string[];
    impact: string;
  }[];
  dataFlow: {
    source: string;
    destination: string;
    path: string[];
    description: string;
  }[];
}

export default function NetworkTopology() {
  const [selectedTopology, setSelectedTopology] = useState<string>('star');
  const [isSimulating, setIsSimulating] = useState(false);
  const [showFailure, setShowFailure] = useState(false);
  const [currentFailureScenario, setCurrentFailureScenario] = useState<number | null>(null);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [animationSpeed, setAnimationSpeed] = useState(1000);
  const [showAdvantages, setShowAdvantages] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [backendTopologyTypes, setBackendTopologyTypes] = useState<any[]>([]);
  const [simulationData, setSimulationData] = useState<any>(null);
  const simulationRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();

  const topologyTypes: TopologyType[] = [
    {
      id: 'star',
      name: 'Star Topology',
      description: 'All devices connect to a central hub/switch',
      devices: [
        { id: 'hub1', type: 'hub', name: 'Central Hub', x: 400, y: 200, ip: '192.168.1.1', status: 'online', description: 'Central connection point', icon: <Server className="h-6 w-6" />, color: 'bg-blue-500', isCentral: true },
        { id: 'pc1', type: 'host', name: 'PC 1', x: 200, y: 100, ip: '192.168.1.10', status: 'online', description: 'Workstation 1', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc2', type: 'host', name: 'PC 2', x: 600, y: 100, ip: '192.168.1.11', status: 'online', description: 'Workstation 2', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc3', type: 'host', name: 'PC 3', x: 200, y: 300, ip: '192.168.1.12', status: 'online', description: 'Workstation 3', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc4', type: 'host', name: 'PC 4', x: 600, y: 300, ip: '192.168.1.13', status: 'online', description: 'Workstation 4', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'server1', type: 'server', name: 'File Server', x: 400, y: 50, ip: '192.168.1.100', status: 'online', description: 'Central file server', icon: <Database className="h-6 w-6" />, color: 'bg-orange-500' }
      ],
      connections: [
        { id: 'c1', source: 'hub1', target: 'pc1', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 1 connection' },
        { id: 'c2', source: 'hub1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 2 connection' },
        { id: 'c3', source: 'hub1', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 3 connection' },
        { id: 'c4', source: 'hub1', target: 'pc4', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 4 connection' },
        { id: 'c5', source: 'hub1', target: 'server1', type: 'ethernet', status: 'up', bandwidth: 1000, description: 'Server connection' }
      ],
      advantages: [
        'Easy to install and manage',
        'Centralized control and monitoring',
        'Easy to add/remove devices',
        'Isolated device failures',
        'Simple troubleshooting'
      ],
      disadvantages: [
        'Single point of failure (central hub)',
        'Limited scalability',
        'Performance depends on central device',
        'Higher cost for central device',
        'All traffic goes through hub'
      ],
      failureScenarios: [
        {
          description: 'Central Hub Failure',
          devicesToFail: ['hub1'],
          impact: 'Entire network becomes unavailable - all devices lose connectivity'
        },
        {
          description: 'Single PC Failure',
          devicesToFail: ['pc1'],
          impact: 'Only PC 1 is affected - other devices continue working normally'
        }
      ],
      dataFlow: [
        {
          source: 'pc1',
          destination: 'server1',
          path: ['pc1', 'hub1', 'server1'],
          description: 'PC 1 requests file from server'
        },
        {
          source: 'pc2',
          destination: 'pc3',
          path: ['pc2', 'hub1', 'pc3'],
          description: 'PC 2 sends message to PC 3'
        }
      ]
    },
    {
      id: 'bus',
      name: 'Bus Topology',
      description: 'All devices share a single communication line',
      devices: [
        { id: 'pc1', type: 'host', name: 'PC 1', x: 100, y: 200, ip: '192.168.1.10', status: 'online', description: 'Workstation 1', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc2', type: 'host', name: 'PC 2', x: 250, y: 200, ip: '192.168.1.11', status: 'online', description: 'Workstation 2', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc3', type: 'host', name: 'PC 3', x: 400, y: 200, ip: '192.168.1.12', status: 'online', description: 'Workstation 3', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc4', type: 'host', name: 'PC 4', x: 550, y: 200, ip: '192.168.1.13', status: 'online', description: 'Workstation 4', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'server1', type: 'server', name: 'File Server', x: 700, y: 200, ip: '192.168.1.100', status: 'online', description: 'File server', icon: <Database className="h-6 w-6" />, color: 'bg-orange-500' }
      ],
      connections: [
        { id: 'c1', source: 'pc1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 10, description: 'Bus segment 1' },
        { id: 'c2', source: 'pc2', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 10, description: 'Bus segment 2' },
        { id: 'c3', source: 'pc3', target: 'pc4', type: 'ethernet', status: 'up', bandwidth: 10, description: 'Bus segment 3' },
        { id: 'c4', source: 'pc4', target: 'server1', type: 'ethernet', status: 'up', bandwidth: 10, description: 'Bus segment 4' }
      ],
      advantages: [
        'Simple and inexpensive',
        'Easy to extend',
        'Requires less cable',
        'Suitable for small networks',
        'Linear structure'
      ],
      disadvantages: [
        'Single point of failure (bus cable)',
        'Performance degrades with more devices',
        'Difficult to troubleshoot',
        'Limited bandwidth sharing',
        'Signal reflection issues'
      ],
      failureScenarios: [
        {
          description: 'Bus Cable Break',
          devicesToFail: ['pc2', 'pc3', 'pc4', 'server1'],
          impact: 'All devices beyond the break lose connectivity'
        },
        {
          description: 'Terminator Failure',
          devicesToFail: ['pc1', 'pc2', 'pc3', 'pc4', 'server1'],
          impact: 'Signal reflection causes network failure'
        }
      ],
      dataFlow: [
        {
          source: 'pc1',
          destination: 'server1',
          path: ['pc1', 'pc2', 'pc3', 'pc4', 'server1'],
          description: 'Data travels through all devices on bus'
        },
        {
          source: 'pc3',
          destination: 'pc1',
          path: ['pc3', 'pc2', 'pc1'],
          description: 'Data travels back through bus'
        }
      ]
    },
    {
      id: 'ring',
      name: 'Ring Topology',
      description: 'Devices form a closed loop with data traveling in one direction',
      devices: [
        { id: 'pc1', type: 'host', name: 'PC 1', x: 300, y: 100, ip: '192.168.1.10', status: 'online', description: 'Workstation 1', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc2', type: 'host', name: 'PC 2', x: 500, y: 150, ip: '192.168.1.11', status: 'online', description: 'Workstation 2', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc3', type: 'host', name: 'PC 3', x: 500, y: 300, ip: '192.168.1.12', status: 'online', description: 'Workstation 3', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc4', type: 'host', name: 'PC 4', x: 300, y: 350, ip: '192.168.1.13', status: 'online', description: 'Workstation 4', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'server1', type: 'server', name: 'File Server', x: 100, y: 225, ip: '192.168.1.100', status: 'online', description: 'File server', icon: <Database className="h-6 w-6" />, color: 'bg-orange-500' }
      ],
      connections: [
        { id: 'c1', source: 'server1', target: 'pc1', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Ring segment 1' },
        { id: 'c2', source: 'pc1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Ring segment 2' },
        { id: 'c3', source: 'pc2', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Ring segment 3' },
        { id: 'c4', source: 'pc3', target: 'pc4', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Ring segment 4' },
        { id: 'c5', source: 'pc4', target: 'server1', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Ring segment 5' }
      ],
      advantages: [
        'Equal access to network',
        'No central point of control',
        'Predictable performance',
        'Good for token passing',
        'Efficient for large networks'
      ],
      disadvantages: [
        'Single point of failure breaks entire network',
        'Difficult to add/remove devices',
        'Complex troubleshooting',
        'Performance degrades with failures',
        'Requires token management'
      ],
      failureScenarios: [
        {
          description: 'Single Device Failure',
          devicesToFail: ['pc2'],
          impact: 'Entire ring network fails - no device can communicate'
        },
        {
          description: 'Cable Break',
          devicesToFail: ['pc1', 'pc2', 'pc3', 'pc4', 'server1'],
          impact: 'Ring is broken - complete network failure'
        }
      ],
      dataFlow: [
        {
          source: 'server1',
          destination: 'pc3',
          path: ['server1', 'pc1', 'pc2', 'pc3'],
          description: 'Data travels clockwise through ring'
        },
        {
          source: 'pc4',
          destination: 'pc1',
          path: ['pc4', 'server1', 'pc1'],
          description: 'Data travels through ring to destination'
        }
      ]
    },
    {
      id: 'mesh',
      name: 'Mesh Topology',
      description: 'Every device connects to every other device',
      devices: [
        { id: 'pc1', type: 'host', name: 'PC 1', x: 200, y: 150, ip: '192.168.1.10', status: 'online', description: 'Workstation 1', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc2', type: 'host', name: 'PC 2', x: 400, y: 150, ip: '192.168.1.11', status: 'online', description: 'Workstation 2', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc3', type: 'host', name: 'PC 3', x: 300, y: 250, ip: '192.168.1.12', status: 'online', description: 'Workstation 3', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'server1', type: 'server', name: 'File Server', x: 300, y: 50, ip: '192.168.1.100', status: 'online', description: 'File server', icon: <Database className="h-6 w-6" />, color: 'bg-orange-500' }
      ],
      connections: [
        { id: 'c1', source: 'server1', target: 'pc1', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' },
        { id: 'c2', source: 'server1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' },
        { id: 'c3', source: 'server1', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' },
        { id: 'c4', source: 'pc1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' },
        { id: 'c5', source: 'pc1', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' },
        { id: 'c6', source: 'pc2', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'Direct connection' }
      ],
      advantages: [
        'Maximum reliability and redundancy',
        'No single point of failure',
        'Multiple paths for data',
        'High performance',
        'Load balancing possible'
      ],
      disadvantages: [
        'Very expensive to implement',
        'Complex to manage',
        'Requires many cables',
        'Difficult to scale',
        'High maintenance cost'
      ],
      failureScenarios: [
        {
          description: 'Single Device Failure',
          devicesToFail: ['pc1'],
          impact: 'Other devices can still communicate through alternative paths'
        },
        {
          description: 'Multiple Device Failures',
          devicesToFail: ['pc1', 'pc2'],
          impact: 'PC 3 and server can still communicate directly'
        }
      ],
      dataFlow: [
        {
          source: 'pc1',
          destination: 'pc3',
          path: ['pc1', 'pc3'],
          description: 'Direct connection between devices'
        },
        {
          source: 'server1',
          destination: 'pc2',
          path: ['server1', 'pc2'],
          description: 'Direct server connection'
        }
      ]
    },
    {
      id: 'tree',
      name: 'Tree Topology',
      description: 'Hierarchical structure with root, branches, and leaves',
      devices: [
        { id: 'root', type: 'router', name: 'Root Router', x: 400, y: 50, ip: '192.168.1.1', status: 'online', description: 'Main router', icon: <Network className="h-6 w-6" />, color: 'bg-blue-500', isCentral: true },
        { id: 'switch1', type: 'switch', name: 'Branch Switch 1', x: 200, y: 150, ip: '192.168.2.1', status: 'online', description: 'First branch', icon: <Server className="h-6 w-6" />, color: 'bg-green-500' },
        { id: 'switch2', type: 'switch', name: 'Branch Switch 2', x: 600, y: 150, ip: '192.168.3.1', status: 'online', description: 'Second branch', icon: <Server className="h-6 w-6" />, color: 'bg-green-500' },
        { id: 'pc1', type: 'host', name: 'PC 1', x: 100, y: 250, ip: '192.168.2.10', status: 'online', description: 'Branch 1 PC', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc2', type: 'host', name: 'PC 2', x: 300, y: 250, ip: '192.168.2.11', status: 'online', description: 'Branch 1 PC', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc3', type: 'host', name: 'PC 3', x: 500, y: 250, ip: '192.168.3.10', status: 'online', description: 'Branch 2 PC', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'pc4', type: 'host', name: 'PC 4', x: 700, y: 250, ip: '192.168.3.11', status: 'online', description: 'Branch 2 PC', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
        { id: 'server1', type: 'server', name: 'File Server', x: 400, y: 350, ip: '192.168.1.100', status: 'online', description: 'Central server', icon: <Database className="h-6 w-6" />, color: 'bg-orange-500' }
      ],
      connections: [
        { id: 'c1', source: 'root', target: 'switch1', type: 'ethernet', status: 'up', bandwidth: 1000, description: 'Branch 1 uplink' },
        { id: 'c2', source: 'root', target: 'switch2', type: 'ethernet', status: 'up', bandwidth: 1000, description: 'Branch 2 uplink' },
        { id: 'c3', source: 'switch1', target: 'pc1', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 1 connection' },
        { id: 'c4', source: 'switch1', target: 'pc2', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 2 connection' },
        { id: 'c5', source: 'switch2', target: 'pc3', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 3 connection' },
        { id: 'c6', source: 'switch2', target: 'pc4', type: 'ethernet', status: 'up', bandwidth: 100, description: 'PC 4 connection' },
        { id: 'c7', source: 'root', target: 'server1', type: 'ethernet', status: 'up', bandwidth: 1000, description: 'Server connection' }
      ],
      advantages: [
        'Scalable and expandable',
        'Hierarchical management',
        'Isolated branch failures',
        'Centralized control',
        'Good for large organizations'
      ],
      disadvantages: [
        'Root failure affects entire network',
        'Complex to manage',
        'Single path to root',
        'Performance bottleneck at root',
        'Difficult to troubleshoot'
      ],
      failureScenarios: [
        {
          description: 'Root Router Failure',
          devicesToFail: ['root'],
          impact: 'Entire network becomes unavailable - all branches lose connectivity'
        },
        {
          description: 'Branch Switch Failure',
          devicesToFail: ['switch1'],
          impact: 'Only Branch 1 devices (PC 1, PC 2) lose connectivity'
        }
      ],
      dataFlow: [
        {
          source: 'pc1',
          destination: 'server1',
          path: ['pc1', 'switch1', 'root', 'server1'],
          description: 'Data travels up tree to root, then to server'
        },
        {
          source: 'pc1',
          destination: 'pc3',
          path: ['pc1', 'switch1', 'root', 'switch2', 'pc3'],
          description: 'Inter-branch communication through root'
        }
      ]
    }
  ];

  const currentTopology = topologyTypes.find(t => t.id === selectedTopology) || topologyTypes[0];

  // Load topology types from backend on component mount
  useEffect(() => {
    loadTopologyTypesFromBackend();
  }, []);

  const loadTopologyTypesFromBackend = async () => {
    try {
      setIsLoading(true);
      const data = await networkingApi.getTopologyTypes() as any[];
      setBackendTopologyTypes(data);
      toast({
        title: "Backend Connected",
        description: "Successfully loaded topology types from backend",
      });
    } catch (error) {
      console.log("Using frontend topology types (backend not available)");
    } finally {
      setIsLoading(false);
    }
  };

  const startSimulation = async () => {
    setIsSimulating(true);
    setPackets([]);
    setCurrentFailureScenario(null);
    
    // Send simulation data to backend
    try {
      const data = await networkingApi.simulateTopology({
        topologyType: selectedTopology,
        userId: "demo-user", // In real app, get from auth context
        simulationConfig: {
          animationSpeed,
          duration: 30000
        }
      });
      
      setSimulationData(data);
      toast({
        title: "Simulation Started",
        description: "Backend simulation data received",
      });
    } catch (error) {
      console.log("Using frontend simulation (backend not available)");
    }
    
    simulationRef.current = setInterval(() => {
      if (!isSimulating) {
        if (simulationRef.current) {
          clearInterval(simulationRef.current);
        }
        return;
      }

      // Generate random packet flow with file transfers
      const connectedDevices = currentTopology.connections.map(c => [c.source, c.target]).flat();
      const source = connectedDevices[Math.floor(Math.random() * connectedDevices.length)];
      const target = connectedDevices[Math.floor(Math.random() * connectedDevices.length)];

      if (source !== target) {
        const packetTypes = ['file', 'data', 'control'];
        const packetType = packetTypes[Math.floor(Math.random() * packetTypes.length)];
        
        // Generate packet path based on topology
        const path = generatePacketPath(source, target, currentTopology);
        
        const packetColors = {
          file: '#ff6b6b',      // Red for file transfers
          data: '#4ecdc4',      // Teal for data packets
          control: '#45b7d1'    // Blue for control packets
        };

        const newPacket: Packet = {
          id: `packet-${Date.now()}-${Math.random()}`,
          source,
          destination: target,
          data: packetType === 'file' ? `File: document_${Math.random().toString(36).substr(2, 5)}.pdf` : 
                packetType === 'data' ? `Data: ${Math.random().toString(36).substr(2, 9)}` :
                `Control: ${Math.random().toString(36).substr(2, 6)}`,
          timestamp: Date.now(),
          status: 'transmitting',
          path: path,
          currentPosition: 0,
          type: packetType as 'file' | 'data' | 'control',
          size: packetType === 'file' ? Math.floor(Math.random() * 1000) + 100 : undefined,
          color: packetColors[packetType as keyof typeof packetColors],
          progress: 0
        };
        
        setPackets(prev => [...prev.slice(-12), newPacket]); // Keep last 12 packets
        
        // Animate packet progress
        const progressInterval = setInterval(() => {
          setPackets(prev => prev.map(p => {
            if (p.id === newPacket.id && p.status === 'transmitting') {
              const newProgress = Math.min(1, (Date.now() - p.timestamp) / 4000);
              return { ...p, progress: newProgress };
            }
            return p;
          }));
        }, 100);
        
        // Simulate packet delivery
        setTimeout(() => {
          setPackets(prev => prev.map(p => 
            p.id === newPacket.id ? { ...p, status: 'delivered', progress: 1 } : p
          ));
          clearInterval(progressInterval);
        }, 4000);
      }
    }, animationSpeed);
  };

  // Generate packet path based on topology type
  const generatePacketPath = (source: string, target: string, topology: TopologyType): string[] => {
    const path = [source];
    
    switch (topology.id) {
      case 'star':
        // All traffic goes through central hub
        if (source !== 'hub1' && target !== 'hub1') {
          path.push('hub1');
        }
        break;
      case 'bus':
        // Find shortest path on bus
        const devices = topology.devices.map(d => d.id);
        const sourceIndex = devices.indexOf(source);
        const targetIndex = devices.indexOf(target);
        if (sourceIndex !== -1 && targetIndex !== -1) {
          const start = Math.min(sourceIndex, targetIndex);
          const end = Math.max(sourceIndex, targetIndex);
          for (let i = start + 1; i <= end; i++) {
            path.push(devices[i]);
          }
        }
        break;
      case 'ring':
        // Find shortest path on ring
        const ringDevices = topology.devices.map(d => d.id);
        const sourceRingIndex = ringDevices.indexOf(source);
        const targetRingIndex = ringDevices.indexOf(target);
        if (sourceRingIndex !== -1 && targetRingIndex !== -1) {
          const clockwise = (targetRingIndex - sourceRingIndex + ringDevices.length) % ringDevices.length;
          const counterclockwise = (sourceRingIndex - targetRingIndex + ringDevices.length) % ringDevices.length;
          
          if (clockwise <= counterclockwise) {
            // Go clockwise
            for (let i = 1; i <= clockwise; i++) {
              path.push(ringDevices[(sourceRingIndex + i) % ringDevices.length]);
            }
          } else {
            // Go counterclockwise
            for (let i = 1; i <= counterclockwise; i++) {
              path.push(ringDevices[(sourceRingIndex - i + ringDevices.length) % ringDevices.length]);
            }
          }
        }
        break;
      case 'mesh':
        // Direct connection in mesh
        break;
      case 'tree':
        // Find path through tree hierarchy
        const findPathToRoot = (deviceId: string): string[] => {
          const device = topology.devices.find(d => d.id === deviceId);
          if (!device) return [];
          
          const connections = topology.connections.filter(c => c.source === deviceId || c.target === deviceId);
          const parentConnection = connections.find(c => {
            const other = c.source === deviceId ? c.target : c.source;
            const otherDevice = topology.devices.find(d => d.id === other);
            return otherDevice && otherDevice.y < device.y; // Device above in hierarchy
          });
          
          if (parentConnection) {
            const parent = parentConnection.source === deviceId ? parentConnection.target : parentConnection.source;
            return [deviceId, ...findPathToRoot(parent)];
          }
          return [deviceId];
        };
        
        const sourceToRoot = findPathToRoot(source);
        const targetToRoot = findPathToRoot(target);
        
        // Find common ancestor
        let commonIndex = -1;
        for (let i = 0; i < Math.min(sourceToRoot.length, targetToRoot.length); i++) {
          if (sourceToRoot[sourceToRoot.length - 1 - i] === targetToRoot[targetToRoot.length - 1 - i]) {
            commonIndex = sourceToRoot.length - 1 - i;
          } else {
            break;
          }
        }
        
        if (commonIndex !== -1) {
          // Path from source to common ancestor
          for (let i = 1; i < sourceToRoot.length - commonIndex; i++) {
            path.push(sourceToRoot[sourceToRoot.length - 1 - i]);
          }
          // Path from common ancestor to target
          for (let i = commonIndex + 1; i < targetToRoot.length; i++) {
            path.push(targetToRoot[i]);
          }
        }
        break;
    }
    
    if (path[path.length - 1] !== target) {
      path.push(target);
    }
    
    return path;
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setPackets([]);
    setCurrentFailureScenario(null);
    if (simulationRef.current) {
      clearInterval(simulationRef.current);
    }
  };

  const triggerFailureScenario = async (scenarioIndex: number) => {
    setCurrentFailureScenario(scenarioIndex);
    const scenario = currentTopology.failureScenarios[scenarioIndex];
    
    // Send failure test to backend
    try {
      const data = await networkingApi.testTopologyFailure({
        topologyType: selectedTopology,
        failureScenario: scenario.description,
        devicesToFail: scenario.devicesToFail,
        userId: "demo-user" // In real app, get from auth context
      }) as any;
      
      toast({
        title: "Failure Analysis",
        description: `Backend analyzed failure impact: ${data.impact?.connectivityLoss || 0}% connectivity loss`,
      });
    } catch (error) {
      console.log("Using frontend failure analysis (backend not available)");
    }
    
    // Update device statuses
    const updatedTopology = {
      ...currentTopology,
      devices: currentTopology.devices.map(device => ({
        ...device,
        status: scenario.devicesToFail.includes(device.id) ? 'failed' : device.status
      }))
    };
    
    // Update connection statuses
    const updatedConnections = currentTopology.connections.map(connection => {
      const sourceFailed = scenario.devicesToFail.includes(connection.source);
      const targetFailed = scenario.devicesToFail.includes(connection.target);
      return {
        ...connection,
        status: (sourceFailed || targetFailed) ? 'down' : connection.status
      };
    });
    
    // Stop current simulation and show failure
    stopSimulation();
    setShowFailure(true);
  };

  const resetTopology = () => {
    setShowFailure(false);
    setCurrentFailureScenario(null);
    stopSimulation();
  };

  const saveTopologyToBackend = async () => {
    try {
      setIsLoading(true);
      await networkingApi.saveTopology({
        userId: "demo-user", // In real app, get from auth context
        name: `${currentTopology.name} - ${new Date().toLocaleString()}`,
        devices: currentTopology.devices,
        connections: currentTopology.connections
      });
      
      toast({
        title: "Topology Saved",
        description: "Successfully saved topology to backend",
      });
    } catch (error) {
      toast({
        title: "Save Failed",
        description: "Could not save to backend (using frontend only)",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-yellow-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getConnectionColor = (status: string) => {
    switch (status) {
      case 'up':
        return '#10b981';
      case 'down':
        return '#ef4444';
      case 'error':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  useEffect(() => {
    return () => {
      if (simulationRef.current) {
        clearInterval(simulationRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Topology Learning</h2>
          <p className="text-muted-foreground">
            Explore different network topologies with interactive simulations and failure scenarios
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAdvantages(!showAdvantages)}
          >
            {showAdvantages ? 'Hide' : 'Show'} Analysis
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={saveTopologyToBackend}
            disabled={isLoading}
          >
            <Save className="h-4 w-4 mr-1" />
            Save to Backend
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Topology Selection */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Topology Types</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topologyTypes.map(topology => (
                  <div
                    key={topology.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedTopology === topology.id 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => {
                      setSelectedTopology(topology.id);
                      resetTopology();
                    }}
                  >
                    <div className="font-medium">{topology.name}</div>
                    <div className="text-sm text-muted-foreground">{topology.description}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Simulation Controls</CardTitle>
              {backendTopologyTypes.length > 0 && (
                <div className="flex items-center space-x-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600">Backend Connected</span>
                </div>
              )}
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={isSimulating ? stopSimulation : startSimulation}
                  className="flex-1"
                  disabled={showFailure}
                >
                  {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isSimulating ? 'Stop' : 'Start'} Simulation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={resetTopology}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Label className="text-sm">Animation Speed</Label>
                <Select value={animationSpeed.toString()} onValueChange={(value) => setAnimationSpeed(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="500">Fast</SelectItem>
                    <SelectItem value="1000">Normal</SelectItem>
                    <SelectItem value="2000">Slow</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showFailure && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2 text-red-700">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Failure Scenario Active</span>
                  </div>
                  <p className="text-xs text-red-600 mt-1">
                    {currentTopology.failureScenarios[currentFailureScenario!]?.impact}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Failure Scenarios */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Failure Scenarios</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentTopology.failureScenarios.map((scenario, index) => (
                  <div key={index} className="p-2 border rounded">
                    <div className="text-sm font-medium">{scenario.description}</div>
                    <div className="text-xs text-muted-foreground mb-2">{scenario.impact}</div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => triggerFailureScenario(index)}
                      disabled={showFailure}
                      className="w-full"
                    >
                      <Zap className="h-3 w-3 mr-1" />
                      Trigger Failure
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Advantages & Disadvantages */}
          {showAdvantages && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Topology Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="advantages" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="advantages">Advantages</TabsTrigger>
                    <TabsTrigger value="disadvantages">Disadvantages</TabsTrigger>
                  </TabsList>
                  <TabsContent value="advantages" className="space-y-2">
                    {currentTopology.advantages.map((advantage, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{advantage}</span>
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="disadvantages" className="space-y-2">
                    {currentTopology.disadvantages.map((disadvantage, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{disadvantage}</span>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Network Visualization */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>{currentTopology.name} Topology</CardTitle>
              <p className="text-sm text-muted-foreground">{currentTopology.description}</p>
            </CardHeader>
            <CardContent>
              {/* Packet Type Legend */}
              {isSimulating && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
                  <div className="text-sm font-medium mb-2">Packet Types:</div>
                  <div className="flex flex-wrap gap-4 text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#ff6b6b' }} />
                      <span>File Transfers (Red)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4ecdc4' }} />
                      <span>Data Packets (Teal)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#45b7d1' }} />
                      <span>Control Packets (Blue)</span>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative w-full h-96 border-2 border-gray-200 rounded-lg bg-gray-50 overflow-hidden">
                {/* Devices */}
                {currentTopology.devices.map(device => (
                  <div
                    key={device.id}
                    className={`absolute w-16 h-16 rounded-lg border-2 border-white shadow-lg cursor-pointer transition-all ${
                      device.status === 'online' ? 'opacity-100' : 'opacity-50'
                    } ${device.status === 'failed' ? 'animate-pulse' : ''}`}
                    style={{ left: device.x - 32, top: device.y - 32 }}
                    title={`${device.name} - ${device.description}`}
                  >
                    <div className={`w-full h-full rounded-lg flex items-center justify-center text-white ${device.color} ${
                      device.status === 'failed' ? 'bg-red-500' : device.color
                    }`}>
                      {device.status === 'failed' ? <XCircle className="h-6 w-6" /> : device.icon}
                    </div>
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center bg-white px-1 rounded whitespace-nowrap">
                      {device.name}
                    </div>
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                  </div>
                ))}

                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {currentTopology.connections.map(connection => {
                    const sourceDevice = currentTopology.devices.find(d => d.id === connection.source);
                    const targetDevice = currentTopology.devices.find(d => d.id === connection.target);
                    
                    if (!sourceDevice || !targetDevice) return null;
                    
                    const x1 = sourceDevice.x;
                    const y1 = sourceDevice.y;
                    const x2 = targetDevice.x;
                    const y2 = targetDevice.y;
                    
                    return (
                      <g key={connection.id}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={getConnectionColor(connection.status)}
                          strokeWidth="3"
                          strokeDasharray={connection.type === 'wireless' ? '8,8' : 'none'}
                          opacity={connection.status === 'up' ? 0.8 : 0.4}
                        />
                        {/* Connection label */}
                        <text
                          x={(x1 + x2) / 2}
                          y={(y1 + y2) / 2 - 10}
                          textAnchor="middle"
                          className="text-xs fill-gray-600 bg-white px-1"
                          style={{ fontSize: '10px' }}
                        >
                          {connection.bandwidth}Mbps
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Animated Packets with File Transfer Visualization */}
                {isSimulating && packets.map(packet => {
                  // Calculate packet position along its path
                  const pathDevices = packet.path.map(id => currentTopology.devices.find(d => d.id === id)).filter(Boolean);
                  
                  if (pathDevices.length < 2) return null;
                  
                  const totalPathLength = pathDevices.length - 1;
                  const currentPathIndex = Math.floor(packet.progress * totalPathLength);
                  const pathProgress = (packet.progress * totalPathLength) % 1;
                  
                  if (currentPathIndex >= totalPathLength) return null;
                  
                  const currentDevice = pathDevices[currentPathIndex];
                  const nextDevice = pathDevices[currentPathIndex + 1];
                  
                  if (!currentDevice || !nextDevice) return null;
                  
                  const x = currentDevice.x + (nextDevice.x - currentDevice.x) * pathProgress;
                  const y = currentDevice.y + (nextDevice.y - currentDevice.y) * pathProgress;
                  
                  const packetSize = packet.type === 'file' ? 8 : packet.type === 'data' ? 6 : 4;
                  const pulseSize = packet.type === 'file' ? 12 : packet.type === 'data' ? 10 : 8;
                  
                  return (
                    <div key={packet.id}>
                      {/* Packet */}
                      <div
                        className={`absolute rounded-full shadow-lg animate-pulse ${
                          packet.status === 'transmitting' ? 'animate-bounce' :
                          packet.status === 'delivered' ? 'animate-ping' : 'animate-pulse'
                        }`}
                        style={{
                          left: x - packetSize/2,
                          top: y - packetSize/2,
                          width: packetSize,
                          height: packetSize,
                          backgroundColor: packet.color,
                          border: `2px solid ${packet.status === 'delivered' ? '#10b981' : packet.status === 'failed' ? '#ef4444' : '#ffffff'}`,
                          zIndex: 10
                        }}
                        title={`${packet.type.toUpperCase()}: ${packet.data}${packet.size ? ` (${packet.size}KB)` : ''}`}
                      />
                      
                      {/* Pulse effect for file transfers */}
                      {packet.type === 'file' && packet.status === 'transmitting' && (
                        <div
                          className="absolute rounded-full animate-ping"
                          style={{
                            left: x - pulseSize/2,
                            top: y - pulseSize/2,
                            width: pulseSize,
                            height: pulseSize,
                            backgroundColor: packet.color,
                            opacity: 0.3,
                            zIndex: 5
                          }}
                        />
                      )}
                      
                      {/* Packet trail for file transfers */}
                      {packet.type === 'file' && packet.progress > 0.1 && (
                        <div
                          className="absolute rounded-full"
                          style={{
                            left: x - 2,
                            top: y - 2,
                            width: 4,
                            height: 4,
                            backgroundColor: packet.color,
                            opacity: 0.6,
                            zIndex: 8
                          }}
                        />
                      )}
                    </div>
                  );
                })}

                {/* Packet Path Visualization */}
                {isSimulating && packets.filter(p => p.type === 'file').map(packet => {
                  const pathDevices = packet.path.map(id => currentTopology.devices.find(d => d.id === id)).filter(Boolean);
                  
                  if (pathDevices.length < 2) return null;
                  
                  return (
                    <svg key={`path-${packet.id}`} className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 1 }}>
                      {pathDevices.slice(0, -1).map((device, index) => {
                        const nextDevice = pathDevices[index + 1];
                        if (!device || !nextDevice) return null;
                        
                        return (
                          <line
                            key={`${packet.id}-${index}`}
                            x1={device.x}
                            y1={device.y}
                            x2={nextDevice.x}
                            y2={nextDevice.y}
                            stroke={packet.color}
                            strokeWidth="2"
                            strokeDasharray="5,5"
                            opacity={0.3}
                            className="animate-pulse"
                          />
                        );
                      })}
                    </svg>
                  );
                })}

                {/* Data Flow Animation */}
                {isSimulating && (
                  <div className="absolute inset-0 pointer-events-none">
                    {currentTopology.dataFlow.map((flow, index) => {
                      const delay = index * 1000;
                      const isActive = (Date.now() + delay) % 4000 < 2000;
                      
                      if (!isActive) return null;
                      
                      const sourceDevice = currentTopology.devices.find(d => d.id === flow.source);
                      const targetDevice = currentTopology.devices.find(d => d.id === flow.destination);
                      
                      if (!sourceDevice || !targetDevice) return null;
                      
                      return (
                        <div
                          key={`flow-${index}`}
                          className="absolute w-3 h-3 bg-blue-600 rounded-full animate-ping shadow-lg border border-blue-300"
                          style={{
                            left: sourceDevice.x - 6,
                            top: sourceDevice.y - 6,
                            animationDelay: `${delay}ms`
                          }}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Network Statistics */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Network Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{currentTopology.devices.length}</div>
                  <div className="text-sm text-muted-foreground">Devices</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{currentTopology.connections.length}</div>
                  <div className="text-sm text-muted-foreground">Connections</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {currentTopology.devices.filter(d => d.status === 'online').length}
                  </div>
                  <div className="text-sm text-muted-foreground">Online</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {isSimulating ? packets.length : 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Active Packets</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Packets Information */}
          {isSimulating && (
            <Card className="mt-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Active File Transfers & Packets
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {packets.length === 0 ? (
                    <div className="text-center text-muted-foreground py-4">
                      No active packets yet...
                    </div>
                  ) : (
                    packets.map(packet => {
                      const sourceDevice = currentTopology.devices.find(d => d.id === packet.source);
                      const targetDevice = currentTopology.devices.find(d => d.id === packet.destination);
                      
                      return (
                        <div
                          key={packet.id}
                          className="p-3 border rounded-lg relative overflow-hidden"
                          style={{
                            borderLeftColor: packet.color,
                            borderLeftWidth: '4px'
                          }}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: packet.color }}
                              />
                              <span className="text-sm font-medium capitalize">
                                {packet.type} Packet
                              </span>
                              <Badge
                                variant={
                                  packet.status === 'transmitting' ? 'default' :
                                  packet.status === 'delivered' ? 'secondary' :
                                  'destructive'
                                }
                                className="text-xs"
                              >
                                {packet.status}
                              </Badge>
                            </div>
                            {packet.size && (
                              <span className="text-xs text-muted-foreground">
                                {packet.size}KB
                              </span>
                            )}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            {packet.data}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium">From:</span> {sourceDevice?.name || packet.source} 
                            <span className="font-medium ml-2">To:</span> {targetDevice?.name || packet.destination}
                          </div>
                          
                          <div className="text-xs text-muted-foreground mb-2">
                            <span className="font-medium">Path:</span> {packet.path.join(' → ')}
                          </div>
                          
                          {/* Progress bar for file transfers */}
                          {packet.type === 'file' && (
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="h-2 rounded-full transition-all duration-300"
                                style={{
                                  width: `${packet.progress * 100}%`,
                                  backgroundColor: packet.color
                                }}
                              />
                            </div>
                          )}
                          
                          {/* Status indicator */}
                          <div className="absolute top-2 right-2">
                            {packet.status === 'transmitting' && (
                              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
                            )}
                            {packet.status === 'delivered' && (
                              <CheckCircle className="w-4 h-4 text-green-500" />
                            )}
                            {packet.status === 'failed' && (
                              <XCircle className="w-4 h-4 text-red-500" />
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Data Flow Information */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Data Flow Examples</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {currentTopology.dataFlow.map((flow, index) => (
                  <div key={index} className="p-2 border rounded">
                    <div className="text-sm font-medium">{flow.description}</div>
                    <div className="text-xs text-muted-foreground">
                      Path: {flow.path.join(' → ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
