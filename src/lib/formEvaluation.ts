/**
 * Form Evaluation Library for Plank Detection
 *
 * Ported from Python plank_detector.py with identical scoring logic.
 * Uses MediaPipe Pose landmarks to calculate body angles and evaluate form.
 */

// ============================================================================
// Types & Enums
// ============================================================================

export enum PlankState {
  NOT_DETECTED = "not_detected",
  POOR_FORM = "poor_form",
  NEEDS_ADJUSTMENT = "needs_adjustment",
  GOOD_FORM = "good_form",
  PERFECT_FORM = "perfect_form",
}

export interface Point {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

export interface PlankConfig {
  // Body alignment: shoulder-hip-ankle angle (ideal: 180°)
  bodyAlignmentMin: number;
  bodyAlignmentMax: number;
  bodyAlignmentPerfectMin: number;
  bodyAlignmentPerfectMax: number;

  // Hip angle: prevents sagging or piking (ideal: 180°)
  hipAngleMin: number;
  hipAngleMax: number;
  hipAnglePerfectMin: number;
  hipAnglePerfectMax: number;

  // Arm angle: elbow should be ~90° for Relic elbow plank (forearm position)
  // Relic plank validation requires bent elbows with forearms on ground
  armAngleMin: number;
  armAngleMax: number;
  armAnglePerfectMin: number;
  armAnglePerfectMax: number;

  // Knee angle: legs should be straight (ideal: 180°)
  kneeAngleMin: number;
  kneeAngleMax: number;

  // Visibility threshold for landmarks
  visibilityThreshold: number;

  // Temporal smoothing window size
  smoothingWindow: number;
}

export interface AngleMetrics {
  bodyAlignment: number;
  hipAngle: number;
  leftArmAngle: number;
  rightArmAngle: number;
  leftKneeAngle: number;
  rightKneeAngle: number;
  avgArmAngle: number;
  avgKneeAngle: number;
}

export interface FormEvaluation {
  score: number;
  state: PlankState;
  feedback: string[];
  scoreBreakdown: {
    body: number;
    hip: number;
    knee: number;
    arm: number;
  };
}

export interface PlankMetrics {
  angles: AngleMetrics;
  evaluation: FormEvaluation;
  landmarksVisible: boolean;
  visibilityScores: Record<string, number>;
}

// ============================================================================
// Default Configuration (matching Python PlankConfig)
// ============================================================================

export const DEFAULT_CONFIG: PlankConfig = {
  // Body alignment thresholds
  bodyAlignmentMin: 160.0,
  bodyAlignmentMax: 195.0,
  bodyAlignmentPerfectMin: 170.0,
  bodyAlignmentPerfectMax: 190.0,

  // Hip angle thresholds
  hipAngleMin: 155.0,
  hipAngleMax: 200.0,
  hipAnglePerfectMin: 165.0,
  hipAnglePerfectMax: 195.0,

  // Arm angle thresholds for Relic Elbow Plank (~90° target)
  armAngleMin: 60.0,        // Minimum acceptable elbow angle
  armAngleMax: 120.0,       // Maximum acceptable elbow angle
  armAnglePerfectMin: 80.0, // Perfect elbow plank range start
  armAnglePerfectMax: 100.0, // Perfect elbow plank range end

  // Knee angle thresholds
  kneeAngleMin: 160.0,
  kneeAngleMax: 200.0,

  // Detection thresholds
  visibilityThreshold: 0.5,
  smoothingWindow: 5,
};

// ============================================================================
// MediaPipe Landmark Indices
// ============================================================================

export const LANDMARKS = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_ELBOW: 13,
  RIGHT_ELBOW: 14,
  LEFT_WRIST: 15,
  RIGHT_WRIST: 16,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_KNEE: 25,
  RIGHT_KNEE: 26,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
  LEFT_HEEL: 29,
  RIGHT_HEEL: 30,
} as const;

// Required landmarks for plank detection
// Note: Ankles are checked flexibly (at least one required) for side-profile Relic plank support
export const REQUIRED_LANDMARKS = [
  "LEFT_SHOULDER",
  "RIGHT_SHOULDER",
  "LEFT_HIP",
  "RIGHT_HIP",
] as const;

// ============================================================================
// Core Math Functions
// ============================================================================

/**
 * Calculate the angle ABC where B is the vertex.
 *
 * @param a - First point
 * @param b - Middle point / vertex
 * @param c - End point
 * @returns Angle in degrees (0-180)
 */
export function calculateAngle(a: Point, b: Point, c: Point): number {
  // Calculate vectors BA and BC
  const ba = { x: a.x - b.x, y: a.y - b.y };
  const bc = { x: c.x - b.x, y: c.y - b.y };

  // Calculate dot product
  const dotProduct = ba.x * bc.x + ba.y * bc.y;

  // Calculate magnitudes
  const magnitudeBA = Math.sqrt(ba.x ** 2 + ba.y ** 2);
  const magnitudeBC = Math.sqrt(bc.x ** 2 + bc.y ** 2);

  // Avoid division by zero
  const denominator = magnitudeBA * magnitudeBC + 1e-6;

  // Calculate cosine and clamp to valid range
  const cosineAngle = Math.max(-1, Math.min(1, dotProduct / denominator));

  // Convert to degrees
  const angle = Math.acos(cosineAngle) * (180 / Math.PI);

  return angle;
}

