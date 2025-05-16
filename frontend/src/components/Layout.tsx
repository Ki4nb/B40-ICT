import { Fragment, ReactNode } from 'react';
import { Link, useLocation, NavLink } from 'react-router-dom';
import { Disclosure, Menu, Transition } from '@headlessui/react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useAuth } from '@/contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const { isAuthenticated, user, userRole, logout } = useAuth();
  const location = useLocation();
  const { t } = useTranslation();

  // Define navigation items with translations
  const navigation = [
    { name: t('nav.home'), href: '/' },
    { name: t('nav.requestFood'), href: '/request' },
    { name: t('nav.trackRequest'), href: '/track' },
  ];

  // Role-specific navigation items
  if (isAuthenticated && user) {
    if (userRole === 'user') {
      navigation.push({ 
        name: t('nav.myRequests'), 
        href: '/my-requests'
      });
    }
    
    if (userRole === 'foodbank') {
      navigation.push(
        { 
          name: t('nav.inventory'), 
          href: '/inventory'
        },
        { 
          name: t('nav.requests'), 
          href: '/foodbank-requests'
        }
      );
    }
    
    if (userRole === 'org') {
      navigation.push(
        { 
          name: t('nav.dashboard'), 
          href: '/admin-dashboard'
        },
        { 
          name: t('nav.foodbanks'), 
          href: '/foodbanks'
        },
        { 
          name: t('nav.allRequests'), 
          href: '/all-requests'
        }
      );
    }
  }

  // Helper function to determine if a link is active
  const isActive = (path: string) => {
    if (path === '/' && location.pathname === '/') {
      return true;
    }
    return path !== '/' && location.pathname === path;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Disclosure as="nav" className="bg-white shadow relative z-20">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
              <div className="flex h-16 justify-between">
                <div className="flex">
                  <div className="flex flex-shrink-0 items-center">
                    <Link to="/" className="flex items-center">
                      <img
                        className="h-8 w-auto"
                        src="/logo.svg"
                        alt="B40 Food Aid"
                      />
                      <span className="inline-block ml-2 border border-gray-200 rounded-full overflow-hidden h-6 w-6 shadow-sm">
                        <svg viewBox="0 0 24 24" width="24" height="24">
                          {/* Half Malaysia Flag */}
                          <clipPath id="leftHalf">
                            <rect x="0" y="0" width="12" height="24" />
                          </clipPath>
                          <g clipPath="url(#leftHalf)">
                            <rect width="24" height="24" fill="#CC0001" />
                            <rect y="0" width="24" height="3" fill="#fff" />
                            <rect y="6" width="24" height="3" fill="#fff" />
                            <rect y="12" width="24" height="3" fill="#fff" />
                            <rect y="18" width="24" height="3" fill="#fff" />
                            <rect width="10" height="12" fill="#010066" />
                            <path fill="#FC0" d="M4 2a5 5 0 100 8 4 4 0 110-8z" />
                            <path fill="#FC0" d="M6 6l-1 2-2 .4 1.4 1.6-.2 2 1.8-1 1.8 1-.2-2 1.4-1.6-2-.4z" />
                          </g>
                          
                          {/* Half Netherlands Flag */}
                          <clipPath id="rightHalf">
                            <rect x="12" y="0" width="12" height="24" />
                          </clipPath>
                          <g clipPath="url(#rightHalf)">
                            <rect y="0" width="24" height="8" fill="#AE1C28" />
                            <rect y="8" width="24" height="8" fill="#fff" />
                            <rect y="16" width="24" height="8" fill="#21468B" />
                          </g>
                        </svg>
                      </span>
                    </Link>
                  </div>
                  <div className="hidden sm:ml-6 sm:flex sm:space-x-8 relative z-30">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        className={({ isActive }) => 
                          `inline-flex items-center border-b-2 px-1 pt-1 text-sm font-medium ${
                            isActive
                              ? 'border-primary-500 text-gray-900'
                              : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                          }`
                        }
                      >
                        {item.name}
                      </NavLink>
                    ))}
                  </div>
                </div>
                <div className="hidden sm:ml-6 sm:flex sm:items-center">
                  <LanguageSwitcher />
                  <div className="border-l mx-4 h-6 border-gray-200"></div>
                  {isAuthenticated ? (
                    <Menu as="div" className="relative ml-3">
                      <div>
                        <Menu.Button className="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2">
                          <span className="sr-only">Open user menu</span>
                          <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center text-white">
                            {user?.username.charAt(0).toUpperCase()}
                          </div>
                        </Menu.Button>
                      </div>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-200"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                          <Menu.Item>
                            <div className="block px-4 py-2 text-sm text-gray-700 border-b border-gray-200">
                              <div className="font-medium">{user?.username}</div>
                              <div className="text-xs text-gray-500">{userRole}</div>
                            </div>
                          </Menu.Item>
                          <Menu.Item>
                            {({ active }) => (
                              <button
                                onClick={logout}
                                className={`${
                                  active ? 'bg-gray-100' : ''
                                } block w-full text-left px-4 py-2 text-sm text-gray-700`}
                              >
                                Sign out
                              </button>
                            )}
                          </Menu.Item>
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  ) : (
                    <div className="flex space-x-4">
                      <Link
                        to="/login"
                        className="inline-flex items-center rounded-md border border-transparent bg-white px-4 py-2 text-sm font-medium text-primary-600 hover:bg-gray-50"
                      >
                        Log in
                      </Link>
                      <Link
                        to="/register"
                        className="inline-flex items-center rounded-md border border-transparent bg-primary-600 px-4 py-2 text-sm font-medium text-white hover:bg-primary-700"
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
                <div className="-mr-2 flex items-center sm:hidden">
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden relative z-30">
              <div className="space-y-1 pb-3 pt-2">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) => 
                      `block border-l-4 py-2 pl-3 pr-4 text-base font-medium ${
                        isActive
                          ? 'border-primary-500 bg-primary-50 text-primary-700'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:bg-gray-50 hover:text-gray-700'
                      }`
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
              <div className="px-4 py-3">
                <div className="flex justify-center mb-3">
                  <LanguageSwitcher />
                </div>
              </div>
              <div className="border-t border-gray-200 pb-3 pt-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center px-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-500 flex items-center justify-center text-white">
                          {user?.username.charAt(0).toUpperCase()}
                        </div>
                      </div>
                      <div className="ml-3">
                        <div className="text-base font-medium text-gray-800">
                          {user?.username}
                        </div>
                        <div className="text-sm font-medium text-gray-500">
                          {user?.email}
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 space-y-1">
                      <Disclosure.Button
                        as="button"
                        onClick={logout}
                        className="block w-full px-4 py-2 text-left text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                      >
                        Sign out
                      </Disclosure.Button>
                    </div>
                  </>
                ) : (
                  <div className="mt-3 space-y-1">
                    <Disclosure.Button
                      as={Link}
                      to="/login"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Log in
                    </Disclosure.Button>
                    <Disclosure.Button
                      as={Link}
                      to="/register"
                      className="block px-4 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-gray-800"
                    >
                      Register
                    </Disclosure.Button>
                  </div>
                )}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
    </div>
  );
};

export default Layout;