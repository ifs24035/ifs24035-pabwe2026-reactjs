import { useEffect, useState } from 'react';
import { FiCalendar, FiMail, FiSearch, FiUsers, FiX } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../../components/Avatar';
import { formatDate } from '../../../helpers/toolsHelper';
import useInput from '../../../hooks/useInput';
import { asyncGetUsers, setUserActionCreator } from '../states/action';

function UsersPage() {
  const dispatch = useDispatch();
  const users = useSelector((states) => states.users);
  const user = useSelector((states) => states.user);
  const profileId = useSelector((states) => states.profile?.id);

  const [keyword, onKeywordChange] = useInput('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    dispatch(asyncGetUsers()).finally(() => setLoading(false));
  }, [dispatch]);

  const normalizedKeyword = keyword.trim().toLowerCase();
  const filteredUsers = users.filter(
    ({ name, email }) =>
      name.toLowerCase().includes(normalizedKeyword) ||
      email.toLowerCase().includes(normalizedKeyword),
  );

  const closeDetail = () => dispatch(setUserActionCreator(null));

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) closeDetail();
  };
  
  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Daftar Pengguna
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Seluruh pengguna yang terdaftar di Lost &amp; Founds.
          </p>
        </div>
        <div className="inline-flex items-center gap-2 self-start rounded-full bg-brand-50 px-4 py-2 text-sm font-semibold text-brand-700 sm:self-auto">
          <FiUsers />
          {users.length} pengguna
        </div>
      </div>

      {/* Pencarian */}
      <div className="relative mb-6 max-w-md">
        <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          value={keyword}
          onChange={onKeywordChange}
          placeholder="Cari nama atau email..."
          aria-label="Cari pengguna"
          className="input-field pl-11"
        />
      </div>

      {/* Konten */}
      {loading ? (
        <div
          data-testid="users-skeleton"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
        >
          {[1, 2, 3, 4, 5, 6].map((item) => (
            <div key={item} className="card flex animate-pulse items-center gap-4 p-5">
              <div className="h-14 w-14 rounded-full bg-slate-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-2/3 rounded bg-slate-200" />
                <div className="h-3 w-full rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : filteredUsers.length === 0 ? (
        <div className="card flex flex-col items-center px-6 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
            <FiUsers />
          </div>
          <p className="font-semibold text-slate-700">
            {users.length === 0
              ? 'Belum ada pengguna'
              : 'Pengguna tidak ditemukan'}
          </p>
          <p className="mt-1 text-sm text-slate-600">
            {users.length === 0
              ? 'Data pengguna akan tampil di sini.'
              : 'Coba gunakan kata kunci yang lain.'}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filteredUsers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => dispatch(setUserActionCreator(item))}
              className="card flex cursor-pointer items-center gap-4 p-5 text-left transition hover:-translate-y-1 hover:border-brand-200 hover:shadow-lg hover:shadow-brand-100"
            >
              <Avatar decorative name={item.name} photo={item.photo} size="lg" />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-bold text-slate-800">
                    {item.name}
                  </p>
                  {item.id === profileId && (
                    <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                      Kamu
                    </span>
                  )}
                </div>
                <p className="truncate text-sm text-slate-600">{item.email}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal detail */}
      {user && (
        <div
          role="presentation"
          onClick={handleBackdropClick}
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Detail pengguna"
            className="card relative w-full max-w-sm overflow-hidden text-center shadow-2xl"
          >
            <div className="h-24 bg-linear-to-br from-brand-600 via-brand-500 to-violet-600" />
            <button
              type="button"
              onClick={closeDetail}
              aria-label="Tutup"
              className="absolute top-3 right-3 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-white/20 text-white transition hover:bg-white/30"
            >
              <FiX />
            </button>
            <div className="-mt-12 px-6 pb-6">
              <Avatar decorative
                name={user.name}
                photo={user.photo}
                size="xl"
                className="mx-auto shadow-lg ring-4 ring-white"
              />
              <h2 className="mt-3 text-xl font-extrabold text-slate-900">
                {user.name}
              </h2>
              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <p className="flex items-center justify-center gap-2">
                  <FiMail className="text-slate-400" />
                  {user.email}
                </p>
                <p className="flex items-center justify-center gap-2">
                  <FiCalendar className="text-slate-400" />
                  Bergabung {formatDate(user.created_at)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsersPage;