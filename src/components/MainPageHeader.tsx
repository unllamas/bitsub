import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, LogOut, Shield, UserCircle } from 'lucide-react';

import { useAuth } from '../hooks/useAuth';

const MainPageHeader: React.FC = () => {
  const { connected, login, logout } = useAuth();

  return (
    <header className='bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50'>
      <div className='container mx-auto px-4'>
        <div className='flex items-center justify-between h-16'>
          {/* Logo */}
          <Link to='/' className='flex items-center space-x-2'>
            <div className='flex items-center justify-center w-8 h-8 bg-bitcoin-500 rounded-lg'>
              <Zap className='w-5 h-5 text-white' />
            </div>
            <span className='text-xl font-bold text-gray-900'>BitSub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className='hidden md:flex items-center space-x-6'>
            {/* Navigation Links */}
            <nav className='flex items-center space-x-6'>
              {connected && (
                <>
                  <Link
                    to='/profile'
                    className='text-gray-600 hover:text-gray-900 font-medium transition-colors flex items-center space-x-1'
                  >
                    <UserCircle className='w-4 h-4' />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={logout}
                    className='w-full flex items-center space-x-3 p-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors'
                  >
                    <LogOut className='w-4 h-4' />
                    <span>Salir</span>
                  </button>
                </>
              )}
            </nav>

            {/* Authentication Section */}
            {!connected && (
              /* Not Authenticated - Show Login Button */
              <button
                onClick={login}
                className='flex items-center space-x-2 bg-bitcoin-500 hover:bg-bitcoin-600 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md'
              >
                <Shield className='w-4 h-4' />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default MainPageHeader;
