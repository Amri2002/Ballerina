import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Activity, TrendingUp, TrendingDown, AlertTriangle, Clock, Wifi, Server, CheckCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface NetworkMetrics {
  bandwidth: number;
  latency: number;
  packetLoss: number;
  jitter: number;
  throughput: number;
  cpuUsage: number;
  memoryUsage: number;
  activeConnections: number;
  timestamp: string;
}

interface PerformanceData {
  id: string;
  userId: string;
  networkId: string;
  metrics: NetworkMetrics;
  timestamp: string;
  status: string;
  alerts: string[];
}

const PerformanceMonitor: React.FC = () => {
  const { user } = useAuth();
  const [networkId, setNetworkId] = useState('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [currentMetrics, setCurrentMetrics] = useState<NetworkMetrics | null>(null);
  const [metricsHistory, setMetricsHistory] = useState<NetworkMetrics[]>([]);
  const [monitoringInterval, setMonitoringInterval] = useState<NodeJS.Timeout | null>(null);
  const [selectedTimeRange, setSelectedTimeRange] = useState('1h');
  const [alerts, setAlerts] = useState<string[]>([]);

  const timeRanges = [
    { value: '5m', label: 'Last 5 minutes' },
    { value: '15m', label: 'Last 15 minutes' },
    { value: '1h', label: 'Last hour' },
    { value: '6h', label: 'Last 6 hours' },
    { value: '24h', label: 'Last 24 hours' }
  ];

  const sampleNetworks = [
    { id: 'network-001', name: 'Office Network', type: 'LAN' },
    { id: 'network-002', name: 'Data Center', type: 'WAN' },
    { id: 'network-003', name: 'Home Network', type: 'LAN' },
    { id: 'network-004', name: 'Cloud Infrastructure', type: 'Cloud' }
  ];

  const generateMockMetrics = (): NetworkMetrics => ({
    bandwidth: Math.random() * 1000 + 100, // Mbps
    latency: Math.random() * 50 + 5, // ms
    packetLoss: Math.random() * 5, // %
    jitter: Math.random() * 10, // ms
    throughput: Math.random() * 800 + 200, // Mbps
    cpuUsage: Math.random() * 100, // %
    memoryUsage: Math.random() * 100, // %
    activeConnections: Math.floor(Math.random() * 1000) + 100,
    timestamp: new Date().toISOString()
  });

  const startMonitoring = async () => {
    if (!networkId.trim()) {
      alert('Please enter a network ID to monitor');
      return;
    }

    setIsMonitoring(true);
    setMetricsHistory([]);
    setAlerts([]);

    // Start real-time monitoring
    const interval = setInterval(async () => {
      const newMetrics: NetworkMetrics = {
        timestamp: new Date().toISOString(),
        latency: Math.random() * 200 + 10,
        bandwidth: Math.random() * 1000 + 100,
        packetLoss: Math.random() * 5,
        jitter: Math.random() * 10,
        cpuUsage: Math.random() * 100,
        memoryUsage: Math.random() * 100,
        activeConnections: Math.floor(Math.random() * 1000) + 100,
        throughput: Math.random() * 1000 + 100
      };

      setCurrentMetrics(newMetrics);
      setMetricsHistory(prev => [...prev.slice(-59), newMetrics]); // Keep last 60 data points

      const newAlerts = getAlerts(newMetrics);
      if (newAlerts.length > 0) {
        setAlerts(prev => [...newAlerts, ...prev.slice(0, 4)]); // Keep last 5 alerts
      }

      // Send to backend
      try {
        await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/networking/performance/monitor`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: user?.id || 'demo-user',
            networkId: networkId,
            metrics: newMetrics
          }),
        });
      } catch (error) {
        console.error('Error sending metrics:', error);
      }
    }, 2000); // Update every 2 seconds

    setMonitoringInterval(interval);
  };

  const stopMonitoring = () => {
    setIsMonitoring(false);
    if (monitoringInterval) {
      clearInterval(monitoringInterval);
      setMonitoringInterval(null);
    }
  };

  const getStatusColor = (value: number, threshold: number, type: 'high' | 'low' = 'high') => {
    if (type === 'high') {
      return value > threshold ? 'text-red-600' : value > threshold * 0.8 ? 'text-yellow-600' : 'text-green-600';
    } else {
      return value < threshold ? 'text-red-600' : value < threshold * 1.2 ? 'text-yellow-600' : 'text-green-600';
    }
  };

  const getStatusIcon = (value: number, threshold: number, type: 'high' | 'low' = 'high') => {
    if (type === 'high') {
      return value > threshold ? <TrendingUp className="h-4 w-4 text-red-600" /> : <TrendingDown className="h-4 w-4 text-green-600" />;
    } else {
      return value < threshold ? <TrendingDown className="h-4 w-4 text-red-600" /> : <TrendingUp className="h-4 w-4 text-green-600" />;
    }
  };

  const loadSampleNetwork = () => {
    const randomNetwork = sampleNetworks[Math.floor(Math.random() * sampleNetworks.length)];
    setNetworkId(randomNetwork.id);
  };

  const clearMonitoring = () => {
    stopMonitoring();
    setCurrentMetrics(null);
    setMetricsHistory([]);
    setNetworkId('');
  };

  useEffect(() => {
    return () => {
      if (monitoringInterval) {
        clearInterval(monitoringInterval);
      }
    };
  }, [monitoringInterval]);

  const calculateAverage = (key: keyof NetworkMetrics) => {
    if (metricsHistory.length === 0) return 0;
    const sum = metricsHistory.reduce((acc, metric) => acc + (metric[key] as number), 0);
    return sum / metricsHistory.length;
  };

  const getAlerts = (metrics: NetworkMetrics): string[] => {
    const alerts: string[] = [];
    
    if (metrics.latency > 100) alerts.push('High latency detected');
    if (metrics.packetLoss > 2) alerts.push('Packet loss above threshold');
    if (metrics.cpuUsage > 90) alerts.push('High CPU usage');
    if (metrics.memoryUsage > 90) alerts.push('High memory usage');
    if (metrics.bandwidth < 50) alerts.push('Low bandwidth');
    
    return alerts;
  };

  return (
    <div className="space-y-6">

      <Card>
        <CardHeader>
          <CardTitle>Network Monitoring</CardTitle>
          <CardDescription>
            Monitor network performance in real-time with detailed metrics and alerts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="network">Network ID</Label>
              <div className="flex space-x-2">
                <Input
                  id="network"
                  value={networkId}
                  onChange={(e) => setNetworkId(e.target.value)}
                  placeholder="Enter network ID"
                />
                <Button variant="outline" onClick={loadSampleNetwork}>
                  Sample
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeRange">Time Range</Label>
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select time range" />
                </SelectTrigger>
                <SelectContent>
                  {timeRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={isMonitoring ? stopMonitoring : startMonitoring} 
              className="flex-1"
              variant={isMonitoring ? "destructive" : "default"}
            >
              {isMonitoring ? (
                <>
                  <Clock className="h-4 w-4 mr-2" />
                  Stop Monitoring
                </>
              ) : (
                <>
                  <Activity className="h-4 w-4 mr-2" />
                  Start Monitoring
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearMonitoring}>
              Clear
            </Button>
          </div>

          {isMonitoring && (
            <div className="flex items-center space-x-2 text-sm text-green-600">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Monitoring active - Real-time updates every 2 seconds</span>
            </div>
          )}
        </CardContent>
      </Card>

      {currentMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Bandwidth</span>
                {getStatusIcon(currentMetrics.bandwidth, 500, 'high')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.bandwidth, 500, 'high')}`}>
                {currentMetrics.bandwidth.toFixed(1)} Mbps
              </div>
              <Progress value={(currentMetrics.bandwidth / 1000) * 100} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage('bandwidth').toFixed(1)} Mbps
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Latency</span>
                {getStatusIcon(currentMetrics.latency, 50, 'low')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.latency, 50, 'low')}`}>
                {currentMetrics.latency.toFixed(1)} ms
              </div>
              <Progress value={(currentMetrics.latency / 100) * 100} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage('latency').toFixed(1)} ms
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>Packet Loss</span>
                {getStatusIcon(currentMetrics.packetLoss, 2, 'low')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.packetLoss, 2, 'low')}`}>
                {currentMetrics.packetLoss.toFixed(2)}%
              </div>
              <Progress value={(currentMetrics.packetLoss / 5) * 100} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage('packetLoss').toFixed(2)}%
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center justify-between">
                <span>CPU Usage</span>
                {getStatusIcon(currentMetrics.cpuUsage, 90, 'high')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${getStatusColor(currentMetrics.cpuUsage, 90, 'high')}`}>
                {currentMetrics.cpuUsage.toFixed(1)}%
              </div>
              <Progress value={currentMetrics.cpuUsage} className="mt-2" />
              <p className="text-xs text-gray-500 mt-1">
                Avg: {calculateAverage('cpuUsage').toFixed(1)}%
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {currentMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
                <TabsTrigger value="alerts">Alerts</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">Throughput</span>
                      </div>
                      <span className="text-lg font-bold">{currentMetrics.throughput.toFixed(1)} Mbps</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-green-600" />
                        <span className="font-medium">Active Connections</span>
                      </div>
                      <span className="text-lg font-bold">{currentMetrics.activeConnections}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">Jitter</span>
                      </div>
                      <span className="text-lg font-bold">{currentMetrics.jitter.toFixed(2)} ms</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Server className="h-4 w-4 text-orange-600" />
                        <span className="font-medium">Memory Usage</span>
                      </div>
                      <span className="text-lg font-bold">{currentMetrics.memoryUsage.toFixed(1)}%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-gray-600" />
                        <span className="font-medium">Last Update</span>
                      </div>
                      <span className="text-sm">{new Date(currentMetrics.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Activity className="h-4 w-4 text-indigo-600" />
                        <span className="font-medium">Data Points</span>
                      </div>
                      <span className="text-lg font-bold">{metricsHistory.length}</span>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="trends" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-lg font-medium">Performance Trends</div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Bandwidth Trend</Label>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-2">
                        {metricsHistory.slice(-10).map((metric, index) => (
                          <div
                            key={index}
                            className="bg-blue-500 rounded-t"
                            style={{
                              width: '8px',
                              height: `${(metric.bandwidth / 1000) * 100}%`,
                              minHeight: '4px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Latency Trend</Label>
                      <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-2">
                        {metricsHistory.slice(-10).map((metric, index) => (
                          <div
                            key={index}
                            className="bg-green-500 rounded-t"
                            style={{
                              width: '8px',
                              height: `${(metric.latency / 100) * 100}%`,
                              minHeight: '4px'
                            }}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="alerts" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-lg font-medium">Active Alerts</div>
                  {getAlerts(currentMetrics).length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No active alerts. All metrics are within normal ranges.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    getAlerts(currentMetrics).map((alert, index) => (
                      <Alert key={index} variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>{alert}</AlertDescription>
                      </Alert>
                    ))
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {metricsHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monitoring History</CardTitle>
            <CardDescription>Recent performance data points</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {metricsHistory.slice(-10).reverse().map((metric, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Activity className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">
                        {new Date(metric.timestamp).toLocaleTimeString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {metric.bandwidth.toFixed(1)} Mbps • {metric.latency.toFixed(1)} ms
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {metric.cpuUsage.toFixed(0)}% CPU
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {metric.packetLoss.toFixed(2)}% Loss
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Activity className="h-4 w-4" />
        <AlertDescription>
          This tool simulates network performance monitoring for educational purposes. Real network monitoring 
          requires specialized tools and proper network access permissions.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default PerformanceMonitor;
