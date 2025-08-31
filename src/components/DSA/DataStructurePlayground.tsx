import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Minus, 
  RotateCcw,
  Search,
  ArrowRight,
  ArrowLeft,
  Layers,
  GitBranch,
  Network
} from "lucide-react";

interface StackNode {
  value: number;
  id: string;
}

interface QueueNode {
  value: number;
  id: string;
}

interface ListNode {
  value: number;
  next: string | null;
  id: string;
}

interface TreeNode {
  value: number;
  left: string | null;
  right: string | null;
  id: string;
  x?: number;
  y?: number;
}

export function DataStructurePlayground() {
  // Stack State
  const [stack, setStack] = useState<StackNode[]>([]);
  const [stackInput, setStackInput] = useState('');
  
  // Queue State
  const [queue, setQueue] = useState<QueueNode[]>([]);
  const [queueInput, setQueueInput] = useState('');
  
  // Linked List State
  const [linkedList, setLinkedList] = useState<Map<string, ListNode>>(new Map());
  const [listHead, setListHead] = useState<string | null>(null);
  const [listInput, setListInput] = useState('');
  
  // Binary Tree State
  const [binaryTree, setBinaryTree] = useState<Map<string, TreeNode>>(new Map());
  const [treeRoot, setTreeRoot] = useState<string | null>(null);
  const [treeInput, setTreeInput] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([]);

  // Stack Operations
  const pushToStack = () => {
    const value = parseInt(stackInput);
    if (isNaN(value)) return;
    
    const newNode: StackNode = {
      value,
      id: Date.now().toString()
    };
    
    setStack(prev => [...prev, newNode]);
    setStackInput('');
  };

  const popFromStack = () => {
    setStack(prev => prev.slice(0, -1));
  };

  const clearStack = () => {
    setStack([]);
  };

  // Queue Operations
  const enqueue = () => {
    const value = parseInt(queueInput);
    if (isNaN(value)) return;
    
    const newNode: QueueNode = {
      value,
      id: Date.now().toString()
    };
    
    setQueue(prev => [...prev, newNode]);
    setQueueInput('');
  };

  const dequeue = () => {
    setQueue(prev => prev.slice(1));
  };

  const clearQueue = () => {
    setQueue([]);
  };

  // Linked List Operations
  const addToList = () => {
    const value = parseInt(listInput);
    if (isNaN(value)) return;
    
    const newNodeId = Date.now().toString();
    const newNode: ListNode = {
      value,
      next: null,
      id: newNodeId
    };
    
    setLinkedList(prev => {
      const newMap = new Map(prev);
      newMap.set(newNodeId, newNode);
      
      if (!listHead) {
        setListHead(newNodeId);
      } else {
        // Find tail and connect
        let current = listHead;
        while (current && newMap.get(current)?.next) {
          current = newMap.get(current)!.next;
        }
        if (current) {
          const currentNode = newMap.get(current)!;
          newMap.set(current, { ...currentNode, next: newNodeId });
        }
      }
      
      return newMap;
    });
    
    setListInput('');
  };

  const removeFromList = (nodeId: string) => {
    setLinkedList(prev => {
      const newMap = new Map(prev);
      
      if (listHead === nodeId) {
        const headNode = newMap.get(listHead);
        setListHead(headNode?.next || null);
      } else {
        // Find previous node
        for (const [id, node] of newMap) {
          if (node.next === nodeId) {
            const nodeToRemove = newMap.get(nodeId);
            newMap.set(id, { ...node, next: nodeToRemove?.next || null });
            break;
          }
        }
      }
      
      newMap.delete(nodeId);
      return newMap;
    });
  };

  const clearList = () => {
    setLinkedList(new Map());
    setListHead(null);
  };

  // Binary Tree Operations
  const insertIntoTree = () => {
    const value = parseInt(treeInput);
    if (isNaN(value)) return;
    
    const newNodeId = Date.now().toString();
    const newNode: TreeNode = {
      value,
      left: null,
      right: null,
      id: newNodeId
    };
    
    setBinaryTree(prev => {
      const newMap = new Map(prev);
      newMap.set(newNodeId, newNode);
      
      if (!treeRoot) {
        setTreeRoot(newNodeId);
      } else {
        // BST insertion
        let current = treeRoot;
        while (current) {
          const currentNode = newMap.get(current)!;
          if (value < currentNode.value) {
            if (!currentNode.left) {
              newMap.set(current, { ...currentNode, left: newNodeId });
              break;
            }
            current = currentNode.left;
          } else {
            if (!currentNode.right) {
              newMap.set(current, { ...currentNode, right: newNodeId });
              break;
            }
            current = currentNode.right;
          }
        }
      }
      
      return newMap;
    });
    
    setTreeInput('');
  };

  const searchInTree = async () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) return;
    
    const path: string[] = [];
    let current = treeRoot;
    let found = false;
    
    // Animate the search step by step
    while (current) {
      path.push(current);
      setHighlightedNodes([...path]);
      
      // Add delay for visualization
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const currentNode = binaryTree.get(current)!;
      
      if (currentNode.value === value) {
        found = true;
        break;
      } else if (value < currentNode.value) {
        current = currentNode.left;
      } else {
        current = currentNode.right;
      }
    }
    
    // Show final result
    if (found) {
      // Flash the found node
      for (let i = 0; i < 3; i++) {
        setHighlightedNodes([]);
        await new Promise(resolve => setTimeout(resolve, 200));
        setHighlightedNodes(path);
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Clear highlights after 2 seconds
    setTimeout(() => setHighlightedNodes([]), 2000);
  };

  const clearTree = () => {
    setBinaryTree(new Map());
    setTreeRoot(null);
    setHighlightedNodes([]);
  };

  // Helper function to render linked list
  const renderLinkedList = () => {
    const nodes: JSX.Element[] = [];
    let current = listHead;
    let index = 0;
    
    while (current && index < 10) { // Prevent infinite loops
      const node = linkedList.get(current);
      if (!node) break;
      
      nodes.push(
        <div key={node.id} className="flex items-center">
          <div className="relative group">
            <div
              className="w-16 h-12 rounded flex items-center justify-center font-bold border border-border"
              style={{
                background: 'hsl(var(--data-structure))',
                color: 'hsl(var(--data-structure-foreground))'
              }}
            >
              {node.value}
            </div>
            <Button
              size="sm"
              variant="destructive"
              className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={() => removeFromList(node.id)}
            >
              ×
            </Button>
          </div>
          {node.next && (
            <ArrowRight className="h-6 w-6 mx-2" style={{ color: 'hsl(var(--muted-foreground))' }} />
          )}
        </div>
      );
      
      current = node.next;
      index++;
    }
    
    return nodes.length > 0 ? nodes : (
      <div className="text-muted-foreground text-center py-8">
        Linked list is empty
      </div>
    );
  };

  // Helper function to render binary tree
  const renderTreeNode = (nodeId: string | null, x: number, y: number, level: number): JSX.Element | null => {
    if (!nodeId) return null;
    const node = binaryTree.get(nodeId);
    if (!node) return null;
    const isHighlighted = highlightedNodes.includes(nodeId);
    const spacing = Math.max(50, 200 / Math.pow(2, level));
    return (
      <g key={nodeId}>
        {/* Lines to children */}
        {node.left && (
          <line
            x1={x}
            y1={y}
            x2={x - spacing}
            y2={y + 60}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
          />
        )}
        {node.right && (
          <line
            x1={x}
            y1={y}
            x2={x + spacing}
            y2={y + 60}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth={2}
          />
        )}
        {/* Node circle */}
        <circle
          cx={x}
          cy={y}
          r={20}
          fill={isHighlighted ? 'hsl(var(--current))' : 'hsl(var(--algorithm))'}
          stroke={isHighlighted ? 'hsl(var(--current))' : 'hsl(var(--algorithm-foreground))'}
          className={isHighlighted ? 'animate-pulse transition-all duration-300' : 'transition-all duration-300'}
          strokeWidth={2}
        />
        {/* Node value */}
        <text
          x={x}
          y={y + 5}
          textAnchor="middle"
          fill="white"
          style={{ fontWeight: 'bold', fontSize: '14px' }}
        >
          {node.value}
        </text>
        {/* Render children */}
        {renderTreeNode(node.left, x - spacing, y + 60, level + 1)}
        {renderTreeNode(node.right, x + spacing, y + 60, level + 1)}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="stack" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="stack">Stack</TabsTrigger>
          <TabsTrigger value="queue">Queue</TabsTrigger>
          <TabsTrigger value="linked-list">Linked List</TabsTrigger>
          <TabsTrigger value="binary-tree">Binary Tree</TabsTrigger>
        </TabsList>
        
        {/* Stack Tab */}
        <TabsContent value="stack" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layers className="h-5 w-5" />
                Stack (LIFO - Last In, First Out)
              </CardTitle>
              <CardDescription>
                Elements are added and removed from the top
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={stackInput}
                  onChange={(e) => setStackInput(e.target.value)}
                  placeholder="Enter value"
                  className="max-w-32"
                />
                <Button onClick={pushToStack} style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }} className="hover:brightness-110">
                  <Plus className="h-4 w-4 mr-1" />
                  Push
                </Button>
                <Button onClick={popFromStack} variant="outline" disabled={stack.length === 0}>
                  <Minus className="h-4 w-4 mr-1" />
                  Pop
                </Button>
                <Button onClick={clearStack} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="flex items-end gap-1 min-h-[200px] p-4 bg-muted/20 rounded">
                {stack.length === 0 ? (
                  <div className="text-muted-foreground text-center w-full">
                    Stack is empty
                  </div>
                ) : (
                  <div className="flex flex-col-reverse gap-1">
                    {stack.map((node, index) => (
                      <div
                        key={node.id}
                        className={`w-20 h-12 bg-data-structure text-data-structure-foreground rounded flex items-center justify-center font-bold ${
                          index === stack.length - 1 ? 'animate-pulse ring-2 ring-current' : ''
                        }`}
                      >
                        {node.value}
                      </div>
                    ))}
                    <Badge variant="outline" className="self-center mt-2">
                      Top
                    </Badge>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Size: {stack.length} | Operations: O(1) push, O(1) pop
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Queue Tab */}
        <TabsContent value="queue" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5" />
                Queue (FIFO - First In, First Out)
              </CardTitle>
              <CardDescription>
                Elements are added at the rear and removed from the front
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={queueInput}
                  onChange={(e) => setQueueInput(e.target.value)}
                  placeholder="Enter value"
                  className="max-w-32"
                />
                <Button onClick={enqueue} style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }} className="hover:brightness-110">
                  <Plus className="h-4 w-4 mr-1" />
                  Enqueue
                </Button>
                <Button onClick={dequeue} variant="outline" disabled={queue.length === 0}>
                  <Minus className="h-4 w-4 mr-1" />
                  Dequeue
                </Button>
                <Button onClick={clearQueue} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="min-h-[200px] p-4 bg-muted/20 rounded">
                {queue.length === 0 ? (
                  <div className="text-muted-foreground text-center py-8">
                    Queue is empty
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-between">
                      <Badge variant="outline">Front</Badge>
                      <Badge variant="outline">Rear</Badge>
                    </div>
                    <div className="flex gap-2 overflow-x-auto">
                      {queue.map((node, index) => (
                        <div key={node.id} className="flex items-center">
                          <div
                            className={`w-16 h-12 bg-data-structure text-data-structure-foreground rounded flex items-center justify-center font-bold ${
                              index === 0 ? 'ring-2 ring-current' : ''
                            }`}
                          >
                            {node.value}
                          </div>
                          {index < queue.length - 1 && (
                            <ArrowRight className="h-6 w-6 text-muted-foreground mx-1" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Size: {queue.length} | Operations: O(1) enqueue, O(1) dequeue
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Linked List Tab */}
        <TabsContent value="linked-list" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GitBranch className="h-5 w-5" />
                Linked List
              </CardTitle>
              <CardDescription>
                Dynamic data structure with nodes connected by pointers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={listInput}
                  onChange={(e) => setListInput(e.target.value)}
                  placeholder="Enter value"
                  className="max-w-32"
                />
                <Button onClick={addToList} style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }} className="hover:brightness-110">
                  <Plus className="h-4 w-4 mr-1" />
                  Add
                </Button>
                <Button onClick={clearList} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="min-h-[200px] p-4 bg-muted/20 rounded overflow-x-auto">
                <div className="flex items-center gap-2 min-w-fit">
                  {listHead && (
                    <Badge variant="outline" className="mb-4">Head</Badge>
                  )}
                  <div className="flex items-center gap-2">
                    {renderLinkedList()}
                  </div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Length: {linkedList.size} | Operations: O(1) insert at head, O(n) search
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Binary Tree Tab */}
        <TabsContent value="binary-tree" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Binary Search Tree
              </CardTitle>
              <CardDescription>
                Hierarchical data structure with left child &lt; parent &lt; right child
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2 flex-wrap">
                <Input
                  type="number"
                  value={treeInput}
                  onChange={(e) => setTreeInput(e.target.value)}
                  placeholder="Insert value"
                  className="max-w-32"
                />
                <Button onClick={insertIntoTree} style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }} className="hover:brightness-110">
                  <Plus className="h-4 w-4 mr-1" />
                  Insert
                </Button>
                <Input
                  type="number"
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder="Search value"
                  className="max-w-32"
                />
                <Button onClick={searchInTree} variant="outline">
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
                <Button onClick={clearTree} variant="outline">
                  <RotateCcw className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              </div>
              
              <div className="min-h-[300px] p-4 bg-muted/20 rounded overflow-auto">
                {!treeRoot ? (
                  <div className="text-muted-foreground text-center py-8">
                    Tree is empty
                  </div>
                ) : (
                  <svg width="100%" height="300" className="overflow-visible">
                    {renderTreeNode(treeRoot, 200, 50, 0)}
                  </svg>
                )}
              </div>
              
              <div className="text-sm text-muted-foreground">
                Nodes: {binaryTree.size} | Operations: O(log n) insert, O(log n) search (balanced)
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}