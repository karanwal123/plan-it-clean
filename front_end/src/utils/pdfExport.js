// utils/pdfExport.js
import jsPDF from "jspdf";

export async function generateItineraryPDF(routeData) {
  const {
    orderedLocations,
    totalDistance,
    totalDuration,
    routeSummary,
    locationsWithWeather,
    weatherRecommendations,
    directionsResult,
  } = routeData;

  const pdf = new jsPDF();
  const pageWidth = pdf.internal.pageSize.width;
  const pageHeight = pdf.internal.pageSize.height;
  let yPosition = 20;

  // Helper function to add text with wrapping
  const addWrappedText = (text, x, y, maxWidth, fontSize = 11) => {
    pdf.setFontSize(fontSize);
    const lines = pdf.splitTextToSize(text, maxWidth);
    pdf.text(lines, x, y);
    return y + lines.length * fontSize * 0.4;
  };

  // Helper function to check if we need a new page
  const checkNewPage = (requiredSpace) => {
    if (yPosition + requiredSpace > pageHeight - 20) {
      pdf.addPage();
      yPosition = 20;
    }
  };

  // Title
  pdf.setFontSize(24);
  pdf.setTextColor(137, 236, 219); // #89ECDB
  pdf.text("Plan-it Itinerary", pageWidth / 2, yPosition, { align: "center" });
  yPosition += 15;

  // Trip Overview
  pdf.setFontSize(16);
  pdf.setTextColor(0, 0, 0);
  pdf.text("Trip Overview", 20, yPosition);
  yPosition += 10;

  pdf.setFontSize(11);
  pdf.text(`Total Distance: ${totalDistance} km`, 20, yPosition);
  yPosition += 7;
  pdf.text(
    `Estimated Duration: ${Math.floor(totalDuration / 60)}h ${
      totalDuration % 60
    }m`,
    20,
    yPosition
  );
  yPosition += 7;
  pdf.text(`Number of Stops: ${orderedLocations.length}`, 20, yPosition);
  yPosition += 7;
  pdf.text(`Generated: ${new Date().toLocaleDateString()}`, 20, yPosition);
  yPosition += 15;

  // Route Details
  checkNewPage(30);
  pdf.setFontSize(16);
  pdf.text("Route Details", 20, yPosition);
  yPosition += 10;

  orderedLocations.forEach((location, index) => {
    checkNewPage(25);

    pdf.setFontSize(12);
    pdf.setTextColor(43, 54, 56); // Dark color for location names
    pdf.text(`${index + 1}. ${location.name}`, 20, yPosition);
    yPosition += 8;

    if (location.formatted_address) {
      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      yPosition = addWrappedText(
        location.formatted_address,
        25,
        yPosition,
        pageWidth - 45,
        10
      );
      yPosition += 5;
    }

    // Weather info if available
    const weatherLocation = locationsWithWeather?.find(
      (wl) => wl.name === location.name
    );
    if (weatherLocation?.weather) {
      pdf.setFontSize(9);
      pdf.setTextColor(70, 130, 180);
      pdf.text(
        `Weather: ${weatherLocation.weather.temp}°C, ${weatherLocation.weather.description}`,
        25,
        yPosition
      );
      yPosition += 6;
    }

    yPosition += 5;
  });

  // Weather Recommendations
  if (weatherRecommendations?.length > 0) {
    checkNewPage(40);
    yPosition += 5;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Weather Recommendations", 20, yPosition);
    yPosition += 10;

    weatherRecommendations.forEach((recommendation) => {
      checkNewPage(20);
      pdf.setFontSize(10);

      // Color code by priority
      if (recommendation.priority === "high") {
        pdf.setTextColor(220, 53, 69); // Red
      } else if (recommendation.priority === "medium") {
        pdf.setTextColor(255, 193, 7); // Yellow
      } else {
        pdf.setTextColor(40, 167, 69); // Green
      }

      yPosition = addWrappedText(
        `• ${recommendation.message}`,
        20,
        yPosition,
        pageWidth - 40,
        10
      );
      yPosition += 3;
    });
  }

  // Route Summary
  if (routeSummary && routeSummary.trim()) {
    checkNewPage(40);
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Route Summary", 20, yPosition);
    yPosition += 10;

    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    yPosition = addWrappedText(routeSummary, 20, yPosition, pageWidth - 40, 10);
  }

  // Directions Summary
  if (directionsResult?.routes?.[0]?.legs?.length > 0) {
    checkNewPage(40);
    yPosition += 10;
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text("Turn-by-Turn Directions", 20, yPosition);
    yPosition += 10;

    directionsResult.routes[0].legs.forEach((leg, legIndex) => {
      // Safety check for leg properties
      if (!leg || !leg.steps || !Array.isArray(leg.steps)) {
        return;
      }

      checkNewPage(25);
      pdf.setFontSize(12);
      pdf.setTextColor(43, 54, 56);

      const startAddr = leg.start_address || `Stop ${legIndex + 1}`;
      const endAddr = leg.end_address || `Stop ${legIndex + 2}`;
      pdf.text(`Leg ${legIndex + 1}: ${startAddr} → ${endAddr}`, 20, yPosition);
      yPosition += 8;

      pdf.setFontSize(10);
      pdf.setTextColor(100, 100, 100);
      const distance = leg.distance?.text || "Unknown distance";
      const duration = leg.duration?.text || "Unknown duration";
      pdf.text(`Distance: ${distance} | Duration: ${duration}`, 25, yPosition);
      yPosition += 10;

      // Key steps only (first 3-4 major steps to avoid overwhelming)
      const keySteps = leg.steps.slice(0, 4);
      keySteps.forEach((step, stepIndex) => {
        checkNewPage(15);
        // Safely handle missing html_instructions
        const rawInstruction =
          step.html_instructions || step.instructions || "Continue on route";
        const instruction = rawInstruction.replace(/<[^>]*>/g, ""); // Remove HTML tags
        yPosition = addWrappedText(
          `${stepIndex + 1}. ${instruction}`,
          30,
          yPosition,
          pageWidth - 50,
          9
        );
        yPosition += 2;
      });

      if (leg.steps.length > 4) {
        pdf.text(`... and ${leg.steps.length - 4} more steps`, 30, yPosition);
        yPosition += 8;
      }

      yPosition += 5;
    });
  }

  // Footer
  pdf.setFontSize(8);
  pdf.setTextColor(150, 150, 150);
  pdf.text(
    "Generated by Plan-it Route Planner",
    pageWidth / 2,
    pageHeight - 10,
    { align: "center" }
  );

  return pdf;
}

