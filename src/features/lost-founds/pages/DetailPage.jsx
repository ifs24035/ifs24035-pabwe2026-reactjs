import { useEffect, useState } from 'react';
import {
  FiArrowLeft,
  FiCalendar,
  FiCamera,
  FiClock,
  FiEdit2,
  FiImage,
  FiInbox,
  FiTrash2,
} from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Avatar from '../../../components/Avatar';
import { getAssetUrl } from '../../../helpers/apiHelper';
import { formatDate, showConfirmDialog } from '../../../helpers/toolsHelper';
import { CompletedBadge, StatusBadge } from '../components/StatusBadge';
import ChangeCoverModal from '../modals/ChangeCoverModal';
import ChangeModal from '../modals/ChangeModal';
import {
  asyncGetLostFound,
  asyncSetLostFoundDelete,
  setIsLostFoundActionCreator,
  setIsLostFoundChangedActionCreator,
  setIsLostFoundChangedCoverActionCreator,
  setIsLostFoundDeletedActionCreator,
  setLostFoundActionCreator,
} from '../states/action';

function DetailPage() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const profile = useSelector((states) => states.profile);
  const lostFound = useSelector((states) => states.lostFound);
  const isChanged = useSelector((states) => states.isLostFoundChanged);
  const isChangedCover = useSelector(
    (states) => states.isLostFoundChangedCover,
  );
  const isDeleted = useSelector((states) => states.isLostFoundDeleted);

  const [loading, setLoading] = useState(true);
  const [showEdit, setShowEdit] = useState(false);
  const [showCover, setShowCover] = useState(false);

  // Muat detail; bersihkan state saat halaman ditinggalkan agar tidak tampil data lama
  useEffect(() => {
    dispatch(asyncGetLostFound(id)).finally(() => setLoading(false));

    return () => {
      dispatch(setLostFoundActionCreator(null));
      dispatch(setIsLostFoundActionCreator(false));
    };
  }, [id, dispatch]);

  // Setelah data atau cover berubah, muat ulang detail
  useEffect(() => {
    if (isChanged || isChangedCover) {
      dispatch(setIsLostFoundChangedActionCreator(false));
      dispatch(setIsLostFoundChangedCoverActionCreator(false));
      dispatch(asyncGetLostFound(id));
    }
  }, [isChanged, isChangedCover, id, dispatch]);

  // Setelah dihapus, kembali ke dashboard
  useEffect(() => {
    if (isDeleted) {
      dispatch(setIsLostFoundDeletedActionCreator(false));
      navigate('/', { replace: true });
    }
  }, [isDeleted, dispatch, navigate]);

  const handleDelete = async () => {
    const confirmed = await showConfirmDialog(
      'Hapus laporan?',
      `Laporan "${lostFound.title}" akan dihapus secara permanen.`,
      'Ya, hapus',
    );

    if (confirmed) {
      dispatch(asyncSetLostFoundDelete(lostFound.id));
    }
  };

  if (loading) {
    return (
      <div data-testid="detail-skeleton" className="card animate-pulse overflow-hidden">
        <div className="h-72 bg-slate-200" />
        <div className="space-y-4 p-8">
          <div className="h-6 w-1/3 rounded bg-slate-200" />
          <div className="h-8 w-2/3 rounded bg-slate-200" />
          <div className="h-4 w-full rounded bg-slate-100" />
          <div className="h-4 w-5/6 rounded bg-slate-100" />
        </div>
      </div>
    );
  }

  if (!lostFound) {
    return (
      <div className="card flex flex-col items-center px-6 py-20 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-400">
          <FiInbox />
        </div>
        <p className="text-lg font-bold text-slate-800">
          Laporan tidak ditemukan
        </p>
        <p className="mt-1 text-sm text-slate-500">
          Laporan mungkin sudah dihapus atau tautannya tidak valid.
        </p>
        <Link to="/" className="btn-primary mt-6">
          <FiArrowLeft />
          Kembali ke Dashboard
        </Link>
      </div>
    );
  }

  const coverUrl = getAssetUrl(lostFound.cover);
  const isOwner = lostFound.user_id === profile.id;

  return (
    <div>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-brand-600"
      >
        <FiArrowLeft />
        Kembali ke Dashboard
      </Link>

      <article className="card overflow-hidden">
        {/* Cover dengan rasio adaptif */}
        <div className="flex min-h-56 items-center justify-center bg-slate-100">
          {coverUrl ? (
            <img
              src={coverUrl}
              alt={lostFound.title}
              className="max-h-128 w-auto max-w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 py-16 text-slate-400">
              <FiImage className="h-14 w-14" />
              <p className="text-sm font-medium">Belum ada foto bukti</p>
            </div>
          )}
        </div>

        <div className="p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={lostFound.status} />
            <CompletedBadge isCompleted={Number(lostFound.is_completed) === 1} />
          </div>

          <h1 className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
            {lostFound.title}
          </h1>

          <dl className="mt-6 grid gap-4 rounded-2xl bg-slate-50 p-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
              <Avatar
                name={lostFound.author.name}
                photo={lostFound.author.photo}
                size="md"
              />
              <div className="min-w-0">
                <dt className="text-xs font-medium text-slate-500">Pelapor</dt>
                <dd className="truncate text-sm font-bold text-slate-800">
                  {lostFound.author.name}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <FiCalendar />
              </span>
              <div>
                <dt className="text-xs font-medium text-slate-500">
                  Tanggal lapor
                </dt>
                <dd className="text-sm font-bold text-slate-800">
                  {formatDate(lostFound.created_at)}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-400 shadow-sm">
                <FiClock />
              </span>
              <div>
                <dt className="text-xs font-medium text-slate-500">
                  Terakhir diperbarui
                </dt>
                <dd className="text-sm font-bold text-slate-800">
                  {formatDate(lostFound.updated_at)}
                </dd>
              </div>
            </div>
          </dl>

          <div className="mt-8">
            <h2 className="text-sm font-bold tracking-wider text-slate-400 uppercase">
              Deskripsi
            </h2>
            <p className="mt-2 leading-relaxed whitespace-pre-line text-slate-700">
              {lostFound.description}
            </p>
          </div>

          {isOwner && (
            <div className="mt-8 flex flex-wrap gap-3 border-t border-slate-100 pt-6">
              <button
                type="button"
                onClick={() => setShowCover(true)}
                className="btn-secondary"
              >
                <FiCamera />
                Ubah Cover
              </button>
              <button
                type="button"
                onClick={() => setShowEdit(true)}
                className="btn-primary"
              >
                <FiEdit2 />
                Ubah Data
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="btn-danger sm:ml-auto"
              >
                <FiTrash2 />
                Hapus
              </button>
            </div>
          )}
        </div>
      </article>

      {showEdit && (
        <ChangeModal lostFound={lostFound} onClose={() => setShowEdit(false)} />
      )}
      {showCover && (
        <ChangeCoverModal
          lostFound={lostFound}
          onClose={() => setShowCover(false)}
        />
      )}
    </div>
  );
}

export default DetailPage;