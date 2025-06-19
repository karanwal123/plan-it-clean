// src/styles/mapStyles.js

// Professional color palette
export const colorPalette = [
  "#2563EB", // Blue
  "#059669", // Green
  "#DC2626", // Red
  "#D97706", // Orange
  "#7C3AED", // Purple
  "#0891B2", // Cyan
  "#65A30D", // Lime
  "#BE123C", // Rose
  "#4338CA", // Indigo
  "#0D9488", // Teal
];

// Simple pin marker without SVG
export const createCustomPinMarker = (color, index) => ({
  path: window.google.maps.SymbolPath.CIRCLE,
  fillColor: color,
  fillOpacity: 1,
  strokeColor: "#ffffff",
  strokeWeight: 3,
  scale: 12,
  labelOrigin: { x: 0, y: 0 },
});

// Clean path styling
export const getEnhancedPathOptions = () => ({
  strokeColor: "#2563EB",
  strokeWeight: 4,
  strokeOpacity: 0.8,
  geodesic: true,
});

// Professional light map theme (default clean style)
export const lightMapStyle = [];

// Professional dark map theme
export const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#1f2937" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#f9fafb" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#1f2937" }] },
  {
    featureType: "administrative",
    elementType: "geometry.stroke",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "landscape",
    elementType: "geometry",
    stylers: [{ color: "#111827" }],
  },
  {
    featureType: "poi",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "poi",
    elementType: "labels.text",
    stylers: [{ visibility: "off" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#374151" }],
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#4b5563" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#0f172a" }],
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#9ca3af" }],
  },
];

// Utility function to get color by index
export const pickColor = (index) => {
  return colorPalette[index % colorPalette.length];
};
