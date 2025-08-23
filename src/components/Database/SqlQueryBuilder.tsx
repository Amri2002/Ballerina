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

export function SqlQueryBuilder() {
  const [query, setQuery] = useState("SELECT * FROM users;");
  const [result, setResult] = useState<QueryResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);
  const [selectedDatabase, setSelectedDatabase] = useState("ecommerce");

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

  const highlightSql = (text: string) => {
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|ON|INSERT|UPDATE|DELETE|CREATE|TABLE|INDEX|PRIMARY|KEY|FOREIGN|NOT|NULL|AUTO_INCREMENT|VARCHAR|INT|DATE|TIMESTAMP)\b/gi;
    const strings = /'([^']*)'/g;
    const numbers = /\b\d+\.?\d*\b/g;
    
    return text
      .replace(keywords, '<span class="sql-keyword">$&</span>')
      .replace(strings, '<span class="sql-string">$&</span>')
      .replace(numbers, '<span class="sql-number">$&</span>');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      {/* Query Editor */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-database" />
                SQL Query Builder
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
  );
}