import os
from utils.get_env import get_app_data_directory_env


def get_images_directory():
    images_directory = os.path.join(get_app_data_directory_env(), "images")
    os.makedirs(images_directory, exist_ok=True)
    return images_directory


def get_exports_directory():
    export_directory = os.path.join(get_app_data_directory_env(), "exports")
    os.makedirs(export_directory, exist_ok=True)
    return export_directory

def get_uploads_directory():
    uploads_directory = os.path.join(get_app_data_directory_env(), "uploads")
    os.makedirs(uploads_directory, exist_ok=True)
    return uploads_directory


def convert_path_to_url(file_path: str) -> str:
    """
    Convert absolute file path to URL path format for frontend.
    Example: "G:\\desk\\tegongban\\no_node-presenton\\app_data\\images\\xxx.png" -> "/app_data/images/xxx.png"
    
    Args:
        file_path: Absolute file path or URL path
        
    Returns:
        URL path format (e.g., "/app_data/images/xxx.png")
    """
    if not file_path:
        return file_path
    
    # If already a URL path, return as is
    if file_path.startswith('/app_data/') or file_path.startswith('/static/') or file_path.startswith('http'):
        return file_path
    
    # Get the images directory path
    images_directory = get_images_directory()
    
    # Normalize paths for comparison
    normalized_file_path = os.path.normpath(file_path)
    normalized_images_dir = os.path.normpath(images_directory)
    
    # Check if the file is in the images directory
    if normalized_file_path.startswith(normalized_images_dir):
        # Extract relative path from images directory
        relative_path = os.path.relpath(normalized_file_path, normalized_images_dir)
        # Convert to URL format
        return f"/app_data/images/{relative_path.replace(os.sep, '/')}"
    
    # If file is not in images directory, try to extract filename
    filename = os.path.basename(normalized_file_path)
    return f"/app_data/images/{filename}"
