import { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

export default function RoleSelectDialog({ open, onOpenChange, member, onSave }) {
  const [role, setRole] = useState(member?.role || 'user');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (role === member?.role) { onOpenChange(false); return; }
    setLoading(true);
    try {
      await onSave(member.id, role);
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change role</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-tetri-muted">
          Updating role for <span className="font-medium text-tetri-text">{member?.user?.fullName || member?.user?.email}</span>
        </p>
        <Field label="New role" id="role-select">
          <Select value={role} onValueChange={setRole} disabled={loading}>
            <SelectTrigger id="role-select">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="owner">Owner — full workspace access</SelectItem>
              <SelectItem value="user">User — operational access</SelectItem>
              <SelectItem value="viewer">Viewer — read-only access</SelectItem>
            </SelectContent>
          </Select>
        </Field>
        <DialogFooter>
          <Button variant="outline" className="flex-1" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button className="flex-1" onClick={handleSave} disabled={loading}>
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
