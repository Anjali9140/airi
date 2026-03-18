import { useState } from "react";
import InitialLibrary from "./LibraryCompo/InitialLibrary";
import LibraryImage from "./LibraryCompo/LibraryImage";

const LibrayCompo = () => {
  const [savedImages, setSavedImages] = useState([
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
    "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
  ]); // array of img src (uncomment the srcs to see saved images ui)
  return (
    <div className="min-h-screen bg-bg-app text-white flex flex-col items-center justify-start p-6">
      {(!savedImages || savedImages.length === 0) && <InitialLibrary />}
      {savedImages && savedImages.length > 0 && (
        <>
          <div className="mb-6">
            <h2 className="text-4xl max-lg:text-2xl font-bold">Images</h2>
          </div>
          <div className="grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-4 w-full max-w-7xl select-none max-h-screen">
            {savedImages.map((image, index) => (
              <LibraryImage
                key={`placeholder${index}`}
                src={image}
                index={index}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default LibrayCompo;
