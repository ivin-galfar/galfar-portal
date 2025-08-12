import { IoMdClose } from "react-icons/io";

const VendorSelectionTooltip = ({ setShowTooltip, message }) => {
  return (
    <div
      className="absolute z-50 left-full ml-2 w-80 bg-white border border-gray-300 rounded shadow-lg p-3 text-gray-800 overflow-x-visible"
      style={{ transform: "translateY(-50%)" }}
    >
      <div
        className="absolute bottom-0 -left-2  "
        style={{
          width: 0,
          height: 0,
          borderTop: "8px solid transparent",
          borderBottom: "8px solid transparent",
          borderRight: "8px solid white",
          filter: "drop-shadow(1px 0 1px rgba(0,0,0,0.1))",
          zIndex: 51,
        }}
      ></div>

      <div className="flex justify-between items-start relative z-50">
        <div className="text-sm">{message}</div>
        <button
          aria-label="Close tooltip"
          onClick={() => setShowTooltip(false)}
          className="text-gray-500 hover:text-gray-800 focus:outline-none"
        >
          <IoMdClose size={20} />
        </button>
      </div>
    </div>
  );
};

export default VendorSelectionTooltip;
