import { useState } from 'react';
import { PRESETS, APPLICATIONS } from '@/config/presets';
import { Preset, SimulationMode } from '@/types/simulation';
import { ChevronDown, Info, Play } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';

interface PresetSelectorProps {
  currentMode: SimulationMode;
  onSelectPreset: (preset: Preset) => void;
}

const PresetSelector = ({ currentMode, onSelectPreset }: PresetSelectorProps) => {
  const [isOpen, setIsOpen] = useState(true);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const filteredPresets = PRESETS.filter(p => p.mode === currentMode);
  const relatedApps = APPLICATIONS.filter(a => a.relatedModes.includes(currentMode));

  const handleSelect = (preset: Preset) => {
    setSelectedPreset(preset.id);
    onSelectPreset(preset);
  };

  return (
    <div className="panel">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger className="panel-header w-full cursor-pointer hover:bg-secondary/30 transition-colors">
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <span>🎯</span> Presets & Applications
          </h3>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="panel-body space-y-4">
            {/* Presets */}
            {filteredPresets.length > 0 && (
              <div className="space-y-2">
                <span className="label">Quick Presets</span>
                <div className="space-y-1.5">
                  {filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleSelect(preset)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all text-sm ${
                        selectedPreset === preset.id
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50 hover:bg-secondary/50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{preset.icon}</span>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-foreground">{preset.name}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                            {preset.description}
                          </div>
                        </div>
                        <Play className="w-3.5 h-3.5 text-primary flex-shrink-0 mt-0.5" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Applications */}
            {relatedApps.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-border">
                <span className="label flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Real-World Applications
                </span>
                <div className="space-y-2">
                  {relatedApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-2.5 rounded-lg bg-secondary/30 text-sm"
                    >
                      <div className="flex items-center gap-2 font-medium text-foreground">
                        <span>{app.icon}</span>
                        {app.name}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {app.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {filteredPresets.length === 0 && relatedApps.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-2">
                No presets available for this mode
              </p>
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PresetSelector;
