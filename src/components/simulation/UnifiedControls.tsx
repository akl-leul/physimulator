import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Play, Pause, RotateCcw } from 'lucide-react';
import { SimulationMode } from '@/types/simulation';

interface UnifiedControlsProps {
  mode: SimulationMode;
  params: {
    length: number;
    length2: number;
    mass: number;
    mass2: number;
    gravity: number;
    angle: number;
    angle2: number;
    damping: number;
    drivingFrequency: number;
    drivingAmplitude: number;
    springConstant: number;
    displacement: number;
  };
  isPlaying: boolean;
  showTrail: boolean;
  showChaosComparison: boolean;
  onParamChange: (key: string, value: number) => void;
  onPlayPause: () => void;
  onReset: () => void;
  onTrailToggle: (value: boolean) => void;
  onChaosToggle: (value: boolean) => void;
}

const UnifiedControls = ({
  mode,
  params,
  isPlaying,
  showTrail,
  showChaosComparison,
  onParamChange,
  onPlayPause,
  onReset,
  onTrailToggle,
  onChaosToggle,
}: UnifiedControlsProps) => {
  const radToDeg = (rad: number) => (rad * 180 / Math.PI).toFixed(0);

  return (
    <div className="panel">
      <div className="panel-header">
        <h3 className="font-semibold text-sm">Parameters</h3>
      </div>
      <div className="panel-body space-y-4">
        {/* Common: Gravity */}
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="label">Gravity (g)</span>
            <span className="data-value text-xs">{params.gravity.toFixed(1)} m/s²</span>
          </div>
          <Slider
            value={[params.gravity]}
            onValueChange={([v]) => onParamChange('gravity', v)}
            min={1}
            max={20}
            step={0.5}
            disabled={isPlaying}
          />
        </div>

        {/* Pendulum modes */}
        {(mode === 'simple' || mode === 'double' || mode === 'damped') && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Length 1 (L₁)</span>
                <span className="data-value text-xs">{params.length.toFixed(1)} m</span>
              </div>
              <Slider
                value={[params.length]}
                onValueChange={([v]) => onParamChange('length', v)}
                min={0.5}
                max={2.5}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Mass 1 (m₁)</span>
                <span className="data-value text-xs">{params.mass.toFixed(1)} kg</span>
              </div>
              <Slider
                value={[params.mass]}
                onValueChange={([v]) => onParamChange('mass', v)}
                min={0.5}
                max={5}
                step={0.5}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Angle 1 (θ₁)</span>
                <span className="data-value text-xs">{radToDeg(params.angle)}°</span>
              </div>
              <Slider
                value={[params.angle * 180 / Math.PI]}
                onValueChange={([v]) => onParamChange('angle', v * Math.PI / 180)}
                min={-120}
                max={120}
                step={5}
                disabled={isPlaying}
              />
            </div>
          </>
        )}

        {/* Double pendulum specific */}
        {mode === 'double' && (
          <>
            <div className="border-t border-border pt-3 mt-3">
              <span className="label text-xs">Second Pendulum</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Length 2 (L₂)</span>
                <span className="data-value text-xs">{params.length2.toFixed(1)} m</span>
              </div>
              <Slider
                value={[params.length2]}
                onValueChange={([v]) => onParamChange('length2', v)}
                min={0.5}
                max={2}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Mass 2 (m₂)</span>
                <span className="data-value text-xs">{params.mass2.toFixed(1)} kg</span>
              </div>
              <Slider
                value={[params.mass2]}
                onValueChange={([v]) => onParamChange('mass2', v)}
                min={0.5}
                max={5}
                step={0.5}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Angle 2 (θ₂)</span>
                <span className="data-value text-xs">{radToDeg(params.angle2)}°</span>
              </div>
              <Slider
                value={[params.angle2 * 180 / Math.PI]}
                onValueChange={([v]) => onParamChange('angle2', v * Math.PI / 180)}
                min={-120}
                max={120}
                step={5}
                disabled={isPlaying}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">Show chaos comparison</span>
              <Switch checked={showChaosComparison} onCheckedChange={onChaosToggle} />
            </div>
          </>
        )}

        {/* Damped/Driven specific */}
        {mode === 'damped' && (
          <>
            <div className="border-t border-border pt-3 mt-3">
              <span className="label text-xs">Damping & Driving</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Damping (b)</span>
                <span className="data-value text-xs">{params.damping.toFixed(2)}</span>
              </div>
              <Slider
                value={[params.damping]}
                onValueChange={([v]) => onParamChange('damping', v)}
                min={0}
                max={1}
                step={0.05}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Drive Freq (ωd)</span>
                <span className="data-value text-xs">{params.drivingFrequency.toFixed(1)} rad/s</span>
              </div>
              <Slider
                value={[params.drivingFrequency]}
                onValueChange={([v]) => onParamChange('drivingFrequency', v)}
                min={0}
                max={10}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Drive Amp (F₀)</span>
                <span className="data-value text-xs">{params.drivingAmplitude.toFixed(1)}</span>
              </div>
              <Slider
                value={[params.drivingAmplitude]}
                onValueChange={([v]) => onParamChange('drivingAmplitude', v)}
                min={0}
                max={5}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="stat-card text-xs">
              <span className="text-muted-foreground">Natural freq: </span>
              <span className="data-value">{Math.sqrt(params.gravity / params.length).toFixed(2)} rad/s</span>
            </div>
          </>
        )}

        {/* Spring specific */}
        {mode === 'spring' && (
          <>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Mass (m)</span>
                <span className="data-value text-xs">{params.mass.toFixed(1)} kg</span>
              </div>
              <Slider
                value={[params.mass]}
                onValueChange={([v]) => onParamChange('mass', v)}
                min={0.5}
                max={5}
                step={0.5}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Spring Const (k)</span>
                <span className="data-value text-xs">{params.springConstant.toFixed(0)} N/m</span>
              </div>
              <Slider
                value={[params.springConstant]}
                onValueChange={([v]) => onParamChange('springConstant', v)}
                min={5}
                max={50}
                step={1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Initial Disp (x₀)</span>
                <span className="data-value text-xs">{params.displacement.toFixed(1)} m</span>
              </div>
              <Slider
                value={[params.displacement]}
                onValueChange={([v]) => onParamChange('displacement', v)}
                min={-1}
                max={1}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="border-t border-border pt-3 mt-3">
              <span className="label text-xs">Damping & Driving</span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Damping (b)</span>
                <span className="data-value text-xs">{params.damping.toFixed(2)}</span>
              </div>
              <Slider
                value={[params.damping]}
                onValueChange={([v]) => onParamChange('damping', v)}
                min={0}
                max={2}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Drive Freq (ωd)</span>
                <span className="data-value text-xs">{params.drivingFrequency.toFixed(1)} rad/s</span>
              </div>
              <Slider
                value={[params.drivingFrequency]}
                onValueChange={([v]) => onParamChange('drivingFrequency', v)}
                min={0}
                max={15}
                step={0.1}
                disabled={isPlaying}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="label">Drive Amp (F₀)</span>
                <span className="data-value text-xs">{params.drivingAmplitude.toFixed(1)}</span>
              </div>
              <Slider
                value={[params.drivingAmplitude]}
                onValueChange={([v]) => onParamChange('drivingAmplitude', v)}
                min={0}
                max={10}
                step={0.5}
                disabled={isPlaying}
              />
            </div>

            <div className="stat-card text-xs">
              <span className="text-muted-foreground">Natural freq: </span>
              <span className="data-value">{Math.sqrt(params.springConstant / params.mass).toFixed(2)} rad/s</span>
            </div>
          </>
        )}

        {/* Trail toggle */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-xs text-muted-foreground">Show motion trail</span>
          <Switch checked={showTrail} onCheckedChange={onTrailToggle} />
        </div>

        {/* Playback */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={onPlayPause}
            className={`flex-1 btn ${isPlaying ? 'btn-secondary' : 'btn-primary'}`}
            size="sm"
          >
            {isPlaying ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
            {isPlaying ? 'Pause' : 'Start'}
          </Button>
          <Button onClick={onReset} variant="outline" size="sm" className="btn btn-secondary">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UnifiedControls;
