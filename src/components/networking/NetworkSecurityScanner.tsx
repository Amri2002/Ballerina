import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Target, AlertTriangle, CheckCircle, Clock, Activity } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Vulnerability {
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation: string;
  cve?: string;
  port?: number;
  service?: string;
}

interface SecurityScan {
  id: string;
  userId: string;
  targetHost: string;
  scanType: string;
  status: string;
  timestamp: string;
  vulnerabilities: Vulnerability[];
  recommendations: string[];
  scanDuration: number;
  portsScanned: number;
  servicesFound: number;
}

const NetworkSecurityScanner: React.FC = () => {
  const { user } = useAuth();
  const [targetHost, setTargetHost] = useState('');
  const [scanType, setScanType] = useState('quick');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<SecurityScan | null>(null);
  const [scanHistory, setScanHistory] = useState<SecurityScan[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [scanProgress, setScanProgress] = useState(0);

  const scanTypes = [
    { value: 'quick', label: 'Quick Scan', description: 'Basic port scan and service detection', duration: 30 },
    { value: 'comprehensive', label: 'Comprehensive Scan', description: 'Full vulnerability assessment', duration: 120 },
    { value: 'stealth', label: 'Stealth Scan', description: 'Slow, undetected scanning', duration: 300 },
    { value: 'aggressive', label: 'Aggressive Scan', description: 'Fast, intensive scanning', duration: 60 }
  ];

  const sampleTargets = [
    '192.168.1.1',
    '10.0.0.1',
    '172.16.0.1',
    'localhost',
    'example.com'
  ];

  const commonVulnerabilities: Vulnerability[] = [
    {
      severity: 'high',
      description: 'Open SSH port (22) with default configuration',
      recommendation: 'Configure SSH properly, disable root login, use key-based authentication',
      cve: 'CVE-2021-28041',
      port: 22,
      service: 'SSH'
    },
    {
      severity: 'medium',
      description: 'Web server reveals version information',
      recommendation: 'Hide server version information in HTTP headers',
      port: 80,
      service: 'HTTP'
    },
    {
      severity: 'low',
      description: 'Default web server banner',
      recommendation: 'Customize web server banner to hide default information',
      port: 443,
      service: 'HTTPS'
    },
    {
      severity: 'critical',
      description: 'Unpatched system with known vulnerabilities',
      recommendation: 'Update system packages and apply security patches immediately',
      cve: 'CVE-2021-34527'
    }
  ];

  const startScan = async () => {
    if (!targetHost.trim()) {
      alert('Please enter a target host to scan');
      return;
    }

    setIsScanning(true);
    setCurrentStep(0);
    setScanProgress(0);

    try {
              const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/networking/security/scan`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          targetHost: targetHost,
          scanType: scanType
        }),
      });

      if (response.ok) {
        // Simulate scanning process
        const scanSteps = [
          'Initializing scan...',
          'Discovering hosts...',
          'Port scanning...',
          'Service detection...',
          'Vulnerability assessment...',
          'Generating report...'
        ];

        for (let i = 0; i < scanSteps.length; i++) {
          setCurrentStep(i);
          setScanProgress((i / (scanSteps.length - 1)) * 100);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }

        // Create mock scan result
        const mockScan: SecurityScan = {
          id: `scan_${Date.now()}`,
          userId: user?.id || 'demo-user',
          targetHost: targetHost,
          scanType: scanType,
          status: 'completed',
          timestamp: new Date().toISOString(),
          vulnerabilities: commonVulnerabilities.slice(0, Math.floor(Math.random() * 3) + 1),
          recommendations: [
            'Enable firewall rules',
            'Update system packages',
            'Configure intrusion detection',
            'Implement access controls',
            'Regular security audits'
          ],
          scanDuration: Math.floor(Math.random() * 300) + 30,
          portsScanned: Math.floor(Math.random() * 1000) + 100,
          servicesFound: Math.floor(Math.random() * 20) + 5
        };

        setScanResult(mockScan);
        setScanHistory(prev => [mockScan, ...prev.slice(0, 9)]);
      } else {
        throw new Error('Scan failed');
      }
    } catch (error) {
      console.error('Error during scan:', error);
      alert('Failed to complete security scan. Please try again.');
    } finally {
      setIsScanning(false);
      setScanProgress(100);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity] || 'bg-gray-100 text-gray-800';
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case 'medium':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const loadSampleTarget = () => {
    const randomTarget = sampleTargets[Math.floor(Math.random() * sampleTargets.length)];
    setTargetHost(randomTarget);
  };

  const clearScan = () => {
    setScanResult(null);
    setTargetHost('');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Shield className="h-6 w-6 text-red-600" />
        <h1 className="text-2xl font-bold">Network Security Scanner</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Security Scan Configuration</CardTitle>
          <CardDescription>
            Configure and run security scans to identify vulnerabilities and security issues
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="target">Target Host</Label>
              <div className="flex space-x-2">
                <Input
                  id="target"
                  value={targetHost}
                  onChange={(e) => setTargetHost(e.target.value)}
                  placeholder="Enter IP address or hostname"
                />
                <Button variant="outline" onClick={loadSampleTarget}>
                  Sample
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="scanType">Scan Type</Label>
              <Select value={scanType} onValueChange={setScanType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select scan type" />
                </SelectTrigger>
                <SelectContent>
                  {scanTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{type.label}</span>
                        <span className="text-sm text-gray-500">
                          {type.description} (~{type.duration}s)
                        </span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex space-x-2">
            <Button 
              onClick={startScan} 
              disabled={isScanning} 
              className="flex-1"
              variant={isScanning ? "secondary" : "default"}
            >
              {isScanning ? (
                <>
                  <Activity className="h-4 w-4 mr-2 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <Target className="h-4 w-4 mr-2" />
                  Start Scan
                </>
              )}
            </Button>
            <Button variant="outline" onClick={clearScan}>
              Clear
            </Button>
          </div>

          {isScanning && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Scan Progress</span>
                <span className="text-sm text-gray-500">{Math.round(scanProgress)}%</span>
              </div>
              <Progress value={scanProgress} className="w-full" />
              <div className="text-sm text-gray-600">
                Step {currentStep + 1} of 6: {
                  [
                    'Initializing scan...',
                    'Discovering hosts...',
                    'Port scanning...',
                    'Service detection...',
                    'Vulnerability assessment...',
                    'Generating report...'
                  ][currentStep]
                }
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {scanResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Scan Results</span>
              <Badge variant="outline" className="ml-auto">
                {scanResult.status}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="vulnerabilities">Vulnerabilities</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-red-600">
                      {scanResult.vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length}
                    </div>
                    <div className="text-sm text-gray-600">High/Critical Issues</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {scanResult.portsScanned}
                    </div>
                    <div className="text-sm text-gray-600">Ports Scanned</div>
                  </div>
                  <div className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {scanResult.scanDuration}s
                    </div>
                    <div className="text-sm text-gray-600">Scan Duration</div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Target Information</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                      <div className="text-sm font-medium">Target Host</div>
                      <div className="text-sm text-gray-600">{scanResult.targetHost}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Scan Type</div>
                      <div className="text-sm text-gray-600">{scanType}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Scan Date</div>
                      <div className="text-sm text-gray-600">
                        {new Date(scanResult.timestamp).toLocaleString()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium">Services Found</div>
                      <div className="text-sm text-gray-600">{scanResult.servicesFound}</div>
                    </div>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="vulnerabilities" className="space-y-4">
                <div className="space-y-4">
                  {scanResult.vulnerabilities.length === 0 ? (
                    <Alert>
                      <CheckCircle className="h-4 w-4" />
                      <AlertDescription>
                        No vulnerabilities detected in this scan. The target appears to be secure.
                      </AlertDescription>
                    </Alert>
                  ) : (
                    scanResult.vulnerabilities.map((vuln, index) => (
                      <Card key={index} className="border-l-4 border-l-red-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center space-x-2">
                              {getSeverityIcon(vuln.severity)}
                              <Badge className={getSeverityColor(vuln.severity)}>
                                {vuln.severity.toUpperCase()}
                              </Badge>
                              {vuln.cve && (
                                <Badge variant="outline" className="text-xs">
                                  {vuln.cve}
                                </Badge>
                              )}
                            </div>
                            {vuln.port && (
                              <Badge variant="secondary">
                                Port {vuln.port}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-3">
                            <div className="font-medium">{vuln.description}</div>
                            <div className="text-sm text-gray-600 mt-1">
                              <strong>Recommendation:</strong> {vuln.recommendation}
                            </div>
                            {vuln.service && (
                              <div className="text-sm text-gray-500 mt-1">
                                Service: {vuln.service}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="space-y-4">
                  <div className="text-lg font-medium">Security Recommendations</div>
                  <div className="space-y-3">
                    {scanResult.recommendations.map((rec, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        <div className="flex-1">
                          <div className="font-medium">{rec}</div>
                          <div className="text-sm text-gray-600 mt-1">
                            Priority: {index < 2 ? 'High' : 'Medium'}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Scan ID</Label>
                      <div className="text-sm font-mono">{scanResult.id}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Scan Duration</Label>
                      <div className="text-sm">{scanResult.scanDuration} seconds</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Ports Scanned</Label>
                      <div className="text-sm">{scanResult.portsScanned}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Services Detected</Label>
                      <div className="text-sm">{scanResult.servicesFound}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Vulnerability Summary</Label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="text-center p-2 bg-red-50 rounded">
                        <div className="text-lg font-bold text-red-600">
                          {scanResult.vulnerabilities.filter(v => v.severity === 'critical').length}
                        </div>
                        <div className="text-xs">Critical</div>
                      </div>
                      <div className="text-center p-2 bg-orange-50 rounded">
                        <div className="text-lg font-bold text-orange-600">
                          {scanResult.vulnerabilities.filter(v => v.severity === 'high').length}
                        </div>
                        <div className="text-xs">High</div>
                      </div>
                      <div className="text-center p-2 bg-yellow-50 rounded">
                        <div className="text-lg font-bold text-yellow-600">
                          {scanResult.vulnerabilities.filter(v => v.severity === 'medium').length}
                        </div>
                        <div className="text-xs">Medium</div>
                      </div>
                      <div className="text-center p-2 bg-green-50 rounded">
                        <div className="text-lg font-bold text-green-600">
                          {scanResult.vulnerabilities.filter(v => v.severity === 'low').length}
                        </div>
                        <div className="text-xs">Low</div>
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {scanHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Scan History</CardTitle>
            <CardDescription>Recent security scans</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {scanHistory.map((scan, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-4 w-4 text-gray-600" />
                    <div>
                      <div className="text-sm font-medium">{scan.targetHost}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(scan.timestamp).toLocaleString()} • {scan.scanType}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge className={getSeverityColor(
                      scan.vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high') 
                        ? 'high' 
                        : 'low'
                    )}>
                      {scan.vulnerabilities.filter(v => v.severity === 'critical' || v.severity === 'high').length} issues
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setScanResult(scan)}
                    >
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This tool simulates security scanning for educational purposes. Always obtain proper authorization 
          before scanning any network or system. Real security scanning requires specialized tools and expertise.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default NetworkSecurityScanner;
