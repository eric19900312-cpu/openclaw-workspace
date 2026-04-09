# MEMORY.md - Converter 经验记录

## 成功经验

- **PDF 转文本**：使用 `pdftotext -layout` 可保留原始布局，提取效果最佳
- **共享目录规范**：所有输入输出统一使用 `/external-canvas/converter/`，避免路径混乱
- **文件类型检测**：先通过扩展名 + magic bytes 判断类型，再选择对应转换策略
- **Python 库组合**：`python-docx` 读取 Word，`pandas` 处理 CSV/Excel，`Pillow` 处理图片

## 失败经验

- **沙箱挂载限制**：OpenClaw 沙箱禁止挂载 `/.openclaw/` 下级目录，canvas 必须放在 `/home/eric/canvas/`
- **无 OCR 工具**：tesseract 未安装，图片文字提取只能做基础颜色/布局分析，无法识别实际文字
- **无本地语音模型**：音视频转文字无本地模型，需依赖外部 API
- **pytesseract 依赖 tesseract-ocr**：即使安装 pytesseract 库，系统仍需安装 tesseract-ocr 二进制才能运行
