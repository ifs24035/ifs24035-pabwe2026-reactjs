import { useEffect, useState } from 'react';
import {
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiUser,
  FiUserPlus,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import useInput from '../../../hooks/useInput';
import {
  asyncSetIsAuthRegister,
  setIsAuthRegisterActionCreator,
} from '../states/action';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `input-field pl-11 ${hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''
  }`;

function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const isAuthRegister = useSelector((states) => states.isAuthRegister);

  const [name, onNameChange] = useInput('');
  const [email, onEmailChange] = useInput('');
  const [password, onPasswordChange] = useInput('');
  const [confirmPassword, onConfirmPasswordChange] = useInput('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthRegister) {
      dispatch(setIsAuthRegisterActionCreator(false));
      navigate('/auth/login', { replace: true });
    }
  }, [isAuthRegister, dispatch, navigate]);

  const validate = () => {
    const result = {};

    if (!name.trim()) {
      result.name = 'Nama lengkap wajib diisi';
    } else if (name.trim().length < 3) {
      result.name = 'Nama minimal 3 karakter';
    }

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

    if (!confirmPassword) {
      result.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    } else if (confirmPassword !== password) {
      result.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
    }

    return result;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = validate();
    setErrors(result);
    if (Object.keys(result).length > 0) return;

    setLoading(true);
    await dispatch(
      asyncSetIsAuthRegister({
        name: name.trim(),
        email: email.trim(),
        password,
      }),
    );
    setLoading(false);
  };

  const passwordType = showPassword ? 'text' : 'password';

  return (
    <div className="card p-8 shadow-xl shadow-slate-200/60">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
          Buat akun baru ✨
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Daftar gratis dan mulai laporkan barang hilang atau temuan.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label
            htmlFor="name"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Nama Lengkap
          </label>
          <div className="relative">
            <FiUser className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="name"
              type="text"
              value={name}
              onChange={onNameChange}
              placeholder="Nama lengkap kamu"
              autoComplete="name"
              className={inputClass(errors.name)}
            />
          </div>
          {errors.name && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.name}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="email"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Email
          </label>
          <div className="relative">
            <FiMail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="email"
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
            htmlFor="password"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Kata Sandi
          </label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="password"
              type={passwordType}
              value={password}
              onChange={onPasswordChange}
              placeholder="Minimal 6 karakter"
              autoComplete="new-password"
              className={`${inputClass(errors.password)} pr-12`}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={
                showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'
              }
              className="absolute top-1/2 right-2 flex h-9 w-9 -translate-y-1/2 cursor-pointer items-center justify-center rounded-lg text-slate-600 transition hover:text-slate-700"
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

        <div>
          <label
            htmlFor="confirmPassword"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Konfirmasi Kata Sandi
          </label>
          <div className="relative">
            <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              id="confirmPassword"
              type={passwordType}
              value={confirmPassword}
              onChange={onConfirmPasswordChange}
              placeholder="Ulangi kata sandi"
              autoComplete="new-password"
              className={inputClass(errors.confirmPassword)}
            />
          </div>
          {errors.confirmPassword && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.confirmPassword}
            </p>
          )}
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Memproses...
            </>
          ) : (
            <>
              <FiUserPlus />
              Daftar
            </>
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-600">
        Sudah punya akun?{' '}
        <Link
          to="/auth/login"
          className="font-semibold text-brand-600 hover:text-brand-700"
        >
          Masuk di sini
        </Link>
      </p>
    </div>
  );
}

export default RegisterPage;