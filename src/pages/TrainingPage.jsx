import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { PlayCircle, Settings, AlertCircle, Zap, Target, Activity, TrendingUp, Award, ChevronDown } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, BarChart, Bar, Legend } from 'recharts';
import VideoExplainer from '../components/VideoExplainer';

const ALGORITHMS = [
    { name: 'Linear Regression', type: 'regression', desc: 'Predict continuous values using a line.', icon: '📈', color: 'from-blue-500 to-cyan-500' },
    { name: 'Logistic Regression', type: 'classification', desc: 'Binary classification using sigmoid.', icon: '🎯', color: 'from-purple-500 to-pink-500' },
    { name: 'Decision Tree', type: 'both', desc: 'Flowchart-like structure for decisions.', icon: '🌳', color: 'from-green-500 to-emerald-500' },
    { name: 'Random Forest', type: 'both', desc: 'Ensemble of multiple decision trees.', icon: '🌲', color: 'from-emerald-500 to-teal-500' },
    { name: 'SVM', type: 'both', desc: 'Finding optimal hyperplanes.', icon: '⚡', color: 'from-orange-500 to-red-500' },
    { name: 'Naive Bayes', type: 'classification', desc: 'Probabilistic classifier based on Bayes theorem.', icon: '🎲', color: 'from-indigo-500 to-purple-500' },
    { name: 'KNN', type: 'both', desc: 'Clustering based on neighbor proximity.', icon: '🔮', color: 'from-pink-500 to-rose-500' },
    { name: 'K-Means Clustering', type: 'clustering', desc: 'Partition data into centroid-based clusters.', icon: '🧭', color: 'from-cyan-500 to-sky-500' },
    { name: 'DBSCAN', type: 'clustering', desc: 'Density-based clusters that find noise.', icon: '🌀', color: 'from-amber-500 to-orange-600' },
    { name: 'Agglomerative Clustering', type: 'clustering', desc: 'Bottom-up hierarchical grouping.', icon: '🪜', color: 'from-lime-500 to-emerald-500' }
];

