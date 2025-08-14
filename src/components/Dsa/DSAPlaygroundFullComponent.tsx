import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
	ArrowLeft,
	Play,
	Pause,
	RotateCcw,
	Settings,
	BarChart3,
	TreePine,
	Hash,
	Layers,
	Code,
	FileText,
} from "lucide-react";

interface DSAPlaygroundFullComponentProps {
	onBack: () => void;
}

const algorithms = [
	{
		id: "bubble-sort",
		name: "Bubble Sort",
		category: "Sorting",
		icon: <BarChart3 className="h-4 w-4" />,
	},
	{
		id: "merge-sort",
		name: "Merge Sort",
		category: "Sorting",
		icon: <BarChart3 className="h-4 w-4" />,
	},
	{
		id: "quick-sort",
		name: "Quick Sort",
		category: "Sorting",
		icon: <BarChart3 className="h-4 w-4" />,
	},
	{
		id: "bfs",
		name: "Breadth-First Search",
		category: "Trees",
		icon: <TreePine className="h-4 w-4" />,
	},
	{
		id: "dfs",
		name: "Depth-First Search",
		category: "Trees",
		icon: <TreePine className="h-4 w-4" />,
	},
	{
		id: "hash-table",
		name: "Hash Table",
		category: "Hashing",
		icon: <Hash className="h-4 w-4" />,
	},
	{
		id: "stack",
		name: "Stack Operations",
		category: "Data Structures",
		icon: <Layers className="h-4 w-4" />,
	},
	{
		id: "queue",
		name: "Queue Operations",
		category: "Data Structures",
		icon: <Layers className="h-4 w-4" />,
	},
];

export default function DSAPlaygroundFullComponent({
	onBack,
}: DSAPlaygroundFullComponentProps) {
	const [selectedAlgorithm, setSelectedAlgorithm] = useState("");
	const [customInput, setCustomInput] = useState("64, 34, 25, 12, 22, 11, 90");
	const [isRunning, setIsRunning] = useState(false);
	const [speed, setSpeed] = useState("normal");

	const handleRun = () => {
		setIsRunning(!isRunning);
	};

	const handleReset = () => {
		setIsRunning(false);
	};

	const getCategoryColor = (category: string) => {
		const colors = {
			Sorting: "bg-primary/10 text-primary",
			Trees: "bg-success/10 text-success",
			Hashing: "bg-warning/10 text-warning",
			"Data Structures": "bg-info/10 text-info",
		};
		return colors[category as keyof typeof colors] || "bg-muted/10 text-muted-foreground";
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Header */}
			<section className="border-b bg-muted/30">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button variant="ghost" size="sm" onClick={onBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to DSA
							</Button>
							<div>
								<h1 className="text-2xl font-bold">Algorithm Playground</h1>
								<p className="text-muted-foreground">
									Experiment with algorithms using custom data
								</p>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Button variant="outline" size="sm">
								<Settings className="h-4 w-4 mr-2" />
								Settings
							</Button>
						</div>
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-8">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-12 gap-8">
						{/* Controls Sidebar */}
						<div className="lg:col-span-3 space-y-6">
							{/* Algorithm Selection */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Select Algorithm</CardTitle>
								</CardHeader>
								<CardContent>
									<Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
										<SelectTrigger>
											<SelectValue placeholder="Choose algorithm..." />
										</SelectTrigger>
										<SelectContent>
											{algorithms.map((algorithm) => (
												<SelectItem key={algorithm.id} value={algorithm.id}>
													<div className="flex items-center space-x-2">
														{algorithm.icon}
														<span>{algorithm.name}</span>
													</div>
												</SelectItem>
											))}
										</SelectContent>
									</Select>

									{selectedAlgorithm && (
										<div className="mt-3">
											<Badge
												className={getCategoryColor(
													algorithms.find((a) => a.id === selectedAlgorithm)?.category ||
														""
												)}
											>
												{algorithms.find((a) => a.id === selectedAlgorithm)?.category}
											</Badge>
										</div>
									)}
								</CardContent>
							</Card>

							{/* Input Data */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Input Data</CardTitle>
									<CardDescription>Enter comma-separated values</CardDescription>
								</CardHeader>
								<CardContent>
									<Textarea
										placeholder="64, 34, 25, 12, 22, 11, 90"
										value={customInput}
										onChange={(e) => setCustomInput(e.target.value)}
										className="min-h-[100px]"
									/>
								</CardContent>
							</Card>

							{/* Speed Control */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Animation Speed</CardTitle>
								</CardHeader>
								<CardContent>
									<Select value={speed} onValueChange={setSpeed}>
										<SelectTrigger>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="slow">Slow</SelectItem>
											<SelectItem value="normal">Normal</SelectItem>
											<SelectItem value="fast">Fast</SelectItem>
										</SelectContent>
									</Select>
								</CardContent>
							</Card>

							{/* Controls */}
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Controls</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									<Button
										className="w-full bg-hero-gradient hover:opacity-90"
										onClick={handleRun}
										disabled={!selectedAlgorithm}
									>
										{isRunning ? (
											<>
												<Pause className="h-4 w-4 mr-2" />
												Pause
											</>
										) : (
											<>
												<Play className="h-4 w-4 mr-2" />
												Run Algorithm
											</>
										)}
									</Button>
									<Button variant="outline" className="w-full" onClick={handleReset}>
										<RotateCcw className="h-4 w-4 mr-2" />
										Reset
									</Button>
								</CardContent>
							</Card>
						</div>

						{/* Main Visualization Area */}
						<div className="lg:col-span-9 space-y-6">
							{/* Visualization */}
							<Card>
								<CardContent className="p-0">
									<div className="h-96 bg-hero-gradient rounded-lg flex items-center justify-center relative">
										{selectedAlgorithm ? (
											<div className="text-center text-white">
												<div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
													{algorithms.find((a) => a.id === selectedAlgorithm)?.icon}
												</div>
												<h3 className="text-2xl font-semibold mb-4">
													{algorithms.find((a) => a.id === selectedAlgorithm)?.name}
												</h3>
												<p className="text-white/80 mb-6">
													Click "Run Algorithm" to start the visualization
												</p>
												{isRunning && (
													<div className="text-sm text-white/60">
														Algorithm is running...
													</div>
												)}
											</div>
										) : (
											<div className="text-center text-white">
												<div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6">
													<Code className="h-10 w-10" />
												</div>
												<h3 className="text-2xl font-semibold mb-4">
													Ready to Experiment
												</h3>
												<p className="text-white/80">
													Select an algorithm to start visualizing
												</p>
											</div>
										)}
									</div>
								</CardContent>
							</Card>

							{/* Information Tabs */}
							<Tabs defaultValue="algorithm-info" className="w-full">
								<TabsList className="grid w-full grid-cols-3">
									<TabsTrigger value="algorithm-info">Algorithm Info</TabsTrigger>
									<TabsTrigger value="complexity">Complexity</TabsTrigger>
									<TabsTrigger value="output">Output</TabsTrigger>
								</TabsList>

								<TabsContent value="algorithm-info">
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center space-x-2">
												<FileText className="h-5 w-5" />
												<span>Algorithm Information</span>
											</CardTitle>
										</CardHeader>
										<CardContent>
											{selectedAlgorithm ? (
												<div className="space-y-4">
													<div>
														<h4 className="font-semibold mb-2">Description</h4>
														<p className="text-muted-foreground">
															{selectedAlgorithm === "bubble-sort" &&
																"Bubble Sort is a simple sorting algorithm that repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order."}
															{selectedAlgorithm === "merge-sort" &&
																"Merge Sort is a divide and conquer algorithm that divides the input array into two halves, calls itself for the two halves, and then merges the two sorted halves."}
															{selectedAlgorithm === "quick-sort" &&
																"Quick Sort is a highly efficient sorting algorithm that uses a divide-and-conquer approach to sort elements by partitioning the array around a pivot."}
															{selectedAlgorithm === "bfs" &&
																"Breadth-First Search is a traversing algorithm where you should start traversing from a selected node and traverse the graph layerwise."}
															{selectedAlgorithm === "dfs" &&
																"Depth-First Search is an algorithm for traversing or searching tree or graph data structures that starts at the root and explores as far as possible along each branch."}
															{![
																"bubble-sort",
																"merge-sort",
																"quick-sort",
																"bfs",
																"dfs",
															].includes(selectedAlgorithm) &&
																"Learn about this algorithm by running the visualization above."}
														</p>
													</div>
													<div>
														<h4 className="font-semibold mb-2">Use Cases</h4>
														<p className="text-muted-foreground">
															Commonly used in data analysis, searching, and optimization
															problems.
														</p>
													</div>
												</div>
											) : (
												<p className="text-muted-foreground">
													Select an algorithm to view detailed information.
												</p>
											)}
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="complexity">
									<Card>
										<CardHeader>
											<CardTitle>Time & Space Complexity</CardTitle>
										</CardHeader>
										<CardContent>
											{selectedAlgorithm ? (
												<div className="grid md:grid-cols-2 gap-4">
													<div>
														<h4 className="font-semibold mb-2">Time Complexity</h4>
														<div className="space-y-1 text-sm">
															<div className="flex justify-between">
																<span>Best Case:</span>
																<code className="bg-muted px-2 py-1 rounded">O(n)</code>
															</div>
															<div className="flex justify-between">
																<span>Average Case:</span>
																<code className="bg-muted px-2 py-1 rounded">
																	O(n log n)
																</code>
															</div>
															<div className="flex justify-between">
																<span>Worst Case:</span>
																<code className="bg-muted px-2 py-1 rounded">O(n²)</code>
															</div>
														</div>
													</div>
													<div>
														<h4 className="font-semibold mb-2">Space Complexity</h4>
														<div className="space-y-1 text-sm">
															<div className="flex justify-between">
																<span>Space:</span>
																<code className="bg-muted px-2 py-1 rounded">O(1)</code>
															</div>
														</div>
													</div>
												</div>
											) : (
												<p className="text-muted-foreground">
													Select an algorithm to view complexity analysis.
												</p>
											)}
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="output">
									<Card>
										<CardHeader>
											<CardTitle>Algorithm Output</CardTitle>
										</CardHeader>
										<CardContent>
											<div className="bg-muted/50 p-4 rounded-lg">
												<pre className="text-sm text-muted-foreground">
													{isRunning
														? "Algorithm is running..."
														: "Run an algorithm to see output"}
												</pre>
											</div>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
