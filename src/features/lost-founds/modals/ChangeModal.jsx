import { useState } from 'react';
import { FiSave } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/Modal';
import useInput from '../../../hooks/useInput';
import StatusSelector from '../components/StatusSelector';
import { asyncSetLostFoundChange } from '../states/action';

function ChangeModal({ lostFound, onClose }) {
  const dispatch = useDispatch();
  const isChanging = useSelector((states) => states.isLostFoundChange);

  const [title, onTitleChange] = useInput(lostFound.title);
  const [description, onDescriptionChange] = useInput(lostFound.description);
  const [status, setStatus] = useState(lostFound.status);
  const [isCompleted, setIsCompleted] = useState(
    Number(lostFound.is_completed) === 1,
  );
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = {};
    if (!title.trim()) result.title = 'Judul wajib diisi';
    if (!description.trim()) result.description = 'Deskripsi wajib diisi';

    setErrors(result);
    if (Object.keys(result).length > 0) return;

    const success = await dispatch(
      asyncSetLostFoundChange(lostFound.id, {
        title: title.trim(),
        description: description.trim(),
        status,
        isCompleted,
      }),
    );

    if (success) onClose();
  };

  return (
    <Modal
      title="Ubah Laporan"
      subtitle="Perbarui informasi dan status penyelesaian laporan."
      onClose={onClose}
    >
      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <p className="mb-2 text-sm font-semibold text-slate-700">
            Jenis Laporan
          </p>
          <StatusSelector value={status} onChange={setStatus} />
        </div>

        <div>
          <label
            htmlFor="change-title"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Judul
          </label>
          <input
            id="change-title"
            type="text"
            value={title}
            onChange={onTitleChange}
            className={`input-field ${errors.title ? 'border-rose-400' : ''}`}
          />
          {errors.title && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.title}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="change-description"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Deskripsi
          </label>
          <textarea
            id="change-description"
            rows={5}
            value={description}
            onChange={onDescriptionChange}
            className={`input-field resize-none ${errors.description ? 'border-rose-400' : ''}`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4">
          <div>
            <p className="text-sm font-bold text-slate-800">
              Tandai sebagai selesai
            </p>
            <p className="text-xs text-slate-500">
              Aktifkan jika barang sudah kembali ke pemiliknya.
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isCompleted}
            aria-label="Tandai sebagai selesai"
            onClick={() => setIsCompleted((prev) => !prev)}
            className={`relative h-7 w-12 shrink-0 cursor-pointer rounded-full transition ${
              isCompleted ? 'bg-emerald-500' : 'bg-slate-300'
            }`}
          >
            <span
              className={`absolute top-1 left-1 h-5 w-5 rounded-full bg-white shadow transition ${
                isCompleted ? 'translate-x-5' : ''
              }`}
            />
          </button>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isChanging}
            className="btn-secondary"
          >
            Batal
          </button>
          <button type="submit" disabled={isChanging} className="btn-primary">
            <FiSave />
            {isChanging ? 'Menyimpan...' : 'Simpan Perubahan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

export default ChangeModal;