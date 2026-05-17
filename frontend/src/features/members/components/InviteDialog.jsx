import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Field from '../../../components/shared/Field.jsx';

export default function InviteDialog({ open, onOpenChange, onInvite }) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('user');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async () => {
    const trimmed = email.trim();
    if (!trimmed) return;
    setLoading(true);
    setError('');
    try {
      await onInvite(trimmed, role);
      setEmail('');
      setRole('user');
      onOpenChange(false);
    } catch (err) {
      setError(err?.response?.data?.error || 'Failed to send invitation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <Field label="Email address" id="inv-email" error={error}>
            <Input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              placeholder="colleague@company.com"
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              disabled={loading}
            />
          </Field>
          <Field label="Role" id="inv-role">
            <Select value={role} onValueChange={setRole} disabled={loading}>
              <SelectTrigger id="inv-role">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="user">User — operational access</SelectItem>
                <SelectItem value="viewer">Viewer — read-only access</SelectItem>
              </SelectContent>
            </Select>
          </Field>
        </div>

        <DialogFooter>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSubmit} disabled={loading || !email.trim()}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Send invitation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
