import { useState, useEffect } from "react";
import { dsaService } from "@/services/dsaService";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
	ArrowLeft,
	ArrowRight,
	Play,
	Pause,
	RotateCcw,
	SkipForward,
	Clock,
	Code,
	Eye,
	CheckCircle,
	Circle,
	BarChart3,
	TreePine,
	Hash,
	Layers,
} from "lucide-react";

interface DSALessonComponentProps {
	lessonId: string;
	onBack: () => void;
}

const lessons = {
	sorting: {
		title: "Sorting Algorithms",
		description: "Learn and visualize different sorting algorithms",
		icon: <BarChart3 className="h-5 w-5" />,
		difficulty: "Beginner",
		duration: "45 min",
		steps: [
			{ id: 1, title: "Introduction to Sorting", completed: true },
			{ id: 2, title: "Bubble Sort", completed: true },
			{ id: 3, title: "Selection Sort", completed: false },
			{ id: 4, title: "Insertion Sort", completed: false },
			{ id: 5, title: "Merge Sort", completed: false },
			{ id: 6, title: "Quick Sort", completed: false },
		],
		currentStep: 3,
		code: `function bubbleSort(arr) {
  const n = arr.length;
  
  for (let i = 0; i < n - 1; i++) {
    for (let j = 0; j < n - i - 1; j++) {
      if (arr[j] > arr[j + 1]) {
        // Swap elements
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
      }
    }
  }
  
  return arr;
}`,
		explanation:
			"Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.",
	},
	trees: {
		title: "Tree Traversals",
		description: "Master tree data structures and traversal algorithms",
		icon: <TreePine className="h-5 w-5" />,
		difficulty: "Intermediate",
		duration: "60 min",
		steps: [
			{ id: 1, title: "Binary Tree Basics", completed: false },
			{ id: 2, title: "In-order Traversal", completed: false },
			{ id: 3, title: "Pre-order Traversal", completed: false },
			{ id: 4, title: "Post-order Traversal", completed: false },
			{ id: 5, title: "Level-order Traversal", completed: false },
			{ id: 6, title: "Tree Search Algorithms", completed: false },
		],
		currentStep: 1,
		code: `function inorderTraversal(root) {
  if (root === null) return;
  
  // Traverse left subtree
  inorderTraversal(root.left);
  
  // Visit root
  console.log(root.val);
  
  // Traverse right subtree
  inorderTraversal(root.right);
}`,
		explanation:
			"In-order traversal visits nodes in the order: left subtree, root, right subtree. For binary search trees, this produces values in sorted order.",
	},
	hashing: {
		title: "Hash Tables",
		description: "Understand hash functions and collision resolution",
		icon: <Hash className="h-5 w-5" />,
		difficulty: "Intermediate",
		duration: "40 min",
		steps: [
			{ id: 1, title: "Hash Function Basics", completed: false },
			{ id: 2, title: "Collision Handling", completed: false },
			{ id: 3, title: "Chaining Method", completed: false },
			{ id: 4, title: "Open Addressing", completed: false },
			{ id: 5, title: "Performance Analysis", completed: false },
		],
		currentStep: 1,
		code: `class HashTable {
  constructor(size = 10) {
    this.table = new Array(size);
    this.size = size;
  }
  
  hash(key) {
    return key.toString().length % this.size;
  }
  
  set(key, value) {
    const index = this.hash(key);
    this.table[index] = [key, value];
  }
  
  get(key) {
    const index = this.hash(key);
    return this.table[index];
  }
}`,
		explanation:
			"Hash tables use a hash function to compute an index into an array of buckets or slots, from which the desired value can be found.",
	},
	"stacks-queues": {
		title: "Stacks & Queues",
		description: "Learn LIFO and FIFO data structures",
		icon: <Layers className="h-5 w-5" />,
		difficulty: "Beginner",
		duration: "35 min",
		steps: [
			{ id: 1, title: "Stack Implementation", completed: false },
			{ id: 2, title: "Stack Operations", completed: false },
			{ id: 3, title: "Queue Implementation", completed: false },
			{ id: 4, title: "Queue Operations", completed: false },
			{ id: 5, title: "Real-world Applications", completed: false },
		],
		currentStep: 1,
		code: `class Stack {
  constructor() {
    this.items = [];
  }
  
  push(element) {
    this.items.push(element);
  }
  
  pop() {
    if (this.isEmpty()) return null;
    return this.items.pop();
  }
  
  peek() {
    return this.items[this.items.length - 1];
  }
  
  isEmpty() {
    return this.items.length === 0;
  }
}`,
		explanation:
			"A stack is a linear data structure that follows the Last In First Out (LIFO) principle. Elements are added and removed from the same end.",
	},
};

