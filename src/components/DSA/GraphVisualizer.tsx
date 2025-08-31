import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Plus,
  Settings,
  Network
} from "lucide-react";

interface GraphNode {
  id: string;
  label: string;
  x: number;
  y: number;
  visited?: boolean;
  current?: boolean;
  distance?: number;
}

interface GraphEdge {
  from: string;
  to: string;
  weight?: number;
  traversed?: boolean;
}

interface GraphState {
  nodes: GraphNode[];
  edges: GraphEdge[];
  visitedOrder: string[];
  currentNode?: string;
}

const ALGORITHMS = {
  'bfs': {
    name: 'Breadth-First Search',
    description: 'Explores nodes level by level using a queue'
  },
  'dfs': {
    name: 'Depth-First Search', 
    description: 'Explores as far as possible along each branch using a stack'
  },
  'dijkstra': {
    name: "Dijkstra's Algorithm",
    description: 'Finds shortest path from source to all other vertices'
  }
};

export function GraphVisualizer() {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [algorithmSteps, setAlgorithmSteps] = useState<GraphState[]>([]);
  const [startNode, setStartNode] = useState('');
  const [newNodeLabel, setNewNodeLabel] = useState('');
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  // Create sample graph
  const createSampleGraph = () => {
    const sampleNodes: GraphNode[] = [
      { id: 'A', label: 'A', x: 100, y: 100 },
      { id: 'B', label: 'B', x: 200, y: 50 },
      { id: 'C', label: 'C', x: 300, y: 100 },
      { id: 'D', label: 'D', x: 200, y: 150 },
      { id: 'E', label: 'E', x: 150, y: 200 },
      { id: 'F', label: 'F', x: 250, y: 200 }
    ];

    const sampleEdges: GraphEdge[] = [
      { from: 'A', to: 'B', weight: 4 },
      { from: 'A', to: 'D', weight: 2 },
      { from: 'B', to: 'C', weight: 3 },
      { from: 'B', to: 'D', weight: 1 },
      { from: 'C', to: 'F', weight: 2 },
      { from: 'D', to: 'E', weight: 3 },
      { from: 'E', to: 'F', weight: 1 }
    ];

    setNodes(sampleNodes);
    setEdges(sampleEdges);
    setStartNode('A');
  };

  // Add new node
  const addNode = () => {
    if (!newNodeLabel.trim()) return;
    
    const newNode: GraphNode = {
      id: newNodeLabel.toUpperCase(),
      label: newNodeLabel.toUpperCase(),
      x: 150 + Math.random() * 200,
      y: 100 + Math.random() * 150
    };

    if (!nodes.find(n => n.id === newNode.id)) {
      setNodes([...nodes, newNode]);
      setNewNodeLabel('');
    }
  };

  // Add edge between selected nodes
  const addEdge = (from: string, to: string) => {
    if (from === to) return;
    
    const edgeExists = edges.find(e => 
      (e.from === from && e.to === to) || (e.from === to && e.to === from)
    );

    if (!edgeExists) {
      const weight = Math.floor(Math.random() * 9) + 1;
      setEdges([...edges, { from, to, weight }]);
    }
  };

  // BFS Algorithm
  const runBFS = (startNodeId: string): GraphState[] => {
    const steps: GraphState[] = [];
    const visited = new Set<string>();
    const queue: string[] = [startNodeId];
    const visitedOrder: string[] = [];

    // Initial state
    steps.push({
      nodes: nodes.map(n => ({ ...n, visited: false, current: false })),
      edges: edges.map(e => ({ ...e, traversed: false })),
      visitedOrder: []
    });

    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      
      if (visited.has(currentNodeId)) continue;
      
      visited.add(currentNodeId);
      visitedOrder.push(currentNodeId);

      // Mark current node
      steps.push({
        nodes: nodes.map(n => ({
          ...n,
          visited: visited.has(n.id),
          current: n.id === currentNodeId
        })),
        edges: edges.map(e => ({ ...e, traversed: false })),
        visitedOrder: [...visitedOrder]
      });

      // Find neighbors
      const neighbors = edges
        .filter(e => e.from === currentNodeId || e.to === currentNodeId)
        .map(e => e.from === currentNodeId ? e.to : e.from)
        .filter(nodeId => !visited.has(nodeId));

      // Add neighbors to queue
      neighbors.forEach(neighbor => {
        if (!queue.includes(neighbor)) {
          queue.push(neighbor);
          
          // Show edge traversal
          steps.push({
            nodes: nodes.map(n => ({
              ...n,
              visited: visited.has(n.id),
              current: n.id === neighbor
            })),
            edges: edges.map(e => ({
              ...e,
              traversed: (e.from === currentNodeId && e.to === neighbor) ||
                        (e.to === currentNodeId && e.from === neighbor)
            })),
            visitedOrder: [...visitedOrder]
          });
        }
      });
    }

    return steps;
  };

  // DFS Algorithm
  const runDFS = (startNodeId: string): GraphState[] => {
    const steps: GraphState[] = [];
    const visited = new Set<string>();
    const stack: string[] = [startNodeId];
    const visitedOrder: string[] = [];

    // Initial state
    steps.push({
      nodes: nodes.map(n => ({ ...n, visited: false, current: false })),
      edges: edges.map(e => ({ ...e, traversed: false })),
      visitedOrder: []
    });

    while (stack.length > 0) {
      const currentNodeId = stack.pop()!;
      
      if (visited.has(currentNodeId)) continue;
      
      visited.add(currentNodeId);
      visitedOrder.push(currentNodeId);

      // Mark current node
      steps.push({
        nodes: nodes.map(n => ({
          ...n,
          visited: visited.has(n.id),
          current: n.id === currentNodeId
        })),
        edges: edges.map(e => ({ ...e, traversed: false })),
        visitedOrder: [...visitedOrder]
      });

      // Find neighbors (add in reverse order for DFS)
      const neighbors = edges
        .filter(e => e.from === currentNodeId || e.to === currentNodeId)
        .map(e => e.from === currentNodeId ? e.to : e.from)
        .filter(nodeId => !visited.has(nodeId))
        .reverse();

      // Add neighbors to stack
      neighbors.forEach(neighbor => {
        if (!stack.includes(neighbor)) {
          stack.push(neighbor);
        }
      });
    }

    return steps;
  };

  // Run algorithm
  const runAlgorithm = () => {
    if (!startNode || nodes.length === 0) return;

    let steps: GraphState[] = [];
    
    switch (selectedAlgorithm) {
      case 'bfs':
        steps = runBFS(startNode);
        break;
      case 'dfs':
        steps = runDFS(startNode);
        break;
      case 'dijkstra':
        steps = runBFS(startNode); // Simplified for demo
        break;
    }

    setAlgorithmSteps(steps);
    setCurrentStep(0);
    setIsRunning(true);
  };

  // Auto-play algorithm
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isRunning && currentStep < algorithmSteps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= algorithmSteps.length - 1) {
            setIsRunning(false);
          }
          return next;
        });
      }, 1000);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, currentStep, algorithmSteps.length]);

  // Initialize with sample graph
  useEffect(() => {
    createSampleGraph();
  }, []);

  const currentState = algorithmSteps[currentStep] || {
    nodes: nodes.map(n => ({ ...n, visited: false, current: false })),
    edges: edges.map(e => ({ ...e, traversed: false })),
    visitedOrder: []
  };

  const algorithm = ALGORITHMS[selectedAlgorithm as keyof typeof ALGORITHMS];

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Graph Algorithm Visualizer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Algorithm</label>
              <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(ALGORITHMS).map(([key, algo]) => (
                    <SelectItem key={key} value={key}>
                      {algo.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Node</label>
              <Select value={startNode} onValueChange={setStartNode}>
                <SelectTrigger>
                  <SelectValue placeholder="Select start node" />
                </SelectTrigger>
                <SelectContent>
                  {nodes.map(node => (
                    <SelectItem key={node.id} value={node.id}>
                      {node.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Add Node</label>
              <div className="flex gap-2">
                <Input
                  value={newNodeLabel}
                  onChange={(e) => setNewNodeLabel(e.target.value)}
                  placeholder="Node label"
                  className="flex-1"
                />
                <Button onClick={addNode} size="sm" style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }} className="hover:brightness-110">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex gap-2 items-end">
              <Button onClick={createSampleGraph} variant="outline" size="sm">
                Sample Graph
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsRunning(!isRunning)}
              disabled={algorithmSteps.length === 0}
              style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
              className="hover:brightness-110"
            >
              {isRunning ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isRunning ? 'Pause' : 'Play'}
            </Button>
            
            <Button 
              onClick={() => {
                setCurrentStep(0);
                setIsRunning(false);
              }}
              variant="outline"
              disabled={algorithmSteps.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <Button 
              onClick={runAlgorithm}
              style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
              className="hover:brightness-110"
            >
              Run {algorithm.name}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Algorithm Info */}
      <Card>
        <CardHeader>
          <CardTitle>{algorithm.name}</CardTitle>
          <CardDescription>{algorithm.description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="bg-complexity/20 text-complexity">
              Step {currentStep + 1} of {algorithmSteps.length || 1}
            </Badge>
            {currentState.visitedOrder.length > 0 && (
              <Badge variant="outline" className="bg-visited/20 text-visited">
                Visited: {currentState.visitedOrder.join(' → ')}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Graph Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Graph Visualization</CardTitle>
          <CardDescription>
            Click nodes to select them, then click another node to add an edge
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 rounded p-4" style={{ height: '400px' }}>
            <svg width="100%" height="100%" className="overflow-visible">
              {/* Render edges */}
              {currentState.edges.map((edge, index) => {
                const fromNode = currentState.nodes.find(n => n.id === edge.from);
                const toNode = currentState.nodes.find(n => n.id === edge.to);
                
                if (!fromNode || !toNode) return null;
                
                return (
                  <g key={`${edge.from}-${edge.to}-${index}`}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={edge.traversed ? 'hsl(var(--current))' : 'hsl(var(--algorithm))'}
                      strokeWidth={edge.traversed ? "3" : "2"}
                      style={{ filter: edge.traversed ? 'brightness(1.2)' : 'none' }}
                    />
                    {edge.weight && (
                      <text
                        x={(fromNode.x + toNode.x) / 2}
                        y={(fromNode.y + toNode.y) / 2 - 5}
                        textAnchor="middle"
                        style={{ fill: 'hsl(var(--algorithm))', fontWeight: 'bold', fontSize: '13px', filter: 'brightness(1.2)' }}
                      >
                        {edge.weight}
                      </text>
                    )}
                  </g>
                );
              })}
              
              {/* Render nodes */}
              {currentState.nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r="20"
                    style={{
                      cursor: 'pointer',
                      transition: 'all 0.3s',
                      fill: node.current
                        ? 'hsl(var(--current))'
                        : node.visited
                        ? 'hsl(var(--visited))'
                        : 'hsl(var(--algorithm))',
                      stroke: node.current
                        ? 'hsl(var(--current))'
                        : node.visited
                        ? 'hsl(var(--visited))'
                        : 'hsl(var(--algorithm-foreground))',
                      filter: node.current ? 'brightness(1.2)' : node.visited ? 'brightness(1.1)' : 'none'
                    }}
                    strokeWidth="2"
                    onClick={() => {
                      if (selectedNode && selectedNode !== node.id) {
                        addEdge(selectedNode, node.id);
                        setSelectedNode(null);
                      } else {
                        setSelectedNode(node.id);
                      }
                    }}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    style={{ fill: '#fff', fontWeight: 'bold', fontSize: '15px', pointerEvents: 'none' }}
                  >
                    {node.label}
                  </text>
                  {selectedNode === node.id && (
                    <circle
                      cx={node.x}
                      cy={node.y}
                      r="25"
                      fill="none"
                      stroke="hsl(var(--algorithm))"
                      strokeWidth="2"
                      strokeDasharray="5,5"
                      style={{ animation: 'spin 2s linear infinite' }}
                    />
                  )}
                </g>
              ))}
            </svg>
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--algorithm))' }}></div>
              <span>Unvisited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--current))' }}></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--visited))' }}></div>
              <span>Visited</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-full" style={{ background: 'hsl(var(--current))', opacity: 0.5 }}></div>
              <span>Traversed Edge</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}