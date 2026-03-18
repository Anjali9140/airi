import LibraryImage from "./LibraryImage";

const images = [
  "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-4-Bo3myp2j.avif",
  "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-3-B4dzi3_C.avif",
  "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-2-eI7p8MO9.avif",
  "https://copilot.microsoft.com/static/cmc/assets/image-placeholder-1-BXEpB69s.avif",
];
function InitialLibrary() {
  return (
    <>
      {/* Card Container */}
      <div className="grid grid-cols-4 max-md:grid-cols-2 max-lg:grid-cols-3 max-sm:grid-cols-1 gap-6 w-full max-w-7xl select-none max-h-screen overflow-hidden">
        {images.map((image, index) => (
          <LibraryImage key={`placeholder${index}`} src={image} index={index} />
        ))}
      </div>

      {/* Hero Content Overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-linear-to-b from-transparent via-slate-900 to-slate-900 via-35%">
        <h1 className="text-2xl md:text-xl font-bold  mb-8 max-w-md leading-tight">
          Organize thoughts, edit, <br /> and share your documents
        </h1>
      </div>
    </>
  );
}

export default InitialLibrary;