const TrainingPage = () => {
    const { state } = useLocation();
    const [datasets, setDatasets] = useState([]);
    const [selectedDatasetId, setSelectedDatasetId] = useState(state?.datasetId || '');
    const [selectedDataset, setSelectedDataset] = useState(null);
    const [selectedAlgo, setSelectedAlgo] = useState(ALGORITHMS[0].name);
    const [targetColumn, setTargetColumn] = useState('');
    const [params, setParams] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDatasets();
    }, []);

    useEffect(() => {
        if (selectedDatasetId && datasets.length > 0) {
            const ds = datasets.find(d => d._id === selectedDatasetId);
            setSelectedDataset(ds);
            if (ds && ds.columns.length > 0) {
                // Default target to last column usually
                setTargetColumn(ds.columns[ds.columns.length - 1]);
            }
        }
    }, [selectedDatasetId, datasets]);

    const fetchDatasets = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/datasets');
            setDatasets(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const selectedAlgoMeta = ALGORITHMS.find(a => a.name === selectedAlgo);

    // Fallback: compute regression metrics on the client if backend did not return them
    const computedRegression = useMemo(() => {
        if (!result || result.type !== 'regression' || !Array.isArray(result.predictions) || !Array.isArray(result.actual)) {
            return null;
        }
        const n = Math.min(result.predictions.length, result.actual.length);
        if (!n) return null;
        let mseSum = 0;
        for (let i = 0; i < n; i++) {
            const pred = Number(result.predictions[i]);
            const act = Number(result.actual[i]);
            if (Number.isFinite(pred) && Number.isFinite(act)) {
                const diff = pred - act;
                mseSum += diff * diff;
            }
        }
        const mse = mseSum / n;
        return { mse, rmse: Math.sqrt(mse) };
    }, [result]);

    const confusionData = useMemo(() => {
        if (!result || result.type !== 'classification' || !Array.isArray(result.predictions) || !Array.isArray(result.actual)) {
            return null;
        }
        const labels = Array.from(new Set([...result.actual, ...result.predictions]));
        const matrix = labels.reduce(
            (acc, a) => ({ ...acc, [a]: labels.reduce((inner, p) => ({ ...inner, [p]: 0 }), {}) }),
            {}
        );
        result.actual.forEach((a, idx) => {
            const p = result.predictions[idx];
            if (matrix[a] && matrix[a][p] !== undefined) {
                matrix[a][p] += 1;
            }
        });
        return { labels, matrix };
    }, [result]);

    const handleTrain = async () => {
        const isClustering = selectedAlgoMeta?.type === 'clustering';
        if (!selectedDatasetId || !selectedAlgo || (!targetColumn && !isClustering)) {
            setError('Please select dataset, algorithm, and target column (target optional for clustering).');
            return;
        }

        setLoading(true);
        setError('');
        setResult(null);

        try {
            const res = await axios.post('http://localhost:5000/api/ml/train', {
                datasetId: selectedDatasetId,
                algorithm: selectedAlgo,
                targetColumn,
                parameters: params
            });

            if (res.data.error) {
                setError(res.data.error);
            } else {
                setResult(res.data.results);
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-8">
            {/* Hero Header */}
            <header className="relative overflow-hidden rounded-3xl p-8 glass-panel">
                <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-secondary/20 to-accent/20 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3"></div>
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/10 border border-secondary/20 rounded-full text-secondary text-sm font-medium mb-4">
                            <Zap size={16} />
                            <span>AI Training Lab</span>
                        </div>
                        <h2 className="text-4xl font-bold mb-3 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                            Configure & Train Models
                        </h2>
                        <p className="text-gray-400 text-lg">Select your algorithm, configure parameters, and watch the magic happen.</p>
                    </div>
                    {loading && (
                        <div className="flex flex-col items-center gap-3">
                            <div className="relative w-16 h-16">
                                <div className="absolute inset-0 border-4 border-primary/20 rounded-full"></div>
                                <div className="absolute inset-0 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                            </div>
                            <span className="text-sm text-gray-400 font-medium">Training...</span>
                        </div>
                    )}
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Panel */}
                <div className="col-span-1 space-y-6">
                    {/* Dataset Selection */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Target className="text-blue-400" size={18} />
                            </div>
                            <label className="text-sm font-semibold text-gray-300">Dataset Selection</label>
                        </div>
                        
                        <div className="relative">
                            <select
                                value={selectedDatasetId}
                                onChange={(e) => setSelectedDatasetId(e.target.value)}
                                className="w-full bg-black/30 border border-white/10 rounded-xl p-4 pr-10 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none appearance-none cursor-pointer transition-all hover:bg-black/40"
                            >
                                <option value="">Choose a Dataset</option>
                                {datasets.map(ds => (
                                    <option key={ds._id} value={ds._id}>{ds.originalName}</option>
                                ))}
                            </select>
                            <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={20} />
                        </div>

                        {selectedDataset && (
                            <div className="mt-4 p-4 bg-primary/5 border border-primary/20 rounded-xl animate-slide-up">
                                <label className="text-sm font-semibold text-gray-300 mb-3 block">Target Column</label>
                                <div className="relative">
                                    <select
                                        value={targetColumn}
                                        onChange={(e) => setTargetColumn(e.target.value)}
                                        className="w-full bg-black/30 border border-primary/20 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-primary outline-none appearance-none cursor-pointer"
                                    >
                                        {selectedDataset.columns.map(col => (
                                            <option key={col} value={col}>{col}</option>
                                        ))}
                                    </select>
                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={18} />
                                </div>
                                <div className="mt-3 text-xs text-gray-500">
                                    <span className="font-medium text-primary">{selectedDataset.columns.length}</span> columns available
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Algorithm Selection */}
                    <div className="glass-panel p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <Activity className="text-purple-400" size={18} />
                            </div>
                            <label className="text-sm font-semibold text-gray-300">Algorithm</label>
                        </div>
                        
                        <div className="space-y-2 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                            {ALGORITHMS.map(alg => (
                                <button
                                    key={alg.name}
                                    onClick={() => setSelectedAlgo(alg.name)}
                                    className={`w-full text-left p-4 rounded-xl transition-all border group relative overflow-hidden ${
                                        selectedAlgo === alg.name 
                                            ? 'bg-gradient-to-r ' + alg.color + ' bg-opacity-20 border-white/30 shadow-lg' 
                                            : 'bg-black/20 border-white/5 hover:bg-white/5 hover:border-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-3 relative z-10">
                                        <span className="text-2xl">{alg.icon}</span>
                                        <div className="flex-1">
                                            <div className={`font-semibold ${selectedAlgo === alg.name ? 'text-white' : 'text-gray-300'}`}>
                                                {alg.name}
                                            </div>
                                            <div className={`text-xs mt-1 ${selectedAlgo === alg.name ? 'text-gray-200' : 'text-gray-500'}`}>
                                                {alg.desc}
                                            </div>
                                        </div>
                                        {selectedAlgo === alg.name && (
                                            <div className="p-1 bg-white/20 rounded-full">
                                                <Activity size={16} className="text-white" />
                                            </div>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Train Button */}
                    <button
                        onClick={handleTrain}
                        disabled={loading || !selectedDatasetId}
                        className="w-full group relative overflow-hidden rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-100 group-hover:opacity-90 transition-opacity"></div>
                        <div className="relative py-5 px-6 flex items-center justify-center gap-3">
                            {loading ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    <span className="font-bold text-lg">Training Model...</span>
                                </>
                            ) : (
                                <>
                                    <PlayCircle size={24} className="group-hover:scale-110 transition-transform" />
                                    <span className="font-bold text-lg">Start Training</span>
                                    <Zap size={20} className="opacity-70" />
                                </>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                    </button>
                </div>

                {/* Results Panel */}
                <div className="col-span-1 lg:col-span-2 space-y-6">
                    {/* Error Banner */}
                    {error && (
                        <div className="p-5 bg-red-500/10 border border-red-500/30 text-red-400 rounded-2xl flex items-center gap-4 animate-slide-down">
                            <div className="p-2 bg-red-500/20 rounded-full">
                                <AlertCircle size={24} />
                            </div>
                            <div className="flex-1">
                                <div className="font-semibold mb-1">Training Error</div>
                                <div className="text-sm text-red-300">{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Pre-training Placeholder */}
                    {!result && !loading && (
                        <div className="glass-panel h-[600px] flex flex-col items-center justify-center text-center p-12">
                            <div className="relative mb-6">
                                <div className="absolute inset-0 bg-gradient-to-br from-primary/30 to-secondary/30 rounded-full blur-3xl"></div>
                                <div className="relative p-8 bg-surface/50 rounded-full border border-white/10">
                                    <Settings size={64} className="text-gray-400 animate-spin-slow" />
                                </div>
                            </div>
                            <h3 className="text-2xl font-bold mb-3 text-gray-300">Ready to Train</h3>
                            <p className="text-gray-500 max-w-md">
                                Select a dataset and algorithm from the panel, then click "Start Training" to begin your ML experiment.
                            </p>
                            <div className="flex items-center gap-4 mt-8">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                    <span>Fast Training</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                                    <span>Real-time Metrics</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                                    <span>Visual Results</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Results View */}
                    {result && (
                        <div className="space-y-6 animate-fade-in">
                            {/* Success Banner */}
                            <div className="p-5 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-2xl flex items-center gap-4">
                                <div className="p-2 bg-green-500/20 rounded-full">
                                    <Award className="text-green-400" size={24} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-green-300 mb-1">Training Completed Successfully!</div>
                                    <div className="text-sm text-gray-400">Algorithm: {selectedAlgo} • Dataset: {selectedDataset?.originalName}</div>
                                </div>
                            </div>

                            {/* Model Details */}
                            <div className="glass-panel p-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <DetailItem label="Model" value={selectedAlgo} />
                                <DetailItem label="Technique" value={selectedAlgoMeta?.type === 'both' ? 'Classification / Regression' : selectedAlgoMeta?.type} />
                                <DetailItem label="Dataset" value={selectedDataset?.originalName || 'N/A'} />
                                <DetailItem label="Target Column" value={targetColumn || 'N/A'} />
                                <DetailItem label="Samples Used" value={result.actual?.length ? `${result.actual.length} test samples` : 'N/A'} />
                                <DetailItem label="Task Type" value={result.type === 'classification' ? 'Classification' : result.type === 'regression' ? 'Regression' : 'Clustering'} />
                            </div>

                            {/* Video Explainer */}
                            <VideoExplainer
                                result={result}
                                algorithm={selectedAlgo}
                                datasetName={selectedDataset?.originalName}
                            />

                            {/* Metrics Cards */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {result.type === 'classification' ? (
                                    <>
                                        <MetricCard 
                                            label="Accuracy" 
                                            value={(result.accuracy * 100).toFixed(2) + '%'} 
                                            icon={<TrendingUp size={20} />}
                                            gradient="from-blue-500 to-cyan-500"
                                        />
                                        <MetricCard 
                                            label="Precision" 
                                            value={result.precision ? (result.precision * 100).toFixed(2) + '%' : (result.report?.['weighted avg']?.precision * 100).toFixed(1) + '%'} 
                                            icon={<Target size={20} />}
                                            gradient="from-purple-500 to-pink-500"
                                        />
                                        <MetricCard 
                                            label="Recall" 
                                            value={result.recall ? (result.recall * 100).toFixed(2) + '%' : (result.report?.['weighted avg']?.recall * 100).toFixed(1) + '%'} 
                                            icon={<Activity size={20} />}
                                            gradient="from-green-500 to-emerald-500"
                                        />
                                        <MetricCard 
                                            label="F1-Score" 
                                            value={result.f1_score ? (result.f1_score * 100).toFixed(2) + '%' : (result.report?.['weighted avg']?.['f1-score'] * 100).toFixed(1) + '%'} 
                                            icon={<Award size={20} />}
                                            gradient="from-orange-500 to-red-500"
                                        />
                                    </>
                                ) : result.type === 'regression' ? (
                                    <>
                                        <MetricCard 
                                            label="MSE" 
                                            value={(result.mse ?? computedRegression?.mse)?.toFixed(4) || 'N/A'} 
                                            icon={<Activity size={20} />}
                                            gradient="from-blue-500 to-cyan-500"
                                        />
                                        <MetricCard 
                                            label="RMSE" 
                                            value={(result.rmse ?? computedRegression?.rmse)?.toFixed(4) || 'N/A'} 
                                            icon={<TrendingUp size={20} />}
                                            gradient="from-purple-500 to-pink-500"
                                        />
                                        <MetricCard 
                                            label="MAE" 
                                            value={result.mae?.toFixed(4) || 'N/A'} 
                                            icon={<Target size={20} />}
                                            gradient="from-green-500 to-emerald-500"
                                        />
                                        <MetricCard 
                                            label="R² Score" 
                                            value={result.r2_score?.toFixed(4) || 'N/A'} 
                                            icon={<Award size={20} />}
                                            gradient="from-orange-500 to-red-500"
                                        />
                                    </>
                                ) : (
                                    <>
                                        <MetricCard
                                            label="Clusters"
                                            value={result.n_clusters ?? 'N/A'}
                                            icon={<Activity size={20} />}
                                            gradient="from-blue-500 to-cyan-500"
                                        />
                                        <MetricCard
                                            label="Silhouette"
                                            value={result.silhouette ? result.silhouette.toFixed(3) : 'N/A'}
                                            icon={<TrendingUp size={20} />}
                                            gradient="from-purple-500 to-pink-500"
                                        />
                                        <MetricCard
                                            label="Preview Labels"
                                            value={(result.labels_preview || []).slice(0, 5).join(', ') || 'N/A'}
                                            icon={<Award size={20} />}
                                            gradient="from-emerald-500 to-teal-500"
                                        />
                                    </>
                                )}
                            </div>

                            <FormulaCallout type={result.type} />

                            {/* Evaluation Metrics Table */}
                            <div className="glass-panel p-6">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <TrendingUp className="text-primary" size={20} />
                                    </div>
                                    Evaluation Metrics
                                </h3>
                                <div className="overflow-x-auto">
                                    {result.type === 'classification' ? (
                                        <table className="w-full text-sm">
                                            <thead className="text-gray-400 border-b border-white/10">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Class</th>
                                                    <th className="p-3 text-left font-semibold">Precision</th>
                                                    <th className="p-3 text-left font-semibold">Recall</th>
                                                    <th className="p-3 text-left font-semibold">F1</th>
                                                    <th className="p-3 text-left font-semibold">Support</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(result.report || {})
                                                    .filter(([key]) => key !== 'accuracy')
                                                    .map(([label, metrics]) => (
                                                        <tr key={label} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                            <td className="p-3 font-medium">{label}</td>
                                                            <td className="p-3">{(metrics.precision * 100).toFixed(2)}%</td>
                                                            <td className="p-3">{(metrics.recall * 100).toFixed(2)}%</td>
                                                            <td className="p-3">{(metrics['f1-score'] * 100).toFixed(2)}%</td>
                                                            <td className="p-3">{metrics.support}</td>
                                                        </tr>
                                                    ))}
                                            </tbody>
                                        </table>
                                    ) : result.type === 'regression' ? (
                                        <table className="w-full text-sm">
                                            <thead className="text-gray-400 border-b border-white/10">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Metric</th>
                                                    <th className="p-3 text-left font-semibold">Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3 font-medium">MSE</td>
                                                    <td className="p-3">{(result.mse ?? computedRegression?.mse)?.toFixed(6) || 'N/A'}</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3 font-medium">RMSE</td>
                                                    <td className="p-3">{(result.rmse ?? computedRegression?.rmse)?.toFixed(6) || 'N/A'}</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3 font-medium">MAE</td>
                                                    <td className="p-3">{result.mae?.toFixed(6) || 'N/A'}</td>
                                                </tr>
                                                <tr className="border-b border-white/5">
                                                    <td className="p-3 font-medium">R² Score</td>
                                                    <td className="p-3 font-semibold text-green-400">{result.r2_score?.toFixed(6) || 'N/A'}</td>
                                                </tr>
                                                {Array.isArray(result.coefficients) && result.coefficients.length > 0 && (
                                                    <tr className="border-b border-white/5">
                                                        <td className="p-3 font-medium">Coefficients</td>
                                                        <td className="p-3 text-xs text-gray-300">{result.coefficients.slice(0, 10).map(c => c.toFixed(4)).join(', ')}{result.coefficients.length > 10 ? '...' : ''}</td>
                                                    </tr>
                                                )}
                                                {result.intercept !== undefined && (
                                                    <tr className="border-b border-white/5">
                                                        <td className="p-3 font-medium">Intercept</td>
                                                        <td className="p-3">{Number(result.intercept).toFixed(4)}</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <table className="w-full text-sm">
                                            <thead className="text-gray-400 border-b border-white/10">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Cluster</th>
                                                    <th className="p-3 text-left font-semibold">Count</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {Object.entries(result.cluster_counts || {}).map(([cluster, count]) => (
                                                    <tr key={cluster} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                        <td className="p-3 font-medium">{cluster}</td>
                                                        <td className="p-3">{count}</td>
                                                    </tr>
                                                ))}
                                                {(!result.cluster_counts || Object.keys(result.cluster_counts).length === 0) && (
                                                    <tr>
                                                        <td className="p-3" colSpan={2}>No cluster counts available.</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    )}
                                </div>
                            </div>

                            {/* Visualizations */}
                            <div className="glass-panel p-6">
                                <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Activity className="text-primary" size={20} />
                                    </div>
                                    Visualizations
                                </h3>
                                {result.type === 'classification' && confusionData ? (
                                    <div className="space-y-4">
                                        <div className="text-sm text-gray-400">Confusion matrix (counts)</div>
                                        <div className="overflow-auto">
                                            <table className="text-sm min-w-[320px]">
                                                <thead>
                                                    <tr>
                                                        <th className="p-2 text-left text-gray-400">Actual \ Pred</th>
                                                        {confusionData.labels.map(lbl => (
                                                            <th key={lbl} className="p-2 text-center text-gray-300">{lbl}</th>
                                                        ))}
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {confusionData.labels.map(actual => (
                                                        <tr key={actual}>
                                                            <td className="p-2 font-semibold text-gray-200">{actual}</td>
                                                            {confusionData.labels.map(pred => {
                                                                const val = confusionData.matrix[actual]?.[pred] ?? 0;
                                                                return (
                                                                    <td
                                                                        key={pred}
                                                                        className="p-2 text-center"
                                                                        style={{ backgroundColor: `rgba(99, 102, 241, ${Math.min(val / 5, 0.8)})` }}
                                                                    >
                                                                        {val}
                                                                    </td>
                                                                );
                                                            })}
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : result.type === 'regression' ? (
                                    <div className="h-72">
                                        <ResponsiveContainer>
                                            <LineChart data={(result.predictions || []).slice(0, 100).map((p, idx) => ({
                                                idx,
                                                pred: Number(p),
                                                actual: Number(result.actual?.[idx])
                                            }))}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                                <XAxis dataKey="idx" stroke="#9ca3af" />
                                                <YAxis stroke="#9ca3af" />
                                                <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }} />
                                                <Legend />
                                                <Line type="monotone" dataKey="actual" stroke="#34d399" dot={false} name="Actual" />
                                                <Line type="monotone" dataKey="pred" stroke="#60a5fa" dot={false} name="Predicted" />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="h-72">
                                        {result.cluster_counts && Object.keys(result.cluster_counts).length > 0 ? (
                                            <ResponsiveContainer>
                                                <BarChart data={Object.entries(result.cluster_counts).map(([cluster, count]) => ({ cluster, count }))}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                                                    <XAxis dataKey="cluster" stroke="#9ca3af" />
                                                    <YAxis stroke="#9ca3af" />
                                                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1f2937' }} />
                                                    <Legend />
                                                    <Bar dataKey="count" fill="#60a5fa" name="Count" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="text-gray-500">No cluster counts available to visualize.</div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Predictions Table */}
                            {result.type !== 'clustering' && (
                                <div className="glass-panel p-6">
                                    <h3 className="font-bold text-xl mb-4 flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Target className="text-primary" size={20} />
                                        </div>
                                        Prediction Sample
                                    </h3>
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm">
                                            <thead className="text-gray-400 border-b border-white/10">
                                                <tr>
                                                    <th className="p-3 text-left font-semibold">Index</th>
                                                    <th className="p-3 text-left font-semibold">Actual</th>
                                                    <th className="p-3 text-left font-semibold">Predicted</th>
                                                    <th className="p-3 text-center font-semibold">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {result.predictions?.slice(0, 10).map((pred, idx) => {
                                                    const actual = result.actual[idx];
                                                    const isMatch = pred == actual;
                                                    const diff = typeof pred === 'number' ? Math.abs(pred - actual) : 0;
                                                    const status = result.type === 'classification'
                                                        ? (isMatch ? '✅' : '❌')
                                                        : (diff < 0.5 ? '✅' : '⚠️');

                                                    return (
                                                        <tr key={idx} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                                                            <td className="p-3 text-gray-400">#{idx + 1}</td>
                                                            <td className="p-3 font-medium">{String(actual)}</td>
                                                            <td className="p-3 font-medium text-primary">
                                                                {typeof pred === 'number' ? pred.toFixed(2) : String(pred)}
                                                            </td>
                                                            <td className="p-3 text-center text-lg">{status}</td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const MetricCard = ({ label, value, icon, gradient }) => (
    <div className="glass-panel-hover p-5 group cursor-pointer">
        <div className={`inline-flex p-2 bg-gradient-to-br ${gradient} bg-opacity-10 rounded-lg mb-3 group-hover:scale-110 transition-transform`}>
            {icon}
        </div>
        <div className="text-gray-400 text-xs uppercase tracking-wider mb-2 font-semibold">{label}</div>
        <div className={`text-3xl font-bold bg-gradient-to-br ${gradient} bg-clip-text text-transparent`}>
            {value}
        </div>
    </div>
);

const DetailItem = ({ label, value }) => (
    <div className="space-y-1">
        <div className="text-xs uppercase tracking-wide text-gray-500">{label}</div>
        <div className="text-sm font-semibold text-white truncate">{value}</div>
    </div>
);

const FormulaCallout = ({ type }) => {
    const formulas = type === 'classification'
        ? [
            'Accuracy = (TP + TN) / (TP + TN + FP + FN)',
            'Precision = TP / (TP + FP)',
            'Recall = TP / (TP + FN)',
            'F1 = 2 * (Precision * Recall) / (Precision + Recall)'
        ]
        : type === 'regression'
        ? [
            'MSE = (1/n) * Σ(ŷ - y)²',
            'RMSE = sqrt(MSE)',
            'MAE = (1/n) * Σ|ŷ - y|',
            'R² = 1 - (Σ(ŷ - y)² / Σ(ȳ - y)²)'
        ]
        : [
            'Silhouette = (b - a) / max(a, b)',
            'a = average intra-cluster distance',
            'b = minimum average distance to other clusters'
        ];

    return (
        <div className="glass-panel p-4 border border-white/10">
            <div className="text-sm font-semibold text-gray-300 mb-2">Metric formulas</div>
            <ul className="space-y-1 text-sm text-gray-400 list-disc list-inside">
                {formulas.map((f, idx) => (
                    <li key={idx}>{f}</li>
                ))}
            </ul>
        </div>
    );
};

export default TrainingPage;
