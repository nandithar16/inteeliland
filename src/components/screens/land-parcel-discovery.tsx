import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { MapPin, Building2, Zap, TrendingUp, Star, Search, ArrowLeft } from "lucide-react";
import { supabase } from "@/Supabase/supabaseclient";

interface LandParcelDiscoveryProps {
  onBack?: () => void;
  onDiscover?: (filters: any) => void;
}

export default function LandParcelDiscovery({ onBack, onDiscover }: LandParcelDiscoveryProps) {

  const navigate = useNavigate();
  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  const [view, setView] = useState<"places" | "filters" | "completed">("places");
  const [allPlaces, setAllPlaces] = useState<any[]>([]);
  const [filteredPlaces, setFilteredPlaces] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [allTownshipData, setAllTownshipData] = useState<any[]>([]);
  const [news, setNews] = useState<string[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<any>(null);
  const [selectedTownships, setSelectedTownships] = useState<string[]>([]);
  const [selectedInfrastructure, setSelectedInfrastructure] = useState<string[]>([]);
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedAds, setSelectedAds] = useState<string[]>([]);
  const [nearbyTownships, setNearbyTownships] = useState<any[]>([]);

  // Prevent useEffect from running twice in dev (React.StrictMode)
  const fetchedRef = useRef(false);
  const filtersAppliedRef = useRef(false);

  const infrastructure = [
    "Roads",
    "Power",
    "Water",
    "Internet",
    "Drainage",
    "Parks",
    "Street Lights",
    "Security",
  ];

  const realEstateAds = [
    "Premium Plots in Devanahalli",
    "Residential Land Near Airport",
    "BMRDA Approved Sites",
    "Investment Opportunities",
    "Gated Community Plots",
    "Ready to Construct Land",
  ];

  const bangaloreLocations = [
    { name: "Indiranagar", latitude: 12.9719, longitude: 77.6412 },
    { name: "JP Nagar", latitude: 12.9082, longitude: 77.5855 },
    { name: "Whitefield", latitude: 12.9698, longitude: 77.7499 },
    { name: "Sarjapur", latitude: 12.8813, longitude: 77.7612 },
    { name: "Electronic City", latitude: 12.8451, longitude: 77.6602 },
    { name: "Koramangala", latitude: 12.9352, longitude: 77.6245 },
    { name: "Devanahalli", latitude: 13.2426, longitude: 77.7085 },
    { name: "Marathahalli", latitude: 12.9591, longitude: 77.6974 },
    { name: "Mahadevapura", latitude: 12.9897, longitude: 77.6978 },
    { name: "Hebbal", latitude: 13.0358, longitude: 77.597 },
    { name: "Yelahanka", latitude: 13.1007, longitude: 77.5963 },
    { name: "HSR Layout", latitude: 12.9121, longitude: 77.6446 },
    { name: "BTM Layout", latitude: 12.9165, longitude: 77.6101 },
    { name: "Jayanagar", latitude: 12.925, longitude: 77.5838 },
    { name: "Banashankari", latitude: 12.925, longitude: 77.5487 },
    { name: "Malleshwaram", latitude: 13.0038, longitude: 77.5703 },
    { name: "Rajajinagar", latitude: 12.9915, longitude: 77.5528 },
    { name: "Vijayanagar", latitude: 12.9716, longitude: 77.5344 },
    { name: "Basavanagudi", latitude: 12.9423, longitude: 77.5738 },
  ];

  useEffect(() => {
    setAllPlaces(bangaloreLocations);
    setFilteredPlaces(bangaloreLocations);
  }, []);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const fetchData = async () => {
      try {
        const { data: landData, error: landError } = await supabase
          .from("landdetails")
          .select("property_name, latitude, longitude");

        if (!landError && landData) {
          const validTownships = landData
            .filter(
              (item) =>
                item.property_name &&
                item.property_name.trim() !== "" &&
                item.latitude &&
                item.longitude
            )
            .map((item) => ({
              name: item.property_name,
              latitude: parseFloat(item.latitude),
              longitude: parseFloat(item.longitude),
            }));

          setAllTownshipData(validTownships);
        }

        const { data: newsData, error: newsError } = await supabase
          .from("bangalore_news")
          .select("headline");

        if (!newsError && newsData) {
          const uniqueNews = Array.from(
            new Set(
              newsData
                .map((n) => n.headline)
                .filter((headline) => headline && headline.trim() !== "")
            )
          );
          setNews(uniqueNews);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, []);

  const handleSearchChange = (e: any) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim() === "") setFilteredPlaces(allPlaces);
    else
      setFilteredPlaces(
        allPlaces.filter((p) =>
          p.name.toLowerCase().includes(query.toLowerCase())
        )
      );
  };

  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const handlePlaceSelect = (place: any) => {
    setSelectedPlace(place);
    setSelectedTownships([]);
    setSelectedInfrastructure([]);
    setSelectedNews([]);
    setSelectedAds([]);

    const nearby = allTownshipData
      .map((township) => ({
        ...township,
        distance: calculateDistance(
          place.latitude,
          place.longitude,
          township.latitude,
          township.longitude
        ),
      }))
      .filter((township) => township.distance <= 50)
      .sort((a, b) => a.distance - b.distance);

    const uniqueNearby = Array.from(
      new Map(nearby.map((t) => [t.name, t])).values()
    );

    setNearbyTownships(uniqueNearby);
    setView("filters");
  };

  const toggleSelection = (list: string[], setList: any, value: string) => {
    setList(
      list.includes(value)
        ? list.filter((item) => item !== value)
        : [...list, value]
    );
  };

  const handleApplyFilters = async () => {
    // Prevent multiple submissions
    if (filtersAppliedRef.current) return;
    filtersAppliedRef.current = true;

    const filters = {
      place: selectedPlace?.name,
      townships: selectedTownships,
      infrastructure: selectedInfrastructure,
      news: selectedNews,
      ads: selectedAds,
    };

    try {
      const { error } = await supabase.from("land_discoveries").insert([filters]);
      if (error) console.error("Error saving filters:", error);
    } catch (err) {
      console.error("Error saving filters:", err);
    }

    // Set view to completed to prevent re-rendering the filter selection
    setView("completed");
    
    // Call the parent's onDiscover callback
    if (onDiscover) {
      onDiscover(filters);
    }
  };

  const handleBackToPlaces = () => {
    setView("places");
    setSelectedPlace(null);
    filtersAppliedRef.current = false;
  };

  // ---------- COMPLETED VIEW (Hidden - just prevents re-render) ----------
  if (view === "completed") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 rounded-[2rem] shadow-card border border-slate-200/70">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-700 font-medium">Loading results...</p>
        </div>
      </div>
    );
  }

  // ---------- FILTERS VIEW ----------
  if (view === "filters") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50">
        <header className="bg-white/90 shadow-lg border border-slate-200/70 backdrop-blur-lg">
          <div className="container mx-auto px-4 py-4">
            <Button
              variant="ghost"
              onClick={handleBackToPlaces}
              className="text-blue-600 hover:text-blue-700"
            >
              ← Change Location
            </Button>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 max-w-7xl">
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Apply Filters</h1>
          <p className="text-slate-600 mb-8">
            Refine your search with additional filters for <strong>{selectedPlace?.name}</strong>
          </p>

          <div className="grid md:grid-cols-4 gap-6 mb-8">
            {/* Townships */}
            <FilterCard
              title="Townships"
              icon={<Building2 className="w-5 h-5 text-blue-600" />}
              color="blue"
              data={nearbyTownships.map((t) => t.name)}
              selected={selectedTownships}
              toggle={(v: string) => toggleSelection(selectedTownships, setSelectedTownships, v)}
              emptyText="No townships found nearby"
            />

            {/* Infrastructure */}
            <FilterCard
              title="Infrastructure"
              icon={<Zap className="w-5 h-5 text-emerald-600" />}
              color="emerald"
              data={infrastructure}
              selected={selectedInfrastructure}
              toggle={(v: string) =>
                toggleSelection(selectedInfrastructure, setSelectedInfrastructure, v)
              }
            />

            {/* News */}
            <FilterCard
              title="Real Estate News"
              icon={<TrendingUp className="w-5 h-5 text-amber-600" />}
              color="amber"
              data={news}
              selected={selectedNews}
              toggle={(v: string) => toggleSelection(selectedNews, setSelectedNews, v)}
              emptyText="No news available"
            />

            {/* Ads */}
            <FilterCard
              title="Real Estate Ads"
              icon={<Star className="w-5 h-5 text-purple-600" />}
              color="purple"
              data={realEstateAds}
              selected={selectedAds}
              toggle={(v: string) => toggleSelection(selectedAds, setSelectedAds, v)}
            />
          </div>

          <div className="flex gap-4 justify-between">
            <Button variant="outline" size="lg" onClick={handleBackToPlaces} className="px-8">
              Back
            </Button>
            <Button
              onClick={handleApplyFilters}
              size="lg"
              disabled={filtersAppliedRef.current}
              className="bg-blue-600 hover:bg-blue-700 text-white px-12 disabled:opacity-50"
            >
              {filtersAppliedRef.current ? "Processing..." : "Apply Filters & Discover"}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // ---------- PLACES VIEW ----------
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-sky-50 to-indigo-50">
      <header className="bg-white/90 shadow-lg border border-slate-200/70 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={handleBack}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Select Your Area</h1>
        <p className="text-slate-600 mb-6">
          Choose the Bangalore location where you want to find land parcels
        </p>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
          <Input
            type="text"
            placeholder="Search locations..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 py-6 text-lg"
          />
          <p className="text-slate-500 text-sm mt-2">
            Found {filteredPlaces.length} locations
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {filteredPlaces.map((place) => (
            <Card
              key={place.name}
              className="cursor-pointer hover:shadow-lg transition-all border-2 border-slate-200 hover:border-blue-500"
              onClick={() => handlePlaceSelect(place)}
            >
              <CardContent className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MapPin className="w-5 h-5 text-blue-600" />
                  <span className="font-semibold text-slate-800">{place.name}</span>
                </div>
                <span className="text-blue-600">→</span>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Helper Reusable Card ---
function FilterCard({
  title,
  icon,
  color,
  data,
  selected,
  toggle,
  emptyText,
}: {
  title: string;
  icon: any;
  color: string;
  data: string[];
  selected: string[];
  toggle: (v: string) => void;
  emptyText?: string;
}) {
  const borderColor = selected.length > 0 ? `border-${color}-500 ring-2 ring-${color}-200` : "border-slate-200";
  return (
    <Card className={`shadow-lg rounded-xl border-2 transition-all ${borderColor}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2 font-semibold text-slate-800">
          {icon}
          {title}
          {selected.length > 0 && (
            <Badge className={`bg-${color}-600 text-white ml-auto`}>
              {selected.length}
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 max-h-80 overflow-y-auto">
        {data.length === 0 ? (
          <p className="text-slate-500 text-sm text-center py-4">
            {emptyText || "No data available"}
          </p>
        ) : (
          data.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-all bg-slate-50 hover:bg-slate-100"
            >
              <input
                type="checkbox"
                checked={selected.includes(item)}
                onChange={() => toggle(item)}
                className="w-4 h-4"
              />
              <span className="text-sm font-medium text-slate-700">{item}</span>
            </label>
          ))
        )}
      </CardContent>
    </Card>
  );
}
