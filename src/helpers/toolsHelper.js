import Swal from 'sweetalert2';

const BRAND_COLOR = '#4f46e5';

export const showSuccessDialog = (message) =>
  Swal.fire({
    icon: 'success',
    title: 'Berhasil',
    text: message,
    timer: 1800,
    showConfirmButton: false,
  });

export const showErrorDialog = (message) =>
  Swal.fire({
    icon: 'error',
    title: 'Oops...',
    text: message,
    confirmButtonColor: BRAND_COLOR,
  });

export const showWarningDialog = (message) =>
  Swal.fire({
    icon: 'warning',
    title: 'Perhatian',
    text: message,
    confirmButtonColor: BRAND_COLOR,
  });

export const showConfirmDialog = async (
  title,
  text,
  confirmText = 'Ya, lanjutkan',
) => {
  const result = await Swal.fire({
    icon: 'question',
    title,
    text,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: 'Batal',
    confirmButtonColor: BRAND_COLOR,
    cancelButtonColor: '#94a3b8',
    reverseButtons: true,
  });

  return result.isConfirmed;
};

export const formatDate = (value) => {
  if (!value) return '-';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';

  return new Intl.DateTimeFormat('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const getInitials = (name) => {
  if (!name || !name.trim()) return '?';

  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0].toUpperCase())
    .join('');
};

const pad = (value) => String(value).padStart(2, '0');

export const formatApiDateTime = (date) =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())} ` +
  `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;