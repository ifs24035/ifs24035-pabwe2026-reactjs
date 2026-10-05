import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';

const AuthLayout = lazy(() => import('./features/auth/layouts/AuthLayout'));
const LoginPage = lazy(() => import('./features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('./features/auth/pages/RegisterPage'));
const LostFoundLayout = lazy(
  () => import('./features/lost-founds/layouts/LostFoundLayout'),
);
const DetailPage = lazy(() => import('./features/lost-founds/pages/DetailPage'));
const HomePage = lazy(() => import('./features/lost-founds/pages/HomePage'));
const ProfilePage = lazy(() => import('./features/users/pages/ProfilePage'));
const UsersPage = lazy(() => import('./features/users/pages/UsersPage'));

function PageLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <h1 className="text-sm font-medium text-slate-600">Memuat halaman...</h1>
    </main>
  );
}

function App() {
  return (
    <Suspense fallback={<PageLoading />}>
      <Routes>
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>

        <Route path="/" element={<LostFoundLayout />}>
          <Route index element={<HomePage />} />
          <Route path="lost-founds/:id" element={<DetailPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;