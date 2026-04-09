# TOOLS.md - Converter 工具环境

## 系统工具

| 工具 | 路径 | 用途 |
|------|------|------|
| ffmpeg | `/usr/bin/ffmpeg` | 音视频处理 |
| pdftotext | `/usr/bin/pdftotext` | PDF 文字提取 |
| python3 | `/usr/bin/python3` | 脚本执行 |

## Python 库

| 库 | 状态 |
|---|------|
| PIL (Pillow) | ✅ 已安装 |
| pandas | ✅ 已安装 |
| python-docx | ✅ 已安装 |
| pypandoc | ✅ 已安装 |
| fpdf2 | ✅ 已安装 |

## 未安装（待安装）

- tesseract（OCR）
- pytesseract
- pandoc（系统级）

## 共享存储路径

**⚠️ 所有文件统一存放在 `/external-canvas/converter/`**

| 类型 | 沙箱路径 | 宿主机路径 |
|------|---------|-----------|
| 输入/原始文件 | `/external-canvas/converter/` | `/home/eric/canvas/converter/` |
| 转换结果 | `/external-canvas/converter/` | `/home/eric/canvas/converter/` |

**所有读取和写入操作都使用 `/external-canvas/converter/`**

## 安装方式（如需）

```bash
pip3 install --user --break-system-packages Pillow pandas python-docx pypandoc fpdf2
# OCR 需要单独装 tesseract-ocr
sudo apt install tesseract-ocr
```
