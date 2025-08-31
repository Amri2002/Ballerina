import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Navigation/Header";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { Award, Calendar, Edit2, Mail, UserCircle2 } from "lucide-react";

export default function Profile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProfile() {
      setLoading(true);
      try {
        const res = await fetch("/api/auth/me", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        }
      } catch (err) {
        setProfile(null);
      } finally {
        setLoading(false);
      }
    }
    fetchProfile();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-foreground mb-6">Profile</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Card */}
          <Card className="md:col-span-1">
            <CardHeader className="flex flex-col items-center">
              <UserCircle2 className="h-16 w-16 text-primary mb-2" />
              <CardTitle className="text-xl text-foreground">{profile?.name || user?.name || "User"}</CardTitle>
              <CardDescription className="text-muted-foreground">{profile?.role || "Student"}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center text-muted-foreground">
                <Mail className="h-4 w-4 mr-2" />
                {profile?.email || user?.email}
              </div>
              <div className="flex items-center text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined: {profile?.createdAt?.slice(0, 10) || "-"}
              </div>
                {/* Removed Edit Profile button */}
            </CardContent>
          </Card>

          {/* Achievements & Stats */}
          <div className="md:col-span-2 space-y-6">
            {/* Removed Completed Modules feature */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <UserCircle2 className="mr-2 h-5 w-5" /> Account Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Name:</span>
                    <span className="text-foreground">{profile?.name || user?.name || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Email:</span>
                    <span className="text-foreground">{profile?.email || user?.email || "-"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Role:</span>
                    <span className="text-foreground">{profile?.role || "Student"}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Joined:</span>
                    <span className="text-foreground">{profile?.createdAt?.slice(0, 10) || "-"}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
