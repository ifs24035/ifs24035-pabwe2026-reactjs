import PropTypes from 'prop-types';
import { useState } from 'react';
import { FiPlus } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/Modal';
import useInput from '../../../hooks/useInput';
import StatusSelector from '../components/StatusSelector';
import { asyncSetLostFoundAdd } from '../states/action';

function AddModal({ onClose }) {
  const dispatch = useDispatch();
  const isAdding = useSelector((states) => states.isLostFoundAdd);

  const [title, onTitleChange] = useInput('');
  const [description, onDescriptionChange] = useInput('');
  const [status, setStatus] = useState('lost');
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();

    const result = {};
    if (!title.trim()) result.title = 'Judul wajib diisi';
    if (!description.trim()) result.description = 'Deskripsi wajib diisi';

    setErrors(result);
    if (Object.keys(result).length > 0) return;

    const success = await dispatch(
      asyncSetLostFoundAdd({
        title: title.trim(),
        description: description.trim(),
        status,
      }),
    );

    if (success) onClose();
  };

  return (
    <Modal
      title="Buat Laporan Baru"
      subtitle="Laporkan barang yang hilang atau yang kamu temukan."
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
            htmlFor="add-title"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Judul
          </label>
          <input
            id="add-title"
            type="text"
            value={title}
            onChange={onTitleChange}
            placeholder="Contoh: Dompet cokelat hilang di kantin"
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
            htmlFor="add-description"
            className="mb-1.5 block text-sm font-semibold text-slate-700"
          >
            Deskripsi
          </label>
          <textarea
            id="add-description"
            rows={5}
            value={description}
            onChange={onDescriptionChange}
            placeholder="Jelaskan ciri-ciri barang, lokasi, dan waktu kejadian..."
            className={`input-field resize-none ${errors.description ? 'border-rose-400' : ''}`}
          />
          {errors.description && (
            <p className="mt-1.5 text-xs font-medium text-rose-600">
              {errors.description}
            </p>
          )}
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isAdding}
            className="btn-secondary"
          >
            Batal
          </button>
          <button type="submit" disabled={isAdding} className="btn-primary">
            <FiPlus />
            {isAdding ? 'Menyimpan...' : 'Simpan Laporan'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

AddModal.propTypes = {
  onClose: PropTypes.func.isRequired,
};

export default AddModal;