import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Minus, 
  RotateCcw,
  Search,
  Network,
  Zap
} from "lucide-react";

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  highlight?: 'current' | 'visited' | 'path';
}

interface TreeAnimation {
  step: number;
  description: string;
  highlightedNodes: number[];
  type: 'search' | 'insert' | 'delete';
}

export function InteractiveTree() {
  const [root, setRoot] = useState<TreeNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [animations, setAnimations] = useState<TreeAnimation[]>([]);
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Insert node into BST
  const insertNode = (root: TreeNode | null, value: number): TreeNode => {
    if (!root) {
      return { value, left: null, right: null };
    }

    if (value < root.value) {
      root.left = insertNode(root.left, value);
    } else if (value > root.value) {
      root.right = insertNode(root.right, value);
    }

    return root;
  };

  // Delete node from BST
  const deleteNode = (root: TreeNode | null, value: number): TreeNode | null => {
    if (!root) return null;

    if (value < root.value) {
      root.left = deleteNode(root.left, value);
    } else if (value > root.value) {
      root.right = deleteNode(root.right, value);
    } else {
      // Node to be deleted found
      if (!root.left) {
        return root.right;
      } else if (!root.right) {
        return root.left;
      }

      // Node with two children
      const minValueNode = findMin(root.right);
      root.value = minValueNode.value;
      root.right = deleteNode(root.right, minValueNode.value);
    }

    return root;
  };

  // Find minimum value node
  const findMin = (node: TreeNode): TreeNode => {
    while (node.left) {
      node = node.left;
    }
    return node;
  };

  // Search for a value and create animation
  const searchWithAnimation = (value: number) => {
    const animations: TreeAnimation[] = [];
    let current = root;
    let step = 0;
    const path: number[] = [];

    animations.push({
      step: step++,
      description: `Starting search for ${value}`,
      highlightedNodes: [],
      type: 'search'
    });

    while (current) {
      path.push(current.value);
      animations.push({
        step: step++,
        description: `Comparing ${value} with ${current.value}`,
        highlightedNodes: [current.value],
        type: 'search'
      });

      if (value === current.value) {
        animations.push({
          step: step++,
          description: `Found ${value}!`,
          highlightedNodes: path,
          type: 'search'
        });
        break;
      } else if (value < current.value) {
        animations.push({
          step: step++,
          description: `${value} < ${current.value}, go left`,
          highlightedNodes: path,
          type: 'search'
        });
        current = current.left;
      } else {
        animations.push({
          step: step++,
          description: `${value} > ${current.value}, go right`,
          highlightedNodes: path,
          type: 'search'
        });
        current = current.right;
      }
    }

    if (!current) {
      animations.push({
        step: step++,
        description: `${value} not found in tree`,
        highlightedNodes: path,
        type: 'search'
      });
    }

    setAnimations(animations);
    setCurrentAnimation(0);
    setIsAnimating(true);
  };

  // Handle insert
  const handleInsert = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setRoot(prevRoot => insertNode(prevRoot, value));
    setInputValue('');
  };

  // Handle delete
  const handleDelete = () => {
    const value = parseInt(inputValue);
    if (isNaN(value)) return;

    setRoot(prevRoot => deleteNode(prevRoot, value));
    setInputValue('');
  };

  // Handle search
  const handleSearch = () => {
    const value = parseInt(searchValue);
    if (isNaN(value)) return;

    searchWithAnimation(value);
  };

  // Clear tree
  const clearTree = () => {
    setRoot(null);
    setAnimations([]);
    setIsAnimating(false);
  };

  // Calculate node positions for visualization
  const calculatePositions = (node: TreeNode | null, x: number, y: number, spacing: number): void => {
    if (!node) return;

    node.x = x;
    node.y = y;

    if (node.left) {
      calculatePositions(node.left, x - spacing, y + 60, spacing / 2);
    }
    if (node.right) {
      calculatePositions(node.right, x + spacing, y + 60, spacing / 2);
    }
  };

  // Get node highlight status
  const getNodeHighlight = (value: number): string => {
    if (!isAnimating || !animations[currentAnimation]) return '';
    
    const currentAnim = animations[currentAnimation];
    if (currentAnim.highlightedNodes.includes(value)) {
      if (currentAnim.highlightedNodes.length === 1) {
        return 'current';
      } else {
        return 'path';
      }
    }
    return '';
  };

  // Render tree recursively
  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node) return null;

    calculatePositions(root, 200, 50, 100);

    const highlight = getNodeHighlight(node.value);
    
    return (
      <g key={`node-${node.value}`}>
        {/* Render edges first */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.left.x}
            y2={node.left.y}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y}
            x2={node.right.x}
            y2={node.right.y}
            stroke="hsl(var(--muted-foreground))"
            strokeWidth="2"
          />
        )}

        {/* Render node */}
        <circle
          cx={node.x}
          cy={node.y}
          r="20"
          className={`transition-all duration-500 ${
            highlight === 'current' 
              ? 'fill-current animate-pulse text-current stroke-current' 
              : highlight === 'path'
              ? 'fill-path stroke-path text-path'
              : 'fill-algorithm stroke-algorithm text-algorithm hover:fill-algorithm/80'
          }`}
          strokeWidth="2"
        />
        <text
          x={node.x}
          y={node.y + 5}
          textAnchor="middle"
          className="fill-white text-sm font-bold pointer-events-none"
        >
          {node.value}
        </text>

        {/* Render children */}
        {renderTree(node.left)}
        {renderTree(node.right)}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Tree Operations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
                className="flex-1"
              />
              <Button onClick={handleInsert} size="sm" className="bg-algorithm hover:bg-algorithm/90">
                <Plus className="h-4 w-4" />
              </Button>
              <Button onClick={handleDelete} size="sm" variant="destructive">
                <Minus className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="flex gap-2">
              <Input
                type="number"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search value"
                className="flex-1"
              />
              <Button onClick={handleSearch} size="sm" className="bg-data-structure hover:bg-data-structure/90">
                <Search className="h-4 w-4" />
              </Button>
            </div>
            
            <Button onClick={clearTree} variant="outline" className="w-full">
              <RotateCcw className="h-4 w-4 mr-2" />
              Clear Tree
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Animation Control
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isAnimating && animations.length > 0 && (
              <>
                <div className="text-sm">
                  <Badge variant="outline" className="mb-2">
                    Step {currentAnimation + 1} of {animations.length}
                  </Badge>
                  <p className="text-muted-foreground">
                    {animations[currentAnimation]?.description}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => setCurrentAnimation(Math.max(0, currentAnimation - 1))}
                    disabled={currentAnimation === 0}
                    size="sm"
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <Button
                    onClick={() => setCurrentAnimation(Math.min(animations.length - 1, currentAnimation + 1))}
                    disabled={currentAnimation === animations.length - 1}
                    size="sm"
                    variant="outline"
                  >
                    Next
                  </Button>
                  <Button
                    onClick={() => setIsAnimating(false)}
                    size="sm"
                    variant="outline"
                  >
                    Stop
                  </Button>
                </div>
              </>
            )}
            
            {!isAnimating && (
              <div className="text-sm text-muted-foreground">
                Perform a search operation to see step-by-step animation
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tree Visualization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Binary Search Tree
          </CardTitle>
          <CardDescription>
            Click Insert to add nodes, Delete to remove them, or Search to see traversal animation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/20 rounded p-4" style={{ height: '400px' }}>
            {root ? (
              <svg width="100%" height="100%" className="overflow-visible">
                {renderTree(root)}
              </svg>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground">
                Tree is empty. Add some nodes to get started!
              </div>
            )}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-algorithm rounded-full"></div>
              <span>Normal</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-current rounded-full"></div>
              <span>Current</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-path rounded-full"></div>
              <span>Search Path</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}