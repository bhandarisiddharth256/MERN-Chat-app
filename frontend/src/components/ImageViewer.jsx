function ImageViewer({ src, onClose }) {
  return (
    <div
      onClick={onClose}
      className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50"
    >
      <img
        src={src}
        alt="full"
        className="max-w-full max-h-full"
      />
      <button
        onClick={onClose}
        className="absolute top-5 right-5 text-white text-2xl"
      >
        ✕
      </button>
    </div>
  );
}

export default ImageViewer;
