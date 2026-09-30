import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ShieldCheck, Cpu, History, MessageSquare, LogOut, UploadCloud, User as UserIcon } from 'lucide-react';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Snapdragon Badge */}
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-tr from-red-600 to-rose-500 flex items-center justify-center shadow-lg shadow-red-500/20">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">Trust<span className="text-red-500">Lens</span></span>
              </div>
            </Link>

            <div className="hidden md:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-red-950/60 border border-red-800/50 text-[11px] font-semibold text-red-300">
              <Cpu className="w-3.5 h-3.5 text-red-400" />
              <span>Qualcomm Snapdragon NPU Ready</span>
            </div>
          </div>

          {/* Nav Links */}
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/dashboard') ? 'bg-red-600/10 text-red-400 border border-red-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>Scan</span>
                </Link>

                <Link
                  to="/history"
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/history') ? 'bg-red-600/10 text-red-400 border border-red-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <History className="w-4 h-4" />
                  <span>History</span>
                </Link>

                <Link
                  to="/chat"
                  className={`flex items-center space-x-1 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive('/chat') ? 'bg-red-600/10 text-red-400 border border-red-500/20' : 'text-gray-300 hover:text-white hover:bg-gray-800'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>AI Analyst</span>
                </Link>

                <div className="h-5 w-px bg-gray-800 my-auto"></div>

                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs text-gray-400 bg-gray-900 border border-gray-800 px-2.5 py-1 rounded-md">
                    <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                    <span className="font-medium text-gray-200">{user?.name}</span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 px-2.5 py-1.5 rounded-md text-xs font-medium text-gray-400 hover:text-red-400 hover:bg-red-950/30 transition-colors"
                    title="Sign out"
                  >
                    <LogOut className="w-4 h-4" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/login"
                  className="px-3 py-1.5 rounded-md text-sm font-medium text-gray-300 hover:text-white transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-1.5 rounded-md text-sm font-medium bg-red-600 hover:bg-red-500 text-white transition-all shadow-md shadow-red-600/20"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
