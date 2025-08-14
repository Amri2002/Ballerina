import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Network, 
  Server, 
  Monitor, 
  Wifi, 
  Cable, 
  Trash2, 
  Save, 
  Loader2, 
  Play, 
  Pause, 
  RotateCcw,
  Settings,
  Eye,
  EyeOff
} from "lucide-react";

interface NetworkDevice {
  id: string;
  type: 'router' | 'switch' | 'host' | 'server' | 'firewall';
  name: string;
  x: number;
  y: number;
  ip?: string;
  mac?: string;
  status: 'online' | 'offline' | 'error';
  interfaces: NetworkInterface[];
  config?: DeviceConfig;
}

interface NetworkInterface {
  id: string;
  name: string;
  ip?: string;
  subnet?: string;
  status: 'up' | 'down';
  connectedTo?: string;
}

interface DeviceConfig {
  hostname: string;
  domain: string;
  dns: string[];
  gateway: string;
  vlan?: number;
}

interface Connection {
  id: string;
  source: string;
  target: string;
  sourceInterface: string;
  targetInterface: string;
  type: 'ethernet' | 'fiber' | 'wireless';
  status: 'up' | 'down' | 'error';
  bandwidth?: number;
}

interface Packet {
  id: string;
  source: string;
  destination: string;
  data: string;
  timestamp: number;
  status: 'transmitting' | 'delivered' | 'dropped';
}

