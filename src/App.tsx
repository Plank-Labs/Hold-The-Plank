import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { PrivyProvider } from "@privy-io/react-auth";
import { WagmiProvider } from "@privy-io/wagmi";
import { GameProvider } from "@/contexts/GameContext";
import { PRIVY_APP_ID, privyConfig } from "@/lib/privy";
import { wagmiConfig } from "@/lib/wagmi";
import Index from "./pages/Index";
import PlankTechnique from "./pages/PlankTechnique";
import PlankSession from "./pages/PlankSession";
import PlankResult from "./pages/PlankResult";
import Rankings from "./pages/Rankings";
import GuildDetail from "./pages/GuildDetail";
import Profile from "./pages/Profile";
import GymJoin from "./pages/GymJoin";
import GymDashboard from "./pages/GymDashboard";
import GymScan from "./pages/GymScan";
import ReliksDemo from "./pages/ReliksDemo";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <PrivyProvider appId={PRIVY_APP_ID} config={privyConfig}>
    <QueryClientProvider client={queryClient}>
      <WagmiProvider config={wagmiConfig} reconnectOnMount={true}>
        <TooltipProvider>
          <GameProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/plank/technique" element={<PlankTechnique />} />
                <Route path="/plank/session" element={<PlankSession />} />
                <Route path="/plank/result" element={<PlankResult />} />
                <Route path="/rankings" element={<Rankings />} />
                <Route path="/guild" element={<GuildDetail />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/gym/join" element={<GymJoin />} />
                <Route path="/gym/dashboard" element={<GymDashboard />} />
                <Route path="/gym/scan" element={<GymScan />} />
                <Route path="/reliks-demo" element={<ReliksDemo />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </GameProvider>
        </TooltipProvider>
      </WagmiProvider>
    </QueryClientProvider>
  </PrivyProvider>
);

export default App;
