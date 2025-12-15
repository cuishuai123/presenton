"""
Simple Z-Image-Turbo backend runner (no workflow files needed).

Run:
  1) Start the app with 开始.bat so backend is up.
  2) Execute:
        py312\\python.exe run_prompt.py --prompt "a cat on the beach"

This script sends a minimal API prompt graph to:
  POST http://127.0.0.1:8187/prompt
and waits for completion, then prints the newest output image path.
"""

from __future__ import annotations

import argparse
import copy
import json
import os
import shutil
import sys
import time
from urllib import error, request
from urllib.parse import urlencode


BASE_GRAPH: dict[str, dict] = {
    "1": {  # positive
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": ["5", 0], "text": "a photo of a cat"},
    },
    "2": {  # negative
        "class_type": "CLIPTextEncode",
        "inputs": {"clip": ["5", 0], "text": ""},
    },
    "3": {
        "class_type": "UNETLoader",
        "inputs": {
            "unet_name": "z-image-turbo-fp8-e4m3fn.safetensors",
            "weight_dtype": "fp8_e4m3fn_fast",
        },
    },
    "4": {"class_type": "VAELoader", "inputs": {"vae_name": "ae.safetensors"}},
    "5": {
        "class_type": "CLIPLoader",
        "inputs": {"clip_name": "qwen_3_4b.safetensors", "type": "lumina2", "device": "cpu"},
    },
    "16": {
        "class_type": "EmptySD3LatentImage",
        "inputs": {"width": 1024, "height": 576, "batch_size": 1},
    },
    "17": {
        "class_type": "PathchSageAttentionKJ",
        "inputs": {"model": ["3", 0], "sage_attention": "auto"},
    },
    "14": {
        "class_type": "ModelSamplingAuraFlow",
        "inputs": {"model": ["17", 0], "shift": 3},
    },
    "7": {
        "class_type": "KSampler",
        "inputs": {
            "model": ["14", 0],
            "positive": ["1", 0],
            "negative": ["2", 0],
            "latent_image": ["16", 0],
            "seed": 0,
            "steps": 9,
            "cfg": 1,
            "sampler_name": "euler",
            "scheduler": "simple",
            "denoise": 1,
        },
    },
    "9": {"class_type": "VAEDecode", "inputs": {"samples": ["7", 0], "vae": ["4", 0]}},
    "10": {
        "class_type": "SaveImage",
        "inputs": {"images": ["9", 0], "filename_prefix": "ZIMAGE"},
    },
}


def http_json(base_url: str, path: str, method: str = "GET", payload: dict | None = None, timeout: int = 30):
    url = base_url.rstrip("/") + path
    data = None
    headers = {"Content-Type": "application/json"}
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, data=data, headers=headers, method=method)
    with request.urlopen(req, timeout=timeout) as resp:
        body = resp.read()
        return json.loads(body.decode("utf-8")) if body else None


def latest_output(out_dir: str) -> str | None:
    if not os.path.isdir(out_dir):
        return None
    files = [os.path.join(out_dir, f) for f in os.listdir(out_dir)]
    files = [f for f in files if os.path.isfile(f)]
    if not files:
        return None
    return max(files, key=lambda p: os.path.getmtime(p))


def extract_output_paths(history_item: dict) -> list[str]:
    outputs = history_item.get("outputs", {})
    if not isinstance(outputs, dict):
        return []
    paths: list[str] = []
    for node_out in outputs.values():
        if not isinstance(node_out, dict):
            continue
        images = node_out.get("images", [])
        if not isinstance(images, list):
            continue
        for img in images:
            if not isinstance(img, dict):
                continue
            filename = img.get("filename")
            img_type = img.get("type", "output")
            subfolder = img.get("subfolder", "")
            if not filename or not isinstance(filename, str):
                continue
            base_dir = os.path.join("ComfyUI", str(img_type))
            if subfolder:
                base_dir = os.path.join(base_dir, str(subfolder))
            paths.append(os.path.join(base_dir, filename))
    return paths


