export default function AutoLogoutModal({ open, onConfirm }) {
    if (!open) return null;
    return (
      <div
        className="fixed inset-0 flex items-center justify-center z-50"
        style={{
          backdropFilter: "blur(6px)", // This adds the blur
          background: "rgba(0,0,0,0.05)", // Optional: subtle darken, but mostly transparent
        }}
      >
        <div className="bg-white p-6 rounded shadow-lg text-center">
          <h2 className="text-lg font-semibold mb-4">Session Expired</h2>
          <p className="mb-6">You have been logged out due to inactivity.</p>
          <button
            className="px-4 py-2 bg-[#ff4e00] text-white rounded hover:bg-[#e64500] transition"
            onClick={onConfirm}
          >
            OK
          </button>
        </div>
      </div>
    );
  }