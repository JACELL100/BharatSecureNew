import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";
import { ArrowLeft, Filter, Eye, EyeOff, MapPin, AlertCircle, Info } from "lucide-react";

// Custom marker icons
const userLocationIcon = new L.Icon({
  iconUrl: "https://static.thenounproject.com/png/3859353-200.png",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

const policeStationIcon = new L.Icon({
  iconUrl: "https://tse1.mm.bing.net/th?id=OIP.oVCuLP_ERzy8yJFGJc4t4QHaHa&pid=Api&P=0&h=180",
  iconSize: [30, 30],
  iconAnchor: [15, 30],
});

// Incident type color mapping with exact names from form
const INCIDENT_COLORS = {
  "Pothole/Road Damage": { 
    color: "#8B7355", 
    label: "Pothole/Road Damage", 
    gradient: { 0.4: "rgba(139, 115, 85, 0.4)", 1.0: "rgba(139, 115, 85, 1.0)" },
    category: "Infrastructure"
  },
  "Water Pipe Burst": { 
    color: "#3498DB", 
    label: "Water Pipe Burst", 
    gradient: { 0.4: "rgba(52, 152, 219, 0.4)", 1.0: "rgba(52, 152, 219, 1.0)" },
    category: "Infrastructure"
  },
  "Overflowing Trash Bins": { 
    color: "#7D6608", 
    label: "Overflowing Trash Bins", 
    gradient: { 0.4: "rgba(125, 102, 8, 0.4)", 1.0: "rgba(125, 102, 8, 1.0)" },
    category: "Sanitation"
  },
  "Illegal Dumping": { 
    color: "#A0522D", 
    label: "Illegal Dumping", 
    gradient: { 0.4: "rgba(160, 82, 45, 0.4)", 1.0: "rgba(160, 82, 45, 1.0)" },
    category: "Sanitation"
  },
  "Broken streetlights / lack of lighting": { 
    color: "#FDB813", 
    label: "Broken Streetlights", 
    gradient: { 0.4: "rgba(253, 184, 19, 0.4)", 1.0: "rgba(253, 184, 19, 1.0)" },
    category: "Utilities"
  },
  "Voltage fluctuations in homes": { 
    color: "#FF6347", 
    label: "Voltage Fluctuations", 
    gradient: { 0.4: "rgba(255, 99, 71, 0.4)", 1.0: "rgba(255, 99, 71, 1.0)" },
    category: "Utilities"
  },
  "Traffic signal not working": { 
    color: "#FF4500", 
    label: "Traffic Signal Issue", 
    gradient: { 0.4: "rgba(255, 69, 0, 0.4)", 1.0: "rgba(255, 69, 0, 1.0)" },
    category: "Traffic"
  },
  "Overcrowded buses / irregular transport": { 
    color: "#4169E1", 
    label: "Transport Issues", 
    gradient: { 0.4: "rgba(65, 105, 225, 0.4)", 1.0: "rgba(65, 105, 225, 1.0)" },
    category: "Traffic"
  },
  "Stray dogs / cattle on roads": { 
    color: "#8B4513", 
    label: "Stray Animals", 
    gradient: { 0.4: "rgba(139, 69, 19, 0.4)", 1.0: "rgba(139, 69, 19, 1.0)" },
    category: "Public Safety"
  },
  "Domestic Violence": { 
    color: "#8B0000", 
    label: "Domestic Violence", 
    gradient: { 0.4: "rgba(139, 0, 0, 0.4)", 1.0: "rgba(139, 0, 0, 1.0)" },
    category: "Crime"
  },
  "Child Abuse": { 
    color: "#DC143C", 
    label: "Child Abuse", 
    gradient: { 0.4: "rgba(220, 20, 60, 0.4)", 1.0: "rgba(220, 20, 60, 1.0)" },
    category: "Crime"
  },
  "Sexual Harassment": { 
    color: "#C71585", 
    label: "Sexual Harassment", 
    gradient: { 0.4: "rgba(199, 21, 133, 0.4)", 1.0: "rgba(199, 21, 133, 1.0)" },
    category: "Crime"
  },
  "Stalking": { 
    color: "#8B008B", 
    label: "Stalking", 
    gradient: { 0.4: "rgba(139, 0, 139, 0.4)", 1.0: "rgba(139, 0, 139, 1.0)" },
    category: "Crime"
  },
  "Human Trafficking": { 
    color: "#800000", 
    label: "Human Trafficking", 
    gradient: { 0.4: "rgba(128, 0, 0, 0.4)", 1.0: "rgba(128, 0, 0, 1.0)" },
    category: "Crime"
  },
  "Fire": { 
    color: "#FF4500", 
    label: "Fire", 
    gradient: { 0.4: "rgba(255, 69, 0, 0.4)", 1.0: "rgba(255, 69, 0, 1.0)" },
    category: "Emergency"
  },
  "Accident": { 
    color: "#FF6347", 
    label: "Accident", 
    gradient: { 0.4: "rgba(255, 99, 71, 0.4)", 1.0: "rgba(255, 99, 71, 1.0)" },
    category: "Emergency"
  },
  "Theft": { 
    color: "#FF1493", 
    label: "Theft", 
    gradient: { 0.4: "rgba(255, 20, 147, 0.4)", 1.0: "rgba(255, 20, 147, 1.0)" },
    category: "Crime"
  },
  "Medical Emergency": { 
    color: "#FF0000", 
    label: "Medical Emergency", 
    gradient: { 0.4: "rgba(255, 0, 0, 0.4)", 1.0: "rgba(255, 0, 0, 1.0)" },
    category: "Emergency"
  },
  "Other": { 
    color: "#808080", 
    label: "Other", 
    gradient: { 0.4: "rgba(128, 128, 128, 0.4)", 1.0: "rgba(128, 128, 128, 1.0)" },
    category: "Other"
  }
};

// Police Stations Component
const PoliceStations = ({ policeStations, visible }) => {
  const [isVisible, setIsVisible] = useState(false);
  const map = useMap();

  useEffect(() => {
    const handleZoom = () => {
      const zoomLevel = map.getZoom();
      setIsVisible(zoomLevel > 12 && visible);
    };

    map.on("zoomend", handleZoom);
    handleZoom();

    return () => {
      map.off("zoomend", handleZoom);
    };
  }, [map, visible]);

  return (
    <>
      {isVisible &&
        policeStations.map((station, index) => (
          <Marker
            key={index}
            position={[station.lat, station.lng]}
            icon={policeStationIcon}
          >
            <Popup>
              <div className="text-sm">
                <strong>{station.name}</strong>
              </div>
            </Popup>
          </Marker>
        ))}
    </>
  );
};

// Multi-layer Heatmap Component
const MultiHeatMapLayer = ({ incidentsByType, activeTypes }) => {
  const map = useMap();

  useEffect(() => {
    const layers = [];

    Object.keys(incidentsByType).forEach((type) => {
      if (activeTypes[type] && incidentsByType[type].length > 0) {
        const heatData = incidentsByType[type].map(incident => [
          incident.lat,
          incident.lng,
          incident.intensity
        ]);

        const gradient = INCIDENT_COLORS[type]?.gradient || INCIDENT_COLORS["Other"].gradient;

        const heat = L.heatLayer(heatData, {
          radius: 25,
          blur: 20,
          maxZoom: 15,
          gradient: gradient,
          max: 3.0,
          minOpacity: 0.5,
        }).addTo(map);

        layers.push(heat);
      }
    });

    return () => {
      layers.forEach(layer => map.removeLayer(layer));
    };
  }, [map, incidentsByType, activeTypes]);

  return null;
};

// Legend Component with Categories
const LegendComponent = ({ incidentsByType, activeTypes, onToggle, categoryFilter, setCategoryFilter }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const categories = ["All", "Infrastructure", "Sanitation", "Utilities", "Traffic", "Public Safety", "Crime", "Emergency", "Other"];

  const filteredIncidents = Object.entries(INCIDENT_COLORS).filter(([type, config]) => {
    if (categoryFilter === "All") return true;
    return config.category === categoryFilter;
  });

  return (
    <div className="absolute top-20 right-4 z-[1000] bg-slate-900/95 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-2xl max-w-sm max-h-[80vh] overflow-hidden flex flex-col">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors border-b border-white/10"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <Info className="text-sky-400" size={20} />
          <h3 className="text-white font-bold text-sm">Incident Types</h3>
        </div>
        <button className="text-white">
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <>
          {/* Category Filter */}
          <div className="p-4 border-b border-white/10">
            <label className="text-gray-400 text-xs mb-2 block">Filter by Category:</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full p-2 bg-white/10 text-white rounded-lg text-sm border border-white/20 focus:outline-none focus:border-sky-400"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-slate-900">{cat}</option>
              ))}
            </select>
          </div>

          {/* Incident List */}
          <div className="p-4 space-y-2 overflow-y-auto flex-1">
            {filteredIncidents.map(([type, config]) => {
              const count = incidentsByType[type]?.length || 0;
              
              return (
                <div
                  key={type}
                  className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${
                    activeTypes[type] ? 'bg-white/10' : 'bg-white/5'
                  } hover:bg-white/15`}
                  onClick={() => onToggle(type)}
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                      className="w-4 h-4 rounded-full shadow-lg flex-shrink-0"
                      style={{ backgroundColor: config.color }}
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-white text-xs font-medium block truncate">
                        {config.label}
                      </span>
                      <span className="text-gray-500 text-xs">{config.category}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-gray-400 text-xs bg-white/10 px-2 py-1 rounded">
                      {count}
                    </span>
                    {activeTypes[type] ? (
                      <Eye size={14} className="text-green-400" />
                    ) : (
                      <EyeOff size={14} className="text-gray-500" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
};

// Stats Panel Component
const StatsPanel = ({ incidentsByType, totalIncidents, categoryFilter }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  // Calculate category stats
  const categoryStats = {};
  Object.entries(incidentsByType).forEach(([type, incidents]) => {
    const category = INCIDENT_COLORS[type]?.category || "Other";
    if (!categoryStats[category]) categoryStats[category] = 0;
    categoryStats[category] += incidents.length;
  });

  const filteredIncidents = Object.entries(incidentsByType).filter(([type]) => {
    if (categoryFilter === "All") return true;
    return INCIDENT_COLORS[type]?.category === categoryFilter;
  });

  const filteredTotal = filteredIncidents.reduce((sum, [_, incidents]) => sum + incidents.length, 0);

  return (
    <div className="absolute top-20 left-4 z-[1000] bg-slate-900/95 backdrop-blur-sm border-2 border-white/20 rounded-xl shadow-2xl max-w-sm">
      <div 
        className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-2">
          <AlertCircle className="text-sky-400" size={20} />
          <h3 className="text-white font-bold text-sm">Statistics</h3>
        </div>
        <button className="text-white">
          {isExpanded ? "−" : "+"}
        </button>
      </div>

      {isExpanded && (
        <div className="p-4 pt-0 space-y-3">
          <div className="bg-gradient-to-r from-sky-500/20 to-blue-500/20 p-3 rounded-lg border border-sky-500/30">
            <p className="text-gray-400 text-xs">Total Incidents</p>
            <p className="text-2xl font-bold text-white">{totalIncidents}</p>
          </div>

          {categoryFilter !== "All" && (
            <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-3 rounded-lg border border-purple-500/30">
              <p className="text-gray-400 text-xs">Filtered ({categoryFilter})</p>
              <p className="text-xl font-bold text-white">{filteredTotal}</p>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-gray-400 text-xs font-semibold mb-2">Top Categories:</p>
            {Object.entries(categoryStats)
              .sort((a, b) => b[1] - a[1])
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                  <span className="text-white text-xs">{category}</span>
                  <span className="text-sky-400 font-bold text-sm">{count}</span>
                </div>
              ))}
          </div>

          <div className="space-y-2 pt-2 border-t border-white/10">
            <p className="text-gray-400 text-xs font-semibold mb-2">Top Incidents:</p>
            {Object.entries(incidentsByType)
              .sort((a, b) => b[1].length - a[1].length)
              .slice(0, 5)
              .map(([type, incidents]) => (
                <div key={type} className="flex items-center justify-between bg-white/5 p-2 rounded-lg">
                  <span className="text-white text-xs truncate flex-1 mr-2">{INCIDENT_COLORS[type]?.label || type}</span>
                  <span className="text-sky-400 font-bold text-sm">{incidents.length}</span>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Main HeatMap Component
const IncidentTypeHeatMap = () => {
  const [incidentsByType, setIncidentsByType] = useState({});
  const [policeStations, setPoliceStations] = useState([]);
  const [activeTypes, setActiveTypes] = useState({});
  const [showPoliceStations, setShowPoliceStations] = useState(true);
  const [loading, setLoading] = useState(true);
  const [totalIncidents, setTotalIncidents] = useState(0);
  const [categoryFilter, setCategoryFilter] = useState("All");

  const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";
  const token = localStorage.getItem("accessToken");

  // Get user coordinates
  const getCoordinates = () => {
    try {
      const coordinates = JSON.parse(localStorage.getItem("userCoordinates"));
      if (coordinates?.latitude && coordinates?.longitude) {
        return [coordinates.latitude, coordinates.longitude];
      }
    } catch (error) {
      console.error("Error parsing coordinates:", error);
    }
    return [18.4576, 73.8507]; // Default: Pune
  };

  const userCoordinates = getCoordinates();

  // Severity to intensity converter
  const severityToIntensity = (severity) => {
    const severityMap = { high: 3, medium: 2, low: 1 };
    return severityMap[severity?.toLowerCase()] || 1;
  };

  // Fetch incidents
  useEffect(() => {
    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/api/all_station_incidents/`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        if (response.ok) {
          const incidents = await response.json();
          console.log("Fetched incidents:", incidents);

          const grouped = {};
          let total = 0;

          // Initialize all incident types
          Object.keys(INCIDENT_COLORS).forEach(type => {
            grouped[type] = [];
          });

          incidents.forEach((incident) => {
            if (incident.location?.latitude && incident.location?.longitude) {
              const type = incident.incidentType || "Other";
              const intensity = severityToIntensity(incident.severity);

              // Use exact match or default to "Other"
              const incidentKey = INCIDENT_COLORS[type] ? type : "Other";

              grouped[incidentKey].push({
                lat: Number(incident.location.latitude),
                lng: Number(incident.location.longitude),
                intensity: intensity,
                id: incident.id,
                description: incident.description,
                severity: incident.severity,
              });
              total++;
            }
          });

          setIncidentsByType(grouped);
          setTotalIncidents(total);

          // Initialize all types as active
          const initialActive = {};
          Object.keys(INCIDENT_COLORS).forEach(type => {
            initialActive[type] = true;
          });
          setActiveTypes(initialActive);
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncidents();
  }, []);

  // Fetch police stations
  useEffect(() => {
    const overpassUrl = `https://overpass-api.de/api/interpreter?data=[out:json];node["amenity"="police"](around:10000,${userCoordinates[0]},${userCoordinates[1]});out;`;
    
    fetch(overpassUrl)
      .then((response) => response.json())
      .then((data) => {
        const stations = data.elements.map((element) => ({
          lat: element.lat,
          lng: element.lon,
          name: element.tags.name || "Police Station",
        }));
        setPoliceStations(stations);
      })
      .catch((error) => console.error("Error fetching police stations:", error));
  }, [userCoordinates]);

  const handleToggleType = (type) => {
    setActiveTypes(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  const handleToggleAll = () => {
    const allActive = Object.values(activeTypes).every(v => v);
    const newState = {};
    Object.keys(activeTypes).forEach(type => {
      newState[type] = !allActive;
    });
    setActiveTypes(newState);
  };

  const handleToggleCategory = () => {
    const newState = {};
    Object.entries(INCIDENT_COLORS).forEach(([type, config]) => {
      if (categoryFilter === "All") {
        newState[type] = false;
      } else {
        newState[type] = config.category === categoryFilter ? !activeTypes[type] : activeTypes[type];
      }
    });
    setActiveTypes(newState);
  };

  if (loading) {
    return (
      <div className="h-screen w-full bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-sky-400 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading Heatmap...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-screen w-full">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-[1001] bg-gradient-to-b from-slate-900/95 to-transparent backdrop-blur-sm p-4 border-b border-white/10">
        <div className="max-w-7xl mx-auto flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => window.history.back()}
              className="p-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
            >
              <ArrowLeft className="text-white" size={20} />
            </button>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Incident Type Heatmap
              </h1>
              <p className="text-gray-400 text-xs md:text-sm">
                {totalIncidents} incidents visualized by category
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowPoliceStations(!showPoliceStations)}
              className={`px-3 py-2 rounded-lg transition-all text-xs md:text-sm font-medium ${
                showPoliceStations
                  ? "bg-sky-500 text-white"
                  : "bg-white/10 text-gray-400"
              }`}
            >
              <MapPin size={14} className="inline mr-1" />
              Police
            </button>
            <button
              onClick={handleToggleCategory}
              className="px-3 py-2 bg-purple-500/80 hover:bg-purple-600 text-white rounded-lg transition-all text-xs md:text-sm font-medium"
            >
              <Filter size={14} className="inline mr-1" />
              Toggle Category
            </button>
            <button
              onClick={handleToggleAll}
              className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition-all text-xs md:text-sm font-medium"
            >
              <Filter size={14} className="inline mr-1" />
              Toggle All
            </button>
          </div>
        </div>
      </div>

      {/* Map */}
      <MapContainer
        center={userCoordinates}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
        zoomControl={true}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />
        <Marker position={userCoordinates} icon={userLocationIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>
        <MultiHeatMapLayer incidentsByType={incidentsByType} activeTypes={activeTypes} />
        <PoliceStations policeStations={policeStations} visible={showPoliceStations} />
      </MapContainer>

      {/* Stats Panel */}
      <StatsPanel 
        incidentsByType={incidentsByType} 
        totalIncidents={totalIncidents}
        categoryFilter={categoryFilter}
      />

      {/* Legend */}
      <LegendComponent
        incidentsByType={incidentsByType}
        activeTypes={activeTypes}
        onToggle={handleToggleType}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
      />
    </div>
  );
};

export default IncidentTypeHeatMap;