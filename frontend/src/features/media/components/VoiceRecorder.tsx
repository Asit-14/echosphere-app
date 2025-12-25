import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, Square, Play, Pause, Trash2, Send, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '../hooks/useAudioRecorder';
import { cn } from '@/lib/utils';

interface VoiceRecorderProps {
  onSend: (blob: Blob, duration: number) => void;
  onCancel: () => void;
}

export function VoiceRecorder({ onSend, onCancel }: VoiceRecorderProps) {
  const {
    isPaused,
    duration,
    audioBlob,
    error,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    discardRecording
  } = useAudioRecorder();

  const [isPlayingPreview, setIsPlayingPreview] = useState(false);
  const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);

  // Auto-start recording on mount
  useEffect(() => {
    startRecording();
    return () => {
      discardRecording();
      if (previewAudio) {
        previewAudio.pause();
        setPreviewAudio(null);
      }
    };
  }, []);

  useEffect(() => {
    if (audioBlob) {
      const url = URL.createObjectURL(audioBlob);
      const audio = new Audio(url);
      audio.onended = () => setIsPlayingPreview(false);
      setPreviewAudio(audio);
    }
  }, [audioBlob]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handlePlayPreview = () => {
    if (previewAudio) {
      previewAudio.play();
      setIsPlayingPreview(true);
    }
  };

  const handlePausePreview = () => {
    if (previewAudio) {
      previewAudio.pause();
      setIsPlayingPreview(false);
    }
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend(audioBlob, duration);
    }
  };

  if (error) {
    return (
      <div className="flex items-center gap-2 text-destructive p-2 bg-destructive/10 rounded-md">
        <AlertCircle className="w-4 h-4" />
        <span className="text-sm">{error}</span>
        <Button variant="ghost" size="sm" onClick={onCancel} className="ml-auto">Close</Button>
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        className="flex items-center gap-4 w-full bg-card border border-border rounded-lg p-2 shadow-lg"
      >
        {/* Delete Button */}
        <Button
          variant="ghost"
          size="icon"
          className="text-destructive hover:bg-destructive/10 shrink-0"
          onClick={onCancel}
        >
          <Trash2 className="w-5 h-5" />
        </Button>

        {/* Visualization / Status */}
        <div className="flex-1 flex items-center justify-center gap-3">
          {!audioBlob ? (
            <>
              <div className="flex items-center gap-1 h-8">
                {/* Fake Waveform Animation */}
                {Array.from({ length: 12 }).map((_, i) => (
                  <motion.div
                    key={i}
                    className={cn("w-1 bg-primary rounded-full", isPaused ? "opacity-50" : "")}
                    animate={{ 
                      height: isPaused ? 10 : [8, 24, 8],
                    }}
                    transition={{
                      repeat: Infinity,
                      duration: 0.8,
                      delay: i * 0.1,
                      ease: "easeInOut"
                    }}
                  />
                ))}
              </div>
              <span className="text-sm font-mono tabular-nums min-w-[40px]">
                {formatDuration(duration)}
              </span>
            </>
          ) : (
            <div className="flex items-center gap-2 w-full bg-muted/50 rounded-full px-3 py-1">
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={isPlayingPreview ? handlePausePreview : handlePlayPreview}
              >
                {isPlayingPreview ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
              </Button>
              <div className="h-1 flex-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: isPlayingPreview ? "100%" : "0%" }}
                  transition={{ duration: duration, ease: "linear" }}
                />
              </div>
              <span className="text-xs font-mono text-muted-foreground">
                {formatDuration(duration)}
              </span>
            </div>
          )}
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 shrink-0">
          {!audioBlob ? (
            isPaused ? (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
                onClick={resumeRecording}
              >
                <Mic className="w-5 h-5" />
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="text-primary hover:bg-primary/10"
                onClick={pauseRecording}
              >
                <Pause className="w-5 h-5" />
              </Button>
            )
          ) : null}

          {!audioBlob ? (
            <Button
              variant="destructive"
              size="icon"
              className="h-8 w-8 rounded-full"
              onClick={stopRecording}
            >
              <Square className="w-3 h-3 fill-current" />
            </Button>
          ) : (
            <Button
              size="icon"
              className="h-8 w-8 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
              onClick={handleSend}
            >
              <Send className="w-4 h-4" />
            </Button>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
