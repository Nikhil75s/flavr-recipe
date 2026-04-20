/**
 * components/StarInput.jsx — Interactive star rating input component.
 * @param {number}   rating    - Current selected rating (1-5)
 * @param {Function} setRating - Callback to update the rating value
 * @param {number}   size      - Icon size in pixels (default: 20)
 * @param {boolean}  readonly  - If true, disables click and hover interactions
 */

import { useState } from 'react'
import { FiStar } from 'react-icons/fi'
import './StarInput.css'

const StarInput = ({ rating, setRating, size = 20, readonly = false }) => {
  // Tracks which star the user is currently hovering over (0 = no hover)
  const [hoverRating, setHoverRating] = useState(0)

  return (
    <div className="star-input" id="star-input">
      {/* Render 5 star buttons (1 through 5) */}
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          // Star is "active" (highlighted) if it's <= the hover rating or selected rating
          className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
          onClick={() => !readonly && setRating(star)}           // Set rating on click
          onMouseEnter={() => !readonly && setHoverRating(star)} // Preview on hover
          onMouseLeave={() => !readonly && setHoverRating(0)}    // Reset hover preview
          disabled={readonly}
          aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`} // Accessibility label
        >
          {/* Fill the star with gold color if it's active, otherwise render as outline */}
          <FiStar size={size} fill={star <= (hoverRating || rating) ? '#fbbf24' : 'none'} />
        </button>
      ))}
    </div>
  )
}

export default StarInput
