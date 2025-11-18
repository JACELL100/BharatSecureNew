import cv2
import numpy as np
from PIL import Image
import io
from django.core.files.base import ContentFile
from datetime import datetime
import tempfile
import os

class PotholeAnalyzer:
    def __init__(self, reference_object_size_cm=None):
        """
        Initialize the pothole analyzer
        reference_object_size_cm: Known size of reference object for scale (optional)
        """
        self.reference_size = reference_object_size_cm or 10  # Default 10cm reference
        self.pixels_per_cm = None
    
    def analyze_image(self, image_path):
        """
        Main analysis function
        Returns: dict with all analysis results
        """
        # Read image
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError("Could not read image")
        
        original = img.copy()
        
        # Preprocess image
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        blurred = cv2.GaussianBlur(gray, (5, 5), 0)
        
        # Edge detection
        edges = cv2.Canny(blurred, 50, 150)
        
        # Find contours
        contours, _ = cv2.findContours(edges, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Filter and find largest contour (assumed to be pothole)
        if not contours:
            return None
        
        # Sort by area and get largest
        contours = sorted(contours, key=cv2.contourArea, reverse=True)
        main_contour = contours[0]
        
        # Calculate measurements
        measurements = self._calculate_measurements(main_contour, img.shape)
        
        # Estimate depth using shadow/color analysis
        depth = self._estimate_depth(img, main_contour)
        measurements['depth_estimate'] = depth
        
        # Calculate severity
        severity_info = self._calculate_severity(measurements)
        measurements.update(severity_info)
        
        # Calculate impact and repair priority
        impact_info = self._calculate_impact(measurements)
        measurements.update(impact_info)
        
        # Create annotated image
        processed_img = self._create_annotated_image(original, main_contour, measurements)
        measurements['processed_image'] = processed_img
        
        return measurements
    
    def _calculate_measurements(self, contour, img_shape):
        """Calculate physical measurements from contour"""
        # Get bounding rectangle
        x, y, w, h = cv2.boundingRect(contour)
        
        # Calculate area and perimeter
        area_pixels = cv2.contourArea(contour)
        perimeter_pixels = cv2.arcLength(contour, True)
        
        # Estimate pixels per cm (you can improve this with reference object detection)
        # For now, using image height as reference (assuming standard camera distance)
        self.pixels_per_cm = img_shape[0] / 100  # Rough estimate
        
        # Convert to cm
        width_cm = w / self.pixels_per_cm
        height_cm = h / self.pixels_per_cm
        area_cm2 = area_pixels / (self.pixels_per_cm ** 2)
        perimeter_cm = perimeter_pixels / self.pixels_per_cm
        
        return {
            'width_cm': round(width_cm, 2),
            'height_cm': round(height_cm, 2),
            'area_cm2': round(area_cm2, 2),
            'perimeter_cm': round(perimeter_cm, 2),
            'bounding_box': (x, y, w, h)
        }
    
    def _estimate_depth(self, img, contour):
        """
        Estimate depth using color intensity analysis
        Darker regions typically indicate deeper potholes
        """
        # Create mask for pothole region
        mask = np.zeros(img.shape[:2], dtype=np.uint8)
        cv2.drawContours(mask, [contour], -1, 255, -1)
        
        # Get average intensity in pothole region
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        pothole_region = cv2.bitwise_and(gray, gray, mask=mask)
        
        # Calculate mean intensity (excluding zeros)
        mean_intensity = np.mean(pothole_region[pothole_region > 0])
        
        # Estimate depth based on darkness (darker = deeper)
        # Scale: 0-255 intensity maps to depth estimate
        depth_estimate = ((255 - mean_intensity) / 255) * 15  # Max 15cm depth
        
        return round(depth_estimate, 2)
    
    def _calculate_severity(self, measurements):
        """
        Calculate severity based on size and depth
        Categories: low, medium, high, critical
        """
        area = measurements['area_cm2']
        depth = measurements['depth_estimate']
        
        # Scoring system
        severity_score = 0
        
        # Area scoring (0-40 points)
        if area < 100:
            severity_score += 10
        elif area < 300:
            severity_score += 20
        elif area < 600:
            severity_score += 30
        else:
            severity_score += 40
        
        # Depth scoring (0-40 points)
        if depth < 2:
            severity_score += 5
        elif depth < 5:
            severity_score += 15
        elif depth < 8:
            severity_score += 25
        else:
            severity_score += 40
        
        # Shape irregularity (0-20 points)
        circularity = (4 * np.pi * measurements['area_cm2']) / (measurements['perimeter_cm'] ** 2)
        if circularity < 0.5:
            severity_score += 15  # Very irregular
        elif circularity < 0.7:
            severity_score += 10
        else:
            severity_score += 5
        
        # Determine severity level
        if severity_score < 30:
            severity = 'low'
        elif severity_score < 50:
            severity = 'medium'
        elif severity_score < 70:
            severity = 'high'
        else:
            severity = 'critical'
        
        confidence = min(severity_score / 100, 0.95)  # Max 95% confidence
        
        return {
            'severity': severity,
            'confidence_score': round(confidence, 2)
        }
    
    def _calculate_impact(self, measurements):
        """Calculate impact score and repair priority"""
        area = measurements['area_cm2']
        depth = measurements['depth_estimate']
        severity = measurements['severity']
        
        # Impact score (1-10)
        impact_score = min(10, int((area / 100) + (depth / 2)))
        
        # Repair priority (1-5, 5 being highest)
        priority_map = {
            'low': 2,
            'medium': 3,
            'high': 4,
            'critical': 5
        }
        repair_priority = priority_map.get(severity, 3)
        
        # Estimated repair cost (basic formula)
        base_cost = 50  # Base cost in currency
        cost_per_cm2 = 0.5
        cost_per_cm_depth = 10
        
        estimated_cost = base_cost + (area * cost_per_cm2) + (depth * cost_per_cm_depth)
        
        return {
            'impact_score': impact_score,
            'repair_priority': repair_priority,
            'estimated_repair_cost': round(estimated_cost, 2)
        }
    
    def _create_annotated_image(self, img, contour, measurements):
        """Create annotated image with measurements overlay"""
        annotated = img.copy()
        
        # Draw contour
        cv2.drawContours(annotated, [contour], -1, (0, 255, 0), 3)
        
        # Draw bounding box
        x, y, w, h = measurements['bounding_box']
        cv2.rectangle(annotated, (x, y), (x + w, y + h), (255, 0, 0), 2)
        
        # Add text annotations
        font = cv2.FONT_HERSHEY_SIMPLEX
        
        texts = [
            f"Size: {measurements['width_cm']}x{measurements['height_cm']} cm",
            f"Area: {measurements['area_cm2']} cm2",
            f"Depth: ~{measurements['depth_estimate']} cm",
            f"Severity: {measurements['severity'].upper()}",
        ]
        
        y_offset = y - 10
        for i, text in enumerate(texts):
            y_pos = y_offset - (i * 30)
            if y_pos < 30:
                y_pos = y + h + 30 + (i * 30)
            
            cv2.putText(annotated, text, (x, y_pos), font, 0.6, (0, 255, 255), 2)
        
        # Convert to bytes for saving
        _, buffer = cv2.imencode('.jpg', annotated)
        return ContentFile(buffer.tobytes(), name='processed.jpg')


class PotholeVideoAnalyzer:
    def __init__(self, reference_object_size_cm=None, frame_skip=5):
        """
        Initialize video analyzer
        frame_skip: Analyze every Nth frame (default 5 for efficiency)
        """
        self.image_analyzer = PotholeAnalyzer(reference_object_size_cm)
        self.frame_skip = frame_skip
        self.detections = []
    
    def analyze_video(self, video_path, progress_callback=None):
        """
        Analyze video for potholes
        progress_callback: Optional function(progress_percent) for tracking
        Returns: dict with aggregate results and frame detections
        """
        cap = cv2.VideoCapture(video_path)
        
        if not cap.isOpened():
            raise ValueError("Could not open video file")
        
        # Get video properties
        fps = cap.get(cv2.CAP_PROP_FPS)
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        duration = total_frames / fps if fps > 0 else 0
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        detections = []
        frame_number = 0
        frames_processed = 0
        
        # Temporary directory for frame images
        temp_dir = tempfile.mkdtemp()
        
        # Video writer for processed video
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        temp_output = os.path.join(temp_dir, 'output.mp4')
        out = cv2.VideoWriter(temp_output, fourcc, fps, (width, height))
        
        try:
            while True:
                ret, frame = cap.read()
                if not ret:
                    break
                
                timestamp = frame_number / fps if fps > 0 else 0
                
                # Process every Nth frame
                if frame_number % self.frame_skip == 0:
                    # Save frame temporarily
                    temp_frame_path = os.path.join(temp_dir, f'frame_{frame_number}.jpg')
                    cv2.imwrite(temp_frame_path, frame)
                    
                    # Analyze frame
                    try:
                        result = self.image_analyzer.analyze_image(temp_frame_path)
                        
                        if result:
                            detection = {
                                'frame_number': frame_number,
                                'timestamp_seconds': round(timestamp, 2),
                                'width_cm': result['width_cm'],
                                'height_cm': result['height_cm'],
                                'area_cm2': result['area_cm2'],
                                'depth_estimate': result['depth_estimate'],
                                'perimeter_cm': result['perimeter_cm'],
                                'severity': result['severity'],
                                'confidence_score': result['confidence_score'],
                                'impact_score': result['impact_score'],
                                'bounding_box': result['bounding_box'],
                                'frame_path': temp_frame_path
                            }
                            detections.append(detection)
                            
                            # Annotate this frame
                            annotated_frame = self._annotate_frame(frame, result)
                            out.write(annotated_frame)
                        else:
                            out.write(frame)
                    except Exception as e:
                        print(f"Error analyzing frame {frame_number}: {str(e)}")
                        out.write(frame)
                    
                    frames_processed += 1
                    
                    # Progress callback
                    if progress_callback:
                        progress = int((frame_number / total_frames) * 100)
                        progress_callback(progress)
                else:
                    out.write(frame)
                
                frame_number += 1
            
        finally:
            cap.release()
            out.release()
        
        # Generate thumbnail (first frame with detection or first frame)
        thumbnail_path = None
        if detections:
            thumbnail_path = detections[0]['frame_path']
        elif frame_number > 0:
            cap = cv2.VideoCapture(video_path)
            ret, first_frame = cap.read()
            if ret:
                thumbnail_path = os.path.join(temp_dir, 'thumbnail.jpg')
                cv2.imwrite(thumbnail_path, first_frame)
            cap.release()
        
        # Calculate aggregate statistics
        aggregate_stats = self._calculate_aggregate_stats(detections)
        
        return {
            'video_metadata': {
                'fps': fps,
                'total_frames': total_frames,
                'duration_seconds': round(duration, 2),
                'frames_analyzed': frames_processed,
                'width': width,
                'height': height
            },
            'detections': detections,
            'aggregate_stats': aggregate_stats,
            'processed_video_path': temp_output,
            'thumbnail_path': thumbnail_path,
            'temp_dir': temp_dir
        }
    
    def _annotate_frame(self, frame, analysis_result):
        """Annotate a single frame with detection info"""
        annotated = frame.copy()
        
        x, y, w, h = analysis_result['bounding_box']
        
        # Draw bounding box
        cv2.rectangle(annotated, (x, y), (x + w, y + h), (0, 255, 0), 2)
        
        # Add severity label
        severity_colors = {
            'low': (0, 255, 0),
            'medium': (0, 255, 255),
            'high': (0, 165, 255),
            'critical': (0, 0, 255)
        }
        color = severity_colors.get(analysis_result['severity'], (255, 255, 255))
        
        label = f"{analysis_result['severity'].upper()} - {analysis_result['area_cm2']:.0f}cm2"
        cv2.putText(annotated, label, (x, y - 10), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 2)
        
        return annotated
    
    def _calculate_aggregate_stats(self, detections):
        """Calculate aggregate statistics from all detections"""
        if not detections:
            return {
                'total_potholes': 0,
                'average_severity': None,
                'max_severity': None,
                'average_area_cm2': 0,
                'average_depth_cm': 0,
                'total_estimated_cost': 0,
                'severity_breakdown': {},
                'timestamp_data': []
            }
        
        # Severity ordering
        severity_order = {'low': 1, 'medium': 2, 'high': 3, 'critical': 4}
        
        total_potholes = len(detections)
        severities = [d['severity'] for d in detections]
        areas = [d['area_cm2'] for d in detections]
        depths = [d['depth_estimate'] for d in detections]
        
        # Severity breakdown
        severity_breakdown = {}
        for sev in severities:
            severity_breakdown[sev] = severity_breakdown.get(sev, 0) + 1
        
        # Average severity (weighted)
        avg_severity_score = sum(severity_order[s] for s in severities) / len(severities)
        if avg_severity_score <= 1.5:
            avg_severity = 'low'
        elif avg_severity_score <= 2.5:
            avg_severity = 'medium'
        elif avg_severity_score <= 3.5:
            avg_severity = 'high'
        else:
            avg_severity = 'critical'
        
        # Max severity
        max_severity = max(severities, key=lambda x: severity_order[x])
        
        # Estimated total cost
        total_cost = sum(50 + (d['area_cm2'] * 0.5) + (d['depth_estimate'] * 10) 
                        for d in detections)
        
        # Timestamp data for timeline
        timestamp_data = [
            {
                'timestamp': d['timestamp_seconds'],
                'frame': d['frame_number'],
                'severity': d['severity'],
                'area': d['area_cm2']
            }
            for d in detections
        ]
        
        return {
            'total_potholes': total_potholes,
            'average_severity': avg_severity,
            'max_severity': max_severity,
            'average_area_cm2': round(sum(areas) / len(areas), 2),
            'average_depth_cm': round(sum(depths) / len(depths), 2),
            'total_estimated_cost': round(total_cost, 2),
            'severity_breakdown': severity_breakdown,
            'timestamp_data': timestamp_data
        }