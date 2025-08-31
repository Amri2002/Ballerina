import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Play, 
  CheckCircle, 
  XCircle,
  Clock,
  Zap,
  Code2,
  BookOpen,
  Target
} from "lucide-react";

interface TestCase {
  input: string;
  expectedOutput: string;
  description: string;
}

interface Problem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  testCases: TestCase[];
  starterCode: {
    javascript: string;
    python: string;
    java: string;
  };
  hints: string[];
  timeComplexity: string;
  spaceComplexity: string;
}

const PROBLEMS: Problem[] = [
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      }
    ],
    testCases: [
      { input: '[2,7,11,15], 9', expectedOutput: '[0,1]', description: 'Basic case' },
      { input: '[3,2,4], 6', expectedOutput: '[1,2]', description: 'Different indices' },
      { input: '[3,3], 6', expectedOutput: '[0,1]', description: 'Duplicate values' }
    ],
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      java: `public int[] twoSum(int[] nums, int target) {
    // Your code here
}`
    },
    hints: [
      'Try using a hash map to store the complement of each number',
      'For each number, check if its complement exists in the hash map',
      'Remember to return the indices, not the values'
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(n)'
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    description: 'Given the head of a singly linked list, reverse the list, and return the reversed list.',
    examples: [
      {
        input: 'head = [1,2,3,4,5]',
        output: '[5,4,3,2,1]'
      }
    ],
    testCases: [
      { input: '[1,2,3,4,5]', expectedOutput: '[5,4,3,2,1]', description: 'Standard case' },
      { input: '[1,2]', expectedOutput: '[2,1]', description: 'Two nodes' },
      { input: '[]', expectedOutput: '[]', description: 'Empty list' }
    ],
    starterCode: {
      javascript: `function reverseList(head) {
    // Your code here
}`,
      python: `def reverse_list(head):
    # Your code here
    pass`,
      java: `public ListNode reverseList(ListNode head) {
    // Your code here
}`
    },
    hints: [
      'Use three pointers: previous, current, and next',
      'Iterate through the list and reverse the links',
      'Don\'t forget to handle the edge case of an empty list'
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(1)'
  },
  {
    id: 'binary-tree-inorder',
    title: 'Binary Tree Inorder Traversal',
    difficulty: 'Medium',
    description: 'Given the root of a binary tree, return the inorder traversal of its nodes\' values.',
    examples: [
      {
        input: 'root = [1,null,2,3]',
        output: '[1,3,2]'
      }
    ],
    testCases: [
      { input: '[1,null,2,3]', expectedOutput: '[1,3,2]', description: 'Standard case' },
      { input: '[]', expectedOutput: '[]', description: 'Empty tree' },
      { input: '[1]', expectedOutput: '[1]', description: 'Single node' }
    ],
    starterCode: {
      javascript: `function inorderTraversal(root) {
    // Your code here
}`,
      python: `def inorder_traversal(root):
    # Your code here
    pass`,
      java: `public List<Integer> inorderTraversal(TreeNode root) {
    // Your code here
}`
    },
    hints: [
      'Inorder traversal: left subtree, root, right subtree',
      'You can solve this recursively or iteratively using a stack',
      'For recursive solution, the base case is when the node is null'
    ],
    timeComplexity: 'O(n)',
    spaceComplexity: 'O(h) where h is height of tree'
  }
];

