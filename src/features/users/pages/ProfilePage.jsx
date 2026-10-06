import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import {
  FiCalendar,
  FiCamera,
  FiEye,
  FiEyeOff,
  FiLock,
  FiMail,
  FiSave,
  FiUser,
  FiX,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../../components/Avatar';
import { formatDate, showErrorDialog } from '../../../helpers/toolsHelper';
import useInput from '../../../hooks/useInput';
import {
  asyncGetProfile,
  asyncSetIsChangeProfile,
  asyncSetIsChangeProfilePassword,
  asyncSetIsChangeProfilePhoto,
  setIsChangeProfileActionCreator,
  setIsChangeProfilePasswordActionCreator,
  setIsChangeProfilePhotoActionCreator,
} from '../states/action';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const inputClass = (hasError) =>
  `input-field pl-11 ${hasError ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-100' : ''
  }`;

const FieldError = ({ message }) =>
  message ? (
    <p className="mt-1.5 text-xs font-medium text-rose-600">{message}</p>
  ) : null;

FieldError.propTypes = {
  message: PropTypes.string,
};

function ProfileContent({ profile }) {
  const dispatch = useDispatch();
  const isChangeProfile = useSelector((states) => states.isChangeProfile);
  const isChangeProfilePhoto = useSelector(
    (states) => states.isChangeProfilePhoto,
  );
  const isChangeProfilePassword = useSelector(
    (states) => states.isChangeProfilePassword,
  );

  // Formulir profil
  const [name, onNameChange] = useInput(profile.name);
  const [email, onEmailChange] = useInput(profile.email);
  const [infoErrors, setInfoErrors] = useState({});
  const [savingInfo, setSavingInfo] = useState(false);

  // Formulir kata sandi
  const [currentPassword, onCurrentPasswordChange, setCurrentPassword] =
    useInput('');
  const [newPassword, onNewPasswordChange, setNewPassword] = useInput('');
  const [confirmPassword, onConfirmPasswordChange, setConfirmPassword] =
    useInput('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  // Foto profil
  const fileInputRef = useRef(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [savingPhoto, setSavingPhoto] = useState(false);

  // Setelah profil/foto berhasil diubah, segarkan data profil di store
  useEffect(() => {
    if (isChangeProfile || isChangeProfilePhoto) {
      dispatch(setIsChangeProfileActionCreator(false));
      dispatch(setIsChangeProfilePhotoActionCreator(false));
      dispatch(asyncGetProfile());
    }
  }, [isChangeProfile, isChangeProfilePhoto, dispatch]);

  useEffect(() => {
    if (isChangeProfilePassword) {
      dispatch(setIsChangeProfilePasswordActionCreator(false));
    }
  }, [isChangeProfilePassword, dispatch]);

  // Bersihkan object URL pratinjau agar tidak bocor memori
  useEffect(() => {
    if (!photoPreview) return undefined;
    return () => URL.revokeObjectURL(photoPreview);
  }, [photoPreview]);

  const clearPhoto = () => {
    setPhotoFile(null);
    setPhotoPreview('');
    fileInputRef.current.value = '';
  };

  const handlePhotoSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showErrorDialog('File yang dipilih harus berupa gambar');
      event.target.value = '';
      return;
    }

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSavePhoto = async () => {
    setSavingPhoto(true);
    const success = await dispatch(asyncSetIsChangeProfilePhoto(photoFile));
    setSavingPhoto(false);

    if (success) clearPhoto();
  };

  const handleSubmitInfo = async (event) => {
    event.preventDefault();

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

    setInfoErrors(result);
    if (Object.keys(result).length > 0) return;

    setSavingInfo(true);
    await dispatch(
      asyncSetIsChangeProfile({ name: name.trim(), email: email.trim() }),
    );
    setSavingInfo(false);
  };

  const handleSubmitPassword = async (event) => {
    event.preventDefault();

    const result = {};
    if (!currentPassword) {
      result.currentPassword = 'Kata sandi saat ini wajib diisi';
    }

    if (!newPassword) {
      result.newPassword = 'Kata sandi baru wajib diisi';
    } else if (newPassword.length < 6) {
      result.newPassword = 'Kata sandi baru minimal 6 karakter';
    } else if (newPassword === currentPassword) {
      result.newPassword = 'Kata sandi baru harus berbeda dari yang lama';
    }

    if (!confirmPassword) {
      result.confirmPassword = 'Konfirmasi kata sandi wajib diisi';
    } else if (confirmPassword !== newPassword) {
      result.confirmPassword = 'Konfirmasi kata sandi tidak cocok';
    }

    setPasswordErrors(result);
    if (Object.keys(result).length > 0) return;

    setSavingPassword(true);
    const success = await dispatch(
      asyncSetIsChangeProfilePassword({
        password: currentPassword,
        newPassword,
      }),
    );
    setSavingPassword(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const passwordType = showPassword ? 'text' : 'password';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          Profil Saya
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Kelola informasi akun dan keamanan kamu.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Kartu identitas + foto */}
        <div className="card self-start overflow-hidden">
          <div className="h-28 bg-linear-to-br from-brand-600 via-brand-500 to-violet-600" />
          <div className="-mt-14 px-6 pb-6 text-center">
            <div className="relative mx-auto h-28 w-28">
              {photoPreview ? (
                <img
                  src={photoPreview}
                  alt="Pratinjau foto profil"
                  className="h-28 w-28 rounded-full object-cover shadow-lg ring-4 ring-white"
                />
              ) : (
                <Avatar decorative
                  name={profile.name}
                  photo={profile.photo}
                  size="xl"
                  className="shadow-lg ring-4 ring-white"
                />
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current.click()}
                aria-label="Pilih foto baru"
                className="absolute right-0 bottom-0 flex h-9 w-9 cursor-pointer items-center justify-center rounded-full bg-white text-brand-600 shadow-md ring-1 ring-slate-200 transition hover:bg-brand-50"
              >
                <FiCamera />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                data-testid="photo-input"
                className="hidden"
              />
            </div>

            <h2 className="mt-4 text-xl font-extrabold text-slate-900">
              {profile.name}
            </h2>

            {photoFile && (
              <div className="mt-4 flex justify-center gap-2">
                <button
                  type="button"
                  onClick={handleSavePhoto}
                  disabled={savingPhoto}
                  className="btn-primary"
                >
                  <FiSave />
                  {savingPhoto ? 'Menyimpan...' : 'Simpan Foto'}
                </button>
                <button
                  type="button"
                  onClick={clearPhoto}
                  disabled={savingPhoto}
                  className="btn-secondary"
                >
                  <FiX />
                  Batal
                </button>
              </div>
            )}

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-6 text-left text-sm text-slate-600">
              <p className="flex items-center gap-3">
                <FiMail className="shrink-0 text-slate-400" />
                <span className="truncate">{profile.email}</span>
              </p>
              <p className="flex items-center gap-3">
                <FiCalendar className="shrink-0 text-slate-400" />
                Bergabung {formatDate(profile.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Formulir */}
        <div className="space-y-6 lg:col-span-2">
          <form
            onSubmit={handleSubmitInfo}
            noValidate
            className="card space-y-5 p-6 sm:p-8"
          >
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Informasi Profil
              </h3>
              <p className="text-sm text-slate-600">
                Perbarui nama dan alamat email akun kamu.
              </p>
            </div>

            <div>
              <label
                htmlFor="profile-name"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Nama Lengkap
              </label>
              <div className="relative">
                <FiUser className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="profile-name"
                  type="text"
                  value={name}
                  onChange={onNameChange}
                  className={inputClass(infoErrors.name)}
                />
              </div>
              <FieldError message={infoErrors.name} />
            </div>

            <div>
              <label
                htmlFor="profile-email"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Email
              </label>
              <div className="relative">
                <FiMail className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="profile-email"
                  type="email"
                  value={email}
                  onChange={onEmailChange}
                  className={inputClass(infoErrors.email)}
                />
              </div>
              <FieldError message={infoErrors.email} />
            </div>

            <div className="flex justify-end">
              <button type="submit" disabled={savingInfo} className="btn-primary">
                <FiSave />
                {savingInfo ? 'Menyimpan...' : 'Simpan Perubahan'}
              </button>
            </div>
          </form>

          <form
            onSubmit={handleSubmitPassword}
            noValidate
            className="card space-y-5 p-6 sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Ganti Kata Sandi
                </h3>
                <p className="text-sm text-slate-600">
                  Gunakan kata sandi yang kuat dan jangan dibagikan ke siapa pun.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="btn-secondary shrink-0 px-3 py-2"
                aria-label={
                  showPassword
                    ? 'Sembunyikan kata sandi'
                    : 'Tampilkan kata sandi'
                }
              >
                {showPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <div>
              <label
                htmlFor="current-password"
                className="mb-1.5 block text-sm font-semibold text-slate-700"
              >
                Kata Sandi Saat Ini
              </label>
              <div className="relative">
                <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                <input
                  id="current-password"
                  type={passwordType}
                  value={currentPassword}
                  onChange={onCurrentPasswordChange}
                  autoComplete="current-password"
                  className={inputClass(passwordErrors.currentPassword)}
                />
              </div>
              <FieldError message={passwordErrors.currentPassword} />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Kata Sandi Baru
                </label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="new-password"
                    type={passwordType}
                    value={newPassword}
                    onChange={onNewPasswordChange}
                    autoComplete="new-password"
                    className={inputClass(passwordErrors.newPassword)}
                  />
                </div>
                <FieldError message={passwordErrors.newPassword} />
              </div>

              <div>
                <label
                  htmlFor="confirm-new-password"
                  className="mb-1.5 block text-sm font-semibold text-slate-700"
                >
                  Konfirmasi Kata Sandi Baru
                </label>
                <div className="relative">
                  <FiLock className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
                  <input
                    id="confirm-new-password"
                    type={passwordType}
                    value={confirmPassword}
                    onChange={onConfirmPasswordChange}
                    autoComplete="new-password"
                    className={inputClass(passwordErrors.confirmPassword)}
                  />
                </div>
                <FieldError message={passwordErrors.confirmPassword} />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={savingPassword}
                className="btn-primary"
              >
                <FiLock />
                {savingPassword ? 'Menyimpan...' : 'Ubah Kata Sandi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

ProfileContent.propTypes = {
  profile: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    photo: PropTypes.string,
    created_at: PropTypes.string,
  }).isRequired,
};

function ProfilePage() {
  const profile = useSelector((states) => states.profile);

  if (!profile) return null;

  return <ProfileContent profile={profile} />;
}

export default ProfilePage;