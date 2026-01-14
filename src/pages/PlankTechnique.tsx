import { motion } from "framer-motion";
import { GreekButton } from "@/components/ui/greek-button";
import { CheckCircle2, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

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

const PlankTechnique: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center justify-center px-4 py-8">
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

        {/* Subtle overlay for text readability if needed later, but keeping it cinematic for now */}
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
          onClick={() => navigate("/plank/session")}
          className="w-full"
        >
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
    </div>
  );
};

export default PlankTechnique;
