import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { 
  Database, 
  Plus, 
  Trash2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  FileText,
  Settings,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface TableColumn {
  name: string;
  type: string;
  isPrimary: boolean;
  isNotNull: boolean;
  defaultValue?: string;
}

interface DatabaseTable {
  id: string;
  name: string;
  columns: TableColumn[];
}

interface NormalizationIssue {
  type: 'first' | 'second' | 'third';
  severity: 'error' | 'warning';
  message: string;
  table: string;
  column?: string;
}

export function DatabaseDesignStudio() {
  const [tables, setTables] = useState<DatabaseTable[]>([
    {
      id: 'users',
      name: 'users',
      columns: [
        { name: 'id', type: 'INT', isPrimary: true, isNotNull: true },
        { name: 'email', type: 'VARCHAR(255)', isPrimary: false, isNotNull: true },
        { name: 'name', type: 'VARCHAR(100)', isPrimary: false, isNotNull: true },
        { name: 'address', type: 'TEXT', isPrimary: false, isNotNull: false },
        { name: 'city', type: 'VARCHAR(50)', isPrimary: false, isNotNull: false },
        { name: 'country', type: 'VARCHAR(50)', isPrimary: false, isNotNull: false }
      ]
    }
  ]);
  
  const [newTable, setNewTable] = useState({ name: '', columns: [{ name: 'id', type: 'INT', isPrimary: true, isNotNull: true }] });
  const [selectedTable, setSelectedTable] = useState<string>('users');
  const [normalizationResults, setNormalizationResults] = useState<NormalizationIssue[]>([]);

  const addTable = () => {
    if (!newTable.name.trim()) {
      toast.error("Please enter a table name");
      return;
    }

    const tableId = newTable.name.toLowerCase().replace(/\s+/g, '_');
    const table: DatabaseTable = {
      id: tableId,
      name: tableId,
      columns: newTable.columns
    };

    setTables(prev => [...prev, table]);
    setNewTable({ name: '', columns: [{ name: 'id', type: 'INT', isPrimary: true, isNotNull: true }] });
    toast.success(`Table "${tableId}" created successfully`);
  };

  const addColumn = (tableId: string) => {
    const newColumn: TableColumn = {
      name: 'new_column',
      type: 'VARCHAR(255)',
      isPrimary: false,
      isNotNull: false
    };

    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, columns: [...table.columns, newColumn] }
        : table
    ));
  };

  const updateColumn = (tableId: string, columnIndex: number, field: keyof TableColumn, value: any) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? {
            ...table, 
            columns: table.columns.map((col, idx) => 
              idx === columnIndex ? { ...col, [field]: value } : col
            )
          }
        : table
    ));
  };

  const removeColumn = (tableId: string, columnIndex: number) => {
    setTables(prev => prev.map(table => 
      table.id === tableId 
        ? { ...table, columns: table.columns.filter((_, idx) => idx !== columnIndex) }
        : table
    ));
  };

  const analyzeNormalization = () => {
    const issues: NormalizationIssue[] = [];

    tables.forEach(table => {
      // Check for First Normal Form (1NF) - atomic values
      table.columns.forEach(column => {
        if (column.name.includes(',') || column.name.includes('_and_')) {
          issues.push({
            type: 'first',
            severity: 'error',
            message: 'Column appears to contain multiple values (violates 1NF)',
            table: table.name,
            column: column.name
          });
        }
      });

      // Check for Second Normal Form (2NF) - partial dependencies
      const nonKeyColumns = table.columns.filter(col => !col.isPrimary);
      const hasCompositeKey = table.columns.filter(col => col.isPrimary).length > 1;
      
      if (hasCompositeKey && nonKeyColumns.length > 3) {
        issues.push({
          type: 'second',
          severity: 'warning',
          message: 'Table with composite key has many non-key attributes (potential 2NF violation)',
          table: table.name
        });
      }

      // Check for Third Normal Form (3NF) - transitive dependencies
      const addressColumns = table.columns.filter(col => 
        ['address', 'city', 'state', 'country', 'zip'].includes(col.name.toLowerCase())
      );
      
      if (addressColumns.length >= 3) {
        issues.push({
          type: 'third',
          severity: 'warning',
          message: 'Address fields suggest transitive dependency (consider separate address table)',
          table: table.name
        });
      }

      // Check for repeating groups
      const repeatingPatterns = table.columns.filter(col => 
        /\d+$/.test(col.name) // ends with number
      );
      
      if (repeatingPatterns.length > 1) {
        issues.push({
          type: 'first',
          severity: 'error',
          message: 'Repeating groups detected (violates 1NF)',
          table: table.name
        });
      }
    });

    setNormalizationResults(issues);
    
    if (issues.length === 0) {
      toast.success("No normalization issues found!");
    } else {
      toast.warning(`Found ${issues.length} normalization issues`);
    }
  };

  const generateOptimizedSchema = () => {
    // Simple optimization suggestions
    const suggestions = [];
    
    tables.forEach(table => {
      // Suggest indexes
      const textColumns = table.columns.filter(col => 
        col.type.includes('VARCHAR') && (col.name.includes('email') || col.name.includes('name') || col.name.includes('username'))
      );
      
      if (textColumns.length > 0) {
        suggestions.push(`-- Add indexes for ${table.name}`);
        textColumns.forEach(col => {
          if (col.name.includes('email')) {
            suggestions.push(`CREATE UNIQUE INDEX idx_${table.name}_${col.name} ON ${table.name}(${col.name});`);
          } else {
            suggestions.push(`CREATE INDEX idx_${table.name}_${col.name} ON ${table.name}(${col.name});`);
          }
        });
      }
    });

    const optimizedSQL = suggestions.join('\n');
    navigator.clipboard.writeText(optimizedSQL);
    toast.success("Optimization suggestions copied to clipboard");
  };

  const currentTable = tables.find(t => t.id === selectedTable);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[80vh]">
      {/* Schema Designer */}
      <div className="lg:col-span-2 space-y-4">
        <Card className="h-full">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-database" />
                Database Schema Designer
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">
                  {tables.length} table{tables.length !== 1 ? 's' : ''}
                </Badge>
                <Button onClick={analyzeNormalization} variant="outline" size="sm">
                  <Zap className="h-4 w-4 mr-2" />
                  Analyze
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={selectedTable} onValueChange={setSelectedTable}>
              <TabsList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 h-auto">
                {tables.map(table => (
                  <TabsTrigger key={table.id} value={table.id} className="text-xs">
                    {table.name}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              {tables.map(table => (
                <TabsContent key={table.id} value={table.id} className="mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold">Table: {table.name}</h3>
                      <Button 
                        onClick={() => addColumn(table.id)} 
                        size="sm"
                        variant="outline"
                      >
                        <Plus className="h-4 w-4 mr-2" />
                        Add Column
                      </Button>
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Column Name</TableHead>
                            <TableHead>Data Type</TableHead>
                            <TableHead>Primary Key</TableHead>
                            <TableHead>Not Null</TableHead>
                            <TableHead>Default</TableHead>
                            <TableHead>Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {table.columns.map((column, idx) => (
                            <TableRow key={idx}>
                              <TableCell>
                                <Input
                                  value={column.name}
                                  onChange={(e) => updateColumn(table.id, idx, 'name', e.target.value)}
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <select
                                  value={column.type}
                                  onChange={(e) => updateColumn(table.id, idx, 'type', e.target.value)}
                                  className="w-full p-1 border rounded text-sm h-8"
                                >
                                  <option value="INT">INT</option>
                                  <option value="VARCHAR(255)">VARCHAR(255)</option>
                                  <option value="VARCHAR(100)">VARCHAR(100)</option>
                                  <option value="TEXT">TEXT</option>
                                  <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                                  <option value="TIMESTAMP">TIMESTAMP</option>
                                  <option value="BOOLEAN">BOOLEAN</option>
                                </select>
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={column.isPrimary}
                                  onChange={(e) => updateColumn(table.id, idx, 'isPrimary', e.target.checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <input
                                  type="checkbox"
                                  checked={column.isNotNull}
                                  onChange={(e) => updateColumn(table.id, idx, 'isNotNull', e.target.checked)}
                                />
                              </TableCell>
                              <TableCell>
                                <Input
                                  value={column.defaultValue || ''}
                                  onChange={(e) => updateColumn(table.id, idx, 'defaultValue', e.target.value)}
                                  placeholder="Default value"
                                  className="h-8"
                                />
                              </TableCell>
                              <TableCell>
                                <Button
                                  onClick={() => removeColumn(table.id, idx)}
                                  variant="ghost"
                                  size="sm"
                                  disabled={table.columns.length === 1}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
      
      {/* Tools Panel */}
      <div className="space-y-4">
        <Tabs defaultValue="add-table">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="add-table">Add Table</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>
          
          <TabsContent value="add-table" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  New Table
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="tableName">Table Name</Label>
                  <Input
                    id="tableName"
                    value={newTable.name}
                    onChange={(e) => setNewTable(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter table name"
                  />
                </div>
                <Button onClick={addTable} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Table
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button 
                  onClick={generateOptimizedSchema} 
                  variant="outline" 
                  className="w-full text-xs"
                >
                  <Zap className="h-3 w-3 mr-2" />
                  Generate Indexes
                </Button>
                <Button 
                  onClick={() => {
                    const sql = tables.map(table => {
                      const columns = table.columns.map(col => {
                        let def = `  ${col.name} ${col.type}`;
                        if (col.isPrimary) def += ' PRIMARY KEY';
                        if (col.isNotNull && !col.isPrimary) def += ' NOT NULL';
                        if (col.defaultValue) def += ` DEFAULT '${col.defaultValue}'`;
                        return def;
                      });
                      const attributeSQL = columns.join(',\n');
                      return `CREATE TABLE ${table.name} (\n${attributeSQL}\n);`;
                    }).join('\n\n');
                    
                    navigator.clipboard.writeText(sql);
                    toast.success("Schema SQL copied to clipboard");
                  }}
                  variant="outline" 
                  className="w-full text-xs"
                >
                  <FileText className="h-3 w-3 mr-2" />
                  Export SQL
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="analysis" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-yellow-500" />
                  Normalization Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {normalizationResults.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p>Click "Analyze" to check normalization</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {normalizationResults.map((issue, idx) => (
                        <div 
                          key={idx} 
                          className={`p-3 rounded-lg border ${
                            issue.severity === 'error' 
                              ? 'border-red-200 bg-red-50' 
                              : 'border-yellow-200 bg-yellow-50'
                          }`}
                        >
                          <div className="flex items-start gap-2">
                            {issue.severity === 'error' ? (
                              <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                            )}
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {issue.type.toUpperCase()}NF Issue
                              </div>
                              <div className="text-xs text-muted-foreground">
                                Table: {issue.table}
                                {issue.column && ` • Column: ${issue.column}`}
                              </div>
                              <div className="text-xs mt-1">
                                {issue.message}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}