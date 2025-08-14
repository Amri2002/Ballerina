import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Award } from "lucide-react";

export default function DSAChallengesComponent() {
  const [, setSearchParams] = useSearchParams();

  const handleNavigateToChallenges = () => {
    const newParams = new URLSearchParams();
    newParams.set('view', 'challenges');
    setSearchParams(newParams);
  };

  return (
    <Card className="h-96 flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-accent/10 flex items-center justify-center text-accent mx-auto">
          <Award className="h-8 w-8" />
        </div>
        <h3 className="text-xl font-semibold">Coding Challenges</h3>
        <p className="text-muted-foreground max-w-md">
          Put your knowledge to the test with hands-on coding challenges. Get instant feedback and hints when you're stuck.
        </p>
        <Button className="bg-hero-gradient hover:opacity-90 transition-opacity" onClick={handleNavigateToChallenges}>
          Start Challenges
        </Button>
      </div>
    </Card>
  );
}