import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Play } from "lucide-react";

export default function DSAPlaygroundComponent() {
	const [, setSearchParams] = useSearchParams();

	const handleNavigateToPlayground = () => {
		const newParams = new URLSearchParams();
		newParams.set("view", "playground");
		setSearchParams(newParams);
	};

	return (
		<Card className="h-96 flex items-center justify-center">
			<div className="text-center space-y-4">
				<div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary mx-auto">
					<Play className="h-8 w-8" />
				</div>
				<h3 className="text-xl font-semibold">Interactive Playground</h3>
				<p className="text-muted-foreground max-w-md">
					Experiment with algorithms using custom input data. Test edge cases and see how
					algorithms perform with different datasets.
				</p>
				<Button
					className="bg-hero-gradient hover:opacity-90 transition-opacity"
					onClick={handleNavigateToPlayground}
				>
					Launch Playground
				</Button>
			</div>
		</Card>
	);
}
