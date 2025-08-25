import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Play, RotateCcw, Database, Clock, CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { toast } from "sonner";

interface QueryResult {
  columns: string[];
  rows: any[][];
  executionTime: number;
  error?: string;
}

const sampleDatabases = {
  ecommerce: {
    name: "E-commerce Database",
    tables: {
      users: {
        columns: ["id", "name", "email", "created_at"],
        rows: [
          [1, "John Doe", "john@example.com", "2024-01-15"],
          [2, "Jane Smith", "jane@example.com", "2024-01-16"],
          [3, "Bob Wilson", "bob@example.com", "2024-01-17"]
        ]
      },
      products: {
        columns: ["id", "name", "price", "category_id"],
        rows: [
          [1, "Laptop", 999.99, 1],
          [2, "Mouse", 29.99, 1],
          [3, "Keyboard", 79.99, 1],
          [4, "Book", 19.99, 2]
        ]
      },
      orders: {
        columns: ["id", "user_id", "product_id", "quantity", "order_date"],
        rows: [
          [1, 1, 1, 1, "2024-01-20"],
          [2, 2, 2, 2, "2024-01-21"],
          [3, 1, 3, 1, "2024-01-22"]
        ]
      }
    }
  }
};

const sqlExamples = [
  {
    title: "Basic SELECT",
    query: "SELECT * FROM users;",
    description: "Retrieve all users from the database"
  },
  {
    title: "JOIN Query",
    query: "SELECT u.name, p.name as product, o.quantity\nFROM users u\nJOIN orders o ON u.id = o.user_id\nJOIN products p ON o.product_id = p.id;",
    description: "Join users with their orders and products"
  },
  {
    title: "Aggregation",
    query: "SELECT COUNT(*) as total_users, \n       AVG(age) as avg_age \nFROM users;",
    description: "Count users and calculate average age"
  }
];

interface Exercise {
  id: number;
  title: string;
  description: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  schema: string;
  task: string;
  solution: string;
  hint: string;
}

const sqlExercises: Exercise[] = [
  {
    id: 1,
    title: "Basic SELECT Query",
    description: "Learn to retrieve data from a single table",
    difficulty: "Beginner",
    schema: `CREATE TABLE employees (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  department VARCHAR(50),
  salary DECIMAL(10,2),
  hire_date DATE
);`,
    task: "Write a query to select all employees from the 'employees' table",
    solution: "SELECT * FROM employees;",
    hint: "Use SELECT * to get all columns from a table"
  },
  {
    id: 2,
    title: "Filtering with WHERE",
    description: "Filter records based on conditions",
    difficulty: "Beginner", 
    schema: `CREATE TABLE products (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  price DECIMAL(10,2),
  category VARCHAR(50),
  stock_quantity INT
);`,
    task: "Find all products with price greater than 100",
    solution: "SELECT * FROM products WHERE price > 100;",
    hint: "Use WHERE clause with comparison operators like >, <, =, etc."
  },
  {
    id: 3,
    title: "JOIN Operations",
    description: "Combine data from multiple tables",
    difficulty: "Intermediate",
    schema: `CREATE TABLE customers (
  id INT PRIMARY KEY,
  name VARCHAR(100),
  email VARCHAR(100)
);

CREATE TABLE orders (
  id INT PRIMARY KEY,
  customer_id INT,
  order_date DATE,
  total_amount DECIMAL(10,2),
  FOREIGN KEY (customer_id) REFERENCES customers(id)
);`,
    task: "Get all customers and their orders (show customer name and order total)",
    solution: "SELECT c.name, o.total_amount FROM customers c JOIN orders o ON c.id = o.customer_id;",
    hint: "Use JOIN to connect tables based on foreign key relationships"
  }
];

