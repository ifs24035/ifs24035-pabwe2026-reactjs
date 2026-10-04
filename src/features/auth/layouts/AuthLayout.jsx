import { FiCheckCircle, FiMapPin, FiShield } from 'react-icons/fi';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';

const FEATURES = [
  {
    icon: FiMapPin,
    title: 'Laporkan dengan cepat',
    text: 'Catat barang hilang atau temuan hanya dalam hitungan detik.',
  },
  {
    icon: FiCheckCircle,
    title: 'Pantau status laporan',
    text: 'Lihat perkembangan laporan sampai barang kembali ke pemiliknya.',
  },
  {
    icon: FiShield,
    title: 'Aman dan terpusat',
    text: 'Semua data tersimpan rapi dan hanya bisa diubah oleh pelapor.',
  },
];

function AuthLayout() {
  const isAuthLogin = useSelector((states) => states.isAuthLogin);

  if (isAuthLogin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen lg:grid lg:grid-cols-2">
      {/* Banner (hanya desktop) */}
      <aside className="relative hidden overflow-hidden bg-linear-to-br from-brand-700 via-brand-600 to-violet-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-violet-400/30 blur-3xl" />

        <div className="relative flex items-center gap-3">
          <img
            src="/logo.svg"
            alt="Logo Lost & Founds"
            className="h-11 w-11 rounded-xl shadow-lg"
          />
          <span className="text-xl font-extrabold tracking-tight">
            Lost &amp; Founds
          </span>
        </div>

        <div className="relative max-w-md">
          <h1 className="text-4xl leading-tight font-extrabold">
            Temukan yang hilang, kembalikan yang ditemukan.
          </h1>
          <p className="mt-4 text-brand-100">
            Platform pelaporan barang hilang dan temuan untuk seluruh civitas
            kampus.
          </p>

          <ul className="mt-10 space-y-5">
            {FEATURES.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex items-start gap-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-semibold">{title}</p>
                  <p className="text-sm text-brand-100">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-sm text-brand-200">
          &copy; {new Date().getFullYear()} Lost &amp; Founds &middot; Praktikum
          PABWE
        </p>
      </aside>

      {/* Area form */}
      <main className="flex min-h-screen items-center justify-center px-4 py-10 sm:px-8 lg:min-h-0">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
            <img
              src="/logo.svg"
              alt="Logo Lost & Founds"
              className="h-10 w-10 rounded-xl shadow-md"
            />
            <span className="text-xl font-extrabold tracking-tight text-slate-800">
              Lost &amp; Founds
            </span>
          </div>
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default AuthLayout;