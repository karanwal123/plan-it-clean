import React, { useState } from "react";
import { Download, FileText, Image } from "lucide-react";
import { exportItineraryAsPDF, exportItineraryAsPNG } from "../utils/pdfExport";

export default function ExportButton({ routeData, disabled = false }) {
  const [isExporting, setIsExporting] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleExport = async (format) => {
    setIsExporting(true);
    setShowDropdown(false);

    try {
      let result;
      if (format === "pdf") {
        result = await exportItineraryAsPDF(routeData);
      } else if (format === "png") {
        result = await exportItineraryAsPNG(routeData);
      }

      if (result.success) {
        // Could show a success toast here
        console.log(`Exported as ${result.fileName}`);
      } else {
        console.error("Export failed:", result.error);
      }
    } catch (error) {
      console.error("Export error:", error);
    } finally {
      setIsExporting(false);
    }
  };

  if (disabled) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        disabled={isExporting}
        className="bg-[#89ECDB] hover:bg-[#7AD4C4] text-[#2B3638] px-4 py-2 rounded-lg transition-colors flex items-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-4 h-4" />
        {isExporting ? "Exporting..." : "Export"}
      </button>

      {showDropdown && (
        <div className="absolute top-full left-0 mt-2 bg-[#1E2528] rounded-lg shadow-lg border border-gray-600 z-10 min-w-[120px]">
          <button
            onClick={() => handleExport("pdf")}
            className="w-full px-4 py-2 text-left text-white hover:bg-[#2B3638] rounded-t-lg flex items-center gap-2"
          >
            <FileText className="w-4 h-4" />
            PDF
          </button>
          <button
            onClick={() => handleExport("png")}
            className="w-full px-4 py-2 text-left text-white hover:bg-[#2B3638] rounded-b-lg flex items-center gap-2"
          >
            <Image className="w-4 h-4" />
            PNG
          </button>
        </div>
      )}
    </div>
  );
}
