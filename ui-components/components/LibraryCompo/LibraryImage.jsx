import React from "react";

function LibraryImage({ src, index }) {
  return (
    <div className="w-full aspect-square overflow-hidden">
      <img
        src={src}
        alt={`placeholder-img-${index}`}
        className="w-full h-full object-center object-cover"
      />
    </div>
  );
}

export default LibraryImage;
