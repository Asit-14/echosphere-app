import { Laptop, Smartphone, Globe, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Session {
  id: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  browser: string;
  ip: string;
  lastActive: string;
  isCurrent: boolean;
}

// Mock data - replace with API call
const MOCK_SESSIONS: Session[] = [
  {
    id: '1',
    deviceType: 'desktop',
    browser: 'Chrome on Windows',
    ip: '192.168.1.1',
    lastActive: 'Now',
    isCurrent: true,
  },
  {
    id: '2',
    deviceType: 'mobile',
    browser: 'Safari on iPhone',
    ip: '10.0.0.1',
    lastActive: '2 hours ago',
    isCurrent: false,
  },
];

export function SessionList() {
  const getIcon = (type: Session['deviceType']) => {
    switch (type) {
      case 'desktop': return <Laptop className="h-4 w-4" />;
      case 'mobile': return <Smartphone className="h-4 w-4" />;
      default: return <Globe className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Active Sessions</h3>
      <div className="space-y-2">
        {MOCK_SESSIONS.map((session) => (
          <div
            key={session.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card/50 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-full bg-primary/10 text-primary">
                {getIcon(session.deviceType)}
              </div>
              <div>
                <p className="text-sm font-medium flex items-center gap-2">
                  {session.browser}
                  {session.isCurrent && (
                    <span className="text-[10px] bg-green-500/10 text-green-500 px-1.5 py-0.5 rounded-full font-bold">
                      CURRENT
                    </span>
                  )}
                </p>
                <p className="text-xs text-muted-foreground">
                  {session.ip} • {session.lastActive}
                </p>
              </div>
            </div>
            {!session.isCurrent && (
              <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-4 w-4" />
                <span className="sr-only">Revoke session</span>
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