export async function exportItineraryAsPDF(routeData) {
  try {
    // Validate input data
    if (
      !routeData ||
      !routeData.orderedLocations ||
      routeData.orderedLocations.length === 0
    ) {
      throw new Error("No route data available for export");
    }

    const pdf = await generateItineraryPDF(routeData);
    const fileName = `plan-it-itinerary-${
      new Date().toISOString().split("T")[0]
    }.pdf`;
    pdf.save(fileName);
    return { success: true, fileName };
  } catch (error) {
    console.error("PDF export failed:", error);
    return { success: false, error: error.message };
  }
}

// Alternative: Export as PNG (simplified itinerary card)
export async function exportItineraryAsPNG(routeData) {
  const { orderedLocations, totalDistance, totalDuration } = routeData;

  // Create a canvas element
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // Set canvas size
  canvas.width = 800;
  canvas.height = Math.max(600, orderedLocations.length * 80 + 200);

  // Background
  ctx.fillStyle = "#2B3638";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Title
  ctx.fillStyle = "#89ECDB";
  ctx.font = "bold 32px Arial";
  ctx.textAlign = "center";
  ctx.fillText("Plan-it Itinerary", canvas.width / 2, 50);

  // Trip stats
  ctx.fillStyle = "#FFFFFF";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText(`Distance: ${totalDistance} km`, 50, 100);
  ctx.fillText(
    `Duration: ${Math.floor(totalDuration / 60)}h ${totalDuration % 60}m`,
    300,
    100
  );
  ctx.fillText(`Stops: ${orderedLocations.length}`, 550, 100);

  // Locations
  ctx.font = "18px Arial";
  let yPos = 150;

  orderedLocations.forEach((location, index) => {
    // Location number circle
    ctx.fillStyle = "#89ECDB";
    ctx.beginPath();
    ctx.arc(70, yPos, 20, 0, 2 * Math.PI);
    ctx.fill();

    // Location number
    ctx.fillStyle = "#2B3638";
    ctx.font = "bold 16px Arial";
    ctx.textAlign = "center";
    ctx.fillText(index + 1, 70, yPos + 5);

    // Location name
    ctx.fillStyle = "#FFFFFF";
    ctx.font = "18px Arial";
    ctx.textAlign = "left";
    ctx.fillText(location.name, 110, yPos + 5);

    // Location address (truncated)
    if (location.formatted_address) {
      ctx.fillStyle = "#CCCCCC";
      ctx.font = "14px Arial";
      const maxWidth = canvas.width - 120;
      const truncatedAddress =
        location.formatted_address.length > 60
          ? location.formatted_address.substring(0, 60) + "..."
          : location.formatted_address;
      ctx.fillText(truncatedAddress, 110, yPos + 25);
    }

    yPos += 70;
  });

  // Footer
  ctx.fillStyle = "#89ECDB";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    `Generated on ${new Date().toLocaleDateString()}`,
    canvas.width / 2,
    canvas.height - 30
  );

  // Convert to blob and download
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `plan-it-itinerary-${
        new Date().toISOString().split("T")[0]
      }.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      resolve({ success: true, fileName: a.download });
    }, "image/png");
  });
}
