import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import AppLayout from "@/components/layout/AppLayout";
import { useGame } from "@/contexts/GameContext";
import { useNavigate } from "react-router-dom";
import { GreekButton } from "@/components/ui/greek-button";
import StatsCard from "@/components/StatsCard";
import { Input } from "@/components/ui/input";
import { formatTimeReadable, shortenAddress } from "@/lib/gameData";
import { RELIC_TOKENS_ARRAY } from "@/lib/contracts";
import {
  User,
  Clock,
  Trophy,
  Sparkles,
  Coins,
  Flame,
  Shield,
  Edit2,
  Check,
  X,
  Loader2,
  Plus,
  Award,
} from "lucide-react";

const Profile: React.FC = () => {
  const navigate = useNavigate();
  const {
    user,
    updateUsername,
    userGuild,
    createGuild,
    mintRelic,
    isMintingRelic,
    claimedRelics,
    isConnected,
  } = useGame();

  const [isEditingName, setIsEditingName] = useState(false);
  const [newName, setNewName] = useState(user.username);
  const [showCreateGuild, setShowCreateGuild] = useState(false);
  const [guildName, setGuildName] = useState("");
  const [guildEmblem, setGuildEmblem] = useState("⚔️");
  const [guildDescription, setGuildDescription] = useState("");

  const emblems = ["⚔️", "🛡️", "🏛️", "⚡", "🔥", "🌙", "☀️", "🦅", "🦁", "🐺"];

  // Find the first eligible relic that hasn't been claimed yet
  const nextMintableRelic = useMemo(() => {
    return RELIC_TOKENS_ARRAY.find(
      (relic) =>
        user.totalTimeConquered >= relic.requirement &&
        !claimedRelics[Number(relic.id) - 1]
    );
  }, [user.totalTimeConquered, claimedRelics]);

  // Check if user has any claimed relics
  const hasClaimedAnyRelic = claimedRelics.some((claimed) => claimed);

  if (!isConnected) {
    navigate("/");
    return null;
  }

  const handleSaveName = () => {
    if (newName.trim()) {
      updateUsername(newName.trim());
      setIsEditingName(false);
    }
  };

  const handleMintRelic = async () => {
    if (!nextMintableRelic) return;
    await mintRelic(Number(nextMintableRelic.id));
  };

  const handleCreateGuild = () => {
    if (guildName.trim()) {
      createGuild(guildName.trim(), guildEmblem, guildDescription.trim());
      setShowCreateGuild(false);
      navigate("/guild");
    }
  };

  const canMintRelic = !!nextMintableRelic;

  return (
    <AppLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Profile header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-4"
        >
          <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center text-3xl">
            {user.avatar}
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <Input
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-9 text-lg font-serif"
                  autoFocus
                />
                <button
                  onClick={handleSaveName}
                  className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setNewName(user.username);
                    setIsEditingName(false);
                  }}
                  className="p-2 text-muted-foreground hover:bg-muted rounded-lg"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-serif font-bold text-foreground">
                  {user.username}
                </h1>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground">
              {shortenAddress(user.walletAddress)}
            </p>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 gap-3"
        >
          <StatsCard
            icon={<Trophy className="w-5 h-5" />}
            label="Best Plank"
            value={formatTimeReadable(user.bestPlankTime)}
            variant="gold"
          />
          <StatsCard
            icon={<Clock className="w-5 h-5" />}
            label="Total Conquered"
            value={formatTimeReadable(user.totalTimeConquered)}
            variant="bronze"
          />
          <StatsCard
            icon={<Sparkles className="w-5 h-5" />}
            label="Aura Points"
            value={user.auraPoints.toLocaleString()}
          />
          <StatsCard
            icon={<Coins className="w-5 h-5" />}
            label="$PLANK Balance"
            value={user.plankBalance.toLocaleString()}
          />
          <StatsCard
            icon={<Flame className="w-5 h-5" />}
            label="Current Streak"
            value={`${user.currentStreakDays} days`}
          />
          <StatsCard
            icon={<Award className="w-5 h-5" />}
            label="Longest Streak"
            value={`${user.longestStreakDays} days`}
          />
        </motion.div>

        {/* NFT Badge section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">
              Time Relic NFT
            </h2>
          </div>

          {hasClaimedAnyRelic ? (
            <div className="space-y-3">
              {/* Show claimed relics */}
              <div className="flex flex-wrap gap-2">
                {RELIC_TOKENS_ARRAY.filter(
                  (r) => claimedRelics[Number(r.id) - 1]
                ).map((relic) => (
                  <div
                    key={relic.id.toString()}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/10 border border-primary/30"
                  >
                    <span className="text-lg">🏆</span>
                    <span className="text-sm font-semibold text-primary">
                      {relic.name}
                    </span>
                  </div>
                ))}
              </div>

              {/* Show mint button if there's another eligible relic */}
              {canMintRelic && nextMintableRelic && (
                <div className="pt-2 border-t border-border">
                  <p className="text-sm text-muted-foreground mb-2">
                    You've unlocked the {nextMintableRelic.name}!
                  </p>
                  <GreekButton
                    variant="conquest"
                    size="md"
                    onClick={handleMintRelic}
                    disabled={isMintingRelic}
                    className="w-full gap-2"
                  >
                    {isMintingRelic ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Minting on Mantle...
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Mint {nextMintableRelic.name}
                      </>
                    )}
                  </GreekButton>
                </div>
              )}
            </div>
          ) : canMintRelic && nextMintableRelic ? (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                You've conquered enough time to mint your {nextMintableRelic.name}!
              </p>
              <GreekButton
                variant="conquest"
                size="md"
                onClick={handleMintRelic}
                disabled={isMintingRelic}
                className="w-full gap-2"
              >
                {isMintingRelic ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Minting on Mantle...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Mint {nextMintableRelic.name} (NFT)
                  </>
                )}
              </GreekButton>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-2">
                Conquer at least 1 minute to unlock your first Time Relic
              </p>
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{
                    width: `${Math.min((user.totalTimeConquered / 60) * 100, 100)}%`,
                  }}
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {user.totalTimeConquered}/60 seconds
              </p>
            </div>
          )}
        </motion.div>

        {/* Guild section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg border border-border bg-card"
        >
          <div className="flex items-center gap-2 mb-3">
            <User className="w-5 h-5 text-primary" />
            <h2 className="font-serif font-semibold text-foreground">Guild</h2>
          </div>

          {userGuild ? (
            <div
              onClick={() => navigate("/guild")}
              className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 hover:bg-muted cursor-pointer transition-colors"
            >
              <span className="text-3xl">{userGuild.emblem}</span>
              <div className="flex-1">
                <p className="font-semibold text-foreground">{userGuild.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatTimeReadable(userGuild.totalTimeConquered)} conquered •{" "}
                  {userGuild.memberCount} warriors
                </p>
              </div>
            </div>
          ) : showCreateGuild ? (
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Guild Name
                </label>
                <Input
                  value={guildName}
                  onChange={(e) => setGuildName(e.target.value)}
                  placeholder="Enter guild name"
                />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Emblem
                </label>
                <div className="flex flex-wrap gap-2">
                  {emblems.map((e) => (
                    <button
                      key={e}
                      onClick={() => setGuildEmblem(e)}
                      className={`w-10 h-10 rounded-lg text-xl flex items-center justify-center transition-all ${guildEmblem === e
                        ? "bg-primary/20 border-2 border-primary"
                        : "bg-muted hover:bg-muted/80 border border-border"
                        }`}
                    >
                      {e}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">
                  Description
                </label>
                <Input
                  value={guildDescription}
                  onChange={(e) => setGuildDescription(e.target.value)}
                  placeholder="A short motto for your guild"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <GreekButton
                  variant="primary"
                  size="md"
                  onClick={handleCreateGuild}
                  disabled={!guildName.trim()}
                  className="w-full sm:flex-1"
                >
                  Create Guild
                </GreekButton>
                <GreekButton
                  variant="ghost"
                  size="md"
                  onClick={() => setShowCreateGuild(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </GreekButton>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <GreekButton
                variant="primary"
                size="md"
                onClick={() => setShowCreateGuild(true)}
                className="w-full sm:flex-1 gap-2"
              >
                <Plus className="w-4 h-4" />
                Create Guild
              </GreekButton>
              <GreekButton
                variant="secondary"
                size="md"
                onClick={() => navigate("/rankings")}
                className="w-full sm:flex-1"
              >
                Join Existing
              </GreekButton>
            </div>
          )}
        </motion.div>

        {/* Footer */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="text-center text-xs text-muted-foreground py-4"
        >
          Connected to Mantle Network
        </motion.p>
      </div>
    </AppLayout>
  );
};

export default Profile;
