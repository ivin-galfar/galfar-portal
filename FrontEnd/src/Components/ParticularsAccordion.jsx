import { useState, useRef, useEffect } from "react";
import { FaChevronDown } from "react-icons/fa";

const ParticularsAccordion = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false);
  const contentRef = useRef(null);

  if (!Array.isArray(items) || items.length === 0) return "-";

  return (
    <div className="w-3xs">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full text-left cursor-pointer text-blue-600 focus:outline-none"
      >
        <span className="truncate ">Particulars</span>
        <FaChevronDown
          className={`h-4 w-4 transition-transform duration-300 cursor-pointer ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      <div
        ref={contentRef}
        className={`transition-all duration-300 ease-in-out overflow-hidden`}
        style={{
          maxHeight: isOpen ? contentRef.current?.scrollHeight : 0,
        }}
      >
        <ul className="list-disc pl-4 pr-2 py-2 space-y-1 text-sm text-gray-700">
          {items &&
            items
              .filter((item) => item.trim() !== "")
              .map((item, idx) => (
                <li key={idx} className="break-words whitespace-normal">
                  {item}
                </li>
              ))}
        </ul>
      </div>
    </div>
  );
};

export default ParticularsAccordion;
