import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Play, Pause, RotateCcw, Info } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ControlPanelProps {
  length: number;
  mass: number;
  angle: number;
  gravity: number;
  isPlaying: boolean;
  onLengthChange: (value: number) => void;
  onMassChange: (value: number) => void;
  onAngleChange: (value: number) => void;
  onGravityChange: (value: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
}

const ControlPanel = ({
  length,
  mass,
  angle,
  gravity,
  isPlaying,
  onLengthChange,
  onMassChange,
  onAngleChange,
  onGravityChange,
  onPlayPause,
  onReset,
}: ControlPanelProps) => {
  const radToDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(1);
  
  return (
    <div className="glass-panel p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-foreground">Parameters</h2>
        <Tooltip>
          <TooltipTrigger>
            <Info className="w-4 h-4 text-muted-foreground hover:text-primary transition-colors" />
          </TooltipTrigger>
          <TooltipContent side="left" className="max-w-xs">
            <p>Adjust the physical parameters of the pendulum system. Changes take effect immediately.</p>
          </TooltipContent>
        </Tooltip>
      </div>

      {/* Length Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="parameter-label flex items-center gap-2">
            Length (L)
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Distance from pivot to center of mass (meters)</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <span className="data-readout text-sm">{length.toFixed(2)} m</span>
        </div>
        <Slider
          value={[length]}
          onValueChange={([v]) => onLengthChange(v)}
          min={0.5}
          max={3}
          step={0.1}
          disabled={isPlaying}
          className="cursor-pointer"
        />
      </div>

      {/* Mass Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="parameter-label flex items-center gap-2">
            Mass (m)
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Mass of the bob (kg). In ideal SHM, mass doesn't affect period.</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <span className="data-readout text-sm">{mass.toFixed(1)} kg</span>
        </div>
        <Slider
          value={[mass]}
          onValueChange={([v]) => onMassChange(v)}
          min={0.5}
          max={10}
          step={0.5}
          disabled={isPlaying}
          className="cursor-pointer"
        />
      </div>

      {/* Initial Angle Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="parameter-label flex items-center gap-2">
            Initial Angle (θ₀)
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Starting displacement angle from vertical (degrees)</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <span className="data-readout text-sm">{radToDeg(angle)}°</span>
        </div>
        <Slider
          value={[angle * 180 / Math.PI]}
          onValueChange={([v]) => onAngleChange(v * Math.PI / 180)}
          min={-90}
          max={90}
          step={1}
          disabled={isPlaying}
          className="cursor-pointer"
        />
      </div>

      {/* Gravity Control */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="parameter-label flex items-center gap-2">
            Gravity (g)
            <Tooltip>
              <TooltipTrigger>
                <Info className="w-3 h-3" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Gravitational acceleration (m/s²). Earth ≈ 9.81</p>
              </TooltipContent>
            </Tooltip>
          </label>
          <span className="data-readout text-sm">{gravity.toFixed(2)} m/s²</span>
        </div>
        <Slider
          value={[gravity]}
          onValueChange={([v]) => onGravityChange(v)}
          min={1}
          max={20}
          step={0.1}
          disabled={isPlaying}
          className="cursor-pointer"
        />
      </div>

      {/* Playback Controls */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          onClick={onPlayPause}
          className={`flex-1 ${isPlaying ? 'control-button' : 'control-button-primary'}`}
          variant={isPlaying ? "secondary" : "default"}
        >
          {isPlaying ? (
            <>
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Start
            </>
          )}
        </Button>
        <Button
          onClick={onReset}
          variant="outline"
          className="control-button"
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
