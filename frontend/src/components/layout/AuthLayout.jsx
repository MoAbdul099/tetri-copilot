export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-tetri-bg flex flex-col items-center justify-center px-4 py-12">
      <div className="mb-8 flex flex-col items-center">
        <img
          src="/logo.svg"
          alt="Tetri Copilot"
          className="h-10 w-auto"
          draggable={false}
        />
      </div>
      {children}
    </div>
  );
}
