import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = [
  "#4da6a8", // primary accent
  "#3e8c8e", // darker accent
  "#d1a45b", // medium severity
  "#c85c5c", // high severity
  "#2a2a2a", // dark background
];

// Neuromorphic Card Components
const Card = ({ children, className = "" }) => (
  <div
    className={`text-[#4da6a8] bg-[#1a1a1a] rounded-xl p-6 shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(77,166,168,0.1)] border border-[#4da6a8]/20 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(77,166,168,0.3)] group ${className}`}
  >
    {children}
  </div>
);

const CardHeader = ({ children }) => (
  <div className="mb-4 p-2 rounded-lg shadow-[inset_-2px_-2px_8px_rgba(0,0,0,0.2),_inset_2px_2px_8px_rgba(77,166,168,0.1)]">
    {children}
  </div>
);

const CardTitle = ({ children }) => (
  <h3 className="text-lg font-semibold text-[#4da6a8] drop-shadow-[0_0_5px_rgba(77,166,168,0.3)] group-hover:text-[#3e8c8e] transition-colors duration-300">
    {children}
  </h3>
);

const CardContent = ({ children, className = "" }) => (
  <div
    className={`${className} text-white group-hover:text-[#4da6a8] transition-colors duration-300`}
  >
    {children}
  </div>
);

const AnalyticsDashboard = () => {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
    const API_HOST = import.meta.env.VITE_API_HOST;
  const API_URL = import.meta.env.VITE_API_URL;
  console.log("API Host:", API_HOST);
  console.log("API_URL:", API_URL);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          `${API_URL}/api/incident-analysis/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
            },
          }
        );
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Error fetching analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4da6a8] border-t-transparent shadow-[0_0_15px_rgba(77,166,168,0.3)]"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="text-[#4da6a8] p-6 bg-[#1a1a1a] rounded-xl shadow-[5px_5px_15px_rgba(0,0,0,0.3),-5px_-5px_15px_rgba(77,166,168,0.1)] border border-[#4da6a8]/20">
          Error loading analytics data
        </div>
      </div>
    );
  }

  const chartConfig = {
    cartesianGrid: {
      strokeDasharray: "3 3",
      stroke: "rgba(77, 166, 168, 0.1)",
    },
    xAxis: { stroke: "#4da6a8", tick: { fill: "#4da6a8" } },
    yAxis: { stroke: "#4da6a8", tick: { fill: "#4da6a8" } },
    tooltip: {
      contentStyle: {
        backgroundColor: "#1a1a1a",
        border: "1px solid rgba(77, 166, 168, 0.2)",
        borderRadius: "8px",
        color: "#4da6a8",
      },
    },
  };

  return (
    <div className="p-8 pt-28 space-y-8 bg-[#0f0f0f] min-h-screen">
      {/* Dashboard Title */}
      <h1 className="text-4xl font-bold text-[#4da6a8] mb-8 text-center drop-shadow-[0_0_8px_rgba(77,166,168,0.5)] hover:text-[#3e8c8e] transition-colors duration-300">
        Incident Analytics Dashboard
      </h1>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Incidents by Type */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Type</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analyticsData.incidents_by_type}>
                <CartesianGrid {...chartConfig.cartesianGrid} />
                <XAxis
                  {...chartConfig.xAxis}
                  dataKey="incidentType"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis {...chartConfig.yAxis} />
                <Tooltip {...chartConfig.tooltip} />
                <Bar dataKey="count" fill="#4da6a8">
                  {analyticsData.incidents_by_type.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Daily Incidents Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Incidents Trend</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analyticsData.daily_incidents}>
                <CartesianGrid {...chartConfig.cartesianGrid} />
                <XAxis {...chartConfig.xAxis} dataKey="date" />
                <YAxis {...chartConfig.yAxis} />
                <Tooltip {...chartConfig.tooltip} />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#4da6a8"
                  strokeWidth={2}
                  dot={{ fill: "#4da6a8" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents by Severity */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Severity</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.incidents_by_severity}
                  dataKey="count"
                  nameKey="severity"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData.incidents_by_severity.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(77,166,168,0.2)",
                    color: "#4da6a8",
                  }}
                  itemStyle={{
                    color: "#4da6a8",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[#4da6a8] hover:text-[#3e8c8e] transition-colors duration-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Incidents by Status */}
        <Card>
          <CardHeader>
            <CardTitle>Incidents by Status</CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analyticsData.incidents_by_status}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label
                >
                  {analyticsData.incidents_by_status.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1a1a1a",
                    border: "1px solid rgba(77,166,168,0.2)",
                    color: "#4da6a8",
                  }}
                  itemStyle={{
                    color: "#4da6a8",
                  }}
                />
                <Legend
                  formatter={(value) => (
                    <span className="text-[#4da6a8] hover:text-[#3e8c8e] transition-colors duration-300">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;