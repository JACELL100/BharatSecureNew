import React, { useState, useEffect, lazy, Suspense, useRef } from "react";
import axios from "axios";
import { FaCommentDots } from "react-icons/fa";
import { Loader2, AlertTriangle, Wallet } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import Footer from "@/components/Footer";
import FloatingChatbot from "@/components/FloatingChatbot";
import LocationDisplay from "@/components/LocationDisplay";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet marker icons
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

// Lazy load comment form
const AddCommentForm = lazy(() => import("../components/AddCommentForm"));

const RecentIncidents = () => {
  const [incidents, setIncidents] = useState([]);
  const [originalIncidents, setOriginalIncidents] = useState([]);
  const [openCommentSection, setOpenCommentSection] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const { isLoggedIn } = useAuth();
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_URL = import.meta.env.VITE_API_URL;

  // MetaMask state
  const [walletAddress, setWalletAddress] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [walletError, setWalletError] = useState(null);

  // Refs for map and data
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const incidentsRef = useRef(incidents);

  // Sync ref with incidents state
  useEffect(() => {
    incidentsRef.current = incidents;
  }, [incidents]);

  // Check if MetaMask is already connected on component mount
  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);

  const checkIfWalletIsConnected = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setWalletAddress(accounts[0]);
        }
      }
    } catch (error) {
      console.error("Error checking wallet connection:", error);
    }
  };

  const connectWallet = async () => {
    setIsConnecting(true);
    setWalletError(null);

    try {
      if (typeof window.ethereum === 'undefined') {
        setWalletError("MetaMask is not installed. Please install MetaMask to continue.");
        setIsConnecting(false);
        return;
      }

      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        setWalletAddress(accounts[0]);
      }
    } catch (error) {
      console.error("Error connecting wallet:", error);
      if (error.code === 4001) {
        setWalletError("Connection rejected. Please approve the connection request.");
      } else {
        setWalletError("Failed to connect wallet. Please try again.");
      }
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setWalletAddress(null);
  };

  // Listen for account changes
  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = (accounts) => {
        if (accounts.length === 0) {
          setWalletAddress(null);
        } else {
          setWalletAddress(accounts[0]);
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      return () => {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      };
    }
  }, []);

  // Initialize map when modal opens
  useEffect(() => {
    if (!isMapModalOpen) return;

    const map = L.map("map").setView([20.5937, 78.9629], 5);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
    mapRef.current = map;

    map.on("click", async (e) => {
      const { lat, lng } = e.latlng;
      if (markerRef.current) {
        map.removeLayer(markerRef.current);
      }
      markerRef.current = L.marker([lat, lng]).addTo(map);

      try {
        const response = await axios.get(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
        );

        const filteredIncidents = originalIncidents.filter((incident) => {
          const distance = getDistanceFromLatLonInKm(
            lat,
            lng,
            incident.location.latitude,
            incident.location.longitude
          );
          return distance <= 10;
        });

        setIncidents(filteredIncidents);
      } catch (error) {
        console.error("Error fetching location data:", error);
        setError("Failed to get location data");
      }
    });

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, [isMapModalOpen]);

  // Fetch incidents from backend
  useEffect(() => {
    if (!walletAddress) return;

    const fetchIncidents = async () => {
      try {
        setLoading(true);
        const response = await axios.get(
          `${API_URL}/api/latest-incidents/`
        );

        if (response.status === 200) {
          setIncidents(response.data);
          setOriginalIncidents(response.data);
          console.log(incidents);
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
        setError("Failed to load incidents. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    fetchIncidents();
  }, [walletAddress]);

  // Distance calculation helpers
  const deg2rad = (deg) => deg * (Math.PI / 180);

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  // Location filtering handler
  const handleLocationFilter = () => {
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const filteredIncidents = originalIncidents.filter((incident) => {
            const distance = getDistanceFromLatLonInKm(
              latitude,
              longitude,
              incident.location.latitude,
              incident.location.longitude
            );
            return distance <= 10;
          });
          setIncidents(filteredIncidents);
        } catch (error) {
          console.error("Error filtering incidents:", error);
          setError("Failed to filter incidents");
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setError("Please enable location services to use this feature");
      }
    );
  };

  const toggleComments = (id) => {
    setOpenCommentSection((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  // If wallet is not connected, show connect screen
  if (!walletAddress) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="container mx-auto px-4 py-10 flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-[#1a1a1a] rounded-2xl p-8 border border-[#4da6a8]">
            <div className="text-center mb-8">
              <Wallet className="mx-auto mb-4 text-[#4da6a8]" size={64} />
              <h1 className="text-3xl font-extrabold text-[#4da6a8] mb-2">
                Connect Your Wallet
              </h1>
              <p className="text-gray-400">
                Please connect your MetaMask wallet to access recent incidents
              </p>
            </div>

            {walletError && (
              <div className="mb-6 p-4 bg-[#c85c5c]/20 border border-[#c85c5c]/30 rounded-lg flex items-start gap-3">
                <AlertTriangle className="text-[#c85c5c] flex-shrink-0 mt-0.5" size={20} />
                <p className="text-[#c85c5c] text-sm">{walletError}</p>
              </div>
            )}

            <button
              onClick={connectWallet}
              disabled={isConnecting}
              className="w-full px-6 py-4 bg-[#4da6a8] text-white rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  Connecting...
                </>
              ) : (
                <>
                  <Wallet size={24} />
                  Connect MetaMask
                </>
              )}
            </button>

            {typeof window.ethereum === 'undefined' && (
              <div className="mt-6 text-center">
                <p className="text-gray-400 text-sm mb-3">Don't have MetaMask?</p>
                <a
                  href="https://metamask.io/download/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#4da6a8] hover:text-[#3e8c8e] underline text-sm"
                >
                  Install MetaMask Extension
                </a>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="container mx-auto px-4 py-10">
        {/* Wallet Info Bar */}
        <div className="flex justify-end mb-6">
          <div className="bg-[#1a1a1a] rounded-xl px-4 py-2 border border-[#4da6a8] flex items-center gap-3">
            <Wallet className="text-[#4da6a8]" size={20} />
            <span className="text-[#4da6a8] font-mono text-sm">
              {walletAddress.substring(0, 6)}...{walletAddress.substring(38)}
            </span>
            <button
              onClick={disconnectWallet}
              className="text-[#c85c5c] hover:text-[#b54c4c] text-sm font-semibold"
            >
              Disconnect
            </button>
          </div>
        </div>

        <h1 className="text-center font-extrabold text-3xl sm:text-4xl lg:text-5xl mb-12 text-[#4da6a8]">
          Recently Reported Incidents
        </h1>

        <div className="flex justify-center gap-4 mb-8 flex-wrap">
          <button
            onClick={handleLocationFilter}
            className="px-6 py-3 bg-[#1a1a1a] text-[#4da6a8] rounded-xl border border-[#4da6a8] font-semibold"
          >
            Filter by My Location
          </button>

          <button
            onClick={() => setIsMapModalOpen(true)}
            className="px-6 py-3 bg-[#1a1a1a] text-[#4da6a8] rounded-xl border border-[#4da6a8] font-semibold"
          >
            Pick Location on Map
          </button>
        </div>

        {isMapModalOpen && (
          <div
            className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
            onClick={(e) =>
              e.target === e.currentTarget && setIsMapModalOpen(false)
            }
          >
            <div className="bg-white p-4 rounded-lg shadow-lg w-full max-w-lg">
              <div id="map" style={{ height: "400px" }} />
              <button
                onClick={() => setIsMapModalOpen(false)}
                className="mt-4 px-4 py-2 bg-[#c85c5c] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex justify-center items-center">
            <Loader2 className="animate-spin text-[#4da6a8]" size={48} />
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="flex justify-center items-center">
            <div className="bg-[#2a2a2a] p-6 rounded-xl flex items-center text-[#c85c5c]">
              <AlertTriangle className="mr-3" />
              {error}
            </div>
          </div>
        )}

        {/* Incidents Grid */}
        {!loading && !error && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {incidents.length === 0 ? (
              <div className="col-span-full text-center bg-[#2a2a2a] p-6 rounded-xl text-gray-400">
                No incidents reported yet.
              </div>
            ) : (
              incidents.map((incident) => (
                <IncidentCard
                  key={incident.id}
                  incident={incident}
                  toggleComments={toggleComments}
                  openCommentSection={openCommentSection}
                  setIncidents={setIncidents}
                />
              ))
            )}
          </div>
        )}
      </div>

      <Footer />
      <FloatingChatbot />
    </div>
  );
};

const IncidentCard = ({
  incident,
  toggleComments,
  openCommentSection,
  setIncidents,
}) => {
  // Status configuration
  const statusConfig = {
    Resolved: {
      tag: "Completed",
      bgColor: "bg-[#4da6a8]/20",
      textColor: "text-[#4da6a8]",
      borderColor: "border-[#4da6a8]",
    },
    processing: {
      tag: "Ongoing",
      bgColor: "bg-[#d1a45b]/20",
      textColor: "text-[#d1a45b]",
      borderColor: "border-[#d1a45b]",
    },
    submitted: {
      tag: "Reported",
      bgColor: "bg-[#c85c5c]/20",
      textColor: "text-[#c85c5c]",
      borderColor: "border-[#c85c5c]",
    },
    default: {
      tag: "Unknown",
      bgColor: "bg-gray-400/20",
      textColor: "text-gray-400",
      borderColor: "border-gray-400",
    },
  };

  const status = statusConfig[incident.status] || statusConfig.default;

  return (
    <div className={`relative ${status.bgColor} border ${status.borderColor} rounded-2xl p-6`}>
      {/* Incident Header */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-[#4da6a8]">
          {incident.incidentType}
        </h2>
        <span className={`px-3 py-1 text-sm font-semibold rounded-full ${status.textColor} bg-[#1a1a1a] border ${status.borderColor}`}>
          {status.tag}
        </span>
      </div>

      {/* Incident Details */}
      <div className="space-y-2 mb-4">
        <p className="text-gray-300 line-clamp-2">{incident.description}</p>
        <p className="text-sm text-gray-400">
          Reported: {new Date(incident.reported_at).toLocaleString()}
        </p>
        <LocationDisplay location={incident.location} />
      </div>

      {/* Comments Toggle */}
      <button
        onClick={() => toggleComments(incident.id)}
        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[#1a1a1a] text-[#4da6a8] border border-[#4da6a8]"
      >
        <FaCommentDots />
        {openCommentSection[incident.id] ? "Hide Comments" : "View Comments"}
      </button>

      {/* Comments Section - Fixed Positioning */}
      {openCommentSection[incident.id] && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              toggleComments(incident.id);
            }
          }}
        >
          <div className="w-full max-w-md max-h-[80vh] overflow-y-auto">
            <Suspense fallback={<p className="text-gray-500">Loading comments...</p>}>
              <CommentsSection
                incident={incident}
                setIncidents={setIncidents}
                onClose={() => toggleComments(incident.id)}
              />
            </Suspense>
          </div>
        </div>
      )}
    </div>
  );
};

const CommentsSection = ({ incident, setIncidents, onClose }) => (
  <div className="bg-[#1a1a1a] rounded-lg p-4 border border-[#4da6a8] relative">
    <button
      onClick={onClose}
      className="absolute top-2 right-2 text-[#4da6a8] z-10"
    >
      ✕
    </button>

    <h3 className="text-lg font-semibold text-[#4da6a8] border-b border-[#4da6a8] pb-2 pr-8">
      Comments
    </h3>

    {incident.comments && incident.comments.length > 0 ? (
      <ul className="space-y-3 max-h-64 overflow-y-auto mt-4">
        {incident.comments.map((comment, index) => (
          <li key={index} className="flex items-start gap-3">
            <img
              src="https://cdn.pfps.gg/pfps/2301-default-2.png"
              alt="Profile"
              className="w-10 h-10 rounded-full border-2 border-[#4da6a8]"
            />
            <div className="flex-1 bg-[#2a2a2a] p-3 rounded-lg">
              <p className="text-sm font-semibold text-[#4da6a8]">
                {comment.commented_by.first_name}{" "}
                {comment.commented_by.last_name}
              </p>
              <p className="text-sm text-gray-300">{comment.comment}</p>
            </div>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500 text-center mt-4">No comments yet.</p>
    )}

    {/* Add Comment Form */}
    <Suspense fallback={<div className="text-gray-500 mt-4">Loading form...</div>}>
      <AddCommentForm
        incidentId={incident.id}
        onAddComment={(newComment) => {
          setIncidents((prev) =>
            prev.map((inc) =>
              inc.id === incident.id
                ? {
                    ...inc,
                    comments: [...(inc.comments || []), newComment],
                  }
                : inc
            )
          );
        }}
      />
    </Suspense>
  </div>
);

export default RecentIncidents;