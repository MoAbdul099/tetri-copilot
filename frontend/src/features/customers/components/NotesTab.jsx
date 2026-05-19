import { useState, useEffect } from 'react';
import { Plus, Loader2, Pencil, Trash2, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '../../../components/shared/Toast.jsx';
import ConfirmDialog from '../../../components/shared/ConfirmDialog.jsx';
import { listNotes, createNote, updateNote, deleteNote } from '../services/customersService.js';

function NoteEditor({ initial = '', onSave, onCancel, loading, placeholder = 'Write a note…' }) {
  const [text, setText] = useState(initial);

  return (
    <div className="space-y-2">
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder}
        rows={3}
        className="w-full rounded-xl border border-tetri-border bg-white px-3 py-2.5 text-sm text-tetri-text placeholder:text-tetri-neutral focus:outline-none focus:ring-2 focus:ring-tetri-blue focus:border-transparent resize-none"
      />
      <div className="flex items-center gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel} disabled={loading}>
          <X className="w-3.5 h-3.5" />
          Cancel
        </Button>
        <Button size="sm" onClick={() => onSave(text)} disabled={loading || !text.trim()}>
          {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
          Save
        </Button>
      </div>
    </div>
  );
}

export default function NotesTab({ customerId }) {
  const { showToast, ToastContainer } = useToast();
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [confirmLoading, setConfirmLoading] = useState(false);

  const load = async () => {
    try {
      const data = await listNotes(customerId);
      setNotes(data || []);
    } catch {
      showToast('error', 'Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [customerId]);

  const handleAdd = async (text) => {
    setSaving(true);
    try {
      await createNote(customerId, text);
      showToast('success', 'Note added');
      setShowAdd(false);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to add note');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (noteId, text) => {
    setSaving(true);
    try {
      await updateNote(noteId, text);
      showToast('success', 'Note updated');
      setEditingId(null);
      load();
    } catch (err) {
      showToast('error', err?.response?.data?.error || 'Failed to update note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = (note) => {
    setConfirm({
      title: 'Delete note?',
      description: 'This note will be permanently deleted.',
      confirmLabel: 'Delete',
      variant: 'destructive',
      onConfirm: async () => {
        setConfirmLoading(true);
        try {
          await deleteNote(note.id);
          showToast('success', 'Note deleted');
          load();
        } catch (err) {
          showToast('error', err?.response?.data?.error || 'Failed to delete note');
        } finally {
          setConfirmLoading(false);
          setConfirm(null);
        }
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 py-8 text-tetri-muted">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading notes…</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-tetri-text">Notes ({notes.length})</p>
        {!showAdd && (
          <Button size="sm" variant="outline" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add note
          </Button>
        )}
      </div>

      {showAdd && (
        <div className="bg-tetri-bg rounded-xl p-4">
          <NoteEditor onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={saving} />
        </div>
      )}

      {notes.length === 0 && !showAdd ? (
        <div className="text-center py-10 border border-dashed border-tetri-border rounded-xl">
          <p className="text-sm text-tetri-muted">No notes yet</p>
          <Button size="sm" variant="outline" className="mt-3" onClick={() => setShowAdd(true)}>
            <Plus className="w-3.5 h-3.5" />
            Add first note
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {notes.map((note) => (
            <div key={note.id} className="bg-white rounded-xl border border-tetri-border p-4">
              {editingId === note.id ? (
                <NoteEditor
                  initial={note.noteText}
                  onSave={(text) => handleUpdate(note.id, text)}
                  onCancel={() => setEditingId(null)}
                  loading={saving}
                />
              ) : (
                <>
                  <p className="text-sm text-tetri-text whitespace-pre-wrap">{note.noteText}</p>
                  <div className="flex items-center justify-between mt-3">
                    <p className="text-xs text-tetri-neutral">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setEditingId(note.id)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg hover:text-tetri-text transition-colors"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(note)}
                        className="p-1.5 rounded-lg text-tetri-neutral hover:bg-red-50 hover:text-tetri-error transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      {confirm && (
        <ConfirmDialog
          open={!!confirm}
          onOpenChange={(v) => !v && setConfirm(null)}
          title={confirm.title}
          description={confirm.description}
          confirmLabel={confirm.confirmLabel}
          variant={confirm.variant}
          loading={confirmLoading}
          onConfirm={confirm.onConfirm}
        />
      )}
      {ToastContainer}
    </div>
  );
}
