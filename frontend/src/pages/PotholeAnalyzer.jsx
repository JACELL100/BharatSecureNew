import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import { Camera, Upload, AlertTriangle, FileText, TrendingUp, DollarSign, RefreshCw, Trash2, MapPin, Navigation, Globe, Map } from 'lucide-react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet.heat';

const API_BASE_URL = 'http://127.0.0.1:8000/pothole/api';

const PotholeAnalyzer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [view, setView] = useState('upload');
  const [heatmapData, setHeatmapData] = useState([]);
  const [heatmapLoading, setHeatmapLoading] = useState(false);
  
  // Location state
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState(null);
  const [manualLocation, setManualLocation] = useState('');

  useEffect(() => {
    fetchAnalyses();
    // Auto-detect location when component mounts
    detectLocation();
    // Fetch heatmap data if on heatmap view
    if (view === 'heatmap') {
      fetchHeatmapData();
    }
  }, [view]);

  // Auto-detect user location
  const detectLocation = async () => {
    setLocationLoading(true);
    setLocationError(null);

    try {
      // First try to get GPS coordinates
      const position = await getCurrentPosition();
      
      const coords = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };

      // Reverse geocode to get address
      const address = await reverseGeocode(coords.latitude, coords.longitude);
      
      setLocation({
        ...coords,
        address: address,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Location detection failed:', error);
      setLocationError(error.message);
      
      // Fallback to default location (Mumbai)
      setLocation({
        latitude: 19.0760,
        longitude: 72.8777,
        accuracy: null,
        address: "Mumbai, Maharashtra, India (Default)",
        timestamp: new Date().toISOString()
      });
    } finally {
      setLocationLoading(false);
    }
  };

  // Get current GPS position
  const getCurrentPosition = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation is not supported by this browser"));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        resolve,
        (error) => {
          let errorMessage = "Location access denied";
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied by user";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information unavailable";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out";
              break;
          }
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  };

  // Reverse geocode coordinates to address
  const reverseGeocode = async (latitude, longitude) => {
    try {
      // Using OpenStreetMap Nominatim for reverse geocoding (free)
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
      );
      
      if (!response.ok) throw new Error('Geocoding failed');
      
      const data = await response.json();
      return data.display_name || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    } catch (error) {
      console.error('Reverse geocoding failed:', error);
      return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setAnalysis(null);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select an image first');
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('image', selectedFile);
    
    // Include location data if available
    const locationData = manualLocation || location?.address || '';
    formData.append('location', locationData);
    
    // Include GPS coordinates
    if (location) {
      formData.append('latitude', location.latitude.toString());
      formData.append('longitude', location.longitude.toString());
      formData.append('location_accuracy', location.accuracy?.toString() || '');
    }

    try {
      const response = await axios.post(`${API_BASE_URL}/analyses/`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setAnalysis(response.data);
      fetchAnalyses();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to analyze image');
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalyses = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses/`);
      setAnalyses(response.data);
    } catch (err) {
      console.error('Failed to fetch analyses:', err);
    }
  };

  // Fetch heatmap data - convert analyses to heatmap format
  const fetchHeatmapData = async () => {
    setHeatmapLoading(true);
    try {
      const response = await axios.get(`${API_BASE_URL}/analyses/`);
      const analyses = response.data;
      
      // Convert analyses to heatmap format [lat, lng, intensity]
      const realHeatmapPoints = analyses
        .filter(analysis => analysis.latitude && analysis.longitude)
        .map(analysis => {
          // Convert severity to intensity (0.2 to 1.0)
          const severityIntensity = {
            low: 0.3,
            medium: 0.5,
            high: 0.8,
            critical: 1.0
          };
          
          return [
            parseFloat(analysis.latitude),
            parseFloat(analysis.longitude),
            severityIntensity[analysis.severity] || 0.5
          ];
        });

      // Add sample critical pothole data points for demonstration
      const sampleCriticalPotholes = [
        // Pune area critical potholes (red dots)
        [18.5204, 73.8567, 1.0],  // Pune City Center
        [18.5314, 73.8446, 1.0],  // Near Shivajinagar
        [18.5074, 73.8077, 1.0],  // Kothrud area
        [18.5362, 73.8958, 1.0],  // Viman Nagar
        [18.4632, 73.8671, 1.0],  // Hadapsar
        [18.5793, 73.8143, 1.0],  // Aundh
        [18.4886, 73.8275, 1.0],  // Warje
        [18.5435, 73.7891, 1.0],  // Hinjewadi
        [18.5089, 73.8938, 1.0],  // Koregaon Park
        [18.4681, 73.8037, 1.0],  // Katraj
        
        // High severity potholes (orange)
        [18.5404, 73.8267, 0.8],  // Model Colony
        [18.5186, 73.8712, 0.8],  // Camp area
        [18.4792, 73.8278, 0.8],  // Sinhagad Road
        [18.5644, 73.7717, 0.8],  // Wakad
        [18.5104, 73.8445, 0.8],  // JM Road
        [18.4529, 73.8675, 0.8],  // Kondhwa
        [18.5298, 73.8567, 0.8],  // Deccan
        [18.4967, 73.8134, 0.8],  // Karve Nagar
        
        // Medium severity potholes (yellow)
        [18.5123, 73.8289, 0.5],  // Parvati
        [18.5567, 73.7812, 0.5],  // Baner
        [18.4743, 73.8412, 0.5],  // Bibwewadi
        [18.5445, 73.8178, 0.5],  // Pune University
        [18.5234, 73.8934, 0.5],  // Kalyani Nagar
        [18.4856, 73.7967, 0.5],  // Kothrud Depot
        
        // Low severity potholes (green)
        [18.5667, 73.7434, 0.3],  // Balewadi
        [18.4934, 73.8623, 0.3],  // Wanowrie
        [18.5298, 73.7845, 0.3],  // Sus
        [18.5012, 73.8789, 0.3],  // Fatima Nagar
        [18.5789, 73.8934, 0.3],  // Dhanori
      ];

      // Combine real data with sample data
      const combinedHeatmapData = [...realHeatmapPoints, ...sampleCriticalPotholes];
      
      setHeatmapData(combinedHeatmapData);
    } catch (err) {
      console.error('Failed to fetch heatmap data:', err);
      
      // If API fails, show sample data only
      const sampleData = [
        // Critical severity potholes (red dots)
        [18.5204, 73.8567, 1.0],
        [18.5314, 73.8446, 1.0],
        [18.5074, 73.8077, 1.0],
        [18.5362, 73.8958, 1.0],
        [18.4632, 73.8671, 1.0],
        [18.5793, 73.8143, 1.0],
        [18.4886, 73.8275, 1.0],
        [18.5435, 73.7891, 1.0],
        [18.5089, 73.8938, 1.0],
        [18.4681, 73.8037, 1.0],
        // High severity (orange)
        [18.5404, 73.8267, 0.8],
        [18.5186, 73.8712, 0.8],
        [18.4792, 73.8278, 0.8],
        [18.5644, 73.7717, 0.8],
        // Medium severity (yellow)
        [18.5123, 73.8289, 0.5],
        [18.5567, 73.7812, 0.5],
        [18.4743, 73.8412, 0.5],
        // Low severity (green)
        [18.5667, 73.7434, 0.3],
        [18.4934, 73.8623, 0.3],
        [18.5298, 73.7845, 0.3],
      ];
      setHeatmapData(sampleData);
    } finally {
      setHeatmapLoading(false);
    }
  };

  const deleteAnalysis = async (id) => {
    if (window.confirm('Are you sure you want to delete this analysis?')) {
      try {
        await axios.delete(`${API_BASE_URL}/analyses/${id}/`);
        fetchAnalyses();
        if (analysis?.id === id) {
          setAnalysis(null);
        }
      } catch (err) {
        console.error('Failed to delete:', err);
      }
    }
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: 'from-emerald-500 to-green-500',
      medium: 'from-amber-500 to-yellow-500',
      high: 'from-orange-500 to-red-500',
      critical: 'from-red-600 to-rose-600',
    };
    return colors[severity] || colors.medium;
  };

  const getSeverityBadgeColor = (severity) => {
    const colors = {
      low: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/50',
      critical: 'bg-red-500/20 text-red-300 border-red-500/50',
    };
    return colors[severity] || colors.medium;
  };

  // Heatmap Layer Component
  const HeatmapLayer = ({ data }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !data || data.length === 0) return;

      // Import leaflet.heat plugin
      import('leaflet.heat').then(() => {
        // Remove existing heatmap layer
        map.eachLayer((layer) => {
          if (layer.options && layer.options.isHeatLayer) {
            map.removeLayer(layer);
          }
        });

        // Create new heatmap layer
        if (L.heatLayer) {
          const heatLayer = L.heatLayer(data, {
            radius: 35,
            blur: 25,
            maxZoom: 18,
            max: 1.0,
            minOpacity: 0.5,
            gradient: {
              0.0: '#00ff00',  // Low severity - Green
              0.2: '#80ff00',  // Light green
              0.4: '#ffff00',  // Medium - Yellow  
              0.6: '#ffa500',  // Orange
              0.8: '#ff4500',  // Red-orange
              1.0: '#dc143c'   // Critical - Deep Red
            }
          });
          
          // Mark as heatmap layer for identification
          heatLayer.options.isHeatLayer = true;
          heatLayer.addTo(map);
        }
      }).catch((err) => {
        console.error('Failed to load leaflet.heat:', err);
      });
    }, [map, data]);

    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-black">
      <div className="container mx-auto px-2 sm:px-4 py-6 sm:py-12">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 sm:mb-10 px-2"
        >
          <h1 className="text-3xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent mb-3 sm:mb-4 drop-shadow-[0_0_10px_cyan]">
            Pothole Analysis System
          </h1>
          <p className="text-gray-400 text-sm sm:text-lg max-w-lg sm:max-w-2xl mx-auto">
            AI-powered pothole detection and severity assessment for road safety
          </p>

          {/* View Toggle */}
          <div className="flex justify-center gap-3 mt-6">
            <button
              onClick={() => setView('upload')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                view === 'upload'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Upload className="w-4 h-4 inline-block mr-2" />
              Upload & Analyze
            </button>
            <button
              onClick={() => setView('history')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                view === 'history'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <FileText className="w-4 h-4 inline-block mr-2" />
              History ({analyses.length})
            </button>
            <button
              onClick={() => setView('heatmap')}
              className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl font-medium transition-all duration-200 ${
                view === 'heatmap'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800 text-gray-400 hover:bg-slate-700 border border-slate-700'
              }`}
            >
              <Map className="w-4 h-4 inline-block mr-2" />
              Heatmap
            </button>
          </div>
        </motion.div>

        {view === 'upload' ? (
          <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-6">
            {/* Upload Section */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-4 sm:space-y-6"
            >
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]">
                <label className="text-gray-300 text-sm font-medium mb-3 block">
                  <Camera className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                  Upload Pothole Image
                </label>
                
                <div className="mt-1 flex justify-center px-2 sm:px-6 pt-4 sm:pt-5 pb-4 sm:pb-6 border-2 border-slate-700 border-dashed rounded-xl hover:border-cyan-400 transition-colors duration-200">
                  <div className="space-y-1 text-center w-full">
                    <Camera className="mx-auto h-10 w-10 sm:h-12 sm:w-12 text-gray-400" />
                    <div className="flex flex-col sm:flex-row items-center justify-center text-xs sm:text-sm text-gray-400 gap-1 sm:gap-0">
                      <label className="relative cursor-pointer rounded-md font-medium text-cyan-400 hover:text-cyan-300">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          className="sr-only"
                        />
                      </label>
                      <span className="hidden sm:inline pl-1">or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG up to 10MB</p>
                  </div>
                </div>
              </div>

              {/* Location Detection Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]"
              >
                <div className="flex items-center justify-between mb-4">
                  <label className="text-gray-300 text-sm font-medium flex items-center">
                    <MapPin className="w-4 h-4 inline-block mr-2 text-cyan-400" />
                    Location Detection
                  </label>
                  <button
                    onClick={detectLocation}
                    disabled={locationLoading}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors p-1"
                  >
                    <RefreshCw className={`w-4 h-4 ${locationLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {locationLoading && (
                  <div className="flex items-center gap-3 text-cyan-400 mb-3">
                    <Navigation className="w-4 h-4 animate-pulse" />
                    <span className="text-sm">Detecting your location...</span>
                  </div>
                )}

                {location && !locationLoading && (
                  <div className="space-y-3">
                    <div className="bg-slate-800 rounded-lg p-3">
                      <div className="flex items-start gap-3">
                        <MapPin className="w-4 h-4 text-green-400 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-300 break-words">{location.address}</p>
                          <div className="flex flex-wrap gap-4 mt-2 text-xs text-gray-400">
                            <span>Lat: {location.latitude.toFixed(6)}</span>
                            <span>Lng: {location.longitude.toFixed(6)}</span>
                            {location.accuracy && (
                              <span>Accuracy: ±{Math.round(location.accuracy)}m</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Google Maps Link */}
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300 text-sm transition-colors"
                    >
                      <Globe className="w-4 h-4" />
                      View on Google Maps
                    </a>
                  </div>
                )}

                {locationError && (
                  <div className="text-yellow-400 text-sm mb-3 flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>{locationError}</span>
                  </div>
                )}

                {/* Manual Location Input */}
                <div className="mt-4">
                  <label className="text-gray-400 text-xs mb-2 block">
                    Manual Location (Optional)
                  </label>
                  <input
                    type="text"
                    value={manualLocation}
                    onChange={(e) => setManualLocation(e.target.value)}
                    placeholder="Enter location manually if needed..."
                    className="w-full bg-slate-800 text-gray-200 px-3 py-2 rounded-lg border border-slate-700 focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all duration-200 text-sm"
                  />
                </div>
              </motion.div>

              {previewUrl && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]"
                >
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full rounded-lg object-cover max-h-64 mb-4"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={loading}
                    className="w-full py-3 sm:py-4 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium shadow-lg hover:shadow-cyan-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? 'Analyzing...' : 'Analyze Pothole'}
                  </motion.button>
                </motion.div>
              )}

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-500/10 border border-red-500/50 text-red-300 px-4 py-3 rounded-xl"
                >
                  <AlertTriangle className="w-4 h-4 inline-block mr-2" />
                  {error}
                </motion.div>
              )}
            </motion.div>

            {/* Results Section */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-slate-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-cyan-500 transition-all duration-300 hover:shadow-[0_0_20px_cyan]"
            >
              {analysis ? (
                <div className="space-y-4 sm:space-y-6">
                  <h2 className="text-xl sm:text-2xl font-bold text-white">Analysis Results</h2>

                  <div
                    className={`bg-gradient-to-r ${getSeverityColor(analysis.severity)} px-4 py-3 rounded-xl text-center font-bold text-lg text-white shadow-lg`}
                  >
                    <AlertTriangle className="w-5 h-5 inline-block mr-2" />
                    {analysis.severity?.toUpperCase()} SEVERITY
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:gap-4">
                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Dimensions</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.width_cm} × {analysis.height_cm} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Area</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.area_cm2} cm²
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Est. Depth</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        ~{analysis.depth_estimate} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Perimeter</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.perimeter_cm} cm
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Impact Score</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {analysis.impact_score}/10
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Priority</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        Level {analysis.repair_priority}/5
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Repair Cost</span>
                      <span className="text-base sm:text-lg font-semibold text-green-400">
                        ${analysis.estimated_repair_cost}
                      </span>
                    </div>

                    <div className="bg-slate-800 p-3 sm:p-4 rounded-xl border border-slate-700">
                      <span className="text-xs sm:text-sm text-gray-400 block mb-1">Confidence</span>
                      <span className="text-base sm:text-lg font-semibold text-cyan-400">
                        {(analysis.confidence_score * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>

                  {/* Location Information */}
                  {(analysis.latitude && analysis.longitude) && (
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-white flex items-center gap-2">
                        <MapPin className="w-5 h-5 text-cyan-400" />
                        Pothole Location
                      </h3>
                      <div className="bg-slate-800 rounded-xl p-4 border border-slate-700">
                        <div className="space-y-3">
                          {analysis.location && (
                            <p className="text-gray-300 text-sm">{analysis.location}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-xs text-gray-400">
                            <span>Lat: {parseFloat(analysis.latitude).toFixed(6)}</span>
                            <span>Lng: {parseFloat(analysis.longitude).toFixed(6)}</span>
                          </div>
                          
                          {/* Interactive Map Button */}
                          <div className="flex flex-wrap gap-2">
                            <a
                              href={`https://www.google.com/maps?q=${analysis.latitude},${analysis.longitude}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <Globe className="w-4 h-4" />
                              View on Google Maps
                            </a>
                            <a
                              href={`https://www.openstreetmap.org/?mlat=${analysis.latitude}&mlon=${analysis.longitude}&zoom=18`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                            >
                              <MapPin className="w-4 h-4" />
                              OpenStreetMap
                            </a>
                          </div>

                          {/* Embed Mini Map */}
                          <div className="mt-4">
                            <iframe
                              width="100%"
                              height="200"
                              frameBorder="0"
                              scrolling="no"
                              marginHeight="0"
                              marginWidth="0"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${parseFloat(analysis.longitude)-0.01},${parseFloat(analysis.latitude)-0.01},${parseFloat(analysis.longitude)+0.01},${parseFloat(analysis.latitude)+0.01}&layer=mapnik&marker=${analysis.latitude},${analysis.longitude}`}
                              className="rounded-lg border border-slate-600"
                            />
                            <p className="text-xs text-gray-500 mt-2">
                              📍 Pothole detected at this location
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {analysis.processed_image_url && (
                    <div className="space-y-3">
                      <h3 className="text-lg sm:text-xl font-semibold text-white">Annotated Image</h3>
                      <img
                        src={analysis.processed_image_url}
                        alt="Processed"
                        className="w-full rounded-lg border border-cyan-500/30"
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <FileText className="w-16 h-16 text-gray-600 mb-4" />
                  <p className="text-gray-400">Upload an image to see analysis results</p>
                </div>
              )}
            </motion.div>
          </div>
        ) : view === 'history' ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Analysis History
              </h2>
              <button
                onClick={fetchAnalyses}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-xl border border-slate-700 transition-colors duration-200 flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>

            {analyses.length === 0 ? (
              <div className="bg-slate-900 rounded-xl sm:rounded-2xl p-16 text-center border border-cyan-500">
                <FileText className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No analyses yet. Upload your first pothole image!</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {analyses.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    whileHover={{ scale: 1.02 }}
                    className="bg-slate-900 rounded-xl overflow-hidden border border-cyan-500/30 hover:border-cyan-500 transition-all duration-300 hover:shadow-[0_0_15px_rgba(6,182,212,0.3)] cursor-pointer"
                    onClick={() => {
                      setAnalysis(item);
                      setView('upload');
                    }}
                  >
                    <img
                      src={item.image_url}
                      alt={`Analysis ${item.id}`}
                      className="w-full h-48 object-cover"
                    />
                    <div className="p-4 space-y-3">
                      <div
                        className={`${getSeverityBadgeColor(item.severity)} px-3 py-1 rounded-full text-xs sm:text-sm font-semibold inline-block border`}
                      >
                        {item.severity?.toUpperCase()}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Size:</span>
                          <span className="font-semibold">{item.area_cm2} cm²</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Depth:</span>
                          <span className="font-semibold">~{item.depth_estimate} cm</span>
                        </div>
                        <div className="flex justify-between text-gray-300">
                          <span className="text-gray-400">Cost:</span>
                          <span className="font-semibold text-green-400">
                            ${item.estimated_repair_cost}
                          </span>
                        </div>
                        {(item.latitude && item.longitude) && (
                          <div className="flex items-center gap-1 text-cyan-400 text-xs">
                            <MapPin className="w-3 h-3" />
                            <span className="truncate">
                              {parseFloat(item.latitude).toFixed(4)}, {parseFloat(item.longitude).toFixed(4)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-800">
                        <span className="text-xs text-gray-500">
                          {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteAnalysis(item.id);
                          }}
                          className="text-red-400 hover:text-red-300 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-7xl mx-auto space-y-6"
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-300 bg-clip-text text-transparent">
                Pothole Heatmap
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={fetchHeatmapData}
                  disabled={heatmapLoading}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-gray-300 font-medium rounded-xl border border-slate-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <RefreshCw className={`w-4 h-4 ${heatmapLoading ? 'animate-spin' : ''}`} />
                  {heatmapLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>
            </div>

            {/* Heatmap Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-slate-900 rounded-xl p-4 border border-cyan-500/30">
                <div className="text-2xl font-bold text-cyan-400">{heatmapData.length}</div>
                <div className="text-gray-400 text-sm">Total Potholes</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-emerald-500/30">
                <div className="text-2xl font-bold text-emerald-400">
                  {heatmapData.filter(point => point[2] <= 0.4).length}
                </div>
                <div className="text-gray-400 text-sm">Low Severity</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-orange-500/30">
                <div className="text-2xl font-bold text-orange-400">
                  {heatmapData.filter(point => point[2] > 0.4 && point[2] <= 0.8).length}
                </div>
                <div className="text-gray-400 text-sm">High Severity</div>
              </div>
              <div className="bg-slate-900 rounded-xl p-4 border border-red-500/30">
                <div className="text-2xl font-bold text-red-400">
                  {heatmapData.filter(point => point[2] > 0.8).length}
                </div>
                <div className="text-gray-400 text-sm">Critical</div>
              </div>
            </div>

            {/* Heatmap Container */}
            <div className="bg-slate-900 rounded-xl p-6 border border-cyan-500/30">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-white mb-2">Interactive Heatmap</h3>
                <p className="text-gray-400 text-sm">
                  Color intensity represents pothole severity. Green = Low, Yellow = Medium, Orange = High, Red = Critical
                </p>
              </div>

              {heatmapLoading ? (
                <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
                  <div className="flex items-center gap-3">
                    <RefreshCw className="w-6 h-6 animate-spin text-cyan-400" />
                    <span className="text-gray-300">Loading heatmap data...</span>
                  </div>
                </div>
              ) : heatmapData.length === 0 ? (
                <div className="flex items-center justify-center h-96 bg-slate-800 rounded-lg">
                  <div className="text-center">
                    <Map className="w-16 h-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">No pothole data available for heatmap</p>
                    <p className="text-gray-500 text-sm mt-2">Upload and analyze some images first</p>
                  </div>
                </div>
              ) : (
                <div className="h-96 rounded-lg overflow-hidden border border-slate-700">
                  <MapContainer
                    center={heatmapData.length > 0 ? [heatmapData[0][0], heatmapData[0][1]] : [28.6139, 77.2090]}
                    zoom={12}
                    style={{ height: '100%', width: '100%' }}
                    className="z-0"
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    <HeatmapLayer data={heatmapData} />
                  </MapContainer>
                </div>
              )}

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-green-500"></div>
                  <span className="text-gray-400">Low Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-yellow-500"></div>
                  <span className="text-gray-400">Medium Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-orange-500"></div>
                  <span className="text-gray-400">High Severity</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded bg-red-500"></div>
                  <span className="text-gray-400">Critical Severity</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default PotholeAnalyzer;