export default function DSALessonComponent({
	lessonId,
	onBack,
}: DSALessonComponentProps) {
	const [currentStep, setCurrentStep] = useState(1);
	const [completedSteps, setCompletedSteps] = useState<number[]>([]);
	const [progress, setProgress] = useState(0);
	const [completedLessons, setCompletedLessons] = useState<string[]>([]);
	const [notFound, setNotFound] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);

	const lesson = lessons[lessonId as keyof typeof lessons];

	useEffect(() => {
		if (!lesson) {
			setNotFound(true);
			return;
		} else {
			setNotFound(false);
		}
		setCurrentStep(1);
		setCompletedSteps([]);
		setProgress(0);
		dsaService.getUserProgress().then((data) => {
			setCompletedLessons(data.completedLessons || []);
		});
	}, [lessonId]);

	useEffect(() => {
		if (!lesson) return;
		const totalSteps = lesson.steps.length;
		setProgress((completedSteps.length / totalSteps) * 100);
		if (completedSteps.length === totalSteps) {
			dsaService.markCompleted(lessonId, "lesson").catch(() => {});
		}
	}, [completedSteps, lesson, lessonId]);

	if (notFound) {
		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-background">
				<div className="bg-white p-8 rounded-lg shadow-md text-center">
					<h2 className="text-2xl font-bold mb-4 text-destructive">Lesson Not Found</h2>
					<p className="mb-6 text-muted-foreground">
						The lesson you are looking for does not exist or is unavailable.
					</p>
					<Button onClick={onBack} variant="outline">
						Back to Lessons
					</Button>
				</div>
			</div>
		);
	}

	const difficultyColors = {
		Beginner: "border-success text-success",
		Intermediate: "border-warning text-warning",
		Advanced: "border-destructive text-destructive",
	};

	const handlePlayPause = () => setIsPlaying((prev) => !prev);
	const handleReset = () => {
		setIsPlaying(false);
		setCurrentStep(1);
		setCompletedSteps([]);
	};
	const handleNext = () => {
		if (!lesson) return;
		if (!completedSteps.includes(currentStep)) {
			setCompletedSteps((prev) => [...prev, currentStep]);
		}
		if (currentStep < lesson.steps.length) {
			setCurrentStep((prev) => prev + 1);
		}
	};
	const handlePrev = () => {
		if (currentStep > 1) setCurrentStep((prev) => prev - 1);
	};
	const handleStepClick = (stepId: number) => {
		setCurrentStep(stepId);
	};

	return (
		<div className="min-h-screen bg-background">
			{/* Lesson Header */}
			<section className="border-b bg-muted/30">
				<div className="container mx-auto px-4 py-6">
					<div className="flex items-center justify-between">
						<div className="flex items-center space-x-4">
							<Button variant="ghost" size="sm" onClick={onBack}>
								<ArrowLeft className="h-4 w-4 mr-2" />
								Back to DSA
							</Button>
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
									{lesson.icon}
								</div>
								<div>
									<h1 className="text-2xl font-bold">
										{lesson.title}
										{completedLessons.includes(lessonId) && (
											<span className="ml-2 text-success text-base">(Completed)</span>
										)}
									</h1>
									<p className="text-muted-foreground">{lesson.description}</p>
								</div>
							</div>
						</div>
						<div className="flex items-center space-x-2">
							<Badge
								variant="outline"
								className={
									difficultyColors[lesson.difficulty as keyof typeof difficultyColors]
								}
							>
								{lesson.difficulty}
							</Badge>
							<Badge variant="outline" className="text-muted-foreground">
								<Clock className="mr-1 h-3 w-3" />
								{lesson.duration}
							</Badge>
						</div>
					</div>

					{/* Progress */}
					<div className="mt-4">
						<div className="flex items-center justify-between mb-2">
							<span className="text-sm text-muted-foreground">
								Step {lesson.currentStep} of {lesson.steps.length}
							</span>
							<span className="text-sm text-muted-foreground">
								{Math.round(progress)}% Complete
							</span>
						</div>
						<Progress value={progress} className="h-2" />
					</div>
				</div>
			</section>

			{/* Main Content */}
			<section className="py-8">
				<div className="container mx-auto px-4">
					<div className="grid lg:grid-cols-12 gap-8">
						{/* Steps Sidebar */}
						<div className="lg:col-span-3">
							<Card>
								<CardHeader>
									<CardTitle className="text-lg">Lesson Steps</CardTitle>
								</CardHeader>
								<CardContent className="space-y-2">
									{lesson.steps.map((step) => (
										<div
											key={step.id}
											className={`flex items-center space-x-3 p-3 rounded-lg transition-colors cursor-pointer ${
												step.id === currentStep
													? "bg-primary/10 border border-primary/20"
													: "hover:bg-muted/50"
											}`}
											onClick={() => handleStepClick(step.id)}
										>
											{completedSteps.includes(step.id) ? (
												<CheckCircle className="h-5 w-5 text-success" />
											) : (
												<Circle className="h-5 w-5 text-muted-foreground" />
											)}
											<span
												className={`text-sm ${
													step.id === currentStep
														? "font-medium text-primary"
														: "text-muted-foreground"
												}`}
											>
												{step.title}
											</span>
										</div>
									))}
								</CardContent>
							</Card>
						</div>

						{/* Main Content */}
						<div className="lg:col-span-9 space-y-6">
							{/* Video/Visualization Area */}
							<Card>
								<CardContent className="p-0">
									<div className="h-64 bg-hero-gradient rounded-t-lg flex items-center justify-center relative">
										<div className="text-center text-white">
											<div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
												<Eye className="h-8 w-8" />
											</div>
											<h3 className="text-xl font-semibold mb-2">
												{lesson.steps[currentStep - 1]?.title}
											</h3>
											<p className="text-white/80">
												Step {currentStep} Visualization Placeholder
											</p>
										</div>

										{/* Control Buttons */}
										<div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center space-x-2">
											<Button variant="secondary" size="sm" onClick={handlePlayPause}>
												{isPlaying ? (
													<Pause className="h-4 w-4" />
												) : (
													<Play className="h-4 w-4" />
												)}
											</Button>
											<Button variant="secondary" size="sm" onClick={handleReset}>
												<RotateCcw className="h-4 w-4" />
											</Button>
											<Button
												variant="secondary"
												size="sm"
												onClick={handleNext}
												disabled={currentStep === lesson.steps.length}
											>
												<SkipForward className="h-4 w-4" />
											</Button>
										</div>
									</div>
								</CardContent>
							</Card>

							{/* Tabs for Code and Explanation */}
							<Tabs defaultValue="explanation" className="w-full">
								<TabsList className="grid w-full grid-cols-2">
									<TabsTrigger value="explanation">Explanation</TabsTrigger>
									<TabsTrigger value="code">Code</TabsTrigger>
								</TabsList>

								<TabsContent value="explanation">
									<Card>
										<CardHeader>
											<CardTitle>How it Works</CardTitle>
										</CardHeader>
										<CardContent>
											<p className="text-muted-foreground leading-relaxed">
												{lesson.explanation}
											</p>
										</CardContent>
									</Card>
								</TabsContent>

								<TabsContent value="code">
									<Card>
										<CardHeader>
											<CardTitle className="flex items-center space-x-2">
												<Code className="h-5 w-5" />
												<span>Implementation</span>
											</CardTitle>
										</CardHeader>
										<CardContent>
											<pre className="bg-muted p-4 rounded-lg overflow-x-auto">
												<code className="text-sm">{lesson.code}</code>
											</pre>
										</CardContent>
									</Card>
								</TabsContent>
							</Tabs>

							{/* Navigation */}
							<div className="flex items-center justify-between">
								<Button
									variant="outline"
									onClick={handlePrev}
									disabled={currentStep === 1}
								>
									Previous Step
								</Button>
								{currentStep < lesson.steps.length ? (
									<Button
										className="bg-hero-gradient hover:opacity-90 transition-opacity"
										onClick={handleNext}
									>
										Next Step
										<ArrowRight className="ml-2 h-4 w-4" />
									</Button>
								) : (
									<Button className="bg-success text-white" onClick={onBack}>
										Finish Lesson
									</Button>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}
