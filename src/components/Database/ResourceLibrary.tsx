
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

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
  const [loading, setLoading] = useState(false);
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

  return (
    <div className="max-w-3xl mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Resource Library</h1>
      <ul className="space-y-6">
        {resources.map((r) => (
          <li key={r.id} className="bg-white shadow rounded p-6">
            <div className="font-bold text-lg mb-2">{r.title}</div>
            <div className="text-gray-700 mb-2">{r.description}</div>
            {r.category === "video" ? (
              <div className="aspect-w-16 aspect-h-9 mb-2">
                <iframe
                  src={r.url}
                  title={r.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-64 rounded"
                ></iframe>
              </div>
            ) : (
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Read Article
              </a>
            )}
            <div className="mt-4 flex items-center space-x-2">
              <span className="font-medium">Rating:</span>
              <StarDisplay value={ratings[r.id]?.avg || 0} />
              <span className="text-sm text-gray-500">({ratings[r.id]?.count || 0})</span>
            </div>
            {isAuthenticated && (
              <div className="mt-2">
                <span className="text-sm mr-2">Your Rating:</span>
                <StarInput
                  value={ratings[r.id]?.userRating || 0}
                  onChange={val => handleRate(r.id, val)}
                  disabled={submitting === r.id}
                />
                {submitting === r.id && <span className="ml-2 text-xs text-gray-400">Submitting...</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

// Star display component
function StarDisplay({ value }: { value: number }) {
  const rounded = Math.round(value * 2) / 2;
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <span key={i} className={i <= rounded ? "text-yellow-400" : "text-gray-300"}>
          ★
        </span>
      ))}
    </span>
  );
}

// Star input component
function StarInput({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled?: boolean }) {
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          className={
            "text-xl mx-0.5 " + (i <= value ? "text-yellow-400" : "text-gray-300") + (disabled ? " opacity-50 cursor-not-allowed" : "")
          }
          onClick={() => !disabled && onChange(i)}
          disabled={disabled}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default ResourceLibrary;
