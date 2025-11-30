import React, { useState, useEffect } from "react";

import { MessageCircle } from "lucide-react";
import { AlertTriangle } from "lucide-react";
import { CheckCircle2 } from "lucide-react";
import { Timer } from "lucide-react";
import { MapPin } from "lucide-react";
// import axios from "axios";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import FloatingChatbot from "@/components/FloatingChatbot";
import { Navigate, useNavigate } from "react-router-dom";
import OrderProgress from "@/components/ProgressBar";
import ChartsUser from "./charts-user";

const UserDashboard = () => {
  const navigate = useNavigate();
  const { isLoggedIn, login, logout } = useAuth();
  console.log(`is logged in ${isLoggedIn}`);

  const [total, setTotal] = useState();
  const [resolved, setResolved] = useState(0);
  const [unresolved, setUnResolved] = useState(0);
  const [incidents, setIncidents] = useState([]);
  const API_HOST = import.meta.env.VITE_API_HOST;
  const API_URL = import.meta.env.VITE_API_URL;

  const token = localStorage.getItem("accessToken");

  const getSeverityColor = (severity) => {
    if (severity === "low") return "text-[#4da6a8] border-[#4da6a8] border-2";
    if (severity === "medium")
      return "text-[#d1a45b] border-[#d1a45b] border-2";
    if (severity === "high") return "text-[#c85c5c] border-[#c85c5c] border-2";
  };

  // const getStatusColor = (status) => {
  //   if (status === "Resolved") return "bg-green-100 text-green-300";
  //   if (status === "submitted") return "bg-red-100 text-red-300";
  //   return "bg-yellow-100 text-yellow-300";
  // };

  const handleLogout = () => {
    localStorage.removeItem("userType");
    logout();
    navigate("/login");
  };

  useEffect(() => {
    let totalIncidents = 0;
    let resolvedIncidents = 0;
    let unresolvedIncidents = 0;

    incidents.forEach((inci) => {
      totalIncidents++;
      if (inci.status === "Resolved") {
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
    const fetchIncidents = async () => {
      try {
        // console.log(`Access Token: ${token}`);
        const response = await fetch(
          `${API_URL}/api/all_user_incidents/`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`, // Replace with your actual token logic
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          console.log("Incidents Response Data:", data);

          if (Array.isArray(data.incidents)) {
            setIncidents(data.incidents); // Set incidents state here
            setTotal(data.incidents.length);
            setResolved(
              data.incidents.filter((inci) => inci.status === "Resolved").length
            );
            setUnResolved(
              data.incidents.filter((inci) => inci.status !== "Resolved").length
            );
          } else {
            console.error("Unexpected data format:", data);
          }
        } else {
          console.error(
            `Error fetching incidents: ${response.statusText} (Status: ${response.status})`
          );
        }
      } catch (error) {
        console.error("Error fetching incidents:", error);
      }
    };

    fetchIncidents();
  }, []); // Empty dependency array ensures this runs only once

  console.log("user data dashboard", incidents);
  return (
    <>
      <div className="min-h-screen bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f]">
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">
          {/* Header */}
          <div className="mb-10 mt-4">
            <h1 className="text-xl text-left md:text-center md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-[#4da6a8] to-[#3e8c8e] [text-shadow:_0_0_30px_rgb(77_166_168_/_45%)]">
              Your Dashboard
            </h1>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-[#c85c5c]/10 text-[#c85c5c] font-bold border border-[#c85c5c]/20 rounded-lg hover:bg-[#c85c5c]/20 transition-all absolute right-8 top-20 md:top-28"
            >
              Logout
            </button>
          </div>

          {/* Dashboard Stats Cards */}
          <div className="flex flex-col md:flex-row  items-center gap-6  mb-8 justify-center ">
            {/* Total Incidents Card */}
            <div className="bg-white/5 p-6 rounded-2xl cursor-pointer border-[#c85c5c] shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(255,255,255,0.15),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 border-2 border-[#c85c5c]">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">
                  Total Incidents
                </h3>
                <p className="text-3xl font-bold text-white">{total}</p>
              </div>
              <AlertTriangle className="text-[#c85c5c] w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Resolved Incidents Card */}

            <div className="bg-white/5 cursor-pointer border-2 border-green-500 p-6 rounded-2xl shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(77_166_168_/_0.2),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 hover:border-green-500 ">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Resolved</h3>
                <p className="text-3xl font-bold text-white">{resolved}</p>
              </div>
              <CheckCircle2 className="text-green-500 w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Unresolved Incidents Card */}
            <div className="bg-white/5  p-6 cursor-pointer rounded-2xl border-white/10 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] transition-all hover:scale-105 hover:shadow-[0px_10px_30px_rgba(209_164_91_/_0.2),0px_15px_50px_rgba(0,0,0,0.8)] flex items-center justify-between group w-64 md:w-80 border-2 border-[#d1a45b]">
              <div>
                <h3 className="text-gray-400 font-medium mb-1">Unresolved</h3>
                <p className="text-3xl font-bold text-white">{unresolved}</p>
              </div>
              <Timer className="text-[#d1a45b] w-12 h-12 group-hover:scale-110 transition-transform" />
            </div>
          </div>

          {/* All Incidents - Desktop Table View */}
          <div className="hidden md:block rounded-2xl border border-white/10 overflow-hidden">
            <h2 className="text-xl font-semibold text-white p-6 border-b border-white/10 bg-white/5">
              All Incidents
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/10 bg-white/5">
                    <th className="p-4 text-center text-gray-400 font-medium">
                      ID
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Title
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Description
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Severity
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Status
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Location
                    </th>
                    <th className="p-4 text-center text-gray-400 font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {incidents.map((incident) => {
                    let step = 0; // Default value

                    if (incident?.status?.toLowerCase() === "resolved") {
                      step = 2;
                    } else if (
                      incident?.status?.toLowerCase() === "under investigation"
                    ) {
                      step = 1;
                    }

                    return (
                      // Add return statement here
                      <tr
                        key={incident.id}
                        className="border-b border-white/10 hover:bg-white/5 transition-color text-center"
                      >
                        <td className="p-4 text-gray-300">#{incident.id}</td>
                        <td className="p-4 text-white font-medium">
                          {incident.incidentType}
                        </td>
                        <td className="p-4 text-gray-300 max-w-xs">
                          <div className="line-clamp-2 overflow-y-auto">
                            {incident.description}
                          </div>
                        </td>
                        <td className="p-4">
                          <span
                            className={`rounded-lg px-4 py-2 bg-transparent w-28 text-center font-bold ${getSeverityColor(
                              incident.severity
                            )}`}
                          >
                            {incident.severity?.charAt(0).toUpperCase() +
                              incident.severity?.slice(1)}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center justify-center flex-col">
                            <div className="flex items-center space-x-2">
                              {/* Status Indicator */}
                              <div className="flex items-center space-x-3">
                                <div className="flex items-center space-x-2">
                                  {/* Step 1 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-gradient-to-r from-[#4da6a8] to-[#3e8c8e] shadow-lg shadow-[#4da6a8]/50' : 'bg-gray-600'}`}></div>
                                  <div className={`w-12 h-1 ${step >= 1 ? 'bg-gradient-to-r from-[#4da6a8] to-[#d1a45b]' : 'bg-gray-600'} rounded-full`}></div>
                                  
                                  {/* Step 2 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-[#d1a45b] to-[#d1a45b] shadow-lg shadow-[#d1a45b]/50' : 'bg-gray-600'}`}></div>
                                  <div className={`w-12 h-1 ${step >= 2 ? 'bg-gradient-to-r from-[#d1a45b] to-[#4da6a8]' : 'bg-gray-600'} rounded-full`}></div>
                                  
                                  {/* Step 3 */}
                                  <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-[#4da6a8] to-[#3e8c8e] shadow-lg shadow-[#4da6a8]/50' : 'bg-gray-600'}`}></div>
                                </div>
                              </div>
                            </div>
                            {/* Current Status Label */}
                            <div className="mt-2">
                              <span className={`text-xs font-medium ${
                                step === 0 ? 'text-[#4da6a8]' : 
                                step === 1 ? 'text-[#d1a45b]' : 
                                step === 2 ? 'text-[#4da6a8]' : 'text-gray-400'
                              }`}>
                                {step === 0 ? 'Reported' : 
                                 step === 1 ? 'Under Investigation' : 
                                 step === 2 ? 'Resolved' : 'Unknown'}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <a
                            href={incident.maps_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-[#4da6a8] hover:text-[#3e8c8e] transition-colors"
                          >
                            <MapPin className="text-xl" />
                          </a>
                        </td>
                        <td className="p-4">
                          <Popover>
                            <PopoverTrigger>
                             <button 
  className="inline-flex items-center text-[#4da6a8] hover:text-[#3e8c8e] transition-colors"
  onClick={() => navigate('/chat')}
>
  <MessageCircle className="text-xl" />
</button>
                            </PopoverTrigger>
                            <PopoverContent className="bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f]">
                              <div className="p-4 bg-transparent rounded-xl border border-white/20">
                                <h3 className="text-lg font-semibold text-white mb-2">
                                  Chat with Authorities
                                </h3>
                                <p className="text-gray-300 mb-4 text-sm">
                                  Start a conversation with authorities to
                                  discuss this incident.
                                </p>
                                <button className="w-full px-4 py-2 bg-[#4da6a8] text-white rounded-lg hover:bg-[#3e8c8e] transition-all">
                                  Start Chat
                                </button>
                              </div>
                            </PopoverContent>
                          </Popover>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* All Incidents - Mobile Card View */}
          <div className="md:hidden">
            <h2 className="text-xl font-semibold text-white mb-6">
              All Incidents
            </h2>
            <div className="space-y-4">
              {incidents.map((incident) => {
                let step = 0; // Default value

                if (incident?.status?.toLowerCase() === "resolved") {
                  step = 2;
                } else if (
                  incident?.status?.toLowerCase() === "under investigation"
                ) {
                  step = 1;
                }

                return (
                  <div
                    key={incident.id}
                    className="bg-white/5 p-4 rounded-2xl border border-white/10 shadow-[0px_5px_15px_rgba(255,255,255,0.1),0px_10px_25px_rgba(0,0,0,0.7)] hover:bg-white/10 transition-all"
                  >
                    {/* Header with ID and Title */}
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-gray-400 text-sm">#{incident.id}</span>
                        <h3 className="text-white font-semibold text-lg">
                          {incident.incidentType}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <a
                          href={incident.maps_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[#4da6a8] hover:text-[#3e8c8e] transition-colors p-2 bg-[#4da6a8]/10 rounded-lg"
                        >
                          <MapPin className="w-5 h-5" />
                        </a>
                        <Popover>
                          <PopoverTrigger>
                            <button className="inline-flex items-center text-[#4da6a8] hover:text-[#3e8c8e] transition-colors p-2 bg-[#4da6a8]/10 rounded-lg">
                              <MessageCircle className="w-5 h-5" />
                            </button>
                          </PopoverTrigger>
                          <PopoverContent className="bg-gradient-to-b from-[#0f0f0f] via-[#1a1a1a] to-[#0f0f0f]">
                            <div className="p-4 bg-transparent rounded-xl border border-white/20">
                              <h3 className="text-lg font-semibold text-white mb-2">
                                Chat with Authorities
                              </h3>
                              <p className="text-gray-300 mb-4 text-sm">
                                Start a conversation with authorities to
                                discuss this incident.
                              </p>
                              <button className="w-full px-4 py-2 bg-[#4da6a8] text-white rounded-lg hover:bg-[#3e8c8e] transition-all">
                                Start Chat
                              </button>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="mb-4">
                      <p className="text-gray-300 text-sm leading-relaxed">
                        {incident.description}
                      </p>
                    </div>

                    {/* Severity Badge */}
                    <div className="mb-4">
                      <span
                        className={`inline-block rounded-lg px-3 py-1 bg-transparent text-sm font-bold ${getSeverityColor(
                          incident.severity
                        )}`}
                      >
                        {incident.severity?.charAt(0).toUpperCase() +
                          incident.severity?.slice(1)} Severity
                      </span>
                    </div>

                    {/* Status Progress */}
                    <div className="mb-2">
                      <p className="text-gray-400 text-sm mb-3">Status:</p>
                      <div className="flex items-center space-x-2">
                        {/* Modern Progress Bar */}
                        <div className="flex items-center space-x-3 w-full">
                          <div className="flex items-center space-x-2">
                            {/* Step 1 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 0 ? 'bg-gradient-to-r from-[#4da6a8] to-[#3e8c8e] shadow-lg shadow-[#4da6a8]/50' : 'bg-gray-600'}`}></div>
                            <div className={`w-16 h-1 ${step >= 1 ? 'bg-gradient-to-r from-[#4da6a8] to-[#d1a45b]' : 'bg-gray-600'} rounded-full`}></div>
                            
                            {/* Step 2 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-gradient-to-r from-[#d1a45b] to-[#d1a45b] shadow-lg shadow-[#d1a45b]/50' : 'bg-gray-600'}`}></div>
                            <div className={`w-16 h-1 ${step >= 2 ? 'bg-gradient-to-r from-[#d1a45b] to-[#4da6a8]' : 'bg-gray-600'} rounded-full`}></div>
                            
                            {/* Step 3 */}
                            <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-gradient-to-r from-[#4da6a8] to-[#3e8c8e] shadow-lg shadow-[#4da6a8]/50' : 'bg-gray-600'}`}></div>
                          </div>
                        </div>
                      </div>
                      {/* Current Status Label */}
                      <div className="mt-3">
                        <span className={`text-sm font-medium ${
                          step === 0 ? 'text-[#4da6a8]' : 
                          step === 1 ? 'text-[#d1a45b]' : 
                          step === 2 ? 'text-[#4da6a8]' : 'text-gray-400'
                        }`}>
                          {step === 0 ? 'Reported' : 
                           step === 1 ? 'Under Investigation' : 
                           step === 2 ? 'Resolved' : 'Unknown'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        {/* <ChartsUser /> */}
        <Footer />
      </div>

      <FloatingChatbot />
    </>
  );
};

export default UserDashboard;