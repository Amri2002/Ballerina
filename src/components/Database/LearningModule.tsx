import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Database,
  Code,
  Target,
  Lightbulb
} from "lucide-react";
import { toast } from "sonner";

interface Question {
  id: string;
  type: 'multiple-choice' | 'code' | 'drag-drop';
  question: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  hint?: string;
}

interface LearningModule {
  id: string;
  title: string;
  description: string;
  duration: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  content: {
    theory: string;
    example: string;
    interactive?: string;
  };
  questions: Question[];
}

const modules: LearningModule[] = [
  {
    id: 'sql-basics',
    title: 'SQL Query Fundamentals',
    description: 'Learn the basics of SQL SELECT statements, WHERE clauses, and JOIN operations',
    duration: 60,
    difficulty: 'Beginner',
    content: {
      theory: `SQL (Structured Query Language) is the standard language for managing relational databases. In this module, you'll learn the fundamental operations:

**SELECT Statement:**
The SELECT statement is used to query data from a database. It allows you to specify which columns you want to retrieve and from which tables.

**WHERE Clause:**
The WHERE clause is used to filter records based on specific conditions. It helps you retrieve only the data that meets your criteria.

**JOIN Operations:**
JOINs are used to combine rows from two or more tables based on a related column between them. There are several types of JOINs:
- INNER JOIN: Returns records that have matching values in both tables
- LEFT JOIN: Returns all records from the left table and matched records from the right table
- RIGHT JOIN: Returns all records from the right table and matched records from the left table
- FULL OUTER JOIN: Returns all records when there is a match in either table`,
      example: `-- Basic SELECT
SELECT name, email FROM users;

-- SELECT with WHERE
SELECT * FROM products WHERE price > 100;

-- INNER JOIN example
SELECT u.name, o.total_amount 
FROM users u
INNER JOIN orders o ON u.id = o.user_id;

-- LEFT JOIN with filtering
SELECT u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at > '2024-01-01'
GROUP BY u.id, u.name;`
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which SQL command is used to retrieve data from a database?',
        options: ['INSERT', 'SELECT', 'UPDATE', 'DELETE'],
        correctAnswer: 1,
        explanation: 'SELECT is the SQL command used to retrieve data from one or more tables in a database.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What type of JOIN returns all records from the left table and matching records from the right table?',
        options: ['INNER JOIN', 'LEFT JOIN', 'RIGHT JOIN', 'FULL OUTER JOIN'],
        correctAnswer: 1,
        explanation: 'LEFT JOIN returns all records from the left table and the matched records from the right table. If no match, NULL values are returned for the right table.'
      },
      {
        id: 'q3',
        type: 'code',
        question: 'Write a SQL query to select all users whose email contains "@gmail.com"',
        correctAnswer: "SELECT * FROM users WHERE email LIKE '%@gmail.com';",
        explanation: 'Use the LIKE operator with wildcards (%) to match patterns in text fields.'
      }
    ]
  },
  {
    id: 'er-diagrams',
    title: 'Entity-Relationship Diagrams',
    description: 'Master the art of database design using ER diagrams and normalization principles',
    duration: 45,
    difficulty: 'Intermediate',
    content: {
      theory: `Entity-Relationship (ER) diagrams are visual representations of the data model of a database. They help in designing databases by showing the relationships between different entities.

**Key Components:**

**Entities:** Objects or concepts that can have data stored about them (e.g., Customer, Product, Order)

**Attributes:** Properties or characteristics of entities (e.g., Customer Name, Product Price)

**Relationships:** Associations between entities (e.g., Customer places Order)

**Cardinality:** Defines the numerical relationship between entities:
- One-to-One (1:1): Each entity instance relates to exactly one instance of another entity
- One-to-Many (1:M): One entity instance relates to many instances of another entity
- Many-to-Many (M:N): Many instances of one entity relate to many instances of another entity

**Primary Keys:** Unique identifiers for entity instances
**Foreign Keys:** References to primary keys in other entities`,
      example: `Example: E-commerce Database

Entities:
- Customer (CustomerID, Name, Email, Phone)
- Product (ProductID, Name, Price, Category)
- Order (OrderID, OrderDate, TotalAmount)
- OrderItem (Quantity, UnitPrice)

Relationships:
- Customer places Order (1:M)
- Order contains Product (M:N through OrderItem)
- Product belongs to Category (M:1)

The Order-Product relationship requires a junction table (OrderItem) because it's many-to-many.`
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'In a one-to-many relationship, where should the foreign key be placed?',
        options: ['On the "one" side', 'On the "many" side', 'In a separate table', 'On both sides'],
        correctAnswer: 1,
        explanation: 'In a one-to-many relationship, the foreign key is placed on the "many" side to reference the primary key of the "one" side.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What is required to implement a many-to-many relationship in a relational database?',
        options: ['Foreign keys only', 'Primary keys only', 'A junction/bridge table', 'Composite keys'],
        correctAnswer: 2,
        explanation: 'Many-to-many relationships require a junction (or bridge) table that contains foreign keys referencing the primary keys of both related entities.'
      }
    ]
  },
  {
    id: 'acid-properties',
    title: 'ACID Transactions',
    description: 'Understand transaction properties and database consistency',
    duration: 50,
    difficulty: 'Advanced',
    content: {
      theory: `ACID is an acronym for the four key properties that guarantee reliable database transactions:

**Atomicity:**
A transaction either completes fully or not at all. If any part of the transaction fails, the entire transaction is rolled back to maintain data consistency.

**Consistency:**
The database remains in a valid state before and after each transaction. All constraints, triggers, and rules are maintained throughout the transaction.

**Isolation:**
Multiple transactions can execute concurrently without interfering with each other. Each transaction appears to execute in isolation from others.

**Durability:**
Once a transaction is committed, the changes are permanently stored and will survive system failures, power outages, or crashes.

**Transaction Isolation Levels:**
1. READ UNCOMMITTED: Lowest isolation, allows dirty reads
2. READ COMMITTED: Prevents dirty reads, default in many systems  
3. REPEATABLE READ: Prevents dirty and non-repeatable reads
4. SERIALIZABLE: Highest isolation, prevents all anomalies`,
      example: `-- Example: Banking Transaction with ACID properties

BEGIN TRANSACTION;

-- Atomicity: Both operations must succeed
UPDATE accounts SET balance = balance - 100 WHERE account_id = 1;
UPDATE accounts SET balance = balance + 100 WHERE account_id = 2;

-- Consistency: Check constraints
IF @@ERROR <> 0 OR (SELECT balance FROM accounts WHERE account_id = 1) < 0
BEGIN
    ROLLBACK TRANSACTION; -- Atomicity in action
END
ELSE
BEGIN
    COMMIT TRANSACTION; -- Durability ensures permanent storage
END

-- Isolation: Concurrent transactions don't interfere
SET TRANSACTION ISOLATION LEVEL READ COMMITTED;`
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'Which ACID property ensures that a transaction either completely succeeds or completely fails?',
        options: ['Atomicity', 'Consistency', 'Isolation', 'Durability'],
        correctAnswer: 0,
        explanation: 'Atomicity ensures that transactions are "all or nothing" - they either complete fully or are rolled back entirely.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'What isolation level prevents dirty reads but allows non-repeatable reads?',
        options: ['READ UNCOMMITTED', 'READ COMMITTED', 'REPEATABLE READ', 'SERIALIZABLE'],
        correctAnswer: 1,
        explanation: 'READ COMMITTED prevents dirty reads but still allows non-repeatable reads and phantom reads.'
      },
      {
        id: 'q3',
        type: 'code',
        question: 'Complete this transaction pattern: BEGIN TRANSACTION; UPDATE users SET status="active"; _____ TRANSACTION;',
        correctAnswer: 'COMMIT',
        explanation: 'COMMIT TRANSACTION makes the changes permanent and satisfies the Durability property.'
      }
    ]
  },
  {
    id: 'indexing',
    title: 'Database Indexing',
    description: 'Learn how indexes improve query performance and B-tree structures',
    duration: 40,
    difficulty: 'Intermediate',
    content: {
      theory: `Database indexes are data structures that improve query performance by creating shortcuts to data:

**What is an Index?**
An index is like a book's index - it points to where data is stored without having to scan every page. Indexes are maintained separately from the main table data.

**Types of Indexes:**

**Primary Index:** Built automatically on the primary key, determines physical storage order

**Secondary Index:** Created on non-primary key columns, can be unique or non-unique

**Composite Index:** Covers multiple columns, order matters for optimization

**B-Tree Structure:**
Most databases use B-trees for indexing because they provide:
1. Balanced tree structure (all leaf nodes at same level)
2. Sorted data for efficient range queries
3. Logarithmic search time O(log n)
4. Efficient for both point lookups and range scans

**Performance Trade-offs:**
- Faster SELECT queries
- Slower INSERT/UPDATE/DELETE operations
- Additional storage space required`,
      example: `-- Creating indexes for performance

-- Primary index (automatic)
CREATE TABLE users (
    id INT PRIMARY KEY,
    email VARCHAR(100),
    name VARCHAR(50),
    created_at DATETIME
);

-- Secondary index for frequent lookups
CREATE INDEX idx_users_email ON users(email);

-- Composite index for multi-column queries
CREATE INDEX idx_users_name_created ON users(name, created_at);

-- Query that benefits from indexing
SELECT * FROM users 
WHERE email = 'john@example.com'  -- Uses idx_users_email
AND created_at > '2023-01-01';

-- Check query execution plan
EXPLAIN SELECT * FROM users WHERE email = 'john@example.com';`
    },
    questions: [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the primary advantage of using database indexes?',
        options: ['Reduced storage space', 'Faster query execution', 'Improved data integrity', 'Simplified table structure'],
        correctAnswer: 1,
        explanation: 'Indexes primarily improve query performance by providing fast access paths to data.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'In a B-tree index, what is the time complexity for finding a record?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'],
        correctAnswer: 1,
        explanation: 'B-tree indexes provide logarithmic search time due to their balanced tree structure.'
      },
      {
        id: 'q3',
        type: 'code',
        question: 'Write a SQL statement to create an index on the "last_name" column of a "customers" table.',
        correctAnswer: 'CREATE INDEX idx_customers_last_name ON customers(last_name);',
        explanation: 'This creates a secondary index on the last_name column to speed up queries filtering by last name.'
      }
    ]
  }
];

