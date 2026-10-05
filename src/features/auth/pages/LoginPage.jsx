import { useState } from 'react';
import { FiEye, FiEyeOff, FiLock, FiLogIn, FiMail } from 'react-icons/fi';
import { useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import useInput from '../../../hooks/useInput';
import { asyncSetIsAuthLogin } from '../states/action';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `input-field pl-11 ${
    hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''
  }`;

function LoginPage() {
  const dispatch = useDispatch();
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const result = {};

    if (!email.trim()) {
      result.email = 'Email wajib diisi';
    } else if (!EMAIL_REGEX.test(email.trim())) {
      result.email = 'Format email tidak valid';
    }

    if (!password) {
      result.password = 'Kata sandi wajib diisi';
    } else if (password.length < 6) {
      result.password = 'Kata sandi minimal 6 karakter';
    }

    return result;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = validate();
    setErrors(result);
    if (Object.keys(result).length > 0) return;

    setLoading(true);
    await dispatch(asyncSetIsAuthLogin({ email: email.trim(), password }));
    setLoading(false);
  };

  return (
    <div className="card p-8 shadow-xl shadow-slate-200/60">
      <div className="mb-8">
        <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Selamat datang kembali 👋
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Masuk untuk mengelola laporan barang hilang dan temuan.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="login-email-input"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-email-input"
              type="email"
              value={email}
              onChange={onEmailChange}
              placeholder="nama@email.com"
              autoComplete="email"
              className={inputClass(errors.email)}
            />
          </div>
          {errors.email && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.email}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="login-password-input"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="login-password-input"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={onPasswordChange}
              placeholder="Masukkan kata sandi"
              autoComplete="current-password"
              className={`${inputClass(errors.password)} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
              }
              className="absolute top-1/2 right-4 -translate-y-1/2 cursor-pointer text-slate-400 transition hover:text-slate-600"
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.password}
            </p>
          )}
        </div>

        <button id="login-submit-button" type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Memproses...
            </>
          ) : (
            <>
              <FiLogIn />
              Masuk
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Belum punya akun?{' '}
        <Link
          to="/auth/register"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Daftar sekarang
        </Link>
      </p>
    </div>
  );
}

export default LoginPage;