/**
 * Calculate midpoint between two points.
 */
export function midpoint(a: Point, b: Point): Point {
  return {
    x: (a.x + b.x) / 2,
    y: (a.y + b.y) / 2,
    z: a.z !== undefined && b.z !== undefined ? (a.z + b.z) / 2 : undefined,
  };
}

// ============================================================================
// Angle Calculation Functions
// ============================================================================

/**
 * Calculate body alignment angle (shoulder-hip-ankle).
 * For proper plank, this should be close to 180°.
 */
export function calculateBodyAlignment(
  shoulder: Point,
  hip: Point,
  ankle: Point
): number {
  return calculateAngle(shoulder, hip, ankle);
}

/**
 * Calculate hip angle (shoulder-hip-knee).
 * Detects sagging or piking.
 */
export function calculateHipAngle(
  shoulder: Point,
  hip: Point,
  knee: Point
): number {
  return calculateAngle(shoulder, hip, knee);
}

/**
 * Calculate arm angle (shoulder-elbow-wrist).
 */
export function calculateArmAngle(
  shoulder: Point,
  elbow: Point,
  wrist: Point
): number {
  return calculateAngle(shoulder, elbow, wrist);
}

/**
 * Calculate knee angle (hip-knee-ankle).
 */
export function calculateKneeAngle(
  hip: Point,
  knee: Point,
  ankle: Point
): number {
  return calculateAngle(hip, knee, ankle);
}

// ============================================================================
// Smoothing Buffer Class
// ============================================================================

export class SmoothingBuffer {
  private buffer: number[] = [];
  private maxSize: number;

  constructor(maxSize: number = 5) {
    this.maxSize = maxSize;
  }

  add(value: number): number {
    this.buffer.push(value);
    if (this.buffer.length > this.maxSize) {
      this.buffer.shift();
    }
    return this.getAverage();
  }

  getAverage(): number {
    if (this.buffer.length === 0) return 0;
    return this.buffer.reduce((a, b) => a + b, 0) / this.buffer.length;
  }

  clear(): void {
    this.buffer = [];
  }

  get length(): number {
    return this.buffer.length;
  }
}

// ============================================================================
// Form Evaluation Functions
// ============================================================================

/**
 * Evaluate body alignment score (40% of total).
 */
function evaluateBodyAlignmentScore(
  angle: number,
  config: PlankConfig
): { score: number; feedback: string | null } {
  let score = 0;
  let feedback: string | null = null;

  if (angle >= config.bodyAlignmentMin && angle <= config.bodyAlignmentMax) {
    if (angle >= config.bodyAlignmentPerfectMin && angle <= config.bodyAlignmentPerfectMax) {
      score = 100;
    } else if (angle < config.bodyAlignmentPerfectMin) {
      // Linear interpolation for good but not perfect
      score = 70 + 30 * (angle - config.bodyAlignmentMin) /
        (config.bodyAlignmentPerfectMin - config.bodyAlignmentMin);
    } else {
      score = 70 + 30 * (config.bodyAlignmentMax - angle) /
        (config.bodyAlignmentMax - config.bodyAlignmentPerfectMax);
    }
  } else {
    if (angle < config.bodyAlignmentMin) {
      feedback = "Raise your hips - body is sagging";
    } else {
      feedback = "Lower your hips - they're too high";
    }
    score = Math.max(0, 40 - Math.abs(180 - angle));
  }

  return { score, feedback };
}

/**
 * Evaluate hip angle score (30% of total).
 */
function evaluateHipAngleScore(
  angle: number,
  config: PlankConfig
): { score: number; feedback: string | null } {
  let score = 0;
  let feedback: string | null = null;

  if (angle >= config.hipAngleMin && angle <= config.hipAngleMax) {
    if (angle >= config.hipAnglePerfectMin && angle <= config.hipAnglePerfectMax) {
      score = 100;
    } else {
      score = 75;
    }
  } else {
    if (angle < config.hipAngleMin) {
      feedback = "Straighten your core - hips dropping";
    } else {
      feedback = "Lower your hips slightly";
    }
    score = Math.max(0, 40 - Math.abs(180 - angle));
  }

  return { score, feedback };
}

/**
 * Evaluate knee angle score (15% of total).
 */
function evaluateKneeAngleScore(
  avgAngle: number,
  config: PlankConfig
): { score: number; feedback: string | null } {
  let score = 0;
  let feedback: string | null = null;

  if (avgAngle >= config.kneeAngleMin) {
    score = Math.min(100, 60 + 40 * (avgAngle - config.kneeAngleMin) / 20);
  } else {
    feedback = "Straighten your legs";
    score = Math.max(0, 40 - Math.abs(180 - avgAngle));
  }

  return { score, feedback };
}

