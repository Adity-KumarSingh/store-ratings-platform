interface Props {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
}

export default function StarRating({ value, onChange, readOnly }: Props) {
  return (
    <div className={readOnly ? 'stars readonly' : 'stars'}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= value ? 'star filled' : 'star'}
          disabled={readOnly}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onClick={() => onChange?.(star)}
        >
          ★
        </button>
      ))}
    </div>
  );
}
