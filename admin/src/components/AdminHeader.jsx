import { useState } from 'react';
import { Menu, ChevronDown, LogOut, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function AdminHeader({ onMenuToggle }) {
  const { admin, signOut } = useAuth();
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/login');
  };

  return (
    <header className="h-14 bg-white border-b border-tetri-border flex items-center px-4 gap-4 flex-shrink-0">
      {/* Mobile hamburger */}
      <button
        onClick={onMenuToggle}
        className="lg:hidden p-1.5 rounded-lg text-tetri-neutral hover:bg-tetri-bg transition-colors"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Breadcrumb / page title slot — children could go here in future */}
      <div className="flex-1" />

      {/* Admin user menu */}
      <div className="relative">
        <button
          onClick={() => setDropdownOpen((v) => !v)}
          className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-tetri-bg transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-tetri-primary/10 flex items-center justify-center">
            <User className="w-4 h-4 text-tetri-primary" />
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-xs font-semibold text-tetri-text leading-tight">
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className="text-xs text-tetri-neutral leading-tight capitalize">{admin?.role}</p>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-tetri-neutral" />
        </button>

        {dropdownOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 w-48 bg-white border border-tetri-border rounded-xl shadow-lg py-1 z-20">
              <div className="px-3.5 py-2.5 border-b border-tetri-border">
                <p className="text-xs font-semibold text-tetri-text">{admin?.email}</p>
                <p className="text-xs text-tetri-neutral capitalize">{admin?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm text-tetri-error hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" /> Sign out
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
