import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, RefreshCw, BarChart2, TrendingUp, Zap, GitBranch, Users, Dice6, Grid3x3, ScatterChart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const algorithmWorkflows = {
    'Linear Regression': [
        { title: 'Initialize Model', description: 'Initialize coefficients to zero', icon: 'init' },
        { title: 'Calculate Loss', description: 'Compute Mean Squared Error (MSE) loss function', icon: 'loss' },
        { title: 'Compute Gradients', description: 'Calculate partial derivatives for each feature', icon: 'gradient' },
        { title: 'Update Weights', description: 'Adjust coefficients using gradient descent', icon: 'weights' },
        { title: 'Iterate', description: 'Repeat until convergence or max iterations reached', icon: 'loop' },
        { title: 'Predict', description: 'Apply learned linear equation: y = mx + b', icon: 'predict' },
        { title: 'Evaluate', description: 'Calculate RMSE on test set', icon: 'evaluate' }
    ],
    'Logistic Regression': [
        { title: 'Initialize Weights', description: 'Start with random weights close to zero', icon: 'init' },
        { title: 'Apply Sigmoid', description: 'Transform linear output using sigmoid: 1/(1+e^-x)', icon: 'sigmoid' },
        { title: 'Calculate Loss', description: 'Use binary cross-entropy loss function', icon: 'loss' },
        { title: 'Backpropagation', description: 'Compute gradients using chain rule', icon: 'gradient' },
        { title: 'Update Parameters', description: 'Optimize weights via gradient descent', icon: 'weights' },
        { title: 'Probability Threshold', description: 'Classify based on 0.5 probability threshold', icon: 'threshold' },
        { title: 'Evaluate', description: 'Calculate accuracy and confusion matrix', icon: 'evaluate' }
    ],
    'Decision Tree': [
        { title: 'Root Node', description: 'Select best feature with highest information gain', icon: 'root' },
        { title: 'Split Data', description: 'Partition data based on feature threshold', icon: 'split' },
        { title: 'Child Nodes', description: 'Recursively create nodes for subsets', icon: 'tree' },
        { title: 'Stop Condition', description: 'Stop when max depth/samples reached or pure', icon: 'stop' },
        { title: 'Leaf Creation', description: 'Assign class label to leaf nodes', icon: 'leaf' },
        { title: 'Predictions', description: 'Follow tree path from root to leaf', icon: 'predict' },
        { title: 'Evaluate', description: 'Measure accuracy on test data', icon: 'evaluate' }
    ],
    'Random Forest': [
        { title: 'Bootstrap Samples', description: 'Create multiple random samples with replacement', icon: 'boot' },
        { title: 'Grow Trees', description: 'Build decision trees for each bootstrap sample', icon: 'tree' },
        { title: 'Feature Randomness', description: 'Randomly select features at each split', icon: 'random' },
        { title: 'Ensemble Creation', description: 'Combine multiple independent trees', icon: 'ensemble' },
        { title: 'Vote/Average', description: 'Aggregate predictions from all trees', icon: 'aggregate' },
        { title: 'Final Prediction', description: 'Output majority class (classification) or mean (regression)', icon: 'predict' },
        { title: 'Evaluate', description: 'Calculate out-of-bag (OOB) error metrics', icon: 'evaluate' }
    ],
    'SVM': [
        { title: 'Feature Scaling', description: 'Normalize features to same scale', icon: 'scale' },
        { title: 'Kernel Selection', description: 'Choose kernel (linear, RBF, polynomial, sigmoid)', icon: 'kernel' },
        { title: 'Margin Calculation', description: 'Find maximum margin between classes', icon: 'margin' },
        { title: 'Support Vectors', description: 'Identify critical data points near boundary', icon: 'vectors' },
        { title: 'Hyperplane', description: 'Determine optimal separating hyperplane', icon: 'plane' },
        { title: 'Predictions', description: 'Classify based on side of hyperplane', icon: 'predict' },
        { title: 'Evaluate', description: 'Measure accuracy and margins', icon: 'evaluate' }
    ],
    'Naive Bayes': [
        { title: 'Calculate Prior', description: 'Compute P(Class) for each class', icon: 'prior' },
        { title: 'Class Features', description: 'For each class, calculate feature probability', icon: 'feature' },
        { title: 'Apply Bayes', description: 'Use Bayes theorem: P(A|B) = P(B|A)*P(A)/P(B)', icon: 'bayes' },
        { title: 'Conditional Independence', description: 'Assume features are conditionally independent', icon: 'indep' },
        { title: 'Compute Likelihood', description: 'Calculate probability for each class given features', icon: 'likelihood' },
        { title: 'Select Maximum', description: 'Choose class with highest posterior probability', icon: 'predict' },
        { title: 'Evaluate', description: 'Calculate accuracy and classification metrics', icon: 'evaluate' }
    ],
    'KNN': [
        { title: 'Distance Metric', description: 'Choose distance metric (Euclidean, Manhattan, etc.)', icon: 'distance' },
        { title: 'K Value', description: 'Select number of nearest neighbors (K)', icon: 'kvalue' },
        { title: 'Compute Distances', description: 'Calculate distance from test point to all training points', icon: 'calc' },
        { title: 'Find Neighbors', description: 'Identify K nearest points in feature space', icon: 'neighbors' },
        { title: 'Majority Vote', description: 'Count class labels of K neighbors', icon: 'vote' },
        { title: 'Prediction', description: 'Output most common class among neighbors', icon: 'predict' },
        { title: 'Evaluate', description: 'Measure accuracy and neighbors effectiveness', icon: 'evaluate' }
    ],
    'K-Means Clustering': [
        { title: 'Initialize Centroids', description: 'Randomly place K cluster centers in feature space', icon: 'init' },
        { title: 'Assign Points', description: 'Assign each data point to nearest centroid', icon: 'assign' },
        { title: 'Compute Centers', description: 'Calculate mean of all points in each cluster', icon: 'calc' },
        { title: 'Update Centroids', description: 'Move centroids to computed cluster means', icon: 'update' },
        { title: 'Check Convergence', description: 'Stop if centroids no longer move significantly', icon: 'check' },
        { title: 'Repeat', description: 'Iterate assign-update cycle until convergence', icon: 'loop' },
        { title: 'Evaluate', description: 'Calculate silhouette score and cluster quality', icon: 'evaluate' }
    ],
    'DBSCAN': [
        { title: 'Set Parameters', description: 'Choose epsilon (radius) and min_samples', icon: 'init' },
        { title: 'Find Core Points', description: 'Identify points with ≥ min_samples in epsilon radius', icon: 'core' },
        { title: 'Form Clusters', description: 'Connect core points within epsilon distance', icon: 'connect' },
        { title: 'Add Border Points', description: 'Include non-core points near clusters', icon: 'border' },
        { title: 'Mark Noise', description: 'Label outliers as noise (cluster -1)', icon: 'noise' },
        { title: 'Density Check', description: 'Validate cluster density meets threshold', icon: 'check' },
        { title: 'Evaluate', description: 'Calculate silhouette excluding noise points', icon: 'evaluate' }
    ],
    'Agglomerative Clustering': [
        { title: 'Start Individual', description: 'Treat each point as its own cluster', icon: 'init' },
        { title: 'Compute Distances', description: 'Calculate pairwise distances between all clusters', icon: 'calc' },
        { title: 'Find Closest Pair', description: 'Identify two closest clusters to merge', icon: 'closest' },
        { title: 'Merge Clusters', description: 'Combine closest pair into single cluster', icon: 'merge' },
        { title: 'Update Distances', description: 'Recalculate distances for merged cluster', icon: 'update' },
        { title: 'Build Dendrogram', description: 'Create hierarchical tree of merges', icon: 'tree' },
        { title: 'Cut Tree', description: 'Slice dendrogram at desired cluster count', icon: 'evaluate' }
    ]
};

