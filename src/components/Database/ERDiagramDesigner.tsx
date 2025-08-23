import React, { useCallback, useState } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Trash2, Save, Download, Database, GitMerge, Key, Link2 } from "lucide-react";
import { toast } from "sonner";

// Custom Entity Node Component
interface EntityAttribute {
  name: string;
  type: string;
  isPrimary?: boolean;
  isForeign?: boolean;
}

interface EntityNodeData {
  name: string;
  attributes?: EntityAttribute[];
}

const EntityNode = ({ data }: { data: EntityNodeData }) => {
  return (
    <div className="er-entity min-w-48 p-0 rounded-lg shadow-lg bg-white">
      <div className="bg-database text-white px-3 py-2 rounded-t-lg">
        <div className="font-bold text-sm">{data.name}</div>
      </div>
      <div className="p-3">
        {data.attributes?.map((attr, index) => (
          <div key={index} className="flex items-center gap-2 py-1 text-xs">
            {attr.isPrimary && <Key className="h-3 w-3 text-yellow-600" />}
            {attr.isForeign && <Link2 className="h-3 w-3 text-blue-600" />}
            <span className={attr.isPrimary ? "font-bold" : ""}>{attr.name}</span>
            <span className="text-muted-foreground">({attr.type})</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Custom Relationship Node Component  
interface RelationshipNodeData {
  name: string;
}

const RelationshipNode = ({ data }: { data: RelationshipNodeData }) => {
  return (
    <div className="er-relationship px-4 py-2 rounded bg-primary text-primary-foreground text-sm font-medium shadow-lg">
      {data.name}
    </div>
  );
};

const nodeTypes: NodeTypes = {
  entity: EntityNode,
  relationship: RelationshipNode,
};

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'entity',
    position: { x: 100, y: 100 },
    data: {
      name: 'User',
      attributes: [
        { name: 'user_id', type: 'INT', isPrimary: true },
        { name: 'email', type: 'VARCHAR(255)' },
        { name: 'name', type: 'VARCHAR(100)' },
        { name: 'created_at', type: 'TIMESTAMP' }
      ]
    },
  },
  {
    id: '2',
    type: 'entity',
    position: { x: 400, y: 100 },
    data: {
      name: 'Order',
      attributes: [
        { name: 'order_id', type: 'INT', isPrimary: true },
        { name: 'user_id', type: 'INT', isForeign: true },
        { name: 'total_amount', type: 'DECIMAL(10,2)' },
        { name: 'order_date', type: 'TIMESTAMP' }
      ]
    },
  },
  {
    id: '3',
    type: 'relationship',
    position: { x: 250, y: 150 },
    data: { name: 'places' },
  },
];

const initialEdges: Edge[] = [
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
  {
    id: 'e3-2',
    source: '3',
    target: '2',
    type: 'straight',
    markerEnd: { type: MarkerType.ArrowClosed }
  },
];

export function ErDiagramDesigner() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [newEntityName, setNewEntityName] = useState('');
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);
  const [newAttribute, setNewAttribute] = useState({ name: '', type: 'VARCHAR(255)', isPrimary: false, isForeign: false });

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  const addEntity = () => {
    if (!newEntityName.trim()) {
      toast.error("Please enter an entity name");
      return;
    }

    const newNode: Node = {
      id: `entity-${Date.now()}`,
      type: 'entity',
      position: { x: Math.random() * 300 + 100, y: Math.random() * 200 + 100 },
      data: {
        name: newEntityName,
        attributes: [
          { name: 'id', type: 'INT', isPrimary: true }
        ]
      }
    };

    setNodes((nds) => [...nds, newNode]);
    setNewEntityName('');
    toast.success(`Entity "${newEntityName}" added successfully`);
  };

  const addRelationship = () => {
    const newNode: Node = {
      id: `relationship-${Date.now()}`,
      type: 'relationship',
      position: { x: Math.random() * 300 + 200, y: Math.random() * 200 + 150 },
      data: { name: 'new_relationship' }
    };

    setNodes((nds) => [...nds, newNode]);
    toast.success("Relationship added successfully");
  };

  const addAttribute = () => {
    if (!selectedNode || !newAttribute.name.trim()) {
      toast.error("Please select an entity and enter attribute name");
      return;
    }

    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === selectedNode.id && node.type === 'entity') {
          return {
            ...node,
            data: {
              ...node.data,
              attributes: [...(Array.isArray(node.data.attributes) ? node.data.attributes : []), { ...newAttribute }]
            }
          };
        }
        return node;
      })
    );

    setNewAttribute({ name: '', type: 'VARCHAR(255)', isPrimary: false, isForeign: false });
    toast.success("Attribute added successfully");
  };

  const deleteSelectedNode = () => {
    if (!selectedNode) {
      toast.error("Please select a node to delete");
      return;
    }

    setNodes((nds) => nds.filter((node) => node.id !== selectedNode.id));
    setEdges((eds) => eds.filter((edge) => edge.source !== selectedNode.id && edge.target !== selectedNode.id));
    setSelectedNode(null);
    toast.success("Node deleted successfully");
  };

  const exportDiagram = () => {
    const diagramData = {
      nodes: nodes,
      edges: edges,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(diagramData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'er-diagram.json';
    link.click();
    
    URL.revokeObjectURL(url);
    toast.success("Diagram exported successfully");
  };

  const generateSQL = () => {
    let sql = "-- Generated SQL Schema\n\n";
    
    nodes.filter(node => node.type === 'entity').forEach((node) => {
      if (node.data && typeof node.data.name === 'string') {
        sql += `CREATE TABLE ${node.data.name.toLowerCase()} (\n`;
        
        const attributes = Array.isArray(node.data.attributes) ? node.data.attributes : [];
        const attributeSQL = attributes.map((attr: EntityAttribute) => {
          let line = `  ${attr.name} ${attr.type}`;
          if (attr.isPrimary) line += " PRIMARY KEY";
          if (attr.name.includes('_id') && !attr.isPrimary) line += " NOT NULL";
          return line;
        });
        
        sql += attributeSQL.join(',\n');
        sql += "\n);\n\n";
      }
    });

    // Add foreign key constraints
    nodes.filter(node => node.type === 'entity').forEach((node) => {
      if (node.data && typeof node.data.name === 'string') {
        const attributes = Array.isArray(node.data.attributes) ? node.data.attributes : [];
        attributes.forEach((attr: EntityAttribute) => {
          if (attr.isForeign) {
            const referencedTable = attr.name.replace('_id', '');
            sql += `ALTER TABLE ${String(node.data.name).toLowerCase()} \nADD FOREIGN KEY (${attr.name}) REFERENCES ${referencedTable}(${attr.name});\n\n`;
          }
        });
      }
    });

    navigator.clipboard.writeText(sql);
    toast.success("SQL schema copied to clipboard");
  };

  return (
    <div className="h-[80vh] grid grid-cols-1 lg:grid-cols-4 gap-4">
      {/* ER Diagram Canvas */}
      <div className="lg:col-span-3 border rounded-lg overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeClick={(_, node) => setSelectedNode(node)}
          nodeTypes={nodeTypes}
          fitView
          style={{ backgroundColor: "#F7F9FB" }}
        >
          <Controls />
          <MiniMap />
          <Background gap={12} size={1} />
        </ReactFlow>
      </div>

      {/* Tools Panel */}
      <div className="space-y-4">
        <Tabs defaultValue="entities" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="entities">Entities</TabsTrigger>
            <TabsTrigger value="export">Export</TabsTrigger>
          </TabsList>
          
          <TabsContent value="entities" className="space-y-4">
            {/* Add Entity */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Database className="h-4 w-4 text-database" />
                  Add Entity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="entityName">Entity Name</Label>
                  <Input
                    id="entityName"
                    value={newEntityName}
                    onChange={(e) => setNewEntityName(e.target.value)}
                    placeholder="Enter entity name"
                  />
                </div>
                <div className="flex gap-2">
                  <Button onClick={addEntity} size="sm" className="flex-1">
                    <Plus className="h-3 w-3 mr-1" />
                    Add Entity
                  </Button>
                  <Button onClick={addRelationship} variant="outline" size="sm">
                    <GitMerge className="h-3 w-3 mr-1" />
                    Add Relation
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Edit Selected */}
            {selectedNode && selectedNode.type === 'entity' && (
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    Edit: {String(selectedNode.data?.name || 'Unknown')}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <Label>Add Attribute</Label>
                    <Input
                      value={newAttribute.name}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Attribute name"
                      className="text-xs"
                    />
                    <select
                      value={newAttribute.type}
                      onChange={(e) => setNewAttribute(prev => ({ ...prev, type: e.target.value }))}
                      className="w-full p-2 border rounded text-xs"
                    >
                      <option value="VARCHAR(255)">VARCHAR(255)</option>
                      <option value="INT">INT</option>
                      <option value="DECIMAL(10,2)">DECIMAL(10,2)</option>
                      <option value="TIMESTAMP">TIMESTAMP</option>
                      <option value="BOOLEAN">BOOLEAN</option>
                    </select>
                    <div className="flex gap-2 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newAttribute.isPrimary}
                          onChange={(e) => setNewAttribute(prev => ({ ...prev, isPrimary: e.target.checked }))}
                        />
                        Primary Key
                      </label>
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={newAttribute.isForeign}
                          onChange={(e) => setNewAttribute(prev => ({ ...prev, isForeign: e.target.checked }))}
                        />
                        Foreign Key
                      </label>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={addAttribute} size="sm" className="flex-1">
                      <Plus className="h-3 w-3 mr-1" />
                      Add
                    </Button>
                    <Button onClick={deleteSelectedNode} variant="destructive" size="sm">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Current Entities */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Current Entities</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-40">
                  <div className="space-y-2">
                    {nodes.filter(node => node.type === 'entity').map((node) => (
                      <div
                        key={node.id}
                        className={`p-2 border rounded cursor-pointer text-xs transition-colors ${
                          selectedNode?.id === node.id ? 'bg-primary/10 border-primary' : 'hover:bg-accent'
                        }`}
                        onClick={() => setSelectedNode(node)}
                      >
                        <div className="font-medium">{String(node.data?.name || 'Unknown')}</div>
                        <div className="text-muted-foreground">
                          {Array.isArray(node.data?.attributes) ? node.data.attributes.length : 0} attributes
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="export" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Export Options</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button onClick={generateSQL} variant="outline" className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Copy SQL Schema
                </Button>
                <Button onClick={exportDiagram} variant="outline" className="w-full">
                  <Download className="h-4 w-4 mr-2" />
                  Export JSON
                </Button>
                <div className="text-xs text-muted-foreground">
                  Generate SQL DDL statements or export diagram data for later use.
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}