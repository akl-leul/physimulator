import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

interface VideoExportProps {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  graphsContainerRef?: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

const VideoExport = ({ canvasContainerRef, graphsContainerRef, isPlaying }: VideoExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const startRecording = useCallback(async () => {
    if (!canvasContainerRef.current) return;

    try {
      const threeCanvas = canvasContainerRef.current.querySelector('canvas');
      if (!threeCanvas) {
        toast({
          title: 'Error',
          description: 'Canvas not found. Please try again.',
          variant: 'destructive',
        });
        return;
      }

      // Create composite canvas for combined view
      const compositeCanvas = document.createElement('canvas');
      const hasGraphs = graphsContainerRef?.current;
      
      // Set dimensions - wider if we have graphs
      const canvasWidth = threeCanvas.width;
      const canvasHeight = threeCanvas.height;
      
      if (hasGraphs) {
        compositeCanvas.width = canvasWidth + 400; // Extra space for graphs
        compositeCanvas.height = Math.max(canvasHeight, 500);
      } else {
        compositeCanvas.width = canvasWidth;
        compositeCanvas.height = canvasHeight;
      }
      
      compositeCanvasRef.current = compositeCanvas;
      const ctx = compositeCanvas.getContext('2d')!;

      // Function to draw composite frame
      const drawCompositeFrame = async () => {
        // Clear with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        
        // Draw Three.js canvas
        ctx.drawImage(threeCanvas, 0, 0);
        
        // Draw graphs if available
        if (hasGraphs && graphsContainerRef?.current) {
          try {
            const graphsImage = await html2canvas(graphsContainerRef.current, {
              backgroundColor: '#ffffff',
              scale: 1,
              logging: false,
              useCORS: true,
            });
            ctx.drawImage(graphsImage, canvasWidth + 10, 10, 380, compositeCanvas.height - 20);
          } catch (e) {
            // Silently handle graph capture errors
          }
        }
        
        // Add timestamp
        ctx.fillStyle = '#374151';
        ctx.font = '12px system-ui';
        ctx.fillText(`Physics Simulation - ${new Date().toLocaleTimeString()}`, 10, compositeCanvas.height - 10);
        
        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(drawCompositeFrame);
        }
      };

      // Start composite drawing
      drawCompositeFrame();

      // Get stream from composite canvas
      const stream = compositeCanvas.captureStream(30);

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
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        toast({
          title: 'Recording Complete',
          description: 'Your video is ready to download.',
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100);
      setIsRecording(true);
      setRecordedBlob(null);

      toast({
        title: 'Recording Started',
        description: hasGraphs ? 'Recording simulation with graphs.' : 'Recording simulation.',
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      toast({
        title: 'Recording Failed',
        description: 'Could not start video recording.',
        variant: 'destructive',
      });
    }
  }, [canvasContainerRef, graphsContainerRef, isRecording]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
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
