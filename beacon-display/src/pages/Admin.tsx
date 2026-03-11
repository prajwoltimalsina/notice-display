import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMongoAuth } from "@/hooks/useMongoAuth";
import { useNotices } from "@/hooks/useNotices";
import { Header } from "@/components/Header";
import { NoticeForm } from "@/components/NoticeForm";
import { NoticeList } from "@/components/NoticeList";
import { AdminApprovalPanel } from "@/components/AdminApprovalPanel";
import { Loader2, Plus, List, LayoutGrid, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const { user, isAdminApproved, isLoading: authLoading } = useMongoAuth();
  const { notices, isLoading: noticesLoading } = useNotices();
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/auth");
      } else if (!isAdminApproved) {
        navigate("/dashboard");
      }
    }
  }, [user, isAdminApproved, authLoading, navigate]);

  if (authLoading || noticesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || !isAdminApproved) {
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 pt-20 pb-8 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Admin Header */}
          <div className="flex items-center justify-between mb-6 animate-fade-in">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <p className="text-muted-foreground">
                  Manage notices and contents
                </p>
              </div>
            </div>
            <Button
              variant="glow"
              className="gap-2"
              onClick={() => setShowForm(!showForm)}
            >
              <Plus className="w-4 h-4" />
              {showForm ? "Hide Form" : "New Notice"}
            </Button>
          </div>

          {/* Create Notice Form */}
          {showForm && (
            <div className="glass-panel p-6 mb-6 animate-fade-in">
              <h2 className="text-xl font-semibold mb-4">Create New Notice</h2>
              <NoticeForm onSuccess={() => setShowForm(false)} />
            </div>
          )}

          {/* Notices Management */}
          <Tabs
            defaultValue="all"
            className="animate-fade-in"
            style={{ animationDelay: "0.2s" }}
          >
            <TabsList className="mb-4">
              <TabsTrigger value="all" className="gap-2">
                <LayoutGrid className="w-4 h-4" />
                All Notices
              </TabsTrigger>
              <TabsTrigger value="published" className="gap-2">
                <List className="w-4 h-4" />
                Published
              </TabsTrigger>
              <TabsTrigger value="drafts" className="gap-2">
                <List className="w-4 h-4" />
                Drafts
              </TabsTrigger>
              <TabsTrigger value="approvals" className="gap-2">
                <Users className="w-4 h-4" />
                Admin Approval
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all">
              <NoticeList notices={notices} />
            </TabsContent>

            <TabsContent value="published">
              <NoticeList notices={notices.filter((n) => n.is_published)} />
            </TabsContent>

            <TabsContent value="drafts">
              <NoticeList notices={notices.filter((n) => !n.is_published)} />
            </TabsContent>

            <TabsContent value="approvals" className="animate-fade-in">
              <AdminApprovalPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
