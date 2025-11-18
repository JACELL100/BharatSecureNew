# admin.py
from django.contrib import admin
from django.utils.html import format_html
from .models import PotholeAnalysis, PotholeVideoAnalysis, VideoFrameDetection


@admin.register(PotholeAnalysis)
class PotholeAnalysisAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'image_thumbnail', 'severity', 'area_cm2', 
        'depth_estimate', 'confidence_score', 'created_at', 'analyzed_at'
    ]
    list_filter = ['severity', 'created_at', 'analyzed_at']
    search_fields = ['location', 'notes']
    readonly_fields = [
        'image_preview', 'processed_image_preview', 'width_cm', 'height_cm', 
        'area_cm2', 'depth_estimate', 'perimeter_cm', 'severity', 
        'confidence_score', 'impact_score', 'repair_priority', 
        'estimated_repair_cost', 'analyzed_at', 'created_at'
    ]
    
    fieldsets = (
        ('Images', {
            'fields': ('image', 'image_preview', 'processed_image', 'processed_image_preview')
        }),
        ('Analysis Results', {
            'fields': (
                'width_cm', 'height_cm', 'area_cm2', 'depth_estimate', 
                'perimeter_cm', 'severity', 'confidence_score'
            )
        }),
        ('Impact Assessment', {
            'fields': ('impact_score', 'repair_priority', 'estimated_repair_cost')
        }),
        ('Location & Notes', {
            'fields': ('location', 'notes')
        }),
        ('Timestamps', {
            'fields': ('created_at', 'analyzed_at')
        }),
    )
    
    def image_thumbnail(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="50" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.image.url
            )
        return '-'
    image_thumbnail.short_description = 'Image'
    
    def image_preview(self, obj):
        if obj.image:
            return format_html(
                '<img src="{}" width="300" style="border-radius: 8px;" />',
                obj.image.url
            )
        return '-'
    image_preview.short_description = 'Original Image'
    
    def processed_image_preview(self, obj):
        if obj.processed_image:
            return format_html(
                '<img src="{}" width="300" style="border-radius: 8px;" />',
                obj.processed_image.url
            )
        return '-'
    processed_image_preview.short_description = 'Processed Image'


class VideoFrameDetectionInline(admin.TabularInline):
    model = VideoFrameDetection
    extra = 0
    readonly_fields = ['frame_number', 'timestamp_seconds', 'severity', 'area_cm2', 'confidence_score']
    can_delete = False
    max_num = 10
    
    fields = ['frame_number', 'timestamp_seconds', 'severity', 'area_cm2', 'confidence_score']


@admin.register(PotholeVideoAnalysis)
class PotholeVideoAnalysisAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'video_thumbnail', 'status', 'processing_progress', 
        'total_potholes_detected', 'max_severity', 'duration_seconds', 
        'route_name', 'created_at'
    ]
    list_filter = ['status', 'max_severity', 'average_severity', 'created_at']
    search_fields = ['route_name', 'location', 'notes']
    readonly_fields = [
        'video_thumbnail_large', 'status', 'processing_progress', 'error_message',
        'duration_seconds', 'fps', 'total_frames', 'frames_analyzed',
        'total_potholes_detected', 'average_severity', 'max_severity',
        'average_area_cm2', 'average_depth_cm', 'total_estimated_cost',
        'timestamp_data', 'analyzed_at', 'created_at'
    ]
    
    inlines = [VideoFrameDetectionInline]
    
    fieldsets = (
        ('Video Files', {
            'fields': ('video', 'processed_video', 'thumbnail', 'video_thumbnail_large')
        }),
        ('Processing Status', {
            'fields': ('status', 'processing_progress', 'error_message')
        }),
        ('Video Metadata', {
            'fields': ('duration_seconds', 'fps', 'total_frames', 'frames_analyzed')
        }),
        ('Analysis Results', {
            'fields': (
                'total_potholes_detected', 'average_severity', 'max_severity',
                'average_area_cm2', 'average_depth_cm', 'total_estimated_cost'
            )
        }),
        ('Location & Route', {
            'fields': ('route_name', 'location', 'gps_data')
        }),
        ('Timeline Data', {
            'fields': ('timestamp_data',),
            'classes': ('collapse',)
        }),
        ('Notes', {
            'fields': ('notes',)
        }),
        ('Timestamps', {
            'fields': ('created_at', 'analyzed_at')
        }),
    )
    
    def video_thumbnail(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="80" height="50" style="object-fit: cover; border-radius: 4px;" />',
                obj.thumbnail.url
            )
        return '-'
    video_thumbnail.short_description = 'Thumbnail'
    
    def video_thumbnail_large(self, obj):
        if obj.thumbnail:
            return format_html(
                '<img src="{}" width="400" style="border-radius: 8px;" />',
                obj.thumbnail.url
            )
        return '-'
    video_thumbnail_large.short_description = 'Video Thumbnail'
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.status == 'processing':
            return self.readonly_fields
        return self.readonly_fields


@admin.register(VideoFrameDetection)
class VideoFrameDetectionAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'video_analysis', 'frame_number', 'timestamp_seconds',
        'severity', 'area_cm2', 'confidence_score'
    ]
    list_filter = ['severity', 'video_analysis', 'created_at']
    search_fields = ['video_analysis__route_name', 'frame_number']
    readonly_fields = [
        'frame_image_preview', 'video_analysis', 'frame_number', 
        'timestamp_seconds', 'width_cm', 'height_cm', 'area_cm2', 
        'depth_estimate', 'perimeter_cm', 'severity', 'confidence_score', 
        'impact_score', 'bbox_x', 'bbox_y', 'bbox_width', 'bbox_height', 
        'created_at'
    ]
    
    fieldsets = (
        ('Frame Information', {
            'fields': ('video_analysis', 'frame_number', 'timestamp_seconds', 'frame_image', 'frame_image_preview')
        }),
        ('Detection Results', {
            'fields': (
                'width_cm', 'height_cm', 'area_cm2', 'depth_estimate', 
                'perimeter_cm', 'severity', 'confidence_score', 'impact_score'
            )
        }),
        ('Bounding Box', {
            'fields': ('bbox_x', 'bbox_y', 'bbox_width', 'bbox_height')
        }),
        ('Timestamp', {
            'fields': ('created_at',)
        }),
    )
    
    def frame_image_preview(self, obj):
        if obj.frame_image:
            return format_html(
                '<img src="{}" width="400" style="border-radius: 8px;" />',
                obj.frame_image.url
            )
        return '-'
    frame_image_preview.short_description = 'Frame Image'
    
    def has_add_permission(self, request):
        return False
    
    def has_delete_permission(self, request, obj=None):
        return True 
        