import { Outlet, useNavigate, useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  Package,
  ArrowLeftRight,
  Users,
  Activity,
  Settings,
  LogOut,
  Bell,
  Menu,
  X,
  FileText,
  CheckSquare,
  MessageSquare,
  Shield
} from 'lucide-react';
import { KeyboardEvent, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from './ui/utils';
import VoiceCommandCenter from './VoiceCommandCenter';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const pageName = navItems.find(item => item.path === location.pathname)?.label ?? 'CMMS';
    document.title = `${pageName} | HVL Materials Management`;
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin', 'staff', 'engineer', 'manager'] },
    { path: '/inventory', label: 'Inventory', icon: Package, roles: ['admin', 'staff', 'engineer', 'manager'] },
    { path: '/requests', label: 'Material Requests', icon: FileText, roles: ['admin', 'manager'] },
    { path: '/approvals', label: 'Approvals', icon: CheckSquare, roles: ['admin'] },
    { path: '/user-approvals', label: 'User Approvals', icon: Users, roles: ['admin'] },
    { path: '/messages', label: 'Messages', icon: MessageSquare, roles: ['engineer', 'manager'] },
    { path: '/inout', label: 'IN/OUT Tracking', icon: ArrowLeftRight, roles: ['admin', 'staff', 'manager'] },
    { path: '/users', label: 'User Management', icon: Users, roles: ['admin'] },
    { path: '/logs', label: 'Activity Logs', icon: Activity, roles: ['admin', 'staff'] },
    { path: '/security', label: 'Security Center', icon: Shield, roles: ['admin'] },
    { path: '/settings', label: 'Settings', icon: Settings, roles: ['admin', 'staff', 'engineer', 'manager'] }
  ];

  const filteredNavItems = navItems.filter(item =>
    user && item.roles.includes(user.role)
  );

  const handleNavKeyDown = (event: KeyboardEvent<HTMLElement>) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const items = Array.from(navRef.current?.querySelectorAll<HTMLButtonElement>('[data-nav-item]') ?? []);
    if (!items.length) return;
    event.preventDefault();
    const currentIndex = Math.max(0, items.indexOf(document.activeElement as HTMLButtonElement));
    const nextIndex =
      event.key === 'Home' ? 0 :
      event.key === 'End' ? items.length - 1 :
      event.key === 'ArrowDown' ? (currentIndex + 1) % items.length :
      (currentIndex - 1 + items.length) % items.length;
    items[nextIndex]?.focus();
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-yellow-500 text-stone-950 hover:bg-yellow-500 font-mono text-xs';
      case 'staff': return 'bg-stone-700 text-white hover:bg-stone-700 font-mono text-xs';
      case 'engineer': return 'bg-green-700 text-white hover:bg-green-700 font-mono text-xs';
      case 'manager': return 'bg-stone-500 text-white hover:bg-stone-500 font-mono text-xs';
      default: return 'bg-stone-400 text-white font-mono text-xs';
    }
  };

  return (
    <div className="min-h-screen bg-stone-100">
      <Button
        type="button"
        onClick={() => {
          mainRef.current?.focus();
          mainRef.current?.scrollIntoView();
        }}
        className="fixed left-3 top-3 z-[100] -translate-y-24 focus:translate-y-0 bg-yellow-500 text-stone-950"
      >
        Skip to main content
      </Button>
      {/* Top Header — accounts for notch / Dynamic Island via safe-top */}
      <header
        className="bg-blue-950 border-b-2 border-yellow-400 sticky top-0 z-50"
        style={{ paddingTop: 'var(--safe-top)' }}
      >
        <div className="flex items-center justify-between px-3 sm:px-4 lg:px-6 h-14">
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            {/* Mobile menu toggle */}
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden text-stone-300 hover:text-white hover:bg-blue-900 shrink-0 -ml-1"
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              aria-label={isSidebarOpen ? 'Close navigation' : 'Open navigation'}
            >
              {isSidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            {/* Logo mark */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-8 h-8 bg-yellow-400 flex items-center justify-center shrink-0">
                <span className="text-stone-950 font-black text-xs leading-none tracking-tight">HVL</span>
              </div>
              <div className="min-w-0">
                <div className="text-white font-black text-xs sm:text-sm uppercase tracking-tight leading-none truncate">
                  Engineering Services
                </div>
                <div className="text-stone-400 text-xs font-mono tracking-widest uppercase leading-none mt-0.5 hidden sm:block">
                  Materials Management
                </div>
              </div>
            </div>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            <VoiceCommandCenter />
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="relative text-stone-400 hover:text-white hover:bg-blue-900"
                  aria-label="Open notifications"
                >
                  <Bell className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="end" className="w-72">
                <div className="font-bold uppercase tracking-wide">Notifications</div>
                <p className="mt-2 text-sm text-stone-600">No new notifications.</p>
              </PopoverContent>
            </Popover>

            <div className="flex items-center gap-1.5 sm:gap-2 pl-1.5 sm:pl-2 border-l border-stone-700">
              {/* User info — hidden on very small screens */}
              <div className="text-right hidden md:block">
                <p className="text-xs font-bold text-white uppercase tracking-tight leading-none">{user?.fullName}</p>
                <p className="text-xs text-stone-500 font-mono leading-none mt-0.5 truncate max-w-[120px]">{user?.email}</p>
              </div>

              <Badge className={getRoleBadgeClass(user?.role || '')}>
                {user?.role?.toUpperCase()}
              </Badge>

              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="text-stone-400 hover:text-red-400 hover:bg-blue-900"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={cn(
            "fixed lg:sticky left-0 w-60 bg-blue-950 border-r border-blue-900 transition-transform duration-300 ease-in-out z-40 overflow-y-auto flex flex-col",
            "top-[var(--header-height)] h-[calc(100dvh-var(--header-height))]",
            isSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          )}
          style={{ paddingBottom: 'var(--safe-bottom)' }}
        >
          <nav
            ref={navRef}
            aria-label="Primary navigation"
            onKeyDown={handleNavKeyDown}
            className="flex-1 p-3 space-y-0.5 pt-4"
          >
            {filteredNavItems.map((item, index) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <motion.div
                  key={item.path}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03, duration: 0.2 }}
                >
                  <Button
                    variant="ghost"
                    className={cn(
                      "w-full justify-start gap-3 text-blue-200 hover:bg-blue-900 hover:text-white transition-colors duration-100 h-10 text-xs font-bold uppercase tracking-widest",
                      isActive && "bg-yellow-400 text-stone-950 hover:bg-yellow-500 hover:text-stone-950"
                    )}
                    onClick={() => {
                      navigate(item.path);
                      setIsSidebarOpen(false);
                    }}
                    data-nav-item
                    aria-current={isActive ? 'page' : undefined}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{item.label}</span>
                    {isActive && <div className="ml-auto w-1 h-4 bg-stone-950/20" />}
                  </Button>
                </motion.div>
              );
            })}
          </nav>

          {/* Sidebar footer */}
          <div className="border-t border-blue-900 p-3">
            <div className="text-xs font-mono text-blue-700 text-center">HVL v2.0</div>
          </div>
        </aside>

        {/* Mobile overlay */}
        <AnimatePresence>
          {isSidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/50 z-30 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
              role="button"
              tabIndex={0}
              aria-label="Close navigation"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') setIsSidebarOpen(false);
              }}
            />
          )}
        </AnimatePresence>

        {/* Main content */}
        <main
          ref={mainRef}
          id="main-content"
          tabIndex={-1}
          aria-label="Main content"
          className="flex-1 min-w-0 p-3 sm:p-5 lg:p-8"
          style={{
            paddingLeft: 'max(0.75rem, var(--safe-left))',
            paddingRight: 'max(0.75rem, var(--safe-right))',
            paddingBottom: 'max(1.5rem, var(--safe-bottom))',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  );
}
