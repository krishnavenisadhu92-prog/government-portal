import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  Search,
  Bell,
  User,
  Sparkles,
  FileCheck2,
  Bookmark,
  Briefcase,
  Layers,
  Menu,
  X,
  ExternalLink,
  ChevronDown,
  Lock,
  LogOut,
  Settings,
  GraduationCap,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    user,
    isAuthenticated,
    activeTab,
    setActiveTab,
    unreadNotificationCount,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    setIsAuthModalOpen,
    setIsProfileWizardOpen,
    logout,
    setSelectedJobForDetail,
    opportunities,
  } = useApp();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'ap-jobs', label: 'Andhra Pradesh' },
    { id: 'central-jobs', label: 'Central Govt' },
    { id: 'cybersecurity', label: 'Cybersecurity & IT' },
    { id: 'internships', label: 'Internships' },
    { id: 'women', label: 'Women Opportunities' },
    { id: 'search', label: 'Search & Filters' },
    { id: 'dashboard', label: 'Dashboard & Tracker' },
    { id: 'certificates', label: 'Certificates & OCR' },
    { id: 'assistant', label: 'AI Chatbot 🤖', highlight: true },
  ];

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-md">
      {/* Top micro-bar: Government portal advisory & language switch */}
      <div className="bg-slate-950/80 px-4 py-1 text-xs border-b border-slate-800/80 text-slate-300">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-medium text-slate-200">GovtJob AI Official Gateway</span>
            <span className="hidden md:inline text-slate-400">• Verified Gazettes & Recruitment Feeds</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-300">
            <span className="hidden sm:inline bg-slate-800 px-2 py-0.5 rounded border border-slate-700 text-amber-300">
              🇮🇳 Andhra Pradesh & Central India Portal
            </span>
            <button
              onClick={() => handleNavClick('admin')}
              className="hover:text-amber-400 flex items-center gap-1 transition-colors"
            >
              <Lock className="w-3 h-3" /> Admin
            </button>
          </div>
        </div>
      </div>

      {/* Main navigation header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Emblems */}
          <div
            onClick={() => handleNavClick('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-600 to-amber-500 flex items-center justify-center shadow-lg shadow-indigo-900/30 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6 text-white" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-400 rounded-full border-2 border-slate-900" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl font-bold tracking-tight text-white font-sans">
                  GovtJob <span className="text-amber-400">AI</span>
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700/60">
                  National
                </span>
              </div>
              <p className="text-[11px] text-slate-400 -mt-0.5 tracking-tight hidden sm:block">
                All-in-One Career & Internship Discovery
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`px-3 py-1.5 rounded-lg transition-all duration-150 flex items-center gap-1.5 ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-sm font-semibold'
                      : item.highlight
                      ? 'bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 border border-amber-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {item.highlight && <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions: Search trigger, Notifications, User profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Quick Search Button */}
            <button
              onClick={() => handleNavClick('search')}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Search Vacancies & Internships"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                title="Notifications & Alerts"
              >
                <Bell className="w-5 h-5" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-bounce">
                    {unreadNotificationCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200">
                  <div className="px-4 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-amber-400" />
                      <span className="font-semibold text-sm">Recruitment Alerts</span>
                      <span className="text-xs bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">
                        {notifications.length}
                      </span>
                    </div>
                    {unreadNotificationCount > 0 && (
                      <button
                        onClick={markAllNotificationsAsRead}
                        className="text-xs text-blue-400 hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-slate-400 text-xs">No alerts at this moment.</div>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationAsRead(notif.id);
                            if (notif.linkJobId) {
                              const job = opportunities.find((j) => j.id === notif.linkJobId);
                              if (job) {
                                setSelectedJobForDetail(job);
                              }
                            }
                            setIsNotifOpen(false);
                          }}
                          className={`p-3 text-xs hover:bg-slate-800/80 cursor-pointer transition-colors ${
                            !notif.read ? 'bg-blue-950/30' : ''
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <span className="font-medium text-slate-100">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 whitespace-nowrap">{notif.date}</span>
                          </div>
                          <p className="text-slate-400 mt-1 line-clamp-2">{notif.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* User profile dropdown or Sign-in button */}
            {isAuthenticated && user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-amber-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs">
                    {user.fullName ? user.fullName.charAt(0) : 'U'}
                  </div>
                  <span className="text-xs font-semibold hidden md:inline truncate max-w-[120px]">
                    {user.fullName.split(' ')[0]}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:inline" />
                </button>

                {isProfileDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl z-50 overflow-hidden text-slate-200">
                    <div className="px-4 py-3 bg-slate-950 border-b border-slate-800">
                      <p className="text-xs font-semibold text-white">{user.fullName}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5 text-[10px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        {user.educationLevel} • {user.state}
                      </div>
                    </div>
                    <div className="py-1 text-xs">
                      <button
                        onClick={() => {
                          setIsProfileWizardOpen(true);
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <User className="w-4 h-4 text-blue-400" /> Edit Complete Profile
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('certificates');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <FileCheck2 className="w-4 h-4 text-amber-400" /> My Document Vault
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('dashboard');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Bookmark className="w-4 h-4 text-purple-400" /> Application Tracker
                      </button>
                      <button
                        onClick={() => {
                          handleNavClick('settings');
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-slate-800 flex items-center gap-2 text-slate-300 hover:text-white"
                      >
                        <Settings className="w-4 h-4 text-slate-400" /> Account & Privacy
                      </button>
                      <div className="border-t border-slate-800 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setIsProfileDropdownOpen(false);
                        }}
                        className="w-full px-4 py-2 text-left hover:bg-red-950/40 text-red-400 hover:text-red-300 flex items-center gap-2"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md transition-colors flex items-center gap-1.5"
              >
                <User className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-slate-900 border-b border-slate-800 px-4 pt-2 pb-6 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-between ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white font-semibold'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.label}</span>
              {item.highlight && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  AI Powered
                </span>
              )}
            </button>
          ))}
          <div className="pt-2 border-t border-slate-800">
            <button
              onClick={() => handleNavClick('admin')}
              className="w-full text-left px-3 py-2 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-800 flex items-center gap-2"
            >
              <Lock className="w-4 h-4 text-amber-400" /> Admin Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
