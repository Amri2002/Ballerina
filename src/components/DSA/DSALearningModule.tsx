import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { dsaService } from "@/services/dsaService";
import { 
  CheckCircle, 
  Play, 
  ArrowRight,
  BookOpen,
  Code2,
  Lightbulb,
  Target,
  Clock
} from "lucide-react";

interface LessonContent {
  title: string;
  content: string;
  codeExample?: string;
  visualization?: string;
}

interface Quiz {
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

interface ModuleData {
  id: string;
  title: string;
  description: string;
  estimatedTime: string;
  lessons: LessonContent[];
  quiz: Quiz[];
  practiceProblems: string[];
}

const DSA_MODULES: { [key: string]: ModuleData } = {
  'arrays-strings': {
    id: 'arrays-strings',
    title: 'Arrays & Strings',
    description: 'Master fundamental data structures with interactive manipulation',
    estimatedTime: '45 minutes',
    lessons: [
      {
        title: 'Introduction to Arrays',
        content: `Arrays are one of the most fundamental data structures in computer science. They store elements of the same type in contiguous memory locations, allowing for efficient access via indices.

**Key Properties:**
- Fixed size in most languages
- Constant time access O(1)
- Elements stored in contiguous memory
- Zero-based indexing

**Common Operations:**
- Access: O(1)
- Search: O(n)
- Insertion: O(n) worst case
- Deletion: O(n) worst case`,
        codeExample: `// Array Declaration and Initialization
let numbers = [1, 2, 3, 4, 5];
let names = new Array("Alice", "Bob", "Charlie");

// Accessing elements
console.log(numbers[0]); // 1
console.log(numbers[numbers.length - 1]); // 5

// Modifying elements
numbers[2] = 10; // [1, 2, 10, 4, 5]

// Common array methods
numbers.push(6);    // Add to end
numbers.pop();      // Remove from end
numbers.unshift(0); // Add to beginning
numbers.shift();    // Remove from beginning`
      },
      {
        title: 'String Manipulation',
        content: `Strings are sequences of characters and are essentially arrays of characters in many programming languages. Understanding string operations is crucial for many algorithmic problems.

**Key Concepts:**
- Immutability in many languages
- Character encoding (ASCII, Unicode)
- String concatenation and substring operations
- Pattern matching and searching

**Common String Operations:**
- Length: O(1) or O(n) depending on implementation
- Concatenation: O(n + m)
- Substring: O(n)
- Search: O(n*m) naive, O(n+m) with KMP`,
        codeExample: `// String Operations
let str = "Hello World";

// Basic operations
console.log(str.length);        // 11
console.log(str.charAt(0));     // 'H'
console.log(str.indexOf('o'));  // 4

// String methods
console.log(str.toUpperCase()); // "HELLO WORLD"
console.log(str.toLowerCase()); // "hello world"
console.log(str.substring(0, 5)); // "Hello"
console.log(str.split(' '));    // ["Hello", "World"]

// String concatenation
let greeting = "Hello" + " " + "World";
let template = \`Hello \${name}\`; // Template literals`
      },
      {
        title: 'Two Pointers Technique',
        content: `The two pointers technique is a powerful algorithmic approach used to solve array and string problems efficiently. It involves using two pointers that move through the data structure to find a solution.

**When to Use:**
- Finding pairs with a specific sum
- Removing duplicates
- Palindrome checking
- Merging sorted arrays

**Types:**
1. **Opposite Direction**: Start from both ends, move towards center
2. **Same Direction**: Both pointers move in the same direction (sliding window)

**Time Complexity**: Usually O(n) instead of O(n²)`,
        codeExample: `// Two Sum - Sorted Array
function twoSum(numbers, target) {
    let left = 0;
    let right = numbers.length - 1;
    
    while (left < right) {
        const sum = numbers[left] + numbers[right];
        
        if (sum === target) {
            return [left, right];
        } else if (sum < target) {
            left++;
        } else {
            right--;
        }
    }
    
    return [-1, -1];
}

// Palindrome Check
function isPalindrome(s) {
    let left = 0;
    let right = s.length - 1;
    
    while (left < right) {
        if (s[left] !== s[right]) {
            return false;
        }
        left++;
        right--;
    }
    
    return true;
}`
      }
    ],
    quiz: [
      {
        question: "What is the time complexity of accessing an element in an array by index?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 0,
        explanation: "Array access by index is O(1) because arrays store elements in contiguous memory locations, allowing direct calculation of memory address."
      },
      {
        question: "Which technique is most efficient for finding a pair of numbers that sum to a target in a sorted array?",
        options: ["Brute force", "Two pointers", "Binary search", "Hash table"],
        correctAnswer: 1,
        explanation: "Two pointers technique is most efficient for sorted arrays, providing O(n) time complexity compared to O(n²) brute force."
      },
      {
        question: "What is the worst-case time complexity for inserting an element at the beginning of an array?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 2,
        explanation: "Inserting at the beginning requires shifting all existing elements one position to the right, resulting in O(n) time complexity."
      }
    ],
    practiceProblems: [
      "Implement array rotation",
      "Find the maximum subarray sum",
      "Remove duplicates from sorted array",
      "Merge two sorted arrays"
    ]
  },
  'linked-lists': {
    id: 'linked-lists',
    title: 'Linked Lists',
    description: 'Explore dynamic data structures with pointer visualization',
    estimatedTime: '50 minutes',
    lessons: [
      {
        title: 'Introduction to Linked Lists',
        content: `Linked Lists are linear data structures where elements (nodes) are stored in sequence, but unlike arrays, they are not stored in contiguous memory locations. Each node contains data and a reference (or link) to the next node.

**Types of Linked Lists:**
- Singly Linked List: Each node points to the next node
- Doubly Linked List: Each node has pointers to both next and previous nodes
- Circular Linked List: Last node points back to the first node

**Advantages:**
- Dynamic size
- Efficient insertion/deletion at beginning: O(1)
- Memory allocated as needed

**Disadvantages:**
- No random access (must traverse from head)
- Extra memory for storing pointers
- Not cache-friendly due to non-contiguous memory`,
        codeExample: `// Node structure
class ListNode {
    constructor(val, next = null) {
        this.val = val;
        this.next = next;
    }
}

// Creating a linked list: 1 -> 2 -> 3 -> null
let head = new ListNode(1);
head.next = new ListNode(2);
head.next.next = new ListNode(3);

// Insert at beginning
function insertAtHead(head, val) {
    const newNode = new ListNode(val);
    newNode.next = head;
    return newNode;
}

// Traverse and print
function printList(head) {
    let current = head;
    const values = [];
    
    while (current !== null) {
        values.push(current.val);
        current = current.next;
    }
    
    console.log(values.join(' -> '));
}`
      },
      {
        title: 'Common Linked List Operations',
        content: `Understanding fundamental operations on linked lists is crucial for solving more complex problems. Let's explore the most common operations and their implementations.

**Basic Operations:**
1. **Insertion**: At head O(1), at tail O(n), at position O(n)
2. **Deletion**: At head O(1), at tail O(n), by value O(n)
3. **Search**: O(n) - must traverse from head
4. **Length**: O(n) - unless maintained separately

**Key Techniques:**
- Use dummy nodes to simplify edge cases
- Two-pointer technique for cycle detection
- Recursive approaches for reversal and merging`,
        codeExample: `// Insert at position
function insertAtPosition(head, val, position) {
    if (position === 0) {
        return insertAtHead(head, val);
    }
    
    let current = head;
    for (let i = 0; i < position - 1 && current; i++) {
        current = current.next;
    }
    
    if (current) {
        const newNode = new ListNode(val);
        newNode.next = current.next;
        current.next = newNode;
    }
    
    return head;
}

// Delete by value
function deleteByValue(head, val) {
    if (!head) return null;
    
    if (head.val === val) {
        return head.next;
    }
    
    let current = head;
    while (current.next && current.next.val !== val) {
        current = current.next;
    }
    
    if (current.next) {
        current.next = current.next.next;
    }
    
    return head;
}

// Find middle using two pointers
function findMiddle(head) {
    let slow = head;
    let fast = head;
    
    while (fast && fast.next) {
        slow = slow.next;
        fast = fast.next.next;
    }
    
    return slow;
}`
      }
    ],
    quiz: [
      {
        question: "What is the time complexity of inserting a node at the beginning of a linked list?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n²)"],
        correctAnswer: 0,
        explanation: "Insertion at the beginning only requires creating a new node and updating the head pointer, which takes constant time."
      },
      {
        question: "Which technique is commonly used to detect a cycle in a linked list?",
        options: ["Binary search", "Two pointers (Floyd's algorithm)", "Hash table", "Recursion"],
        correctAnswer: 1,
        explanation: "Floyd's cycle detection algorithm uses two pointers moving at different speeds - if there's a cycle, the fast pointer will eventually meet the slow pointer."
      }
    ],
    practiceProblems: [
      "Reverse a linked list",
      "Detect cycle in linked list",
      "Merge two sorted linked lists",
      "Remove nth node from end"
    ]
  },
  'stacks-queues': {
    id: 'stacks-queues',
    title: 'Stacks & Queues',
    description: 'LIFO and FIFO operations with real-time animations',
    estimatedTime: '40 minutes',
    lessons: [
      {
        title: 'Introduction to Stacks',
        content: `Stacks are linear data structures that follow the Last-In-First-Out (LIFO) principle. The last element added to the stack is the first one to be removed.

**Key Operations:**
- Push: Add an element to the top of the stack
- Pop: Remove and return the top element
- Peek/Top: View the top element without removing it
- isEmpty: Check if the stack is empty

**Time Complexities:**
- Push: O(1)
- Pop: O(1)
- Peek: O(1)
- Search: O(n)

**Common Implementations:**
- Array-based implementation
- Linked list-based implementation

**Applications:**
- Function call stack
- Expression evaluation
- Undo/Redo functionality
- Backtracking algorithms`,
        codeExample: `// Stack implementation using array
class Stack {
    constructor() {
        this.items = [];
    }
    
    push(element) {
        this.items.push(element);
    }
    
    pop() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.pop();
    }
    
    peek() {
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
}

// Usage
let stack = new Stack();
stack.push(10);
stack.push(20);
stack.push(30);
console.log(stack.pop()); // 30
console.log(stack.peek()); // 20`
      },
      {
        title: 'Introduction to Queues',
        content: `Queues are linear data structures that follow the First-In-First-Out (FIFO) principle. The first element added to the queue is the first one to be removed.

**Key Operations:**
- Enqueue: Add an element to the rear of the queue
- Dequeue: Remove and return the front element
- Front: View the front element without removing it
- Rear: View the last element without removing it
- isEmpty: Check if the queue is empty

**Time Complexities:**
- Enqueue: O(1)
- Dequeue: O(1) (with proper implementation)
- Front: O(1)
- Rear: O(1)

**Common Implementations:**
- Array-based implementation (circular queue)
- Linked list-based implementation

**Applications:**
- CPU scheduling
- Breadth-First Search (BFS)
- Print queue management
- Message queues`,
        codeExample: `// Queue implementation using array
class Queue {
    constructor() {
        this.items = [];
    }
    
    enqueue(element) {
        this.items.push(element);
    }
    
    dequeue() {
        if (this.isEmpty()) {
            return "Underflow";
        }
        return this.items.shift();
    }
    
    front() {
        if (this.isEmpty()) {
            return "No elements in Queue";
        }
        return this.items[0];
    }
    
    rear() {
        if (this.isEmpty()) {
            return "No elements in Queue";
        }
        return this.items[this.items.length - 1];
    }
    
    isEmpty() {
        return this.items.length === 0;
    }
    
    size() {
        return this.items.length;
    }
}

// Usage
let queue = new Queue();
queue.enqueue(10);
queue.enqueue(20);
queue.enqueue(30);
console.log(queue.dequeue()); // 10
console.log(queue.front()); // 20`
      },
      {
        title: 'Priority Queues and Deques',
        content: `Beyond basic queues, there are specialized queue variants that serve specific purposes:

**Priority Queue:**
- Elements are processed based on priority rather than insertion order
- Higher priority elements are dequeued first
- Implemented using heaps or balanced BSTs

**Deque (Double-Ended Queue):**
- Allows insertion and deletion from both ends
- Combines features of both stacks and queues
- Can be used as both FIFO and LIFO structures

**Circular Queue:**
- Fixed-size queue that reuses empty spaces
- Efficient memory utilization
- Prevents "false overflow" condition

**Time Complexities:**
- Priority Queue insertion: O(log n)
- Priority Queue extraction: O(log n)
- Deque operations: O(1)`,
        codeExample: `// Priority Queue implementation
class PriorityQueue {
    constructor() {
        this.heap = [];
    }
    
    enqueue(element, priority) {
        this.heap.push({element, priority});
        this.bubbleUp();
    }
    
    dequeue() {
        const min = this.heap[0];
        const end = this.heap.pop();
        if (this.heap.length > 0) {
            this.heap[0] = end;
            this.sinkDown();
        }
        return min;
    }
    
    bubbleUp() {
        let index = this.heap.length - 1;
        while (index > 0) {
            let parentIdx = Math.floor((index - 1) / 2);
            if (this.heap[parentIdx].priority <= this.heap[index].priority) break;
            [this.heap[parentIdx], this.heap[index]] = [this.heap[index], this.heap[parentIdx]];
            index = parentIdx;
        }
    }
    
    sinkDown() {
        let index = 0;
        const length = this.heap.length;
        while (true) {
            let leftChildIdx = 2 * index + 1;
            let rightChildIdx = 2 * index + 2;
            let swap = null;
            
            if (leftChildIdx < length) {
                if (this.heap[leftChildIdx].priority < this.heap[index].priority) {
                    swap = leftChildIdx;
                }
            }
            
            if (rightChildIdx < length) {
                if ((swap === null && this.heap[rightChildIdx].priority < this.heap[index].priority) ||
                    (swap !== null && this.heap[rightChildIdx].priority < this.heap[leftChildIdx].priority)) {
                    swap = rightChildIdx;
                }
            }
            
            if (swap === null) break;
            [this.heap[index], this.heap[swap]] = [this.heap[swap], this.heap[index]];
            index = swap;
        }
    }
}`
      }
    ],
    quiz: [
      {
        question: "Which principle does a Stack follow?",
        options: ["FIFO (First-In-First-Out)", "LIFO (Last-In-First-Out)", "Priority-based", "Random access"],
        correctAnswer: 1,
        explanation: "Stacks follow the LIFO (Last-In-First-Out) principle where the last element added is the first one to be removed."
      },
      {
        question: "What is the time complexity of enqueue and dequeue operations in a properly implemented queue?",
        options: ["O(1) for both", "O(n) for both", "O(1) for enqueue, O(n) for dequeue", "O(n) for enqueue, O(1) for dequeue"],
        correctAnswer: 0,
        explanation: "With a proper implementation (using linked lists or circular arrays), both enqueue and dequeue operations can be performed in constant time O(1)."
      },
      {
        question: "Which data structure is typically used to implement a priority queue?",
        options: ["Array", "Linked List", "Heap", "Hash Table"],
        correctAnswer: 2,
        explanation: "Priority queues are typically implemented using heaps (binary heaps) which allow O(log n) time for both insertion and extraction of the highest priority element."
      }
    ],
    practiceProblems: [
      "Implement stack using queues",
      "Implement queue using stacks",
      "Next greater element using stack",
      "Sliding window maximum using deque"
    ]
  },
  'trees': {
    id: 'trees',
    title: 'Trees & BST',
    description: 'Binary trees, traversals, and search operations',
    estimatedTime: '60 minutes',
    lessons: [
      {
        title: 'Introduction to Trees',
        content: `Trees are hierarchical data structures consisting of nodes connected by edges. Unlike linear data structures, trees represent hierarchical relationships.

**Key Terminology:**
- Root: The topmost node
- Parent/Child: Relationship between connected nodes
- Leaf: Node with no children
- Depth: Number of edges from root to node
- Height: Number of edges on longest path from node to leaf

**Binary Tree:**
- Each node has at most two children (left and right)
- Used in many searching and sorting algorithms
- Foundation for more complex tree structures

**Types of Binary Trees:**
- Full Binary Tree: Every node has 0 or 2 children
- Complete Binary Tree: All levels are completely filled except possibly the last
- Perfect Binary Tree: All internal nodes have two children and all leaves are at same level
- Balanced Binary Tree: Height is O(log n)`,
        codeExample: `// Binary Tree Node
class TreeNode {
    constructor(val) {
        this.val = val;
        this.left = null;
        this.right = null;
    }
}

// Creating a binary tree
let root = new TreeNode(1);
root.left = new TreeNode(2);
root.right = new TreeNode(3);
root.left.left = new TreeNode(4);
root.left.right = new TreeNode(5);

// Tree Traversal - Inorder (Left, Root, Right)
function inorderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node === null) return;
        traverse(node.left);
        result.push(node.val);
        traverse(node.right);
    }
    
    traverse(root);
    return result;
}

console.log(inorderTraversal(root)); // [4, 2, 5, 1, 3]`
      },
      {
        title: 'Binary Search Trees (BST)',
        content: `Binary Search Trees (BSTs) are binary trees with a specific ordering property that makes searching efficient.

**BST Properties:**
- Left subtree of a node contains only nodes with keys lesser than the node's key
- Right subtree of a node contains only nodes with keys greater than the node's key
- Left and right subtrees must also be binary search trees
- No duplicate nodes (typically)

**Operations and Complexities:**
- Search: O(h) where h is height of tree
- Insertion: O(h)
- Deletion: O(h)
- In worst case (skewed tree): O(n)
- In balanced tree: O(log n)

**Advantages:**
- Efficient searching compared to arrays/linked lists
- Maintains elements in sorted order
- Flexible size`,
        codeExample: `// BST Implementation
class BST {
    constructor() {
        this.root = null;
    }
    
    insert(val) {
        const newNode = new TreeNode(val);
        
        if (this.root === null) {
            this.root = newNode;
            return this;
        }
        
        let current = this.root;
        while (true) {
            if (val === current.val) return undefined; // No duplicates
            if (val < current.val) {
                if (current.left === null) {
                    current.left = newNode;
                    return this;
                }
                current = current.left;
            } else {
                if (current.right === null) {
                    current.right = newNode;
                    return this;
                }
                current = current.right;
            }
        }
    }
    
    find(val) {
        if (this.root === null) return false;
        let current = this.root;
        
        while (current) {
            if (val === current.val) return true;
            if (val < current.val) {
                current = current.left;
            } else {
                current = current.right;
            }
        }
        return false;
    }
}

// Usage
let bst = new BST();
bst.insert(10);
bst.insert(5);
bst.insert(15);
bst.insert(2);
console.log(bst.find(5)); // true
console.log(bst.find(7)); // false`
      },
      {
        title: 'Tree Traversals and Applications',
        content: `Tree traversals are methods to visit all nodes in a tree in a specific order. Different traversals serve different purposes.

**Depth-First Traversals:**
1. Inorder (Left, Root, Right): Results in sorted order for BSTs
2. Preorder (Root, Left, Right): Useful for copying trees
3. Postorder (Left, Right, Root): Useful for deleting trees

**Breadth-First Traversal (Level Order):**
- Visits nodes level by level
- Implemented using queues
- Useful for finding shortest paths

**Applications:**
- Expression trees for mathematical expressions
- File system hierarchy representation
- Database indexing
- Network routing algorithms`,
        codeExample: `// Tree Traversal Implementations
function preorderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node === null) return;
        result.push(node.val);
        traverse(node.left);
        traverse(node.right);
    }
    
    traverse(root);
    return result;
}

function postorderTraversal(root) {
    const result = [];
    
    function traverse(node) {
        if (node === null) return;
        traverse(node.left);
        traverse(node.right);
        result.push(node.val);
    }
    
    traverse(root);
    return result;
}

// Level Order (BFS) using queue
function levelOrderTraversal(root) {
    const result = [];
    if (root === null) return result;
    
    const queue = [root];
    
    while (queue.length > 0) {
        const levelSize = queue.length;
        const currentLevel = [];
        
        for (let i = 0; i < levelSize; i++) {
            const currentNode = queue.shift();
            currentLevel.push(currentNode.val);
            
            if (currentNode.left !== null) {
                queue.push(currentNode.left);
            }
            if (currentNode.right !== null) {
                queue.push(currentNode.right);
            }
        }
        
        result.push(currentLevel);
    }
    
    return result;
}`
      }
    ],
    quiz: [
      {
        question: "What is the time complexity of search operations in a balanced Binary Search Tree?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 1,
        explanation: "In a balanced BST, the height is logarithmic to the number of nodes (O(log n)), making search operations O(log n)."
      },
      {
        question: "Which traversal of a BST gives nodes in sorted order?",
        options: ["Preorder", "Inorder", "Postorder", "Level order"],
        correctAnswer: 1,
        explanation: "Inorder traversal (left, root, right) of a BST visits nodes in ascending order due to the BST property."
      },
      {
        question: "What is the maximum number of nodes in a binary tree of height h?",
        options: ["2^h", "2^h - 1", "2^(h+1) - 1", "h^2"],
        correctAnswer: 2,
        explanation: "A perfect binary tree of height h has 2^(h+1) - 1 nodes. This represents the maximum possible nodes."
      }
    ],
    practiceProblems: [
      "Validate Binary Search Tree",
      "Find lowest common ancestor in BST",
      "Convert sorted array to balanced BST",
      "Find kth smallest element in BST"
    ]
  },
  'graphs': {
    id: 'graphs',
    title: 'Graphs & Traversals',
    description: 'BFS, DFS, and shortest path algorithms with visualization',
    estimatedTime: '70 minutes',
    lessons: [
      {
        title: 'Introduction to Graphs',
        content: `Graphs are non-linear data structures consisting of nodes (vertices) and connections (edges) between them. Graphs model relationships and networks.

**Graph Terminology:**
- Vertex (Node): Fundamental unit of the graph
- Edge: Connection between two vertices
- Directed vs Undirected: Edges with or without direction
- Weighted vs Unweighted: Edges with or without weights
- Path: Sequence of vertices connected by edges
- Cycle: Path that starts and ends at same vertex

**Graph Representations:**
1. Adjacency Matrix: 2D array where matrix[i][j] = 1 indicates edge from i to j
2. Adjacency List: Array of lists where each list stores neighbors of a vertex
3. Edge List: List of all edges

**Applications:**
- Social networks
- Transportation networks
- Web page linking
- Recommendation systems`,
        codeExample: `// Graph implementation using adjacency list
class Graph {
    constructor() {
        this.adjacencyList = {};
    }
    
    addVertex(vertex) {
        if (!this.adjacencyList[vertex]) {
            this.adjacencyList[vertex] = [];
        }
    }
    
    addEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1].push(vertex2);
        this.adjacencyList[vertex2].push(vertex1); // For undirected graph
    }
    
    removeEdge(vertex1, vertex2) {
        this.adjacencyList[vertex1] = this.adjacencyList[vertex1].filter(
            v => v !== vertex2
        );
        this.adjacencyList[vertex2] = this.adjacencyList[vertex2].filter(
            v => v !== vertex1
        );
    }
    
    removeVertex(vertex) {
        while (this.adjacencyList[vertex].length) {
            const adjacentVertex = this.adjacencyList[vertex].pop();
            this.removeEdge(vertex, adjacentVertex);
        }
        delete this.adjacencyList[vertex];
    }
}

// Usage
let graph = new Graph();
graph.addVertex("A");
graph.addVertex("B");
graph.addVertex("C");
graph.addEdge("A", "B");
graph.addEdge("A", "C");
graph.addEdge("B", "C");`
      },
      {
        title: 'Graph Traversals: BFS and DFS',
        content: `Graph traversal algorithms visit all vertices of a graph in a systematic way. The two fundamental traversals are Breadth-First Search (BFS) and Depth-First Search (DFS).

**Breadth-First Search (BFS):**
- Explores graph level by level
- Uses queue data structure
- Finds shortest path in unweighted graphs
- Time Complexity: O(V + E)

**Depth-First Search (DFS):**
- Explores as far as possible along each branch before backtracking
- Uses stack data structure (recursion or iterative)
- Useful for cycle detection, topological sorting
- Time Complexity: O(V + E)

**Applications:**
- BFS: Shortest path, peer-to-peer networks
- DFS: Maze solving, connected components`,
        codeExample: `// BFS Implementation
function BFS(graph, start) {
    const queue = [start];
    const result = [];
    const visited = {};
    visited[start] = true;
    
    while (queue.length) {
        const currentVertex = queue.shift();
        result.push(currentVertex);
        
        graph.adjacencyList[currentVertex].forEach(neighbor => {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                queue.push(neighbor);
            }
        });
    }
    
    return result;
}

// DFS Implementation (Recursive)
function DFS(graph, start) {
    const result = [];
    const visited = {};
    
    (function dfs(vertex) {
        if (!vertex) return null;
        visited[vertex] = true;
        result.push(vertex);
        
        graph.adjacencyList[vertex].forEach(neighbor => {
            if (!visited[neighbor]) {
                return dfs(neighbor);
            }
        });
    })(start);
    
    return result;
}

// DFS Implementation (Iterative)
function DFSIterative(graph, start) {
    const stack = [start];
    const result = [];
    const visited = {};
    visited[start] = true;
    
    while (stack.length) {
        const currentVertex = stack.pop();
        result.push(currentVertex);
        
        graph.adjacencyList[currentVertex].forEach(neighbor => {
            if (!visited[neighbor]) {
                visited[neighbor] = true;
                stack.push(neighbor);
            }
        });
    }
    
    return result;
}`
      },
      {
        title: 'Shortest Path Algorithms',
        content: `Shortest path algorithms find the path between two vertices with the minimum total edge weight.

**Dijkstra's Algorithm:**
- Finds shortest path from single source to all other vertices
- Works for weighted graphs with non-negative weights
- Uses priority queue for efficient implementation
- Time Complexity: O((V + E) log V) with priority queue

**Bellman-Ford Algorithm:**
- Handles negative weight edges
- Detects negative weight cycles
- Slower than Dijkstra: O(V * E)

**Floyd-Warshall Algorithm:**
- Finds shortest paths between all pairs of vertices
- Works with negative weights (no negative cycles)
- Time Complexity: O(V³)

**A* Algorithm:**
- Informed search algorithm using heuristics
- Efficient for pathfinding in games and maps`,
        codeExample: `// Dijkstra's Algorithm
function dijkstra(graph, start) {
    const distances = {};
    const priorityQueue = new PriorityQueue();
    const previous = {};
    
    // Initialize distances
    for (let vertex in graph.adjacencyList) {
        if (vertex === start) {
            distances[vertex] = 0;
            priorityQueue.enqueue(vertex, 0);
        } else {
            distances[vertex] = Infinity;
            priorityQueue.enqueue(vertex, Infinity);
        }
        previous[vertex] = null;
    }
    
    while (!priorityQueue.isEmpty()) {
        const smallest = priorityQueue.dequeue().element;
        
        if (smallest || distances[smallest] !== Infinity) {
            for (let neighbor in graph.adjacencyList[smallest]) {
                // Find neighboring node
                let nextNode = graph.adjacencyList[smallest][neighbor];
                // Calculate new distance to neighboring node
                let candidate = distances[smallest] + nextNode.weight;
                let nextNeighbor = nextNode.node;
                
                if (candidate < distances[nextNeighbor]) {
                    // Updating new smallest distance to neighbor
                    distances[nextNeighbor] = candidate;
                    // Updating previous - How we got to neighbor
                    previous[nextNeighbor] = smallest;
                    // Enqueue in priority queue with new priority
                    priorityQueue.enqueue(nextNeighbor, candidate);
                }
            }
        }
    }
    
    return distances;
}`
      }
    ],
    quiz: [
      {
        question: "Which data structure is typically used for BFS implementation?",
        options: ["Stack", "Queue", "Priority Queue", "Heap"],
        correctAnswer: 1,
        explanation: "BFS uses a queue to process nodes in the order they were discovered (FIFO), exploring all neighbors at the current depth before moving deeper."
      },
      {
        question: "What is the time complexity of BFS and DFS on a graph?",
        options: ["O(V)", "O(E)", "O(V + E)", "O(V * E)"],
        correctAnswer: 2,
        explanation: "Both BFS and DFS have time complexity of O(V + E) where V is number of vertices and E is number of edges, as each vertex and edge is visited once."
      },
      {
        question: "Which algorithm is most efficient for finding shortest paths in graphs with non-negative weights?",
        options: ["Bellman-Ford", "Dijkstra's", "Floyd-Warshall", "A* Search"],
        correctAnswer: 1,
        explanation: "Dijkstra's algorithm is most efficient for graphs with non-negative weights, with time complexity of O((V + E) log V) using a priority queue."
      }
    ],
    practiceProblems: [
      "Implement graph traversal algorithms",
      "Find shortest path using Dijkstra",
      "Detect cycle in directed graph",
      "Find connected components in undirected graph"
    ]
  },
  'sorting': {
    id: 'sorting',
    title: 'Sorting Algorithms',
    description: 'Compare bubble, merge, quick sort with performance analysis',
    estimatedTime: '55 minutes',
    lessons: [
      {
        title: 'Basic Sorting Algorithms',
        content: `Sorting algorithms arrange elements of a list in a particular order (usually ascending or descending). Understanding different sorting approaches is fundamental to algorithm design.

**Comparison-Based Sorts:**
- Bubble Sort: Repeatedly swaps adjacent elements if in wrong order
- Selection Sort: Finds minimum element and places it at beginning
- Insertion Sort: Builds sorted array one item at a time

**Time Complexities:**
- Bubble Sort: O(n²) worst and average, O(n) best (optimized)
- Selection Sort: O(n²) all cases
- Insertion Sort: O(n²) worst and average, O(n) best

**When to Use:**
- Small datasets: Insertion sort (efficient for small n)
- Nearly sorted data: Insertion sort (approaches O(n))
- Educational purposes: All three help understand sorting concepts`,
        codeExample: `// Bubble Sort
function bubbleSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let swapped = false;
        for (let j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
                swapped = true;
            }
        }
        if (!swapped) break; // Optimization for nearly sorted arrays
    }
    return arr;
}

// Selection Sort
function selectionSort(arr) {
    let n = arr.length;
    for (let i = 0; i < n - 1; i++) {
        let minIdx = i;
        for (let j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
    }
    return arr;
}

// Insertion Sort
function insertionSort(arr) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;
        
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }
    return arr;
}`
      },
      {
        title: 'Efficient Sorting Algorithms',
        content: `Efficient sorting algorithms use divide-and-conquer or other advanced techniques to achieve better time complexity than basic O(n²) sorts.

**Merge Sort:**
- Divide-and-conquer algorithm
- Recursively divides array, sorts subarrays, then merges them
- Stable sort (preserves order of equal elements)
- Time Complexity: O(n log n) all cases
- Space Complexity: O(n)

**Quick Sort:**
- Divide-and-conquer with partitioning
- Chooses pivot, partitions array around pivot, recursively sorts partitions
- Not stable, but can be implemented as stable
- Time Complexity: O(n log n) average, O(n²) worst case
- Space Complexity: O(log n) for recursion

**Heap Sort:**
- Uses heap data structure to sort elements
- Not stable
- Time Complexity: O(n log n) all cases
- Space Complexity: O(1) if implemented carefully`,
        codeExample: `// Merge Sort
function mergeSort(arr) {
    if (arr.length <= 1) return arr;
    
    const mid = Math.floor(arr.length / 2);
    const left = mergeSort(arr.slice(0, mid));
    const right = mergeSort(arr.slice(mid));
    
    return merge(left, right);
}

function merge(left, right) {
    let result = [];
    let i = 0, j = 0;
    
    while (i < left.length && j < right.length) {
        if (left[i] < right[j]) {
            result.push(left[i]);
            i++;
        } else {
            result.push(right[j]);
            j++;
        }
    }
    
    return result.concat(left.slice(i)).concat(right.slice(j));
}

// Quick Sort
function quickSort(arr, low = 0, high = arr.length - 1) {
    if (low < high) {
        const pi = partition(arr, low, high);
        quickSort(arr, low, pi - 1);
        quickSort(arr, pi + 1, high);
    }
    return arr;
}

function partition(arr, low, high) {
    const pivot = arr[high];
    let i = low - 1;
    
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1;
}`
      },
      {
        title: 'Advanced Sorting and Comparison',
        content: `Beyond comparison-based sorts, there are non-comparison sorts that can achieve linear time complexity in specific scenarios.

**Non-Comparison Sorts:**
- Counting Sort: Counts occurrences of each element
- Radix Sort: Processes digits from least to most significant
- Bucket Sort: Distributes elements into buckets then sorts each

**Time Complexities:**
- Counting Sort: O(n + k) where k is range of input
- Radix Sort: O(d * (n + b)) where d is digits, b is base
- Bucket Sort: O(n) average when uniformly distributed

**Sorting Algorithm Comparison:**
- Stability: Merge, Insertion, Bubble are stable
- In-place: Quick, Heap, Insertion, Selection are in-place
- Adaptive: Insertion, Bubble perform well on nearly sorted data

**When to Use Which:**
- General purpose: Quick Sort (average case efficient)
- Stable requirement: Merge Sort
- Small data: Insertion Sort
- Integer sorting with limited range: Counting/Radix Sort`,
        codeExample: `// Counting Sort (for non-negative integers)
function countingSort(arr) {
    const max = Math.max(...arr);
    const count = new Array(max + 1).fill(0);
    const output = new Array(arr.length);
    
    // Store count of each element
    for (let i = 0; i < arr.length; i++) {
        count[arr[i]]++;
    }
    
    // Change count[i] to contain cumulative count
    for (let i = 1; i <= max; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (let i = arr.length - 1; i >= 0; i--) {
        output[count[arr[i]] - 1] = arr[i];
        count[arr[i]]--;
    }
    
    return output;
}

// Radix Sort (for non-negative integers)
function radixSort(arr) {
    const max = Math.max(...arr);
    
    // Do counting sort for every digit
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSortByDigit(arr, exp);
    }
    
    return arr;
}

function countingSortByDigit(arr, exp) {
    const output = new Array(arr.length);
    const count = new Array(10).fill(0);
    
    // Store count of occurrences
    for (let i = 0; i < arr.length; i++) {
        const digit = Math.floor(arr[i] / exp) % 10;
        count[digit]++;
    }
    
    // Change count to cumulative count
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
    }
    
    // Build output array
    for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor(arr[i] / exp) % 10;
        output[count[digit] - 1] = arr[i];
        count[digit]--;
    }
    
    // Copy output to original array
    for (let i = 0; i < arr.length; i++) {
        arr[i] = output[i];
    }
}`
      }
    ],
    quiz: [
      {
        question: "Which sorting algorithm has the best worst-case time complexity?",
        options: ["Quick Sort", "Bubble Sort", "Merge Sort", "Insertion Sort"],
        correctAnswer: 2,
        explanation: "Merge Sort has O(n log n) worst-case time complexity, while Quick Sort has O(n²) worst-case and the others have O(n²)."
      },
      {
        question: "Which sorting algorithm is typically the fastest in practice for general-purpose sorting?",
        options: ["Bubble Sort", "Merge Sort", "Quick Sort", "Selection Sort"],
        correctAnswer: 2,
        explanation: "Quick Sort is generally the fastest in practice due to good cache performance and average-case O(n log n) complexity, despite O(n²) worst-case."
      },
      {
        question: "Which of these is a non-comparison sorting algorithm?",
        options: ["Quick Sort", "Merge Sort", "Heap Sort", "Radix Sort"],
        correctAnswer: 3,
        explanation: "Radix Sort is a non-comparison sort that processes digits of numbers, allowing it to achieve O(n) time complexity in certain scenarios."
      }
    ],
    practiceProblems: [
      "Implement merge sort and quick sort",
      "Sort an array of 0s, 1s, and 2s (Dutch National Flag)",
      "Find the kth largest element in array",
      "Merge two sorted arrays"
    ]
  },
  'dynamic-programming': {
    id: 'dynamic-programming',
    title: 'Dynamic Programming',
    description: 'Memoization and tabulation with classic problems',
    estimatedTime: '80 minutes',
    lessons: [
      {
        title: 'Introduction to Dynamic Programming',
        content: `Dynamic Programming (DP) is a method for solving complex problems by breaking them down into simpler subproblems and storing their solutions to avoid redundant calculations.

**Key Characteristics:**
- Optimal substructure: Optimal solution can be constructed from optimal solutions of subproblems
- Overlapping subproblems: Problems can be broken down into subproblems which are reused several times

**Approaches:**
1. Top-down (Memoization): Recursive approach with caching of results
2. Bottom-up (Tabulation): Iterative approach building solutions from base cases

**When to Use DP:**
- Problems asking for maximum/minimum values
- Problems asking for number of ways to do something
- Problems that can be broken into overlapping subproblems

**Classic DP Problems:**
- Fibonacci numbers
- Knapsack problem
- Longest common subsequence
- Matrix chain multiplication`,
        codeExample: `// Fibonacci without DP (exponential time)
function fib(n) {
    if (n <= 1) return n;
    return fib(n - 1) + fib(n - 2);
}

// Fibonacci with memoization (top-down DP)
function fibMemo(n, memo = {}) {
    if (n in memo) return memo[n];
    if (n <= 1) return n;
    
    memo[n] = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
    return memo[n];
}

// Fibonacci with tabulation (bottom-up DP)
function fibTab(n) {
    if (n <= 1) return n;
    
    const dp = new Array(n + 1);
    dp[0] = 0;
    dp[1] = 1;
    
    for (let i = 2; i <= n; i++) {
        dp[i] = dp[i - 1] + dp[i - 2];
    }
    
    return dp[n];
}

console.log(fib(10));     // 55 (slow for large n)
console.log(fibMemo(100)); // 354224848179262000000 (fast)
console.log(fibTab(100));  // 354224848179262000000 (fast)`
      },
      {
        title: 'DP Techniques and Patterns',
        content: `Dynamic Programming problems often follow specific patterns that can be recognized and applied to various scenarios.

**Common DP Patterns:**
1. 0/1 Knapsack: Select items with weight and value to maximize value without exceeding capacity
2. Unbounded Knapsack: Items can be selected multiple times
3. Fibonacci Pattern: Current state depends on previous states
4. Longest Common Subsequence: Find longest sequence common to two sequences
5. Palindromic Subsequence: Find longest palindromic substring/subsequence
6. Matrix Chain Multiplication: Find optimal way to multiply matrices

**State Definition:**
- Identify what parameters define the state
- Determine the recurrence relation between states
- Establish base cases

**Space Optimization:**
- Often only previous states are needed, not entire table
- Can reduce space complexity significantly`,
        codeExample: `// 0/1 Knapsack Problem
function knapsack(weights, values, capacity) {
    const n = weights.length;
    const dp = new Array(n + 1).fill(0).map(() => new Array(capacity + 1).fill(0));
    
    for (let i = 1; i <= n; i++) {
        for (let w = 1; w <= capacity; w++) {
            if (weights[i - 1] <= w) {
                dp[i][w] = Math.max(
                    values[i - 1] + dp[i - 1][w - weights[i - 1]],
                    dp[i - 1][w]
                );
            } else {
                dp[i][w] = dp[i - 1][w];
            }
        }
    }
    
    return dp[n][capacity];
}

// Longest Common Subsequence
function LCS(text1, text2) {
    const m = text1.length, n = text2.length;
    const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (text1[i - 1] === text2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1] + 1;
            } else {
                dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
            }
        }
    }
    
    return dp[m][n];
}

// Space optimized knapsack (1D array)
function knapsackOptimized(weights, values, capacity) {
    const dp = new Array(capacity + 1).fill(0);
    
    for (let i = 0; i < weights.length; i++) {
        for (let w = capacity; w >= weights[i]; w--) {
            dp[w] = Math.max(dp[w], values[i] + dp[w - weights[i]]);
        }
    }
    
    return dp[capacity];
}`
      },
      {
        title: 'Advanced DP Problems and Applications',
        content: `Advanced Dynamic Programming problems involve more complex state definitions and recurrence relations, often requiring multidimensional DP tables.

**Advanced Problem Types:**
- DP on trees: Solve problems on tree structures using DP
- DP with bitmasking: Represent states using bit masks for subset problems
- DP with probability: Handle problems involving probabilities and expectations
- DP with data structures: Optimize using segment trees or other structures

**Problem Solving Approach:**
1. Identify if problem has optimal substructure and overlapping subproblems
2. Define state and state transition (recurrence relation)
3. Determine base cases
4. Implement using memoization or tabulation
5. Optimize space if possible

**Common Optimizations:**
- State space reduction
- Sliding window optimization
- Convex hull trick
- Knuth's optimization

**Real-world Applications:**
- Resource allocation
- Scheduling problems
- Bioinformatics (sequence alignment)
- Game theory`,
        codeExample: `// Coin Change (number of ways)
function coinChange(coins, amount) {
    const dp = new Array(amount + 1).fill(0);
    dp[0] = 1;
    
    for (const coin of coins) {
        for (let i = coin; i <= amount; i++) {
            dp[i] += dp[i - coin];
        }
    }
    
    return dp[amount];
}

// Edit Distance
function minDistance(word1, word2) {
    const m = word1.length, n = word2.length;
    const dp = new Array(m + 1).fill(0).map(() => new Array(n + 1).fill(0));
    
    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;
    
    for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
            if (word1[i - 1] === word2[j - 1]) {
                dp[i][j] = dp[i - 1][j - 1];
            } else {
                dp[i][j] = 1 + Math.min(
                    dp[i - 1][j],    // Delete
                    dp[i][j - 1],    // Insert
                    dp[i - 1][j - 1] // Replace
                );
            }
        }
    }
    
    return dp[m][n];
}

// Matrix Chain Multiplication
function matrixChainOrder(p) {
    const n = p.length - 1;
    const dp = new Array(n).fill(0).map(() => new Array(n).fill(0));
    
    for (let l = 2; l <= n; l++) {
        for (let i = 0; i < n - l + 1; i++) {
            const j = i + l - 1;
            dp[i][j] = Infinity;
            
            for (let k = i; k < j; k++) {
                const cost = dp[i][k] + dp[k + 1][j] + p[i] * p[k + 1] * p[j + 1];
                if (cost < dp[i][j]) {
                    dp[i][j] = cost;
                }
            }
        }
    }
    
    return dp[0][n - 1];
}`
      }
    ],
    quiz: [
      {
        question: "What are the two main properties a problem must have to be solved with Dynamic Programming?",
        options: [
          "Optimal substructure and overlapping subproblems",
          "Linear time and constant space",
          "Recursive structure and sorted input",
          "Greedy choice and matroid structure"
        ],
        correctAnswer: 0,
        explanation: "Dynamic Programming requires optimal substructure (optimal solution can be constructed from optimal solutions of subproblems) and overlapping subproblems (subproblems are reused multiple times)."
      },
      {
        question: "What is the difference between memoization and tabulation in DP?",
        options: [
          "Memoization is top-down, tabulation is bottom-up",
          "Memoization uses arrays, tabulation uses recursion",
          "Memoization is for trees, tabulation is for graphs",
          "Memoization is faster, tabulation is slower"
        ],
        correctAnswer: 0,
        explanation: "Memoization is a top-down approach that uses recursion with caching, while tabulation is a bottom-up approach that iteratively builds solutions from base cases."
      },
      {
        question: "What is the time complexity of the 0/1 Knapsack problem with n items and capacity W?",
        options: ["O(n)", "O(n log n)", "O(nW)", "O(2^n)"],
        correctAnswer: 2,
        explanation: "The 0/1 Knapsack problem has O(nW) time complexity using dynamic programming, where n is the number of items and W is the capacity."
      }
    ],
    practiceProblems: [
      "Solve Fibonacci with DP",
      "Implement 0/1 Knapsack problem",
      "Find longest common subsequence",
      "Calculate edit distance between strings"
    ]
  },
  'hash-tables': {
    id: 'hash-tables',
    title: 'Hash Tables',
    description: 'Hash functions, collision resolution, and performance',
    estimatedTime: '45 minutes',
    lessons: [
      {
        title: 'Introduction to Hash Tables',
        content: `Hash Tables are data structures that implement associative arrays, mapping keys to values using a hash function. They provide average O(1) time complexity for search, insert, and delete operations.

**Key Components:**
- Hash Function: Maps keys to array indices
- Array: Stores key-value pairs
- Collision Resolution: Handles cases where multiple keys hash to same index

**Hash Function Properties:**
- Deterministic: Same key always produces same hash
- Uniform distribution: Keys distributed evenly across array
- Efficient: Computationally inexpensive to calculate

**Performance:**
- Average case: O(1) for all operations
- Worst case: O(n) if many collisions occur
- Load factor: Ratio of entries to array size (should be kept low)`,
        codeExample: `// Simple Hash Table Implementation
class HashTable {
    constructor(size = 53) {
        this.keyMap = new Array(size);
    }
    
    _hash(key) {
        let total = 0;
        let WEIRD_PRIME = 31;
        
        for (let i = 0; i < Math.min(key.length, 100); i++) {
            let char = key[i];
            let value = char.charCodeAt(0) - 96;
            total = (total * WEIRD_PRIME + value) % this.keyMap.length;
        }
        
        return total;
    }
    
    set(key, value) {
        let index = this._hash(key);
        if (!this.keyMap[index]) {
            this.keyMap[index] = [];
        }
        this.keyMap[index].push([key, value]);
    }
    
    get(key) {
        let index = this._hash(key);
        if (this.keyMap[index]) {
            for (let i = 0; i < this.keyMap[index].length; i++) {
                if (this.keyMap[index][i][0] === key) {
                    return this.keyMap[index][i][1];
                }
            }
        }
        return undefined;
    }
}

// Usage
let ht = new HashTable();
ht.set("hello", "world");
ht.set("goodbye", "moon");
console.log(ht.get("hello")); // "world"`
      },
      {
        title: 'Collision Resolution Techniques',
        content: `Collisions occur when different keys hash to the same index. Various techniques exist to handle collisions effectively.

**Separate Chaining:**
- Store multiple key-value pairs at each index (using arrays, linked lists, or trees)
- Simple to implement
- Handles arbitrary number of collisions
- Requires additional memory for pointers

**Open Addressing:**
- Store all elements in the hash table array itself
- When collision occurs, find next available slot using probing sequence
- Types: Linear probing, Quadratic probing, Double hashing

**Linear Probing:**
- Check next slot sequentially: (hash(key) + i) % size
- Simple to implement
- Can lead to primary clustering (long contiguous occupied slots)

**Quadratic Probing:**
- Check slots using quadratic function: (hash(key) + i²) % size
- Reduces primary clustering
- May not find empty slot even if one exists

**Double Hashing:**
- Use second hash function: (hash1(key) + i * hash2(key)) % size
- Reduces both primary and secondary clustering
- More computationally expensive`,
        codeExample: `// Hash Table with Linear Probing
class HashTableLinear {
    constructor(size = 53) {
        this.keyMap = new Array(size);
    }
    
    _hash(key) {
        let total = 0;
        let WEIRD_PRIME = 31;
        
        for (let i = 0; i < Math.min(key.length, 100); i++) {
            let char = key[i];
            let value = char.charCodeAt(0) - 96;
            total = (total * WEIRD_PRIME + value) % this.keyMap.length;
        }
        
        return total;
    }
    
    set(key, value) {
        let index = this._hash(key);
        
        while (this.keyMap[index] !== undefined && this.keyMap[index][0] !== key) {
            index = (index + 1) % this.keyMap.length;
        }
        
        this.keyMap[index] = [key, value];
    }
    
    get(key) {
        let index = this._hash(key);
        let startIndex = index;
        
        while (this.keyMap[index] !== undefined) {
            if (this.keyMap[index][0] === key) {
                return this.keyMap[index][1];
            }
            index = (index + 1) % this.keyMap.length;
            
            // If we've come full circle, key doesn't exist
            if (index === startIndex) break;
        }
        
        return undefined;
    }
}

// Usage
let ht = new HashTableLinear();
ht.set("hello", "world");
ht.set("goodbye", "moon");
console.log(ht.get("hello")); // "world"`
      },
      {
        title: 'Advanced Hashing and Applications',
        content: `Hash tables have evolved with advanced techniques and optimizations for specific use cases and performance requirements.

**Perfect Hashing:**
- Hash function that maps distinct elements to distinct slots
- No collisions
- Possible when all keys are known in advance
- Used in applications requiring worst-case O(1) access

**Cuckoo Hashing:**
- Uses two hash functions and two tables
- If collision occurs, evict existing item and reinsert it using other hash function
- Guaranteed O(1) worst-case lookup time
- Complex insertion process

**Bloom Filters:**
- Space-efficient probabilistic data structure
- Tests whether an element is a member of a set
- May have false positives but no false negatives
- Uses multiple hash functions

**Consistent Hashing:**
- Special hashing technique used in distributed systems
- Minimizes reorganization when hash table size changes
- Used in load balancing and distributed caching

**Real-world Applications:**
- Database indexing
- Caching systems (Redis, Memcached)
- Symbol tables in compilers
- Document similarity detection
- Cryptography`,
        codeExample: `// Simple Bloom Filter Implementation
class BloomFilter {
    constructor(size = 100) {
        this.size = size;
        this.storage = new Array(size).fill(false);
    }
    
    _hash1(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) + hash + str.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
            hash = Math.abs(hash);
        }
        return hash % this.size;
    }
    
    _hash2(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) + hash + str.charCodeAt(i);
        }
        return Math.abs(hash % this.size);
    }
    
    _hash3(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            hash = (hash << 5) - hash;
            hash += str.charCodeAt(i);
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash % this.size);
    }
    
    add(str) {
        this.storage[this._hash1(str)] = true;
        this.storage[this._hash2(str)] = true;
        this.storage[this._hash3(str)] = true;
    }
    
    contains(str) {
        return this.storage[this._hash1(str)] &&
               this.storage[this._hash2(str)] &&
               this.storage[this._hash3(str)];
    }
}

// Usage
let filter = new BloomFilter();
filter.add("hello");
filter.add("world");
console.log(filter.contains("hello")); // true
console.log(filter.contains("unknown")); // false (or true with small probability)`
      }
    ],
    quiz: [
      {
        question: "What is the average time complexity of search, insert, and delete operations in a hash table?",
        options: ["O(1)", "O(log n)", "O(n)", "O(n log n)"],
        correctAnswer: 0,
        explanation: "Hash tables provide average O(1) time complexity for basic operations when the hash function distributes keys uniformly and load factor is kept low."
      },
      {
        question: "Which collision resolution technique uses linked lists to store multiple items at each array index?",
        options: ["Linear probing", "Quadratic probing", "Separate chaining", "Double hashing"],
        correctAnswer: 2,
        explanation: "Separate chaining handles collisions by storing multiple key-value pairs at each array index, typically using linked lists or other data structures."
      },
      {
        question: "What is the recommended maximum load factor for a hash table using separate chaining?",
        options: ["0.5", "0.7", "1.0", "2.0"],
        correctAnswer: 1,
        explanation: "A load factor of 0.7 is commonly used as a threshold for resizing hash tables with separate chaining to maintain good performance."
      }
    ],
    practiceProblems: [
      "Implement hash table with separate chaining",
      "Implement hash table with linear probing",
      "Count frequency of words in text",
      "Find first non-repeating character in string"
    ]
  }
};

