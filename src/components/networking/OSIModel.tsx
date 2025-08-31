import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Play, Pause, RotateCcw, ArrowDown, ArrowUp, Layers, Wifi, Globe, Shield, Database, Monitor, Cpu, HardDrive } from "lucide-react";

interface OSILayer {
  id: number;
  name: string;
  description: string;
  protocols: string[];
  devices: string[];
  dataUnit: string;
  icon: React.ReactNode;
  color: string;
  status: 'idle' | 'active' | 'completed';
  headers: string[];
  functions: string[];
}

interface Packet {
  id: string;
  layer: number;
  direction: 'down' | 'up';
  status: 'pending' | 'processing' | 'completed';
  data: string;
  headers: Record<string, string>;
  timestamp: number;
}

export default function OSIModel() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentLayer, setCurrentLayer] = useState(0);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [showDetails, setShowDetails] = useState(false);

  const osiLayers: OSILayer[] = [
    {
      id: 7,
      name: "Application Layer",
      description: "Provides network services to user applications",
      protocols: ["HTTP", "HTTPS", "FTP", "SMTP", "DNS", "SSH"],
      devices: ["Web Browsers", "Email Clients", "File Transfer Apps"],
      dataUnit: "Data",
      icon: <Monitor className="h-4 w-4" />,
      color: "bg-purple-100 text-purple-800 border-purple-200",
      status: 'idle',
      headers: ["HTTP Headers", "Content-Type", "User-Agent"],
      functions: ["User Interface", "Application Services", "Data Formatting"]
    },
    {
      id: 6,
      name: "Presentation Layer",
      description: "Handles data formatting, encryption, and compression",
      protocols: ["SSL/TLS", "JPEG", "MPEG", "ASCII"],
      devices: ["Encryption Software", "Compression Tools"],
      dataUnit: "Data",
      icon: <Shield className="h-4 w-4" />,
      color: "bg-indigo-100 text-indigo-800 border-indigo-200",
      status: 'idle',
      headers: ["Encryption Headers", "Compression Info"],
      functions: ["Data Encryption", "Data Compression", "Character Encoding"]
    },
    {
      id: 5,
      name: "Session Layer",
      description: "Manages sessions between applications",
      protocols: ["NetBIOS", "RPC", "SQL", "NFS"],
      devices: ["Session Managers", "Authentication Services"],
      dataUnit: "Data",
      icon: <Database className="h-4 w-4" />,
      color: "bg-blue-100 text-blue-800 border-blue-200",
      status: 'idle',
      headers: ["Session ID", "Authentication Token"],
      functions: ["Session Management", "Authentication", "Authorization"]
    },
    {
      id: 4,
      name: "Transport Layer",
      description: "Ensures reliable data delivery between hosts",
      protocols: ["TCP", "UDP", "SCTP"],
      devices: ["Firewalls", "Load Balancers"],
      dataUnit: "Segment (TCP) / Datagram (UDP)",
      icon: <Cpu className="h-4 w-4" />,
      color: "bg-green-100 text-green-800 border-green-200",
      status: 'idle',
      headers: ["Source Port", "Destination Port", "Sequence Number", "Checksum"],
      functions: ["Reliable Delivery", "Flow Control", "Error Detection"]
    },
    {
      id: 3,
      name: "Network Layer",
      description: "Handles logical addressing and routing",
      protocols: ["IP", "ICMP", "OSPF", "BGP"],
      devices: ["Routers", "Layer 3 Switches"],
      dataUnit: "Packet",
      icon: <Globe className="h-4 w-4" />,
      color: "bg-yellow-100 text-yellow-800 border-yellow-200",
      status: 'idle',
      headers: ["Source IP", "Destination IP", "TTL", "Protocol"],
      functions: ["Logical Addressing", "Routing", "Path Determination"]
    },
    {
      id: 2,
      name: "Data Link Layer",
      description: "Handles physical addressing and error detection",
      protocols: ["Ethernet", "WiFi", "PPP", "Frame Relay"],
      devices: ["Switches", "Network Cards", "Bridges"],
      dataUnit: "Frame",
      icon: <Wifi className="h-4 w-4" />,
      color: "bg-orange-100 text-orange-800 border-orange-200",
      status: 'idle',
      headers: ["Source MAC", "Destination MAC", "Frame Type", "FCS"],
      functions: ["Physical Addressing", "Error Detection", "Flow Control"]
    },
    {
      id: 1,
      name: "Physical Layer",
      description: "Transmits raw bits over physical medium",
      protocols: ["Ethernet", "WiFi", "Bluetooth", "Fiber"],
      devices: ["Hubs", "Repeaters", "Cables", "Antennas"],
      dataUnit: "Bits",
      icon: <HardDrive className="h-4 w-4" />,
      color: "bg-red-100 text-red-800 border-red-200",
      status: 'idle',
      headers: ["Preamble", "Start Frame Delimiter"],
      functions: ["Bit Transmission", "Signal Encoding", "Physical Topology"]
    }
  ];

  const [layers, setLayers] = useState<OSILayer[]>(osiLayers);

  const startSimulation = () => {
    setIsPlaying(true);
    setProgress(0);
    setCurrentLayer(0);
    setPackets([]);
    setLayers(osiLayers.map(layer => ({ ...layer, status: 'idle' })));
  };

  const pauseSimulation = () => {
    setIsPlaying(false);
  };

  const resetSimulation = () => {
    setIsPlaying(false);
    setProgress(0);
    setCurrentLayer(0);
    setPackets([]);
    setLayers(osiLayers.map(layer => ({ ...layer, status: 'idle' })));
  };

  const toggleDirection = () => {
    setDirection(direction === 'down' ? 'up' : 'down');
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
    }, 100);

    return () => clearInterval(interval);
  }, [isPlaying]);

  // Layer progression
  useEffect(() => {
    if (!isPlaying) return;

    const layerProgress = progress / 100;
    const totalLayers = layers.length;
    const currentLayerIndex = Math.floor(layerProgress * totalLayers);
    
    if (currentLayerIndex !== currentLayer && currentLayerIndex < totalLayers) {
      setCurrentLayer(currentLayerIndex);
      
      // Update layer status
      setLayers(prev => prev.map((layer, index) => {
        if (direction === 'down') {
          // Encapsulation (top to bottom)
          if (index < currentLayerIndex) {
            return { ...layer, status: 'completed' as const };
          } else if (index === currentLayerIndex) {
            return { ...layer, status: 'active' as const };
          }
        } else {
          // De-encapsulation (bottom to top)
          const reverseIndex = totalLayers - 1 - index;
          if (reverseIndex < currentLayerIndex) {
            return { ...layer, status: 'completed' as const };
          } else if (reverseIndex === currentLayerIndex) {
            return { ...layer, status: 'active' as const };
          }
        }
        return { ...layer, status: 'idle' as const };
      }));

      // Add packet for current layer
      const layer = direction === 'down' ? layers[currentLayerIndex] : layers[totalLayers - 1 - currentLayerIndex];
      const newPacket: Packet = {
        id: `packet-${currentLayerIndex}-${Date.now()}`,
        layer: layer.id,
        direction,
        status: 'processing',
        data: `Data from Layer ${layer.id}`,
        headers: layer.headers.reduce((acc, header) => ({ ...acc, [header]: `Value for ${header}` }), {}),
        timestamp: Date.now()
      };
      
      setPackets(prev => [...prev, newPacket]);
    }
  }, [progress, isPlaying, currentLayer, layers, direction]);

  const getLayerStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-blue-50 border-blue-300';
      case 'completed':
        return 'bg-green-50 border-green-300';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  const getPacketStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">

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
              <Button variant="outline" onClick={toggleDirection}>
                {direction === 'down' ? <ArrowDown className="h-4 w-4" /> : <ArrowUp className="h-4 w-4" />}
                {direction === 'down' ? 'Encapsulation' : 'De-encapsulation'}
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Layer {currentLayer + 1} of {layers.length}
            </div>
          </div>
          
          <Progress value={progress} className="w-full" />
          <div className="mt-2 text-sm text-muted-foreground">
            Progress: {Math.round(progress)}% - {direction === 'down' ? 'Encapsulation' : 'De-encapsulation'}
          </div>
        </CardContent>
      </Card>

      {/* OSI Layers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Layer Stack */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Layers className="mr-2 h-5 w-5" />
                OSI Layer Stack
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {layers.map((layer, index) => (
                  <div
                    key={layer.id}
                    className={`flex items-center space-x-3 p-4 rounded-lg border transition-all duration-300 ${getLayerStatusColor(layer.status)}`}
                  >
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-sm font-medium">
                        {layer.id}
                      </div>
                      <div className="flex items-center space-x-2">
                        {layer.icon}
                        <div>
                          <div className="font-medium">{layer.name}</div>
                          <div className="text-sm text-muted-foreground">{layer.description}</div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className={layer.color}>
                        {layer.dataUnit}
                      </Badge>
                      {layer.status === 'active' && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Current Layer Details */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Current Layer Details</CardTitle>
            </CardHeader>
            <CardContent>
              {currentLayer < layers.length && (
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium">{layers[currentLayer].name}</h4>
                    <p className="text-sm text-muted-foreground">{layers[currentLayer].description}</p>
                  </div>
                  
                  <div>
                    <h5 className="font-medium text-sm mb-2">Protocols</h5>
                    <div className="flex flex-wrap gap-1">
                      {layers[currentLayer].protocols.map(protocol => (
                        <Badge key={protocol} variant="outline" className="text-xs">
                          {protocol}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-sm mb-2">Devices</h5>
                    <div className="flex flex-wrap gap-1">
                      {layers[currentLayer].devices.map(device => (
                        <Badge key={device} variant="outline" className="text-xs">
                          {device}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {showDetails && (
                    <>
                      <div>
                        <h5 className="font-medium text-sm mb-2">Headers</h5>
                        <div className="space-y-1">
                          {layers[currentLayer].headers.map(header => (
                            <div key={header} className="text-xs bg-gray-50 p-1 rounded">
                              {header}
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h5 className="font-medium text-sm mb-2">Functions</h5>
                        <div className="space-y-1">
                          {layers[currentLayer].functions.map(func => (
                            <div key={func} className="text-xs bg-blue-50 p-1 rounded">
                              {func}
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Packet Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Packet Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {packets.map((packet, index) => (
              <div
                key={packet.id}
                className={`flex items-center justify-between p-3 rounded-lg border ${getPacketStatusColor(packet.status)}`}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      Layer {packet.layer} - {packet.direction === 'down' ? 'Encapsulation' : 'De-encapsulation'}
                    </div>
                    <div className="text-xs opacity-75">{packet.data}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-medium">{packet.status}</div>
                  {showDetails && (
                    <div className="text-xs opacity-75">
                      {Object.keys(packet.headers).length} headers
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* TCP/IP Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>OSI vs TCP/IP Model</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="osi" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="osi">OSI Model (7 Layers)</TabsTrigger>
              <TabsTrigger value="tcpip">TCP/IP Model (4 Layers)</TabsTrigger>
            </TabsList>
            
            <TabsContent value="osi" className="mt-4">
              <div className="space-y-2">
                {layers.map(layer => (
                  <div key={layer.id} className="flex items-center space-x-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 text-xs font-medium">
                      {layer.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{layer.name}</div>
                      <div className="text-xs text-muted-foreground">{layer.dataUnit}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {layer.protocols.slice(0, 2).join(', ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="tcpip" className="mt-4">
              <div className="space-y-2">
                {[
                  { id: 4, name: "Application Layer", protocols: ["HTTP", "FTP", "SMTP", "DNS"], dataUnit: "Data" },
                  { id: 3, name: "Transport Layer", protocols: ["TCP", "UDP"], dataUnit: "Segment" },
                  { id: 2, name: "Internet Layer", protocols: ["IP", "ICMP"], dataUnit: "Packet" },
                  { id: 1, name: "Network Access Layer", protocols: ["Ethernet", "WiFi"], dataUnit: "Frame" }
                ].map(layer => (
                  <div key={layer.id} className="flex items-center space-x-3 p-2 rounded border">
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 text-xs font-medium">
                      {layer.id}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{layer.name}</div>
                      <div className="text-xs text-muted-foreground">{layer.dataUnit}</div>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {layer.protocols.join(', ')}
                    </Badge>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
