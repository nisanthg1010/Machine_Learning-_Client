import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, BrainCircuit, Sparkles, Zap, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="fixed top-0 left-0 h-full w-72 bg-surface/80 backdrop-blur-2xl border-r border-white/10 p-6 flex flex-col shadow-2xl">
            {/* Logo Section */}
            <div className="flex items-center gap-3 mb-12 px-2 group cursor-pointer">
                <div className="relative h-12 w-12">
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary to-accent blur-xl opacity-60 group-hover:opacity-80 transition-opacity"></div>
                    <div className="absolute inset-0 rounded-2xl border-2 border-primary/40 animate-[spin_8s_linear_infinite]" aria-hidden="true"></div>
                    <div className="relative h-full w-full rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center font-extrabold text-white tracking-tight shadow-lg">
                        IN
                    </div>
                </div>
                <div className="leading-tight">
                    <h1 className="text-2xl font-bold gradient-text">Innoviative</h1>
                    <p className="text-xs text-gray-500">ML Studio · Intelligent Learning</p>
                </div>
            </div>

            {/* Navigation Links */}
            <div className="space-y-3 flex-1">
                <NavLink
                    to="/"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                            isActive 
                                ? 'bg-gradient-to-r from-primary/20 to-secondary/20 text-white border border-primary/30 shadow-lg shadow-primary/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-secondary/10 animate-pulse"></div>
                            )}
                            <div className={`relative z-10 p-2 rounded-lg transition-all ${
                                isActive ? 'bg-primary/20 text-primary' : 'bg-surface/50 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                            }`}>
                                <LayoutDashboard size={20} />
                            </div>
                            <div className="relative z-10 flex-1">
                                <span className="font-semibold">Dashboard</span>
                                {isActive && <Zap className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-accent animate-pulse" />}
                            </div>
                        </>
                    )}
                </NavLink>

                <NavLink
                    to="/train"
                    className={({ isActive }) =>
                        `group flex items-center gap-4 px-5 py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                            isActive 
                                ? 'bg-gradient-to-r from-secondary/20 to-accent/20 text-white border border-secondary/30 shadow-lg shadow-secondary/20' 
                                : 'text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10 border border-transparent'
                        }`
                    }
                >
                    {({ isActive }) => (
                        <>
                            {isActive && (
                                <div className="absolute inset-0 bg-gradient-to-r from-secondary/10 to-accent/10 animate-pulse"></div>
                            )}
                            <div className={`relative z-10 p-2 rounded-lg transition-all ${
                                isActive ? 'bg-secondary/20 text-secondary' : 'bg-surface/50 text-gray-400 group-hover:bg-white/10 group-hover:text-white'
                            }`}>
                                <BrainCircuit size={20} />
                            </div>
                            <div className="relative z-10 flex-1">
                                <span className="font-semibold">Training Lab</span>
                                {isActive && <Zap className="absolute -right-2 top-1/2 -translate-y-1/2 h-4 w-4 text-accent animate-pulse" />}
                            </div>
                        </>
                    )}
                </NavLink>
            </div>

            {/* Footer */}
            <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                {/* User Info */}
                <div className="glass-panel p-4">
                    <div className="text-xs text-gray-400 mb-1">Signed in as</div>
                    <div className="font-medium text-white truncate">{user?.name || user?.email}</div>
                    <div className="text-xs text-gray-500 truncate">{user?.email}</div>
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full py-3 px-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all flex items-center justify-center gap-2 font-semibold"
                >
                    <LogOut size={18} />
                    Logout
                </button>
            </div>
        </nav>
    );
};

export default Navbar;
