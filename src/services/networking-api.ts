import { apiService } from './api';

export interface TCPHandshakeData {
  userId: string;
  step: string;
  status: string;
  packets: Array<{
    source: string;
    destination: string;
    packetType: string;
    data: string;
  }>;
}

export interface DNSResolutionData {
  userId: string;
  domain: string;
  status: string;
  queries: Array<{
    server: string;
    query: string;
    response: string;
    ttl: number;
  }>;
}

export interface SubnetCalculationData {
  userId: string;
  ipAddress: string;
  subnetMask: string;
  cidr: string;
}

export interface NetworkTopologyData {
  userId: string;
  name: string;
  devices: Array<{
    id: string;
    type: string;
    name: string;
    x: number;
    y: number;
    status: string;
  }>;
  connections: Array<{
    id: string;
    source: string;
    target: string;
    type: string;
    status: string;
  }>;
}

export interface UserProgressData {
  userId: string;
  module: string;
  topic: string;
  progress: number;
}

export interface ExerciseResult {
  userId: string;
  exerciseId: string;
  completed: boolean;
  score: number;
}

// Networking API service
export const networkingApi = {
  // TCP Handshake
  saveTCPHandshake: async (data: TCPHandshakeData) => {
    return apiService.request('/networking/tcp/handshake', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // DNS Resolution
  saveDNSResolution: async (data: DNSResolutionData) => {
    return apiService.request('/networking/dns/resolution', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Subnet Calculator
  calculateSubnet: async (data: SubnetCalculationData) => {
    return apiService.request('/networking/subnet/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Network Topology
  saveTopology: async (data: NetworkTopologyData) => {
    return apiService.request('/networking/topology/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getTopologies: async (userId: string) => {
    return apiService.request(`/networking/topology/list/${userId}`, {
      method: 'GET',
    });
  },

  // User Progress
  updateProgress: async (data: UserProgressData) => {
    return apiService.request('/networking/progress/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getUserProgress: async (userId: string) => {
    return apiService.request(`/networking/progress/user/${userId}`, {
      method: 'GET',
    });
  },

  // Exercise Results
  submitExercise: async (data: ExerciseResult) => {
    return apiService.request('/networking/exercises/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Module Information
  getNetworkingStatus: async () => {
    return apiService.request('/networking/status', {
      method: 'GET',
    });
  },

  getNetworkingModules: async () => {
    return apiService.request('/networking/modules', {
      method: 'GET',
    });
  }
};

// Mock data for development (when backend is not available)
export const mockNetworkingData = {
  tcpHandshake: {
    steps: [
      {
        id: 1,
        name: "Connection Establishment",
        description: "TCP Three-Way Handshake",
        packets: [
          { type: "SYN", source: "Client", destination: "Server", data: "SYN=1, seq=x" },
          { type: "SYN-ACK", source: "Server", destination: "Client", data: "SYN=1, ACK=1, seq=y, ack=x+1" },
          { type: "ACK", source: "Client", destination: "Server", data: "ACK=1, seq=x+1, ack=y+1" }
        ]
      },
      {
        id: 2,
        name: "Data Transfer",
        description: "Reliable data transmission",
        packets: [
          { type: "ACK", source: "Client", destination: "Server", data: "Data: Hello Server" },
          { type: "ACK", source: "Server", destination: "Client", data: "Data: Hello Client" }
        ]
      },
      {
        id: 3,
        name: "Connection Termination",
        description: "Graceful connection close",
        packets: [
          { type: "FIN", source: "Client", destination: "Server", data: "FIN=1, seq=u" },
          { type: "FIN-ACK", source: "Server", destination: "Client", data: "ACK=1, ack=u+1" },
          { type: "FIN", source: "Server", destination: "Client", data: "FIN=1, seq=v" },
          { type: "FIN-ACK", source: "Client", destination: "Server", data: "ACK=1, ack=v+1" }
        ]
      }
    ]
  },

  dnsResolution: {
    servers: [
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
    ],
    steps: [
      { id: 1, name: "Local Cache Check", description: "Check local DNS cache first", duration: 1000 },
      { id: 2, name: "Recursive Resolver", description: "Query recursive DNS server", duration: 1500 },
      { id: 3, name: "Root Server Query", description: "Query root DNS server for TLD", duration: 2000 },
      { id: 4, name: "TLD Server Query", description: "Query TLD server for authoritative server", duration: 2000 },
      { id: 5, name: "Authoritative Server Query", description: "Query authoritative server for IP address", duration: 1500 },
      { id: 6, name: "Response Caching", description: "Cache the response for future queries", duration: 1000 }
    ]
  },

  osiModel: {
    layers: [
      {
        id: 7,
        name: "Application Layer",
        description: "Provides network services to user applications",
        protocols: ["HTTP", "HTTPS", "FTP", "SMTP", "DNS", "SSH"],
        devices: ["Web Browsers", "Email Clients", "File Transfer Apps"],
        dataUnit: "Data",
        color: "bg-purple-100 text-purple-800 border-purple-200",
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
        color: "bg-indigo-100 text-indigo-800 border-indigo-200",
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
        color: "bg-blue-100 text-blue-800 border-blue-200",
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
        color: "bg-green-100 text-green-800 border-green-200",
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
        color: "bg-yellow-100 text-yellow-800 border-yellow-200",
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
        color: "bg-orange-100 text-orange-800 border-orange-200",
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
        color: "bg-red-100 text-red-800 border-red-200",
        headers: ["Preamble", "Start Frame Delimiter"],
        functions: ["Bit Transmission", "Signal Encoding", "Physical Topology"]
      }
    ]
  },

  subnetExercises: [
    {
      id: "exercise-1",
      question: "Calculate subnet information for 192.168.1.0/24",
      ipAddress: "192.168.1.0",
      subnetMask: "255.255.255.0",
      cidr: "24"
    },
    {
      id: "exercise-2", 
      question: "Calculate subnet information for 10.0.0.0/16",
      ipAddress: "10.0.0.0",
      subnetMask: "255.255.0.0",
      cidr: "16"
    },
    {
      id: "exercise-3",
      question: "Calculate subnet information for 172.16.0.0/25",
      ipAddress: "172.16.0.0",
      subnetMask: "255.255.255.128",
      cidr: "25"
    },
    {
      id: "exercise-4",
      question: "Calculate subnet information for 192.168.0.0/26",
      ipAddress: "192.168.0.0",
      subnetMask: "255.255.255.192",
      cidr: "26"
    },
    {
      id: "exercise-5",
      question: "Calculate subnet information for 10.1.0.0/28",
      ipAddress: "10.1.0.0",
      subnetMask: "255.255.255.240",
      cidr: "28"
    }
  ],

  deviceTypes: [
    { type: 'router', name: 'Router', color: 'bg-blue-500' },
    { type: 'switch', name: 'Switch', color: 'bg-green-500' },
    { type: 'host', name: 'Host', color: 'bg-purple-500' },
    { type: 'server', name: 'Server', color: 'bg-orange-500' },
    { type: 'firewall', name: 'Firewall', color: 'bg-red-500' }
  ]
};

// Utility functions for networking calculations
export const networkingUtils = {
  // Convert IP address to binary
  ipToBinary: (ip: string): string => {
    return ip.split('.').map(octet => 
      parseInt(octet).toString(2).padStart(8, '0')
    ).join('.');
  },

  // Convert binary to IP address
  binaryToIp: (binary: string): string => {
    return binary.split('.').map(bin => 
      parseInt(bin, 2).toString()
    ).join('.');
  },

  // Calculate subnet information
  calculateSubnetInfo: (ip: string, mask: string) => {
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
      binaryMask: networkingUtils.ipToBinary(mask),
      ipClass
    };
  },

  // Generate random IP address
  generateRandomIp: (): string => {
    return `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.0`;
  },

  // Generate random CIDR
  generateRandomCidr: (): number => {
    return Math.floor(Math.random() * 16) + 16; // CIDR 16-31
  },

  // Convert CIDR to subnet mask
  cidrToSubnetMask: (cidr: number): string => {
    const maskParts = [];
    
    for (let i = 0; i < 4; i++) {
      const bitsInOctet = Math.min(8, Math.max(0, cidr - i * 8));
      maskParts.push(bitsInOctet === 8 ? 255 : (256 - Math.pow(2, 8 - bitsInOctet)));
    }
    
    return maskParts.join('.');
  },

  // Convert subnet mask to CIDR
  subnetMaskToCidr: (mask: string): number => {
    const maskParts = mask.split('.').map(Number);
    return maskParts.reduce((sum, part) => 
      sum + part.toString(2).split('1').length - 1, 0
    );
  }
};
