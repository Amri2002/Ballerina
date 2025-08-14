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
import { Network, Shield, Activity, Eye } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface PacketData {
  sourcePort: number;
  destinationPort: number;
  protocol: string;
  flags: string[];
  payload: string;
  timestamp: string;
  size: number;
}

interface ProtocolAnalysis {
  id: string;
  userId: string;
  packetData: string;
  protocolType: string;
  analysis: string;
  timestamp: string;
  decodedData: PacketData;
}

const ProtocolAnalyzer: React.FC = () => {
  const { user } = useAuth();
  const [packetData, setPacketData] = useState('');
  const [protocolType, setProtocolType] = useState('TCP');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<ProtocolAnalysis | null>(null);
  const [analysisHistory, setAnalysisHistory] = useState<ProtocolAnalysis[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [showAnimation, setShowAnimation] = useState(false);

  const protocolTypes = [
    { value: 'TCP', label: 'TCP', description: 'Transmission Control Protocol' },
    { value: 'UDP', label: 'UDP', description: 'User Datagram Protocol' },
    { value: 'HTTP', label: 'HTTP', description: 'Hypertext Transfer Protocol' },
    { value: 'HTTPS', label: 'HTTPS', description: 'HTTP Secure' },
    { value: 'FTP', label: 'FTP', description: 'File Transfer Protocol' },
    { value: 'SMTP', label: 'SMTP', description: 'Simple Mail Transfer Protocol' },
    { value: 'DNS', label: 'DNS', description: 'Domain Name System' },
    { value: 'ICMP', label: 'ICMP', description: 'Internet Control Message Protocol' }
  ];

  const samplePackets = {
    TCP: 'SYN=1, ACK=0, SEQ=1234567890, WIN=65535',
    UDP: 'LEN=512, CHECKSUM=0xABCD, PAYLOAD=Hello World',
    HTTP: 'GET /index.html HTTP/1.1\r\nHost: example.com\r\nUser-Agent: Mozilla/5.0',
    HTTPS: 'TLS 1.3 Handshake, Client Hello, Cipher Suites',
    FTP: 'USER anonymous\r\nPASS user@example.com\r\nPORT 192,168,1,100,20,20',
    SMTP: 'MAIL FROM:<sender@example.com>\r\nRCPT TO:<recipient@example.com>',
    DNS: 'QNAME=www.example.com, QTYPE=A, QCLASS=IN',
    ICMP: 'TYPE=8, CODE=0, ID=1234, SEQ=1, ECHO REQUEST'
  };

  const analyzePacket = async () => {
    if (!packetData.trim()) {
      alert('Please enter packet data to analyze');
      return;
    }

    setIsAnalyzing(true);
    setShowAnimation(true);
    setCurrentStep(0);
    setAnalysis(null);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:3002/api'}/networking/protocol/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: user?.id || 'demo-user',
          packetData: packetData,
          protocolType: protocolType
        }),
      });

      if (response.ok) {
        const result = await response.text();
        
        // Simulate analysis steps
        const steps = [
          'Capturing packet data...',
          'Decoding protocol headers...',
          'Extracting payload information...',
          'Analyzing packet structure...',
          'Generating analysis report...'
        ];

        for (let i = 0; i < steps.length; i++) {
          setCurrentStep(i);
          await new Promise(resolve => setTimeout(resolve, 800));
        }

        // Create mock analysis result
        const mockAnalysis: ProtocolAnalysis = {
          id: `analysis_${Date.now()}`,
          userId: user?.id || 'demo-user',
          packetData: packetData,
          protocolType: protocolType,
          analysis: 'Protocol analysis completed successfully',
          timestamp: new Date().toISOString(),
          decodedData: {
            sourcePort: Math.floor(Math.random() * 65535),
            destinationPort: Math.floor(Math.random() * 65535),
            protocol: protocolType,
            flags: protocolType === 'TCP' ? ['SYN', 'ACK'] : [],
            payload: 'Sample payload data extracted from packet',
            timestamp: new Date().toISOString(),
            size: packetData.length
          }
        };

        setAnalysis(mockAnalysis);
        setAnalysisHistory(prev => [mockAnalysis, ...prev.slice(0, 9)]);
      } else {
        throw new Error('Analysis failed');
      }
    } catch (error) {
      console.error('Error analyzing packet:', error);
      alert('Failed to analyze packet. Please try again.');
    } finally {
      setIsAnalyzing(false);
      setShowAnimation(false);
    }
  };

  const loadSamplePacket = () => {
    setPacketData(samplePackets[protocolType as keyof typeof samplePackets] || '');
  };

  const clearAnalysis = () => {
    setAnalysis(null);
    setPacketData('');
  };

  const getProtocolColor = (protocol: string) => {
    const colors: { [key: string]: string } = {
      TCP: 'bg-blue-100 text-blue-800',
      UDP: 'bg-green-100 text-green-800',
      HTTP: 'bg-purple-100 text-purple-800',
      HTTPS: 'bg-orange-100 text-orange-800',
      FTP: 'bg-red-100 text-red-800',
      SMTP: 'bg-yellow-100 text-yellow-800',
      DNS: 'bg-indigo-100 text-indigo-800',
      ICMP: 'bg-pink-100 text-pink-800'
    };
    return colors[protocol] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Network className="h-6 w-6 text-blue-600" />
        <h1 className="text-2xl font-bold">Protocol Analyzer</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Packet Analysis</CardTitle>
          <CardDescription>
            Analyze network packets and decode protocol information in real-time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="protocol">Protocol Type</Label>
              <Select value={protocolType} onValueChange={setProtocolType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select protocol" />
                </SelectTrigger>
                <SelectContent>
                  {protocolTypes.map((protocol) => (
                    <SelectItem key={protocol.value} value={protocol.value}>
                      <div className="flex flex-col">
                        <span className="font-medium">{protocol.label}</span>
                        <span className="text-sm text-gray-500">{protocol.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="sample">Sample Data</Label>
              <Button variant="outline" onClick={loadSamplePacket} className="w-full">
                Load Sample Packet
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="packetData">Packet Data</Label>
            <textarea
              id="packetData"
              value={packetData}
              onChange={(e) => setPacketData(e.target.value)}
              placeholder="Enter packet data to analyze..."
              className="w-full h-32 p-3 border border-gray-300 rounded-md resize-none"
            />
          </div>

          <div className="flex space-x-2">
            <Button onClick={analyzePacket} disabled={isAnalyzing} className="flex-1">
              {isAnalyzing ? 'Analyzing...' : 'Analyze Packet'}
            </Button>
            <Button variant="outline" onClick={clearAnalysis}>
              Clear
            </Button>
          </div>

          {isAnalyzing && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Activity className="h-4 w-4 animate-spin" />
                <span>Analyzing packet...</span>
              </div>
              <Progress value={(currentStep / 4) * 100} className="w-full" />
            </div>
          )}
        </CardContent>
      </Card>

      {analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="h-5 w-5" />
              <span>Analysis Results</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="hex">Hex View</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Protocol</Label>
                    <Badge className={getProtocolColor(analysis.protocolType)}>
                      {analysis.protocolType}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <Label>Packet Size</Label>
                    <div className="text-sm font-mono">{analysis.decodedData.size} bytes</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Source Port</Label>
                    <div className="text-sm font-mono">{analysis.decodedData.sourcePort}</div>
                  </div>
                  <div className="space-y-2">
                    <Label>Destination Port</Label>
                    <div className="text-sm font-mono">{analysis.decodedData.destinationPort}</div>
                  </div>
                </div>

                {analysis.decodedData.flags.length > 0 && (
                  <div className="space-y-2">
                    <Label>Flags</Label>
                    <div className="flex space-x-2">
                      {analysis.decodedData.flags.map((flag, index) => (
                        <Badge key={index} variant="secondary">
                          {flag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Payload Preview</Label>
                  <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                    {analysis.decodedData.payload}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="details" className="space-y-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Analysis ID</Label>
                      <div className="text-sm font-mono">{analysis.id}</div>
                    </div>
                    <div className="space-y-2">
                      <Label>Timestamp</Label>
                      <div className="text-sm">{new Date(analysis.timestamp).toLocaleString()}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Raw Packet Data</Label>
                    <div className="p-3 bg-gray-50 rounded-md font-mono text-sm whitespace-pre-wrap">
                      {analysis.packetData}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Analysis Status</Label>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      {analysis.analysis}
                    </Badge>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="hex" className="space-y-4">
                <div className="space-y-2">
                  <Label>Hexadecimal View</Label>
                  <div className="p-3 bg-gray-50 rounded-md font-mono text-sm">
                    {packetData.split('').map((char, index) => (
                      <span key={index} className="inline-block w-8 text-center">
                        {char.charCodeAt(0).toString(16).padStart(2, '0').toUpperCase()}
                      </span>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="timeline" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Shield className="h-4 w-4" />
                    <span className="font-medium">Analysis Timeline</span>
                  </div>
                  
                  <div className="space-y-3">
                    {[
                      { step: 'Packet Capture', time: '00:00:01', status: 'completed' },
                      { step: 'Protocol Detection', time: '00:00:02', status: 'completed' },
                      { step: 'Header Parsing', time: '00:00:03', status: 'completed' },
                      { step: 'Payload Extraction', time: '00:00:04', status: 'completed' },
                      { step: 'Analysis Complete', time: '00:00:05', status: 'completed' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-3 h-3 rounded-full ${
                          item.status === 'completed' ? 'bg-green-500' : 'bg-gray-300'
                        }`} />
                        <div className="flex-1">
                          <div className="text-sm font-medium">{item.step}</div>
                          <div className="text-xs text-gray-500">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}

      {analysisHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis History</CardTitle>
            <CardDescription>Recent packet analyses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analysisHistory.map((item, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-center space-x-3">
                    <Badge className={getProtocolColor(item.protocolType)}>
                      {item.protocolType}
                    </Badge>
                    <div>
                      <div className="text-sm font-medium">Analysis #{item.id.split('_')[2]}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(item.timestamp).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setAnalysis(item)}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          This tool simulates packet analysis for educational purposes. Real packet analysis requires 
          specialized tools like Wireshark or tcpdump.
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default ProtocolAnalyzer;
