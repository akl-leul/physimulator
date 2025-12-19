import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X, BookOpen, Lightbulb, FlaskConical, Globe } from 'lucide-react';
import { BlockMath, InlineMath } from 'react-katex';
import 'katex/dist/katex.min.css';

// Component to render text with inline LaTeX support
const TextWithMath = ({ text }: { text: string }) => {
  // Pattern to match LaTeX expressions: $...$ for inline math
  const mathPattern = /\$([^$]+)\$/g;
  const parts: (string | { type: 'math'; content: string })[] = [];
  let lastIndex = 0;
  let match;

  while ((match = mathPattern.exec(text)) !== null) {
    // Add text before the math
    if (match.index > lastIndex) {
      parts.push(text.substring(lastIndex, match.index));
    }
    // Add the math expression
    parts.push({ type: 'math', content: match[1] });
    lastIndex = match.index + match[0].length;
  }
  
  // Add remaining text
  if (lastIndex < text.length) {
    parts.push(text.substring(lastIndex));
  }

  // If no math found, return plain text
  if (parts.length === 1 && typeof parts[0] === 'string') {
    return <>{text}</>;
  }

  return (
    <>
      {parts.map((part, index) => {
        if (typeof part === 'string') {
          return <span key={index}>{part}</span>;
        } else {
          return <InlineMath key={index} math={part.content} />;
        }
      })}
    </>
  );
};

interface TutorialStep {
  id: string;
  title: string;
  content: string;
  equation?: string;
  tip?: string;
  application?: string;
  highlight?: string;
}

