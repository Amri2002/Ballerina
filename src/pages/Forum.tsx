import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Header } from "@/components/Navigation/Header";
import { useAuth } from "@/contexts/AuthContext";
import { 
  MessageSquare, 
  Plus, 
  Trash2, 
  Send, 
  ArrowLeft, 
  Users, 
  Clock,
  MessageCircle,
  User
} from "lucide-react";

function fetchThreads() {
  return fetch("/api/forum/threads").then(res => res.json());
}
function fetchThread(id) {
  return fetch(`/api/forum/thread/${id}`).then(res => res.json());
}
function createThread(data) {
  return fetch("/api/forum/thread", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
}
function postReply(data) {
  return fetch("/api/forum/reply", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(res => res.json());
}

export default function Forum() {
  const { user } = useAuth();
  const [threads, setThreads] = useState([]);
  const [selectedThread, setSelectedThread] = useState(null);
  const [threadDetails, setThreadDetails] = useState(null);
  const [newThread, setNewThread] = useState({ title: "", content: "" });
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  useEffect(() => {
    fetchThreads().then(data => setThreads(Array.isArray(data) ? data : []));
  }, []);

  useEffect(() => {
    if (selectedThread) {
      fetchThread(selectedThread.id).then(setThreadDetails);
    }
  }, [selectedThread]);

  const handleCreateThread = async () => {
    setLoading(true);
    const res = await createThread({
      title: newThread.title,
      content: newThread.content,
      author: user?.name || user?.email || "Anonymous"
    });
    setNewThread({ title: "", content: "" });
    setLoading(false);
    fetchThreads().then(setThreads);
  };

  const handleDeleteThread = async () => {
    if (!user || !pendingDelete) return;
    const { id, author } = pendingDelete;
    const requester = user?.name || user?.email || "Anonymous";
    if (requester !== author) return;
    setLoading(true);
    await fetch(`/api/forum/thread/${id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ author: requester })
    });
    setLoading(false);
    setSelectedThread(null);
    setThreadDetails(null);
    setShowDeleteModal(false);
    setPendingDelete(null);
    fetchThreads().then(setThreads);
  };

  const handleReply = async () => {
    if (!reply) return;
    setLoading(true);
    await postReply({
      threadId: threadDetails.thread.id,
      content: reply,
      author: user?.name || user?.email || "Anonymous"
    });
    setReply("");
    setLoading(false);
    fetchThread(threadDetails.thread.id).then(setThreadDetails);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 bg-primary/10 rounded-lg">
              <MessageSquare className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Student Forum</h1>
              <p className="text-muted-foreground">Connect with fellow students and get help</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{threads.length} active threads</span>
            </div>
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              <span>Community discussions</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Thread List */}
          <div className="xl:col-span-1 space-y-6">
            {/* Create Thread Card */}
            <Card className="border-dashed border-2 hover:border-primary/50 transition-colors">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Start New Discussion</CardTitle>
                </div>
                <CardDescription>Share your question or topic with the community</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="What's your question about?"
                    value={newThread.title}
                    onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                    disabled={loading}
                    className="focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe your problem or topic in detail..."
                    value={newThread.content}
                    onChange={e => setNewThread({ ...newThread, content: e.target.value })}
                    rows={3}
                    disabled={loading}
                    className="focus:ring-primary resize-none"
                  />
                </div>
                <Button 
                  onClick={handleCreateThread} 
                  disabled={loading || !newThread.title || !newThread.content}
                  className="w-full"
                  size="lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {loading ? "Creating..." : "Create Thread"}
                </Button>
              </CardContent>
            </Card>

            {/* Threads List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Discussions
                </CardTitle>
                <CardDescription>Browse and join ongoing conversations</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {threads.length === 0 ? (
                  <div className="p-6 text-center">
                    <MessageSquare className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                    <p className="text-muted-foreground font-medium">No discussions yet</p>
                    <p className="text-sm text-muted-foreground">Be the first to start a conversation!</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {threads.map((thread, index) => (
                      <div key={thread.id} className="p-4 hover:bg-muted/50 transition-colors">
                        <div className="flex items-start justify-between gap-3">
                          <button 
                            className="flex-1 text-left space-y-2"
                            onClick={() => setSelectedThread(thread)}
                          >
                            <h3 className="font-semibold line-clamp-2 hover:text-primary transition-colors">
                              {thread.title}
                            </h3>
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                <span>{thread.author}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{thread.timestamp || 'Just now'}</span>
                              </div>
                            </div>
                          </button>
                          {user && (thread.author === user.name || thread.author === user.email) && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => { setPendingDelete(thread); setShowDeleteModal(true); }}
                              disabled={loading}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Thread Details & Replies */}
          <div className="xl:col-span-2">
            {threadDetails ? (
              <Card className="h-fit">
                <CardHeader className="border-b">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl leading-tight">{threadDetails.thread.title}</CardTitle>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4" />
                          <span className="font-medium">{threadDetails.thread.author}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{threadDetails.thread.timestamp || 'Just now'}</span>
                        </div>
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" />
                          {threadDetails.replies.length} replies
                        </Badge>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { setSelectedThread(null); setThreadDetails(null); }}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Back
                    </Button>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-6">
                  {/* Original Post */}
                  <div className="space-y-4">
                    <div className="prose prose-sm max-w-none">
                      <p className="text-base leading-relaxed">{threadDetails.thread.content}</p>
                    </div>
                    
                    {user && (threadDetails.thread.author === user.name || threadDetails.thread.author === user.email) && (
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => { setPendingDelete(threadDetails.thread); setShowDeleteModal(true); }}
                        disabled={loading}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Thread
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Replies Section */}
                  <div className="space-y-4">
                    <h3 className="font-semibold flex items-center gap-2">
                      <MessageCircle className="h-5 w-5" />
                      Replies ({threadDetails.replies.length})
                    </h3>
                    
                    {threadDetails.replies.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageCircle className="h-12 w-12 text-muted-foreground/50 mx-auto mb-3" />
                        <p className="text-muted-foreground font-medium">No replies yet</p>
                        <p className="text-sm text-muted-foreground">Be the first to respond!</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {threadDetails.replies.map((reply) => (
                          <div key={reply.id} className="bg-muted/30 rounded-lg p-4 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 text-sm">
                                <div className="flex items-center gap-1 font-medium">
                                  <User className="h-3 w-3" />
                                  {reply.author}
                                </div>
                                <span className="text-muted-foreground">•</span>
                                <div className="flex items-center gap-1 text-muted-foreground">
                                  <Clock className="h-3 w-3" />
                                  {reply.timestamp || 'Just now'}
                                </div>
                              </div>
                            </div>
                            <p className="text-base leading-relaxed">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <Separator />

                  {/* Reply Form */}
                  <div className="space-y-4">
                    <h4 className="font-medium flex items-center gap-2">
                      <Send className="h-4 w-4" />
                      Post a Reply
                    </h4>
                    <div className="flex gap-3">
                      <Textarea
                        placeholder="Share your thoughts or help solve the problem..."
                        value={reply}
                        onChange={e => setReply(e.target.value)}
                        rows={3}
                        disabled={loading}
                        className="flex-1 resize-none focus:ring-primary"
                      />
                      <Button 
                        onClick={handleReply} 
                        disabled={loading || !reply}
                        size="lg"
                        className="self-end"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {loading ? "Posting..." : "Reply"}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="h-96 flex items-center justify-center">
                <div className="text-center space-y-3">
                  <MessageSquare className="h-16 w-16 text-muted-foreground/50 mx-auto" />
                  <div>
                    <CardTitle className="text-lg mb-2">Select a Discussion</CardTitle>
                    <CardDescription>Choose a thread from the sidebar to view details and join the conversation</CardDescription>
                  </div>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Confirm Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <p>Are you sure you want to delete this thread?</p>
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
              <p className="text-sm text-destructive font-medium">This action cannot be undone and will permanently remove the thread and all its replies.</p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => { setShowDeleteModal(false); setPendingDelete(null); }}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteThread} 
              disabled={loading}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              {loading ? "Deleting..." : "Delete Thread"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}