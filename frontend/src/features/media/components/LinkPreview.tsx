import { useState, useEffect } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ExternalLink } from 'lucide-react';

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  title: string;
  description: string;
  image?: string;
  domain: string;
}

export function LinkPreview({ url }: LinkPreviewProps) {
  const [data, setData] = useState<PreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    // Mock fetching OG data
    const fetchPreview = async () => {
      setLoading(true);
      try {
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Mock data based on URL
        if (url.includes('github')) {
          setData({
            title: 'GitHub: Let\'s build from here',
            description: 'GitHub is where over 100 million developers shape the future of software, together.',
            image: 'https://github.githubassets.com/images/modules/site/social-cards/github-social.png',
            domain: 'github.com'
          });
        } else if (url.includes('youtube')) {
          setData({
            title: 'Rick Astley - Never Gonna Give You Up (Official Music Video)',
            description: 'The official video for "Never Gonna Give You Up" by Rick Astley.',
            image: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg',
            domain: 'youtube.com'
          });
        } else {
          // Generic fallback
          setData({
            title: 'External Link',
            description: `Click to visit ${url}`,
            domain: new URL(url).hostname
          });
        }
      } catch (e) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPreview();
  }, [url]);

  if (error) return null;

  if (loading) {
    return (
      <div className="mt-2 w-full max-w-sm rounded-lg border border-border bg-card overflow-hidden">
        <Skeleton className="h-32 w-full" />
        <div className="p-3 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      className="mt-2 block w-full max-w-sm rounded-lg border border-border bg-card overflow-hidden hover:bg-accent/50 transition-colors group no-underline"
    >
      {data.image && (
        <div className="h-32 w-full overflow-hidden">
          <img 
            src={data.image} 
            alt={data.title} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      )}
      <div className="p-3">
        <h4 className="font-semibold text-sm text-foreground line-clamp-1 mb-1 group-hover:text-primary transition-colors">
          {data.title}
        </h4>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
          {data.description}
        </p>
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <ExternalLink className="w-3 h-3" />
          <span>{data.domain}</span>
        </div>
      </div>
    </a>
  );
}