interface Props {
  moduleId: string;
  onComplete: () => void;
}

export function DSALearningModule({ moduleId, onComplete }: Props) {
  const [currentLesson, setCurrentLesson] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>([]);
  const [showQuizResults, setShowQuizResults] = useState(false);
  const [moduleCompleted, setModuleCompleted] = useState(false);

  const module = DSA_MODULES[moduleId];

  useEffect(() => {
    // Check if module is already completed
    const checkModuleCompletion = async () => {
      try {
        const progress = await dsaService.getUserProgress();
        if (progress.completedModules.includes(moduleId)) {
          setModuleCompleted(true);
        }
      } catch (error) {
        console.error('Failed to check module completion:', error);
      }
    };
    checkModuleCompletion();
  }, [moduleId]);

  if (!module) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <h3 className="text-xl font-semibold mb-2">Module not found</h3>
          <p className="text-muted-foreground">The requested module could not be loaded.</p>
        </CardContent>
      </Card>
    );
  }

  const progress = ((currentLesson + 1) / (module.lessons.length + 1)) * 100;

  const handleQuizSubmit = () => {
    setShowQuizResults(true);
    const correctAnswers = quizAnswers.filter((answer, index) =>
      answer === module.quiz[index].correctAnswer
    ).length;
    if (correctAnswers >= module.quiz.length * 0.7) {
      setModuleCompleted(true);
    }
  };

  // Complete module and save progress
  const handleComplete = async () => {
    try {
      await dsaService.markModuleCompleted(moduleId);
      onComplete();
    } catch (error) {
      console.error('Failed to save completion:', error);
      onComplete();
    }
  };

  return (
    <div className="space-y-6">
      {/* Module Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl">{module.title}</CardTitle>
              <CardDescription>{module.description}</CardDescription>
            </div>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {module.estimatedTime}
            </Badge>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      <Tabs defaultValue="lessons" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
        </TabsList>

        {/* Lessons Tab */}
        <TabsContent value="lessons" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                {module.lessons[currentLesson]?.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {module.lessons[currentLesson]?.content}
                </div>
              </div>
              {module.lessons[currentLesson]?.codeExample && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Code2 className="h-4 w-4" />
                      Code Example
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-editor-bg text-editor-text p-4 rounded overflow-x-auto text-sm">
                      <code>{module.lessons[currentLesson].codeExample}</code>
                    </pre>
                  </CardContent>
                </Card>
              )}
              <div className="flex items-center justify-between pt-4">
                <Button
                  variant="outline"
                  onClick={() => setCurrentLesson(Math.max(0, currentLesson - 1))}
                  disabled={currentLesson === 0}
                >
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  Lesson {currentLesson + 1} of {module.lessons.length}
                </span>
                <Button
                  onClick={() => setCurrentLesson(Math.min(module.lessons.length - 1, currentLesson + 1))}
                  disabled={currentLesson === module.lessons.length - 1}
                  style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
                  className="hover:brightness-110"
                >
                  Next
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quiz Tab */}
        <TabsContent value="quiz" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Knowledge Check
              </CardTitle>
              <CardDescription>
                Test your understanding of {module.title}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {module.quiz.map((question, questionIndex) => (
                <Card key={questionIndex}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Question {questionIndex + 1}
                    </CardTitle>
                    <CardDescription>{question.question}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {question.options.map((option, optionIndex) => (
                      <label key={optionIndex} className="flex items-center space-x-2 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${questionIndex}`}
                          value={optionIndex}
                          checked={quizAnswers[questionIndex] === optionIndex}
                          onChange={() => {
                            const newAnswers = [...quizAnswers];
                            newAnswers[questionIndex] = optionIndex;
                            setQuizAnswers(newAnswers);
                          }}
                          className="text-algorithm"
                        />
                        <span>{option}</span>
                      </label>
                    ))}
                    {showQuizResults && (
                      <div className={`mt-4 p-3 rounded ${
                        quizAnswers[questionIndex] === question.correctAnswer
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4" />
                          {quizAnswers[questionIndex] === question.correctAnswer ? 'Correct!' : 'Incorrect'}
                        </div>
                        <p className="text-sm mt-1">{question.explanation}</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
              {!showQuizResults ? (
                <Button
                  onClick={handleQuizSubmit}
                  disabled={quizAnswers.length !== module.quiz.length}
                  style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
                  className="w-full hover:brightness-110"
                >
                  Submit Quiz
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-center">
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      Score: {quizAnswers.filter((answer, index) =>
                        answer === module.quiz[index].correctAnswer
                      ).length} / {module.quiz.length}
                    </Badge>
                  </div>
                  {moduleCompleted && (
                    <Button
                      onClick={handleComplete}
                      style={{ background: 'hsl(var(--performance-excellent))', color: 'hsl(var(--performance-excellent-foreground))' }}
                      className="w-full hover:brightness-110"
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Complete Module
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Practice Tab */}
        <TabsContent value="practice" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Practice Problems
              </CardTitle>
              <CardDescription>
                Reinforce your learning with these practice exercises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {module.practiceProblems.map((problem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-complexity/10 flex items-center justify-center text-complexity text-sm font-bold">
                        {index + 1}
                      </div>
                      <span>{problem}</span>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      style={{ background: 'hsl(var(--algorithm))', color: 'hsl(var(--algorithm-foreground))' }}
                      className="hover:brightness-110"
                      onClick={() => {
                        // This would open the code editor with the specific problem
                        alert(`Opening ${problem} in code editor...`);
                      }}
                    >
                      <Play className="h-4 w-4 mr-1" />
                      Try It
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}