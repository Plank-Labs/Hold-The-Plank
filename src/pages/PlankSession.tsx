import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { GreekButton } from "@/components/ui/greek-button";
import { useGame } from "@/contexts/GameContext";
import { formatTime, sessionQuotes } from "@/lib/gameData";
import { Square, AlertTriangle, CheckCircle2 } from "lucide-react";

type SessionPhase = "countdown" | "active" | "ending";

const PlankSession: React.FC = () => {
  const navigate = useNavigate();
  const { completeSession } = useGame();
  
  const [phase, setPhase] = useState<SessionPhase>("countdown");
  const [countdown, setCountdown] = useState(3);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isPostureValid, setIsPostureValid] = useState(true);
  const [validTime, setValidTime] = useState(0);
  const [currentQuote, setCurrentQuote] = useState(sessionQuotes[0]);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const postureIntervalRef = useRef<NodeJS.Timeout | null>(null);

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

  // Active timer
  useEffect(() => {
    if (phase !== "active") return;

    intervalRef.current = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
      if (isPostureValid) {
        setValidTime((prev) => prev + 1);
      }
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [phase, isPostureValid]);

  // Simulated posture detection (randomly toggles for demo)
  useEffect(() => {
    if (phase !== "active") return;

    // Change posture status randomly every 3-8 seconds
    const schedulePostureCheck = () => {
      const delay = 3000 + Math.random() * 5000;
      postureIntervalRef.current = setTimeout(() => {
        // 80% chance of valid posture
        setIsPostureValid(Math.random() > 0.2);
        schedulePostureCheck();
      }, delay);
    };

    schedulePostureCheck();

    return () => {
      if (postureIntervalRef.current) clearTimeout(postureIntervalRef.current);
    };
  }, [phase]);

  // Rotate quotes every 10 seconds
  useEffect(() => {
    if (phase !== "active") return;

    const quoteInterval = setInterval(() => {
      const randomQuote = sessionQuotes[Math.floor(Math.random() * sessionQuotes.length)];
      setCurrentQuote(randomQuote);
    }, 10000);

    return () => clearInterval(quoteInterval);
  }, [phase]);

  const handleStop = useCallback(async () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (postureIntervalRef.current) clearTimeout(postureIntervalRef.current);

    const result = await completeSession(validTime);

    // Navigate to result with state
    navigate("/plank/result", { state: result });
  }, [completeSession, validTime, navigate]);

  return (
    <div className="fixed inset-0 bg-background flex flex-col items-center justify-between p-6">
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
              ? "hsl(var(--gold) / 0.15)"
              : "hsl(var(--destructive) / 0.15)",
            borderColor: isPostureValid
              ? "hsl(var(--gold) / 0.5)"
              : "hsl(var(--destructive) / 0.5)",
          }}
          className="flex items-center gap-2 px-6 py-3 rounded-full border transition-colors"
        >
          {isPostureValid ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-primary" />
              <span className="text-primary font-semibold uppercase tracking-wide">
                Valid Posture
              </span>
            </>
          ) : (
            <>
              <AlertTriangle className="w-5 h-5 text-destructive" />
              <span className="text-destructive font-semibold uppercase tracking-wide">
                Adjust Form
              </span>
            </>
          )}
        </motion.div>
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
