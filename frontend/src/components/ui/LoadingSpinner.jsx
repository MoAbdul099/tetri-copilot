export default function LoadingSpinner({ fullScreen = true, message = 'Loading…' }) {
  const wrapper = fullScreen
    ? 'min-h-screen flex flex-col items-center justify-center bg-gray-50'
    : 'flex flex-col items-center justify-center py-12';

  return (
    <div className={wrapper}>
      <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      {message && <p className="mt-3 text-sm text-gray-500">{message}</p>}
    </div>
  );
}
