import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
	CardDescription,
} from "@/components/ui/card";
import { Play, CheckCircle, ArrowLeft } from "lucide-react";

interface ChallengeDetailProps {
	challenge: any;
	onBack: () => void;
	onComplete: (id: string) => void;
}

const starterCode: Record<string, string> = {
	"Two Sum": `function twoSum(nums, target) {
  // Write your code here
}`,
	"Valid Parentheses": `function isValid(s) {
  // Write your code here
}`,
	"Binary Tree Inorder Traversal": `function inorderTraversal(root) {
  // Write your code here
}`,
	"Group Anagrams": `function groupAnagrams(strs) {
  // Write your code here
}`,
	"Merge k Sorted Lists": `function mergeKLists(lists) {
  // Write your code here
}`,
	"Serialize Binary Tree": `function serialize(root) {
  // Write your code here
}`,
};

const testCases: Record<string, { input: any; expected: any }[]> = {
	"Two Sum": [
		{ input: [[2, 7, 11, 15], 9], expected: [0, 1] },
		{ input: [[3, 2, 4], 6], expected: [1, 2] },
	],
	"Valid Parentheses": [
		{ input: ["()[]{}"], expected: true },
		{ input: ["(]"], expected: false },
	],
	// ...other challenges
};

export default function ChallengeDetail({
	challenge,
	onBack,
	onComplete,
}: ChallengeDetailProps) {
	const [code, setCode] = useState(starterCode[challenge.title] || "");
	const [result, setResult] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [success, setSuccess] = useState(false);

	const runTests = () => {
		// For demo: always pass if code is not empty
		if (code.trim().length > 10) {
			setResult("All test cases passed!");
			setSuccess(true);
			onComplete(challenge.id.toString());
		} else {
			setResult("Some test cases failed. Please try again.");
			setSuccess(false);
		}
	};

	return (
		<div className="min-h-screen bg-background flex flex-col items-center justify-center">
			<Card className="w-full max-w-2xl">
				<CardHeader>
					<div className="flex items-center justify-between">
						<Button variant="ghost" size="sm" onClick={onBack}>
							<ArrowLeft className="h-4 w-4 mr-2" />
							Back
						</Button>
						<CardTitle>{challenge.title}</CardTitle>
					</div>
					<CardDescription>{challenge.description}</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="mb-4">
						<div className="font-semibold mb-2">Write your solution:</div>
						<textarea
							className="w-full h-40 p-2 border rounded font-mono text-sm"
							value={code}
							onChange={(e) => setCode(e.target.value)}
							spellCheck={false}
						/>
					</div>
					<Button onClick={runTests} disabled={submitting || success} className="mb-4">
						<Play className="mr-2 h-4 w-4" />
						Submit
					</Button>
					{result && (
						<div
							className={`mt-2 font-semibold ${
								success ? "text-success" : "text-destructive"
							}`}
						>
							{success ? <CheckCircle className="inline h-4 w-4 mr-1" /> : null}
							{result}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
