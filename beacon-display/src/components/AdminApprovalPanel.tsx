import { useState, useEffect } from "react";
import { api } from "@/services/api";
import { useMongoAuth } from "@/hooks/useMongoAuth";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Loader2,
  Lock,
} from "lucide-react";
import { toast } from "sonner";

interface PendingAdmin {
  _id: string;
  email: string;
  name: string;
  role: string;
  created_at: string;
}

interface ApprovedAdmin {
  _id: string;
  email: string;
  name: string;
  role: string;
  approvedAt: string;
}

export function AdminApprovalPanel() {
  const { isSuperAdmin } = useMongoAuth();
  const [pendingAdmins, setPendingAdmins] = useState<PendingAdmin[]>([]);
  const [approvedAdmins, setApprovedAdmins] = useState<ApprovedAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // Only super admin can access this panel
  if (!isSuperAdmin) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3 text-amber-800">
            <Lock className="w-5 h-5" />
            <div>
              <p className="font-semibold">Admin Approvals Restricted</p>
              <p className="text-sm text-amber-700">
                Only the super admin can manage admin approvals and permissions.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  useEffect(() => {
    loadApprovals();
  }, []);

  const loadApprovals = async () => {
    try {
      setIsLoading(true);
      const [pending, approved] = await Promise.all([
        api.auth.getPendingApprovals(),
        api.auth.getApprovedAdmins(),
      ]);
      setPendingAdmins(pending.users || []);
      setApprovedAdmins(approved.users || []);
    } catch (error) {
      console.error("Failed to load approvals:", error);
      toast.error("Failed to load admin approvals");
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (adminId: string, adminName: string) => {
    try {
      setIsProcessing(adminId);
      await api.auth.approveAdmin(adminId);
      toast.success(`Approved ${adminName}`);

      // Update local state
      setPendingAdmins(pendingAdmins.filter((a) => a._id !== adminId));
      await loadApprovals();
    } catch (error) {
      console.error("Failed to approve admin:", error);
      toast.error("Failed to approve admin");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = async (adminId: string, adminName: string) => {
    try {
      setIsProcessing(adminId);
      await api.auth.rejectAdmin(adminId);
      toast.success(`Rejected ${adminName}`);

      // Update local state
      setPendingAdmins(pendingAdmins.filter((a) => a._id !== adminId));
      await loadApprovals();
    } catch (error) {
      console.error("Failed to reject admin:", error);
      toast.error("Failed to reject admin");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRemoveAdmin = async (adminId: string, adminName: string) => {
    try {
      setIsProcessing(adminId);
      await api.auth.removeAdmin(adminId);
      toast.success(`Removed admin privileges from ${adminName}`);

      // Update local state
      setApprovedAdmins(approvedAdmins.filter((a) => a._id !== adminId));
      await loadApprovals();
    } catch (error) {
      console.error("Failed to remove admin:", error);
      toast.error("Failed to remove admin");
    } finally {
      setIsProcessing(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Approvals */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-500" />
            <div>
              <CardTitle>Pending Admin Requests</CardTitle>
              <CardDescription>
                {pendingAdmins.length}{" "}
                {pendingAdmins.length === 1 ? "request" : "requests"} awaiting
                approval
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {pendingAdmins.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No pending admin requests</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {admin.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Requested on{" "}
                      {new Date(admin.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleReject(admin._id, admin.name)}
                      disabled={isProcessing !== null}
                      className="gap-1"
                    >
                      <XCircle className="w-4 h-4" />
                      Reject
                    </Button>
                    <Button
                      variant="glow"
                      size="sm"
                      onClick={() => handleApprove(admin._id, admin.name)}
                      disabled={isProcessing !== null}
                      className="gap-1"
                    >
                      {isProcessing === admin._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Approve
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Admins */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            <div>
              <CardTitle>Approved Admins</CardTitle>
              <CardDescription>
                {approvedAdmins.length}{" "}
                {approvedAdmins.length === 1 ? "admin" : "admins"} with access
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {approvedAdmins.length === 0 ? (
            <div className="py-8 text-center text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No approved admins yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {approvedAdmins.map((admin) => (
                <div
                  key={admin._id}
                  className="flex items-center justify-between p-4 rounded-lg border border-green-200/50 bg-green-50/30 dark:bg-green-950/20"
                >
                  <div className="flex-1">
                    <p className="font-medium flex items-center gap-2">
                      {admin.name}
                      <span className="text-xs px-2 py-1 bg-green-200/50 dark:bg-green-800/50 rounded text-green-700 dark:text-green-300">
                        Approved
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {admin.email}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Approved on{" "}
                      {new Date(admin.approvedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveAdmin(admin._id, admin.name)}
                    disabled={isProcessing !== null}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    {isProcessing === admin._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Remove Admin
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Pending admins cannot log in until you approve them. Only approve
          trusted users.
        </AlertDescription>
      </Alert>
    </div>
  );
}
