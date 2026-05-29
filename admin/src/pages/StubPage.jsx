import { Construction } from 'lucide-react';

export default function StubPage({ title }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center space-y-3">
      <div className="w-14 h-14 rounded-2xl bg-tetri-bg border border-tetri-border flex items-center justify-center">
        <Construction className="w-6 h-6 text-tetri-neutral" />
      </div>
      <h2 className="text-lg font-semibold text-tetri-text">{title}</h2>
      <p className="text-sm text-tetri-neutral max-w-xs">
        This section is coming in a future slice. The navigation is wired and ready.
      </p>
    </div>
  );
}