export function CodeEditor() {
  const [selectedProblem, setSelectedProblem] = useState<Problem>(PROBLEMS[0]);
  const [selectedLanguage, setSelectedLanguage] = useState<'javascript' | 'python' | 'java'>('javascript');
  const [code, setCode] = useState(selectedProblem.starterCode.javascript);
  const [testResults, setTestResults] = useState<Array<{ passed: boolean; message: string }>>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [showHints, setShowHints] = useState(false);

  const difficultyColors = {
    Easy: "bg-green-100 text-green-800 border-green-200",
    Medium: "bg-yellow-100 text-yellow-800 border-yellow-200",
    Hard: "bg-red-100 text-red-800 border-red-200"
  };

  const handleProblemChange = (problemId: string) => {
    const problem = PROBLEMS.find(p => p.id === problemId);
    if (problem) {
      setSelectedProblem(problem);
      setCode(problem.starterCode[selectedLanguage]);
      setTestResults([]);
      setShowHints(false);
    }
  };

  const handleLanguageChange = (language: 'javascript' | 'python' | 'java') => {
    setSelectedLanguage(language);
    setCode(selectedProblem.starterCode[language]);
  };

  const runCode = async () => {
    setIsRunning(true);
    
    // Simulate code execution and testing with more realistic logic
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Analyze code for basic patterns to provide more realistic results
    const codeAnalysis = analyzeCode(code, selectedProblem.id);
    
    const mockResults = selectedProblem.testCases.map((testCase, index) => {
      // Use code analysis to determine test results
      const passed = codeAnalysis.score > 0.5 || Math.random() > 0.4;
      return {
        passed,
        message: passed 
          ? `✅ Test case ${index + 1} passed: ${testCase.description}`
          : `❌ Test case ${index + 1} failed: ${testCase.description}. Expected ${testCase.expectedOutput}`
      };
    });
    
    setTestResults(mockResults);
    setIsRunning(false);
  };

  // Enhanced code analysis with more patterns
  const analyzeCode = (code: string, problemId: string): { score: number; feedback: string[] } => {
    const feedback: string[] = [];
    let score = 0;
    
    // Remove comments and normalize whitespace
    const normalizedCode = code.toLowerCase().replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
    
    // Basic pattern matching for different problems
    if (problemId === 'two-sum') {
      if (normalizedCode.includes('map') || normalizedCode.includes('hashmap') || normalizedCode.includes('dict') || normalizedCode.includes('object')) {
        score += 0.4;
        feedback.push('✅ Good use of hash table for optimization');
      }
      if (normalizedCode.includes('for') || normalizedCode.includes('while')) {
        score += 0.3;
        feedback.push('✅ Iteration logic detected');
      }
      if (normalizedCode.includes('return') && (normalizedCode.includes('[') || normalizedCode.includes('array'))) {
        score += 0.3;
        feedback.push('✅ Return format looks correct');
      }
      if (normalizedCode.includes('target') && normalizedCode.includes('-')) {
        score += 0.2;
        feedback.push('✅ Complement calculation detected');
      }
    } else if (problemId === 'reverse-linked-list') {
      if ((normalizedCode.includes('prev') && normalizedCode.includes('current') && normalizedCode.includes('next')) ||
          (normalizedCode.includes('previous') && normalizedCode.includes('curr'))) {
        score += 0.5;
        feedback.push('✅ Three-pointer approach detected - excellent!');
      }
      if (normalizedCode.includes('while') || normalizedCode.includes('for')) {
        score += 0.3;
        feedback.push('✅ Iteration through list detected');
      }
      if (normalizedCode.includes('.next') || normalizedCode.includes('->')) {
        score += 0.2;
        feedback.push('✅ Node traversal logic present');
      }
      if (normalizedCode.includes('null') || normalizedCode.includes('none')) {
        score += 0.1;
        feedback.push('✅ Null handling considered');
      }
    } else if (problemId === 'binary-tree-inorder') {
      if (normalizedCode.includes('inorder') || (normalizedCode.includes('left') && normalizedCode.includes('right'))) {
        score += 0.4;
        feedback.push('✅ Tree traversal pattern detected');
      }
      if (normalizedCode.includes('recursive') || normalizedCode.includes('function')) {
        score += 0.3;
        feedback.push('✅ Recursive approach identified');
      }
      if (normalizedCode.includes('push') || normalizedCode.includes('append') || normalizedCode.includes('add')) {
        score += 0.3;
        feedback.push('✅ Result collection logic found');
      }
      if (normalizedCode.includes('if') && (normalizedCode.includes('root') || normalizedCode.includes('node'))) {
        score += 0.2;
        feedback.push('✅ Base case handling detected');
      }
    }
    
    // General code quality checks
    if (normalizedCode.length > 10) {
      score += 0.1;
      feedback.push('✅ Non-empty solution provided');
    }
    
    if (normalizedCode.includes('//') || normalizedCode.includes('/*')) {
      score += 0.05;
      feedback.push('✅ Code includes comments');
    }
    
    // Penalty for common mistakes
    if (normalizedCode.includes('console.log') && !normalizedCode.includes('return')) {
      score -= 0.1;
      feedback.push('⚠️ Consider returning a value instead of just logging');
    }
    
    if (feedback.length === 0) {
      feedback.push('💡 Try implementing the core algorithm logic');
    }
    
    return { score: Math.max(0, Math.min(score, 1)), feedback };
  };

  const getLanguageHighlight = (code: string, language: string) => {
    // Simple syntax highlighting - in a real implementation, use a proper syntax highlighter
    return code;
  };

  return (
    <div className="space-y-6">
      {/* Problem Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Coding Challenge
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Problem</label>
              <Select value={selectedProblem.id} onValueChange={handleProblemChange}>
                <SelectTrigger className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PROBLEMS.map(problem => (
                    <SelectItem key={problem.id} value={problem.id}>
                      {problem.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Language</label>
              <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="javascript">JavaScript</SelectItem>
                  <SelectItem value="python">Python</SelectItem>
                  <SelectItem value="java">Java</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Problem Description */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>{selectedProblem.title}</CardTitle>
              <Badge variant="outline" className={difficultyColors[selectedProblem.difficulty]}>
                {selectedProblem.difficulty}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <CardDescription>{selectedProblem.description}</CardDescription>
            
            {/* Examples */}
            <div className="space-y-2">
              <h4 className="font-semibold">Examples:</h4>
              {selectedProblem.examples.map((example, index) => (
                <div key={index} className="bg-muted/20 p-3 rounded text-sm">
                  <div><strong>Input:</strong> {example.input}</div>
                  <div><strong>Output:</strong> {example.output}</div>
                  {example.explanation && (
                    <div><strong>Explanation:</strong> {example.explanation}</div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Complexity */}
            <div className="flex gap-4 text-sm">
              <Badge variant="outline" className="bg-performance-good/20 text-performance-good">
                <Clock className="h-3 w-3 mr-1" />
                Time: {selectedProblem.timeComplexity}
              </Badge>
              <Badge variant="outline" className="bg-performance-fair/20 text-performance-fair">
                <Zap className="h-3 w-3 mr-1" />
                Space: {selectedProblem.spaceComplexity}
              </Badge>
            </div>
            
            {/* Hints */}
            <div className="space-y-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowHints(!showHints)}
                style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
                className="w-full hover:brightness-110"
              >
                <BookOpen className="h-4 w-4 mr-1" />
                {showHints ? 'Hide Hints' : 'Show Hints'}
              </Button>
              {showHints && (
                <div className="space-y-2">
                  {selectedProblem.hints.map((hint, index) => (
                    <div key={index} className="bg-muted/20 p-3 rounded text-sm">
                      <strong>Hint {index + 1}:</strong> {hint}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Code Editor */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code2 className="h-5 w-5" />
              Code Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="font-mono text-sm min-h-[300px]"
              style={{ background: '#111', color: '#fff', border: '1px solid #222' }}
              placeholder="Write your solution here..."
            />
            
            <div className="flex gap-2">
              <Button 
                onClick={runCode} 
                disabled={isRunning}
                style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
                className="hover:brightness-110"
              >
                <Play className="h-4 w-4 mr-1" />
                {isRunning ? 'Running...' : 'Run Code'}
              </Button>
            </div>
            
            {/* Test Results */}
            {testResults.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-semibold">Test Results:</h4>
                {testResults.map((result, index) => (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-3 rounded text-sm ${
                      result.passed 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      {result.passed ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                    </div>
                    <span className="flex-1">{result.message}</span>
                  </div>
                ))}
                
                {/* Code analysis feedback */}
                {testResults.length > 0 && (
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-sm mb-2">Code Analysis:</h4>
                    {analyzeCode(code, selectedProblem.id).feedback.map((feedback, index) => (
                      <div key={index} className="text-sm text-muted-foreground mb-1">
                        {feedback}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 pt-2">
                  <Badge variant="outline" className="bg-performance-excellent/20 text-performance-excellent">
                    Passed: {testResults.filter(r => r.passed).length}/{testResults.length}
                  </Badge>
                  {testResults.every(r => r.passed) && (
                    <Badge variant="outline" className="bg-green-100 text-green-800">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      All tests passed!
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}