import { usePrivy } from "@privy-io/react-auth";
import { useGame } from "@/contexts/GameContext";
import { GreekButton } from "./ui/greek-button";
import { shortenAddress } from "@/lib/gameData";
import { Wallet, LogOut, Loader2, Mail, User } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

const WalletButton: React.FC = () => {
  const { ready, authenticated, user: privyUser } = usePrivy();
  const { isConnected, walletAddress, connectWallet, disconnectWallet, user } = useGame();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
    } finally {
      setIsConnecting(false);
    }
  };

  // Show loading state only while Privy initializes
  if (!ready) {
    return (
      <GreekButton variant="secondary" size="md" disabled className="gap-2">
        <Loader2 className="w-4 h-4 animate-spin" />
        Loading...
      </GreekButton>
    );
  }

  if (!authenticated) {
    return (
      <GreekButton
        variant="primary"
        size="md"
        onClick={handleConnect}
        disabled={isConnecting}
        className="gap-2"
      >
        {isConnecting ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Connecting...
          </>
        ) : (
          <>
            <Wallet className="w-4 h-4" />
            Connect
          </>
        )}
      </GreekButton>
    );
  }

  // Get linked account info from Privy
  const linkedEmail = privyUser?.email?.address;
  const linkedGoogle = privyUser?.google?.email;
  const linkedTwitter = privyUser?.twitter?.username;
  const linkedWallet = privyUser?.wallet?.address;

  // Determine the display name/email
  const displayAccount = linkedEmail || linkedGoogle || (linkedTwitter ? `@${linkedTwitter}` : null);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-border bg-card hover:border-primary/50 transition-all"
        >
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-lg">
            {user.avatar}
          </div>
          <div className="text-left hidden sm:block">
            <p className="text-sm font-medium text-foreground">{user.username}</p>
            <p className="text-xs text-muted-foreground">
              {walletAddress ? shortenAddress(walletAddress) : "Connected"}
            </p>
          </div>
        </motion.button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {/* Network Status */}
        <div className="px-2 py-1.5">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            Mantle Sepolia
          </div>
        </div>

        <DropdownMenuSeparator />

        {/* Linked Accounts */}
        {displayAccount && (
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {linkedEmail || linkedGoogle ? (
                <Mail className="w-3 h-3" />
              ) : (
                <User className="w-3 h-3" />
              )}
              {displayAccount}
            </div>
          </div>
        )}

        {linkedWallet && linkedWallet !== walletAddress && (
          <div className="px-2 py-1.5">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Wallet className="w-3 h-3" />
              {shortenAddress(linkedWallet)}
            </div>
          </div>
        )}

        <DropdownMenuSeparator />

        <DropdownMenuItem
          onClick={disconnectWallet}
          className="text-destructive focus:text-destructive cursor-pointer"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Disconnect
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default WalletButton;
