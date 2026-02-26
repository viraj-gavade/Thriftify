import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Menu, X, Home, PlusCircle, Bookmark, ShoppingBag,
  User, LogOut, LogIn, UserPlus, MessageCircle, Leaf,
} from 'lucide-react';

const Layout = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();

  // Fetch unread count
  const fetchUnread = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const { data } = await axios.get('/api/v1/chat/unread-count', { withCredentials: true });
      const payload = data.data || data;
      setUnreadCount(payload.count || 0);
    } catch {
      // ignore
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchUnread();
  }, [fetchUnread, location.pathname]);

  // Real-time: listen for new messages to bump the count
  useEffect(() => {
    if (!isAuthenticated) return;
    const socket = io(window.location.origin, { withCredentials: true, auth: {} });
    socket.on('connect_error', () => { /* silent — socket auth optional */ });
    socket.on('newMessage', () => {
      // If user is NOT on the chat page, increment count
      if (!window.location.pathname.startsWith('/chat')) {
        setUnreadCount((c) => c + 1);
      } else {
        // Refresh count since they might have read it
        fetchUnread();
      }
    });
    return () => { socket.disconnect(); };
  }, [isAuthenticated, fetchUnread]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = isAuthenticated
    ? [
        { to: '/', label: 'Home', icon: Home },
        { to: '/listings/new', label: 'Sell', icon: PlusCircle },
        { to: '/bookmarks', label: 'Saved', icon: Bookmark },
        { to: '/orders', label: 'Orders', icon: ShoppingBag },
        { to: '/chat', label: 'Messages', icon: MessageCircle },
      ]
    : [
        { to: '/', label: 'Home', icon: Home },
      ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Header */}
      <header
        className={cn(
          'sticky top-0 z-50 w-full border-b transition-all duration-200',
          scrolled
            ? 'bg-white/95 backdrop-blur-md border-border shadow-soft'
            : 'bg-white border-transparent'
        )}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-primary text-white">
                <Leaf className="w-5 h-5" />
              </div>
              <span className="text-xl font-display font-bold text-foreground tracking-tight">
                Thriftify
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {to === '/chat' && unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
            </nav>

            <div className="hidden md:flex items-center gap-3">
              {isAuthenticated ? (
                <>
                  <Link to="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-primary/20 transition-all">
                      <AvatarImage src={user?.profilepic} alt={user?.fullname} />
                      <AvatarFallback className="text-xs">
                        {user?.fullname?.charAt(0)?.toUpperCase() || 'U'}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                  <Link to="/logout">
                    <Button variant="ghost" size="sm" className="text-muted-foreground">
                      <LogOut className="w-4 h-4 mr-1" /> Logout
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="ghost" size="sm">
                      <LogIn className="w-4 h-4 mr-1" /> Sign In
                    </Button>
                  </Link>
                  <Link to="/signup">
                    <Button size="sm">
                      <UserPlus className="w-4 h-4 mr-1" /> Sign Up
                    </Button>
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-md text-muted-foreground hover:bg-secondary transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t border-border bg-white animate-slide-down">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map(({ to, label, icon: Icon }) => (
                <Link
                  key={to}
                  to={to}
                  className={cn(
                    'relative flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors',
                    isActive(to)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                  {to === '/chat' && unreadCount > 0 && (
                    <span className="ml-auto flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-primary rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </Link>
              ))}
              <Separator className="my-2" />
              {isAuthenticated ? (
                <>
                  <Link to="/profile" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <User className="w-4 h-4" /> Profile
                  </Link>
                  <Link to="/logout" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-destructive hover:bg-destructive/5">
                    <LogOut className="w-4 h-4" /> Logout
                  </Link>
                </>
              ) : (
                <>
                  <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary">
                    <LogIn className="w-4 h-4" /> Sign In
                  </Link>
                  <Link to="/signup" className="flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium text-primary hover:bg-primary/10">
                    <UserPlus className="w-4 h-4" /> Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-foreground text-white/70">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary text-white">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-lg font-display font-bold text-white">Thriftify</span>
              </div>
              <p className="text-sm max-w-sm leading-relaxed">
                A sustainable marketplace for pre-loved items. Give your things a new life
                and find unique treasures at great prices.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Navigate</h4>
              <ul className="space-y-2.5">
                <li><Link to="/" className="text-sm hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/listings/new" className="text-sm hover:text-white transition-colors">Sell Item</Link></li>
                <li><Link to="/orders" className="text-sm hover:text-white transition-colors">Orders</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Account</h4>
              <ul className="space-y-2.5">
                <li><Link to="/profile" className="text-sm hover:text-white transition-colors">Profile</Link></li>
                <li><Link to="/bookmarks" className="text-sm hover:text-white transition-colors">Saved Items</Link></li>
                <li><Link to="/chat" className="text-sm hover:text-white transition-colors">Messages</Link></li>
              </ul>
            </div>
          </div>
          <Separator className="my-8 bg-white/10" />
          <p className="text-xs text-white/40 text-center">
            &copy; {new Date().getFullYear()} Thriftify. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
