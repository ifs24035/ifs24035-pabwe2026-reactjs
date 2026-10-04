import {
  FiBarChart2,
  FiGrid,
  FiUser,
  FiUsers,
} from 'react-icons/fi';
import { Link, useLocation } from 'react-router-dom';

const MENU_ITEMS = [
  {
    label: 'Dashboard',
    to: '/',
    icon: FiGrid,
    isActive: ({ pathname, hash }) =>
      (pathname === '/' && hash !== '#statistik') ||
      pathname.startsWith('/lost-founds'),
  },
  {
    label: 'Statistik',
    to: '/#statistik',
    icon: FiBarChart2,
    isActive: ({ pathname, hash }) =>
      pathname === '/' && hash === '#statistik',
  },
  {
    label: 'Pengguna',
    to: '/users',
    icon: FiUsers,
    isActive: ({ pathname }) => pathname.startsWith('/users'),
  },
  {
    label: 'Profil Saya',
    to: '/profile',
    icon: FiUser,
    isActive: ({ pathname }) => pathname.startsWith('/profile'),
  },
];

function SidebarComponent({ open, onClose }) {
  const location = useLocation();

  return (
    <>
      {/* Overlay (mobile) */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`fixed inset-0 z-30 bg-slate-900/40 backdrop-blur-sm transition-opacity lg:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 flex w-64 flex-col overflow-y-auto border-r border-slate-200 bg-white p-4 transition-transform duration-300 lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <p className="mb-3 px-3 text-xs font-bold tracking-wider text-slate-400 uppercase">
          Menu Utama
        </p>

        <nav className="space-y-1">
          {MENU_ITEMS.map(({ label, to, icon: Icon, isActive }) => {
            const active = isActive(location);

            return (
              <Link
                key={label}
                to={to}
                onClick={onClose}
                aria-current={active ? 'page' : undefined}
                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                  active
                    ? 'bg-brand-50 text-brand-700'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon
                  className={`h-5 w-5 ${active ? 'text-brand-600' : 'text-slate-400'}`}
                />
                {label}
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto rounded-2xl bg-linear-to-br from-brand-600 to-violet-600 p-4 text-white">
          <p className="text-sm font-bold">Barangmu hilang?</p>
          <p className="mt-1 text-xs text-brand-100">
            Buat laporan dari halaman Dashboard agar cepat ditemukan.
          </p>
        </div>
      </aside>
    </>
  );
}

export default SidebarComponent;