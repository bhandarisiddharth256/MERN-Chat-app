function LogoutConfirmModal({ onConfirm, onCancel }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 w-80 p-5 rounded-lg shadow-lg">
        
        <h2 className="text-lg font-semibold text-white mb-2">
          Logout
        </h2>

        <p className="text-sm text-gray-400 mb-5">
          Are you sure you want to logout?
        </p>

        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-1.5 rounded bg-gray-600 hover:bg-gray-500 text-sm"
          >
            Cancel
          </button>

          <button
            onClick={onConfirm}
            className="px-4 py-1.5 rounded bg-red-600 hover:bg-red-700 text-sm"
          >
            Yes, Logout
          </button>
        </div>
      </div>
    </div>
  );
}

export default LogoutConfirmModal;
