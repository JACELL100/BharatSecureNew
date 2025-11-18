import { useState, useEffect, useRef } from "react";
import { Upload, Video, Play, Pause, AlertTriangle, CheckCircle, Clock, TrendingUp, DollarSign, MapPin, Download, RefreshCw, Eye, BarChart3, Maximize2 } from "lucide-react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const VideoAnalysis = () => {
  const [videos, setVideos] = useState([]);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState(null);
  const [videoPlaying, setVideoPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
  const token = localStorage.getItem("accessToken") || "";

  useEffect(() => {
    fetchVideos();
    fetchStatistics();
    const interval = setInterval(() => {
      if (videos.some(v => v.status === 'processing')) {
        fetchVideos();
      }
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchVideos = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/pothole/api/video-analyses/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setVideos(data);
      }
    } catch (error) {
      console.error("Error fetching videos:", error);
    }
    setLoading(false);
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch(`${API_URL}/pothole/api/video-analyses/statistics/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatistics(data);
      }
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("video", file);
    formData.append("route_name", "Road Survey");
    formData.append("location", "City Center");

    setUploading(true);
    try {
      const response = await fetch(`${API_URL}/pothole/api/video-analyses/`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        const newVideo = await response.json();
        setVideos([newVideo, ...videos]);
        alert("Video uploaded! Analysis started...");
      } else {
        alert("Upload failed");
      }
    } catch (error) {
      console.error("Error uploading:", error);
      alert("Upload error");
    }
    setUploading(false);
  };

  const viewVideoDetails = async (videoId) => {
    try {
      const response = await fetch(`${API_URL}/pothole/api/video-analyses/${videoId}/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setSelectedVideo(data);
      }
    } catch (error) {
      console.error("Error fetching video details:", error);
    }
  };

  const toggleVideoPlayback = () => {
    if (videoRef.current) {
      if (videoPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setVideoPlaying(!videoPlaying);
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-500",
      processing: "bg-blue-500",
      completed: "bg-green-500",
      failed: "bg-red-500"
    };
    return colors[status] || "bg-gray-500";
  };

  const getSeverityColor = (severity) => {
    const colors = {
      low: "text-green-400",
      medium: "text-yellow-400",
      high: "text-orange-400",
      critical: "text-red-400"
    };
    return colors[severity] || "text-gray-400";
  };

  const COLORS = ['#10b981', '#fbbf24', '#fb923c', '#ef4444'];

  if (selectedVideo) {
    const timelineData = selectedVideo.timestamp_data || [];
    const severityData = [
      { name: 'Low', value: timelineData.filter(d => d.severity === 'low').length },
      { name: 'Medium', value: timelineData.filter(d => d.severity === 'medium').length },
      { name: 'High', value: timelineData.filter(d => d.severity === 'high').length },
      { name: 'Critical', value: timelineData.filter(d => d.severity === 'critical').length }
    ].filter(d => d.value > 0);

    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => setSelectedVideo(null)}
              className="text-sky-400 hover:text-sky-300 flex items-center gap-2 transition-colors"
            >
              ← Back to Videos
            </button>
            <h1 className="text-2xl md:text-4xl font-bold text-white">Video Analysis Details</h1>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div>
                <h2 className="text-xl font-bold text-white mb-4">Video Playback</h2>
                <div className="relative bg-black rounded-xl overflow-hidden shadow-lg">
                  <video
                    ref={videoRef}
                    src={selectedVideo.processed_video_url || selectedVideo.video_url}
                    className="w-full"
                    onTimeUpdate={handleTimeUpdate}
                    onEnded={() => setVideoPlaying(false)}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={toggleVideoPlayback}
                        className="bg-sky-500 hover:bg-sky-600 text-white p-2 rounded-full transition-colors"
                      >
                        {videoPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </button>
                      <div className="flex-1">
                        <div className="bg-white/20 rounded-full h-2">
                          <div
                            className="bg-sky-500 h-2 rounded-full transition-all"
                            style={{ width: `${(currentTime / selectedVideo.duration_seconds) * 100}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-white text-sm">
                        {Math.floor(currentTime)}s / {Math.floor(selectedVideo.duration_seconds)}s
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-xl font-bold text-white mb-4">Key Metrics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 hover:bg-blue-500/20 transition-colors">
                    <AlertTriangle className="w-8 h-8 text-blue-400 mb-2" />
                    <p className="text-gray-400 text-sm">Total Potholes</p>
                    <p className="text-3xl font-bold text-white">{selectedVideo.total_potholes_detected}</p>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 hover:bg-yellow-500/20 transition-colors">
                    <TrendingUp className="w-8 h-8 text-yellow-400 mb-2" />
                    <p className="text-gray-400 text-sm">Max Severity</p>
                    <p className={`text-2xl font-bold ${getSeverityColor(selectedVideo.max_severity)}`}>
                      {selectedVideo.max_severity?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 hover:bg-green-500/20 transition-colors">
                    <BarChart3 className="w-8 h-8 text-green-400 mb-2" />
                    <p className="text-gray-400 text-sm">Avg Area</p>
                    <p className="text-2xl font-bold text-white">{parseFloat(selectedVideo.average_area_cm2 || 0).toFixed(1)} cm²</p>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 hover:bg-red-500/20 transition-colors">
                    <DollarSign className="w-8 h-8 text-red-400 mb-2" />
                    <p className="text-gray-400 text-sm">Est. Cost</p>
                    <p className="text-2xl font-bold text-white">${parseFloat(selectedVideo.total_estimated_cost || 0).toFixed(0)}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {timelineData.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Detection Timeline</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={timelineData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="timestamp" 
                    stroke="#9CA3AF"
                    label={{ value: 'Time (seconds)', position: 'insideBottom', offset: -5, fill: '#9CA3AF' }}
                  />
                  <YAxis 
                    stroke="#9CA3AF"
                    label={{ value: 'Area (cm²)', angle: -90, position: 'insideLeft', fill: '#9CA3AF' }}
                  />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                    labelStyle={{ color: '#fff' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey="area" stroke="#38bdf8" strokeWidth={2} name="Pothole Area" dot={{ fill: '#38bdf8' }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {severityData.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 mb-8 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Severity Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={severityData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {severityData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {selectedVideo.frame_detections && selectedVideo.frame_detections.length > 0 && (
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
              <h2 className="text-xl font-bold text-white mb-4">Frame Detections ({selectedVideo.frame_detections.length})</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-96 overflow-y-auto custom-scrollbar">
                {selectedVideo.frame_detections.slice(0, 20).map((detection) => (
                  <div key={detection.id} className="bg-black/30 rounded-lg overflow-hidden border border-white/10 hover:border-sky-500/50 transition-all">
                    {detection.frame_image_url && (
                      <img src={detection.frame_image_url} alt={`Frame ${detection.frame_number}`} className="w-full h-32 object-cover" />
                    )}
                    <div className="p-2">
                      <p className="text-white text-sm font-semibold">Frame {detection.frame_number}</p>
                      <p className="text-gray-400 text-xs">{parseFloat(detection.timestamp_seconds || 0).toFixed(1)}s</p>
                      <p className={`text-xs font-bold ${getSeverityColor(detection.severity)}`}>
                        {detection.severity?.toUpperCase()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-blue-950 to-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-4">
              <Video className="w-12 h-12 text-purple-400" />
              <h1 className="text-3xl md:text-5xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600">
                Video Pothole Analysis
              </h1>
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 transition-all shadow-lg hover:shadow-sky-500/50"
            >
              <Upload className="w-5 h-5" />
              {uploading ? "Uploading..." : "Upload Video"}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="video/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
        </div>

        {statistics && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border-2 border-blue-500 shadow-xl hover:shadow-blue-500/50 transition-all">
              <Video className="w-10 h-10 text-blue-400 mb-3" />
              <h3 className="text-gray-400 text-sm mb-1">Total Videos</h3>
              <p className="text-3xl font-bold text-white">{statistics.total_videos_analyzed}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border-2 border-yellow-500 shadow-xl hover:shadow-yellow-500/50 transition-all">
              <AlertTriangle className="w-10 h-10 text-yellow-400 mb-3" />
              <h3 className="text-gray-400 text-sm mb-1">Total Potholes</h3>
              <p className="text-3xl font-bold text-white">{statistics.total_potholes_detected}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border-2 border-green-500 shadow-xl hover:shadow-green-500/50 transition-all">
              <TrendingUp className="w-10 h-10 text-green-400 mb-3" />
              <h3 className="text-gray-400 text-sm mb-1">Avg per Video</h3>
              <p className="text-3xl font-bold text-white">{parseFloat(statistics.average_potholes_per_video || 0).toFixed(1)}</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm p-6 rounded-2xl border-2 border-red-500 shadow-xl hover:shadow-red-500/50 transition-all">
              <DollarSign className="w-10 h-10 text-red-400 mb-3" />
              <h3 className="text-gray-400 text-sm mb-1">Total Cost</h3>
              <p className="text-3xl font-bold text-white">${parseFloat(statistics.total_estimated_cost || 0).toFixed(0)}</p>
            </div>
          </div>
        )}

        <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 p-6 shadow-2xl">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Video Analysis Results</h2>
            <button
              onClick={fetchVideos}
              disabled={loading}
              className="text-sky-400 hover:text-sky-300 transition-colors"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading && videos.length === 0 ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sky-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading videos...</p>
            </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-12">
              <Video className="w-16 h-16 text-gray-600 mx-auto mb-4" />
              <p className="text-gray-400 text-lg">No videos analyzed yet</p>
              <p className="text-gray-500 text-sm">Upload a video to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div
                  key={video.id}
                  className="bg-black/30 rounded-xl overflow-hidden border border-white/10 hover:border-sky-500/50 transition-all shadow-lg hover:shadow-xl"
                >
                  {video.thumbnail_url ? (
                    <img src={video.thumbnail_url} alt="Video thumbnail" className="w-full h-48 object-cover" />
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                      <Video className="w-16 h-16 text-gray-600" />
                    </div>
                  )}
                  
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`${getStatusColor(video.status)} px-3 py-1 rounded-full text-white text-xs font-semibold`}>
                        {video.status.toUpperCase()}
                      </span>
                      {video.status === 'processing' && (
                        <span className="text-sky-400 text-sm">{video.processing_progress}%</span>
                      )}
                    </div>

                    {video.route_name && (
                      <h3 className="text-white font-semibold mb-2">{video.route_name}</h3>
                    )}

                    {video.location && (
                      <div className="flex items-center gap-2 text-gray-400 text-sm mb-3">
                        <MapPin className="w-4 h-4" />
                        <span>{video.location}</span>
                      </div>
                    )}

                                          {video.status === 'completed' && (
                      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
                        <div>
                          <p className="text-gray-400">Potholes</p>
                          <p className="text-white font-bold">{video.total_potholes_detected}</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Max Severity</p>
                          <p className={`font-bold ${getSeverityColor(video.max_severity)}`}>
                            {video.max_severity?.toUpperCase()}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-400">Duration</p>
                          <p className="text-white font-bold">{parseFloat(video.duration_seconds || 0).toFixed(0)}s</p>
                        </div>
                        <div>
                          <p className="text-gray-400">Est. Cost</p>
                          <p className="text-white font-bold">${parseFloat(video.total_estimated_cost || 0).toFixed(0)}</p>
                        </div>
                      </div>
                    )}

                    {video.status === 'failed' && video.error_message && (
                      <p className="text-red-400 text-sm mb-3">{video.error_message}</p>
                    )}

                    <button
                      onClick={() => viewVideoDetails(video.id)}
                      disabled={video.status !== 'completed'}
                      className="w-full bg-sky-500 hover:bg-sky-600 disabled:bg-gray-600 text-white py-2 rounded-lg flex items-center justify-center gap-2 transition-all"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoAnalysis;