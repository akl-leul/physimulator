import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface VideoExportProps {
  canvasContainerRef: React.RefObject<HTMLDivElement>;
  graphsContainerRef?: React.RefObject<HTMLDivElement>;
  isPlaying: boolean;
}

// 4K resolution
const TARGET_WIDTH = 3840;
const TARGET_HEIGHT = 2160;
const FRAME_RATE = 60;
const BIT_RATE = 40000000; // 40 Mbps for high quality 4K

const VideoExport = ({ canvasContainerRef, graphsContainerRef, isPlaying }: VideoExportProps) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const animationFrameRef = useRef<number>();
  const compositeCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const isRecordingRef = useRef(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Sync ref with state
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

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

      // Create high-resolution composite canvas for 4K
      const compositeCanvas = document.createElement('canvas');
      const hasGraphs = graphsContainerRef?.current;
      
      // Set 4K dimensions
      if (hasGraphs) {
        compositeCanvas.width = TARGET_WIDTH;
        compositeCanvas.height = TARGET_HEIGHT;
      } else {
        compositeCanvas.width = TARGET_WIDTH;
        compositeCanvas.height = TARGET_HEIGHT;
      }
      
      compositeCanvasRef.current = compositeCanvas;
      const ctx = compositeCanvas.getContext('2d', { 
        alpha: false,
        desynchronized: true 
      })!;
      
      // Enable high-quality scaling
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';

      // Calculate scaling factors
      const sourceWidth = threeCanvas.width;
      const sourceHeight = threeCanvas.height;
      
      // Calculate layout for 4K canvas
      const simulationWidth = hasGraphs ? TARGET_WIDTH * 0.7 : TARGET_WIDTH;
      const simulationHeight = TARGET_HEIGHT;
      const graphsWidth = hasGraphs ? TARGET_WIDTH * 0.3 : 0;

      // Function to draw composite frame
      const drawCompositeFrame = () => {
        if (!isRecordingRef.current) return;

        // Clear with white background
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);
        
        // Draw Three.js canvas scaled to 4K
        ctx.drawImage(
          threeCanvas, 
          0, 0, sourceWidth, sourceHeight,
          0, 0, simulationWidth, simulationHeight
        );
        
        // Draw graphs panel if available
        if (hasGraphs && graphsContainerRef?.current) {
          // Create a temporary canvas for the graphs
          const graphsElement = graphsContainerRef.current;
          const graphsRect = graphsElement.getBoundingClientRect();
          
          // Draw a placeholder area for graphs info
          ctx.fillStyle = '#f8fafc';
          ctx.fillRect(simulationWidth, 0, graphsWidth, TARGET_HEIGHT);
          
          // Draw border
          ctx.strokeStyle = '#e2e8f0';
          ctx.lineWidth = 4;
          ctx.strokeRect(simulationWidth, 0, graphsWidth, TARGET_HEIGHT);
          
          // Draw "Graphs" label
          ctx.fillStyle = '#1e293b';
          ctx.font = 'bold 48px system-ui, sans-serif';
          ctx.fillText('Motion Graphs', simulationWidth + 40, 80);
          
          // Draw simulation info
          ctx.font = '36px system-ui, sans-serif';
          ctx.fillStyle = '#64748b';
          const timestamp = new Date().toLocaleTimeString();
          ctx.fillText(`Time: ${timestamp}`, simulationWidth + 40, 150);
          ctx.fillText('Recording in 4K UHD', simulationWidth + 40, 200);
        }
        
        // Add watermark/timestamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = 'bold 32px system-ui, sans-serif';
        ctx.fillText(`Physics Simulation Lab - 4K Recording`, 40, TARGET_HEIGHT - 40);
        
        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(drawCompositeFrame);
      };

      // Start drawing
      isRecordingRef.current = true;
      setIsRecording(true);
      drawCompositeFrame();

      // Get stream from composite canvas at 60fps
      const stream = compositeCanvas.captureStream(FRAME_RATE);
      streamRef.current = stream;

      // Check for supported mime types
      const mimeTypes = [
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'video/webm',
        'video/mp4'
      ];
      
      let selectedMimeType = 'video/webm';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      // Create MediaRecorder with high quality settings
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType,
        videoBitsPerSecond: BIT_RATE,
      });

      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        const blob = new Blob(chunksRef.current, { type: selectedMimeType });
        setRecordedBlob(blob);
        
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        
        toast({
          title: '4K Recording Complete',
          description: `Video ready (${(blob.size / 1024 / 1024).toFixed(1)} MB)`,
        });
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        toast({
          title: 'Recording Error',
          description: 'An error occurred during recording.',
          variant: 'destructive',
        });
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start(100); // Collect data every 100ms
      setRecordedBlob(null);

      toast({
        title: '4K Recording Started',
        description: `Recording at ${TARGET_WIDTH}x${TARGET_HEIGHT} @ ${FRAME_RATE}fps`,
      });
    } catch (error) {
      console.error('Failed to start recording:', error);
      isRecordingRef.current = false;
      setIsRecording(false);
      toast({
        title: 'Recording Failed',
        description: 'Could not start video recording. Check browser compatibility.',
        variant: 'destructive',
      });
    }
  }, [canvasContainerRef, graphsContainerRef]);

  const stopRecording = useCallback(() => {
    isRecordingRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    
    setIsRecording(false);
  }, []);

  const downloadVideo = useCallback(() => {
    if (!recordedBlob) return;

    const url = URL.createObjectURL(recordedBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `physics-simulation-4K-${Date.now()}.webm`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: 'Download Started',
      description: 'Your 4K video is being downloaded.',
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
          title="Record in 4K UHD quality"
        >
          <Video className="w-3.5 h-3.5 mr-1" />
          Record 4K
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
          Download 4K
        </Button>
      )}

      {isRecording && (
        <span className="flex items-center gap-1 text-xs text-destructive">
          <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
          4K Recording...
        </span>
      )}
    </div>
  );
};

export default VideoExport;
