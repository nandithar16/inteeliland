import { useEffect, useState } from "react";
import Map, { Marker, Popup, NavigationControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";

interface MapViewProps {
  lat: number;
  lng: number;
}

interface NearbyFeature {
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags: Record<string, string>;
}

// Fetch nearby features using Overpass API
async function fetchNearby(lat: number, lng: number): Promise<NearbyFeature[]> {
  const query = `
    [out:json];
    (
      node(around:5000,${lat},${lng})[aeroway=aerodrome];
      node(around:5000,${lat},${lng})[amenity=bus_station];
      node(around:5000,${lat},${lng})[amenity=school];
      node(around:5000,${lat},${lng})[shop=mall];
      way(around:5000,${lat},${lng})[natural=water];
    );
    out center;
  `;
  const url = "https://overpass-api.de/api/interpreter?data=" + encodeURIComponent(query);
  const res = await fetch(url);
  const data = await res.json();
  return data.elements || [];
}

export default function MapView({ lat, lng }: MapViewProps) {
  // Longitude first, latitude second
  const [userLocation] = useState<[number, number]>([lng, lat]);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [nearby, setNearby] = useState<NearbyFeature[]>([]);
  const [selectedMarker, setSelectedMarker] = useState<[number, number] | null>(null);

  // Load nearby features
  const loadNearby = async (lat: number, lng: number) => {
    const results = await fetchNearby(lat, lng);
    setNearby(results);
  };

  useEffect(() => {
    loadNearby(lat, lng);
  }, [lat, lng]);

  // Handle map click to update destination
  const handleMapClick = (event: any) => {
    const { lngLat } = event;
    const newLocation: [number, number] = [lngLat.lng, lngLat.lat];
    setDestination(newLocation);
    setSelectedMarker(newLocation);
    loadNearby(newLocation[1], newLocation[0]);
  };

  // Helper to get coordinates safely
  const getCoords = (item: NearbyFeature) => {
    const lat = item.lat ?? item.center?.lat;
    const lon = item.lon ?? item.center?.lon;
    if (lat === undefined || lon === undefined) return null;
    return [lon, lat] as [number, number];
  };

  return (
    <div style={{ display: "flex", gap: "16px" }}>
      {/* Map Section */}
      <div style={{ height: "500px", width: "70%", borderRadius: "12px", overflow: "hidden" }}>
        <Map
          initialViewState={{
            longitude: userLocation[0],
            latitude: userLocation[1],
            zoom: 13,
          }}
          style={{ width: "100%", height: "100%" }}
          mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
          onClick={handleMapClick}
        >
          <NavigationControl position="top-right" />

          {/* User Marker */}
          <Marker longitude={userLocation[0]} latitude={userLocation[1]} color="red" />
          {selectedMarker &&
            selectedMarker[0] === userLocation[0] &&
            selectedMarker[1] === userLocation[1] && (
              <Popup
                longitude={userLocation[0]}
                latitude={userLocation[1]}
                anchor="top"
                onClose={() => setSelectedMarker(null)}
              >
                Land Parcel Location
              </Popup>
            )}

          {/* Destination Marker */}
          {destination && (
            <Marker longitude={destination[0]} latitude={destination[1]} color="blue" />
          )}
          {destination &&
            selectedMarker &&
            destination[0] === selectedMarker[0] &&
            destination[1] === selectedMarker[1] && (
              <Popup
                longitude={destination[0]}
                latitude={destination[1]}
                anchor="top"
                onClose={() => setSelectedMarker(null)}
              >
                Selected Destination
              </Popup>
            )}

          {/* Nearby Features */}
          {nearby.map((item) => {
            const coords = getCoords(item);
            if (!coords) return null;
            return (
              <Marker key={item.id} longitude={coords[0]} latitude={coords[1]} color="green">
                {selectedMarker &&
                  selectedMarker[0] === coords[0] &&
                  selectedMarker[1] === coords[1] && (
                    <Popup
                      longitude={coords[0]}
                      latitude={coords[1]}
                      anchor="top"
                      onClose={() => setSelectedMarker(null)}
                    >
                      <div>
                        <strong>{item.tags.name || "Unnamed"}</strong>
                        <br />
                        {item.tags.aeroway
                          ? "Airport"
                          : item.tags.amenity === "bus_station"
                          ? "Bus Station"
                          : item.tags.amenity === "school"
                          ? "School"
                          : item.tags.shop === "mall"
                          ? "Shopping Mall"
                          : item.tags.natural === "water"
                          ? "Water Body"
                          : "Other"}
                      </div>
                    </Popup>
                  )}
              </Marker>
            );
          })}
        </Map>
      </div>

      {/* Sidebar */}
      <div
        style={{
          width: "30%",
          background: "#f9f9f9",
          padding: "12px",
          borderRadius: "8px",
          overflowY: "auto",
          maxHeight: "500px",
        }}
      >
        <h3>Nearby Features</h3>
        {nearby.length === 0 ? (
          <p>No data found nearby.</p>
        ) : (
          <ul>
            {nearby.map((item, idx) => {
              const coords = getCoords(item);
              if (!coords) return null;
              return (
                <li key={idx}>
                  <strong>{item.tags.name || "Unnamed"}</strong> —{" "}
                  {item.tags.aeroway
                    ? "Airport"
                    : item.tags.amenity === "bus_station"
                    ? "Bus Station"
                    : item.tags.amenity === "school"
                    ? "School"
                    : item.tags.shop === "mall"
                    ? "Shopping Mall"
                    : item.tags.natural === "water"
                    ? "Water Body"
                    : "Other"}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
