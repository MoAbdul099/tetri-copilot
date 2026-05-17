import { Label } from '@/components/ui/label';

export default function Field({ label, id, hint, error, children }) {
  return (
    <div className="space-y-1.5">
      {label && <Label htmlFor={id}>{label}</Label>}
      {children}
      {hint && <p className="text-xs text-tetri-neutral">{hint}</p>}
      {error && <p className="text-xs text-tetri-error">{error}</p>}
    </div>
  );
}
