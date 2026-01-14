import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { GreekButton } from "@/components/ui/greek-button";
import { useGame } from "@/contexts/GameContext";
import { formatTime, SessionResult } from "@/lib/gameData";
import { FormBreakdown, ScoreGauge } from "@/components/FormTimeBar";
import TimeTower from "@/components/TimeTower";
import {
  Clock,
  Sparkles,
  Coins,
  Heart,
  RefreshCw,
  Home,
  Eye,
  Timer,
  Target,
} from "lucide-react";

const PlankResult: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { userGuild, user } = useGame();

  const result = location.state as SessionResult | undefined;

  // Redirect if no result data
  if (!result) {
    navigate("/");
    return null;
  }

  // Check if we have form metrics (AI detection was used)
  const hasFormMetrics = !!result.formMetrics;

  const statCards = [
    {
      icon: <Sparkles className="w-5 h-5" />,
      label: "Aura Points",
      value: `+${result.auraPointsGained}`,
      color: "text-primary",
      bg: "bg-primary/10",
    },
    {
      icon: <Coins className="w-5 h-5" />,
      label: "$PLANK Earned",
      value: `+${result.plankReward}`,
      color: "text-accent",
      bg: "bg-accent/10",
    },
    {
      icon: <Heart className="w-5 h-5" />,
      label: "Life Time Gained",
      value: result.lifeTimeGained,
      color: "text-pink-400",
      bg: "bg-pink-500/10",
    },
  ];

  return (
    <div className="min-h-[calc(100vh-8rem)] flex flex-col items-center py-8 px-4">
      {/* Victory header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.2 }}
          className="text-6xl mb-4"
        >
          ⚔️
        </motion.div>
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-2">
          Time Conquered
        </h1>
        <p className="text-muted-foreground">
          Kronos trembles at your resolve
        </p>
      </motion.div>

      {/* Main time display with both total and valid time */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="relative mb-8 w-full max-w-md"
      >
        <div className="absolute inset-0 blur-3xl opacity-30 bg-primary rounded-full" />
        <div className="relative greek-border rounded-xl p-6 bg-card">
          {/* Valid Time - Primary */}
          <div className="text-center mb-4">
            <Clock className="w-8 h-8 text-primary mx-auto mb-2" />
            <p className="text-5xl md:text-6xl font-serif font-bold text-foreground tabular-nums">
              {formatTime(result.validTimeSeconds)}
            </p>
            <p className="text-muted-foreground mt-2 text-sm uppercase tracking-wider">
              Valid Time
            </p>
          </div>

          {/* Total Time - Secondary (only show if different from valid) */}
          {result.totalTimeSeconds > result.validTimeSeconds && (
            <div className="flex items-center justify-center gap-4 pt-4 border-t border-border">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Timer className="w-4 h-4" />
                <span className="text-sm">Total Time:</span>
                <span className="font-semibold text-foreground">
                  {formatTime(result.totalTimeSeconds)}
                </span>
              </div>
              <div className="flex items-center gap-2 text-primary">
                <Target className="w-4 h-4" />
                <span className="text-sm">Accuracy:</span>
                <span className="font-semibold">
                  {Math.round((result.validTimeSeconds / result.totalTimeSeconds) * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Form Analysis Section (only when AI detection was used) */}
      {hasFormMetrics && result.formMetrics && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-md mb-8"
        >
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Form Analysis
              </h3>
              <ScoreGauge score={result.formMetrics.avgScore} size="sm" />
            </div>

            <FormBreakdown
              perfectFormTime={result.formMetrics.perfectFormTime}
              goodFormTime={result.formMetrics.goodFormTime}
              needsAdjustmentTime={result.formMetrics.needsAdjustmentTime}
              poorFormTime={result.formMetrics.poorFormTime}
              notDetectedTime={result.formMetrics.notDetectedTime}
              totalTime={result.totalTimeSeconds}
              avgScore={result.formMetrics.avgScore}
            />
          </div>
        </motion.div>
      )}

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="grid grid-cols-3 gap-3 w-full max-w-md mb-8"
      >
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + index * 0.1 }}
            className={`p-4 rounded-lg ${stat.bg} text-center`}
          >
            <div className={`${stat.color} flex justify-center mb-2`}>
              {stat.icon}
            </div>
            <p className={`text-lg font-serif font-bold ${stat.color}`}>
              {stat.value}
            </p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">
              {stat.label}
            </p>
          </motion.div>
        ))}
      </motion.div>

      {/* Guild tower growth */}
      {userGuild && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full max-w-md p-4 rounded-lg border border-border bg-card mb-8"
        >
          <div className="flex items-center gap-4">
            <TimeTower
              totalSeconds={userGuild.totalTimeConquered}
              size="md"
              animate
              maxSeconds={86400}
            />
            <div className="flex-1">
              <p className="text-sm text-muted-foreground mb-1">
                Guild Time Tower
              </p>
              <p className="font-serif font-semibold text-foreground">
                {userGuild.name}
              </p>
              <p className="text-xs text-primary mt-1">
                +{formatTime(result.validTimeSeconds)} added to tower
              </p>
            </div>
            <span className="text-3xl">{userGuild.emblem}</span>
          </div>
        </motion.div>
      )}

      {/* Reward Status Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.8 }}
        className="w-full max-w-md mb-4 p-4 rounded-lg bg-primary/10 border border-primary/30"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Coins className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">
              +{result.plankReward} $PLANK Queued
            </p>
            <p className="text-xs text-muted-foreground">
              Rewards are processed automatically by the relayer
            </p>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="text-[10px] text-muted-foreground text-center max-w-xs mb-6"
      >
        Life time estimates are theoretical, inspired by population studies. Not
        personal medical advice.
      </motion.p>

      {/* Action buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1 }}
        className="w-full max-w-md space-y-3"
      >
        <GreekButton
          variant="primary"
          size="lg"
          onClick={() => navigate("/plank/technique")}
          className="w-full gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Conquer Again
        </GreekButton>
        <div className="grid grid-cols-2 gap-3">
          <GreekButton
            variant="secondary"
            size="md"
            onClick={() => navigate("/")}
            className="gap-2"
          >
            <Home className="w-4 h-4" />
            Home
          </GreekButton>
          {userGuild && (
            <GreekButton
              variant="secondary"
              size="md"
              onClick={() => navigate("/guild")}
              className="gap-2"
            >
              <Eye className="w-4 h-4" />
              View Guild
            </GreekButton>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PlankResult;
