import { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Video, Square, Download } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import html2canvas from 'html2canvas';

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
  const graphsImageRef = useRef<HTMLImageElement | null>(null);
  const graphsCaptureIntervalRef = useRef<number>();
  const isCapturingGraphsRef = useRef(false);

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
      if (graphsCaptureIntervalRef.current) {
        clearInterval(graphsCaptureIntervalRef.current);
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

      // Function to capture graphs using html2canvas
      const captureGraphs = async () => {
        // Skip if already capturing or not recording
        if (isCapturingGraphsRef.current || !hasGraphs || !graphsContainerRef?.current || !isRecordingRef.current) {
          return;
        }
        
        isCapturingGraphsRef.current = true;
        
        try {
          const graphsElement = graphsContainerRef.current;
          
          // Get actual visible dimensions
          const rect = graphsElement.getBoundingClientRect();
          const elementWidth = rect.width || graphsElement.offsetWidth;
          const elementHeight = rect.height || graphsElement.offsetHeight;
          
          // Ensure element is visible before capturing
          if (elementWidth === 0 || elementHeight === 0) {
            console.warn('Graphs element has zero dimensions:', elementWidth, elementHeight);
            isCapturingGraphsRef.current = false;
            return;
          }
          
          // Capture the graphs container - let html2canvas auto-detect dimensions
          const canvas = await html2canvas(graphsElement, {
            backgroundColor: '#ffffff',
            scale: 2, // Higher quality
            useCORS: true,
            logging: false,
            allowTaint: false,
            removeContainer: false,
          });
          
          // Check if canvas has content
          if (canvas.width === 0 || canvas.height === 0) {
            console.warn('Captured canvas is empty');
            isCapturingGraphsRef.current = false;
            return;
          }
          
          // Convert to image and store in ref
          const dataUrl = canvas.toDataURL('image/png');
          const img = new Image();
          
          img.onload = () => {
            if (img.width > 0 && img.height > 0) {
              graphsImageRef.current = img;
              console.log('Graphs captured successfully:', img.width, 'x', img.height);
            } else {
              console.warn('Loaded image has invalid dimensions');
            }
            isCapturingGraphsRef.current = false;
          };
          
          img.onerror = (error) => {
            console.error('Error loading graphs image:', error);
            isCapturingGraphsRef.current = false;
          };
          
          img.src = dataUrl;
        } catch (error) {
          console.error('Error capturing graphs:', error);
          isCapturingGraphsRef.current = false;
        }
      };

      // Capture graphs more frequently for smoother updates
      const startGraphsCapture = () => {
        // Wait a bit for the element to be fully rendered, then start capturing
        setTimeout(() => {
          if (isRecordingRef.current) {
            captureGraphs();
          }
        }, 100);
        
        // Then capture every ~50ms (approximately 20fps for graphs - smooth and reliable)
        graphsCaptureIntervalRef.current = window.setInterval(() => {
          if (isRecordingRef.current) {
            captureGraphs();
          }
        }, 50);
      };

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
          // Fill background first
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(simulationWidth, 0, graphsWidth, TARGET_HEIGHT);
          
          if (graphsImageRef.current && graphsImageRef.current.complete && graphsImageRef.current.naturalWidth > 0) {
            // Draw the captured graphs image, ensuring all content is visible
            const img = graphsImageRef.current;
            
            // Validate image - use natural dimensions for accuracy
            const imgWidth = img.naturalWidth || img.width;
            const imgHeight = img.naturalHeight || img.height;
            
            if (imgWidth > 0 && imgHeight > 0) {
              const imgAspect = imgWidth / imgHeight;
              const targetAspect = graphsWidth / TARGET_HEIGHT;
              
              let drawWidth = graphsWidth;
              let drawHeight = TARGET_HEIGHT;
              let drawX = simulationWidth;
              let drawY = 0;
              
              // Fit to show all content - use contain strategy (show everything)
              if (imgAspect > targetAspect) {
                // Image is wider than target area - fit to width, center vertically
                drawWidth = graphsWidth;
                drawHeight = drawWidth / imgAspect;
                drawY = (TARGET_HEIGHT - drawHeight) / 2;
              } else {
                // Image is taller than target area - fit to height, center horizontally
                drawHeight = TARGET_HEIGHT;
                drawWidth = drawHeight * imgAspect;
                drawX = simulationWidth + (graphsWidth - drawWidth) / 2;
              }
              
              // Draw the graphs image
              ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
            } else {
              // Invalid image dimensions
              ctx.fillStyle = '#64748b';
              ctx.font = '36px system-ui, sans-serif';
              ctx.textAlign = 'center';
              ctx.fillText('Invalid graph image', simulationWidth + graphsWidth / 2, TARGET_HEIGHT / 2);
              ctx.textAlign = 'left';
            }
          } else {
            // Fallback: draw placeholder while graphs are being captured
            ctx.fillStyle = '#64748b';
            ctx.font = '36px system-ui, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Loading graphs...', simulationWidth + graphsWidth / 2, TARGET_HEIGHT / 2);
            ctx.textAlign = 'left';
          }
        }
        
        // Add watermark/timestamp
        ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
        ctx.font = 'bold 32px system-ui, sans-serif';
        ctx.fillText(`PhySimulator - 4K Recording`, 40, TARGET_HEIGHT - 40);
        
        // Continue animation loop
        animationFrameRef.current = requestAnimationFrame(drawCompositeFrame);
      };

      // Start drawing
      isRecordingRef.current = true;
      setIsRecording(true);
      
      // Start capturing graphs periodically
      if (hasGraphs) {
        startGraphsCapture();
      }
      
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
    isCapturingGraphsRef.current = false;
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    
    if (graphsCaptureIntervalRef.current) {
      clearInterval(graphsCaptureIntervalRef.current);
      graphsCaptureIntervalRef.current = undefined;
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