const VideoExplainer = ({ result, algorithm, datasetName }) => {
    const [isPlaying, setIsPlaying] = useState(false);
    const [step, setStep] = useState(0);
    const [totalSteps, setTotalSteps] = useState(0);
    const containerRef = useRef(null);
    const workflowSteps = algorithmWorkflows[algorithm] || [];

    useEffect(() => {
        if (!result) return;
        setTotalSteps(workflowSteps.length);
        setStep(0);
        setIsPlaying(true);
    }, [result, algorithm, workflowSteps]);

    useEffect(() => {
        let interval;
        if (isPlaying && step < totalSteps - 1) {
            interval = setInterval(() => {
                setStep(s => s + 1);
            }, 3000); // 3 seconds per step
        } else if (step >= totalSteps - 1) {
            setIsPlaying(false);
        }
        return () => clearInterval(interval);
    }, [isPlaying, step, totalSteps]);

    if (!result) return null;

    const currentStepData = workflowSteps[step] || {};

    const getVisualizationElement = (icon) => {
        switch(icon) {
            // Linear Regression
            case 'init': return <InitIcon />;
            case 'loss': return <LossIcon />;
            case 'gradient': return <GradientIcon />;
            case 'weights': return <WeightsIcon />;
            case 'loop': return <LoopIcon />;
            // Logistic Regression
            case 'sigmoid': return <SigmoidIcon />;
            case 'threshold': return <ThresholdIcon />;
            // Decision Tree
            case 'root': return <RootIcon />;
            case 'split': return <SplitIcon />;
            case 'tree': return <TreeIcon />;
            case 'stop': return <StopIcon />;
            case 'leaf': return <LeafIcon />;
            // Random Forest
            case 'boot': return <BootstrapIcon />;
            case 'random': return <RandomIcon />;
            case 'ensemble': return <EnsembleIcon />;
            case 'aggregate': return <AggregateIcon />;
            // SVM
            case 'scale': return <ScaleIcon />;
            case 'kernel': return <KernelIcon />;
            case 'margin': return <MarginIcon />;
            case 'vectors': return <VectorsIcon />;
            case 'plane': return <PlaneIcon />;
            // Naive Bayes
            case 'prior': return <PriorIcon />;
            case 'feature': return <FeatureIcon />;
            case 'bayes': return <BayesIcon />;
            case 'indep': return <IndepIcon />;
            case 'likelihood': return <LikelihoodIcon />;
            // KNN
            case 'distance': return <DistanceIcon />;
            case 'kvalue': return <KValueIcon />;
            case 'calc': return <CalcIcon />;
            case 'neighbors': return <NeighborsIcon />;
            case 'vote': return <VoteIcon />;
            // Common
            case 'predict': return <PredictIcon />;
            case 'evaluate': return <EvaluateIcon />;
            // Clustering
            case 'assign': return <AssignIcon />;
            case 'update': return <UpdateIcon />;
            case 'check': return <CheckIcon />;
            case 'core': return <CoreIcon />;
            case 'connect': return <ConnectIcon />;
            case 'border': return <BorderIcon />;
            case 'noise': return <NoiseIcon />;
            case 'closest': return <ClosestIcon />;
            case 'merge': return <MergeIcon />;
            default: return <BarChart2 size={64} />;
        }
    };

    return (
        <div className="glass-panel w-full p-8 mt-8 border-t-4 border-accent relative overflow-hidden">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-2xl font-bold flex items-center gap-2 mb-2">
                        <span className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                        Algorithm Workflow
                    </h3>
                    <p className="text-sm text-gray-400">{algorithm} - Step-by-Step Visualization</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10 hover:border-primary/50"
                    >
                        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                    </button>
                    <button
                        onClick={() => { setStep(0); setIsPlaying(true); }}
                        className="p-3 hover:bg-white/10 rounded-full transition-colors border border-white/10 hover:border-primary/50"
                    >
                        <RefreshCw size={20} />
                    </button>
                </div>
            </div>

            {/* Main Visualization Stage */}
            <div className="h-80 bg-gradient-to-br from-black/60 to-black/40 rounded-2xl mb-6 relative flex items-center justify-center border border-white/10 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5 opacity-50"></div>
                
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: -20 }}
                        transition={{ duration: 0.5 }}
                        className="text-center p-8 relative z-10"
                    >
                        <div className="mb-6 flex justify-center text-primary animate-float">
                            {getVisualizationElement(currentStepData.icon)}
                        </div>
                        <h4 className="text-2xl font-bold mb-3 text-white">{currentStepData.title}</h4>
                        <p className="text-gray-300 text-lg max-w-2xl">{currentStepData.description}</p>
                    </motion.div>
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-primary to-accent transition-all duration-300" style={{ width: `${((step + 1) / totalSteps) * 100}%` }} />
            </div>

            {/* Step Indicators */}
            <div className="mb-6">
                <div className="flex justify-between mb-3">
                    <span className="text-sm font-semibold text-gray-300">Step {step + 1} / {totalSteps}</span>
                    <span className="text-sm font-semibold text-primary">{Math.round(((step + 1) / totalSteps) * 100)}%</span>
                </div>
                
                {/* Visual Step Timeline */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {workflowSteps.map((s, idx) => (
                        <motion.button
                            key={idx}
                            onClick={() => { setStep(idx); setIsPlaying(false); }}
                            className={`flex-shrink-0 px-4 py-2 rounded-lg font-medium text-sm transition-all whitespace-nowrap border ${
                                idx === step 
                                    ? 'bg-gradient-to-r from-primary to-accent text-white border-accent shadow-lg' 
                                    : idx < step
                                    ? 'bg-green-500/20 text-green-400 border-green-500/30'
                                    : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {s.title}
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Additional Info Box */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="glass-panel p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Algorithm</div>
                    <div className="font-semibold text-white">{algorithm}</div>
                </div>
                <div className="glass-panel p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Type</div>
                    <div className="font-semibold text-white capitalize">{result.type}</div>
                </div>
                <div className="glass-panel p-4 rounded-lg">
                    <div className="text-xs text-gray-500 mb-1">Performance</div>
                    <div className="font-semibold text-green-400">
                        {result.type === 'classification' 
                            ? `${(result.accuracy * 100).toFixed(1)}%` 
                            : result.type === 'regression'
                            ? `RMSE: ${result.rmse?.toFixed(4)}`
                            : result.silhouette !== null && result.silhouette !== undefined
                            ? `Silhouette: ${result.silhouette.toFixed(3)}`
                            : `${result.n_clusters || 0} clusters`}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Icon Components for Each Step
const InitIcon = () => <Zap size={64} className="text-blue-400" />;
const LossIcon = () => <TrendingUp size={64} className="text-orange-400" />;
const GradientIcon = () => <Grid3x3 size={64} className="text-purple-400" />;
const WeightsIcon = () => <Zap size={64} className="text-cyan-400" />;
const LoopIcon = () => <div className="text-6xl">🔄</div>;
const SigmoidIcon = () => <div className="text-6xl">⟿</div>;
const ThresholdIcon = () => <div className="text-6xl">🎯</div>;
const RootIcon = () => <div className="text-6xl">🌳</div>;
const SplitIcon = () => <GitBranch size={64} className="text-green-400" />;
const TreeIcon = () => <div className="text-6xl">🌲</div>;
const StopIcon = () => <div className="text-6xl">⛔</div>;
const LeafIcon = () => <div className="text-6xl">🍃</div>;
const BootstrapIcon = () => <div className="text-6xl">🎲</div>;
const RandomIcon = () => <div className="text-6xl">🎰</div>;
const EnsembleIcon = () => <Users size={64} className="text-indigo-400" />;
const AggregateIcon = () => <div className="text-6xl">📊</div>;
const ScaleIcon = () => <div className="text-6xl">📏</div>;
const KernelIcon = () => <div className="text-6xl">⚙️</div>;
const MarginIcon = () => <div className="text-6xl">📐</div>;
const VectorsIcon = () => <div className="text-6xl">➡️</div>;
const PlaneIcon = () => <div className="text-6xl">✈️</div>;
const PriorIcon = () => <div className="text-6xl">📊</div>;
const FeatureIcon = () => <div className="text-6xl">🔍</div>;
const BayesIcon = () => <div className="text-6xl">🧮</div>;
const IndepIcon = () => <div className="text-6xl">🔗</div>;
const LikelihoodIcon = () => <div className="text-6xl">📈</div>;
const DistanceIcon = () => <div className="text-6xl">📏</div>;
const KValueIcon = () => <Dice6 size={64} className="text-pink-400" />;
const CalcIcon = () => <div className="text-6xl">🧮</div>;
const NeighborsIcon = () => <Users size={64} className="text-teal-400" />;
const VoteIcon = () => <div className="text-6xl">🗳️</div>;
const PredictIcon = () => <TrendingUp size={64} className="text-green-400" />;
const EvaluateIcon = () => <BarChart2 size={64} className="text-yellow-400" />;

// Clustering Icons
const AssignIcon = () => <div className="text-6xl">🎯</div>;
const UpdateIcon = () => <div className="text-6xl">🔄</div>;
const CheckIcon = () => <div className="text-6xl">✅</div>;
const CoreIcon = () => <div className="text-6xl">⭐</div>;
const ConnectIcon = () => <div className="text-6xl">🔗</div>;
const BorderIcon = () => <div className="text-6xl">🔵</div>;
const NoiseIcon = () => <div className="text-6xl">❌</div>;
const ClosestIcon = () => <div className="text-6xl">🔍</div>;
const MergeIcon = () => <div className="text-6xl">🔗</div>;

export default VideoExplainer;
