import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { GreekButton } from "@/components/ui/greek-button";
import { useGame } from "@/contexts/GameContext";
import { formatTime, sessionQuotes } from "@/lib/gameData";
import { usePlankDetection } from "@/hooks/usePlankDetection";
import { PlankState, isFormValid, getStateLabel } from "@/lib/formEvaluation";
import { Square, AlertTriangle, CheckCircle2, Camera, Sparkles, Video, VideoOff } from "lucide-react";

type SessionPhase = "countdown" | "active" | "ending";

interface LocationState {
  skipCamera?: boolean;
}

const PlankSession: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { completeSession } = useGame();

  // Check if we should skip camera (manual mode)
  const locationState = location.state as LocationState | null;
  const manualMode = locationState?.skipCamera ?? false;

  const [phase, setPhase] = useState<SessionPhase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [validTime, setValidTime] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(sessionQuotes[0]);
  const [showCameraPreview, setShowCameraPreview] = useState(true);

  // Manual mode posture state (fallback when no camera)
  const [manualPostureValid, setManualPostureValid] = useState(true);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const manualPostureIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Real plank detection hook
  const {
    metrics,
    sessionMetrics,
    videoRef,
    canvasRef,
    isInitialized,
    error: detectionError,
    cameraActive,
    startDetection,
    stopDetection,
    resetSession,
  } = usePlankDetection();

  // Derive posture validity from detection metrics or manual mode
  const isPostureValid = useMemo(() => {
    if (manualMode) {
      return manualPostureValid;
    }
    return isFormValid(metrics.formState);
  }, [manualMode, manualPostureValid, metrics.formState]);

  // Get feedback text
  const feedbackText = useMemo(() => {
    if (manualMode) {
      return isPostureValid ? "Valid Posture" : "Adjust Form";
    }

    if (metrics.formState === PlankState.PERFECT_FORM) {
      return "Perfect Form!";
    }
    if (metrics.formState === PlankState.GOOD_FORM) {
      return "Valid Posture";
    }
    if (metrics.feedback.length > 0) {
      return metrics.feedback[0];
    }
    return getStateLabel(metrics.formState);
  }, [manualMode, isPostureValid, metrics]);

  // Start detection when entering active phase (non-manual mode)
  useEffect(() => {
    if (phase === "active" && !manualMode && !cameraActive) {
      startDetection();
    }
  }, [phase, manualMode, cameraActive, startDetection]);

  // Countdown phase
  useEffect(() => {
    if (phase !== "countdown") return;

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setPhase("active");
    }
  }, [phase, countdown]);

  // Active timer - track elapsed time
  useEffect(() => {
    if (phase !== "active") return;

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase]);

  // Valid time tracking - only increment when posture is valid
  useEffect(() => {
    if (phase !== "active") return;

    const validTimeInterval = setInterval(() => {
      if (isPostureValid) {
        setValidTime((prev) => prev + 1);
      }
    }, 1000);

    return () => clearInterval(validTimeInterval);
  }, [phase, isPostureValid]);

  // Manual mode: Simulated posture detection (fallback when no camera)
  useEffect(() => {
    if (phase !== "active" || !manualMode) return;

    // Change posture status randomly every 3-8 seconds
    const schedulePostureCheck = () => {
      const delay = 3000 + Math.random() * 5000;
      manualPostureIntervalRef.current = setTimeout(() => {
        // 80% chance of valid posture
        setManualPostureValid(Math.random() > 0.2);
        schedulePostureCheck();
      }, delay);
    };

    schedulePostureCheck();

    return () => {
      if (manualPostureIntervalRef.current) clearTimeout(manualPostureIntervalRef.current);
    };
  }, [phase, manualMode]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    if (phase !== "active") return;

    const quoteInterval = setInterval(() => {
      const randomQuote = sessionQuotes[Math.floor(Math.random() * sessionQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, [phase]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopDetection();
      resetSession();
    };
  }, [stopDetection, resetSession]);

  const handleStop = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (manualPostureIntervalRef.current) clearTimeout(manualPostureIntervalRef.current);

    // Stop detection
    stopDetection();

    // Use session metrics from detection if available, otherwise use local tracking
    const formMetrics = !manualMode ? {
      perfectFormTime: sessionMetrics.perfectFormTime,
      goodFormTime: sessionMetrics.goodFormTime,
      needsAdjustmentTime: sessionMetrics.needsAdjustmentTime,
      poorFormTime: sessionMetrics.poorFormTime,
      notDetectedTime: sessionMetrics.notDetectedTime,
      avgScore: sessionMetrics.avgScore,
    } : undefined;

    const result = await completeSession(validTime, elapsedTime, formMetrics);

    // Navigate to result with state
    navigate("/plank/result", { state: result });
  }, [completeSession, validTime, elapsedTime, navigate, stopDetection, manualMode, sessionMetrics]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-between p-6">
      {/* Camera Preview (top-right corner) */}
      {!manualMode && phase === "active" && (
        <div className="fixed top-4 right-4 z-40">
          <AnimatePresence>
            {showCameraPreview && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8, x: 20 }}
                animate={{ opacity: 1, scale: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.8, x: 20 }}
                className="relative"
              >
                {/* Camera feed */}
                <div className="w-32 h-24 md:w-48 md:h-36 rounded-lg overflow-hidden border-2 border-border bg-black shadow-lg">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  <canvas ref={canvasRef} className="hidden" />

                  {/* Status indicator */}
                  <div className="absolute top-2 left-2 flex items-center gap-1">
                    <div className={`w-2 h-2 rounded-full ${cameraActive ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                    <span className="text-[10px] text-white/80 font-medium">
                      {cameraActive ? "LIVE" : "OFF"}
                    </span>
                  </div>
                </div>

                {/* Toggle button */}
                <button
                  onClick={() => setShowCameraPreview(false)}
                  className="absolute -bottom-2 -right-2 w-6 h-6 rounded-full bg-muted border border-border flex items-center justify-center hover:bg-muted/80 transition-colors"
                >
                  <VideoOff className="w-3 h-3" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Show camera button when hidden */}
          {!showCameraPreview && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              onClick={() => setShowCameraPreview(true)}
              className="w-10 h-10 rounded-full bg-muted/80 border border-border flex items-center justify-center hover:bg-muted transition-colors"
            >
              <Video className="w-5 h-5" />
            </motion.button>
          )}
        </div>
      )}

      {/* Detection Error Banner */}
      {detectionError && !manualMode && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 left-4 z-40 bg-destructive/20 border border-destructive/50 rounded-lg px-4 py-2 max-w-xs"
        >
          <p className="text-destructive font-semibold text-sm">Camera Error</p>
          <p className="text-destructive/80 text-xs">{detectionError}</p>
        </motion.div>
      )}

      {/* Countdown overlay */}
      <AnimatePresence>
        {phase === "countdown" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-50 bg-background flex items-center justify-center"
          >
            <motion.div
              key={countdown}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="text-9xl font-serif font-bold text-primary"
            >
              {countdown || "GO!"}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="w-full text-center pt-8">
        <h1 className="text-lg font-serif text-muted-foreground uppercase tracking-wider">
          Time Under Tension
        </h1>
        {!manualMode && (
          <p className="text-xs text-muted-foreground/60 mt-1">
            <Camera className="w-3 h-3 inline mr-1" />
            AI Detection Active
          </p>
        )}
      </div>

      {/* Timer */}
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Main timer */}
        <motion.div
          animate={isPostureValid ? { scale: [1, 1.02, 1] } : { scale: 1 }}
          transition={{ duration: 1, repeat: isPostureValid ? Infinity : 0 }}
          className="relative mb-8"
        >
          {/* Glow effect */}
          <div
            className={`absolute inset-0 blur-3xl transition-opacity duration-500 ${
              isPostureValid ? "opacity-30" : "opacity-0"
            }`}
            style={{
              background: "radial-gradient(circle, hsl(var(--gold)), transparent)",
            }}
          />

          <div className="relative text-7xl md:text-8xl font-serif font-bold text-foreground tabular-nums">
            {formatTime(elapsedTime)}
          </div>
        </motion.div>

        {/* Valid time counter */}
        <div className="text-center mb-6">
          <p className="text-sm text-muted-foreground mb-1">Time Conquered</p>
          <p className="text-2xl font-serif font-semibold text-primary">
            {formatTime(validTime)}
          </p>
        </div>

        {/* Posture indicator */}
        <motion.div
          animate={{
            backgroundColor: isPostureValid
              ? metrics.formState === PlankState.PERFECT_FORM
                ? "hsl(var(--gold) / 0.2)"
                : "hsl(var(--gold) / 0.15)"
              : "hsl(var(--destructive) / 0.15)",
            borderColor: isPostureValid
              ? metrics.formState === PlankState.PERFECT_FORM
                ? "hsl(var(--gold) / 0.7)"
                : "hsl(var(--gold) / 0.5)"
              : "hsl(var(--destructive) / 0.5)",
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border transition-colors"
        >
          {isPostureValid ? (
            <>
              {metrics.formState === PlankState.PERFECT_FORM ? (
                <Sparkles className="w-5 h-5 text-primary" />
              ) : (
                <CheckCircle2 className="w-5 h-5 text-primary" />
              )}
              <span className="text-primary font-semibold uppercase tracking-wide">
                {feedbackText}
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-semibold uppercase tracking-wide text-sm">
                {feedbackText}
              </span>
            </>
          )}
        </motion.div>

        {/* Form Score Indicator (only in detection mode) */}
        {!manualMode && metrics.isLandmarksVisible && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-center"
          >
            <p className="text-xs text-muted-foreground mb-1.5">Form Quality</p>
            <div className="flex items-center gap-2 justify-center">
              <div className="w-28 h-2 bg-border rounded-full overflow-hidden">
                <motion.div
                  animate={{ width: `${metrics.score}%` }}
                  transition={{ duration: 0.3 }}
                  className={`h-full rounded-full ${
                    metrics.score >= 90 ? "bg-primary" :
                    metrics.score >= 75 ? "bg-green-500" :
                    metrics.score >= 50 ? "bg-orange-500" : "bg-destructive"
                  }`}
                />
              </div>
              <span className="text-xs font-semibold tabular-nums w-8">
                {Math.round(metrics.score)}
              </span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quote */}
      <AnimatePresence mode="wait">
        <motion.p
          key={currentQuote}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="text-center text-muted-foreground italic text-sm max-w-xs mb-8"
        >
          "{currentQuote}"
        </motion.p>
      </AnimatePresence>

      {/* Stop button */}
      <GreekButton
        variant="destructive"
        size="xl"
        onClick={handleStop}
        className="w-full max-w-xs gap-2"
      >
        <Square className="w-5 h-5" />
        End Session
      </GreekButton>
    </div>
  );
};

export default PlankSession;
