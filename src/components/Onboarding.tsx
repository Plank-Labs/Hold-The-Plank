import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { GreekButton } from "@/components/ui/greek-button";
import { useGame } from "@/contexts/GameContext";
import { ChevronRight, Clock, Swords, Sparkles } from "lucide-react";

const slides = [
  {
    icon: <Swords className="w-16 h-16" />,
    title: "There are apps to conquer space.",
    subtitle: "Running apps measure kilometers. Maps apps claim territory.",
    image: "/assets/onboarding/running.jpg",
  },
  {
    icon: <Clock className="w-16 h-16" />,
    title: "Conquer Plank lets you conquer time.",
    subtitle: "Every second you hold a plank is time you steal from Kronos himself.",
    image: "/assets/onboarding/Plank.jpg",
  },
  {
    icon: <Sparkles className="w-16 h-16" />,
    title: "Time under tension is time you steal from Kronos.",
    subtitle: "Earn Aura, claim $PLANK, collect Relics, and grow your Guild.",
    image: "/assets/onboarding/Kronos.jpg",
  },
];

interface OnboardingProps {
  onComplete: () => void;
}

const Onboarding: React.FC<OnboardingProps> = ({ onComplete }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const { setHasSeenOnboarding } = useGame();

  const handleNext = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1);
    } else {
      setHasSeenOnboarding(true);
      onComplete();
    }
  };

  const handleSkip = () => {
    setHasSeenOnboarding(true);
    onComplete();
  };

  const slide = slides[currentSlide];

  return (
    <div className="fixed inset-0 z-50 bg-background flex flex-col">
      {/* Skip button */}
      <div className="absolute top-4 right-4">
        <button
          onClick={handleSkip}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1"
        >
          Skip
        </button>
      </div>

      {/* Slide content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center max-w-md"
          >
            {/* Icon */}
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="text-primary mb-6"
            >
              {slide.icon}
            </motion.div>

            {/* Visual Asset */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
              className="relative aspect-square w-full max-w-[280px] mx-auto mb-8 group"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#C5A572] to-[#B8860B] rounded-2xl p-[2px] shadow-[0_0_30px_rgba(197,165,114,0.2)]">
                <div className="w-full h-full bg-[#0a0a1a] rounded-2xl overflow-hidden relative">
                  <img
                    src={slide.image}
                    alt={slide.title}
                    className="w-full h-full object-cover transition-transform duration-[2000ms] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="text-2xl md:text-3xl font-serif font-bold text-foreground mb-4 leading-tight"
            >
              {slide.title}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-muted-foreground text-lg"
            >
              {slide.subtitle}
            </motion.p>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <div className="p-6 pb-10">
        {/* Dots */}
        <div className="flex justify-center gap-2 mb-6">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`w-2 h-2 rounded-full transition-all ${index === currentSlide
                ? "w-6 bg-primary"
                : "bg-muted-foreground/30"
                }`}
            />
          ))}
        </div>

        {/* Button */}
        <GreekButton
          variant="conquest"
          size="xl"
          onClick={handleNext}
          className="w-full gap-2"
        >
          {currentSlide === slides.length - 1 ? (
            "Begin the Trial"
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5" />
            </>
          )}
        </GreekButton>
      </div>
    </div>
  );
};

export default Onboarding;
