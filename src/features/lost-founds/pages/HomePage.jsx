import { useCallback, useEffect, useRef, useState } from 'react';
import {
  FiBarChart2,
  FiCamera,
  FiCheckCircle,
  FiEdit2,
  FiImage,
  FiInbox,
  FiLayers,
  FiPackage,
  FiPlus,
  FiSearch,
  FiTrash2,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import { getAssetUrl } from '../../../helpers/apiHelper';
import { formatDate, showConfirmDialog } from '../../../helpers/toolsHelper';
import useInput from '../../../hooks/useInput';
import { CompletedBadge, StatusBadge } from '../components/StatusBadge';
import AddModal from '../modals/AddModal';
import ChangeCoverModal from '../modals/ChangeCoverModal';
import ChangeModal from '../modals/ChangeModal';
import {
  asyncGetLostFounds,
  asyncGetLostFoundStats,
  asyncSetLostFoundDelete,
  setIsLostFoundAddedActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeletedActionCreator,
} from '../states/action';

const METRICS = [
  {
    key: 'total',
    label: 'Total Laporan',
    icon: FiLayers,
    tone: 'from-brand-500 to-violet-600',
  },
  {
    key: 'lost',
    label: 'Barang Hilang',
    icon: FiSearch,
    tone: 'from-rose-500 to-orange-500',
  },
  {
    key: 'found',
    label: 'Barang Ditemukan',
    icon: FiPackage,
    tone: 'from-emerald-500 to-teal-500',
  },
  {
    key: 'completed',
    label: 'Selesai',
    icon: FiCheckCircle,
    tone: 'from-sky-500 to-blue-600',
  },
];

const STATUS_FILTERS = [
  { value: '', label: 'Semua' },
  { value: 'lost', label: 'Hilang' },
  { value: 'found', label: 'Ditemukan' },
];

const SCOPES = [
  { value: 'all', label: 'Semua laporan' },
  { value: 'mine', label: 'Laporan saya' },
];

const COMPLETION_OPTIONS = [
  { value: '', label: 'Semua status' },
  { value: '0', label: 'Dalam proses' },
  { value: '1', label: 'Selesai' },
];

const PERIODS = {
  daily: {
    label: 'Harian',
    caption: '7 hari terakhir',
    formatLabel: (key) => key.slice(0, 5).replace('-', '/'),
  },
  monthly: {
    label: 'Bulanan',
    caption: '6 bulan terakhir',
    formatLabel: (key) => key.replace('-', '/'),
  },
};

const sumValues = (object) =>
  Object.values(object).reduce((total, value) => total + value, 0);

const SERIES = [
  { key: 'losts', bar: 'bg-rose-400', text: 'text-rose-600' },
  { key: 'founds', bar: 'bg-emerald-400', text: 'text-emerald-600' },
];

function StatsChart({ data, formatLabel, scope }) {
  const {
    stats_losts: losts,
    stats_founds: founds,
    stats_losts_completed: lostsCompleted,
    stats_founds_completed: foundsCompleted,
  } = data;
  const values = { losts, founds };

  const dayKeys = Object.keys(losts);
  const peak = Math.max(
    0,
    ...dayKeys.flatMap((dayKey) => [losts[dayKey], founds[dayKey]]),
  );
  // Skala minimal 4 agar satu laporan tidak terlihat seperti lonjakan besar
  const max = Math.max(4, Math.ceil(peak / 4) * 4);

  const totalLost = sumValues(losts);
  const totalFound = sumValues(founds);
  const totalCompleted = sumValues(lostsCompleted) + sumValues(foundsCompleted);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-600">
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-rose-400" /> Hilang
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-3 w-3 rounded bg-emerald-400" /> Ditemukan
        </span>
      </div>

      <div className="flex h-44 items-end gap-2 border-b border-slate-200 sm:gap-4">
        {dayKeys.map((dayKey) => (
          <div
            key={dayKey}
            title={`${formatLabel(dayKey)}: ${losts[dayKey]} hilang, ${founds[dayKey]} ditemukan`}
            className="flex h-full flex-1 items-end justify-center gap-1"
          >
            {SERIES.map(({ key: seriesKey, bar, text }) => {
              const value = values[seriesKey][dayKey];

              return (
                <div
                  key={seriesKey}
                  className="flex h-full w-4 flex-col items-center justify-end sm:w-7"
                >
                  {value > 0 && (
                    <>
                      <span className={`mb-1 text-[11px] font-bold ${text}`}>
                        {value}
                      </span>
                      <div
                        className={`w-full rounded-t-md ${bar}`}
                        style={{ height: `${(value / max) * 80}%` }}
                      />
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-2 flex gap-2 sm:gap-4">
        {dayKeys.map((dayKey) => (
          <p
            key={dayKey}
            className="flex-1 text-center text-[11px] font-medium text-slate-500 sm:text-xs"
          >
            {formatLabel(dayKey)}
          </p>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl bg-rose-50 p-3">
          <p className="text-xl font-extrabold text-rose-700">{totalLost}</p>
          <p className="text-xs font-medium text-rose-600">Hilang</p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-3">
          <p className="text-xl font-extrabold text-emerald-700">
            {totalFound}
          </p>
          <p className="text-xs font-medium text-emerald-600">Ditemukan</p>
        </div>
        <div className="rounded-xl bg-sky-50 p-3">
          <p className="text-xl font-extrabold text-sky-700">
            {totalCompleted}
          </p>
          <p className="text-xs font-medium text-sky-600">Selesai</p>
        </div>
      </div>

      <p className="mt-4 text-center text-xs text-slate-400">
        {scope === 'all'
          ? 'Grafik dan total di atas menghitung laporan dari semua pengguna pada periode ini.'
          : 'Grafik dan total di atas menghitung laporan yang kamu buat sendiri pada periode ini.'}
      </p>

      {totalLost + totalFound === 0 && (
        <p className="mt-2 text-center text-sm text-slate-500">
          Belum ada laporan baru pada periode ini.
        </p>
      )}
    </div>
  );
}

function LostFoundCard({ item, isOwner, onEdit, onChangeCover, onDelete }) {
  const coverUrl = getAssetUrl(item.cover);
  const detailPath = `/lost-founds/${item.id}`;

  return (
    <article className="card group flex flex-col overflow-hidden transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-200">
      <Link
        to={detailPath}
        className="relative block aspect-video overflow-hidden bg-slate-100"
      >
        {coverUrl ? (
          <img
            src={coverUrl}
            alt={item.title}
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300">
            <FiImage className="h-12 w-12" />
          </div>
        )}
        <StatusBadge status={item.status} className="absolute top-3 left-3" />
        <CompletedBadge
          isCompleted={Number(item.is_completed) === 1}
          className="absolute top-3 right-3"
        />
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <Link
          to={detailPath}
          className="line-clamp-1 text-lg font-bold text-slate-900 transition hover:text-brand-600"
        >
          {item.title}
        </Link>
        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
          {item.description}
        </p>

        <div className="mt-4 flex items-center gap-2 text-xs text-slate-500">
          <Avatar
            name={item.author.name}
            photo={item.author.photo}
            size="sm"
          />
          <div className="min-w-0">
            <p className="truncate font-semibold text-slate-700">
              {item.author.name}
            </p>
            <p className="truncate">{formatDate(item.created_at)}</p>
          </div>
        </div>

        <div className="mt-auto flex items-center gap-2 border-t border-slate-100 pt-4">
          <Link to={detailPath} className="btn-secondary flex-1 py-2">
            Lihat Detail
          </Link>
          {isOwner && (
            <>
              <button
                type="button"
                onClick={() => onEdit(item)}
                aria-label={`Ubah ${item.title}`}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <FiEdit2 />
              </button>
              <button
                type="button"
                onClick={() => onChangeCover(item)}
                aria-label={`Ubah cover ${item.title}`}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-brand-50 hover:text-brand-600"
              >
                <FiCamera />
              </button>
              <button
                type="button"
                onClick={() => onDelete(item)}
                aria-label={`Hapus ${item.title}`}
                className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl text-slate-500 transition hover:bg-rose-50 hover:text-rose-600"
              >
                <FiTrash2 />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

function HomePage() {
  const dispatch = useDispatch();
  const location = useLocation();

  const profile = useSelector((states) => states.profile);
  const lostFounds = useSelector((states) => states.lostFounds);
  const stats = useSelector((states) => states.lostFoundStats);
  const isAdded = useSelector((states) => states.isLostFoundAdded);
  const isChanged = useSelector((states) => states.isLostFoundChanged);
  const isChangedCover = useSelector(
    (states) => states.isLostFoundChangedCover,
  );
  const isDeleted = useSelector((states) => states.isLostFoundDeleted);

  const [status, setStatus] = useState('');
  const [completion, setCompletion] = useState('');
  const [onlyMine, setOnlyMine] = useState(false);
  const [keyword, onKeywordChange] = useInput('');
  const [period, setPeriod] = useState('daily');
  const [scope, setScope] = useState('all');
  const [loading, setLoading] = useState(true);

  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [coverTarget, setCoverTarget] = useState(null);

  const statsRef = useRef(null);

  const fetchList = useCallback(
    () =>
      dispatch(
        asyncGetLostFounds({
          status,
          is_completed: completion,
          is_me: onlyMine ? 1 : '',
        }),
      ),
    [dispatch, status, completion, onlyMine],
  );

  // Muat daftar setiap filter server berubah
  useEffect(() => {
    fetchList().finally(() => setLoading(false));
  }, [fetchList]);

  // Muat ringkasan dan statistik
  useEffect(() => {
    dispatch(asyncGetLostFoundStats());
  }, [dispatch]);

  // Setelah tambah/ubah/ubah cover/hapus berhasil, segarkan data
  useEffect(() => {
    if (isAdded || isChanged || isChangedCover || isDeleted) {
      dispatch(setIsLostFoundAddedActionCreator(false));
      dispatch(setIsLostFoundChangedActionCreator(false));
      dispatch(setIsLostFoundChangedCoverActionCreator(false));
      dispatch(setIsLostFoundDeletedActionCreator(false));
      fetchList();
      dispatch(asyncGetLostFoundStats());
    }
  }, [isAdded, isChanged, isChangedCover, isDeleted, fetchList, dispatch]);

  // Menu "Statistik" di sidebar mengarah ke /#statistik
  useEffect(() => {
    if (location.hash === '#statistik') {
      statsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.hash]);

  const handleDelete = async (item) => {
    const confirmed = await showConfirmDialog(
      'Hapus laporan?',
      `Laporan "${item.title}" akan dihapus secara permanen.`,
      'Ya, hapus',
    );

    if (confirmed) {
      dispatch(asyncSetLostFoundDelete(item.id));
    }
  };

  const normalizedKeyword = keyword.trim().toLowerCase();
  const visibleItems = lostFounds.filter(
    ({ title, description }) =>
      title.toLowerCase().includes(normalizedKeyword) ||
      description.toLowerCase().includes(normalizedKeyword),
  );

  return (
    <div>
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            Dashboard
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Pantau laporan barang hilang dan temuan di satu tempat.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          className="btn-primary self-start sm:self-auto"
        >
          <FiPlus />
          Buat Laporan
        </button>
      </div>

            {/* Kartu metrik */}
      <section>
        <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-1">
          {SCOPES.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setScope(value)}
              aria-pressed={scope === value}
              className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                scope === value
                  ? 'bg-white text-brand-700 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {METRICS.map(({ key, label, icon: Icon, tone }) => (
            <div key={key} className="card flex items-center gap-4 p-5">
              <div
                className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br text-xl text-white shadow-lg ${tone}`}
              >
                <Icon />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{label}</p>
                {stats ? (
                  <p className="text-3xl font-extrabold text-slate-900">
                    {stats.summary[scope][key]}
                  </p>
                ) : (
                  <div className="mt-1 h-8 w-12 animate-pulse rounded bg-slate-200" />
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grafik statistik */}
      <section
        id="statistik"
        ref={statsRef}
        className="card mt-8 scroll-mt-24 p-6"
      >
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <FiBarChart2 />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">
                Statistik Laporan
              </h2>
              <p className="text-xs text-slate-500">
                {PERIODS[period].caption} &middot;{' '}
                {scope === 'all' ? 'Semua laporan' : 'Laporan saya'}
              </p>
            </div>
          </div>

          <div className="inline-flex self-start rounded-xl bg-slate-100 p-1">
            {Object.entries(PERIODS).map(([key, { label }]) => (
              <button
                key={key}
                type="button"
                onClick={() => setPeriod(key)}
                aria-pressed={period === key}
                className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                  period === key
                    ? 'bg-white text-brand-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

                {!stats ? (
          <div className="h-64 animate-pulse rounded-xl bg-slate-100" />
        ) : stats.charts[scope][period] ? (
          <StatsChart
            data={stats.charts[scope][period]}
            formatLabel={PERIODS[period].formatLabel}
            scope={scope}
          />
        ) : (
          
          <p className="py-12 text-center text-sm text-slate-500">
            Data statistik belum tersedia.
          </p>
        )}
      </section>

      {/* Filter dan pencarian */}
      <section className="mt-8">
        <h2 className="mb-4 text-lg font-bold text-slate-900">
          Daftar Laporan
        </h2>

        <div className="card mb-6 space-y-4 p-4 sm:p-5">
          <div className="relative">
            <FiSearch className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={keyword}
              onChange={onKeywordChange}
              placeholder="Cari judul atau deskripsi laporan..."
              aria-label="Cari laporan"
              className="input-field pl-11"
            />
          </div>

          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="inline-flex self-start rounded-xl bg-slate-100 p-1">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => setStatus(value)}
                  aria-pressed={status === value}
                  className={`cursor-pointer rounded-lg px-4 py-1.5 text-sm font-semibold transition ${
                    status === value
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <select
                value={completion}
                onChange={(event) => setCompletion(event.target.value)}
                aria-label="Filter status penyelesaian"
                className="input-field w-auto cursor-pointer py-2"
              >
                {COMPLETION_OPTIONS.map(({ value, label }) => (
                  <option key={label} value={value}>
                    {label}
                  </option>
                ))}
              </select>

              <button
                type="button"
                onClick={() => setOnlyMine((prev) => !prev)}
                aria-pressed={onlyMine}
                className={`cursor-pointer rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                  onlyMine
                    ? 'border-brand-300 bg-brand-50 text-brand-700'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Laporan saya
              </button>
            </div>
          </div>
        </div>

        {/* Daftar */}
        {loading ? (
          <div
            data-testid="lost-founds-skeleton"
            className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
          >
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="card animate-pulse overflow-hidden">
                <div className="aspect-video bg-slate-200" />
                <div className="space-y-3 p-5">
                  <div className="h-5 w-2/3 rounded bg-slate-200" />
                  <div className="h-4 w-full rounded bg-slate-100" />
                  <div className="h-4 w-1/2 rounded bg-slate-100" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleItems.length === 0 ? (
          <div className="card flex flex-col items-center px-6 py-16 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
              <FiInbox />
            </div>
            <p className="font-semibold text-slate-700">
              Tidak ada laporan ditemukan
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Ubah filter atau kata kunci, atau buat laporan baru.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-slate-500">
              Menampilkan {visibleItems.length} laporan
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {visibleItems.map((item) => (
                <LostFoundCard
                  key={item.id}
                  item={item}
                  isOwner={item.user_id === profile.id}
                  onEdit={setEditing}
                  onChangeCover={setCoverTarget}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </>
        )}
      </section>

      {/* Modal */}
      {showAdd && <AddModal onClose={() => setShowAdd(false)} />}
      {editing && (
        <ChangeModal lostFound={editing} onClose={() => setEditing(null)} />
      )}
      {coverTarget && (
        <ChangeCoverModal
          lostFound={coverTarget}
          onClose={() => setCoverTarget(null)}
        />
      )}
    </div>
  );
}

export default HomePage;