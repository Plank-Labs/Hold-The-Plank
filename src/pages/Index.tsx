import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { GreekButton } from "@/components/ui/greek-button";
import StatsCard from "@/components/StatsCard";
import StreakIndicator from "@/components/StreakIndicator";
import GuildCard from "@/components/GuildCard";
import Onboarding from "@/components/Onboarding";
import { formatTimeReadable, shortenAddress } from "@/lib/gameData";
import { Card } from "@/components/ui/card";
import {
  Clock,
  Sparkles,
  Coins,
  Trophy,
  Swords,
  Users,
  ChevronRight,
  QrCode,
  Building2,
} from "lucide-react";

const Index: React.FC = () => {
  const navigate = useNavigate();
  const {
    isConnected,
    user,
    userGuild,
    hasSeenOnboarding,
    setHasSeenOnboarding,
  } = useGame();
  const [showOnboarding, setShowOnboarding] = useState(!hasSeenOnboarding);

  // Show onboarding for new users
  if (showOnboarding && !hasSeenOnboarding) {
    return <Onboarding onComplete={() => setShowOnboarding(false)} />;
  }

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto">
        {!isConnected ? (
          // Disconnected state - landing page
          <DisconnectedView />
        ) : (
          // Connected state - dashboard
          <ConnectedDashboard
            user={user}
            userGuild={userGuild}
            onNavigate={navigate}
          />
        )}
      </div>
    </AppLayout>
  );
};

// Landing page for disconnected users
const DisconnectedView: React.FC = () => {
  return (
    <div className="min-h-[calc(100vh-10rem)] flex flex-col items-center justify-center text-center px-4">
      {/* Hero icon */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="relative">
          <div className="absolute inset-0 blur-3xl bg-primary/20 rounded-full" />
          <div className="relative w-24 h-24 rounded-2xl bg-card border border-border flex items-center justify-center">
            <Swords className="w-12 h-12 text-primary" />
          </div>
        </div>
      </motion.div>

      {/* Hero text */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-8"
      >
        <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground mb-4">
          Conquer Plank
        </h1>
        <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
          There are apps to conquer space.
          <br />
          <span className="text-primary font-medium">
            Conquer Plank lets you conquer time.
          </span>
        </p>
      </motion.div>

      {/* Features */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-4 mb-10 w-full max-w-sm"
      >
        {[
          { icon: <Clock className="w-5 h-5" />, label: "Conquer Time" },
          { icon: <Sparkles className="w-5 h-5" />, label: "Earn Aura" },
          { icon: <Coins className="w-5 h-5" />, label: "Claim $PLANK" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center gap-2 p-3 rounded-lg bg-card border border-border"
          >
            <div className="text-primary">{item.icon}</div>
            <span className="text-xs text-muted-foreground">{item.label}</span>
          </div>
        ))}
      </motion.div>

      {/* Slogan */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-muted-foreground italic mb-8 max-w-xs"
      >
        "Time under tension is time you steal from Kronos."
      </motion.p>

      {/* CTA - handled by WalletButton in header */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-sm text-muted-foreground"
      >
        Connect your wallet to begin
      </motion.p>
    </div>
  );
};

// Dashboard for connected users
interface ConnectedDashboardProps {
  user: any;
  userGuild: any;
  onNavigate: (path: string) => void;
}

const ConnectedDashboard: React.FC<ConnectedDashboardProps> = ({
  user,
  userGuild,
  onNavigate,
}) => {
  return (
    <div className="space-y-6 pb-8">
      {/* Greeting */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-serif font-bold text-foreground">
            Conquer Time
          </h1>
          <p className="text-sm text-muted-foreground">
            {user.username} • {shortenAddress(user.walletAddress)}
          </p>
        </div>
        <StreakIndicator
          currentStreak={user.currentStreakDays}
          longestStreak={user.longestStreakDays}
        />
      </motion.div>

      {/* Stats grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 gap-3"
      >
        <StatsCard
          icon={<Clock className="w-5 h-5" />}
          label="Total Conquered"
          value={formatTimeReadable(user.totalTimeConquered)}
          subValue="This season"
          variant="gold"
        />
        <StatsCard
          icon={<Trophy className="w-5 h-5" />}
          label="Best Plank"
          value={formatTimeReadable(user.bestPlankTime)}
          variant="bronze"
        />
        <StatsCard
          icon={<Sparkles className="w-5 h-5" />}
          label="Aura Points"
          value={user.auraPoints.toLocaleString()}
          subValue="Time essence"
        />
        <StatsCard
          icon={<Coins className="w-5 h-5" />}
          label="$PLANK Balance"
          value={user.plankBalance.toLocaleString()}
          subValue="On Mantle"
        />
      </motion.div>

      {/* Main CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <GreekButton
          variant="conquest"
          size="xl"
          onClick={() => onNavigate("/plank/technique")}
          className="w-full gap-3"
        >
          <Swords className="w-6 h-6" />
          Conquer Plank
        </GreekButton>
      </motion.div>

      {/* Guild section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <h2 className="font-serif font-semibold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-primary" />
            Your Guild
          </h2>
          <button
            onClick={() => onNavigate("/rankings")}
            className="text-xs text-primary flex items-center gap-1 hover:underline"
          >
            View Rankings
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {userGuild ? (
          <GuildCard
            guild={userGuild}
            isUserGuild
            onClick={() => onNavigate("/guild")}
          />
        ) : (
          <div className="p-6 rounded-lg border border-dashed border-border bg-card/50 text-center">
            <Users className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground mb-3">
              Join a guild to grow your Time Tower together
            </p>
            <GreekButton
              variant="secondary"
              size="sm"
              onClick={() => onNavigate("/rankings")}
            >
              Find a Guild
            </GreekButton>
          </div>
        )}
      </motion.div>

      {/* Gym Referral Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="space-y-3"
      >
        <h2 className="font-serif font-semibold text-foreground flex items-center gap-2">
          <Building2 className="w-4 h-4 text-primary" />
          Gym Recognition
        </h2>

        <Card className="border-[#C5A572]/20 bg-[#16213e]/40 p-4 relative overflow-hidden group">
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="bg-[#C5A572]/10 p-4 rounded-2xl group-hover:scale-110 transition-transform">
              <QrCode className="w-8 h-8 text-[#C5A572]" />
            </div>
            <div className="text-center sm:text-left grow">
              <h4 className="font-bold text-white">At the Gym?</h4>
              <p className="text-xs text-gray-400">Scan our QR code at participating gyms to gain bonus Aura and link your session.</p>
            </div>
            <GreekButton
              size="sm"
              onClick={() => onNavigate("/gym/scan")}
              className="whitespace-nowrap"
            >
              Scan QR
            </GreekButton>
          </div>
        </Card>

        <button
          onClick={() => onNavigate("/gym/dashboard")}
          className="w-full py-2 text-[10px] text-gray-500 uppercase tracking-widest hover:text-[#C5A572] transition-colors"
        >
          Gym Owner Dashboard
        </button>
      </motion.div>

      {/* Motivational quote */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center py-4"
      >
        <p className="text-xs text-muted-foreground italic">
          "Don't just pass time. Conquer it."
        </p>
      </motion.div>
    </div>
  );
};

export default Index;
