import { useState, useEffect, useCallback } from 'react';
import {
  Plus,
  Loader2,
  MoreHorizontal,
  UserX,
  UserCheck,
  Shield,
  Trash2,
  RefreshCw,
  X,
  Mail,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { RoleBadge, StatusBadge } from '../../../components/shared/StatusBadge.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import InviteDialog from '../components/InviteDialog.jsx';
import RoleSelectDialog from '../components/RoleSelectDialog.jsx';
import membersService from '../../settings/services/membersService.js';
import invitationsService from '../services/invitationsService.js';
import authService from '../../auth/services/authService.js';

function Avatar({ name, email }) {
  const initial = (name || email || '?')[0].toUpperCase();
  return (
    <div className="w-8 h-8 rounded-full bg-[#eff4ff] flex items-center justify-center flex-shrink-0">
      <span className="text-tetri-blue text-xs font-bold">{initial}</span>
    </div>
  );
}

function ActionsMenu({ member, isOwner, currentUserId, onChangeRole, onToggleStatus, onRemove }) {
  const [open, setOpen] = useState(false);
  const isSelf = member.userId === currentUserId;
  const isOwnerMember = member.role === 'owner';

  if (!isOwner || isSelf) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20">
            <button
              onClick={() => { setOpen(false); onChangeRole(member); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg transition-colors"
            >
              <Shield className="w-4 h-4 text-tetri-neutral" />
              Change role
            </button>
            {!isOwnerMember && (
              <button
                onClick={() => { setOpen(false); onToggleStatus(member); }}
                className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-text hover:bg-tetri-bg transition-colors"
              >
                {member.status === 'active' ? (
                  <><UserX className="w-4 h-4 text-tetri-neutral" />Deactivate</>
                ) : (
                  <><UserCheck className="w-4 h-4 text-tetri-neutral" />Activate</>
                )}
              </button>
            )}
            <div className="my-1 border-t border-tetri-border" />
            <button
              onClick={() => { setOpen(false); onRemove(member); }}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-tetri-error hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Remove member
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default function MembersPage() {
  const { showToast, ToastContainer } = useToast();
  const [members, setMembers] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [currentUserId, setCurrentUserId] = useState(null);

  const [showInvite, setShowInvite] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [confirm, setConfirm] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    Promise.all([
      membersService.getMembers(),
      authService.getMe(),
    ])
      .then(([data, me]) => {
        setMembers(data.members || []);
        setInvitations(data.invitations || []);
        setIsOwner(me?.workspace?.role === 'owner');
        setCurrentUserId(me?.user?.id);
      })
      .catch(() => showToast('error', 'Failed to load members'))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleInvite = async (email, role) => {
    await invitationsService.createInvitation(email, role);
    showToast('success', `Invitation sent to ${email}`);
    load();
  };

  const handleChangeRole = (member) => setRoleTarget(member);

  const handleRoleSave = async (memberId, role) => {
    try {
      await membersService.updateRole(memberId, role);
      showToast('success', 'Role updated');
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update role');
    }
  };

  const handleToggleStatus = (member) => {
    const newStatus = member.status === 'active' ? 'inactive' : 'active';
    setConfirm({
      title: newStatus === 'inactive' ? 'Deactivate member?' : 'Activate member?',
      description: newStatus === 'inactive'
        ? `${member.user.fullName || member.user.email} will lose access to the workspace.`
        : `${member.user.fullName || member.user.email} will regain access to the workspace.`,
      confirmLabel: newStatus === 'inactive' ? 'Deactivate' : 'Activate',
      variant: newStatus === 'inactive' ? 'destructive' : 'default',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await membersService.updateStatus(member.id, newStatus);
          showToast('success', `Member ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to update status');
        } finally {
          setActionLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const handleRemove = (member) => {
    setConfirm({
      title: 'Remove member?',
      description: `${member.user.fullName || member.user.email} will be removed from the workspace. This cannot be undone.`,
      confirmLabel: 'Remove',
      variant: 'destructive',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await membersService.removeMember(member.id);
          showToast('success', 'Member removed');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to remove member');
        } finally {
          setActionLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const handleCancelInvitation = (inv) => {
    setConfirm({
      title: 'Cancel invitation?',
      description: `The invitation for ${inv.email} will be cancelled.`,
      confirmLabel: 'Cancel invitation',
      variant: 'destructive',
      onConfirm: async () => {
        setActionLoading(true);
        try {
          await invitationsService.cancelInvitation(inv.id);
          showToast('success', 'Invitation cancelled');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to cancel invitation');
        } finally {
          setActionLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  const handleResendInvitation = async (inv) => {
    try {
      await invitationsService.resendInvitation(inv.id);
      showToast('success', `Invitation resent to ${inv.email}`);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to resend invitation');
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-2 py-16 text-tetri-muted justify-center">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span className="text-sm">Loading members…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 sm:px-8 py-8 max-w-5xl mx-auto">
      <PageHeader title="Members" subtitle="Manage workspace members, roles, and invitations">
        {isOwner && (
          <Button size="sm" onClick={() => setShowInvite(true)}>
            <Plus className="w-3.5 h-3.5" />
            Invite member
          </Button>
        )}
      </PageHeader>

      {/* Members table */}
      <div className="mb-8">
        <p className="text-sm font-semibold text-tetri-text mb-3">
          Workspace members ({members.length})
        </p>
        <div className="bg-white rounded-card border border-tetri-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-tetri-bg border-b border-tetri-border">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Member</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden sm:table-cell">Joined</th>
                {isOwner && <th className="px-5 py-3 w-12" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-tetri-border">
              {members.map((m) => (
                <tr key={m.id} className="hover:bg-tetri-bg/40 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar name={m.user.fullName} email={m.user.email} />
                      <div className="min-w-0">
                        <p className="font-medium text-tetri-text truncate">
                          {m.user.fullName || '—'}
                          {m.userId === currentUserId && (
                            <span className="ml-2 text-xs text-tetri-neutral font-normal">(you)</span>
                          )}
                        </p>
                        <p className="text-xs text-tetri-muted truncate">{m.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <RoleBadge role={m.role} />
                  </td>
                  <td className="px-5 py-4">
                    <StatusBadge status={m.status} />
                  </td>
                  <td className="px-5 py-4 text-xs text-tetri-muted hidden sm:table-cell">
                    {m.joinedAt ? new Date(m.joinedAt).toLocaleDateString() : '—'}
                  </td>
                  {isOwner && (
                    <td className="px-5 py-4">
                      <ActionsMenu
                        member={m}
                        isOwner={isOwner}
                        currentUserId={currentUserId}
                        onChangeRole={handleChangeRole}
                        onToggleStatus={handleToggleStatus}
                        onRemove={handleRemove}
                      />
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pending invitations */}
      {(invitations.length > 0 || isOwner) && (
        <div>
          <p className="text-sm font-semibold text-tetri-text mb-3">
            Pending invitations ({invitations.length})
          </p>

          {invitations.length === 0 ? (
            <div className="bg-white rounded-card border border-dashed border-tetri-border px-6 py-8 text-center">
              <Mail className="w-8 h-8 text-tetri-neutral mx-auto mb-2" />
              <p className="text-sm text-tetri-muted">No pending invitations</p>
            </div>
          ) : (
            <div className="bg-white rounded-card border border-tetri-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-tetri-bg border-b border-tetri-border">
                  <tr>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Email</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Role</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-tetri-neutral uppercase tracking-wide hidden sm:table-cell">Expires</th>
                    {isOwner && <th className="px-5 py-3 text-right text-xs font-semibold text-tetri-neutral uppercase tracking-wide">Actions</th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-tetri-border">
                  {invitations.map((inv) => (
                    <tr key={inv.id} className="hover:bg-tetri-bg/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-3.5 h-3.5 text-tetri-neutral flex-shrink-0" />
                          <span className="text-tetri-text truncate">{inv.email}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <RoleBadge role={inv.role} />
                      </td>
                      <td className="px-5 py-4 text-xs text-tetri-muted hidden sm:table-cell">
                        {new Date(inv.expiresAt).toLocaleDateString()}
                      </td>
                      {isOwner && (
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2 justify-end">
                            <button
                              onClick={() => handleResendInvitation(inv)}
                              className="flex items-center gap-1.5 text-xs text-tetri-neutral hover:text-tetri-text transition-colors px-2 py-1 rounded-lg hover:bg-tetri-bg"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              Resend
                            </button>
                            <button
                              onClick={() => handleCancelInvitation(inv)}
                              className="flex items-center gap-1.5 text-xs text-tetri-neutral hover:text-tetri-error transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
                            >
                              <X className="w-3.5 h-3.5" />
                              Cancel
                            </button>
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Dialogs */}
      <InviteDialog
        open={showInvite}
        onOpenChange={setShowInvite}
        onInvite={handleInvite}
      />

      {roleTarget && (
        <RoleSelectDialog
          open={!!roleTarget}
          onOpenChange={(v) => !v && setRoleTarget(null)}
          member={roleTarget}
          onSave={handleRoleSave}
        />
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          loading={actionLoading}
          onConfirm={confirm.onConfirm}
        />
      )}

      {ToastContainer}
    </div>
  );
}
