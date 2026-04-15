import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import './StarInput.css'

const StarInput = ({ rating, setRating, size = 20, readonly = false }) => {
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="star-input" id="star-input">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
          onClick={() => !readonly && setRating(star)}
          onMouseEnter={() => !readonly && setHoverRating(star)}
          onMouseLeave={() => !readonly && setHoverRating(0)}
          disabled={readonly}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
        >
          <FiStar size={size} fill={star <= (hoverRating || rating) ? '#fbbf24' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default StarInput
