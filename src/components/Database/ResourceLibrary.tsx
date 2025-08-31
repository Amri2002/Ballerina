import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Play, FileText, Star } from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  url: string;
  category: "article" | "video";
}

// Static list of resources curated by your team
const resources: Resource[] = [
  {
    id: "yt1",
    title: "Intro to Databases (YouTube)",
    description: "A video introduction to databases by our team.",
    url: "https://www.youtube.com/embed/9Pzj7Aj25lw",
    category: "video",
  },
  {
    id: "yt2",
    title: "SQL Crash Course (YouTube)",
    description: "Learn SQL basics in this team-produced video.",
    url: "https://www.youtube.com/embed/HXV3zeQKqGY",
    category: "video",
  },
  {
    id: "art1",
    title: "Understanding ACID Properties",
    description: "A deep dive article into ACID properties in databases.",
    url: "https://yourteam.com/articles/acid-properties",
    category: "article",
  },
  {
    id: "art2",
    title: "Entity Relationship Diagrams Explained",
    description: "Team-written guide to ER diagrams.",
    url: "https://yourteam.com/articles/er-diagrams",
    category: "article",
  },
  // Networking resources
  {
    id: "net1",
    title: "OSI Model Explained (YouTube)",
    description: "A video guide to the OSI networking model.",
    url: "https://www.youtube.com/embed/5cEbZV6b6bA",
    category: "video",
  },
  {
    id: "net2",
    title: "Subnetting Made Simple",
    description: "Team article on subnetting concepts and practice.",
    url: "https://yourteam.com/articles/subnetting",
    category: "article",
  },
  // DSA resources
  {
    id: "dsa1",
    title: "Data Structures Crash Course (YouTube)",
    description: "Learn core data structures in this team video.",
    url: "https://www.youtube.com/embed/RBSGKlAvoiM",
    category: "video",
  },
  {
    id: "dsa2",
    title: "Mastering Algorithms",
    description: "Team-written article on essential algorithms.",
    url: "https://yourteam.com/articles/algorithms",
    category: "article",
  },
];

const ResourceLibrary: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [ratings, setRatings] = useState<{ [id: string]: { avg: number; count: number; userRating?: number } }>({});
  const [submitting, setSubmitting] = useState<string | null>(null);

  useEffect(() => {
    resources.forEach((r) => {
      fetchRatings(r.id);
    });
    // eslint-disable-next-line
  }, [isAuthenticated, user?.id]);

  const fetchRatings = async (resourceId: string) => {
    try {
      const res = await axios.get(`/api/resources/${resourceId}/ratings`);
      const allRatings = res.data as Array<{ userId: string; rating: number }>;
      const avg = allRatings.length ? allRatings.reduce((a, b) => a + b.rating, 0) / allRatings.length : 0;
      const userRating = isAuthenticated ? allRatings.find(r => r.userId === user?.id)?.rating : undefined;
      setRatings(prev => ({ ...prev, [resourceId]: { avg, count: allRatings.length, userRating } }));
    } catch {
      setRatings(prev => ({ ...prev, [resourceId]: { avg: 0, count: 0 } }));
    }
  };

  const handleRate = async (resourceId: string, rating: number) => {
    if (!isAuthenticated || !user?.id) return;
    setSubmitting(resourceId);
    try {
      await axios.post(`/api/resources/${resourceId}/rate`, { userId: user.id, rating });
      fetchRatings(resourceId);
    } finally {
      setSubmitting(null);
    }
  };

  const getCategoryIcon = (category: string) => {
    return category === "video" ? <Play className="h-4 w-4" /> : <FileText className="h-4 w-4" />;
  };

  const getCategoryColor = (category: string) => {
    return category === "video" ? "bg-blue-500/10 text-blue-700 border-blue-200" : "bg-green-500/10 text-green-700 border-green-200";
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Resource Library</h1>
        <p className="text-muted-foreground text-lg">Curated learning materials for computer science topics</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
        {resources.map((resource) => (
          <Card key={resource.id} className="group hover:shadow-md transition-all duration-200 border-border/50">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2 group-hover:text-primary transition-colors">
                    {resource.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {resource.description}
                  </CardDescription>
                </div>
                <Badge 
                  variant="outline" 
                  className={`flex items-center gap-1 ${getCategoryColor(resource.category)}`}
                >
                  {getCategoryIcon(resource.category)}
                  {resource.category}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {resource.category === "video" ? (
                <div className="relative">
                  <iframe
                    src={resource.url}
                    title={resource.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-48 rounded-md border"
                  />
                </div>
              ) : (
                <Button variant="outline" className="w-full" asChild>
                  <a
                    href={resource.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Read Article
                  </a>
                </Button>
              )}

              <div className="border-t pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">Rating:</span>
                    <StarDisplay value={ratings[resource.id]?.avg || 0} />
                    <span className="text-sm text-muted-foreground">
                      ({ratings[resource.id]?.count || 0} votes)
                    </span>
                  </div>
                </div>

                {isAuthenticated && (
                  <div className="flex items-center gap-2 pt-2 border-t">
                    <span className="text-sm text-muted-foreground">Your rating:</span>
                    <StarInput
                      value={ratings[resource.id]?.userRating || 0}
                      onChange={val => handleRate(resource.id, val)}
                      disabled={submitting === resource.id}
                    />
                    {submitting === resource.id && (
                      <span className="text-xs text-muted-foreground ml-2">Saving...</span>
                    )}
                  </div>
                )}

                {!isAuthenticated && (
                  <p className="text-xs text-muted-foreground pt-2 border-t">
                    Sign in to rate this resource
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

// Star display component
function StarDisplay({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star 
          key={i} 
          className={`h-4 w-4 ${
            i <= rounded 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );
}

// Star input component
function StarInput({ 
  value, 
  onChange, 
  disabled 
}: { 
  value: number; 
  onChange: (v: number) => void; 
  disabled?: boolean; 
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Button
          key={i}
          variant="ghost"
          size="sm"
          className={`p-0 h-auto hover:scale-110 transition-transform ${
            disabled ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={() => !disabled && onChange(i)}
          disabled={disabled}
        >
          <Star 
            className={`h-4 w-4 ${
              i <= value 
                ? "fill-yellow-400 text-yellow-400" 
                : "text-muted-foreground hover:text-yellow-400"
            }`}
          />
        </Button>
      ))}
    </div>
  );
}

export default ResourceLibrary;