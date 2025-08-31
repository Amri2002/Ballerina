import { useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { dsaService } from "@/services/dsaService";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Clock, ArrowRight, BarChart3, TreePine, Hash, Layers } from "lucide-react";
const algorithms = [
	{
		id: "sorting",
		title: "Sorting Algorithms",
		description: "Visualize bubble sort, merge sort, quicksort and more",
		duration: "45 min",
		difficulty: "Beginner",
		completed: false,
		icon: <BarChart3 className="h-5 w-5" />,
	},
	{
		id: "trees",
		title: "Tree Traversals",
		description: "DFS, BFS, and tree manipulation algorithms",
		duration: "60 min",
		difficulty: "Intermediate",
		completed: false,
		icon: <TreePine className="h-5 w-5" />,
	},
	{
		id: "hashing",
		title: "Hash Tables",
		description: "Hash functions, collision resolution, and performance",
		duration: "40 min",
		difficulty: "Intermediate",
		completed: false,
		icon: <Hash className="h-5 w-5" />,
	},
	{
		id: "stacks-queues",
		title: "Stacks & Queues",
		description: "LIFO and FIFO data structures with real-world examples",
		duration: "35 min",
		difficulty: "Beginner",
		completed: false,
		icon: <Layers className="h-5 w-5" />,
	},
];

export default function DSALessons() {
	const [, setSearchParams] = useSearchParams();
	const [completedLessons, setCompletedLessons] = useState<string[]>([]);

	const difficultyColors = {
		Beginner: "border-success text-success",
		Intermediate: "border-warning text-warning",
		Advanced: "border-destructive text-destructive",
	};

	useEffect(() => {
		dsaService.getUserProgress().then((data) => {
			setCompletedLessons(data.completedLessons || []);
		});
	}, []);

	const handleStartLesson = (algorithmId: string) => {
		const newParams = new URLSearchParams();
		newParams.set("view", "lesson");
		newParams.set("lesson", algorithmId);
		setSearchParams(newParams);
	};

	return (
		<div className="grid gap-6">
			{algorithms.map((algorithm, index) => (
				<Card
					key={algorithm.id}
					className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
				>
					<CardHeader className="pb-4">
						<div className="flex items-start justify-between">
							<div className="flex items-center space-x-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
									{algorithm.icon}
								</div>
								<div>
									<CardTitle className="text-lg font-semibold">
										{algorithm.title}
										{completedLessons.includes(algorithm.id) && (
											<span className="ml-2 text-success text-base">(Completed)</span>
										)}
									</CardTitle>
									<CardDescription className="text-muted-foreground">
										{algorithm.description}
									</CardDescription>
								</div>
							</div>
							<div className="flex items-center space-x-2">
								<Badge
									variant="outline"
									className={
										difficultyColors[
											algorithm.difficulty as keyof typeof difficultyColors
										]
									}
								>
									{algorithm.difficulty}
								</Badge>
								<Badge variant="outline" className="text-muted-foreground">
									<Clock className="mr-1 h-3 w-3" />
									{algorithm.duration}
								</Badge>
							</div>
						</div>
					</CardHeader>

					<CardContent>
						<div className="flex items-center justify-between">
							<div className="text-sm text-muted-foreground">
								Lesson {index + 1} of {algorithms.length}
							</div>
							<Button
								className="bg-hero-gradient hover:opacity-90 transition-opacity"
								onClick={() => handleStartLesson(algorithm.id)}
							>
								<Play className="mr-2 h-4 w-4" />
								Start Lesson
								<ArrowRight className="ml-2 h-4 w-4" />
							</Button>
						</div>
					</CardContent>
				</Card>
			))}
		</div>
	);
}
