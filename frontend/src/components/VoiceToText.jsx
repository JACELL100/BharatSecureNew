import React, { useState, useRef, useEffect } from "react";
import { Mic, Send, Repeat, StopCircle } from "lucide-react";
import axios from "axios";
import { BarLoader } from "react-spinners";
import Footer from "./Footer";

const VoiceInput = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [isStopped, setIsStopped] = useState(false);
  const [language, setLanguage] = useState("hi-IN");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [loadingSpinner, setLoadingSpinner] = useState(false);

  const recognitionRef = useRef(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = false;

      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0].transcript)
          .join("");
        setText(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setError("Speech recognition error. Please try again.");
      };
    } else {
      setError("Speech recognition is not supported in this browser.");
    }
  }, []);

  useEffect(() => {
    if (!recognitionRef.current) return;

    recognitionRef.current.lang = language;

    const handleEnd = () => {
      if (isListening && !isStopped) {
        setTimeout(() => recognitionRef.current.start(), 500);
      }
    };

    recognitionRef.current.onend = handleEnd;

    return () => {
      recognitionRef.current.onend = null;
    };
  }, [language, isListening, isStopped]);

  const startListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(true);
    setIsStopped(false);
    setError(null);
    setSuccess(false);
    recognitionRef.current.start();
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    setIsListening(false);
    setIsStopped(true);
    recognitionRef.current.stop();
  };

  const analyzeAndSubmit = async () => {
    if (!text) {
      setError("Please record an incident before submitting.");
      return;
    }

    setLoadingSpinner(true);
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
          if (!navigator.geolocation) {
            reject(new Error("Geolocation is not supported by this browser"));
            return;
          }
          
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude
              });
            },
            (error) => {
              console.warn("Location access denied, using default coordinates");
              resolve({
                latitude: 19.0760,
                longitude: 72.8777
              });
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000
            }
          );
        });
      };

      const location = await getCurrentLocation();
      
      const extractedData = {
        user_input: text,
        latitude: location.latitude,
        longitude: location.longitude
      };

      console.log("Sending data to backend:", extractedData);
      console.log("Making request to: http://127.0.0.1:8000/api/voice-report/");

      try {
        await axios.get("http://127.0.0.1:8000/api/latest-incidents/");
        console.log("Backend is reachable");
      } catch (connectError) {
        console.error("Backend connectivity test failed:", connectError);
        throw new Error("Cannot connect to backend. Please ensure the Django server is running on http://127.0.0.1:8000");
      }

      const response = await axios.post(
        "http://127.0.0.1:8000/api/voice-report/",
        extractedData
      );

      console.log("Backend response:", response.data);

      setSuccess(true);
      setText("");
      setIsStopped(false);
      alert("Incident submitted successfully!");
    } catch (err) {
      console.error("Full error object:", err);
      console.error("Error response:", err.response);
      console.error("Error response data:", err.response?.data);
      console.error("Error status:", err.response?.status);
      
      let errorMessage = "Failed to process the incident. Please try again.";
      
      if (err.response) {
        const statusCode = err.response.status;
        const responseData = err.response.data;
        
        console.log("Server response status:", statusCode);
        console.log("Server response data:", responseData);
        
        if (responseData) {
          if (responseData.error) {
            errorMessage = `Server Error: ${responseData.error}`;
          } else if (responseData.message) {
            errorMessage = `Server Message: ${responseData.message}`;
          } else if (typeof responseData === 'string') {
            errorMessage = `Server Response: ${responseData}`;
          } else {
            errorMessage = `Server Error (${statusCode}): ${JSON.stringify(responseData)}`;
          }
        } else {
          errorMessage = `Server Error: HTTP ${statusCode}`;
        }
      } else if (err.request) {
        console.error("No response received:", err.request);
        errorMessage = "No response from server. Please check if the backend is running on http://127.0.0.1:8000";
      } else {
        errorMessage = `Request Error: ${err.message}`;
      }
      
      setError(errorMessage);
      console.log("Final error message:", errorMessage);
    } finally {
      setLoadingSpinner(false);
      setLoading(false);
    }
  };

  const reRecord = () => {
    setText("");
    setIsStopped(false);
    setError(null);
    setSuccess(false);
    startListening();
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-[#0f0f0f] p-1">
        <div className="max-w-2xl mx-auto border border-[#4da6a8]">
          <div className="max-w-2xl p-8 mx-auto border bg-[#1a1a1a] border-[#4da6a8]">
            <div className="text-center mb-8">
              <div className="inline-flex items-center justify-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-[#4da6a8] mb-4">
                  Voice Incident Reporting
                </h1>
                <div
                  className={`p-3 rounded-full ${
                    isListening ? "bg-[#c85c5c]/20" : "bg-[#2a2a2a]"
                  }`}
                >
                  <Mic
                    className={`w-6 h-6 ${
                      isListening ? "text-[#c85c5c]" : "text-[#4da6a8]"
                    }`}
                  />
                </div>
              </div>
              <p className="text-gray-400 max-w-lg mx-auto">
                Report incidents using your voice. Select your preferred
                language, start recording, and submit your report.
              </p>
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 font-medium mb-2">
                Select Language
              </label>
              <div className="relative">
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full bg-[#2a2a2a] text-gray-200 px-4 py-3 rounded-xl border border-[#333] focus:border-[#4da6a8] cursor-pointer text-lg font-medium"
                >
                  <option value="hi-IN" className="bg-[#2a2a2a]">
                    Hindi
                  </option>
                  <option value="en-US" className="bg-[#2a2a2a]">
                    English
                  </option>
                  <option value="mr-IN" className="bg-[#2a2a2a]">
                    Marathi
                  </option>
                  <option value="es-ES" className="bg-[#2a2a2a]">
                    Spanish
                  </option>
                  <option value="fr-FR" className="bg-[#2a2a2a]">
                    French
                  </option>
                </select>
              </div>
            </div>

            {error && (
              <div className="mb-4 p-4 bg-[#c85c5c]/20 border border-[#c85c5c]/50 rounded-xl">
                <p className="text-[#c85c5c] text-sm">{error}</p>
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-[#4da6a8]/20 border border-[#4da6a8]/50 rounded-xl">
                <p className="text-[#4da6a8] text-sm">Incident submitted successfully!</p>
              </div>
            )}

            <div className="mb-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Please describe the incident clearly. Include details like the type of incident, location, time, and any relevant observations. Make sure to mention the location in your description for better accuracy."
                className="w-full bg-[#2a2a2a] text-gray-200 px-4 py-3 rounded-xl border border-[#333] focus:border-[#4da6a8] min-h-[120px] resize-none"
                rows="4"
              />
            </div>

            <div className="space-y-4">
              {isListening ? (
                <button
                  onClick={stopListening}
                  className="w-full py-4 bg-[#c85c5c] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                >
                  <StopCircle className="w-5 h-5" />
                  Stop Recording
                </button>
              ) : (
                !isStopped && (
                  <button
                    onClick={startListening}
                    className="w-full py-4 bg-[#4da6a8] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Mic className="w-5 h-5" />
                    Start Recording
                  </button>
                )
              )}

              {isStopped && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={analyzeAndSubmit}
                    className="py-4 bg-[#4da6a8] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Send Report
                  </button>
                  <button
                    onClick={reRecord}
                    className="py-4 bg-[#d1a45b] text-white rounded-xl font-medium flex items-center justify-center gap-2"
                  >
                    <Repeat className="w-5 h-5" />
                    Re-record
                  </button>
                </div>
              )}
              {loadingSpinner && (
                <div className="flex justify-center mt-4">
                  <BarLoader color="#4da6a8" />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
};

export default VoiceInput;