"""
Eye-Based Health Scanner Service
=================================
Analyzes eye movements, blink patterns, and sclera color
to detect fatigue, sleep deprivation, liver issues, dehydration, and neurological issues.
Uses OpenCV Haar Cascades for reliable face/eye detection.
"""

import cv2
import numpy as np
import base64
from typing import List, Dict, Any, Optional, Tuple
import logging

logger = logging.getLogger(__name__)

# Normal ranges
NORMAL_BLINK_RATE = (12, 20)  # blinks per minute
NORMAL_SACCADE_SPEED = (200, 500)  # degrees/sec
NORMAL_PUPIL_DILATION = (2.5, 4.5)  # mm (approximate)
NORMAL_SCLERA_YELLOW = 0.15  # threshold for liver issues
NORMAL_HYDRATION_SCORE = 80  # percentage


def decode_frame(base64_frame: str) -> Optional[np.ndarray]:
    """Decode base64 image to OpenCV format"""
    try:
        if ',' in base64_frame:
            base64_frame = base64_frame.split(',')[1]
        img_bytes = base64.b64decode(base64_frame)
        nparr = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
        return frame
    except Exception as e:
        logger.error(f"Error decoding frame: {e}")
        return None


def detect_face_and_eyes(frame: np.ndarray) -> Optional[Dict[str, Any]]:
    """
    Detect face and eyes using Haar Cascades.
    Returns eye centers, pupil sizes, and sclera color analysis.
    """
    try:
        if frame is None:
            return None

        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
        
        # Load Haar Cascades
        face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')
        eye_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_eye.xml')

        # Detect faces
        faces = face_cascade.detectMultiScale(gray, 1.1, 4, minSize=(80, 80))
        
        if len(faces) == 0:
            return None

        # Get the largest face
        x, y, fw, fh = max(faces, key=lambda rect: rect[2] * rect[3])
        
        # Detect eyes in face ROI
        face_roi = gray[y:y+fh, x:x+fw]
        eyes = eye_cascade.detectMultiScale(face_roi, 1.1, 5, minSize=(15, 15))

        if len(eyes) >= 2:
            # Sort eyes by x position (left to right)
            eyes = sorted(eyes, key=lambda e: e[0])
            left_eye = eyes[0]
            right_eye = eyes[1]
            
            # Calculate eye centers (relative to full frame)
            left_center = (x + left_eye[0] + left_eye[2]//2, y + left_eye[1] + left_eye[3]//2)
            right_center = (x + right_eye[0] + right_eye[2]//2, y + right_eye[1] + right_eye[3]//2)
        else:
            # Estimate eye positions based on face geometry
            left_center = (x + int(fw * 0.3), y + int(fh * 0.35))
            right_center = (x + int(fw * 0.7), y + int(fh * 0.35))

        # Extract eye ROIs
        h, w, _ = frame.shape
        
        def get_eye_roi(center, padding=25):
            cx, cy = center
            x1 = max(0, cx - padding)
            y1 = max(0, cy - padding)
            x2 = min(w, cx + padding)
            y2 = min(h, cy + padding)
            if x2 <= x1 or y2 <= y1:
                return None
            return frame[y1:y2, x1:x2]

        left_eye_roi = get_eye_roi(left_center)
        right_eye_roi = get_eye_roi(right_center)

        if left_eye_roi is None or right_eye_roi is None:
            return None

        # Analyze pupil size and sclera color
        left_pupil_size = estimate_pupil_size(left_eye_roi)
        right_pupil_size = estimate_pupil_size(right_eye_roi)
        left_sclera_yellow = analyze_sclera_color(left_eye_roi)
        right_sclera_yellow = analyze_sclera_color(right_eye_roi)

        return {
            "left_eye": {
                "center": left_center,
                "pupil_size": left_pupil_size,
                "sclera_yellow": left_sclera_yellow
            },
            "right_eye": {
                "center": right_center,
                "pupil_size": right_pupil_size,
                "sclera_yellow": right_sclera_yellow
            }
        }

    except Exception as e:
        logger.error(f"Error detecting face and eyes: {e}")
        return None


def estimate_pupil_size(eye_roi: np.ndarray) -> float:
    """Estimate pupil size based on darkness in eye region."""
    try:
        if eye_roi is None or eye_roi.size == 0:
            return 3.0

        gray = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        _, thresh = cv2.threshold(blurred, 60, 255, cv2.THRESH_BINARY_INV)
        dark_ratio = np.sum(thresh == 255) / (eye_roi.shape[0] * eye_roi.shape[1])
        pupil_size = 2.0 + dark_ratio * 4.0

        return round(min(6.0, max(1.5, pupil_size)), 2)
    except Exception:
        return 3.0


def analyze_sclera_color(eye_roi: np.ndarray) -> float:
    """Analyze sclera (white of eye) for yellowing."""
    try:
        if eye_roi is None or eye_roi.size == 0:
            return 0.0

        hsv = cv2.cvtColor(eye_roi, cv2.COLOR_BGR2HSV)
        lower_yellow = np.array([20, 50, 50])
        upper_yellow = np.array([35, 255, 255])
        yellow_mask = cv2.inRange(hsv, lower_yellow, upper_yellow)
        lower_white = np.array([0, 0, 200])
        upper_white = np.array([180, 30, 255])
        white_mask = cv2.inRange(hsv, lower_white, upper_white)

        non_white = np.sum(white_mask == 0)
        if non_white == 0:
            return 0.0

        yellow_in_non_white = np.sum((yellow_mask > 0) & (white_mask == 0))
        yellow_ratio = yellow_in_non_white / non_white

        return round(min(1.0, yellow_ratio), 3)
    except Exception:
        return 0.0


def analyze_eye_movements(eye_data_list: List[Dict], fps: float = 2.0) -> Dict[str, Any]:
    """Analyze eye movement patterns over time."""
    try:
        if len(eye_data_list) < 5:
            return None

        left_centers = [d["left_eye"]["center"] for d in eye_data_list]
        right_centers = [d["right_eye"]["center"] for d in eye_data_list]

        left_velocities = []
        right_velocities = []

        for i in range(1, len(left_centers)):
            dx_l = left_centers[i][0] - left_centers[i-1][0]
            dy_l = left_centers[i][1] - left_centers[i-1][1]
            vel_l = np.sqrt(dx_l**2 + dy_l**2) * fps
            left_velocities.append(vel_l)

            dx_r = right_centers[i][0] - right_centers[i-1][0]
            dy_r = right_centers[i][1] - right_centers[i-1][1]
            vel_r = np.sqrt(dx_r**2 + dy_r**2) * fps
            right_velocities.append(vel_r)

        avg_saccade_speed = np.mean(left_velocities + right_velocities) * (60 / 640)
        blink_count = sum(1 for i in range(1, len(left_velocities))
                         if left_velocities[i] < 5 and right_velocities[i] < 5)
        blink_rate = (blink_count / len(eye_data_list)) * 60 * fps

        left_x_std = np.std([c[0] for c in left_centers])
        left_y_std = np.std([c[1] for c in left_centers])
        gaze_stability = max(0, 100 - (np.mean([left_x_std, left_y_std]) * 2))

        return {
            "saccade_speed": round(avg_saccade_speed, 1),
            "blink_rate": round(blink_rate, 1),
            "gaze_stability": round(gaze_stability, 1)
        }

    except Exception as e:
        logger.error(f"Error analyzing eye movements: {e}")
        return None


def analyze_pupil_dilation(eye_data_list: List[Dict]) -> Dict[str, Any]:
    """Analyze pupil dilation patterns over time."""
    try:
        left_pupils = [d["left_eye"]["pupil_size"] for d in eye_data_list]
        right_pupils = [d["right_eye"]["pupil_size"] for d in eye_data_list]

        avg_left = np.mean(left_pupils)
        avg_right = np.mean(right_pupils)
        avg_pupil = (avg_left + avg_right) / 2
        variability = np.std(left_pupils + right_pupils)

        return {
            "avg_pupil_size": round(avg_pupil, 2),
            "variability": round(variability, 2),
            "left_avg": round(avg_left, 2),
            "right_avg": round(avg_right, 2)
        }
    except Exception:
        return {"avg_pupil_size": 3.0, "variability": 0.5, "left_avg": 3.0, "right_avg": 3.0}


def analyze_sclera_health(eye_data_list: List[Dict]) -> Dict[str, Any]:
    """Analyze sclera color for liver issues and hydration."""
    try:
        left_yellow = [d["left_eye"]["sclera_yellow"] for d in eye_data_list]
        right_yellow = [d["right_eye"]["sclera_yellow"] for d in eye_data_list]

        avg_yellow = np.mean(left_yellow + right_yellow)
        hydration = max(0, 100 - (avg_yellow * 200))

        return {
            "yellow_ratio": round(avg_yellow, 3),
            "hydration_score": round(min(100, max(0, hydration)), 1),
            "liver_risk": "High" if avg_yellow > 0.25 else "Moderate" if avg_yellow > 0.15 else "Low"
        }
    except Exception:
        return {"yellow_ratio": 0.0, "hydration_score": 85.0, "liver_risk": "Low"}


def comprehensive_health_assessment(
    movement_metrics: Dict,
    pupil_metrics: Dict,
    sclera_metrics: Dict
) -> Dict[str, Any]:
    """Comprehensive health assessment based on all eye metrics."""
    issues = []
    recommendations = []
    overall_score = 100

    # 1. Fatigue Assessment
    blink_rate = movement_metrics.get("blink_rate", 15)
    gaze_stability = movement_metrics.get("gaze_stability", 90)

    if blink_rate > 25 or gaze_stability < 60:
        fatigue_level = "High"
        overall_score -= 25
        issues.append("High fatigue detected")
        recommendations.append("Get 7-9 hours of quality sleep")
    elif blink_rate > 20 or gaze_stability < 75:
        fatigue_level = "Moderate"
        overall_score -= 15
        issues.append("Moderate fatigue detected")
        recommendations.append("Consider taking rest breaks")
    else:
        fatigue_level = "Low"
        recommendations.append("Fatigue levels are normal")

    # 2. Sleep Deprivation
    saccade_speed = movement_metrics.get("saccade_speed", 300)
    if saccade_speed < 150:
        sleep_level = "Severely Deprived"
        overall_score -= 30
        issues.append("Signs of severe sleep deprivation")
        recommendations.append("Prioritize sleep hygiene and consult a sleep specialist")
    elif saccade_speed < 200:
        sleep_level = "Moderately Deprived"
        overall_score -= 20
        issues.append("Moderate sleep deprivation detected")
        recommendations.append("Aim for consistent sleep schedule")
    else:
        sleep_level = "Adequate"
        recommendations.append("Sleep patterns appear normal")

    # 3. Liver Issues
    yellow_ratio = sclera_metrics.get("yellow_ratio", 0)
    liver_risk = sclera_metrics.get("liver_risk", "Low")

    if yellow_ratio > 0.25:
        overall_score -= 35
        issues.append("Possible liver concern detected (sclera yellowing)")
        recommendations.append("Consult a hepatologist for liver function tests")
    elif yellow_ratio > 0.15:
        overall_score -= 15
        issues.append("Mild sclera discoloration detected")
        recommendations.append("Monitor liver health and stay hydrated")
    else:
        recommendations.append("No liver concerns detected")

    # 4. Hydration Level
    hydration = sclera_metrics.get("hydration_score", 85)

    if hydration < 50:
        hydration_level = "Severely Dehydrated"
        overall_score -= 25
        issues.append("Signs of severe dehydration")
        recommendations.append("Drink 2-3 liters of water immediately")
    elif hydration < 70:
        hydration_level = "Mildly Dehydrated"
        overall_score -= 15
        issues.append("Mild dehydration detected")
        recommendations.append("Increase water intake to 2 liters/day")
    else:
        hydration_level = "Well Hydrated"
        recommendations.append("Hydration levels are good")

    # 5. Stress Level
    pupil_variability = pupil_metrics.get("variability", 0.5)
    avg_pupil = pupil_metrics.get("avg_pupil_size", 3.0)

    if pupil_variability > 1.5 or avg_pupil > 5.0:
        stress_level = "High"
        overall_score -= 20
        issues.append("High stress indicators (pupil dilation variability)")
        recommendations.append("Practice stress management techniques")
    elif pupil_variability > 1.0:
        stress_level = "Moderate"
        overall_score -= 10
        issues.append("Moderate stress detected")
        recommendations.append("Consider relaxation exercises")
    else:
        stress_level = "Low"
        recommendations.append("Stress levels appear normal")

    # 6. Neurological Assessment
    if saccade_speed < 100 or gaze_stability < 40:
        neuro_risk = "High"
        overall_score -= 30
        issues.append("Irregular eye movements - possible neurological concern")
        recommendations.append("Consult a neurologist for comprehensive assessment")
    elif saccade_speed < 150 or gaze_stability < 60:
        neuro_risk = "Moderate"
        overall_score -= 15
        issues.append("Mild neurological indicators detected")
        recommendations.append("Monitor symptoms and consult if persistent")
    else:
        neuro_risk = "Low"
        recommendations.append("No neurological concerns detected")

    overall_score = max(0, min(100, overall_score))

    return {
        "overall_score": overall_score,
        "fatigue_level": fatigue_level,
        "sleep_level": sleep_level,
        "liver_risk": liver_risk,
        "hydration_level": hydration_level,
        "stress_level": stress_level,
        "neurological_risk": neuro_risk,
        "issues": issues,
        "recommendations": recommendations
    }


async def process_eye_scan(frames: List[str], duration: int = 30) -> Dict[str, Any]:
    """Main function for comprehensive eye-based health analysis."""
    try:
        logger.info(f"Processing {len(frames)} frames for eye health analysis...")

        # Sample frames for faster processing (max 20 frames)
        step = max(1, len(frames) // 20)
        sampled_frames = frames[::step][:20]
        logger.info(f"Sampling {len(sampled_frames)} frames from {len(frames)} total")

        eye_data_list = []
        face_detected_count = 0

        for frame_b64 in sampled_frames:
            frame = decode_frame(frame_b64)
            if frame is not None:
                data = detect_face_and_eyes(frame)
                if data is not None:
                    eye_data_list.append(data)
                    face_detected_count += 1

        logger.info(f"Detected eyes in {face_detected_count}/{len(sampled_frames)} frames")

        if len(eye_data_list) < 5:
            return {
                "success": False,
                "error": f"Could not detect eyes in enough frames. Only detected in {face_detected_count}/{len(sampled_frames)} frames. Please ensure good lighting and look directly at camera."
            }

        # Analyze
        movement_metrics = analyze_eye_movements(eye_data_list)
        pupil_metrics = analyze_pupil_dilation(eye_data_list)
        sclera_metrics = analyze_sclera_health(eye_data_list)

        if movement_metrics is None:
            return {
                "success": False,
                "error": "Failed to analyze eye movements. Please try again with better lighting."
            }

        # Assessment
        assessment = comprehensive_health_assessment(
            movement_metrics, pupil_metrics, sclera_metrics
        )

        logger.info(f"Health assessment complete: Score {assessment['overall_score']}")

        return {
            "success": True,
            **assessment,
            "movement_metrics": movement_metrics,
            "pupil_metrics": pupil_metrics,
            "sclera_metrics": sclera_metrics,
            "frames_processed": len(eye_data_list)
        }

    except Exception as e:
        logger.error(f"Error processing eye scan: {e}", exc_info=True)
        return {
            "success": False,
            "error": f"Error processing video: {str(e)}"
        }
