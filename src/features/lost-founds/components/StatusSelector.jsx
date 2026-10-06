import PropTypes from 'prop-types';
import { FiPackage, FiSearch } from 'react-icons/fi';

const OPTIONS = [
  {
    value: 'lost',
    label: 'Barang Hilang',
    hint: 'Saya kehilangan barang',
    icon: FiSearch,
    active: 'border-rose-400 bg-rose-50 text-rose-700 ring-4 ring-rose-100',
  },
  {
    value: 'found',
    label: 'Barang Ditemukan',
    hint: 'Saya menemukan barang',
    icon: FiPackage,
    active:
      'border-emerald-400 bg-emerald-50 text-emerald-700 ring-4 ring-emerald-100',
  },
];

function StatusSelector({ value, onChange }) {
  return (
    <div role="radiogroup" aria-label="Jenis laporan" className="grid grid-cols-2 gap-3">
      {OPTIONS.map(({ value: optionValue, label, hint, icon: Icon, active }) => {
        const selected = value === optionValue;

        return (
          <button
            key={optionValue}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(optionValue)}
            className={`flex cursor-pointer flex-col items-start gap-1 rounded-xl border p-4 text-left transition ${
              selected
                ? active
                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
            }`}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-bold">{label}</span>
            <span className="text-xs opacity-80">{hint}</span>
          </button>
        );
      })}
    </div>
  );
}

StatusSelector.propTypes = {
  value: PropTypes.oneOf(['lost', 'found']).isRequired,
  onChange: PropTypes.func.isRequired,
};

export default StatusSelector;