const TUTORIAL_SECTIONS = {
  simple: {
    title: 'Simple Pendulum',
    icon: '🎯',
    steps: [
      {
        id: 'intro',
        title: 'Introduction to Simple Harmonic Motion',
        content: 'A simple pendulum consists of a mass (bob) suspended from a fixed point by a massless, inextensible string. When displaced from equilibrium and released, it oscillates back and forth due to the restoring force of gravity.',
        tip: 'Try setting a small initial angle (< 15°) to observe nearly perfect simple harmonic motion.',
      },
      {
        id: 'forces',
        title: 'Forces Acting on the Bob',
        content: 'Two forces act on the bob: gravity ($mg$ downward) and tension ($T$ along the string). The component of gravity tangent to the arc provides the restoring force: $F = -mg \\sin(\\theta)$.',
        equation: 'F_{restoring} = -mg \\sin(\\theta)',
        tip: 'The negative sign indicates the force always points toward equilibrium.',
      },
      {
        id: 'equation',
        title: 'Equation of Motion',
        content: 'Applying Newton\'s second law along the arc gives us the angular acceleration. For small angles, $\\sin(\\theta) \\approx \\theta$, leading to simple harmonic motion.',
        equation: '\\frac{d^2\\theta}{dt^2} = -\\frac{g}{L}\\sin(\\theta)',
        tip: 'The small-angle approximation breaks down above ~15°. Try larger angles to see non-linear effects!',
      },
      {
        id: 'period',
        title: 'Period and Frequency',
        content: 'The period of a simple pendulum (for small angles) depends only on length and gravitational acceleration - not on mass or amplitude! This is called isochronism.',
        equation: 'T = 2\\pi\\sqrt{\\frac{L}{g}}',
        application: 'This property made pendulum clocks possible - the period stays constant as the pendulum slowly loses energy to friction.',
      },
      {
        id: 'energy',
        title: 'Energy Conservation',
        content: 'In an ideal pendulum, total mechanical energy is conserved. At maximum displacement, all energy is potential. At the lowest point, all energy is kinetic.',
        equation: 'E_{total} = KE + PE = \\frac{1}{2}mv^2 + mgh',
        tip: 'Watch the energy graph - the total energy line should remain flat for an undamped pendulum.',
      },
      {
        id: 'applications',
        title: 'Real-World Applications',
        content: 'Simple pendulums are used in: timekeeping (pendulum clocks), measuring gravity (gravimeters), demonstrating Earth\'s rotation (Foucault pendulum), and seismometers for earthquake detection.',
        application: 'Gravimeters can detect tiny variations in local gravity, helping geologists find underground oil deposits or mineral resources.',
      },
    ],
  },
  damped: {
    title: 'Damped & Driven Oscillations',
    icon: '📉',
    steps: [
      {
        id: 'intro',
        title: 'Damping and Energy Loss',
        content: 'Real oscillators lose energy to friction, air resistance, and internal forces. This damping causes the amplitude to decrease exponentially over time while the frequency remains nearly constant.',
        tip: 'Increase the damping coefficient to see faster energy loss. Real pendulum clocks need periodic energy input!',
      },
      {
        id: 'equation',
        title: 'Damped Oscillation Equation',
        content: 'The damping force is proportional to velocity (viscous damping). This adds a velocity-dependent term to the equation of motion.',
        equation: '\\frac{d^2\\theta}{dt^2} + b\\frac{d\\theta}{dt} + \\frac{g}{L}\\sin(\\theta) = 0',
        tip: 'The coefficient $b$ determines damping strength. Higher $b$ = faster decay.',
      },
      {
        id: 'types',
        title: 'Types of Damping',
        content: 'Underdamped: oscillates with decreasing amplitude. Critically damped: returns to equilibrium fastest without oscillating. Overdamped: returns slowly without oscillating.',
        application: 'Car shock absorbers are designed to be slightly underdamped for comfort while preventing bouncing.',
      },
      {
        id: 'driven',
        title: 'Driven Oscillations',
        content: 'A periodic external force can sustain oscillations despite damping. The system eventually reaches a steady state where energy input equals energy dissipation.',
        equation: '\\frac{d^2\\theta}{dt^2} + b\\frac{d\\theta}{dt} + \\omega_0^2\\theta = A\\cos(\\omega_d t)',
        tip: 'Enable driving force and watch how the amplitude builds up over time!',
      },
      {
        id: 'resonance',
        title: 'Resonance Phenomenon',
        content: 'When the driving frequency matches the natural frequency, amplitude grows dramatically. This is resonance - the system absorbs maximum energy from the driver.',
        equation: '\\omega_{resonance} \\approx \\omega_0 = \\sqrt{\\frac{g}{L}}',
        application: 'The Tacoma Narrows Bridge collapsed in 1940 due to wind-induced resonance. Engineers now design bridges to avoid resonant frequencies.',
      },
      {
        id: 'applications',
        title: 'Applications of Damping & Resonance',
        content: 'Damping: shock absorbers, building earthquake dampers, musical instrument design. Resonance: radio tuning, MRI machines, musical instruments, microwave ovens.',
        application: 'Tuned mass dampers in skyscrapers (like Taipei 101) reduce building sway during earthquakes and strong winds.',
      },
    ],
  },
  spring: {
    title: 'Mass-Spring Oscillator',
    icon: '🔧',
    steps: [
      {
        id: 'intro',
        title: 'Hooke\'s Law and Springs',
        content: 'A mass attached to a spring experiences a restoring force proportional to displacement from equilibrium. This is Hooke\'s Law, the foundation of spring dynamics.',
        equation: 'F = -kx',
        tip: 'The spring constant $k$ measures stiffness - higher $k$ means a stiffer spring and faster oscillation.',
      },
      {
        id: 'equation',
        title: 'Equation of Motion',
        content: 'Combining Newton\'s second law with Hooke\'s Law gives us the classic simple harmonic oscillator equation.',
        equation: 'm\\frac{d^2x}{dt^2} = -kx',
        tip: 'This is mathematically identical to the small-angle pendulum! Both are simple harmonic oscillators.',
      },
      {
        id: 'period',
        title: 'Period and Frequency',
        content: 'Unlike the pendulum, the mass-spring period depends on mass. Heavier masses oscillate slower; stiffer springs oscillate faster.',
        equation: 'T = 2\\pi\\sqrt{\\frac{m}{k}}, \\quad f = \\frac{1}{2\\pi}\\sqrt{\\frac{k}{m}}',
        application: 'Car suspension systems are tuned by adjusting spring constants and damping for optimal ride comfort.',
      },
      {
        id: 'energy',
        title: 'Energy in Springs',
        content: 'Energy oscillates between kinetic (mass moving) and elastic potential (spring stretched/compressed). At equilibrium, KE is maximum; at maximum displacement, PE is maximum.',
        equation: 'E = \\frac{1}{2}kx^2 + \\frac{1}{2}mv^2',
        tip: 'The energy graph shows this transfer. Total energy remains constant without damping.',
      },
      {
        id: 'applications',
        title: 'Real-World Applications',
        content: 'Springs are everywhere: vehicle suspension, mattresses, mechanical watches, door closers, weighing scales, shock absorbers, and vibration isolation.',
        application: 'Seismometers use mass-spring systems to detect ground motion during earthquakes.',
      },
    ],
  },
  double: {
    title: 'Double Pendulum & Chaos',
    icon: '🦋',
    steps: [
      {
        id: 'intro',
        title: 'What is a Double Pendulum?',
        content: 'A double pendulum has a second pendulum attached to the first bob. This seemingly simple addition creates one of the most famous examples of chaotic motion.',
        tip: 'Enable chaos comparison to see how tiny initial differences grow exponentially!',
      },
      {
        id: 'complexity',
        title: 'Mathematical Complexity',
        content: 'Unlike the simple pendulum, the double pendulum requires coupled differential equations that cannot be solved analytically. The motion of each segment affects the other, involving terms with $\\theta_1$, $\\theta_2$, $\\dot{\\theta}_1$, and $\\dot{\\theta}_2$.',
        equation: 'Equations involve coupled terms with \\theta_1, \\theta_2, \\dot{\\theta}_1, \\dot{\\theta}_2',
        application: 'Numerical simulation is essential - this is how scientists study complex systems from weather to quantum mechanics.',
      },
      {
        id: 'chaos',
        title: 'Deterministic Chaos',
        content: 'The double pendulum is deterministic (no randomness) yet exhibits extreme sensitivity to initial conditions. Two pendulums with nearly identical starts diverge completely.',
        tip: 'This is the "Butterfly Effect" - a butterfly flapping wings could change future weather patterns.',
      },
      {
        id: 'lyapunov',
        title: 'Sensitivity to Initial Conditions',
        content: 'The rate at which nearby trajectories diverge is measured by Lyapunov exponents. Positive exponents indicate chaos - small uncertainties grow exponentially.',
        application: 'This is why long-term weather prediction is fundamentally limited, even with perfect models.',
      },
      {
        id: 'phase',
        title: 'Phase Space Visualization',
        content: 'In phase space (angle vs. velocity), the double pendulum traces complex patterns called strange attractors. Unlike periodic orbits, chaotic systems never repeat exactly.',
        tip: 'Watch the phase space diagram - chaotic motion fills regions rather than tracing closed loops.',
      },
      {
        id: 'applications',
        title: 'Chaos in Nature',
        content: 'Chaos appears everywhere: weather systems, population dynamics, heart rhythms, fluid turbulence, and even the orbits of asteroids.',
        application: 'Understanding chaos helps predict earthquake aftershocks, design secure encryption, and model ecosystem dynamics.',
      },
    ],
  },
  coupled: {
    title: 'Coupled Oscillators',
    icon: '🔗',
    steps: [
      {
        id: 'intro',
        title: 'Introduction to Coupled Systems',
        content: 'When two oscillators are connected (like pendulums joined by a spring), energy transfers between them. The combined system has new collective behaviors called normal modes.',
        tip: 'Start both pendulums at the same angle to see in-phase motion. Start one at rest to see energy transfer.',
      },
      {
        id: 'coupling',
        title: 'The Coupling Force',
        content: 'The spring connecting the pendulums creates a coupling force proportional to their difference in position. This allows energy to flow between them, described by $F_{coupling} = -k(x_1 - x_2)$.',
        equation: 'F_{coupling} = -k(x_1 - x_2)',
        application: 'Molecular vibrations work similarly - atoms connected by chemical bonds transfer energy.',
      },
      {
        id: 'modes',
        title: 'Normal Modes',
        content: 'The system has two special patterns: in-phase (both swing together) and anti-phase (swing opposite). These "normal modes" oscillate at different frequencies.',
        tip: 'In-phase mode has lower frequency; anti-phase mode has higher frequency due to the extra spring force.',
      },
      {
        id: 'beats',
        title: 'Energy Transfer and Beats',
        content: 'General motion is a combination of normal modes. When frequencies differ slightly, you see "beats" - energy periodically transfers from one oscillator to the other.',
        application: 'This explains why coupled guitar strings can exchange energy, creating characteristic sound patterns.',
      },
      {
        id: 'applications',
        title: 'Applications of Coupled Oscillators',
        content: 'Coupled oscillators model: molecular vibrations, coupled circuits, laser synchronization, neural networks, and even the synchronization of fireflies!',
        application: 'The Millennium Bridge in London wobbled due to pedestrian-bridge coupling - people synchronized their steps without realizing it.',
      },
    ],
  },
};

