import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, FileText, Database, TrendingUp, Clock, CheckCircle2, ArrowRight, Sparkles, BarChart3, PieChart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, PieChart as RechartsChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Dashboard = () => {
    const [stats, setStats] = useState({ datasets: 0, models: 0 });
    const [recentDatasets, setRecentDatasets] = useState([]);
    const [isHovering, setIsHovering] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDatasets();
        fetchModels();

        // Poll models count periodically so the card updates after training
        const interval = setInterval(fetchModels, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchDatasets = async () => {
        try {
            const res = await axios.get(`${API_URL}/datasets`);
            setRecentDatasets(res.data);
            setStats(prev => ({ ...prev, datasets: res.data.length }));
        } catch (error) {
            console.error("Error fetching datasets", error);
        }
    };

    const fetchModels = async () => {
        try {
            const res = await axios.get(`${API_URL}/ml/models`);
            setStats(prev => ({ ...prev, models: res.data.length }));
        } catch (error) {
            console.error("Error fetching models", error);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/datasets/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            fetchDatasets();
        } catch (error) {
            console.error("Upload failed", error);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <header className="relative overflow-hidden rounded-3xl p-8 glass-panel">
                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/20 rounded-full text-primary text-sm font-medium mb-4 animate-fade-in">
                        <Sparkles size={16} />
                        <span>Welcome Back</span>
                    </div>
                    <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                        ML Studio — Intelligent Learning to New Innovative
                    </h2>
                    <p className="text-gray-400 text-lg">Manage your datasets and start training intelligent models.</p>
                </div>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="glass-panel-hover p-6 group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl border border-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Database className="text-blue-400" size={28} />
                        </div>
                        <TrendingUp className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-blue-400 to-blue-600 bg-clip-text text-transparent">
                        {stats.datasets}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Total Datasets</div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                        <span>Active</span>
                    </div>
                </div>

                <div className="glass-panel-hover p-6 group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl border border-purple-500/20 group-hover:scale-110 transition-transform duration-300">
                            <CheckCircle2 className="text-purple-400" size={28} />
                        </div>
                        <TrendingUp className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-purple-400 to-purple-600 bg-clip-text text-transparent">
                        {stats.models}
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Trained Models</div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-purple-500 animate-pulse"></div>
                        <span>Ready</span>
                    </div>
                </div>

                <div className="glass-panel-hover p-6 group cursor-pointer">
                    <div className="flex items-start justify-between mb-4">
                        <div className="p-3 bg-gradient-to-br from-pink-500/20 to-pink-600/20 rounded-2xl border border-pink-500/20 group-hover:scale-110 transition-transform duration-300">
                            <Clock className="text-pink-400" size={28} />
                        </div>
                        <TrendingUp className="text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" size={20} />
                    </div>
                    <div className="text-3xl font-bold mb-2 bg-gradient-to-br from-pink-400 to-pink-600 bg-clip-text text-transparent">
                        24h
                    </div>
                    <div className="text-sm text-gray-400 font-medium">Avg Training Time</div>
                    <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
                        <div className="h-1.5 w-1.5 rounded-full bg-pink-500 animate-pulse"></div>
                        <span>Efficient</span>
                    </div>
                </div>
            </div>

            {/* Upload Area */}
            <div 
                className={`glass-panel p-10 border-dashed border-2 transition-all duration-300 text-center cursor-pointer relative overflow-hidden group ${
                    isHovering ? 'border-primary/50 bg-primary/5' : 'border-white/10 hover:border-primary/30'
                }`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
            >
                <input
                    type="file"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                    accept=".csv"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                
                <div className="relative z-10 flex flex-col items-center gap-5">
                    <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent/30 to-secondary/30 rounded-full blur-2xl animate-pulse-slow"></div>
                        <div className="relative p-6 bg-gradient-to-br from-accent/10 to-secondary/10 rounded-full border border-accent/20">
                            <Upload className="text-accent h-10 w-10 group-hover:scale-110 transition-transform" />
                        </div>
                    </div>
                    
                    <div>
                        <h3 className="text-2xl font-bold mb-2">Upload New Dataset</h3>
                        <p className="text-gray-400 text-sm max-w-md mx-auto">
                            Drag and drop your CSV file here, or click to browse.
                            <br />
                            <span className="text-primary">Ensure your dataset has proper headers.</span>
                        </p>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="px-3 py-1 bg-surface rounded-full border border-white/10">CSV</span>
                        <span className="px-3 py-1 bg-surface rounded-full border border-white/10">Max 50MB</span>
                        <span className="px-3 py-1 bg-surface rounded-full border border-white/10">Headers Required</span>
                    </div>
                </div>
            </div>

            {/* Recent Datasets */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold">Recent Datasets</h3>
                    <button className="text-sm text-primary hover:text-primary/80 transition-colors flex items-center gap-2">
                        View All
                        <ArrowRight size={16} />
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                    {recentDatasets.map((ds, index) => (
                        <div 
                            key={ds._id} 
                            className="glass-panel-hover p-5 flex items-center justify-between group cursor-pointer"
                            style={{ animationDelay: `${index * 50}ms` }}
                        >
                            <div className="flex items-center gap-5 flex-1">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-blue-500/20 rounded-xl blur-md group-hover:blur-lg transition-all"></div>
                                    <div className="relative p-3 bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-xl border border-blue-500/20">
                                        <FileText size={24} className="text-blue-400" />
                                    </div>
                                </div>
                                
                                <div className="flex-1">
                                    <div className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                                        {ds.originalName}
                                    </div>
                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span className="flex items-center gap-1.5">
                                            <Database size={14} />
                                            {(ds.size / 1024).toFixed(1)} KB
                                        </span>
                                        <span className="flex items-center gap-1.5">
                                            <Clock size={14} />
                                            {new Date(ds.uploadDate).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            
                            <button
                                onClick={() => navigate('/train', { state: { datasetId: ds._id } })}
                                className="px-6 py-3 bg-gradient-to-r from-primary to-secondary hover:from-primary/80 hover:to-secondary/80 rounded-xl font-semibold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:scale-105"
                            >
                                Train Model
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ))}

                    {recentDatasets.length === 0 && (
                        <div className="glass-panel p-12 text-center">
                            <div className="inline-flex p-4 bg-surface rounded-full mb-4 opacity-50">
                                <Database size={32} />
                            </div>
                            <div className="text-gray-400 text-lg mb-2">No datasets uploaded yet</div>
                            <p className="text-gray-500 text-sm">Upload your first dataset to get started with ML training</p>
                        </div>
                    )}
                </div>
            </div>
            {/* Analytics Charts Section */}
            <div>
                <h3 className="text-2xl font-bold mb-6">Analytics & Insights</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Dataset Size Distribution */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <BarChart3 className="text-primary" size={20} />
                            </div>
                            <h4 className="font-bold text-lg">Dataset Sizes</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart
                                data={recentDatasets.map(ds => ({
                                    name: ds.originalName.substring(0, 10),
                                    size: (ds.size / 1024).toFixed(1)
                                }))}
                                margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="name" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Bar dataKey="size" fill="#6366f1" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Upload Trends */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="p-2 bg-secondary/10 rounded-lg">
                                <TrendingUp className="text-secondary" size={20} />
                            </div>
                            <h4 className="font-bold text-lg">Upload Trends</h4>
                        </div>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart
                                data={[
                                    { day: 'Mon', uploads: 4 },
                                    { day: 'Tue', uploads: 3 },
                                    { day: 'Wed', uploads: 5 },
                                    { day: 'Thu', uploads: 6 },
                                    { day: 'Fri', uploads: 8 },
                                    { day: 'Sat', uploads: 7 },
                                    { day: 'Sun', uploads: recentDatasets.length }
                                ]}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis dataKey="day" stroke="rgba(255,255,255,0.5)" />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: 'rgba(24, 24, 27, 0.8)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                    labelStyle={{ color: '#fff' }}
                                />
                                <Line type="monotone" dataKey="uploads" stroke="#a855f7" strokeWidth={3} dot={{ fill: '#a855f7', r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
