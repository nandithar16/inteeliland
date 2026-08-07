import {
  Target,
  Search,
  Sparkles,
  CheckCircle2,
  ArrowRight,
  DollarSign,
  Maximize2,
  Navigation,
  MapPin,
  Loader2,
  Link2,
} from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom"; // ✅ for redirect
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface MainNavigationProps {
  onDiscoverLandParcel: () => void;
  onFilterByCost: (maxCost: number) => void;
  onFilterBySize: (minSize: number, maxSize: number) => void;
  onFilterByDistance: (arg: number | { maxDistance: number; placeCoordinates?: { latitude: number; longitude: number } }) => void;
}

async function parseGoogleMapsLink(url: string): Promise<{ lat: number; lng: number } | null> {
  try {
    if (url.includes("goo.gl") || url.includes("maps.app.goo.gl")) {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const response = await fetch(proxyUrl, { redirect: "follow" });
        const html = await response.text();

        const coordMatch = html.match(/@(-?\d+\.?\d*),(-?\d+\.?\d*)/);
        if (coordMatch) return { lat: parseFloat(coordMatch[1]), lng: parseFloat(coordMatch[2]) };

        const metaMatch = html.match(
          /content="https:\/\/www\.google\.com\/maps[^"]*@(-?\d+\.?\d*),(-?\d+\.?\d*)"/
        );
        if (metaMatch) return { lat: parseFloat(metaMatch[1]), lng: parseFloat(metaMatch[2]) };
      } catch (e) {
        console.error("Error expanding shortened URL:", e);
      }
    }

    const regexes = [
      /@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /\/place\/[^/]+\/@(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /[?&]q=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /\/maps\/place\/(-?\d+\.?\d*),(-?\d+\.?\d*)/,
      /ll=(-?\d+\.?\d*),(-?\d+\.?\d*)/,
    ];

    for (const regex of regexes) {
      const match = url.match(regex);
      if (match) return { lat: parseFloat(match[1]), lng: parseFloat(match[2]) };
    }

    return null;
  } catch {
    return null;
  }
}

export default function MainNavigation({
  onDiscoverLandParcel,
  onFilterByCost,
  onFilterBySize,
  onFilterByDistance,
}: MainNavigationProps) {
  const navigate = useNavigate();

  const [showLocationSearch, setShowLocationSearch] = useState(false);
  const [mapLink, setMapLink] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExpanding, setIsExpanding] = useState(false);
  const [linkError, setLinkError] = useState("");
  const [showPopup, setShowPopup] = useState(true);

  const [showCostInput, setShowCostInput] = useState(false);
  const [costValue, setCostValue] = useState("");
  const [showSizeInput, setShowSizeInput] = useState(false);
  const [minSize, setMinSize] = useState("");
  const [maxSize, setMaxSize] = useState("");
  const [showDistanceInput, setShowDistanceInput] = useState(false);
  const [distanceValue, setDistanceValue] = useState("");

  const handleMapLinkChange = async (value: string) => {
    setMapLink(value);
    setLinkError("");

    if (value.trim()) {
      if (value.includes("goo.gl") || value.includes("maps.app.goo.gl")) {
        setIsExpanding(true);
        setLinkError("Expanding shortened URL...");
      }

      const coords = await parseGoogleMapsLink(value);
      setIsExpanding(false);

      if (coords) {
        setLatitude(coords.lat.toString());
        setLongitude(coords.lng.toString());
        setLinkError("");
      } else {
        setLatitude("");
        setLongitude("");
        if (value.length > 10) {
          setLinkError(
            "Could not extract coordinates. Try copying the URL from your browser's address bar."
          );
        }
      }
    } else {
      setLatitude("");
      setLongitude("");
      setIsExpanding(false);
    }
  };

  // ✅ Redirects to detailed land parcel page
  const handleLocationSubmit = async () => {
    if (!mapLink.trim()) {
      alert("Please paste a Google Maps link");
      return;
    }

    if (!latitude || !longitude) {
      alert("Could not extract coordinates from the link. Please try again.");
      return;
    }

    setIsProcessing(true);
    try {
      navigate("/detailed-land-parcel", {
        state: {
          latitude: parseFloat(latitude),
          longitude: parseFloat(longitude),
          googleMapLink: mapLink,
        },
      });

      setIsProcessing(false);
    } catch (error) {
      console.error("Navigation error:", error);
      alert("Failed to navigate. Please try again.");
      setIsProcessing(false);
    }
  };

  const handleCostSubmit = () => {
    const cost = parseFloat(costValue);
    if (!isNaN(cost) && cost > 0) {
      onFilterByCost(cost);
      setShowCostInput(false);
      setCostValue("");
    } else alert("Please enter a valid cost value");
  };

  const handleSizeSubmit = () => {
    const min = parseFloat(minSize) || 0;
    const max = parseFloat(maxSize) || Infinity;
    if (min >= 0 && max > 0 && min <= max) {
      onFilterBySize(min, max);
      setShowSizeInput(false);
      setMinSize("");
      setMaxSize("");
    } else alert("Please enter valid size range");
  };

  const handleDistanceSubmit = () => {
    const distance = parseFloat(distanceValue);
    if (!isNaN(distance) && distance > 0) {
      const coords = latitude && longitude && !isNaN(parseFloat(latitude)) && !isNaN(parseFloat(longitude))
        ? { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
        : undefined;
      if (coords) onFilterByDistance({ maxDistance: distance, placeCoordinates: coords });
      else onFilterByDistance(distance);
      setShowDistanceInput(false);
      setDistanceValue("");
    } else alert("Please enter a valid distance value");
  };

  const isValid = latitude && longitude;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header Section */}
      <div
        className="relative h-[40vh] flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/95 via-indigo-900/90 to-purple-900/95" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/30" />
        <div className="relative z-10 text-center text-white px-4 max-w-5xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Sparkles className="h-4 w-4 text-yellow-300" />
            <span className="text-sm font-medium">Professional Land Assessment Platform</span>
          </div>
            <h1 className="text-6xl md:text-7xl font-extrabold mb-6 tracking-tight">
            <span className="bg-gradient-to-r from-white via-blue-100 to-purple-200 bg-clip-text text-transparent">
              InteeliLand
            </span>
          </h1>
          <div className="flex flex-wrap items-center justify-center gap-8 mt-12">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>GPS Accurate</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>Real-time Data</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="h-5 w-5 text-green-400" />
              <span>AI-Powered Insights</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Entry */}
      <div className="container mx-auto px-4 py-20 max-w-6xl">
        <div className="mb-6">
          <button
            onClick={() => setShowLocationSearch(!showLocationSearch)}
            disabled={isProcessing}
            className="w-full py-4 px-6 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-blue-200 hover:border-blue-400 flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-3xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-button">
                {isProcessing ? (
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Target className="h-5 w-5 text-white" />
                )}
              </div>
              <span className="text-lg font-semibold text-slate-800">
                {isProcessing ? "Processing Location..." : "Enter Location"}
              </span>
            </div>
            {!isProcessing && (
              <ArrowRight
                className={`h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-all duration-300 ${
                  showLocationSearch ? "rotate-90" : ""
                }`}
              />
            )}
          </button>

          {showLocationSearch && (
            <div className="mt-4 grid lg:grid-cols-2 gap-6">
              {/* Left panel */}
              <div className="p-6 bg-white rounded-[2rem] shadow-xl border border-blue-100 glass-panel">
                <div className="flex items-center gap-2 mb-4">
                  <Link2 className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Land Parcel Details</h3>
                </div>

                <input
                  type="text"
                  value={mapLink}
                  onChange={(e) => handleMapLinkChange(e.target.value)}
                  placeholder="Paste Google Maps URL here..."
                  disabled={isProcessing}
                  className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 mb-3"
                />

                {linkError && (
                  <p className={`text-xs mt-1 ${isExpanding ? "text-blue-600" : "text-red-600"}`}>
                    {linkError}
                  </p>
                )}

                {isValid && (
                  <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 px-3 py-2 rounded-lg mb-3">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Coordinates ready for assessment</span>
                  </div>
                )}

                <button
                  onClick={handleLocationSubmit}
                  disabled={!isValid || isProcessing}
                  className="w-full py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" /> Processing...
                    </>
                  ) : (
                    <>Continue to Assessment →</>
                  )}
                </button>
              </div>

              {/* Right panel - Live Map */}
              <div className="p-6 bg-white rounded-[2rem] shadow-xl border border-blue-100 glass-panel">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Live Map Preview</h3>
                </div>

                <div className="h-[400px] rounded-lg overflow-hidden border border-gray-200">
                  {isValid ? (
                    <Map
                      initialViewState={{
                        latitude: parseFloat(latitude),
                        longitude: parseFloat(longitude),
                        zoom: 14,
                      }}
                      style={{ width: "100%", height: "100%" }}
                      mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                    >
                      <NavigationControl position="top-right" />
                      <Marker latitude={parseFloat(latitude)} longitude={parseFloat(longitude)} color="red" />
                      {showPopup && (
                        <Popup
                          latitude={parseFloat(latitude)}
                          longitude={parseFloat(longitude)}
                          anchor="top"
                          onClose={() => setShowPopup(false)}
                        >
                          <div className="font-semibold">Main Land Parcel</div>
                        </Popup>
                      )}
                    </Map>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-50">
                      <MapPin className="h-16 w-16 mb-3 opacity-30" />
                      <p className="font-medium">Map preview will appear here</p>
                      <p className="text-sm">when you paste a Google Maps link</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Filter Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={onDiscoverLandParcel}
            className="py-4 px-6 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-emerald-200 hover:border-emerald-400 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                <Search className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-800">Select by Area</span>
            </div>
            <ArrowRight className="h-5 w-5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all duration-300" />
          </button>

          <button
            onClick={() => setShowCostInput(!showCostInput)}
            className="py-4 px-6 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-amber-200 hover:border-amber-400 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-800">Select by Cost</span>
            </div>
            <ArrowRight
              className={`h-5 w-5 text-slate-400 group-hover:text-amber-600 transition-all duration-300 ${
                showCostInput ? "rotate-90" : ""
              }`}
            />
          </button>

          <button
            onClick={() => setShowSizeInput(!showSizeInput)}
            className="py-4 px-6 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-purple-200 hover:border-purple-400 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
                <Maximize2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-800">Select by Size</span>
            </div>
            <ArrowRight
              className={`h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-all duration-300 ${
                showSizeInput ? "rotate-90" : ""
              }`}
            />
          </button>

          <button
            onClick={() => setShowDistanceInput(!showDistanceInput)}
            className="py-4 px-6 bg-white rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 border-2 border-rose-200 hover:border-rose-400 flex items-center justify-between group"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center">
                <Navigation className="h-5 w-5 text-white" />
              </div>
              <span className="text-lg font-semibold text-slate-800">Select by Distance</span>
            </div>
            <ArrowRight
              className={`h-5 w-5 text-slate-400 group-hover:text-rose-600 transition-all duration-300 ${
                showDistanceInput ? "rotate-90" : ""
              }`}
            />
          </button>
        </div>

        {/* Inline filter inputs (Cost / Size / Distance) */}
        <div className="mt-4">
          {showCostInput && (
            <div className="mb-4 p-4 bg-white rounded-[2rem] shadow-xl border border-amber-100 glass-panel">
              <div className="flex items-center gap-3 mb-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="font-medium">Enter maximum price per sqft (₹)</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="number"
                  value={costValue}
                  onChange={(e) => setCostValue(e.target.value)}
                  className="flex-1 min-w-[12rem] px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-amber-300"
                  placeholder="e.g., 95"
                />
                <button onClick={handleCostSubmit} className="px-6 py-3 bg-amber-500 text-white rounded-2xl shadow-button hover:bg-amber-600 transition-all duration-300">Search</button>
              </div>
            </div>
          )}

          {showSizeInput && (
            <div className="mb-4 p-4 bg-white rounded-[2rem] shadow-xl border border-purple-100 glass-panel">
              <div className="flex items-center gap-3 mb-2">
                <Maximize2 className="h-4 w-4 text-purple-600" />
                <span className="font-medium">Enter size range (sqft)</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="number"
                  value={minSize}
                  onChange={(e) => setMinSize(e.target.value)}
                  className="w-full md:w-1/2 min-w-[10rem] px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-300"
                  placeholder="Min"
                />
                <input
                  type="number"
                  value={maxSize}
                  onChange={(e) => setMaxSize(e.target.value)}
                  className="w-full md:w-1/2 min-w-[10rem] px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-purple-300"
                  placeholder="Max"
                />
                <button onClick={handleSizeSubmit} className="px-6 py-3 bg-purple-500 text-white rounded-2xl shadow-button hover:bg-purple-600 transition-all duration-300">Search</button>
              </div>
            </div>
          )}

          {showDistanceInput && (
            <div className="mb-4 p-4 bg-white rounded-[2rem] shadow-xl border border-rose-100 glass-panel">
              <div className="flex items-center gap-3 mb-2">
                <Navigation className="h-4 w-4 text-rose-600" />
                <span className="font-medium">Enter distance (km) — uses pasted map coordinates if available</span>
              </div>
              <div className="flex gap-2 flex-wrap">
                <input
                  type="number"
                  value={distanceValue}
                  onChange={(e) => setDistanceValue(e.target.value)}
                  className="flex-1 min-w-[12rem] px-4 py-3 border rounded-2xl focus:ring-2 focus:ring-rose-300"
                  placeholder="e.g., 5"
                />
                <button onClick={handleDistanceSubmit} className="px-6 py-3 bg-rose-500 text-white rounded-2xl shadow-button hover:bg-rose-600 transition-all duration-300">Search</button>
              </div>
              {latitude && longitude && (
                <p className="text-xs text-slate-500 mt-2">Using coordinates: {latitude}, {longitude}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
