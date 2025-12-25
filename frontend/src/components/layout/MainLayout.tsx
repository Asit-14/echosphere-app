import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export function MainLayout() {
  const { user } = useAuth();

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border bg-card hidden md:flex flex-col">
        <div className="p-4 border-b border-border">
          <h1 className="text-xl font-bold text-primary tracking-tight">ECHOSPHERE</h1>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/chat" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
            Chat
          </Link>
          <Link to="/search" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
            Search
          </Link>
          <Link to="/settings" className="block px-4 py-2 rounded-md hover:bg-accent hover:text-accent-foreground transition-colors text-sm font-medium">
            Settings
          </Link>
        </nav>
        <div className="p-4 border-t border-border">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user?.avatar} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
            <div className="text-sm">
              <p className="font-medium">{user?.name || 'User'}</p>
              <p className="text-xs text-muted-foreground">Online</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-14 border-b border-border flex items-center px-4 md:hidden bg-card">
           <h1 className="text-lg font-bold text-primary">ECHOSPHERE</h1>
        </header>
        <div className="flex-1 overflow-auto p-4">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
