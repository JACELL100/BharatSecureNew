import { useState, useEffect } from "react";
import { AlertTriangle, CheckCircle2, Timer, MessageCircle, MapPin } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { MdOutlineReport, MdReport } from "react-icons/md";
import AdminCharts from "./chart";
import PhotoList from "./PhotoList";

// Inject glow animation
const glowStyle = `
@keyframes pulseGlow {
  0% { box-shadow: 0 0 0px #c85c5c; }
  50% { box-shadow: 0 0 12px #c85c5c; }
  100% { box-shadow: 0 0 0px #c85c5c; }
}
`;

const AdminDashboard = () => {
  const [total, setTotal] = useState(0);
  const [resolved, setResolved] = useState(0);
  const [unresolved, setUnResolved] = useState(0);
  const [newTasks, setNewTasks] = useState([]);
  const [filter, setFilter] = useState("All");
  const [filternew, setFilterNew] = useState([]);
  const [incidents, setIncidents] = useState([]);
  const [completedId, setCompletedId] = useState([]);
  const [falseReport, setFalseReport] = useState([{}]);
  const [flaggedIncidents, setFlaggedIncidents] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const API_URL = import.meta.env.VITE_API_URL;
  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const getincidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/all_station_incidents/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const incidentData = await response.json();
        setIncidents(incidentData);
      } else {
        console.error("Failed to fetch incidents");
      }
    } catch (error) {
      console.error("Error fetching incidents:", error);
    }
  };

  useEffect(() => {
    getincidents();
  }, []);

  const getSeverityColor = (severity) => {
    if (severity === "low") return "text-[#4da6a8] border-[#4da6a8] bg-[#4da6a8]/10";
    if (severity === "medium") return "text-[#d1a45b] border-[#d1a45b] bg-[#d1a45b]/10";
    if (severity === "high") return "text-[#c85c5c] border-[#c85c5c] bg-[#c85c5c]/10";
    return "text-gray-400 border-gray-400 bg-gray-400/10";
  };

  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    window.location.href = "/";
    localStorage.removeItem("userType");
    logout();
  };

  useEffect(() => {
    let totalIncidents = 0;
    let resolvedIncidents = 0;
    let unresolvedIncidents = 0;

    incidents.forEach((incident) => {
      totalIncidents++;
      if (incident.status === "Resolved") {
        resolvedIncidents++;
      } else {
        unresolvedIncidents++;
      }
    });

    setTotal(totalIncidents);
    setResolved(resolvedIncidents);
    setUnResolved(unresolvedIncidents);
  }, [incidents]);

  useEffect(() => {
    const newIncidentList = incidents.filter((incident) => incident.status === "submitted");
    setNewTasks(newIncidentList);
  }, [incidents]);

  useEffect(() => {
    const filteredIncidents = incidents.filter((incident) => {
      if (filter === "All") {
        return incident.status !== "submitted" && incident.status !== "Resolved";
      }
      return (
        incident.severity === filter.toLowerCase() &&
        incident.status !== "submitted" &&
        incident.status !== "Resolved"
      );
    });

    setFilterNew(filteredIncidents);
  }, [filter, incidents]);

  const handlefilter = (e) => {
    setFilter(e);
  };

  const fetchFlaggedIncidents = async () => {
    try {
      const response = await fetch(`${API_URL}/api/all_station_incidents/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const flagged = data.filter((incident) => incident.true_or_false);
        setFlaggedIncidents(flagged);
      } else {
        console.error("Failed to fetch flagged incidents");
      }
    } catch (error) {
      console.error("Error fetching flagged incidents:", error);
    }
  };

  useEffect(() => {
    fetchFlaggedIncidents();
  }, []);

  const handleNewTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/update_incident/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "under investigation" }),
      });

      if (response.ok) {
        getincidents();
      } else {
        console.error("Failed to update incident");
      }
    } catch (error) {
      console.error("Error updating incident:", error);
    }
  };

  const handleMarkAsCompleted = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/update_incident/${id}/`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: "Resolved" }),
      });

      if (response.ok) {
        getincidents();
      } else {
        console.error("Failed to mark incident as completed");
      }
    } catch (error) {
      console.error("Error marking incident as completed:", error);
    }
  };

  useEffect(() => {
    const completedmarked = incidents.filter((incident) => incident.status === "Resolved");
    setCompletedId(completedmarked);
  }, [filter, incidents]);

  const handleFalseReport = async (id) => {
    try {
      const response = await fetch(`${API_URL}/api/all_station_incidents/`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ incident_id: id }),
      });

      if (response.ok) {
        setIncidents((prevIncidents) => prevIncidents.filter((incident) => incident.id !== id));
        alert("Report marked as False and removed from the list");
      } else {
        console.error("Failed to mark report as false");
      }
    } catch (error) {
      console.error("Error marking report as false:", error);
    }
  };

  // CARD COMPONENT
  const IncidentCard = ({ incident, type = "default" }) => {
    const isNew = type === "new";
    const isCompleted = type === "completed";
    const isFlagged = type === "flagged";

    let step = 0;
    if (incident?.status?.toLowerCase() === "resolved") {
      step = 2;
    } else if (incident?.status?.toLowerCase() === "under investigation") {
      step = 1;
    }

    const borderClass = isCompleted
      ? "border-green-600"
      : isFlagged
      ? "border-[#c85c5c]"
      : `border ${getSeverityColor(incident.severity).split(" ")[1]}`;

    const bgClass = isCompleted
      ? "bg-green-600/10"
      : isFlagged
      ? "bg-[#c85c5c]/10"
      : "bg-[#1b1b1b]";

    // Apply glow if multiple reports
    const glowClass =
      incident.count > 1
        ? "animate-[pulseGlow_1.5s_ease-in-out_infinite]"
        : "";

    return (
      <div
        className={`p-4 md:p-6 rounded-2xl ${bgClass} border ${borderClass} shadow-sm transition-all hover:scale-[1.02] w-full h-full flex flex-col ${glowClass}`}
      >
        {incident.count > 1 && (
          <div className="text-lg md:text-xl font-bold text-[#c85c5c] text-center mb-3">
            {isNew ? "Multiple Reports!!" : "Mass Report!!"}
          </div>
        )}

        <div className="flex justify-between items-center mb-4">
          <span
            className={`px-3 py-1 rounded-full font-bold text-sm md:text-base ${getSeverityColor(
              incident.severity
            )}`}
          >
            {incident.severity?.charAt(0).toUpperCase() + incident.severity?.slice(1)}
          </span>

          {isCompleted ? (
            <div className="px-3 py-1 border-2 rounded-lg border-green-400 text-green-300 font-bold text-sm">
              Completed
            </div>
          ) : isFlagged ? (
            <div className="px-3 py-1 border-2 rounded-lg border-[#c85c5c] text-[#c85c5c] font-bold text-sm">
              Flagged
            </div>
          ) : falseReport.some((report) => report.incidentid === incident.id) ? (
            <MdReport className="text-2xl md:text-3xl text-[#c85c5c] cursor-pointer" title="Marked as False Report" />
          ) : (
            <MdOutlineReport
              onClick={() => handleFalseReport(incident.id)}
              className="text-2xl md:text-3xl text-white hover:text-[#c85c5c] cursor-pointer transition-colors"
              title="Mark as False Report"
            />
          )}
        </div>

        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base md:text-lg font-semibold text-white line-clamp-1">
            {incident.incidentType}
          </h3>
          <p className="text-white font-bold text-sm md:text-base">ID: #{incident.id}</p>
        </div>

        <p className="text-gray-400 text-sm mb-3 line-clamp-3 flex-grow">{incident.description}</p>

        <div className="mb-3">
          <p className="text-gray-300 text-sm">
            Reported By:{" "}
            <span className="font-semibold text-white">
              {incident.reported_by?.first_name || "Unknown"} {incident.reported_by?.last_name || ""}
            </span>
          </p>
          <p className="text-gray-300 text-sm">User Score: {incident.score}</p>
        </div>

        <div className="flex items-center mb-4">
          <MapPin className="text-[#4da6a8] mr-2" size={16} />
          <a
            href={incident.maps_link}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#4da6a8] text-sm hover:opacity-80 transition-colors"
          >
            View Location
          </a>
        </div>

        <div className="mt-auto">
          {isNew ? (
            <div className="flex flex-col md:flex-row gap-2">
              <button
                className="bg-[#4da6a8] hover:bg-[#3d8688] text-white px-3 py-2 rounded-lg flex-1 transition-all text-sm md:text-base"
                onClick={() => handleNewTask(incident.id)}
              >
                Accept Task
              </button>
              <button
                className="bg-[#2a2a2a] hover:bg-[#333] text-white px-3 py-2 rounded-lg flex-1 transition-all text-sm md:text-base"
                onClick={() => navigate(`/view-details/${incident.id}`)}
              >
                View Details
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger>
                    <button className="inline-flex items-center text-[#4da6a8] hover:opacity-80 transition-colors p-2">
                      <MessageCircle size={18} className="mr-1" />
                      <span className="text-sm">Chat</span>
                    </button>
                  </PopoverTrigger>
                  <PopoverContent className="bg-[#1d1d1d] border border-[#2f2f2f] w-80">
                    <div className="p-4">
                      <h3 className="text-lg font-bold text-white mb-2">
                        Chat with {incident.reported_by?.first_name || "Unknown"}
                      </h3>
                      <p className="text-white mb-4 text-sm">Start a conversation to discuss this incident.</p>
                      <div className="flex justify-end">
                        <button
                          className="px-4 py-2 bg-[#4da6a8] text-white rounded hover:bg-[#3d8688] transition text-sm"
                          onClick={() => navigate("/chat")}
                        >
                          Start Chat
                        </button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>

                {!isCompleted && !isFlagged && incident.status !== "Resolved" && (
                  <button
                    onClick={() => handleMarkAsCompleted(incident.id)}
                    className="bg-green-600 text-white px-3 py-2 rounded-lg hover:bg-green-700 transition-all text-sm flex-1"
                  >
                    Mark Completed
                  </button>
                )}
              </div>

              <button
                className="bg-[#2a2a2a] hover:bg-[#333] text-white px-3 py-2 rounded-lg w-full transition-all text-sm"
                onClick={() => navigate(`/view-details/${incident.id}`)}
              >
                View Details
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{glowStyle}</style>

      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="flex-grow p-4 md:p-8 pb-20 md:pb-24 max-w-7xl mx-auto">
          <div className="mb-8 -ml-20 md:mb-10 relative">
            <h1 className="text-xl md:text-4xl lg:text-5xl font-extrabold text-center text-white">
              Admin Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-3 py-1 md:px-4 md:py-2 bg-[#2a2a2a] text-[#c85c5c] font-bold border border-[#c85c5c]/40 rounded-lg hover:bg-[#3a3a3a] transition-all absolute right-0 top-0 text-sm md:text-base"
            >
              Logout
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="bg-[#1a1a1a] p-4 md:p-6 rounded-2xl cursor-pointer border-2 border-[#c85c5c] shadow-sm transition-all hover:scale-105 flex items-center justify-between group">
              <div>
                <h3 className="text-gray-400 font-medium mb-1 text-sm md:text-base">Total Incidents</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{total}</p>
              </div>
              <AlertTriangle className="text-[#c85c5c] w-8 h-8 md:w-12 md:h-12" />
            </div>

            <div className="bg-[#1a1a1a] cursor-pointer p-4 md:p-6 rounded-2xl border-2 border-green-600 shadow-sm transition-all hover:scale-105 flex items-center justify-between group">
              <div>
                <h3 className="text-gray-400 font-medium mb-1 text-sm md:text-base">Resolved</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{resolved}</p>
              </div>
              <CheckCircle2 className="text-green-500 w-8 h-8 md:w-12 md:h-12" />
            </div>

            <div className="bg-[#1a1a1a] p-4 md:p-6 cursor-pointer rounded-2xl border-2 border-[#d1a45b] shadow-sm transition-all hover:scale-105 flex items-center justify-between group">
              <div>
                <h3 className="text-gray-400 font-medium mb-1 text-sm md:text-base">Unresolved</h3>
                <p className="text-2xl md:text-3xl font-bold text-white">{unresolved}</p>
              </div>
              <Timer className="text-[#d1a45b] w-8 h-8 md:w-12 md:h-12" />
            </div>
          </div>

          {newTasks.length === 0 ? (
            <h2 className="text-xl md:text-2xl my-8 text-white text-center">No New Reports Available</h2>
          ) : (
            <div className="mb-10 md:mb-14">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-6 text-center md:text-left">
                New Incidents
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {newTasks.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} type="new" />
                ))}
              </div>
            </div>
          )}

          <div className="mb-10 md:mb-14">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-white mb-4 text-center md:text-left">
              Accepted Incidents
            </h1>

            <div className="mb-6 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-4">
              <label
                htmlFor="severity-filter"
                className="text-gray-200 font-medium text-sm md:text-base"
              >
                Filter by Severity:
              </label>
              <select
                id="severity-filter"
                className="cursor-pointer w-full md:w-48 p-2 md:p-3 text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4da6a8] transition-all text-sm md:text-base"
                value={filter}
                onChange={(event) => handlefilter(event.target.value)}
              >
                <option value="All">All</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {filternew.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </div>

          {completedId.length > 0 && (
            <div className="mb-10 md:mb-14">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-green-300 mb-6 text-center md:text-left">
                Completed Incidents
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {completedId.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} type="completed" />
                ))}
              </div>
            </div>
          )}

          {flaggedIncidents.length > 0 && (
            <div className="mb-10 md:mb-14 text-center">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#c85c5c] mb-6 text-center md:text-left">
                Flagged Incidents
              </h1>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-6">
                {flaggedIncidents.map((incident) => (
                  <IncidentCard key={incident.id} incident={incident} type="flagged" />
                ))}
              </div>

              <button
                onClick={() => navigate("/forecasting")}
                className="px-6 py-3 bg-[#4da6a8] hover:bg-[#3d8688] text-white rounded-xl text-lg font-semibold shadow-sm transition-all hover:scale-105"
              >
                Forecasting
              </button>
            </div>
          )}

          <PhotoList />
          <AdminCharts />
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AdminDashboard;
