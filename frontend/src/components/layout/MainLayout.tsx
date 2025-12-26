import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MessageSquare, Search, Settings, LogOut } from 'lucide-react';

export function MainLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <div className="flex h-[100dvh] bg-background text-foreground overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-primary-foreground">
              <MessageSquare className="w-5 h-5" />
            </div>
            ECHOSPHERE
          </h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link 
            to="/chat" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium ${isActive('/chat') ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}
          >
            <MessageSquare className="w-4 h-4" />
            Chat
          </Link>
          <Link 
            to="/search" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium ${isActive('/search') ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}
          >
            <Search className="w-4 h-4" />
            Search
          </Link>
          <Link 
            to="/settings" 
            className={`flex items-center gap-3 px-4 py-3 rounded-md transition-colors text-sm font-medium ${isActive('/settings') ? 'bg-primary/10 text-primary' : 'hover:bg-accent hover:text-accent-foreground'}`}
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3 mb-4">
            <Avatar className="h-9 w-9 border border-border">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full">
            <LogOut className="w-3 h-3" />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative w-full">
        {/* Mobile Header - Only show on non-chat pages or when needed */}
        <div className="flex-1 overflow-hidden relative">
          <Outlet />
        </div>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden h-16 border-t border-border bg-card flex items-center justify-around px-2 pb-safe">
          <Link 
            to="/chat" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 gap-1 ${isActive('/chat') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <MessageSquare className="w-5 h-5" />
            <span className="text-[10px] font-medium">Chat</span>
          </Link>
          <Link 
            to="/search" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 gap-1 ${isActive('/search') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Search className="w-5 h-5" />
            <span className="text-[10px] font-medium">Search</span>
          </Link>
          <Link 
            to="/settings" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 gap-1 ${isActive('/settings') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Settings className="w-5 h-5" />
            <span className="text-[10px] font-medium">Settings</span>
          </Link>
          <Link 
            to="/profile" 
            className={`flex flex-col items-center justify-center p-2 rounded-lg w-16 gap-1 ${isActive('/profile') ? 'text-primary' : 'text-muted-foreground'}`}
          >
            <Avatar className="h-6 w-6">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback className="text-[10px]">{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </nav>
      </main>
    </div>
  );
}