def extract_output_images(history_item: dict) -> list[dict]:
    outputs = history_item.get("outputs", {})
    if not isinstance(outputs, dict):
        return []
    images_out: list[dict] = []
    for node_out in outputs.values():
        if not isinstance(node_out, dict):
            continue
        images = node_out.get("images", [])
        if not isinstance(images, list):
            continue
        for img in images:
            if isinstance(img, dict) and isinstance(img.get("filename"), str):
                images_out.append(img)
    return images_out


def download_image(base_url: str, img: dict, timeout: int = 60) -> bytes:
    params = {"filename": img.get("filename", "")}
    if img.get("type"):
        params["type"] = img.get("type")
    if img.get("subfolder"):
        params["subfolder"] = img.get("subfolder")
    url = base_url.rstrip("/") + "/view?" + urlencode(params)
    req = request.Request(url, method="GET")
    with request.urlopen(req, timeout=timeout) as resp:
        return resp.read()


def main() -> int:
    parser = argparse.ArgumentParser(description="Z-Image-Turbo backend prompt runner")
    parser.add_argument("--prompt", required=True, help="正面提示词")
    parser.add_argument("--negative", default="", help="反面提示词")
    parser.add_argument("--width", type=int, default=1024, help="宽度")
    parser.add_argument("--height", type=int, default=576, help="高度")
    parser.add_argument("--steps", type=int, default=9, help="采样步数")
    parser.add_argument("--cfg", type=float, default=1.0, help="CFG")
    parser.add_argument("--seed", type=int, default=None, help="随机种子，不填则随机")
    parser.add_argument("--denoise", type=float, default=1.0, help="Denoise (0-1)")
    parser.add_argument("--sampler", default="euler", help="采样器名")
    parser.add_argument("--scheduler", default="simple", help="调度器名")
    parser.add_argument("--shift", type=float, default=3.0, help="AuraFlow shift")
    parser.add_argument("--prefix", default="ZIMAGE", help="输出文件名前缀")
    parser.add_argument("--save-dir", help="将生成图片复制到该目录")
    parser.add_argument("--save-name", help="若只生成一张图，可在保存时重命名")
    parser.add_argument("--move", action="store_true", help="保存时移动文件而非复制")
    parser.add_argument("--host", default="127.0.0.1", help="backend host")
    parser.add_argument("--port", type=int, default=None, help="backend port (默认读 config.py)")
    parser.add_argument("--timeout", type=int, default=300, help="等待完成的秒数")
    parser.add_argument("--poll", type=float, default=1.0, help="轮询间隔秒")
    parser.add_argument("--no-wait", action="store_true", help="只提交不等待")
    args = parser.parse_args()

    port = args.port
    if port is None:
        try:
            import config  # type: ignore
            port = int(getattr(config, "comfyui_port", 8187))
        except Exception:
            port = 8187

    base_url = f"http://{args.host}:{port}"
    if "py312" not in os.path.normpath(sys.executable).lower():
        print("[warn] For consistent deps, run with py312\\python.exe")

    graph = copy.deepcopy(BASE_GRAPH)
    graph["1"]["inputs"]["text"] = args.prompt
    graph["2"]["inputs"]["text"] = args.negative
    graph["16"]["inputs"]["width"] = args.width
    graph["16"]["inputs"]["height"] = args.height
    graph["7"]["inputs"]["steps"] = args.steps
    graph["7"]["inputs"]["cfg"] = args.cfg
    graph["7"]["inputs"]["denoise"] = args.denoise
    graph["7"]["inputs"]["sampler_name"] = args.sampler
    graph["7"]["inputs"]["scheduler"] = args.scheduler
    graph["7"]["inputs"]["seed"] = args.seed if args.seed is not None else (int(time.time() * 1000) & 0xFFFFFFFFFFFFFFFF)
    graph["14"]["inputs"]["shift"] = args.shift
    graph["10"]["inputs"]["filename_prefix"] = args.prefix

    try:
        resp = http_json(base_url, "/prompt", method="POST", payload={"prompt": graph})
        prompt_id = (resp or {}).get("prompt_id")
        print(f"[ok] queued prompt_id={prompt_id}")
    except error.HTTPError as e:
        detail = e.read().decode("utf-8", errors="ignore")
        print(f"[fail] POST /prompt -> {e.code}: {detail}")
        return 2
    except Exception as e:
        print(f"[fail] cannot reach backend at {base_url}: {e}")
        return 3

    if args.no_wait or not prompt_id:
        print("[done] submitted (not waiting).")
        return 0

    deadline = time.time() + args.timeout
    print("[wait] polling /history...")
    while time.time() < deadline:
        try:
            hist = http_json(base_url, f"/history/{prompt_id}")
        except Exception:
            hist = None
        item = hist.get(prompt_id) if isinstance(hist, dict) else None
        status = (item or {}).get("status") if isinstance(item, dict) else None
        if status and status.get("completed"):
            ok = status.get("status_str") == "success"
            print(f"[done] completed={status.get('completed')} status_str={status.get('status_str')}")
            output_images: list[dict] = []
            output_paths: list[str] = []
            if isinstance(item, dict):
                output_images = extract_output_images(item)
                output_paths = extract_output_paths(item)
            if not output_paths:
                out = latest_output(os.path.join("ComfyUI", "output"))
                if out:
                    output_paths = [out]

            for p in output_paths:
                print(f"[info] output: {p}")

            if getattr(args, "save_dir", None):
                os.makedirs(args.save_dir, exist_ok=True)
                if output_images:
                    for i, img in enumerate(output_images):
                        filename = img.get("filename")
                        if not isinstance(filename, str):
                            continue
                        if getattr(args, "save_name", None) and len(output_images) == 1:
                            dst_name = args.save_name
                        else:
                            dst_name = os.path.basename(filename)
                            if len(output_images) > 1:
                                root, ext = os.path.splitext(dst_name)
                                dst_name = f"{root}_{i+1}{ext}"
                        dst = os.path.join(args.save_dir, dst_name)

                        img_type = img.get("type", "output")
                        subfolder = img.get("subfolder", "")
                        local_src = os.path.join("ComfyUI", str(img_type), str(subfolder), filename) if subfolder else os.path.join("ComfyUI", str(img_type), filename)

                        try:
                            if os.path.isfile(local_src):
                                if getattr(args, "move", False):
                                    shutil.move(local_src, dst)
                                else:
                                    shutil.copy2(local_src, dst)
                            else:
                                data = download_image(base_url, img)
                                with open(dst, "wb") as f:
                                    f.write(data)
                            print(f"[info] saved to: {dst}")
                        except Exception as e:
                            print(f"[warn] failed to save {filename} -> {dst}: {e}")
                elif output_paths:
                    # Fallback: local-only copy if we don't have image metadata.
                    for i, src in enumerate(output_paths):
                        if not os.path.isfile(src):
                            continue
                        if getattr(args, "save_name", None) and len(output_paths) == 1:
                            dst_name = args.save_name
                        else:
                            dst_name = os.path.basename(src)
                            if len(output_paths) > 1:
                                root, ext = os.path.splitext(dst_name)
                                dst_name = f"{root}_{i+1}{ext}"
                        dst = os.path.join(args.save_dir, dst_name)
                        try:
                            if getattr(args, "move", False):
                                shutil.move(src, dst)
                            else:
                                shutil.copy2(src, dst)
                            print(f"[info] saved to: {dst}")
                        except Exception as e:
                            print(f"[warn] failed to save {src} -> {dst}: {e}")
            return 0 if ok else 4
        time.sleep(args.poll)

    print("[fail] timed out waiting for completion.")
    return 5


if __name__ == "__main__":
    raise SystemExit(main())
