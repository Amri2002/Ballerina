import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  SkipForward,
  Settings,
  Timer,
  BarChart3,
  Shuffle
} from "lucide-react";

interface VisualizationStep {
  array: number[];
  comparing?: number[];
  swapping?: number[];
  sorted?: number[];
  pivot?: number;
  description: string;
}

const ALGORITHMS = {
  'bubble-sort': {
    name: 'Bubble Sort',
    complexity: 'O(n²)',
    description: 'Repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order.'
  },
  'quick-sort': {
    name: 'Quick Sort',
    complexity: 'O(n log n)',
    description: 'Picks a pivot element and partitions the array around it, then recursively sorts the sub-arrays.'
  },
  'merge-sort': {
    name: 'Merge Sort',
    complexity: 'O(n log n)',
    description: 'Divides the array into halves, sorts them separately, then merges them back together.'
  },
  'insertion-sort': {
    name: 'Insertion Sort',
    complexity: 'O(n²)',
    description: 'Builds the sorted array one item at a time by repeatedly inserting elements in their correct position.'
  }
};

export function AlgorithmVisualizer() {
  const [array, setArray] = useState<number[]>([]);
  const [steps, setSteps] = useState<VisualizationStep[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bubble-sort');
  const [arraySize, setArraySize] = useState(10);
  
  // Generate random array
  const generateArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize }, () => 
      Math.floor(Math.random() * 100) + 1
    );
    setArray(newArray);
    setSteps([]);
    setCurrentStep(0);
    setIsPlaying(false);
  }, [arraySize]);

  // Generate steps for bubble sort
  const generateBubbleSortSteps = (arr: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const workingArray = [...arr];
    const n = workingArray.length;
    
    steps.push({
      array: [...workingArray],
      description: 'Starting Bubble Sort...'
    });
    
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Compare step
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          description: `Comparing elements at positions ${j} and ${j + 1}: ${workingArray[j]} vs ${workingArray[j + 1]}`
        });
        
        if (workingArray[j] > workingArray[j + 1]) {
          // Swap step
          [workingArray[j], workingArray[j + 1]] = [workingArray[j + 1], workingArray[j]];
          steps.push({
            array: [...workingArray],
            swapping: [j, j + 1],
            description: `Swapped ${workingArray[j + 1]} and ${workingArray[j]}`
          });
        }
      }
      
      // Mark as sorted
      steps.push({
        array: [...workingArray],
        sorted: Array.from({ length: i + 1 }, (_, idx) => n - 1 - idx),
        description: `Position ${n - 1 - i} is now sorted`
      });
    }
    
    steps.push({
      array: [...workingArray],
      sorted: Array.from({ length: n }, (_, idx) => idx),
      description: 'Sorting complete!'
    });
    
    return steps;
  };

  // Generate steps for insertion sort
  const generateInsertionSortSteps = (arr: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const workingArray = [...arr];
    const n = workingArray.length;
    
    steps.push({
      array: [...workingArray],
      description: 'Starting Insertion Sort...'
    });
    
    for (let i = 1; i < n; i++) {
      const key = workingArray[i];
      let j = i - 1;
      
      steps.push({
        array: [...workingArray],
        comparing: [i],
        description: `Selecting element ${key} at position ${i}`
      });
      
      while (j >= 0 && workingArray[j] > key) {
        steps.push({
          array: [...workingArray],
          comparing: [j, j + 1],
          description: `Comparing ${workingArray[j]} with ${key}`
        });
        
        workingArray[j + 1] = workingArray[j];
        steps.push({
          array: [...workingArray],
          swapping: [j, j + 1],
          description: `Moving ${workingArray[j + 1]} one position right`
        });
        
        j = j - 1;
      }
      
      workingArray[j + 1] = key;
      steps.push({
        array: [...workingArray],
        sorted: Array.from({ length: i + 1 }, (_, idx) => idx),
        description: `Inserted ${key} at position ${j + 1}`
      });
    }
    
    steps.push({
      array: [...workingArray],
      sorted: Array.from({ length: n }, (_, idx) => idx),
      description: 'Sorting complete!'
    });
    
    return steps;
  };

  // Generate steps for merge sort
  const generateMergeSortSteps = (arr: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const workingArray = [...arr];
    
    const mergeSort = (array: number[], left: number, right: number) => {
      if (left >= right) return;
      
      const mid = Math.floor((left + right) / 2);
      
      steps.push({
        array: [...array],
        comparing: Array.from({ length: right - left + 1 }, (_, i) => left + i),
        description: `Dividing array from ${left} to ${right} at position ${mid}`
      });
      
      mergeSort(array, left, mid);
      mergeSort(array, mid + 1, right);
      merge(array, left, mid, right);
    };
    
    const merge = (array: number[], left: number, mid: number, right: number) => {
      const leftArray = array.slice(left, mid + 1);
      const rightArray = array.slice(mid + 1, right + 1);
      
      let i = 0, j = 0, k = left;
      
      steps.push({
        array: [...array],
        comparing: Array.from({ length: right - left + 1 }, (_, idx) => left + idx),
        description: `Merging subarrays [${left}-${mid}] and [${mid + 1}-${right}]`
      });
      
      while (i < leftArray.length && j < rightArray.length) {
        if (leftArray[i] <= rightArray[j]) {
          array[k] = leftArray[i];
          i++;
        } else {
          array[k] = rightArray[j];
          j++;
        }
        
        steps.push({
          array: [...array],
          swapping: [k],
          description: `Placed ${array[k]} at position ${k}`
        });
        
        k++;
      }
      
      while (i < leftArray.length) {
        array[k] = leftArray[i];
        steps.push({
          array: [...array],
          swapping: [k],
          description: `Placed remaining ${array[k]} at position ${k}`
        });
        i++;
        k++;
      }
      
      while (j < rightArray.length) {
        array[k] = rightArray[j];
        steps.push({
          array: [...array],
          swapping: [k],
          description: `Placed remaining ${array[k]} at position ${k}`
        });
        j++;
        k++;
      }
    };
    
    steps.push({
      array: [...workingArray],
      description: 'Starting Merge Sort...'
    });
    
    mergeSort(workingArray, 0, workingArray.length - 1);
    
    steps.push({
      array: [...workingArray],
      sorted: Array.from({ length: workingArray.length }, (_, idx) => idx),
      description: 'Sorting complete!'
    });
    
    return steps;
  };

  // Generate steps for quick sort
  const generateQuickSortSteps = (arr: number[]): VisualizationStep[] => {
    const steps: VisualizationStep[] = [];
    const workingArray = [...arr];
    
    const quickSort = (array: number[], low: number, high: number) => {
      if (low < high) {
        const pivotIndex = partition(array, low, high);
        quickSort(array, low, pivotIndex - 1);
        quickSort(array, pivotIndex + 1, high);
      }
    };
    
    const partition = (array: number[], low: number, high: number): number => {
      const pivot = array[high];
      steps.push({
        array: [...array],
        pivot: high,
        description: `Choosing pivot: ${pivot} at position ${high}`
      });
      
      let i = low - 1;
      
      for (let j = low; j < high; j++) {
        steps.push({
          array: [...array],
          comparing: [j, high],
          pivot: high,
          description: `Comparing ${array[j]} with pivot ${pivot}`
        });
        
        if (array[j] < pivot) {
          i++;
          if (i !== j) {
            [array[i], array[j]] = [array[j], array[i]];
            steps.push({
              array: [...array],
              swapping: [i, j],
              pivot: high,
              description: `Swapped ${array[j]} and ${array[i]}`
            });
          }
        }
      }
      
      [array[i + 1], array[high]] = [array[high], array[i + 1]];
      steps.push({
        array: [...array],
        swapping: [i + 1, high],
        description: `Placed pivot ${pivot} at its correct position`
      });
      
      return i + 1;
    };
    
    steps.push({
      array: [...workingArray],
      description: 'Starting Quick Sort...'
    });
    
    quickSort(workingArray, 0, workingArray.length - 1);
    
    steps.push({
      array: [...workingArray],
      sorted: Array.from({ length: workingArray.length }, (_, idx) => idx),
      description: 'Sorting complete!'
    });
    
    return steps;
  };

  // Generate algorithm steps
  const generateSteps = () => {
    if (array.length === 0) return;
    
    let newSteps: VisualizationStep[] = [];
    
    switch (selectedAlgorithm) {
      case 'bubble-sort':
        newSteps = generateBubbleSortSteps(array);
        break;
      case 'quick-sort':
        newSteps = generateQuickSortSteps(array);
        break;
      case 'merge-sort':
        newSteps = generateMergeSortSteps(array);
        break;
      case 'insertion-sort':
        newSteps = generateInsertionSortSteps(array);
        break;
      default:
        newSteps = generateBubbleSortSteps(array);
    }
    
    setSteps(newSteps);
    setCurrentStep(0);
    setIsPlaying(false);
  };

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (steps.length === 0) return;
      
      switch (event.key) {
        case ' ': // Spacebar for play/pause
          event.preventDefault();
          setIsPlaying(!isPlaying);
          break;
        case 'ArrowRight': // Right arrow for next step
          event.preventDefault();
          if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
            setIsPlaying(false);
          }
          break;
        case 'ArrowLeft': // Left arrow for previous step
          event.preventDefault();
          if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
            setIsPlaying(false);
          }
          break;
        case 'r': // R for reset
          event.preventDefault();
          setCurrentStep(0);
          setIsPlaying(false);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isPlaying, currentStep, steps.length]);

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isPlaying && currentStep < steps.length - 1) {
      interval = setInterval(() => {
        setCurrentStep(prev => {
          const next = prev + 1;
          if (next >= steps.length - 1) {
            setIsPlaying(false);
          }
          return next;
        });
      }, speed);
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, currentStep, steps.length, speed]);

  // Initialize array on mount and generate steps when array changes
  useEffect(() => {
    generateArray();
  }, [generateArray]);

  // Auto-generate steps when array or algorithm changes
  useEffect(() => {
    if (array.length > 0) {
      generateSteps();
    }
  }, [array, selectedAlgorithm]);

  const currentVisualization = steps[currentStep];
  const algorithm = ALGORITHMS[selectedAlgorithm as keyof typeof ALGORITHMS];

  const getElementColor = (index: number) => {
  if (!currentVisualization) return 'bg-unvisited';
  // Sorted bars
  if (!currentVisualization) return 'bg-unvisited border border-border';
  // Sorted bars
  if (currentVisualization.sorted?.includes(index)) return 'bg-performance-excellent text-white';
  // Swapping bars
  if (currentVisualization.swapping?.includes(index)) return 'bg-current text-white animate-pulse';
  // Comparing bars
  if (currentVisualization.comparing?.includes(index)) return 'bg-complexity text-black animate-bounce';
  // Pivot bar
  if (currentVisualization.pivot === index) return 'bg-algorithm text-white';
  // Default (unsorted)
  return 'bg-unvisited border border-border';
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Algorithm Controls
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
              <label className="text-sm font-medium">Array Size: {arraySize}</label>
              <Slider
                value={[arraySize]}
                onValueChange={(value) => setArraySize(value[0])}
                min={5}
                max={20}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Speed: {speed}ms</label>
              <Slider
                value={[speed]}
                onValueChange={(value) => setSpeed(value[0])}
                min={100}
                max={2000}
                step={100}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <Button onClick={generateArray} variant="outline" size="sm">
                <Shuffle className="h-4 w-4 mr-1" />
                New Array
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              onClick={() => setIsPlaying(!isPlaying)}
              disabled={steps.length === 0}
              className="bg-primary text-primary-foreground hover:bg-primary/80"
            >
              {isPlaying ? <Pause className="h-4 w-4 mr-1" /> : <Play className="h-4 w-4 mr-1" />}
              {isPlaying ? 'Pause' : 'Play'}
            </Button>
            
            <Button 
              onClick={() => {
                setCurrentStep(0);
                setIsPlaying(false);
              }}
              variant="outline"
              disabled={steps.length === 0}
            >
              <RotateCcw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            
            <Button 
              onClick={() => setCurrentStep(prev => Math.min(prev + 1, steps.length - 1))}
              variant="outline"
              disabled={steps.length === 0 || currentStep >= steps.length - 1}
            >
              <SkipForward className="h-4 w-4 mr-1" />
              Step
            </Button>
            
            <Button 
              onClick={generateSteps}
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
              disabled={array.length === 0}
            >
              Generate Steps
            </Button>
          </div>
          
          {/* Keyboard shortcuts info */}
          <div className="text-xs text-muted-foreground">
            <span className="font-medium">Keyboard shortcuts:</span> Space (play/pause), ← → (step), R (reset)
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
            <Badge variant="outline" className="bg-info/10 text-info">
              Time Complexity: {algorithm.complexity}
            </Badge>
            <Badge variant="outline" className="bg-muted">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>Visualization</CardTitle>
          {currentVisualization && (
            <CardDescription>{currentVisualization.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center gap-1 h-64 bg-muted/20 rounded p-4">
            {(currentVisualization?.array || array).map((value, index) => (
              <div
                key={index}
                className={`flex items-end justify-center text-xs font-bold transition-all duration-300 min-w-[24px] rounded-t border border-border`}
                style={{
                  height: `${(value / Math.max(...array)) * 200}px`,
                  width: `${Math.max(24, 300 / array.length)}px`,
                  background: currentVisualization?.sorted?.includes(index)
                    ? 'hsl(var(--performance-excellent))'
                    : currentVisualization?.swapping?.includes(index)
                    ? 'hsl(var(--current))'
                    : currentVisualization?.comparing?.includes(index)
                    ? 'hsl(var(--complexity))'
                    : currentVisualization?.pivot === index
                    ? 'hsl(var(--algorithm))'
                    : 'hsl(var(--unvisited))',
                  color: currentVisualization?.sorted?.includes(index)
                    || currentVisualization?.swapping?.includes(index)
                    || currentVisualization?.pivot === index
                    ? '#fff'
                    : currentVisualization?.comparing?.includes(index)
                    ? '#111'
                    : '#222'
                }}
              >
                <span className="mb-1">{value}</span>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 text-sm">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--unvisited))' }}></div>
              <span>Unsorted</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--complexity))' }}></div>
              <span>Comparing</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--current))' }}></div>
              <span>Swapping</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--algorithm))' }}></div>
              <span>Pivot</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded" style={{ background: 'hsl(var(--performance-excellent))' }}></div>
              <span>Sorted</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}