// components/Navbar.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { getNavigationRoutes } from '../lib/routes';
import useAuth from '../hooks/useAuth';

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();
  const isAuthenticated = useAuth();

  // Get routes from configuration
  const routes = getNavigationRoutes();

  // Close the mobile menu when route changes
  useEffect(() => {
    setIsMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="bg-[#000100] text-[#F8F8F8] shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center">
              <span className="font-bold text-xl tracking-tight">Threadly</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="flex items-center space-x-4">
              {routes.filter(route => isAuthenticated || !route.authRequired).map((route) => (
                <div key={route.path} className="relative group">
                  <Link
                    href={route.path}
                    className={`px-3 py-2 rounded-md text-sm font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 ${pathname === route.path
                      ? 'bg-[#B4D2E7] text-[#000100]'
                      : 'text-[#F8F8F8]'
                      }`}
                  >
                    {route.label}
                  </Link>
                </div>
              ))}
              {isAuthenticated ? (
                <Link
                  href="/logout"
                  className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
                >
                  Logout
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
                  >
                    Login
                  </Link>
                  <Link
                    href="/signup"
                    className="px-3 py-2 rounded-md text-sm font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-[#F8F8F8] hover:bg-[#94C5CC] hover:text-[#000100] focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {routes.filter(route => isAuthenticated || !route.authRequired).map((route) => (
            <div key={route.path}>
              <Link
                href={route.path}
                className={`block px-3 py-2 rounded-md text-base font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 ${pathname === route.path
                  ? 'bg-[#B4D2E7] text-[#000100]'
                  : 'text-[#F8F8F8]'
                  }`}
              >
                {route.label}
              </Link>
            </div>
          ))}
          {isAuthenticated ? (
            <Link
              href="/logout"
              className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
            >
              Logout
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="block px-3 py-2 rounded-md text-base font-medium hover:bg-[#94C5CC] hover:text-[#000100] transition-colors duration-200 text-[#F8F8F8]"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}