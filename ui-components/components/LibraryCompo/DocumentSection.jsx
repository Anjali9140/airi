'use client'

const iconMap = {
  code: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-6 h-6">
      <path d="M320-240 80-480l240-240 57 57-184 184 183 183-56 56Zm320 0-57-57 184-184-183-183 56-56 240 240-240 240Z"/>
    </svg>
  ),
  description: (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-6 h-6">
      <path d="M320-240h320v-80H320v80Zm0-160h320v-80H320v80ZM240-80q-33 0-56.5-23.5T160-160v-640q0-33 23.5-56.5T240-880h320l240 240v480q0 33-23.5 56.5T720-80H240Zm280-520v-200H240v640h480v-440H520ZM240-800v200-200 640-640Z"/>
    </svg>
  ),
};

const DocumentItem = ({ doc }) => (
  <div
    role="button"
    tabIndex={0}
    className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer hover:bg-white/5 transition-colors group"
    aria-label={`Open ${doc.title}`}
  >
    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-white/8 flex items-center justify-center text-text-secondary">
      {iconMap[doc.icon] ?? iconMap.description}
    </div>
    <div className="flex-1 min-w-0">
      <div className="text-sm font-medium text-text-primary truncate">{doc.title}</div>
      <div className="text-xs text-text-secondary truncate mt-0.5">{doc.preview}</div>
    </div>
    <div className="flex-shrink-0 text-xs text-text-secondary ml-2">{doc.date}</div>
  </div>
);

const DocumentSection = ({ documents }) => (
  <div className="mb-6">
    <div className="flex items-center justify-between px-4 mb-1">
      <span className="text-sm font-medium text-text-primary">Documents</span>
      <button
        aria-label="View all documents"
        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/8 text-text-secondary transition-colors"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-5 h-5">
          <path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/>
        </svg>
      </button>
    </div>
    <div className="flex flex-col">
      {documents.map((doc) => (
        <DocumentItem key={doc.id} doc={doc} />
      ))}
    </div>
  </div>
);

export default DocumentSection;
