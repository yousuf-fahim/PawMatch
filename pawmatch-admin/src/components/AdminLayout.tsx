'use client';

import { ReactNode, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { 
  LayoutDashboard, 
  PawPrint, 
  FileText, 
  Store, 
  Home, 
  Menu, 
  LogOut, 
  User, 
  Settings,
  HeartPulse,
  ChevronDown
} from 'lucide-react';

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const { user, signOut, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleSignOut = async () => {
    await signOut();
  };

  const navItems = [
    { title: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
    { title: 'Pets', path: '/pets', icon: <PawPrint className="w-5 h-5" /> },
    { title: 'Services', path: '/services', icon: <HeartPulse className="w-5 h-5" /> },
    { title: 'Articles', path: '/content/articles', icon: <FileText className="w-5 h-5" /> },
    { title: 'Shelters', path: '/shelters', icon: <Store className="w-5 h-5" /> },
    { title: 'Users', path: '/users', icon: <User className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Mobile sidebar backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 z-20 bg-gray-800 bg-opacity-50 lg:hidden"
          onClick={handleDrawerToggle}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-30 w-64 transform bg-white border-r border-gray-200 transition duration-300 lg:translate-x-0 lg:static lg:inset-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-center h-16 px-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-indigo-600">PawMatch Admin</h1>
        </div>
        
        <div className="px-3 py-4">
          <nav className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.path;
              return (
                <Link 
                  key={item.path} 
                  href={item.path}
                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-md ${
                    isActive 
                      ? 'bg-indigo-50 text-indigo-600' 
                      : 'text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  <span className={`mr-3 ${isActive ? 'text-indigo-600' : 'text-gray-500'}`}>
                    {item.icon}
                  </span>
                  {item.title}
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-gray-200">
              <Link 
                href="/"
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100"
              >
                <Home className="w-5 h-5 mr-3 text-gray-500" />
                View App
              </Link>
            </div>
          </nav>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navbar */}
        <header className="z-10 flex items-center justify-between h-16 px-4 bg-white border-b border-gray-200 sm:px-6">
          <button
            className="text-gray-500 lg:hidden"
            onClick={handleDrawerToggle}
          >
            <Menu className="w-6 h-6" />
          </button>

          <div className="relative ml-auto">
            <button
              className="flex items-center text-sm"
              onClick={toggleUserMenu}
            >
              <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 rounded-full">
                <span className="text-indigo-600 font-medium">
                  {user?.email?.charAt(0).toUpperCase() || 'U'}
                </span>
              </div>
              <span className="ml-2 hidden md:block font-medium text-gray-700 truncate max-w-[200px]">
                {user?.email || 'User'}
              </span>
              <ChevronDown className="w-4 h-4 ml-1 text-gray-500" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5">
                <div className="px-4 py-2 text-xs text-gray-500 border-b border-gray-100">
                  {user?.email}
                </div>
                <Link
                  href="/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setUserMenuOpen(false)}
                >
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </Link>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
