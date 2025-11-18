from django.db import models
from django.core.validators import FileExtensionValidator

class PotholeAnalysis(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    image = models.ImageField(
        upload_to='potholes/',
        validators=[FileExtensionValidator(['jpg', 'jpeg', 'png'])]
    )
    processed_image = models.ImageField(upload_to='processed/', null=True, blank=True)
    
    # Analysis Results
    width_cm = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    area_cm2 = models.FloatField(null=True, blank=True)
    depth_estimate = models.FloatField(null=True, blank=True, help_text="Estimated depth in cm")
    perimeter_cm = models.FloatField(null=True, blank=True)
    
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    
    # Location & Impact
    location = models.CharField(max_length=255, null=True, blank=True)
    latitude = models.FloatField(null=True, blank=True, help_text="GPS latitude coordinate")
    longitude = models.FloatField(null=True, blank=True, help_text="GPS longitude coordinate") 
    location_accuracy = models.FloatField(null=True, blank=True, help_text="GPS accuracy in meters")
    impact_score = models.IntegerField(null=True, blank=True, help_text="1-10 scale")
    repair_priority = models.IntegerField(null=True, blank=True, help_text="1-5 scale")
    estimated_repair_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Pothole Analysis {self.id} - {self.severity or 'Pending'}"


class PotholeVideoAnalysis(models.Model):
    SEVERITY_CHOICES = [
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    ]
    
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]
    
    # Video file
    video = models.FileField(
        upload_to='pothole_videos/',
        validators=[FileExtensionValidator(['mp4', 'avi', 'mov', 'mkv', 'webm'])]
    )
    processed_video = models.FileField(upload_to='processed_videos/', null=True, blank=True)
    thumbnail = models.ImageField(upload_to='video_thumbnails/', null=True, blank=True)
    
    # Processing status
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    processing_progress = models.IntegerField(default=0, help_text="Progress percentage 0-100")
    error_message = models.TextField(blank=True, null=True)
    
    # Video metadata
    duration_seconds = models.FloatField(null=True, blank=True)
    fps = models.FloatField(null=True, blank=True)
    total_frames = models.IntegerField(null=True, blank=True)
    frames_analyzed = models.IntegerField(default=0)
    
    # Aggregate analysis results
    total_potholes_detected = models.IntegerField(default=0)
    average_severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, null=True, blank=True)
    max_severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, null=True, blank=True)
    average_area_cm2 = models.FloatField(null=True, blank=True)
    average_depth_cm = models.FloatField(null=True, blank=True)
    total_estimated_cost = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    
    # Location tracking
    route_name = models.CharField(max_length=255, null=True, blank=True)
    gps_data = models.JSONField(null=True, blank=True, help_text="GPS coordinates for video route")
    
    # Timestamps
    timestamp_data = models.JSONField(null=True, blank=True, help_text="Pothole detections with timestamps")
    
    # Metadata
    location = models.CharField(max_length=255, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    analyzed_at = models.DateTimeField(null=True, blank=True)
    notes = models.TextField(blank=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name = 'Pothole Video Analysis'
        verbose_name_plural = 'Pothole Video Analyses'
    
    def __str__(self):
        return f"Video Analysis {self.id} - {self.status} - {self.total_potholes_detected} potholes"


class VideoFrameDetection(models.Model):
    """Store individual pothole detections from video frames"""
    video_analysis = models.ForeignKey(
        PotholeVideoAnalysis, 
        on_delete=models.CASCADE, 
        related_name='frame_detections'
    )
    
    frame_number = models.IntegerField()
    timestamp_seconds = models.FloatField()
    frame_image = models.ImageField(upload_to='video_frames/', null=True, blank=True)
    
    # Detection results
    width_cm = models.FloatField(null=True, blank=True)
    height_cm = models.FloatField(null=True, blank=True)
    area_cm2 = models.FloatField(null=True, blank=True)
    depth_estimate = models.FloatField(null=True, blank=True)
    perimeter_cm = models.FloatField(null=True, blank=True)
    
    severity = models.CharField(max_length=20, choices=PotholeVideoAnalysis.SEVERITY_CHOICES, null=True, blank=True)
    confidence_score = models.FloatField(null=True, blank=True)
    impact_score = models.IntegerField(null=True, blank=True)
    
    # Bounding box coordinates
    bbox_x = models.IntegerField(null=True, blank=True)
    bbox_y = models.IntegerField(null=True, blank=True)
    bbox_width = models.IntegerField(null=True, blank=True)
    bbox_height = models.IntegerField(null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['frame_number']
        unique_together = ['video_analysis', 'frame_number']
    
    def __str__(self):
        return f"Frame {self.frame_number} - {self.severity or 'Unknown'}"