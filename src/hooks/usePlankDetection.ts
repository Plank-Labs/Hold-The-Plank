/**
 * usePlankDetection Hook
 *
 * React hook for real-time plank form detection using MediaPipe Pose.
 * Processes camera frames, calculates body angles, and evaluates form quality.
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { Pose, Results, NormalizedLandmarkList } from "@mediapipe/pose";
import { Camera } from "@mediapipe/camera_utils";
import {
  PlankState,
  PlankMetrics,
  AngleMetrics,
  Point,
  PlankConfig,
  DEFAULT_CONFIG,
  LANDMARKS,
  REQUIRED_LANDMARKS,
  calculateBodyAlignment,
  calculateHipAngle,
  calculateArmAngle,
  calculateKneeAngle,
  midpoint,
  evaluateForm,
  SmoothingBuffer,
  isLandmarkVisible,
} from "@/lib/formEvaluation";

// ============================================================================
// Types
// ============================================================================

export interface DetectionMetrics {
  formState: PlankState;
  score: number;
  feedback: string[];
  bodyAlignmentAngle: number;
  hipAngle: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  isLandmarksVisible: boolean;
  scoreBreakdown: {
    body: number;
    hip: number;
    knee: number;
    arm: number;
  };
}

export interface SessionMetrics {
  totalTime: number;
  goodFormTime: number;
  perfectFormTime: number;
  needsAdjustmentTime: number;
  poorFormTime: number;
  notDetectedTime: number;
  scoreHistory: number[];
  avgScore: number;
}

export interface UsePlankDetectionResult {
  // Current frame metrics
  metrics: DetectionMetrics;

  // Session-accumulated metrics
  sessionMetrics: SessionMetrics;

  // Refs for video/canvas elements
  videoRef: React.RefObject<HTMLVideoElement>;
  canvasRef: React.RefObject<HTMLCanvasElement>;

  // State
  isInitialized: boolean;
  isProcessing: boolean;
  error: string | null;
  cameraActive: boolean;

  // Controls
  startDetection: () => Promise<void>;
  stopDetection: () => void;
  resetSession: () => void;
}

// ============================================================================
// Default Metrics
// ============================================================================

const DEFAULT_METRICS: DetectionMetrics = {
  formState: PlankState.NOT_DETECTED,
  score: 0,
  feedback: ["Position yourself in the camera frame"],
  bodyAlignmentAngle: 0,
  hipAngle: 0,
  leftArmAngle: 0,
  rightArmAngle: 0,
  leftKneeAngle: 0,
  rightKneeAngle: 0,
  isLandmarksVisible: false,
  scoreBreakdown: {
    body: 0,
    hip: 0,
    knee: 0,
    arm: 0,
  },
};

const DEFAULT_SESSION_METRICS: SessionMetrics = {
  totalTime: 0,
  goodFormTime: 0,
  perfectFormTime: 0,
  needsAdjustmentTime: 0,
  poorFormTime: 0,
  notDetectedTime: 0,
  scoreHistory: [],
  avgScore: 0,
};

// ============================================================================
// Hook Implementation
// ============================================================================

export function usePlankDetection(
  config: PlankConfig = DEFAULT_CONFIG
): UsePlankDetectionResult {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const poseRef = useRef<Pose | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const lastFrameTimeRef = useRef<number>(0);
  const animationFrameRef = useRef<number>(0);

  // Smoothing buffers for temporal averaging
  const smoothingBuffersRef = useRef({
    bodyAlignment: new SmoothingBuffer(config.smoothingWindow),
    hip: new SmoothingBuffer(config.smoothingWindow),
    leftArm: new SmoothingBuffer(config.smoothingWindow),
    rightArm: new SmoothingBuffer(config.smoothingWindow),
    leftKnee: new SmoothingBuffer(config.smoothingWindow),
    rightKnee: new SmoothingBuffer(config.smoothingWindow),
  });

  // State
  const [metrics, setMetrics] = useState<DetectionMetrics>(DEFAULT_METRICS);
  const [sessionMetrics, setSessionMetrics] = useState<SessionMetrics>(DEFAULT_SESSION_METRICS);
  const [isInitialized, setIsInitialized] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cameraActive, setCameraActive] = useState(false);

  // ============================================================================
  // Landmark Processing
  // ============================================================================

  /**
   * Extract a landmark point from MediaPipe results.
   */
  const getLandmarkPoint = useCallback(
    (landmarks: NormalizedLandmarkList, index: number): Point | null => {
      const landmark = landmarks[index];
      if (!landmark) return null;

      return {
        x: landmark.x,
        y: landmark.y,
        z: landmark.z,
        visibility: landmark.visibility,
      };
    },
    []
  );

  /**
   * Check if all required landmarks are visible.
   */
  const checkRequiredLandmarks = useCallback(
    (landmarks: NormalizedLandmarkList): { visible: boolean; missing: string[] } => {
      const missing: string[] = [];

      for (const name of REQUIRED_LANDMARKS) {
        const index = LANDMARKS[name];
        const point = getLandmarkPoint(landmarks, index);
        if (!isLandmarkVisible(point, config.visibilityThreshold)) {
          missing.push(name.replace(/_/g, " ").toLowerCase());
        }
      }

      return {
        visible: missing.length === 0,
        missing,
      };
    },
    [config.visibilityThreshold, getLandmarkPoint]
  );

  /**
   * Calculate all angle metrics from landmarks.
   */
  const calculateAngles = useCallback(
    (landmarks: NormalizedLandmarkList): AngleMetrics | null => {
      const buffers = smoothingBuffersRef.current;

      // Get key landmarks
      const leftShoulder = getLandmarkPoint(landmarks, LANDMARKS.LEFT_SHOULDER);
      const rightShoulder = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_SHOULDER);
      const leftHip = getLandmarkPoint(landmarks, LANDMARKS.LEFT_HIP);
      const rightHip = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_HIP);
      const leftKnee = getLandmarkPoint(landmarks, LANDMARKS.LEFT_KNEE);
      const rightKnee = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_KNEE);
      const leftAnkle = getLandmarkPoint(landmarks, LANDMARKS.LEFT_ANKLE);
      const rightAnkle = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_ANKLE);
      const leftElbow = getLandmarkPoint(landmarks, LANDMARKS.LEFT_ELBOW);
      const rightElbow = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_ELBOW);
      const leftWrist = getLandmarkPoint(landmarks, LANDMARKS.LEFT_WRIST);
      const rightWrist = getLandmarkPoint(landmarks, LANDMARKS.RIGHT_WRIST);

      // Check required landmarks
      if (!leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle) {
        return null;
      }

      // Calculate midpoints
      const midShoulderPoint = midpoint(leftShoulder, rightShoulder);
      const midHipPoint = midpoint(leftHip, rightHip);
      const midAnklePoint = midpoint(leftAnkle, rightAnkle);

      // Calculate body alignment (primary metric)
      const bodyAlignment = buffers.bodyAlignment.add(
        calculateBodyAlignment(midShoulderPoint, midHipPoint, midAnklePoint)
      );

      // Calculate hip angle
      let hipAngle = 180;
      if (leftKnee && rightKnee) {
        const midKneePoint = midpoint(leftKnee, rightKnee);
        hipAngle = buffers.hip.add(
          calculateHipAngle(midShoulderPoint, midHipPoint, midKneePoint)
        );
      }

      // Calculate arm angles
      let leftArmAngle = 180;
      if (leftElbow && leftWrist) {
        leftArmAngle = buffers.leftArm.add(
          calculateArmAngle(leftShoulder, leftElbow, leftWrist)
        );
      }

      let rightArmAngle = 180;
      if (rightElbow && rightWrist) {
        rightArmAngle = buffers.rightArm.add(
          calculateArmAngle(rightShoulder, rightElbow, rightWrist)
        );
      }

      // Calculate knee angles
      let leftKneeAngle = 180;
      if (leftKnee) {
        leftKneeAngle = buffers.leftKnee.add(
          calculateKneeAngle(leftHip, leftKnee, leftAnkle)
        );
      }

      let rightKneeAngle = 180;
      if (rightKnee) {
        rightKneeAngle = buffers.rightKnee.add(
          calculateKneeAngle(rightHip, rightKnee, rightAnkle)
        );
      }

      return {
        bodyAlignment,
        hipAngle,
        leftArmAngle,
        rightArmAngle,
        leftKneeAngle,
        rightKneeAngle,
        avgArmAngle: (leftArmAngle + rightArmAngle) / 2,
        avgKneeAngle: (leftKneeAngle + rightKneeAngle) / 2,
      };
    },
    [getLandmarkPoint]
  );

  // ============================================================================
  // Session Time Tracking
  // ============================================================================

  /**
   * Update session metrics based on current state.
   */
  const updateSessionMetrics = useCallback(
    (state: PlankState, score: number, deltaTime: number) => {
      setSessionMetrics((prev) => {
        const newMetrics = { ...prev };
        newMetrics.totalTime += deltaTime;

        // Accumulate time by state
        switch (state) {
          case PlankState.PERFECT_FORM:
            newMetrics.perfectFormTime += deltaTime;
            newMetrics.goodFormTime += deltaTime; // Perfect is also good
            break;
          case PlankState.GOOD_FORM:
            newMetrics.goodFormTime += deltaTime;
            break;
          case PlankState.NEEDS_ADJUSTMENT:
            newMetrics.needsAdjustmentTime += deltaTime;
            break;
          case PlankState.POOR_FORM:
            newMetrics.poorFormTime += deltaTime;
            break;
          case PlankState.NOT_DETECTED:
            newMetrics.notDetectedTime += deltaTime;
            break;
        }

        // Track score history (sample every ~100ms to avoid memory issues)
        if (state !== PlankState.NOT_DETECTED && Math.random() < 0.1) {
          newMetrics.scoreHistory.push(score);
          // Keep only last 1000 samples
          if (newMetrics.scoreHistory.length > 1000) {
            newMetrics.scoreHistory.shift();
          }
        }

        // Calculate average score
        if (newMetrics.scoreHistory.length > 0) {
          newMetrics.avgScore =
            newMetrics.scoreHistory.reduce((a, b) => a + b, 0) /
            newMetrics.scoreHistory.length;
        }

        return newMetrics;
      });
    },
    []
  );

  // ============================================================================
  // MediaPipe Pose Processing
  // ============================================================================

  /**
   * Process pose detection results from MediaPipe.
   */
  const onResults = useCallback(
    (results: Results) => {
      const currentTime = performance.now();
      const deltaTime = lastFrameTimeRef.current
        ? (currentTime - lastFrameTimeRef.current) / 1000
        : 0;
      lastFrameTimeRef.current = currentTime;

      // No pose detected
      if (!results.poseLandmarks) {
        const notDetectedMetrics: DetectionMetrics = {
          ...DEFAULT_METRICS,
          formState: PlankState.NOT_DETECTED,
          feedback: ["No person detected - please position yourself in frame"],
        };
        setMetrics(notDetectedMetrics);
        updateSessionMetrics(PlankState.NOT_DETECTED, 0, deltaTime);
        return;
      }

      // Check required landmarks visibility
      const { visible, missing } = checkRequiredLandmarks(results.poseLandmarks);

      if (!visible) {
        const partialMetrics: DetectionMetrics = {
          ...DEFAULT_METRICS,
          formState: PlankState.NOT_DETECTED,
          feedback: [`Can't see: ${missing.join(", ")}. Adjust camera angle.`],
          isLandmarksVisible: false,
        };
        setMetrics(partialMetrics);
        updateSessionMetrics(PlankState.NOT_DETECTED, 0, deltaTime);
        return;
      }

      // Calculate angles
      const angles = calculateAngles(results.poseLandmarks);

      if (!angles) {
        setMetrics({
          ...DEFAULT_METRICS,
          formState: PlankState.NOT_DETECTED,
          feedback: ["Unable to calculate angles - adjust position"],
        });
        updateSessionMetrics(PlankState.NOT_DETECTED, 0, deltaTime);
        return;
      }

      // Evaluate form
      const evaluation = evaluateForm(angles, config);

      // Update metrics
      const newMetrics: DetectionMetrics = {
        formState: evaluation.state,
        score: evaluation.score,
        feedback: evaluation.feedback,
        bodyAlignmentAngle: angles.bodyAlignment,
        hipAngle: angles.hipAngle,
        leftArmAngle: angles.leftArmAngle,
        rightArmAngle: angles.rightArmAngle,
        leftKneeAngle: angles.leftKneeAngle,
        rightKneeAngle: angles.rightKneeAngle,
        isLandmarksVisible: true,
        scoreBreakdown: evaluation.scoreBreakdown,
      };

      setMetrics(newMetrics);
      updateSessionMetrics(evaluation.state, evaluation.score, deltaTime);
    },
    [calculateAngles, checkRequiredLandmarks, config, updateSessionMetrics]
  );

  // ============================================================================
  // MediaPipe Initialization
  // ============================================================================

  /**
   * Initialize MediaPipe Pose model.
   */
  const initializePose = useCallback(async () => {
    try {
      const pose = new Pose({
        locateFile: (file) => {
          return `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`;
        },
      });

      pose.setOptions({
        modelComplexity: 1, // 0=lite, 1=full, 2=heavy
        smoothLandmarks: true,
        enableSegmentation: false,
        smoothSegmentation: false,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      pose.onResults(onResults);

      await pose.initialize();

      poseRef.current = pose;
      setIsInitialized(true);
      setError(null);

      console.log("[PlankDetection] MediaPipe Pose initialized successfully");
    } catch (err) {
      console.error("[PlankDetection] Failed to initialize MediaPipe Pose:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to initialize pose detection"
      );
      setIsInitialized(false);
    }
  }, [onResults]);

  // ============================================================================
  // Camera Control
  // ============================================================================

  /**
   * Start camera and pose detection.
   */
  const startDetection = useCallback(async () => {
    if (!videoRef.current) {
      setError("Video element not available");
      return;
    }

    // Initialize pose if not already done
    if (!poseRef.current) {
      await initializePose();
    }

    if (!poseRef.current) {
      setError("Pose detection not initialized");
      return;
    }

    try {
      setIsProcessing(true);

      // Create camera instance
      const camera = new Camera(videoRef.current, {
        onFrame: async () => {
          if (poseRef.current && videoRef.current) {
            await poseRef.current.send({ image: videoRef.current });
          }
        },
        width: 640,
        height: 480,
      });

      await camera.start();
      cameraRef.current = camera;
      setCameraActive(true);
      setError(null);

      console.log("[PlankDetection] Camera started successfully");
    } catch (err) {
      console.error("[PlankDetection] Failed to start camera:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to access camera. Please check permissions."
      );
      setIsProcessing(false);
      setCameraActive(false);
    }
  }, [initializePose]);

  /**
   * Stop camera and detection.
   */
  const stopDetection = useCallback(() => {
    if (cameraRef.current) {
      cameraRef.current.stop();
      cameraRef.current = null;
    }

    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    setCameraActive(false);
    setIsProcessing(false);

    console.log("[PlankDetection] Detection stopped");
  }, []);

  /**
   * Reset session metrics.
   */
  const resetSession = useCallback(() => {
    setSessionMetrics(DEFAULT_SESSION_METRICS);
    setMetrics(DEFAULT_METRICS);
    lastFrameTimeRef.current = 0;

    // Clear smoothing buffers
    const buffers = smoothingBuffersRef.current;
    Object.values(buffers).forEach((buffer) => buffer.clear());

    console.log("[PlankDetection] Session reset");
  }, []);

  // ============================================================================
  // Cleanup
  // ============================================================================

  useEffect(() => {
    return () => {
      stopDetection();
      if (poseRef.current) {
        poseRef.current.close();
        poseRef.current = null;
      }
    };
  }, [stopDetection]);

  // ============================================================================
  // Return Hook Result
  // ============================================================================

  return {
    metrics,
    sessionMetrics,
    videoRef,
    canvasRef,
    isInitialized,
    isProcessing,
    error,
    cameraActive,
    startDetection,
    stopDetection,
    resetSession,
  };
}

// ============================================================================
// Export Types
// ============================================================================

export type { DetectionMetrics, SessionMetrics };
