import { useState, useEffect } from "react";
import { TrendingUp, Brain, AlertTriangle, MapPin, Calendar, BarChart3, Activity, RefreshCw } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";
import Footer from "@/components/Footer";

const IncidentForecasting = () => {
  const [loading, setLoading] = useState(false);
  const [forecast, setForecast] = useState(null);
  const [error, setError] = useState(null);
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

  useEffect(() => {
    // Show demo data instead of API call for now
    setLoading(true);
    setTimeout(() => {
      setForecast({
        total_incidents: 71,
        predictions: { next_week: 15 },
        high_risk_areas: [
          { location: "Downtown District", risk_score: 85, incident_count: 12, reason: "High traffic density and recent incidents" },
          { location: "Industrial Zone", risk_score: 78, incident_count: 8, reason: "Limited surveillance coverage" },
          { location: "Residential Area A", risk_score: 72, incident_count: 6, reason: "Recent pattern of similar incidents" }
        ],
        peak_hour: "4:00 PM",
        trend_data: [
          { date: "2024-01-01", count: 5 },
          { date: "2024-01-02", count: 8 },
          { date: "2024-01-03", count: 3 },
          { date: "2024-01-04", count: 12 },
          { date: "2024-01-05", count: 7 },
          { date: "2024-01-06", count: 9 },
          { date: "2024-01-07", count: 4 },
          { date: "2024-01-08", count: 11 },
          { date: "2024-01-09", count: 6 },
          { date: "2024-01-10", count: 8 }
        ],
        severity_distribution: [
          { name: "Low", count: 26 },
          { name: "Medium", count: 25 },
          { name: "High", count: 20 }
        ],
        type_distribution: [
          { type: "Accident", count: 17 },
          { type: "Theft", count: 13 },
          { type: "Sexual Harassment", count: 6 },
          { type: "Fire", count: 6 },
          { type: "Domestic Violence", count: 6 },
          { type: "Other", count: 23 }
        ],
        time_analysis: {
          peak_hours: "4:00 PM - 6:00 PM",
          peak_days: "Sunday, Monday"
        },
        recommendations: [
          "Increase police patrols in Downtown District during peak hours (4-6 PM)",
          "Install additional surveillance cameras in Industrial Zone",
          "Implement community awareness programs in Residential Area A",
          "Consider traffic management solutions for high-incident intersections",
          "Establish rapid response teams for critical incident types"
        ],
        summary: "Analysis of 71 incidents shows a notably low resolution rate of 16.9% (12 incidents resolved), leaving 59 incidents currently unresolved. The data reveals 26 low-severity, 25 medium-severity, and 20 high-severity incidents. Accident (17 incidents, 23.9%) and Theft (13 incidents, 18.3%) are the most frequent types, while Sexual Harassment, Fire, and Domestic Violence each account for 6 incidents (8.5%) and represent incidents of greater concern. Peak incident hour is 4:00 PM and peak day is Sunday. The low resolution rate (16.9%) points to a need for re-evaluation, possibly due to inadequate staffing, improper procedures, or a lack of appropriate resources."
      });
      setLoading(false);
    }, 1500);
  }, []);

  const fetchForecast = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_URL}/api/incident-forecast/`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setForecast(data);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Failed to fetch forecast");
      }
    } catch (err) {
      setError("Error connecting to server. Please try again.");
      console.error("Error fetching forecast:", err);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#4da6a8', '#d1a45b', '#c85c5c', '#8884D8', '#82CA9D', '#FF8042'];

  // Format summary text into paragraphs
  const formatSummary = (text) => {
    if (!text) return [];
    
    // Split by double newlines (paragraphs) or single newlines
    const paragraphs = text
      .split(/\n\n+/)
      .map(p => p.trim())
      .filter(p => p.length > 0);
    
    return paragraphs;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f0f0f] flex items-center justify-center">
        <div className="text-center">
          <div className="w-20 h-20 bg-[#4da6a8] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(77,166,168,0.5)]">
            <RefreshCw className="w-10 h-10 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-[#4da6a8] mb-2 drop-shadow-[0_0_10px_rgba(77,166,168,0.5)]">Analyzing incident data with AI...</h2>
          <p className="text-gray-300 text-lg">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f0f]">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          <div className="bg-[#1a1a1a] border border-[#c85c5c]/20 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-[#c85c5c] rounded-full flex items-center justify-center mx-auto mb-6 shadow-[0_0_20px_rgba(200,92,92,0.5)]">
              <AlertTriangle className="w-10 h-10 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-[#4da6a8] mb-2 drop-shadow-[0_0_10px_rgba(77,166,168,0.5)]">Error Loading Forecast</h2>
            <p className="text-gray-300 mb-6 text-lg">{error}</p>
            <button
              onClick={fetchForecast}
              className="bg-[#4da6a8]/10 border border-[#4da6a8] text-[#4da6a8] px-6 py-3 rounded-lg hover:bg-[#4da6a8]/20 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all"
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!forecast) {
    return null;
  }

  const summaryParagraphs = formatSummary(forecast.summary);

  return (
    <div className="min-h-screen bg-[#0f0f0f]">
      <div className="p-4 md:p-8 pb-20 md:pb-24 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 md:mb-10 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-[#4da6a8] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(77,166,168,0.3)]">
              <Brain className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold text-[#4da6a8] drop-shadow-[0_0_15px_rgba(77,166,168,0.5)]">
                AI Incident Forecasting
              </h1>
              <p className="text-gray-300 text-sm md:text-base mt-1">Intelligent analysis and predictions</p>
            </div>
          </div>
          <button
            onClick={fetchForecast}
            className="bg-[#4da6a8]/10 border border-[#4da6a8] text-[#4da6a8] px-4 py-2 rounded-lg hover:bg-[#4da6a8]/20 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            {!isMobile && "Refresh"}
          </button>
        </div>

        {/* AI Summary Card */}
        <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 md:p-8 mb-8 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 bg-[#4da6a8] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(77,166,168,0.3)]">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#4da6a8] drop-shadow-[0_0_8px_rgba(77,166,168,0.3)] mb-2">AI Analysis Summary</h2>
              <p className="text-gray-300 text-sm">Here's an analysis of the provided incident data:</p>
            </div>
          </div>
          <div className="bg-[#0f0f0f] rounded-xl p-4 md:p-6 space-y-4 border border-[#4da6a8]/10">
            {summaryParagraphs.map((paragraph, index) => (
              <p key={index} className="text-gray-200 text-base md:text-lg leading-relaxed">
                {paragraph}
              </p>
            ))}
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#4da6a8] rounded-full flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(77,166,168,0.3)]">
              <Activity className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#4da6a8] text-sm font-semibold mb-2 drop-shadow-[0_0_5px_rgba(77,166,168,0.3)]">Total Incidents</h3>
            <p className="text-3xl font-bold text-white">{forecast.total_incidents}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#4da6a8] rounded-full flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(77,166,168,0.3)]">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#4da6a8] text-sm font-semibold mb-2 drop-shadow-[0_0_5px_rgba(77,166,168,0.3)]">Predicted Next Week</h3>
            <p className="text-3xl font-bold text-white">{forecast.predictions?.next_week || "N/A"}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#d1a45b] rounded-full flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(209,164,91,0.3)]">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#4da6a8] text-sm font-semibold mb-2 drop-shadow-[0_0_5px_rgba(77,166,168,0.3)]">High Risk Areas</h3>
            <p className="text-3xl font-bold text-white">{forecast.high_risk_areas?.length || 0}</p>
          </div>

          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <div className="w-12 h-12 bg-[#c85c5c] rounded-full flex items-center justify-center mb-4 shadow-[0_0_10px_rgba(200,92,92,0.3)]">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-[#4da6a8] text-sm font-semibold mb-2 drop-shadow-[0_0_5px_rgba(77,166,168,0.3)]">Peak Hour</h3>
            <p className="text-3xl font-bold text-white">{forecast.peak_hour || "N/A"}</p>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Trend Chart */}
          {forecast.trend_data && forecast.trend_data.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
                <div className="w-8 h-8 bg-[#4da6a8] rounded-full flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                Incident Trend (Last 30 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={forecast.trend_data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" stroke="#9CA3AF" />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #4da6a8' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="count" stroke="#4da6a8" strokeWidth={3} name="Incidents" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Severity Distribution */}
          {forecast.severity_distribution && forecast.severity_distribution.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
              <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
                <div className="w-8 h-8 bg-[#d1a45b] rounded-full flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4 text-white" />
                </div>
                Severity Distribution
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={forecast.severity_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {forecast.severity_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #4da6a8' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Incident Type Distribution */}
          {forecast.type_distribution && forecast.type_distribution.length > 0 && (
            <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300 lg:col-span-2">
              <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
                <div className="w-8 h-8 bg-[#4da6a8] rounded-full flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                Top Incident Types
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={forecast.type_distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="type" stroke="#9CA3AF" angle={-45} textAnchor="end" height={100} />
                  <YAxis stroke="#9CA3AF" />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1a1a1a', border: '1px solid #4da6a8' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Bar dataKey="count" fill="#4da6a8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* High Risk Areas */}
        {forecast.high_risk_areas && forecast.high_risk_areas.length > 0 && (
          <div className="bg-[#1a1a1a] border border-[#c85c5c]/20 rounded-2xl p-6 mb-8 hover:shadow-[0_0_15px_rgba(200,92,92,0.3)] transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
              <div className="w-8 h-8 bg-[#c85c5c] rounded-full flex items-center justify-center">
                <MapPin className="w-4 h-4 text-white" />
              </div>
              High Risk Locations
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {forecast.high_risk_areas.map((area, index) => (
                <div key={index} className="bg-[#0f0f0f] border border-[#c85c5c]/30 rounded-xl p-4 hover:bg-[#c85c5c]/10 hover:border-[#c85c5c]/50 transition-all duration-300">
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-white font-semibold text-lg">{area.location}</h3>
                    <span className="bg-[#c85c5c] text-white px-3 py-1 rounded-full text-xs font-bold shadow-[0_0_10px_rgba(200,92,92,0.3)]">
                      {area.risk_score}%
                    </span>
                  </div>
                  <p className="text-[#4da6a8] text-sm mb-2 font-medium">{area.incident_count} incidents</p>
                  <p className="text-gray-300 text-xs">{area.reason}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recommendations */}
        {forecast.recommendations && forecast.recommendations.length > 0 && (
          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 mb-8 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
              <div className="w-8 h-8 bg-[#4da6a8] rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              AI Recommendations
            </h2>
            <div className="space-y-4">
              {forecast.recommendations.map((rec, index) => (
                <div key={index} className="bg-[#0f0f0f] border border-[#4da6a8]/30 rounded-xl p-4 hover:bg-[#4da6a8]/10 hover:border-[#4da6a8]/50 transition-all duration-300 flex gap-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-[#4da6a8] rounded-full flex items-center justify-center shadow-[0_0_10px_rgba(77,166,168,0.3)]">
                    <span className="text-white font-bold text-sm">{index + 1}</span>
                  </div>
                  <p className="text-gray-200 text-sm md:text-base flex-1 pt-1">{rec}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Time Analysis */}
        {forecast.time_analysis && (
          <div className="bg-[#1a1a1a] border border-[#4da6a8]/20 rounded-2xl p-6 hover:shadow-[0_0_15px_rgba(77,166,168,0.3)] transition-all duration-300">
            <h2 className="text-xl md:text-2xl font-bold text-[#4da6a8] mb-6 flex items-center gap-3 drop-shadow-[0_0_8px_rgba(77,166,168,0.3)]">
              <div className="w-8 h-8 bg-[#4da6a8] rounded-full flex items-center justify-center">
                <Calendar className="w-4 h-4 text-white" />
              </div>
              Time-Based Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-[#0f0f0f] border border-[#4da6a8]/30 rounded-xl p-6 hover:bg-[#4da6a8]/10 hover:border-[#4da6a8]/50 transition-all duration-300">
                <h3 className="text-[#4da6a8] font-semibold mb-3 text-lg">Peak Hours</h3>
                <p className="text-white text-xl font-bold">{forecast.time_analysis.peak_hours || "N/A"}</p>
              </div>
              <div className="bg-[#0f0f0f] border border-[#4da6a8]/30 rounded-xl p-6 hover:bg-[#4da6a8]/10 hover:border-[#4da6a8]/50 transition-all duration-300">
                <h3 className="text-[#4da6a8] font-semibold mb-3 text-lg">Peak Days</h3>
                <p className="text-white text-xl font-bold">{forecast.time_analysis.peak_days || "N/A"}</p>
              </div>
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default IncidentForecasting;