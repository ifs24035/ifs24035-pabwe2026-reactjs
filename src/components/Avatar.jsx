import PropTypes from 'prop-types';
import { useState } from 'react';
import { getAssetUrl } from '../helpers/apiHelper';
import { getInitials } from '../helpers/toolsHelper';

const SIZES = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-28 w-28 text-3xl',
};

function Avatar({
  name,
  photo,
  size = 'md',
  className = '',
  decorative = false,
}) {
  const [failed, setFailed] = useState(false);
  const src = getAssetUrl(photo);
  const sizeClass = SIZES[size];

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={decorative ? '' : name}
        onError={() => setFailed(true)}
        className={`${sizeClass} shrink-0 rounded-full object-cover ${className}`}
      />
    );
  }

  return (
    <div
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : name}
      aria-hidden={decorative ? true : undefined}
      className={`${sizeClass} flex shrink-0 items-center justify-center rounded-full bg-linear-to-br from-brand-500 to-violet-600 font-bold text-white ${className}`}
    >
      {getInitials(name)}
    </div>
  );
}

Avatar.propTypes = {
  name: PropTypes.string.isRequired,
  photo: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl']),
  className: PropTypes.string,
  decorative: PropTypes.bool,
};

export default Avatar;