interface Props {
  moduleId: string;
  onComplete?: () => void;
}

export function LearningModule({ moduleId, onComplete }: Props) {
  const module = modules.find(m => m.id === moduleId);
  const [currentStep, setCurrentStep] = useState<'theory' | 'practice' | 'quiz'>('theory');
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [showResults, setShowResults] = useState(false);
  const [userAnswer, setUserAnswer] = useState('');

  if (!module) {
    return <div>Module not found</div>;
  }

  const progress = currentStep === 'theory' ? 33 : currentStep === 'practice' ? 66 : 100;
  const correctAnswers = Object.entries(answers).filter(([questionId, answer]) => {
    const question = module.questions.find(q => q.id === questionId);
    return question && answer === question.correctAnswer;
  }).length;

  const handleAnswer = (questionId: string, answer: any) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < module.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
      setUserAnswer('');
    } else {
      setShowResults(true);
      if (correctAnswers / module.questions.length >= 0.7) {
        toast.success("Congratulations! You passed the module!");
        onComplete?.();
      } else {
        toast.error("You need 70% to pass. Try again!");
      }
    }
  };

  const prevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
      setUserAnswer('');
    }
  };

  const resetQuiz = () => {
    setAnswers({});
    setCurrentQuestion(0);
    setShowResults(false);
    setUserAnswer('');
  };

  const currentQ = module.questions[currentQuestion];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-database" />
                {module.title}
              </CardTitle>
              <p className="text-muted-foreground mt-1">{module.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {module.duration} min
              </Badge>
              <Badge variant="outline" className="text-xs">
                {module.difficulty}
              </Badge>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Progress</span>
              <span>{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Content */}
      <Tabs value={currentStep} onValueChange={(value) => setCurrentStep(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="theory">Theory</TabsTrigger>
          <TabsTrigger value="practice">Practice</TabsTrigger>
          <TabsTrigger value="quiz">Quiz</TabsTrigger>
        </TabsList>
        
        <TabsContent value="theory" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Learning Content</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="prose prose-sm max-w-none">
                  <div className="whitespace-pre-line">{module.content.theory}</div>
                  
                  {module.content.example && (
                    <div className="mt-6">
                      <h4 className="font-semibold mb-3">Examples:</h4>
                      <pre className="code-editor p-4 rounded-lg text-sm overflow-x-auto">
                        {module.content.example}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
              <div className="mt-4 flex justify-end">
                <Button onClick={() => setCurrentStep('practice')}>
                  Next: Practice
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="practice" className="space-y-4">
          <PracticeExercises moduleId={moduleId} />
          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setCurrentStep('theory')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back: Theory
            </Button>
            <Button onClick={() => setCurrentStep('quiz')}>
              Next: Quiz
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="quiz" className="space-y-4">
          {showResults ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Quiz Results
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center space-y-4">
                  <div className="text-4xl font-bold">
                    {Math.round((correctAnswers / module.questions.length) * 100)}%
                  </div>
                  <div className="text-muted-foreground">
                    {correctAnswers} out of {module.questions.length} correct
                  </div>
                  
                  {correctAnswers / module.questions.length >= 0.7 ? (
                    <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                      <div className="flex items-center gap-2 text-green-700">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Congratulations! You passed the module!</span>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-700">
                        <XCircle className="h-5 w-5" />
                        <span className="font-medium">You need 70% to pass. Keep learning!</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex gap-2 justify-center">
                    <Button onClick={resetQuiz} variant="outline">
                      <RotateCcw className="mr-2 h-4 w-4" />
                      Retake Quiz
                    </Button>
                    <Button onClick={onComplete} className="database-gradient">
                      Continue Learning
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    Question {currentQuestion + 1} of {module.questions.length}
                  </CardTitle>
                  <Badge variant="outline">
                    {Math.round(((currentQuestion + 1) / module.questions.length) * 100)}%
                  </Badge>
                </div>
                <Progress value={((currentQuestion + 1) / module.questions.length) * 100} className="h-2" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">{currentQ.question}</h3>
                  
                  {currentQ.type === 'multiple-choice' && currentQ.options && (
                    <div className="space-y-2">
                      {currentQ.options.map((option, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            handleAnswer(currentQ.id, idx);
                            setUserAnswer(option);
                          }}
                          className={`w-full text-left p-3 border rounded-lg transition-colors ${
                            userAnswer === option 
                              ? 'border-primary bg-primary/10' 
                              : 'border-muted hover:border-primary/50'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                  
                  {currentQ.type === 'code' && (
                    <div className="space-y-2">
                      <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        placeholder="Write your SQL query here..."
                        className="w-full h-32 p-3 border rounded-lg code-editor font-mono text-sm"
                      />
                      <Button
                        onClick={() => handleAnswer(currentQ.id, userAnswer)}
                        variant="outline"
                        size="sm"
                      >
                        Submit Answer
                      </Button>
                    </div>
                  )}
                  
                  {answers[currentQ.id] !== undefined && (
                    <div className={`p-3 rounded-lg border ${
                      answers[currentQ.id] === currentQ.correctAnswer
                        ? 'border-green-200 bg-green-50'
                        : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-center gap-2 mb-2">
                        {answers[currentQ.id] === currentQ.correctAnswer ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="font-medium">
                          {answers[currentQ.id] === currentQ.correctAnswer ? 'Correct!' : 'Incorrect'}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {currentQ.explanation}
                      </p>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between">
                  <Button 
                    onClick={prevQuestion} 
                    variant="outline" 
                    disabled={currentQuestion === 0}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Previous
                  </Button>
                  <Button 
                    onClick={nextQuestion}
                    disabled={answers[currentQ.id] === undefined}
                  >
                    {currentQuestion === module.questions.length - 1 ? 'Finish Quiz' : 'Next'}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Practice Exercises Component
function PracticeExercises({ moduleId }: { moduleId: string }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);

  const exercisesByModule: Record<string, any[]> = {
    'sql-basics': [
      {
        id: 1,
        title: "Basic SELECT Query",
        description: "Write a query to retrieve all customers from the database",
        type: "query",
        scenario: "You have a table called 'customers' with columns: id, name, email, city",
        question: "Write a SQL query to select all customers:",
        solution: "SELECT * FROM customers"
      },
      {
        id: 2,
        title: "WHERE Clause Filtering",
        description: "Filter customers based on their city",
        type: "query",
        scenario: "Find all customers who live in 'New York'",
        question: "Write a SQL query to find customers in New York:",
        solution: "SELECT * FROM customers WHERE city = 'New York'"
      },
      {
        id: 3,
        title: "JOIN Operations",
        description: "Combine data from customers and orders tables",
        type: "query",
        scenario: "Show customer names with their order totals",
        question: "Write a JOIN query to show customer names and order amounts:",
        solution: "SELECT c.name, o.amount FROM customers c JOIN orders o ON c.id = o.customer_id"
      }
    ],
    'er-diagrams': [
      {
        id: 1,
        title: "Entity Identification",
        description: "Identify the main entities in a library system",
        type: "entity",
        scenario: "A library system manages books, authors, members, and loans",
        question: "List the main entities (separated by commas):",
        solution: "Book, Author, Member, Loan"
      },
      {
        id: 2,
        title: "Primary Key Design",
        description: "Define appropriate primary keys for entities",
        type: "primary-key",
        scenario: "For a Student entity with attributes: student_id, name, email, phone",
        question: "Which attribute should be the primary key?",
        solution: "student_id"
      },
      {
        id: 3,
        title: "Relationship Types",
        description: "Identify the relationship between Customer and Order entities",
        type: "relationship",
        scenario: "One customer can place multiple orders, but each order belongs to one customer",
        question: "What type of relationship is this? (One-to-One, One-to-Many, Many-to-Many)",
        solution: "One-to-Many"
      }
    ],
    'acid-properties': [
      {
        id: 1,
        title: "Banking Transfer Simulation",
        description: "Simulate a money transfer between two accounts and observe ACID properties",
        type: "transaction",
        scenario: "Transfer $500 from Account A (balance: $1000) to Account B (balance: $200)",
        steps: [
          "BEGIN TRANSACTION",
          "Deduct $500 from Account A",
          "Add $500 to Account B", 
          "Check constraints",
          "COMMIT or ROLLBACK"
        ],
        solution: "COMMIT"
      },
      {
        id: 2,
        title: "Isolation Level Demo",
        description: "Observe how different isolation levels affect concurrent transactions",
        type: "isolation",
        scenario: "Two users trying to book the last seat on a flight simultaneously",
        options: ["READ UNCOMMITTED", "READ COMMITTED", "REPEATABLE READ", "SERIALIZABLE"],
        solution: "SERIALIZABLE"
      },
      {
        id: 3,
        title: "Rollback Scenario",
        description: "Handle a failed transaction and understand atomicity",
        type: "rollback",
        scenario: "Update user profile, but email validation fails midway",
        solution: "ROLLBACK"
      }
    ],
    'indexing': [
      {
        id: 1,
        title: "B-Tree Navigation",
        description: "Navigate through a B-tree index to find a specific record",
        type: "navigation",
        scenario: "Find user with ID 847 in a B-tree with branching factor 3",
        steps: ["Root: [400, 800]", "Left: [200, 300]", "Middle: [500, 600, 700]", "Right: [850, 900]"],
        solution: "Right subtree"
      },
      {
        id: 2,
        title: "Index Performance Analysis",
        description: "Compare query performance with and without indexes",
        type: "performance",
        scenario: "Query: SELECT * FROM users WHERE email = 'john@example.com'",
        options: ["Full table scan: O(n)", "B-tree index: O(log n)", "Hash index: O(1)", "Depends on data"],
        solution: "B-tree index: O(log n)"
      },
      {
        id: 3,
        title: "Composite Index Design",
        description: "Design an optimal composite index for multi-column queries",
        type: "design",
        scenario: "Optimize: SELECT * FROM orders WHERE customer_id = ? AND order_date > ? ORDER BY order_date",
        solution: "CREATE INDEX idx_orders_customer_date ON orders(customer_id, order_date)"
      }
    ]
  };

  const exercises = exercisesByModule[moduleId] || [];
  const currentEx = exercises[currentExercise];

  const checkAnswer = () => {
    if (!currentEx) return;
    
    const normalizedInput = userInput.trim().toLowerCase();
    const normalizedSolution = currentEx.solution.toLowerCase();
    
    if (normalizedInput.includes(normalizedSolution) || normalizedInput === normalizedSolution) {
      setFeedback({ type: 'success', message: 'Correct! Well done!' });
      toast.success("Correct answer!");
      
      if (currentExercise === exercises.length - 1) {
        setIsCompleted(true);
        toast.success("Practice session completed!");
      }
    } else {
      setFeedback({ type: 'error', message: `Not quite right. Hint: The answer involves "${currentEx.solution}"` });
      toast.error("Try again!");
    }
  };

  const nextExercise = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setUserInput('');
      setFeedback(null);
    }
  };

  const resetExercises = () => {
    setCurrentExercise(0);
    setUserInput('');
    setFeedback(null);
    setIsCompleted(false);
  };

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto">
              <Target className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-semibold">Practice Exercises Coming Soon</h3>
            <p className="text-muted-foreground">
              Interactive practice exercises for this module are being developed.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isCompleted) {
    return (
      <Card>
        <CardContent className="h-96 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold">Practice Complete!</h3>
            <p className="text-muted-foreground">
              You've successfully completed all practice exercises for this module.
            </p>
            <Button onClick={resetExercises} variant="outline">
              <RotateCcw className="mr-2 h-4 w-4" />
              Practice Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            Exercise {currentExercise + 1} of {exercises.length}
          </CardTitle>
          <Badge variant="outline">
            {Math.round(((currentExercise + 1) / exercises.length) * 100)}%
          </Badge>
        </div>
        <Progress value={((currentExercise + 1) / exercises.length) * 100} className="h-2" />
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">{currentEx.title}</h3>
          <p className="text-muted-foreground">{currentEx.description}</p>
          
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2">Scenario:</h4>
            <p className="text-sm">{currentEx.scenario}</p>
          </div>
          
          {currentEx.steps && (
            <div className="space-y-2">
              <h4 className="font-medium">Steps:</h4>
              <ul className="text-sm space-y-1">
                {currentEx.steps.map((step: string, idx: number) => (
                  <li key={idx} className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                      {idx + 1}
                    </div>
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          )}
          
          {currentEx.options && (
            <div className="space-y-2">
              <h4 className="font-medium">Choose the best option:</h4>
              <div className="grid gap-2">
                {currentEx.options.map((option: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => setUserInput(option)}
                    className={`text-left p-3 border rounded-lg transition-colors ${
                      userInput === option 
                        ? 'border-primary bg-primary/10' 
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Input field for queries (SQL exercises) */}
          {(currentEx.type === 'query' || !currentEx.options) && currentEx.type !== 'transaction' && currentEx.type !== 'design' && (
            <div className="space-y-2">
              <Label htmlFor="answer-input" className="font-medium">
                {currentEx.question || "Your answer:"}
              </Label>
              <Textarea
                id="answer-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder={currentEx.type === 'query' ? "Enter your SQL query here..." : "Enter your answer..."}
                className="font-mono text-sm"
                rows={currentEx.type === 'query' ? 4 : 2}
              />
            </div>
          )}
          
          {currentEx.type === 'transaction' && (
            <div className="space-y-2">
              <Label htmlFor="transaction-input" className="font-medium">What should happen next?</Label>
              <Input
                id="transaction-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Enter COMMIT or ROLLBACK"
                className="font-mono"
              />
            </div>
          )}
          
          {currentEx.type === 'design' && (
            <div className="space-y-2">
              <Label htmlFor="design-input" className="font-medium">Write the SQL statement:</Label>
              <Textarea
                id="design-input"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="CREATE INDEX ..."
                className="font-mono text-sm"
                rows={3}
              />
            </div>
          )}
        </div>
        
        {feedback && (
          <div className={`p-3 rounded-lg border ${
            feedback.type === 'success' 
              ? 'border-green-200 bg-green-50 text-green-700'
              : feedback.type === 'error'
              ? 'border-red-200 bg-red-50 text-red-700'
              : 'border-blue-200 bg-blue-50 text-blue-700'
          }`}>
            <div className="flex items-center gap-2">
              {feedback.type === 'success' && <CheckCircle className="h-4 w-4" />}
              {feedback.type === 'error' && <XCircle className="h-4 w-4" />}
              {feedback.type === 'info' && <Lightbulb className="h-4 w-4" />}
              <span className="font-medium">{feedback.message}</span>
            </div>
          </div>
        )}
        
        <div className="flex justify-between">
          <Button 
            onClick={() => {
              if (currentExercise > 0) {
                setCurrentExercise(prev => prev - 1);
                setUserInput('');
                setFeedback(null);
              }
            }}
            variant="outline" 
            disabled={currentExercise === 0}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <div className="flex gap-2">
            <Button onClick={checkAnswer} disabled={!userInput.trim()}>
              <CheckCircle className="mr-2 h-4 w-4" />
              Check Answer
            </Button>
            {feedback?.type === 'success' && currentExercise < exercises.length - 1 && (
              <Button onClick={nextExercise}>
                Next Exercise
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}