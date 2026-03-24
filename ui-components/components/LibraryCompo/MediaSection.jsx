'use client'

const MediaCard = ({ item }) => (
  <div
    role="button"
    tabIndex={0}
    className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
    aria-label="Preview or open media"
  >
    <img
      src={item.src}
      alt=""
      draggable={false}
      className="w-full h-full object-cover"
    />
    {/* hover overlay */}
    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
    {/* video badge */}
    {item.type === 'video' && (
      <div className="absolute bottom-2 left-2 text-white">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" fill="currentColor" className="w-5 h-5 drop-shadow">
          <path d="M160-160q-33 0-56.5-23.5T80-240v-480q0-33 23.5-56.5T160-800h480q33 0 56.5 23.5T720-720v180l160-160v440L720-420v180q0 33-23.5 56.5T640-160H160Z"/>
        </svg>
      </div>
    )}
  </div>
);

const MediaSection = ({ media }) => (
  <div>
    <div className="px-4 mb-3">
      <span className="text-sm font-medium text-text-primary">Media</span>
    </div>
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-1 px-1">
      {media.map((item) => (
        <MediaCard key={item.id} item={item} />
      ))}
    </div>
  </div>
);

export default MediaSection;
