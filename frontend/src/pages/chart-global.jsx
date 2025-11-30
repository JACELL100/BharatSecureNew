import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const API_HOST = import.meta.env.VITE_API_HOST;
const API_URL = import.meta.env.VITE_API_URL;
console.log("API Host:", API_HOST);
console.log("API_URL:", API_URL);

// Enhanced chart options with new theme
const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: "top",
      labels: {
        color: "#4da6a8",
        font: {
          family: "'Inter', sans-serif",
          weight: 500,
        },
        padding: 20,
        usePointStyle: true,
      },
    },
    tooltip: {
      backgroundColor: "rgba(15, 15, 15, 0.9)",
      titleColor: "#4da6a8",
      bodyColor: "#4da6a8",
      borderColor: "rgba(77, 166, 168, 0.2)",
      borderWidth: 1,
      padding: 12,
      boxPadding: 6,
      usePointStyle: true,
    },
  },
  scales: {
    x: {
      grid: {
        color: "rgba(77, 166, 168, 0.1)",
        drawBorder: false,
      },
      ticks: {
        color: "#4da6a8",
        font: {
          family: "'Inter', sans-serif",
        },
        maxRotation: 45,
        minRotation: 45,
      },
    },
    y: {
      grid: {
        color: "rgba(77, 166, 168, 0.1)",
        drawBorder: false,
      },
      ticks: {
        color: "#4da6a8",
        font: {
          family: "'Inter', sans-serif",
        },
      },
    },
  },
};

// Mobile-specific chart options
const mobileChartOptions = {
  ...chartOptions,
  plugins: {
    ...chartOptions.plugins,
    legend: {
      ...chartOptions.plugins.legend,
      position: "bottom",
    },
  },
};

const IncidentAnalyticsDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch(
          `${API_URL}/api/advanced-incident-analysis/`,
          {
            method: "GET",
            headers: { Accept: "application/json" },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch data");
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const hourlyDistributionData = {
    labels: data?.hourly_distribution.map((item) => `${item.hour}:00`) || [],
    datasets: [
      {
        label: "Incidents",
        data:
          data?.hourly_distribution.map((item) => item.incident_count) || [],
        backgroundColor: "rgba(77, 166, 168, 0.5)",
        borderColor: "rgba(77, 166, 168, 0.8)",
        borderWidth: 2,
      },
      {
        label: "High Severity",
        data:
          data?.hourly_distribution.map((item) => item.high_severity_count) ||
          [],
        backgroundColor: "rgba(200, 92, 92, 0.5)",
        borderColor: "rgba(200, 92, 92, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const incidentTypeData = {
    labels: data?.incident_type_analysis.map((item) => item.incidentType) || [],
    datasets: [
      {
        data:
          data?.incident_type_analysis.map((item) => item.total_count) || [],
        backgroundColor: [
          "rgba(77, 166, 168, 0.6)",
          "rgba(200, 92, 92, 0.6)",
          "rgba(209, 164, 91, 0.6)",
          "rgba(77, 166, 168, 0.6)",
          "rgba(77, 166, 168, 0.6)",
        ],
        borderColor: [
          "rgba(77, 166, 168, 0.8)",
          "rgba(200, 92, 92, 0.8)",
          "rgba(209, 164, 91, 0.8)",
          "rgba(77, 166, 168, 0.8)",
          "rgba(77, 166, 168, 0.8)",
        ],
        borderWidth: 2,
      },
    ],
  };

  const weeklyPatternData = {
    labels: [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    datasets: [
      {
        label: "Total Incidents",
        data: data?.weekly_pattern.map((item) => item.total_incidents) || [],
        backgroundColor: "rgba(77, 166, 168, 0.5)",
        borderColor: "rgba(77, 166, 168, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Resolution Rate",
        data: data?.weekly_pattern.map((item) => item.resolution_rate) || [],
        backgroundColor: "rgba(77, 166, 168, 0.5)",
        borderColor: "rgba(77, 166, 168, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  const emergencyServicesData = {
    labels:
      data?.emergency_services_summary.map((item) => item.incidentType) || [],
    datasets: [
      {
        label: "Police",
        data:
          data?.emergency_services_summary.map(
            (item) => item.police_involved
          ) || [],
        backgroundColor: "rgba(77, 166, 168, 0.5)",
        borderColor: "rgba(77, 166, 168, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Fire Dept",
        data:
          data?.emergency_services_summary.map((item) => item.fire_involved) ||
          [],
        backgroundColor: "rgba(209, 164, 91, 0.5)",
        borderColor: "rgba(209, 164, 91, 0.8)",
        borderWidth: 2,
      },
      {
        label: "Hospital",
        data:
          data?.emergency_services_summary.map(
            (item) => item.hospital_involved
          ) || [],
        backgroundColor: "rgba(200, 92, 92, 0.5)",
        borderColor: "rgba(200, 92, 92, 0.8)",
        borderWidth: 2,
      },
    ],
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#4da6a8] border-t-transparent shadow-[0_0_15px_rgba(77,166,168,0.3)]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0f0f0f]">
        <div className="text-[#4da6a8] p-6 bg-[#1a1a1a] rounded-xl border border-[#4da6a8]/20">
          Error: {error}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-4 md:p-8 bg-[#0f0f0f] min-h-screen">
      {/* Title with enhanced glow effect */}
      <h1 className="text-3xl md:text-5xl font-bold text-[#4da6a8] mb-8 md:mb-12 text-center drop-shadow-[0_0_8px_rgba(77,166,168,0.5)]">
        Incident Analytics Dashboard
      </h1>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8 mb-8 md:mb-12">
        {[
          {
            title: "Resolution Rate",
            value: `${Number(data.overall_statistics.resolution_rate).toFixed(
              1
            )}%`,
            icon: "📈",
          },
          {
            title: "Average Response Score",
            value: Number(data.overall_statistics.avg_response_score).toFixed(
              1
            ),
            icon: "⭐",
          },
          {
            title: "Total Incidents",
            value: data.overall_statistics.total_incidents,
            icon: "🎯",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] rounded-xl p-4 md:p-6 border border-[#4da6a8]/20 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(77,166,168,0.3)] hover:scale-105"
          >
            <div className="flex items-center space-x-3 md:space-x-4">
              <span className="text-xl md:text-2xl">{stat.icon}</span>
              <div>
                <h3 className="text-sm md:text-lg font-semibold text-[#4da6a8] mb-1 md:mb-2">
                  {stat.title}
                </h3>
                <div className="text-xl md:text-3xl font-bold text-white">
                  {stat.value}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
        {[
          {
            title: "Hourly Distribution",
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={hourlyDistributionData}
              />
            ),
          },
          {
            title: "Incident Type Distribution",
            chart: (
              <Pie
                options={isMobile ? mobileChartOptions : chartOptions}
                data={incidentTypeData}
              />
            ),
          },
          {
            title: "Weekly Pattern",
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={weeklyPatternData}
              />
            ),
          },
          {
            title: "Emergency Services Response",
            chart: (
              <Bar
                options={isMobile ? mobileChartOptions : chartOptions}
                data={emergencyServicesData}
              />
            ),
          },
        ].map((section, index) => (
          <div
            key={index}
            className="bg-[#1a1a1a] rounded-xl p-4 md:p-6 border border-[#4da6a8]/20 transform transition-all duration-300 hover:shadow-[0_0_20px_rgba(77,166,168,0.3)]"
          >
            <h3 className="text-lg md:text-xl font-semibold text-[#4da6a8] mb-4 md:mb-6 p-2 md:p-3 rounded-lg border border-[#4da6a8]/20 text-center md:text-left">
              {section.title}
            </h3>
            <div className="h-[300px] md:h-[400px] bg-[#0f0f0f] rounded-lg p-2 md:p-4 border border-[#4da6a8]/10">
              {section.chart}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IncidentAnalyticsDashboard;