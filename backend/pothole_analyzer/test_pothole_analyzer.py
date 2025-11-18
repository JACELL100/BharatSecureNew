# test_pothole_analyzer.py
import requests
import os

API_BASE = "http://localhost:8000/pothole/api"

def test_upload_and_analyze():
    """Test uploading an image and getting analysis"""
    
    # Path to test image
    test_image = "path/to/your/test/pothole.jpg"
    
    if not os.path.exists(test_image):
        print("❌ Test image not found!")
        return
    
    print("📤 Uploading image for analysis...")
    
    with open(test_image, 'rb') as img:
        files = {'image': img}
        response = requests.post(f"{API_BASE}/analyses/", files=files)
    
    if response.status_code == 201:
        print("✅ Upload successful!")
        data = response.json()
        print(f"\n📊 Analysis Results:")
        print(f"   Severity: {data['severity']}")
        print(f"   Size: {data['width_cm']} x {data['height_cm']} cm")
        print(f"   Area: {data['area_cm2']} cm²")
        print(f"   Depth: ~{data['depth_estimate']} cm")
        print(f"   Impact Score: {data['impact_score']}/10")
        print(f"   Estimated Cost: ${data['estimated_repair_cost']}")
        print(f"   Confidence: {data['confidence_score']*100}%")
        return data['id']
    else:
        print(f"❌ Upload failed: {response.status_code}")
        print(response.text)
        return None

def test_get_all_analyses():
    """Test fetching all analyses"""
    print("\n📋 Fetching all analyses...")
    response = requests.get(f"{API_BASE}/analyses/")
    
    if response.status_code == 200:
        analyses = response.json()
        print(f"✅ Found {len(analyses)} analyses")
        return analyses
    else:
        print(f"❌ Failed to fetch: {response.status_code}")
        return []

def test_reanalyze(analysis_id):
    """Test reanalyzing an existing image"""
    print(f"\n🔄 Reanalyzing image {analysis_id}...")
    response = requests.post(f"{API_BASE}/analyses/{analysis_id}/reanalyze/")
    
    if response.status_code == 200:
        print("✅ Reanalysis successful!")
        return True
    else:
        print(f"❌ Reanalysis failed: {response.status_code}")
        return False

if __name__ == "__main__":
    print("🚀 Starting Pothole Analyzer Tests\n")
    print("=" * 50)
    
    # Test 1: Upload and analyze
    analysis_id = test_upload_and_analyze()
    
    # Test 2: Get all analyses
    test_get_all_analyses()
    
    # Test 3: Reanalyze (if we have an ID)
    if analysis_id:
        test_reanalyze(analysis_id)
    
    print("\n" + "=" * 50)
    print("✨ Tests completed!")