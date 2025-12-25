import { X, File as FileIcon, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface AttachmentListProps {
  files: File[];
  onRemove: (index: number) => void;
}

export function AttachmentList({ files, onRemove }: AttachmentListProps) {
  if (files.length === 0) return null;

  return (
    <div className="flex gap-2 overflow-x-auto p-2 pb-4 scrollbar-hide">
      <AnimatePresence mode="popLayout">
        {files.map((file, index) => (
          <motion.div
            key={`${file.name}-${index}`}
            initial={{ opacity: 0, scale: 0.8, x: -20 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
            className="relative group shrink-0"
          >
            <div className="w-24 h-24 rounded-lg border border-border bg-muted overflow-hidden relative">
              {file.type.startsWith('image/') ? (
                <img
                  src={URL.createObjectURL(file)}
                  alt="Preview"
                  className="w-full h-full object-cover"
                  onLoad={(e) => URL.revokeObjectURL(e.currentTarget.src)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                  {file.type.startsWith('audio/') ? (
                    <Music className="w-8 h-8 text-muted-foreground mb-1" />
                  ) : (
                    <FileIcon className="w-8 h-8 text-muted-foreground mb-1" />
                  )}
                  <span className="text-[10px] text-muted-foreground truncate w-full">
                    {file.name}
                  </span>
                </div>
              )}
              
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                  onClick={() => onRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground text-[10px] px-1.5 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              {(file.size / 1024 / 1024).toFixed(1)}MB
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
