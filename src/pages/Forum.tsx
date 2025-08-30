import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Header } from "@/components/Navigation/Header";
import { useAuth } from "@/contexts/AuthContext";

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
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Student Forum</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Thread List */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>All Threads</CardTitle>
                <CardDescription>Click a thread to view and reply</CardDescription>
              </CardHeader>
              <CardContent>
                {threads.length === 0 ? (
                  <p className="text-muted-foreground">No threads yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {threads.map((thread) => (
                      <li key={thread.id} className="flex items-center gap-2">
                        <Button variant="ghost" className="w-full text-left" onClick={() => setSelectedThread(thread)}>
                          <span className="font-semibold">{thread.title}</span>
                          <span className="block text-xs text-muted-foreground">by {thread.author}</span>
                        </Button>
                        {user && (user.name === thread.author || user.email === thread.author) && (
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => { setPendingDelete(thread); setShowDeleteModal(true); }}
                            disabled={loading}
                          >
                            Delete
                          </Button>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
            {/* Create Thread */}
            <Card>
              <CardHeader>
                <CardTitle>Start a New Thread</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Input
                  placeholder="Title"
                  value={newThread.title}
                  onChange={e => setNewThread({ ...newThread, title: e.target.value })}
                  disabled={loading}
                />
                <Textarea
                  placeholder="Describe your problem or topic..."
                  value={newThread.content}
                  onChange={e => setNewThread({ ...newThread, content: e.target.value })}
                  rows={4}
                  disabled={loading}
                />
                <Button onClick={handleCreateThread} disabled={loading || !newThread.title || !newThread.content}>
                  {loading ? "Posting..." : "Post Thread"}
                </Button>
              </CardContent>
            </Card>
          </div>
          {/* Thread Details & Replies */}
          <div className="lg:col-span-2">
            {threadDetails ? (
              <Card>
                <CardHeader>
                  <CardTitle>{threadDetails.thread.title}</CardTitle>
                  <CardDescription>by {threadDetails.thread.author} • {threadDetails.thread.timestamp}</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4">{threadDetails.thread.content}</p>
                  {user && (user.name === threadDetails.thread.author || user.email === threadDetails.thread.author) && (
                    <Button
                      variant="destructive"
                      size="sm"
                      className="mb-4"
                      onClick={() => { setPendingDelete(threadDetails.thread); setShowDeleteModal(true); }}
                      disabled={loading}
                    >
                      Delete Thread
                    </Button>
                  )}
                  <h3 className="font-semibold mb-2">Replies</h3>
                  {threadDetails.replies.length === 0 ? (
                    <p className="text-muted-foreground">No replies yet.</p>
                  ) : (
                    <ul className="space-y-2 mb-4">
                      {threadDetails.replies.map((reply) => (
                        <li key={reply.id} className="border rounded p-2">
                          <div className="text-sm font-medium">{reply.author} <span className="text-xs text-muted-foreground">{reply.timestamp}</span></div>
                          <div className="text-base">{reply.content}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="flex gap-2 mt-2">
                    <Textarea
                      placeholder="Write a reply..."
                      value={reply}
                      onChange={e => setReply(e.target.value)}
                      rows={2}
                      disabled={loading}
                    />
                    <Button onClick={handleReply} disabled={loading || !reply}>
                      {loading ? "Posting..." : "Reply"}
                    </Button>
                  </div>
                  <Button variant="ghost" className="mt-4" onClick={() => { setSelectedThread(null); setThreadDetails(null); }}>
                    Back to Threads
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardHeader>
                  <CardTitle>Select a thread to view details and replies</CardTitle>
                </CardHeader>
              </Card>
            )}
          </div>
        </div>
      </div>
      {/* Confirm Delete Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Delete</DialogTitle>
          </DialogHeader>
          <p>Are you sure you want to delete this thread? This action cannot be undone.</p>
          <DialogFooter>
            <Button variant="ghost" onClick={() => { setShowDeleteModal(false); setPendingDelete(null); }}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteThread} disabled={loading}>
              {loading ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