/**
 * Evaluate arm angle score (15% of total).
 * Relic Elbow Plank: ~90° elbow angle is ideal.
 * Extended arms (~180°) are now penalized.
 */
function evaluateArmAngleScore(
  avgAngle: number,
  config: PlankConfig
): { score: number; feedback: string | null } {
  let score = 0;
  let feedback: string | null = null;

  // Relic Elbow Plank: angle should be ~90°
  if (avgAngle >= config.armAngleMin && avgAngle <= config.armAngleMax) {
    if (avgAngle >= config.armAnglePerfectMin && avgAngle <= config.armAnglePerfectMax) {
      score = 100; // Perfect elbow plank form
    } else {
      // Good but not perfect - linear interpolation
      score = 70 + 30 * (1 - Math.abs(90 - avgAngle) / 30);
    }
  } else {
    // Arms outside valid range for Relic elbow plank
    if (avgAngle > config.armAngleMax) {
      feedback = "Bend your elbows - lower onto forearms";
    } else {
      feedback = "Straighten elbows slightly";
    }
    score = Math.max(0, 40 - Math.abs(90 - avgAngle) / 2);
  }

  return { score, feedback };
}

/**
 * Main form evaluation function.
 * Calculates weighted overall score and determines plank state.
 */
export function evaluateForm(
  angles: AngleMetrics,
  config: PlankConfig = DEFAULT_CONFIG
): FormEvaluation {
  const feedback: string[] = [];

  // Evaluate each component
  const bodyResult = evaluateBodyAlignmentScore(angles.bodyAlignment, config);
  const hipResult = evaluateHipAngleScore(angles.hipAngle, config);
  const kneeResult = evaluateKneeAngleScore(angles.avgKneeAngle, config);
  const armResult = evaluateArmAngleScore(angles.avgArmAngle, config);

  // Collect feedback
  if (bodyResult.feedback) feedback.push(bodyResult.feedback);
  if (hipResult.feedback) feedback.push(hipResult.feedback);
  if (kneeResult.feedback) feedback.push(kneeResult.feedback);
  if (armResult.feedback) feedback.push(armResult.feedback);

  // Calculate weighted overall score
  const overallScore =
    bodyResult.score * 0.4 +
    hipResult.score * 0.3 +
    kneeResult.score * 0.15 +
    armResult.score * 0.15;

  // Determine state based on score
  let state: PlankState;
  if (overallScore >= 90) {
    state = PlankState.PERFECT_FORM;
    if (feedback.length === 0) {
      feedback.push("Perfect form! Hold it!");
    }
  } else if (overallScore >= 75) {
    state = PlankState.GOOD_FORM;
    if (feedback.length === 0) {
      feedback.push("Good form! Keep going!");
    }
  } else if (overallScore >= 50) {
    state = PlankState.NEEDS_ADJUSTMENT;
  } else {
    state = PlankState.POOR_FORM;
  }

  return {
    score: overallScore,
    state,
    feedback,
    scoreBreakdown: {
      body: bodyResult.score,
      hip: hipResult.score,
      knee: kneeResult.score,
      arm: armResult.score,
    },
  };
}

// ============================================================================
// Utility Functions
// ============================================================================

/**
 * Check if a landmark is visible based on visibility threshold.
 */
export function isLandmarkVisible(
  landmark: Point | undefined | null,
  threshold: number = DEFAULT_CONFIG.visibilityThreshold
): boolean {
  if (!landmark) return false;
  return (landmark.visibility ?? 0) >= threshold;
}

/**
 * Get state color for UI rendering.
 */
export function getStateColor(state: PlankState): string {
  switch (state) {
    case PlankState.PERFECT_FORM:
      return "hsl(var(--gold))";
    case PlankState.GOOD_FORM:
      return "#22c55e"; // green-500
    case PlankState.NEEDS_ADJUSTMENT:
      return "#f97316"; // orange-500
    case PlankState.POOR_FORM:
      return "#ef4444"; // red-500
    case PlankState.NOT_DETECTED:
    default:
      return "#6b7280"; // gray-500
  }
}

/**
 * Get human-readable state label.
 */
export function getStateLabel(state: PlankState): string {
  switch (state) {
    case PlankState.PERFECT_FORM:
      return "Perfect Form!";
    case PlankState.GOOD_FORM:
      return "Good Form";
    case PlankState.NEEDS_ADJUSTMENT:
      return "Adjust Form";
    case PlankState.POOR_FORM:
      return "Poor Form";
    case PlankState.NOT_DETECTED:
    default:
      return "Not Detected";
  }
}

/**
 * Check if form is considered valid for point accumulation.
 * Valid = GOOD_FORM or PERFECT_FORM
 */
export function isFormValid(state: PlankState): boolean {
  return state === PlankState.GOOD_FORM || state === PlankState.PERFECT_FORM;
}

/**
 * Check if user is in any plank position (including needs adjustment).
 */
export function isInPlankPosition(state: PlankState): boolean {
  return (
    state === PlankState.GOOD_FORM ||
    state === PlankState.PERFECT_FORM ||
    state === PlankState.NEEDS_ADJUSTMENT
  );
}