export default function NetworkTopology() {
  const [devices, setDevices] = useState<NetworkDevice[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [packets, setPackets] = useState<Packet[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [selectedConnection, setSelectedConnection] = useState<string | null>(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showLabels, setShowLabels] = useState(true);
  const [dragDevice, setDragDevice] = useState<NetworkDevice | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  const deviceTypes = [
    { type: 'router', name: 'Router', icon: <Network className="h-6 w-6" />, color: 'bg-blue-500' },
    { type: 'switch', name: 'Switch', icon: <Server className="h-6 w-6" />, color: 'bg-green-500' },
    { type: 'host', name: 'Host', icon: <Monitor className="h-6 w-6" />, color: 'bg-purple-500' },
    { type: 'server', name: 'Server', icon: <Server className="h-6 w-6" />, color: 'bg-orange-500' },
    { type: 'firewall', name: 'Firewall', icon: <Wifi className="h-6 w-6" />, color: 'bg-red-500' }
  ];

  const addDevice = (type: NetworkDevice['type'], x: number, y: number) => {
    const newDevice: NetworkDevice = {
      id: `device-${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} ${devices.length + 1}`,
      x,
      y,
      status: 'online',
      interfaces: [
        {
          id: `interface-${Date.now()}`,
          name: 'eth0',
          status: 'up'
        }
      ],
      config: {
        hostname: `${type}-${devices.length + 1}`,
        domain: 'local',
        dns: ['8.8.8.8'],
        gateway: '192.168.1.1'
      }
    };
    setDevices(prev => [...prev, newDevice]);
  };

  const removeDevice = (deviceId: string) => {
    setDevices(prev => prev.filter(d => d.id !== deviceId));
    setConnections(prev => prev.filter(c => c.source !== deviceId && c.target !== deviceId));
    if (selectedDevice === deviceId) setSelectedDevice(null);
  };

  const updateDevicePosition = (deviceId: string, x: number, y: number) => {
    setDevices(prev => prev.map(d => 
      d.id === deviceId ? { ...d, x, y } : d
    ));
  };

  const addConnection = (source: string, target: string) => {
    const sourceDevice = devices.find(d => d.id === source);
    const targetDevice = devices.find(d => d.id === target);
    
    if (!sourceDevice || !targetDevice) return;

    const newConnection: Connection = {
      id: `connection-${Date.now()}`,
      source,
      target,
      sourceInterface: sourceDevice.interfaces[0]?.id || '',
      targetInterface: targetDevice.interfaces[0]?.id || '',
      type: 'ethernet',
      status: 'up',
      bandwidth: 1000
    };
    
    setConnections(prev => [...prev, newConnection]);
  };

  const removeConnection = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    if (selectedConnection === connectionId) setSelectedConnection(null);
  };

  const startSimulation = () => {
    setIsSimulating(true);
    // Simulate packet transmission
    const interval = setInterval(() => {
      if (!isSimulating) {
        clearInterval(interval);
        return;
      }

      const connectedDevices = connections.map(c => [c.source, c.target]).flat();
      const source = connectedDevices[Math.floor(Math.random() * connectedDevices.length)];
      const target = connectedDevices[Math.floor(Math.random() * connectedDevices.length)];

      if (source !== target) {
        const newPacket: Packet = {
          id: `packet-${Date.now()}`,
          source,
          destination: target,
          data: `Data packet ${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          status: 'transmitting'
        };
        
        setPackets(prev => [...prev, newPacket]);
        
        // Simulate packet delivery
        setTimeout(() => {
          setPackets(prev => prev.map(p => 
            p.id === newPacket.id ? { ...p, status: 'delivered' } : p
          ));
        }, 2000);
      }
    }, 1000);

    return () => clearInterval(interval);
  };

  const stopSimulation = () => {
    setIsSimulating(false);
    setPackets([]);
  };

  const handleCanvasClick = (e: React.MouseEvent) => {
    if (!canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    if (dragDevice) {
      addDevice(dragDevice.type, x, y);
      setDragDevice(null);
    }
  };

  const handleDeviceDragStart = (e: React.DragEvent, device: NetworkDevice) => {
    e.dataTransfer.setData('deviceId', device.id);
  };

  const handleDeviceDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const deviceId = e.dataTransfer.getData('deviceId');
    const device = devices.find(d => d.id === deviceId);
    
    if (device && canvasRef.current) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      updateDevicePosition(deviceId, x, y);
    }
  };

  const getDeviceIcon = (type: NetworkDevice['type']) => {
    const deviceType = deviceTypes.find(dt => dt.type === type);
    return deviceType?.icon || <Network className="h-6 w-6" />;
  };

  const getDeviceColor = (type: NetworkDevice['type']) => {
    const deviceType = deviceTypes.find(dt => dt.type === type);
    return deviceType?.color || 'bg-gray-500';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-500';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Network Topology Builder</h2>
          <p className="text-muted-foreground">
            Drag and drop to build custom network topologies
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowLabels(!showLabels)}
          >
            {showLabels ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showLabels ? 'Hide' : 'Show'} Labels
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Device Palette */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Device Palette</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {deviceTypes.map(deviceType => (
                  <div
                    key={deviceType.type}
                    className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    onClick={() => setDragDevice(deviceType as any)}
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('deviceType', deviceType.type)}
                  >
                    <div className={`w-8 h-8 rounded flex items-center justify-center text-white ${deviceType.color}`}>
                      {deviceType.icon}
                    </div>
                    <span className="text-sm font-medium">{deviceType.name}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Controls */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Controls</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  onClick={isSimulating ? stopSimulation : startSimulation}
                  className="flex-1"
                >
                  {isSimulating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  {isSimulating ? 'Stop' : 'Start'} Simulation
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setDevices([]);
                    setConnections([]);
                    setPackets([]);
                  }}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="text-xs text-muted-foreground">
                {devices.length} devices, {connections.length} connections
              </div>
            </CardContent>
          </Card>

          {/* Device List */}
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Devices</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {devices.map(device => (
                  <div
                    key={device.id}
                    className={`flex items-center justify-between p-2 rounded border cursor-pointer ${
                      selectedDevice === device.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedDevice(device.id)}
                  >
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                      <span className="text-sm">{device.name}</span>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeDevice(device.id);
                      }}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Canvas */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Network Canvas</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                ref={canvasRef}
                className="relative w-full h-96 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50"
                onClick={handleCanvasClick}
                onDrop={handleDeviceDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                {/* Devices */}
                {devices.map(device => (
                  <div
                    key={device.id}
                    className={`absolute w-16 h-16 rounded-lg border-2 border-white shadow-lg cursor-move ${
                      selectedDevice === device.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    style={{ left: device.x - 32, top: device.y - 32 }}
                    draggable
                    onDragStart={(e) => handleDeviceDragStart(e, device)}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedDevice(device.id);
                    }}
                  >
                    <div className={`w-full h-full rounded-lg flex items-center justify-center text-white ${getDeviceColor(device.type)}`}>
                      {getDeviceIcon(device.type)}
                    </div>
                    {showLabels && (
                      <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 text-xs text-center bg-white px-1 rounded">
                        {device.name}
                      </div>
                    )}
                    <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${getStatusColor(device.status)}`}></div>
                  </div>
                ))}

                {/* Connections */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none">
                  {connections.map(connection => {
                    const sourceDevice = devices.find(d => d.id === connection.source);
                    const targetDevice = devices.find(d => d.id === connection.target);
                    
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
                          stroke={connection.status === 'up' ? '#10b981' : '#ef4444'}
                          strokeWidth="2"
                          strokeDasharray={connection.type === 'wireless' ? '5,5' : 'none'}
                        />
                        {connection.status === 'error' && (
                          <circle
                            cx={(x1 + x2) / 2}
                            cy={(y1 + y2) / 2}
                            r="3"
                            fill="#ef4444"
                          />
                        )}
                      </g>
                    );
                  })}
                </svg>

                {/* Packets */}
                {isSimulating && packets.map(packet => {
                  const sourceDevice = devices.find(d => d.id === packet.source);
                  const targetDevice = devices.find(d => d.id === packet.destination);
                  
                  if (!sourceDevice || !targetDevice) return null;
                  
                  const progress = Math.min(1, (Date.now() - packet.timestamp) / 2000);
                  const x = sourceDevice.x + (targetDevice.x - sourceDevice.x) * progress;
                  const y = sourceDevice.y + (targetDevice.y - sourceDevice.y) * progress;
                  
                  return (
                    <div
                      key={packet.id}
                      className={`absolute w-2 h-2 rounded-full ${
                        packet.status === 'transmitting' ? 'bg-blue-500' :
                        packet.status === 'delivered' ? 'bg-green-500' : 'bg-red-500'
                      }`}
                      style={{ left: x - 4, top: y - 4 }}
                    />
                  );
                })}

                {/* Instructions */}
                {devices.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <Network className="h-12 w-12 mx-auto mb-2 opacity-50" />
                      <p>Drag devices from the palette to start building your network</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Device Properties */}
      {selectedDevice && (
        <Card>
          <CardHeader>
            <CardTitle>Device Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="general" className="w-full">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="interfaces">Interfaces</TabsTrigger>
                <TabsTrigger value="config">Configuration</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Device Name</Label>
                    <Input
                      value={devices.find(d => d.id === selectedDevice)?.name || ''}
                      onChange={(e) => {
                        setDevices(prev => prev.map(d => 
                          d.id === selectedDevice ? { ...d, name: e.target.value } : d
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Status</Label>
                    <Select
                      value={devices.find(d => d.id === selectedDevice)?.status || 'online'}
                      onValueChange={(value: 'online' | 'offline' | 'error') => {
                        setDevices(prev => prev.map(d => 
                          d.id === selectedDevice ? { ...d, status: value } : d
                        ));
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="online">Online</SelectItem>
                        <SelectItem value="offline">Offline</SelectItem>
                        <SelectItem value="error">Error</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="interfaces" className="mt-4">
                <div className="space-y-3">
                  {devices.find(d => d.id === selectedDevice)?.interfaces.map(interface_ => (
                    <div key={interface_.id} className="border rounded p-3">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{interface_.name}</span>
                        <Badge variant={interface_.status === 'up' ? 'default' : 'secondary'}>
                          {interface_.status}
                        </Badge>
                      </div>
                      {interface_.ip && (
                        <div className="text-sm text-muted-foreground mt-1">
                          IP: {interface_.ip}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="config" className="mt-4">
                <div className="space-y-3">
                  <div>
                    <Label>Hostname</Label>
                    <Input
                      value={devices.find(d => d.id === selectedDevice)?.config?.hostname || ''}
                      onChange={(e) => {
                        setDevices(prev => prev.map(d => 
                          d.id === selectedDevice 
                            ? { ...d, config: { ...d.config!, hostname: e.target.value } }
                            : d
                        ));
                      }}
                    />
                  </div>
                  <div>
                    <Label>Gateway</Label>
                    <Input
                      value={devices.find(d => d.id === selectedDevice)?.config?.gateway || ''}
                      onChange={(e) => {
                        setDevices(prev => prev.map(d => 
                          d.id === selectedDevice 
                            ? { ...d, config: { ...d.config!, gateway: e.target.value } }
                            : d
                        ));
                      }}
                    />
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
