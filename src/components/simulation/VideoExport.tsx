import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Download, Loader2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoExportProps {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

const VideoExport = ({ canvasContainerRef, isPlaying }: VideoExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    if (!canvasContainerRef.current) return;

    try {
      // Find the canvas element
      const canvas = canvasContainerRef.current.querySelector('canvas');
      if (!canvas) {
        toast({
          title: 'Error',
          description: 'Canvas not found. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Get canvas stream
      const stream = canvas.captureStream(30); // 30 FPS

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9',
        videoBitsPerSecond: 5000000,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'video/webm' });
        setRecordedBlob(blob);
        toast({
          title: 'Recording Complete',
          description: 'Your video is ready to download.',
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setIsRecording(true);
      setRecordedBlob(null);

      toast({
        title: 'Recording Started',
        description: 'The simulation is being recorded.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Could not start video recording.',
        variant: 'destructive',
      });
    }
  }, [canvasContainerRef]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }, [isRecording]);

  const downloadVideo = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics-simulation-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Your video is being downloaded.',
    });
  }, [recordedBlob]);

  return (
    <div className="flex items-center gap-2">
      {!isRecording ? (
        <Button
          onClick={startRecording}
          variant="outline"
          size="sm"
          className="btn btn-secondary text-xs"
          disabled={!isPlaying}
        >
          <Video className="w-3.5 h-3.5 mr-1" />
          Record
        </Button>
      ) : (
        <Button
          onClick={stopRecording}
          variant="destructive"
          size="sm"
          className="text-xs"
        >
          <Square className="w-3.5 h-3.5 mr-1" />
          Stop
        </Button>
      )}

      {recordedBlob && !isRecording && (
        <Button
          onClick={downloadVideo}
          variant="outline"
          size="sm"
          className="btn btn-secondary text-xs"
        >
          <Download className="w-3.5 h-3.5 mr-1" />
          Download
        </Button>
      )}

      {isRecording && (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          Recording...
        </span>
      )}
    </div>
  );
};

export default VideoExport;
