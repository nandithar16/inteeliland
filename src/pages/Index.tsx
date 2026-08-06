import { useState } from "react";
import MainNavigation from "@/components/screens/main-navigation";
import LandParcelDiscovery from "@/components/screens/land-parcel-discovery";
import { FilteredLandParcels } from "@/components/screens/filtered-land-parcels";
import { DetailedLandParcelAnalysis } from "@/components/screens/detailed-land-parcel-analysis";

type Screen = 
  | "main" 
  | "discovery" 
  | "filtered-results"
  | "detailed-analysis";

interface ParcelData {
  googleMapLink: string;
  latitude: string;
  longitude: string;
  parcelId?: string;
}

const Index = () => {
  const [currentScreen, setCurrentScreen] = useState<Screen>("main");
  const [parcelData, setParcelData] = useState<ParcelData | null>(null);
  const [discoveryFilters, setDiscoveryFilters] = useState<any>(null);
  const [selectedParcelId, setSelectedParcelId] = useState<string | null>(null);

  const handleDiscoverLandParcel = () => {
    setCurrentScreen("discovery");
  };

  const handleBackToMain = () => {
    setCurrentScreen("main");
    setParcelData(null);
    setDiscoveryFilters(null);
    setSelectedParcelId(null);
  };

  const handleFilterByCost = (maxCost: number) => {
    setDiscoveryFilters({ type: "cost", maxCost });
    setCurrentScreen("filtered-results");
  };

  const handleFilterBySize = (minSize: number, maxSize: number) => {
    setDiscoveryFilters({ type: "size", minSize, maxSize });
    setCurrentScreen("filtered-results");
  };

  const handleFilterByDistance = (maxDistance: number) => {
    setDiscoveryFilters({ type: "distance", maxDistance });
    setCurrentScreen("filtered-results");
  };

  const handleBackToDiscovery = () => {
    setCurrentScreen("discovery");
  };

  const handleDiscoveryComplete = (filters: any) => {
    setDiscoveryFilters(filters);
    setCurrentScreen("filtered-results");
  };

  const handleViewParcelDetails = (parcelId: string) => {
    setSelectedParcelId(parcelId);
    setCurrentScreen("detailed-analysis");
  };

  const handleBackToFilteredResults = () => {
    setCurrentScreen("filtered-results");
    setSelectedParcelId(null);
  };

  switch (currentScreen) {
    case "detailed-analysis":
      return (
        <DetailedLandParcelAnalysis
          parcelId={selectedParcelId || ""}
          data={parcelData}
          onBack={selectedParcelId ? handleBackToFilteredResults : handleBackToMain}
        />
      );

    case "discovery":
      return (
        <LandParcelDiscovery
          onBack={handleBackToMain}
          onDiscover={handleDiscoveryComplete}
        />
      );

    case "filtered-results":
      return discoveryFilters ? (
        <FilteredLandParcels
          filters={discoveryFilters}
          onBack={handleBackToDiscovery}
          onViewDetails={handleViewParcelDetails}
        />
      ) : null;

    default:
      return (
        <MainNavigation
          onDiscoverLandParcel={handleDiscoverLandParcel}
          onFilterByCost={handleFilterByCost}
          onFilterBySize={handleFilterBySize}
          onFilterByDistance={handleFilterByDistance}
        />
      );
  }
};

export default Index;
