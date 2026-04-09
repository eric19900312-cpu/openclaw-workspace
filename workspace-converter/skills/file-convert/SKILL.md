# SKILL.md - 文件转换

## 功能
将用户上传的文件转换为下游 agent 可使用的格式。

## 输入
- `file_path`：原始文件路径（沙箱内 `/external-canvas/uploads/`）
- `target_format`：目标格式（text / markdown / json）
- `options`：可选参数

## 执行

### CSV → Markdown
```python
import pandas as pd
csv_path = "/external-canvas/uploads/input.csv"
df = pd.read_csv(csv_path)
output = "/external-canvas/converted/output.md"
with open(output, 'w') as f:
    f.write("# Conversion Result\n\n")
    f.write(df.to_string(index=False))
print(f"OK: {output}")
```

### PDF → 文本（沙箱内用 PyPDF2）
```python
import PyPDF2
pdf_path = "/external-canvas/uploads/input.pdf"
output = "/external-canvas/converted/output.txt"
with open(pdf_path, 'rb') as f:
    reader = PyPDF2.PdfReader(f)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
with open(output, 'w') as f:
    f.write(text)
print(f"OK: {output}")
```

### 图片 → 文本（基础，无 OCR）
```python
# 用 PIL 读取图片尺寸、颜色分布
# 输出描述性文本（布局估算、颜色、位置）
```

### 音频/视频 → 抽帧 / 音频提取
```bash
# 提取音频
ffmpeg -i /external-canvas/uploads/input.mp4 -vn -acodec libmp3lame /external-canvas/converted/audio.mp3

# 视频抽帧（每秒1帧）
ffmpeg -i /external-canvas/uploads/input.mp4 -vf "fps=1" /external-canvas/converted/frame_%03d.jpg
```

### Word → Markdown
```python
from docx import Document
doc = Document("/external-canvas/uploads/input.docx")
output = "/external-canvas/converted/output.md"
with open(output, 'w') as f:
    for para in doc.paragraphs:
        f.write(para.text + "\n")
print(f"OK: {output}")
```

## 工具差异（沙箱 vs 宿主机）

| 工具 | 宿主机 | 沙箱 |
|------|--------|------|
| pdftotext | ✅ | ❌ 用 PyPDF2 |
| pandas | ✅ | ✅ |
| python-docx | ✅ | ✅ |
| ffmpeg | ✅ | ✅ |

## 输出
- 成功：输出文件路径 + 文件大小
- 失败：错误类型 + 原因 + 建议
