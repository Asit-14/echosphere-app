import { MoreVertical, Phone, Video, Search, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import type { User } from '../types';
import { toast } from 'sonner';

interface ChatHeaderProps {
  user?: User;
  onBack?: () => void;
}

export function ChatHeader({ user, onBack }: ChatHeaderProps) {
  if (!user) return null;

  const handleComingSoon = () => {
    toast.info("This feature is coming soon!", {
      description: "We are working hard to bring this to you.",
    });
  };

  return (
    <div className="h-16 border-b border-border flex items-center justify-between px-4 md:px-6 bg-card/30 backdrop-blur-sm shrink-0">
      <div className="flex items-center gap-3">
        {onBack && (
          <Button variant="ghost" size="icon" className="md:hidden -ml-2" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
        )}
        <Avatar className="h-10 w-10">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-semibold text-sm">{user.name}</h3>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {user.status === 'online' ? (
              <>
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                Online
              </>
            ) : (
              'Last seen recently'
            )}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hidden sm:inline-flex" onClick={handleComingSoon}>
          <Search className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleComingSoon}>
          <Phone className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleComingSoon}>
          <Video className="h-5 w-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground" onClick={handleComingSoon}>
          <MoreVertical className="h-5 w-5" />
        </Button>
      </div>
    </div>
  );
}
