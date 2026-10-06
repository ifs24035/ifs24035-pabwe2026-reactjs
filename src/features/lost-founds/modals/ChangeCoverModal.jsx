import PropTypes from 'prop-types';
import { useEffect, useRef, useState } from 'react';
import { FiImage, FiUploadCloud } from 'react-icons/fi';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '../../../components/Modal';
import { getAssetUrl } from '../../../helpers/apiHelper';
import { showErrorDialog } from '../../../helpers/toolsHelper';
import { asyncSetLostFoundChangeCover } from '../states/action';

function ChangeCoverModal({ lostFound, onClose }) {
  const dispatch = useDispatch();
  const isChangingCover = useSelector((states) => states.isLostFoundChangeCover);

  const inputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');

  // Bersihkan object URL pratinjau agar tidak bocor memori
  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const shownImage = preview || getAssetUrl(lostFound.cover);

  const handleSelect = (event) => {
    const selected = event.target.files[0];
    if (!selected) return;

    if (!selected.type.startsWith('image/')) {
      showErrorDialog('File yang dipilih harus berupa gambar');
      event.target.value = '';
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  };

  const handleUpload = async () => {
    const success = await dispatch(
      asyncSetLostFoundChangeCover(lostFound.id, file),
    );

    if (success) onClose();
  };

  return (
    <Modal
      title="Ubah Foto Cover"
      subtitle="Unggah foto bukti barang agar mudah dikenali."
      onClose={onClose}
    >
      <div className="space-y-5">
        <div className="flex aspect-video items-center justify-center overflow-hidden rounded-xl border border-dashed border-slate-300 bg-slate-50">
          {shownImage ? (
            <img
              src={shownImage}
              alt="Pratinjau cover"
              className="h-full w-full object-contain"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <FiImage className="h-10 w-10" />
              <p className="text-sm">Belum ada foto cover</p>
            </div>
          )}
        </div>

        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleSelect}
          data-testid="cover-input"
          className="hidden"
        />

        <button
          type="button"
          onClick={() => inputRef.current.click()}
          disabled={isChangingCover}
          className="btn-secondary w-full"
        >
          <FiUploadCloud />
          {file ? 'Pilih Gambar Lain' : 'Pilih Gambar'}
        </button>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isChangingCover}
            className="btn-secondary"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!file || isChangingCover}
            className="btn-primary"
          >
            {isChangingCover ? 'Mengunggah...' : 'Unggah Cover'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

ChangeCoverModal.propTypes = {
  lostFound: PropTypes.shape({
    id: PropTypes.number.isRequired,
    cover: PropTypes.string,
  }).isRequired,
  onClose: PropTypes.func.isRequired,
};

export default ChangeCoverModal;