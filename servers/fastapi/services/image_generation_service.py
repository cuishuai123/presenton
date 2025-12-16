import asyncio
import os
import aiohttp
import subprocess
import uuid
from google import genai
from google.genai.types import GenerateContentConfig
from openai import AsyncOpenAI
from models.image_prompt import ImagePrompt
from models.sql.image_asset import ImageAsset
from utils.download_helpers import download_file
from utils.get_env import (
    get_pexels_api_key_env,
    get_pixabay_api_key_env,
    get_z_image_turbo_script_path_env,
    get_z_image_turbo_host_env,
    get_z_image_turbo_port_env,
)
from utils.image_provider import (
    is_pixels_selected,
    is_pixabay_selected,
    is_gemini_flash_selected,
    is_dalle3_selected,
    is_z_image_turbo_selected,
    get_selected_image_provider,
)


class ImageGenerationService:

    def __init__(self, output_directory: str):
        self.output_directory = output_directory
        self.image_gen_func = self.get_image_gen_func()

    def get_image_gen_func(self):
        # 优先使用自定义脚本（若未显式配置 IMAGE_PROVIDER，则默认走脚本）
        if is_z_image_turbo_selected() or not get_selected_image_provider():
            return self.generate_image_z_image_turbo
        if is_pixabay_selected():
            return self.get_image_from_pixabay
        elif is_pixels_selected():
            return self.get_image_from_pexels
        elif is_gemini_flash_selected():
            return self.generate_image_google
        elif is_dalle3_selected():
            return self.generate_image_openai
        elif is_z_image_turbo_selected():
            return self.generate_image_z_image_turbo
        return None

    def is_stock_provider_selected(self):
        return is_pixels_selected() or is_pixabay_selected()

    def translate_prompt_to_chinese(self, text: str) -> str:
        """
        Quick bilingual fallback: if常见英文提示出现，则替换为中文描述，避免外部图库返回空字段。
        可以按需扩展更多映射或接入真正的翻译服务。
        """
        if not text:
            return text
        if "professional data analyst working on AI project" in text:
            return "在现代办公桌前工作的专业数据分析师，电脑屏幕上展示着算法图表"
        return text

    async def generate_image(self, prompt: ImagePrompt) -> str | ImageAsset:
        """
        Generates an image based on the provided prompt.
        - If no image generation function is available, returns a placeholder image.
        - If the stock provider is selected, it uses the prompt directly,
        otherwise it uses the full image prompt with theme.
        - Output Directory is used for saving the generated image not the stock provider.
        """
        if not self.image_gen_func:
            print("No image generation function found. Using placeholder image.")
            return "/static/images/placeholder.jpg"

        image_prompt = prompt.get_image_prompt(
            with_theme=not self.is_stock_provider_selected()
        )
        image_prompt = self.translate_prompt_to_chinese(image_prompt)
        print(f"Request - Generating Image for {image_prompt}")

        try:
            if self.is_stock_provider_selected():
                image_path = await self.image_gen_func(image_prompt)
            else:
                image_path = await self.image_gen_func(
                    image_prompt, self.output_directory
                )
            if image_path:
                if image_path.startswith("http"):
                    return image_path
                elif os.path.exists(image_path):
                    return ImageAsset(
                        path=image_path,
                        is_uploaded=False,
                        extras={
                            "prompt": prompt.prompt,
                            "theme_prompt": prompt.theme_prompt,
                        },
                    )
            raise Exception(f"Image not found at {image_path}")

        except Exception as e:
            print(f"Error generating image: {e}")
            # 如果当前是图库/外部服务失败，尝试脚本兜底（检查脚本是否可用）
            if self.is_stock_provider_selected():
                try:
                    # 检查脚本是否存在（检查多个可能位置）
                    current_file_dir = os.path.dirname(os.path.abspath(__file__))
                    project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", ".."))
                    possible_paths = [
                        os.path.join(project_root, "scripts", "run_prompt.py"),
                        os.path.join(project_root, "..", "pythondemo", "run_prompt.py"),
                    ]
                    env_script_path = get_z_image_turbo_script_path_env()
                    
                    script_available = False
                    for possible_path in possible_paths:
                        if os.path.exists(os.path.abspath(possible_path)):
                            script_available = True
                            break
                    if not script_available and env_script_path:
                        if not os.path.isabs(env_script_path):
                            env_script_path = os.path.join(project_root, env_script_path)
                        if os.path.exists(env_script_path):
                            script_available = True
                    
                    if script_available:
                        print("Fallback to z-image-turbo script after provider failure")
                        image_path = await self.generate_image_z_image_turbo(
                            image_prompt, self.output_directory
                        )
                        if image_path:
                            if image_path.startswith("http"):
                                return image_path
                            elif os.path.exists(image_path):
                                return ImageAsset(
                                    path=image_path,
                                    is_uploaded=False,
                                    extras={
                                        "prompt": prompt.prompt,
                                        "theme_prompt": prompt.theme_prompt,
                                    },
                                )
                except Exception as sub_e:
                    print(f"Fallback z-image-turbo also failed: {sub_e}")
            return "/static/images/placeholder.jpg"

    async def generate_image_openai(self, prompt: str, output_directory: str) -> str:
        client = AsyncOpenAI()
        result = await client.images.generate(
            model="dall-e-3",
            prompt=prompt,
            n=1,
            quality="standard",
            size="1024x1024",
        )
        image_url = result.data[0].url
        return await download_file(image_url, output_directory)

    async def generate_image_google(self, prompt: str, output_directory: str) -> str:
        client = genai.Client()
        response = await asyncio.to_thread(
            client.models.generate_content,
            model="gemini-2.5-flash-image-preview",
            contents=[prompt],
            config=GenerateContentConfig(response_modalities=["TEXT", "IMAGE"]),
        )

        for part in response.candidates[0].content.parts:
            if part.text is not None:
                print(part.text)
            elif part.inline_data is not None:
                image_path = os.path.join(output_directory, f"{uuid.uuid4()}.jpg")
                with open(image_path, "wb") as f:
                    f.write(part.inline_data.data)

        return image_path

    async def get_image_from_pexels(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://api.pexels.com/v1/search?query={prompt}&per_page=1",
                headers={"Authorization": f"{get_pexels_api_key_env()}"},
            )
            if response.status != 200:
                text = await response.text()
                raise Exception(f"Pexels request failed: {response.status}, body: {text[:500]}")
            data = await response.json()
            photos = data.get("photos") or []
            if not photos:
                raise Exception(f"Pexels response missing photos: keys={list(data.keys())}")
            first = photos[0]
            src = first.get("src") or {}
            image_url = src.get("large") or src.get("original") or ""
            if not image_url:
                raise Exception(f"Pexels response missing image url: {first}")
            return image_url

    async def get_image_from_pixabay(self, prompt: str) -> str:
        async with aiohttp.ClientSession(trust_env=True) as session:
            response = await session.get(
                f"https://pixabay.com/api/?key={get_pixabay_api_key_env()}&q={prompt}&image_type=photo&per_page=3"
            )
            if response.status != 200:
                text = await response.text()
                raise Exception(f"Pixabay request failed: {response.status}, body: {text[:500]}")
            data = await response.json()
            hits = data.get("hits") or []
            if not hits:
                raise Exception(f"Pixabay response missing hits: keys={list(data.keys())}")
            first = hits[0]
            image_url = first.get("largeImageURL") or first.get("webformatURL") or ""
            if not image_url:
                raise Exception(f"Pixabay response missing image url: {first}")
            return image_url

    async def generate_image_z_image_turbo(self, prompt: str, output_directory: str) -> str:
        """
        Generate image using Z-Image-Turbo script (run_prompt.py)
        Supports both in-project script and external script via environment variable.
        """
        # First, try to find script in project directory (scripts/run_prompt.py)
        # Get project root directory (assuming we're in servers/fastapi/services/)
        current_file_dir = os.path.dirname(os.path.abspath(__file__))
        project_root = os.path.abspath(os.path.join(current_file_dir, "..", "..", ".."))
        
        # First, try environment variable path (highest priority)
        script_path = None
        env_script_path = get_z_image_turbo_script_path_env()
        if env_script_path:
            if not os.path.isabs(env_script_path):
                 # If relative path, resolve relative to project root
                 env_script_path = os.path.join(project_root, env_script_path)
            if os.path.exists(env_script_path):
                script_path = os.path.abspath(env_script_path)
                print(f"Using Z-Image-Turbo script from environment variable: {script_path}")
        
        # If not found, try multiple possible locations
        if not script_path:
            possible_paths = [
                os.path.join(project_root, "scripts", "run_prompt.py"),  # scripts/run_prompt.py
                os.path.join(project_root, "..", "pythondemo", "run_prompt.py"),  # ../pythondemo/run_prompt.py
            ]
            
            for possible_path in possible_paths:
                abs_path = os.path.abspath(possible_path)
                print(f"Checking script path: {abs_path} (exists: {os.path.exists(abs_path)})")
                if os.path.exists(abs_path):
                    script_path = abs_path
                    print(f"Using Z-Image-Turbo script from: {script_path}")
                    break
        
        if not script_path or not os.path.exists(script_path):
            error_msg = (
                f"Z-Image-Turbo script not found. Please either:\n"
                f"1. Place run_prompt.py in {project_root}/scripts/run_prompt.py, or\n"
                f"2. Set Z_IMAGE_TURBO_SCRIPT_PATH environment variable to the script path."
            )
            raise Exception(error_msg)
        
        host = get_z_image_turbo_host_env() or "10.221.80.199"
        port = get_z_image_turbo_port_env() or "8187"
        
        # Generate unique filename
        unique_filename = f"{uuid.uuid4()}.png"
        output_path = os.path.join(output_directory, unique_filename)
        
        # Ensure output directory exists
        os.makedirs(output_directory, exist_ok=True)
        
        # Determine Python executable (cross-platform)
        script_dir = os.path.dirname(script_path)
        
        # Try to find Python executable in script directory
        # Windows: py312\python.exe or python.exe
        # Linux: python3 or python
        if os.name == 'nt':  # Windows
            py312_path = os.path.join(script_dir, "py312", "python.exe")
            python_exe = py312_path if os.path.exists(py312_path) else "python"
        else:  # Linux/Unix
            # Try python3 first, then python
            python3_path = os.path.join(script_dir, "py312", "python3")
            if os.path.exists(python3_path):
                python_exe = python3_path
            else:
                python_exe = "python3"  # Use python3 on Linux
        
        # Run the script in a thread pool to avoid blocking
        def run_script():
            # Use local variable to avoid scope issues
            local_output_path = output_path
            
            cmd = [
                python_exe,
                script_path,
                "--prompt", prompt,
                "--host", str(host),
                "--port", str(port),
                "--save-dir", output_directory,
                "--save-name", unique_filename,
                "--timeout", "300",
            ]
            
            print(f"Running Z-Image-Turbo command: {' '.join(cmd)}")
            print(f"Working directory: {script_dir}")
            print(f"Output will be saved to: {local_output_path}")
            
            try:
                result = subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=320,  # Slightly longer than script timeout
                    check=True,
                    cwd=script_dir  # Run from script directory
                )
                print(f"Z-Image-Turbo stdout: {result.stdout}")
                if result.stderr:
                    print(f"Z-Image-Turbo stderr: {result.stderr}")
                
                # Verify the file was created
                if not os.path.exists(local_output_path):
                    # Try to find the file with a different name (script might have generated a different name)
                    files_in_dir = os.listdir(output_directory)
                    png_files = [f for f in files_in_dir if f.endswith('.png')]
                    if png_files:
                        # Use the most recently created PNG file
                        png_files.sort(key=lambda f: os.path.getmtime(os.path.join(output_directory, f)), reverse=True)
                        local_output_path = os.path.join(output_directory, png_files[0])
                        print(f"Using generated file: {local_output_path}")
                    else:
                        raise Exception(f"Generated image not found at: {local_output_path}. Files in directory: {files_in_dir}")
                
                return local_output_path
            except subprocess.TimeoutExpired:
                raise Exception("Z-Image-Turbo script timed out after 320 seconds")
            except subprocess.CalledProcessError as e:
                error_msg = f"Z-Image-Turbo script failed with exit code {e.returncode}. stderr: {e.stderr or 'None'}, stdout: {e.stdout or 'None'}"
                print(error_msg)
                raise Exception(error_msg)
            except Exception as e:
                error_msg = f"Error running Z-Image-Turbo script: {str(e)}"
                print(error_msg)
                import traceback
                traceback.print_exc()
                raise Exception(error_msg)
        
        # Run in thread pool to make it async
        image_path = await asyncio.to_thread(run_script)
        
        # Final verification
        if not os.path.exists(image_path):
            raise Exception(f"Generated image not found at: {image_path}")
        
        print(f"Successfully generated image at: {image_path}")
        return image_path
