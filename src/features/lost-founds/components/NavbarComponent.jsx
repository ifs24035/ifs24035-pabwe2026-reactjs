import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FiChevronDown, FiLogOut, FiMenu, FiUser } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import { showConfirmDialog } from '../../../helpers/toolsHelper';
import { asyncSetIsAuthLogout } from '../../auth/states/action';

function NavbarComponent({ onToggleSidebar }) {
  const dispatch = useDispatch();
  const profile = useSelector((states) => states.profile);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  // Tutup dropdown saat klik di luar area menu
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setOpen(false);

    const confirmed = await showConfirmDialog(
      'Keluar dari akun?',
      'Kamu harus login kembali untuk mengakses laporan.',
      'Ya, keluar',
    );

    if (confirmed) {
      dispatch(asyncSetIsAuthLogout());
    }
  };

  return (
    <header className="fixed inset-x-0 top-0 z-50 h-16 border-b border-slate-200 bg-white/80 backdrop-blur-lg">
      <div className="flex h-full items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onToggleSidebar}
            aria-label="Buka menu"
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-600 transition hover:bg-slate-100 lg:hidden"
          >
            <FiMenu className="h-5 w-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.svg"
              alt="Logo Lost & Founds"
              className="h-9 w-9 rounded-xl shadow-sm"
            />
            <span className="text-lg font-extrabold tracking-tight text-slate-900">
              Lost <span className="text-brand-600">&amp;</span> Founds
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 sm:inline-flex">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Sesi aktif
          </span>

          <div ref={menuRef} className="relative">
            <button
              type="button"
              onClick={() => setOpen((prev) => !prev)}
              aria-haspopup="menu"
              aria-expanded={open}
              aria-label={`Menu akun ${profile.name}`}
              className="flex cursor-pointer items-center gap-2 rounded-full py-1 pr-2 pl-1 transition hover:bg-slate-100"
            >
              <Avatar decorative name={profile.name} photo={profile.photo} size="sm" />
              <span className="hidden max-w-32 truncate text-sm font-semibold text-slate-700 md:block">
                {profile.name}
              </span>
              <FiChevronDown
                className={`text-slate-400 transition ${open ? 'rotate-180' : ''}`}
              />
            </button>

            {open && (
              <div
                role="menu"
                className="absolute right-0 mt-2 w-60 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xl shadow-slate-200/70"
              >
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-bold text-slate-800">
                    {profile.name}
                  </p>
                  <p className="truncate text-xs text-slate-600">
                    {profile.email}
                  </p>
                </div>
                <div className="p-2">
                  <Link
                    to="/profile"
                    role="menuitem"
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    <FiUser className="text-slate-400" />
                    Profil Saya
                  </Link>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={handleLogout}
                    className="flex w-full cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50"
                  >
                    <FiLogOut />
                    Keluar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

NavbarComponent.propTypes = {
  onToggleSidebar: PropTypes.func.isRequired,
};

export default NavbarComponent;