interface TutorialModeProps {
  currentMode: string;
  onClose: () => void;
}

const TutorialMode = ({ currentMode, onClose }: TutorialModeProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const section = TUTORIAL_SECTIONS[currentMode as keyof typeof TUTORIAL_SECTIONS] || TUTORIAL_SECTIONS.simple;
  const steps = section.steps;
  const step = steps[currentStep];
  
  const goNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };
  
  const goPrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <span className="text-2xl">{section.icon}</span>
            <div>
              <h2 className="font-bold text-foreground">{section.title}</h2>
              <p className="text-xs text-muted-foreground">Step {currentStep + 1} of {steps.length}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-secondary">
          <div 
            className="h-full bg-primary transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <h3 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            {step.title}
          </h3>
          
          <p className="text-muted-foreground leading-relaxed mb-4">
            <TextWithMath text={step.content} />
          </p>
          
          {step.equation && (
            <div className="bg-secondary/50 rounded-lg p-4 mb-4 border border-border">
              <p className="text-xs text-muted-foreground mb-2">Key Equation:</p>
              <div className="overflow-x-auto">
                <BlockMath math={step.equation} />
              </div>
            </div>
          )}
          
          {step.tip && (
            <div className="flex items-start gap-3 p-3 bg-primary/5 rounded-lg border border-primary/20 mb-4">
              <Lightbulb className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-primary mb-0.5">Tip</p>
                <p className="text-sm text-muted-foreground">
                  <TextWithMath text={step.tip} />
                </p>
              </div>
            </div>
          )}
          
          {step.application && (
            <div className="flex items-start gap-3 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <Globe className="w-5 h-5 text-accent flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-accent mb-0.5">Real-World Application</p>
                <p className="text-sm text-muted-foreground">
                  <TextWithMath text={step.application} />
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Navigation */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-secondary/20">
          <Button
            variant="outline"
            onClick={goPrev}
            disabled={currentStep === 0}
            className="gap-1"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          
          <div className="flex gap-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentStep(idx)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  idx === currentStep ? 'bg-primary' : 'bg-secondary hover:bg-muted-foreground/30'
                }`}
              />
            ))}
          </div>
          
          {currentStep < steps.length - 1 ? (
            <Button onClick={goNext} className="btn btn-primary gap-1">
              Next
              <ChevronRight className="w-4 h-4" />
            </Button>
          ) : (
            <Button onClick={onClose} className="btn btn-primary">
              Finish Tutorial
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default TutorialMode;
