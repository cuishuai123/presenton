# Z-Image-Turbo 图片生成脚本配置说明

## 推荐方式：将脚本放在项目内（无需配置路径）

### 步骤 1: 复制脚本到项目

将 `run_prompt.py` 脚本复制到项目的 `scripts/` 目录：

```bash
# Windows PowerShell
Copy-Item "G:\desk\tegongban\pythondemo\run_prompt.py" -Destination "G:\desk\tegongban\no_node-presenton\scripts\run_prompt.py"

# Linux
cp /path/to/pythondemo/run_prompt.py /path/to/no_node-presenton/scripts/run_prompt.py
```

### 步骤 2: 配置环境变量（仅需配置主机和端口）

在 `.env` 文件中只需配置：

```env
# 图片生成配置
IMAGE_PROVIDER=z-image-turbo

# ComfyUI 后端地址（根据实际情况修改）
Z_IMAGE_TURBO_HOST=10.221.80.199
Z_IMAGE_TURBO_PORT=8187

# 不需要配置 Z_IMAGE_TURBO_SCRIPT_PATH，系统会自动查找 scripts/run_prompt.py
```

### 步骤 3: 重启服务

重启 FastAPI 服务，系统会自动使用项目内的脚本。

---

## 备选方式：使用外部脚本（需要配置路径）

如果脚本不在项目内，可以通过环境变量指定路径：

```env
IMAGE_PROVIDER=z-image-turbo
Z_IMAGE_TURBO_SCRIPT_PATH=/path/to/run_prompt.py  # Linux 绝对路径
# 或
Z_IMAGE_TURBO_SCRIPT_PATH=../pythondemo/run_prompt.py  # 相对项目根目录的相对路径
Z_IMAGE_TURBO_HOST=10.221.80.199
Z_IMAGE_TURBO_PORT=8187
```

---

## 跨平台支持

- **Windows**: 自动使用 `py312\python.exe`（如果存在）或 `python`
- **Linux**: 自动使用 `python3`

---

## 注意事项

1. 确保 `run_prompt.py` 脚本有执行权限（Linux）：
   ```bash
   chmod +x scripts/run_prompt.py
   ```

2. 如果脚本目录下有 `py312` 文件夹，系统会优先使用其中的 Python 解释器

3. 确保 ComfyUI 后端服务正在运行，并且可以从服务器访问

4. 脚本路径优先级：
   - 优先：`项目根目录/scripts/run_prompt.py`
   - 备选：环境变量 `Z_IMAGE_TURBO_SCRIPT_PATH` 指定的路径

