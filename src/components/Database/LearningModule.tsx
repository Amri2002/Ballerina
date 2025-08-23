import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  Clock, 
  Award,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  RotateCcw
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
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Interactive Practice</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-96 flex items-center justify-center border-2 border-dashed border-muted rounded-lg">
                <div className="text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-database/10 flex items-center justify-center text-database mx-auto">
                    <Play className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Interactive Practice Session</h3>
                  <p className="text-muted-foreground max-w-md">
                    Practice what you've learned with hands-on exercises and real-time feedback.
                  </p>
                  <Button className="database-gradient">
                    Start Practice
                  </Button>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                <Button variant="outline" onClick={() => setCurrentStep('theory')}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Theory
                </Button>
                <Button onClick={() => setCurrentStep('quiz')}>
                  Next: Quiz
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
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