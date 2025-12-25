import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Shield, Eye, UserX, Trash2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/axios';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function PrivacySettings() {
  const { user, refreshUser, logout } = useAuth();
  const [readReceipts, setReadReceipts] = useState(true);
  const [lastSeen, setLastSeen] = useState(true);

  useEffect(() => {
    if (user?.privacy) {
      setReadReceipts(user.privacy.readReceipts);
      setLastSeen(user.privacy.lastSeen);
    }
  }, [user]);

  const handlePrivacyUpdate = async (key: 'readReceipts' | 'lastSeen', value: boolean) => {
    // Optimistic update
    if (key === 'readReceipts') setReadReceipts(value);
    if (key === 'lastSeen') setLastSeen(value);

    try {
      await api.put('/users/privacy', {
        readReceipts: key === 'readReceipts' ? value : readReceipts,
        lastSeen: key === 'lastSeen' ? value : lastSeen,
      });
      toast.success('Privacy settings updated');
      await refreshUser();
    } catch (error) {
      console.error(error);
      toast.error('Failed to update privacy settings');
      // Revert on failure
      if (key === 'readReceipts') setReadReceipts(!value);
      if (key === 'lastSeen') setLastSeen(!value);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await api.delete('/users/account');
      toast.success('Account deleted successfully');
      await logout();
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete account');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h3 className="text-lg font-medium">Privacy & Security</h3>
        <p className="text-sm text-muted-foreground">
          Control who can see your activity and contact you.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Read Receipts</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Let others know when you've read their messages.
            </p>
          </div>
          <Switch 
            checked={readReceipts}
            onCheckedChange={(checked) => handlePrivacyUpdate('readReceipts', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <Label className="text-base">Last Seen</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Show when you were last active.
            </p>
          </div>
           <Switch 
            checked={lastSeen}
            onCheckedChange={(checked) => handlePrivacyUpdate('lastSeen', checked)}
          />
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4">Blocked Users</h3>
        <div className="text-center py-8 border-2 border-dashed rounded-lg">
          <UserX className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-4">
            You haven't blocked anyone yet.
          </p>
          <Button variant="outline" size="sm">Manage Block List</Button>
        </div>
      </div>

      <div className="pt-4 border-t">
        <h3 className="text-lg font-medium mb-4 text-destructive">Danger Zone</h3>
        <div className="flex items-center justify-between rounded-lg border border-destructive/50 bg-destructive/5 p-4">
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <Trash2 className="h-4 w-4 text-destructive" />
              <Label className="text-base text-destructive">Delete Account</Label>
            </div>
            <p className="text-sm text-muted-foreground">
              Permanently delete your account and all data.
            </p>
          </div>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm">Delete Account</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete your account
                  and remove your data from our servers.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Account
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  );
}