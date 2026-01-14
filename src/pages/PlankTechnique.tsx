import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GreekButton } from "@/components/ui/greek-button";
import { CheckCircle2, AlertCircle, Camera, CameraOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import CameraPermissionPrompt from "@/components/CameraPermissionPrompt";

const plankRules = [
  {
    icon: "📐",
    text: "Shoulders, hips, and heels aligned in a straight line",
  },
  {
    icon: "⚖️",
    text: "Hips not too high, not sagging low",
  },
  {
    icon: "🦵",
    text: "Knees off the ground, core engaged",
  },
];

type ViewState = "technique" | "camera-permission";

const PlankTechnique: React.FC = () => {
  const navigate = useNavigate();
  const [viewState, setViewState] = useState<ViewState>("technique");

  /**
   * Handle the "I'm Ready" button click.
   * Shows camera permission prompt before starting.
   */
  const handleStartClick = useCallback(() => {
    setViewState("camera-permission");
  }, []);

  /**
   * Camera permission granted - start the session.
   */
  const handleCameraPermissionGranted = useCallback(() => {
    navigate("/plank/session");
  }, [navigate]);

  /**
   * Skip camera - start in manual mode.
   */
  const handleSkipCamera = useCallback(() => {
    navigate("/plank/session", { state: { skipCamera: true } });
  }, [navigate]);

  /**
   * Back to technique view.
   */
  const handleBackToTechnique = useCallback(() => {
    setViewState("technique");
  }, []);

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8">
      <AnimatePresence mode="wait">
        {/* Camera Permission View */}
        {viewState === "camera-permission" && (
          <motion.div
            key="camera-permission"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="w-full max-w-sm"
          >
            <CameraPermissionPrompt
              onPermissionGranted={handleCameraPermissionGranted}
              onSkip={handleSkipCamera}
            />

            {/* Back button */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-6"
            >
              <GreekButton
                variant="ghost"
                size="md"
                onClick={handleBackToTechnique}
                className="w-full"
              >
                Back to Technique
              </GreekButton>
            </motion.div>
          </motion.div>
        )}

        {/* Technique View */}
        {viewState === "technique" && (
          <motion.div
            key="technique"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="w-full flex flex-col items-center"
          >
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center mb-8"
            >
              <h1 className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-2">
                Prepare for Battle
              </h1>
              <p className="text-muted-foreground">
                Master your form before challenging Kronos
              </p>
            </motion.div>

            {/* Hero Image / Plank Technique Illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="relative w-full max-w-sm aspect-video mb-8 rounded-2xl overflow-hidden bg-zinc-950 border border-yellow-500/20 shadow-[0_0_30px_rgba(0,0,0,0.5)]"
            >
              <img
                src="/elbow_plank_hero.jpg"
                alt="Ancient Greek athlete in perfect elbow plank form"
                className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              />

              {/* Subtle overlay for text readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
            </motion.div>

            {/* Rules */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="w-full max-w-sm space-y-3 mb-8"
            >
              {plankRules.map((rule, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 rounded-lg bg-card border border-border"
                >
                  <span className="text-2xl">{rule.icon}</span>
                  <span className="text-sm text-foreground flex-1">{rule.text}</span>
                  <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                </motion.div>
              ))}
            </motion.div>

            {/* AI Detection Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex items-center gap-2 text-xs text-primary bg-primary/10 rounded-lg px-4 py-2.5 mb-4 max-w-sm w-full"
            >
              <Camera className="w-4 h-4 flex-shrink-0" />
              <span>
                AI-powered form detection will validate your posture in real-time
              </span>
            </motion.div>

            {/* Warning */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-start gap-2 text-xs text-muted-foreground mb-8 max-w-sm text-center"
            >
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Invalid posture will pause your time. Only valid seconds count toward your conquest.
              </span>
            </motion.div>

            {/* Action buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
              className="w-full max-w-sm space-y-3"
            >
              <GreekButton
                variant="conquest"
                size="xl"
                onClick={handleStartClick}
                className="w-full gap-2"
              >
                <Camera className="w-5 h-5" />
                I'm Ready
              </GreekButton>
              <GreekButton
                variant="ghost"
                size="md"
                onClick={() => navigate("/")}
                className="w-full"
              >
                Back
              </GreekButton>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PlankTechnique;
