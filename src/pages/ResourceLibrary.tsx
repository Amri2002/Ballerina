import ResourceLibrary from "@/components/Database/ResourceLibrary";
import { Header } from "@/components/Navigation/Header";

export default function ResourceLibraryPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <ResourceLibrary />
    </div>
  );
}