export function SqlQueryBuilder() {
  const [activeTab, setActiveTab] = useState("practice");
  const [currentExercise, setCurrentExercise] = useState(0);
  const [userQuery, setUserQuery] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());
  const [query, setQuery] = useState("SELECT * FROM users;");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState("ecommerce");

  const exercise = activeTab === "practice" ? sqlExercises[currentExercise] : null;

  const checkQuery = () => {
    if (!exercise) return;
    
    const normalizedUser = userQuery.trim().toLowerCase().replace(/\s+/g, ' ');
    const normalizedSolution = exercise.solution.toLowerCase().replace(/\s+/g, ' ');
    
    const isBasicallyCorrect = 
      normalizedUser.includes('select') && 
      (normalizedUser.includes('from') || normalizedUser.includes(normalizedSolution.split('from')[1]?.split(';')[0]?.trim() || ''));
    
    if (normalizedUser === normalizedSolution || isBasicallyCorrect) {
      setIsCorrect(true);
      setFeedback('Perfect! Your query is correct.');
      setCompletedExercises(prev => new Set([...prev, exercise.id]));
      toast.success('Query executed successfully!');
    } else {
      setIsCorrect(false);
      setFeedback(`Not quite right. ${exercise.hint}`);
      toast.error('Query needs adjustment');
    }
    setShowResult(true);
  };

  const nextExercise = () => {
    if (currentExercise < sqlExercises.length - 1) {
      setCurrentExercise(prev => prev + 1);
      setUserQuery('');
      setShowResult(false);
      setFeedback('');
    }
  };

  const prevExercise = () => {
    if (currentExercise > 0) {
      setCurrentExercise(prev => prev - 1);
      setUserQuery('');
      setShowResult(false);
      setFeedback('');
    }
  };

  const resetQuery = () => {
    if (activeTab === "practice") {
      setUserQuery('');
      setShowResult(false);
      setFeedback('');
    } else {
      setQuery('');
      setResult(null);
    }
  };

  const executeQuery = async () => {
    setIsExecuting(true);
    
    // Simulate query execution
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      // Simple query parser for demo
      const cleanQuery = query.toLowerCase().trim();
      const db = sampleDatabases[selectedDatabase as keyof typeof sampleDatabases];
      
      if (cleanQuery.includes("select * from users")) {
        setResult({
          columns: db.tables.users.columns,
          rows: db.tables.users.rows,
          executionTime: 0.045
        });
      } else if (cleanQuery.includes("select * from products")) {
        setResult({
          columns: db.tables.products.columns,
          rows: db.tables.products.rows,
          executionTime: 0.032
        });
      } else if (cleanQuery.includes("join")) {
        setResult({
          columns: ["name", "product", "quantity"],
          rows: [
            ["John Doe", "Laptop", 1],
            ["Jane Smith", "Mouse", 2],
            ["John Doe", "Keyboard", 1]
          ],
          executionTime: 0.078
        });
      } else {
        setResult({
          columns: ["message"],
          rows: [["Query executed successfully"]],
          executionTime: 0.021
        });
      }
      
      toast.success("Query executed successfully!");
    } catch (error) {
      setResult({
        columns: [],
        rows: [],
        executionTime: 0,
        error: "Syntax error in SQL query"
      });
      toast.error("Query execution failed");
    }
    
    setIsExecuting(false);
  };

  const difficultyColors = {
    Beginner: "bg-green-100 text-green-800 border-green-200",
    Intermediate: "bg-yellow-100 text-yellow-800 border-yellow-200", 
    Advanced: "bg-red-100 text-red-800 border-red-200"
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="practice">Practice Exercises</TabsTrigger>
          <TabsTrigger value="playground">SQL Playground</TabsTrigger>
        </TabsList>
        
        <TabsContent value="practice" className="space-y-6">
          {!exercise ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">Loading exercises...</p>
            </div>
          ) : (
          <>
          {/* Exercise Header */}
          {exercise && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-database/10 flex items-center justify-center text-database">
                      <Database className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        Exercise {currentExercise + 1}: {exercise.title}
                        {completedExercises.has(exercise.id) && <CheckCircle className="h-4 w-4 text-green-600" />}
                      </CardTitle>
                      <p className="text-muted-foreground text-sm">{exercise.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={difficultyColors[exercise.difficulty]}>
                      {exercise.difficulty}
                    </Badge>
                    <Badge variant="outline">
                      {currentExercise + 1} of {sqlExercises.length}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Schema and Task */}
            {exercise && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Schema & Task
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Database Schema:</h4>
                    <pre className="code-editor p-3 rounded-lg text-sm overflow-x-auto">
                      {exercise.schema}
                    </pre>
                  </div>
                  
                  <div className="p-4 bg-muted/50 rounded-lg">
                    <h4 className="font-medium mb-2 flex items-center gap-2">
                      <Play className="h-4 w-4" />
                      Your Task:
                    </h4>
                    <p className="text-sm">{exercise.task}</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Query Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Query Editor
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Write your SQL query here..."
                  className="font-mono text-sm min-h-[120px]"
                />
                
                <div className="flex justify-between">
                  <Button variant="outline" onClick={resetQuery}>
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Reset
                  </Button>
                  <Button onClick={checkQuery} disabled={!userQuery.trim()}>
                    <Play className="mr-2 h-4 w-4" />
                    Execute Query
                  </Button>
                </div>

                {showResult && (
                  <div className={`p-3 rounded-lg border ${
                    isCorrect 
                      ? 'border-green-200 bg-green-50 text-green-700'
                      : 'border-red-200 bg-red-50 text-red-700'
                  }`}>
                    <div className="flex items-center gap-2">
                      {isCorrect ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      <span className="font-medium">{feedback}</span>
                    </div>
                    {!isCorrect && exercise && (
                      <div className="mt-2 pt-2 border-t border-current/20">
                        <p className="text-sm opacity-80">
                          <Lightbulb className="h-3 w-3 inline mr-1" />
                          Hint: {exercise.hint}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Navigation */}
          <div className="flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={prevExercise}
              disabled={currentExercise === 0}
            >
              Previous Exercise
            </Button>
            
            <div className="text-sm text-muted-foreground">
              Progress: {completedExercises.size} / {sqlExercises.length} completed
            </div>
            
            <Button 
              onClick={nextExercise}
              disabled={currentExercise === sqlExercises.length - 1}
            >
              Next Exercise
            </Button>
          </div>
          </>
          )}
        </TabsContent>
        
        <TabsContent value="playground" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
            {/* Query Editor */}
            <div className="lg:col-span-2 space-y-4">
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5 text-database" />
                      SQL Playground
                    </CardTitle>
                    <Badge variant="outline" className="text-database border-database">
                      {selectedDatabase} DB
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 h-full flex flex-col">
                  <div className="flex-1">
                    <Textarea
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Enter your SQL query here..."
                      className="h-32 code-editor font-mono text-sm resize-none"
                    />
                    <div className="mt-2 text-xs text-muted-foreground">
                      Press Ctrl+Enter to execute query
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Button 
                        onClick={executeQuery} 
                        disabled={isExecuting}
                        className="database-gradient"
                      >
                        {isExecuting ? (
                          <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <Play className="mr-2 h-4 w-4" />
                        )}
                        Execute Query
                      </Button>
                      <Button 
                        variant="outline" 
                        onClick={() => setQuery("")}
                      >
                        Clear
                      </Button>
                    </div>
                    
                    {result && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {result.executionTime}ms
                        {result.error ? (
                          <XCircle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                      </div>
                    )}
                  </div>
                  
                  {/* Query Results */}
                  {result && (
                    <div className="flex-1 overflow-hidden">
                      {result.error ? (
                        <Card className="border-red-200 bg-red-50">
                          <CardContent className="p-4">
                            <div className="flex items-center gap-2 text-red-600">
                              <XCircle className="h-4 w-4" />
                              {result.error}
                            </div>
                          </CardContent>
                        </Card>
                      ) : (
                        <Card>
                          <CardHeader className="py-3">
                            <CardTitle className="text-sm">
                              Query Results ({result.rows.length} rows)
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="p-0">
                            <ScrollArea className="h-48">
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    {result.columns.map((col) => (
                                      <TableHead key={col} className="font-medium">
                                        {col}
                                      </TableHead>
                                    ))}
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {result.rows.map((row, i) => (
                                    <TableRow key={i}>
                                      {row.map((cell, j) => (
                                        <TableCell key={j}>{cell}</TableCell>
                                      ))}
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            </ScrollArea>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
            
            {/* Sidebar */}
            <div className="space-y-4">
              <Tabs defaultValue="examples">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="schema">Schema</TabsTrigger>
                </TabsList>
                
                <TabsContent value="examples" className="space-y-3">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        Query Examples
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {sqlExamples.map((example, i) => (
                        <div key={i} className="border rounded-lg p-3 cursor-pointer hover:bg-accent/50 transition-colors" onClick={() => setQuery(example.query)}>
                          <div className="font-medium text-sm">{example.title}</div>
                          <div className="text-xs text-muted-foreground mt-1">{example.description}</div>
                          <pre className="text-xs mt-2 p-2 bg-muted rounded font-mono overflow-x-auto">
                            {example.query}
                          </pre>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
                
                <TabsContent value="schema">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm">Database Schema</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {Object.entries(sampleDatabases.ecommerce.tables).map(([tableName, table]) => (
                        <div key={tableName} className="border rounded-lg p-3">
                          <div className="font-medium text-sm mb-2">{tableName}</div>
                          <div className="space-y-1">
                            {table.columns.map((col) => (
                              <div key={col} className="text-xs text-muted-foreground font-mono">
                                {col}
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}