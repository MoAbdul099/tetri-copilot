import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Save, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHeader from '../../../components/shared/PageHeader.jsx';
import { useToast } from '../../../components/shared/Toast.jsx';
import { getAnnouncement, createAnnouncement, updateAnnouncement, publishAnnouncement } from '../services/announcementsService.js';

const PRIORITIES    = ['info', 'important', 'high', 'critical'];
const AUDIENCE_TYPES = ['workspace', 'role', 'all'];
const ROLES         = ['owner', 'admin', 'user', 'viewer'];

export default function AnnouncementFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { showToast, ToastContainer } = useToast();
  const isEdit = !!id;

  const [form, setForm] = useState({
    title: '', summary: '', content: '',
    priority: 'info', audienceType: 'workspace', audienceRoles: [],
    publishAt: '', expiresAt: '',
  });
  const [loading, setLoading]     = useState(isEdit);
  const [saving, setSaving]       = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('draft');

  useEffect(() => {
    if (!isEdit) return;
    getAnnouncement(id)
      .then((a) => {
        setForm({
          title:        a.title,
          summary:      a.summary,
          content:      a.content,
          priority:     a.priority,
          audienceType: a.audienceType,
          audienceRoles: a.audienceRoles || [],
          publishAt:    a.publishAt ? a.publishAt.slice(0, 16) : '',
          expiresAt:    a.expiresAt  ? a.expiresAt.slice(0, 16)  : '',
        });
        setCurrentStatus(a.status);
      })
      .catch(() => showToast('error', 'Failed to load'))
      .finally(() => setLoading(false));
  }, [id]);

  const set = (field) => (e) => setForm((f) => ({ ...f, [field]: e.target.value }));

  const toggleRole = (role) => setForm((f) => ({
    ...f,
    audienceRoles: f.audienceRoles.includes(role)
      ? f.audienceRoles.filter((r) => r !== role)
      : [...f.audienceRoles, role],
  }));

  const handleSave = async () => {
    if (!form.title.trim()) { showToast('error', 'Title is required'); return; }
    setSaving(true);
    try {
      const payload = {
        ...form,
        publishAt: form.publishAt || null,
        expiresAt: form.expiresAt || null,
      };
      if (isEdit) {
        await updateAnnouncement(id, payload);
        showToast('success', 'Saved');
      } else {
        const created = await createAnnouncement(payload);
        showToast('success', 'Created');
        navigate(`/announcements/${created.id}/edit`, { replace: true });
      }
    } catch (e) {
      showToast('error', e?.response?.data?.error || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!isEdit) { showToast('error', 'Save first before publishing'); return; }
    setPublishing(true);
    try {
      await publishAnnouncement(id);
      setCurrentStatus('published');
      showToast('success', 'Published');
    } catch (e) {
      showToast('error', e?.response?.data?.error || 'Failed to publish');
    } finally {
      setPublishing(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 animate-spin text-tetri-neutral" /></div>;

  return (
    <div className="space-y-6">
      {ToastContainer}
      <PageHeader title={isEdit ? 'Edit Announcement' : 'New Announcement'} subtitle={isEdit ? `Status: ${currentStatus}` : 'Create a workspace announcement'}>
        <div className="flex items-center gap-2">
          <button onClick={() => navigate('/announcements')} className="flex items-center gap-1.5 text-sm text-tetri-muted hover:text-tetri-text transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Button variant="outline" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Save className="w-4 h-4 mr-1" />} Save Draft
          </Button>
          {currentStatus !== 'published' && (
            <Button onClick={handlePublish} disabled={publishing}>
              {publishing ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Send className="w-4 h-4 mr-1" />} Publish
            </Button>
          )}
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-5">
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Content</h3>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Title *</label>
              <input type="text" value={form.title} onChange={set('title')} placeholder="Announcement title…" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Summary</label>
              <input type="text" value={form.summary} onChange={set('summary')} placeholder="Brief description shown in notification center…" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Full Message</label>
              <textarea value={form.content} onChange={set('content')} rows={8} placeholder="Full announcement content…" className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 resize-y" />
            </div>
          </div>

          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-6 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Scheduling</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Publish At <span className="text-tetri-neutral font-normal">(optional)</span></label>
                <input type="datetime-local" value={form.publishAt} onChange={set('publishAt')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
              </div>
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Expires At <span className="text-tetri-neutral font-normal">(optional)</span></label>
                <input type="datetime-local" value={form.expiresAt} onChange={set('expiresAt')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20" />
              </div>
            </div>
          </div>
        </div>

        {/* Settings sidebar */}
        <div className="space-y-4">
          <div className="bg-tetri-surface border border-tetri-border rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-tetri-text">Settings</h3>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Priority</label>
              <select value={form.priority} onChange={set('priority')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 capitalize">
                {PRIORITIES.map((p) => <option key={p} value={p} className="capitalize">{p}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-tetri-neutral mb-1.5">Audience</label>
              <select value={form.audienceType} onChange={set('audienceType')} className="w-full px-3 py-2 text-sm border border-tetri-border rounded-xl bg-tetri-surface focus:outline-none focus:ring-2 focus:ring-tetri-blue/20 capitalize">
                {AUDIENCE_TYPES.map((a) => <option key={a} value={a} className="capitalize">{a === 'all' ? 'All members' : a}</option>)}
              </select>
            </div>
            {form.audienceType === 'role' && (
              <div>
                <label className="block text-xs font-medium text-tetri-neutral mb-2">Target Roles</label>
                <div className="space-y-2">
                  {ROLES.map((role) => (
                    <label key={role} className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.audienceRoles.includes(role)} onChange={() => toggleRole(role)} className="rounded" />
                      <span className="text-sm text-tetri-text capitalize">{role}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Priority guide */}
          <div className="bg-tetri-bg border border-tetri-border rounded-2xl p-4">
            <p className="text-xs font-semibold text-tetri-neutral mb-2">Priority Guide</p>
            <div className="space-y-1.5 text-xs text-tetri-muted">
              <p><span className="font-medium text-blue-600">Info</span> — General information</p>
              <p><span className="font-medium text-amber-600">Important</span> — Requires attention</p>
              <p><span className="font-medium text-orange-600">High</span> — Requires action</p>
              <p><span className="font-medium text-red-600">Critical</span> — Immediate awareness</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
