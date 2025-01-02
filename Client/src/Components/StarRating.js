// src/components/StarRating.js
import React from "react";

const StarRating = ({ rating, setRating, editable = false }) => {
  const handleClick = (index) => {
    if (editable && setRating) {
      setRating(index + 1);
    }
  };

  return (
    <div>
      {[...Array(5)].map((star, index) => {
        return (
          <span
            key={index}
            onClick={() => handleClick(index)}
            style={{
              cursor: editable ? "pointer" : "default",
              color: index < rating ? "#ffc107" : "#e4e5e9",
              fontSize: "24px",
            }}
          >
            ★
          </span>
        );
      })}
    </div>
  );
};

export default StarRating;
