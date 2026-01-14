/**
 * FormTimeBar Component
 *
 * Displays a progress bar showing time spent in a particular form state.
 * Used in PlankResult to visualize form breakdown.
 */

import { motion } from "framer-motion";
import { formatTime } from "@/lib/gameData";

interface FormTimeBarProps {
  label: string;
  time: number; // seconds
  total: number; // total seconds
  color: "gold" | "green" | "orange" | "red" | "gray";
  showPercentage?: boolean;
  animate?: boolean;
}

const colorClasses = {
  gold: "bg-primary",
  green: "bg-green-500",
  orange: "bg-orange-500",
  red: "bg-red-500",
  gray: "bg-gray-500",
};

const textColorClasses = {
  gold: "text-primary",
  green: "text-green-500",
  orange: "text-orange-500",
  red: "text-red-500",
  gray: "text-gray-500",
};

export function FormTimeBar({
  label,
  time,
  total,
  color,
  showPercentage = true,
  animate = true,
}: FormTimeBarProps) {
  const percentage = total > 0 ? Math.round((time / total) * 100) : 0;
  const widthPercentage = total > 0 ? (time / total) * 100 : 0;

  return (
    <div className="space-y-1.5">
      {/* Label Row */}
      <div className="flex items-center justify-between text-sm">
        <span className={`font-medium ${textColorClasses[color]}`}>{label}</span>
        <div className="flex items-center gap-2 text-muted-foreground">
          <span className="tabular-nums">{formatTime(Math.round(time))}</span>
          {showPercentage && (
            <span className="text-xs">({percentage}%)</span>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2.5 bg-border rounded-full overflow-hidden">
        <motion.div
          initial={animate ? { width: 0 } : { width: `${widthPercentage}%` }}
          animate={{ width: `${widthPercentage}%` }}
          transition={animate ? { duration: 0.8, ease: "easeOut", delay: 0.2 } : {}}
          className={`h-full rounded-full ${colorClasses[color]}`}
        />
      </div>
    </div>
  );
}

/**
 * FormBreakdown Component
 *
 * Displays a complete breakdown of form quality during a session.
 */
interface FormBreakdownProps {
  perfectFormTime: number;
  goodFormTime: number;
  needsAdjustmentTime: number;
  poorFormTime: number;
  notDetectedTime: number;
  totalTime: number;
  avgScore: number;
}

export function FormBreakdown({
  perfectFormTime,
  goodFormTime,
  needsAdjustmentTime,
  poorFormTime,
  notDetectedTime,
  totalTime,
  avgScore,
}: FormBreakdownProps) {
  // Valid time is good + perfect (note: perfect is a subset of good in our tracking)
  // We need to calculate non-perfect good time
  const nonPerfectGoodTime = Math.max(0, goodFormTime - perfectFormTime);

  return (
    <div className="space-y-4">
      {/* Header */}
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
        Form Analysis
      </h3>

      {/* Progress Bars */}
      <div className="space-y-3">
        {perfectFormTime > 0 && (
          <FormTimeBar
            label="Perfect Form"
            time={perfectFormTime}
            total={totalTime}
            color="gold"
          />
        )}

        {nonPerfectGoodTime > 0 && (
          <FormTimeBar
            label="Good Form"
            time={nonPerfectGoodTime}
            total={totalTime}
            color="green"
          />
        )}

        {needsAdjustmentTime > 0 && (
          <FormTimeBar
            label="Needs Adjustment"
            time={needsAdjustmentTime}
            total={totalTime}
            color="orange"
          />
        )}

        {poorFormTime > 0 && (
          <FormTimeBar
            label="Poor Form"
            time={poorFormTime}
            total={totalTime}
            color="red"
          />
        )}

        {notDetectedTime > 0 && (
          <FormTimeBar
            label="Not Detected"
            time={notDetectedTime}
            total={totalTime}
            color="gray"
          />
        )}
      </div>

      {/* Average Score */}
      <div className="flex items-center justify-between pt-3 border-t border-border">
        <span className="text-sm text-muted-foreground">Average Form Score</span>
        <div className="flex items-center gap-2">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="text-2xl font-serif font-bold text-primary"
          >
            {Math.round(avgScore)}
          </motion.span>
          <span className="text-sm text-muted-foreground">/100</span>
        </div>
      </div>
    </div>
  );
}

/**
 * ScoreGauge Component
 *
 * Circular gauge showing the form score.
 */
interface ScoreGaugeProps {
  score: number;
  size?: "sm" | "md" | "lg";
  animate?: boolean;
}

export function ScoreGauge({ score, size = "md", animate = true }: ScoreGaugeProps) {
  const sizeConfig = {
    sm: { container: "w-16 h-16", text: "text-lg", stroke: 6 },
    md: { container: "w-24 h-24", text: "text-2xl", stroke: 8 },
    lg: { container: "w-32 h-32", text: "text-3xl", stroke: 10 },
  };

  const config = sizeConfig[size];
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  // Determine color based on score
  const getScoreColor = () => {
    if (score >= 90) return "stroke-primary"; // gold
    if (score >= 75) return "stroke-green-500";
    if (score >= 50) return "stroke-orange-500";
    return "stroke-red-500";
  };

  return (
    <div className={`relative ${config.container}`}>
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          className="stroke-border"
        />
        {/* Progress circle */}
        <motion.circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          strokeWidth={config.stroke}
          strokeLinecap="round"
          className={getScoreColor()}
          initial={animate ? { strokeDashoffset: circumference } : { strokeDashoffset }}
          animate={{ strokeDashoffset }}
          transition={animate ? { duration: 1, ease: "easeOut" } : {}}
          style={{ strokeDasharray: circumference }}
        />
      </svg>
      {/* Score text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.span
          initial={animate ? { opacity: 0 } : { opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className={`font-serif font-bold ${config.text}`}
        >
          {Math.round(score)}
        </motion.span>
      </div>
    </div>
  );
}

export default FormTimeBar;
