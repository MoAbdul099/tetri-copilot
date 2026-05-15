export default function LoadingSpinner({ fullScreen = true, message = 'Loading…' }) {
  const wrapper = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-tetri-bg'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={wrapper}>
      <div className="w-8 h-8 border-4 border-tetri-blue border-t-transparent rounded-full animate-spin" />
      {message && <p className="mt-3 text-sm text-tetri-muted">{message}</p>}
    </div>
  );
}
