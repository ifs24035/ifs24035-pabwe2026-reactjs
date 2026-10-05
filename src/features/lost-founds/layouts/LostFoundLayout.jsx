import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { removeAccessToken } from '../../../helpers/apiHelper';
import { showWarningDialog } from '../../../helpers/toolsHelper';
import { setIsAuthLoginActionCreator } from '../../auth/states/action';
import { asyncGetProfile } from '../../users/states/action';
import NavbarComponent from '../components/NavbarComponent';
import SidebarComponent from '../components/SidebarComponent';

function LostFoundLayout() {
  const dispatch = useDispatch();
  const isAuthLogin = useSelector((states) => states.isAuthLogin);
  const isProfile = useSelector((states) => states.isProfile);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Verifikasi token dengan memuat profil; jika gagal, sesi dianggap berakhir
  useEffect(() => {
    if (isAuthLogin && !isProfile) {
      dispatch(asyncGetProfile()).then((success) => {
        if (!success) {
          removeAccessToken();
          dispatch(setIsAuthLoginActionCreator(false));
          showWarningDialog('Sesi kamu telah berakhir. Silakan login kembali.');
        }
      });
    }
  }, [isAuthLogin, isProfile, dispatch]);

  if (!isAuthLogin) {
    return <Navigate to="/auth/login" replace />;
  }

  if (!isProfile) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <img src="/logo.svg" alt="Logo Lost & Founds" className="h-14 w-14 animate-pulse rounded-2xl shadow-lg" />
        <h1 className="text-sm font-medium text-slate-600">Memuat sesi...</h1>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <NavbarComponent onToggleSidebar={() => setSidebarOpen((prev) => !prev)} />
      <SidebarComponent
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <main className="pt-16 lg:pl-64">
        <div className="mx-auto max-w-6xl p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default LostFoundLayout;