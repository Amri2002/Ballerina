import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Header } from "@/components/Navigation/Header";
import DSALessons from "@/components/Dsa/DSALesson";
import DSAPlaygroundComponent from "@/components/Dsa/DSAPlayground";
import DSALessonComponent from "@/components/Dsa/DSALessonComponent";
import DSAPlaygroundFullComponent from "@/components/Dsa/DSAPlaygroundFullComponent";
import DSAChallengesComponent from "@/components/Dsa/DSAChallengesComponent";
import DSAChallengesFullComponent from "@/components/Dsa/DSAChallengesFullComponent";

import { GitBranch, Clock, Users, Award } from "lucide-react";

export default function DSA() {
	const [searchParams, setSearchParams] = useSearchParams();
	const view = searchParams.get("view") || "home";
	const lessonId = searchParams.get("lesson");

	const setView = (newView: string, params?: Record<string, string>) => {
		const newParams = new URLSearchParams();
		newParams.set("view", newView);
		if (params) {
			Object.entries(params).forEach(([key, value]) => {
				newParams.set(key, value);
			});
		}
		setSearchParams(newParams);
	};

	const goHome = () => {
		setSearchParams(new URLSearchParams());
	};

	// Show full page components based on view
	if (view === "lesson" && lessonId) {
		return <DSALessonComponent lessonId={lessonId} onBack={goHome} />;
	}

	if (view === "playground") {
		return <DSAPlaygroundFullComponent onBack={goHome} />;
	}

	if (view === "challenges") {
		return <DSAChallengesFullComponent onBack={goHome} />;
	}

	// Show main DSA page
	return (
		<div className="min-h-screen bg-background">
			<Header />

			{/* Hero Section */}
			<section className="py-16 bg-hero-gradient text-white">
				<div className="container mx-auto px-4">
					<div className="max-w-4xl mx-auto text-center space-y-6">
						<div className="inline-flex items-center px-4 py-2 bg-white/20 rounded-full text-sm font-medium backdrop-blur-sm">
							<GitBranch className="mr-2 h-4 w-4" />
							Data Structures & Algorithms
						</div>

						<h1 className="text-4xl md:text-6xl font-bold leading-tight">
							Visualize Algorithms
							<span className="block text-secondary-foreground">In Real-Time</span>
						</h1>

						<p className="text-xl text-white/80 max-w-2xl mx-auto">
							Master sorting algorithms, tree traversals, and data structures through
							interactive visualizations and step-by-step code execution.
						</p>

						<div className="flex items-center justify-center space-x-8 text-white/60 text-sm">
							<div className="flex items-center">
								<Clock className="mr-2 h-4 w-4" />
								Self-paced
							</div>
							<div className="flex items-center">
								<Users className="mr-2 h-4 w-4" />
								Beginner friendly
							</div>
							<div className="flex items-center">
								<Award className="mr-2 h-4 w-4" />
								Certificate included
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* Learning Content */}
			<section className="py-16">
				<div className="container mx-auto px-4">
					<Tabs defaultValue="lessons" className="max-w-6xl mx-auto">
						<TabsList className="grid w-full grid-cols-3">
							<TabsTrigger value="lessons">Lessons</TabsTrigger>
							<TabsTrigger value="playground">Playground</TabsTrigger>
							<TabsTrigger value="challenges">Challenges</TabsTrigger>
						</TabsList>

						<TabsContent value="lessons" className="mt-8">
							<DSALessons />
						</TabsContent>

						<TabsContent value="playground" className="mt-8">
							<DSAPlaygroundComponent />
						</TabsContent>

						<TabsContent value="challenges" className="mt-8">
							<DSAChallengesComponent />
						</TabsContent>
					</Tabs>
				</div>
			</section>
		</div>
	);
}
