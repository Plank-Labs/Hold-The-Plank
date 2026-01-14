/**
 * CameraPermissionPrompt Component
 *
 * Handles camera permission requests before starting plank detection.
 * Shows clear UI for permission states: requesting, granted, denied.
 */

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, CameraOff, RefreshCw, Shield, CheckCircle2 } from "lucide-react";
import { GreekButton } from "@/components/ui/greek-button";

export type CameraPermissionStatus = "idle" | "requesting" | "granted" | "denied" | "error";

interface CameraPermissionPromptProps {
  onPermissionGranted: () => void;
  onPermissionDenied?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function CameraPermissionPrompt({
  onPermissionGranted,
  onPermissionDenied,
  onSkip,
  className = "",
}: CameraPermissionPromptProps) {
  const [status, setStatus] = useState<CameraPermissionStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  /**
   * Request camera permission using getUserMedia.
   */
  const requestCameraPermission = useCallback(async () => {
    setStatus("requesting");
    setErrorMessage(null);

    try {
      // Check if mediaDevices is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error(
          "Camera access is not supported in this browser. Please try Chrome, Safari, or Firefox."
        );
      }

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user", // Front camera on mobile
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
      });

      // Stop the stream immediately - we just needed to check permission
      stream.getTracks().forEach((track) => track.stop());

      setStatus("granted");

      // Small delay for visual feedback
      setTimeout(() => {
        onPermissionGranted();
      }, 500);
    } catch (err) {
      console.error("[CameraPermission] Error:", err);

      if (err instanceof Error) {
        if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
          setStatus("denied");
          setErrorMessage(
            "Camera access was denied. Please enable camera permissions in your browser settings."
          );
          onPermissionDenied?.();
        } else if (err.name === "NotFoundError") {
          setStatus("error");
          setErrorMessage("No camera found. Please connect a camera and try again.");
        } else if (err.name === "NotReadableError") {
          setStatus("error");
          setErrorMessage(
            "Camera is being used by another application. Please close other apps using the camera."
          );
        } else {
          setStatus("error");
          setErrorMessage(err.message);
        }
      } else {
        setStatus("error");
        setErrorMessage("An unknown error occurred while accessing the camera.");
      }
    }
  }, [onPermissionGranted, onPermissionDenied]);

  /**
   * Retry permission request.
   */
  const handleRetry = useCallback(() => {
    setStatus("idle");
    setErrorMessage(null);
  }, []);

  return (
    <div className={`flex flex-col items-center justify-center p-6 ${className}`}>
      <AnimatePresence mode="wait">
        {/* Idle State - Initial prompt */}
        {status === "idle" && (
          <motion.div
            key="idle"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 max-w-sm"
          >
            {/* Camera Icon */}
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center"
            >
              <Camera className="w-12 h-12 text-primary" />
            </motion.div>

            {/* Title */}
            <h2 className="text-2xl font-serif font-bold text-foreground">
              Enable Camera
            </h2>

            {/* Description */}
            <p className="text-muted-foreground">
              To detect your plank form in real-time, we need access to your camera.
              Your video never leaves your device.
            </p>

            {/* Privacy Note */}
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded-lg px-4 py-3">
              <Shield className="w-4 h-4 text-primary flex-shrink-0" />
              <span>All processing happens locally on your device</span>
            </div>

            {/* Buttons */}
            <div className="space-y-3">
              <GreekButton
                variant="primary"
                size="lg"
                onClick={requestCameraPermission}
                className="w-full"
              >
                <Camera className="w-5 h-5 mr-2" />
                Allow Camera Access
              </GreekButton>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip for now (manual mode)
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Requesting State - Loading */}
        {status === "requesting" && (
          <motion.div
            key="requesting"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              className="w-20 h-20 mx-auto"
            >
              <RefreshCw className="w-20 h-20 text-primary" />
            </motion.div>

            <h2 className="text-xl font-serif font-bold text-foreground">
              Requesting Access...
            </h2>

            <p className="text-muted-foreground">
              Please allow camera access in the browser prompt
            </p>
          </motion.div>
        )}

        {/* Granted State - Success */}
        {status === "granted" && (
          <motion.div
            key="granted"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="text-center space-y-6"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </motion.div>

            <h2 className="text-xl font-serif font-bold text-foreground">
              Camera Ready!
            </h2>

            <p className="text-muted-foreground">Starting plank detection...</p>
          </motion.div>
        )}

        {/* Denied State - Permission blocked */}
        {status === "denied" && (
          <motion.div
            key="denied"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 max-w-sm"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <CameraOff className="w-10 h-10 text-destructive" />
            </div>

            <h2 className="text-xl font-serif font-bold text-foreground">
              Camera Access Denied
            </h2>

            <p className="text-muted-foreground">{errorMessage}</p>

            {/* Instructions */}
            <div className="text-left text-sm text-muted-foreground bg-muted/50 rounded-lg p-4 space-y-2">
              <p className="font-semibold">To enable camera:</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click the camera icon in your browser's address bar</li>
                <li>Select "Allow" for camera access</li>
                <li>Refresh the page and try again</li>
              </ol>
            </div>

            <div className="space-y-3">
              <GreekButton
                variant="secondary"
                size="lg"
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </GreekButton>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue without camera
                </button>
              )}
            </div>
          </motion.div>
        )}

        {/* Error State - Other errors */}
        {status === "error" && (
          <motion.div
            key="error"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center space-y-6 max-w-sm"
          >
            <div className="w-20 h-20 mx-auto rounded-full bg-destructive/20 flex items-center justify-center">
              <CameraOff className="w-10 h-10 text-destructive" />
            </div>

            <h2 className="text-xl font-serif font-bold text-foreground">
              Camera Error
            </h2>

            <p className="text-muted-foreground">{errorMessage}</p>

            <div className="space-y-3">
              <GreekButton
                variant="secondary"
                size="lg"
                onClick={handleRetry}
                className="w-full"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Try Again
              </GreekButton>

              {onSkip && (
                <button
                  onClick={onSkip}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Continue without camera
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default CameraPermissionPrompt;
