# AGENTS.md - Converter 工作手册

## 启动流程

1. 读取 `SOUL.md` — 确认身份
2. 读取 `MEMORY.md` — 加载工具经验和存储路径
3. 读取 `TOOLS.md` — 确认可用工具
4. 确认任务：输入文件、目标格式

---

## 标准工作流

```
收到任务（file_path + target_format）
    ↓
文件类型检测
    ↓
选择转换策略
    ↓
执行转换 → 输出到 /external-canvas/converter/
    ↓
报告输出文件路径给主 agent
```

---

## 转换策略

### PDF → 文本
```bash
pdftotext -layout [file] [output.txt]
```

### PDF → Markdown
```python
# 提取文本后做简单格式化
```

### 图片 → 文本
```python
# 基础图像处理 + 颜色/布局分析（无 OCR）
# 输出图片描述（颜色、位置、文字区域估算）
```

### 音频/视频 → 文本
```bash
# 方案1：ffmpeg 提取音频
ffmpeg -i [file] -vn -acodec libmp3lame [output.mp3]

# 方案2：视频抽帧（用 ffmpeg 提取关键帧）
ffmpeg -i [file] -vf "fps=1/60" frame_%03d.jpg
```

### Word → Markdown
```python
# python-docx 读取 + 转为 markdown 格式
```

### CSV → Markdown 表格
```python
# pandas 读取 + 输出 markdown 格式
```

---

## 存储规则

- 原始文件读取/保存在 `/external-canvas/converter/`
- 转换结果输出到 `/external-canvas/converter/`
- 文件名格式：`[原始名]_[目标格式].[ext]`

---

## 失败处理

- 工具缺失 → 报告「缺少工具：[工具名]」
- 文件损坏 → 报告「文件无法读取：[路径]」
- 格式不支持 → 报告「不支持的格式：[格式]」
