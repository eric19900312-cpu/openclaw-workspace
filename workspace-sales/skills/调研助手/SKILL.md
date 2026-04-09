---
name: 调研助手
description: 综合调研工具，支持网页搜索和社区研究。使用场景：(1) 用户要求搜索网络/查找资料/查来源/找链接时 (2) 查找竞品信息、市场数据、行业趋势 (3) 了解真实用户评价和社区口碑 (4) 研究特定话题的讨论和解决方案。不包括：写内容、纯文案创作（那是写作技能的事）。
---

# 调研助手

综合调研工具，支持网页搜索和社区研究。

## 功能

### 1. 网页搜索 (Tavily)
- 通过 Tavily API 进行网页搜索
- 返回标题、URL、内容摘要
- 支持简短答案摘要

**命令：**
```bash
python3 {baseDir}/scripts/tavily_search.py --query "关键词" --max-results 5
python3 {baseDir}/scripts/tavily_search.py --query "关键词" --max-results 5 --include-answer
python3 {baseDir}/scripts/tavily_search.py --query "关键词" --max-results 5 --format md
```

### 2. 社区研究 (Reddit)
- 搜索 Reddit 帖子和评论
- 读取完整讨论线程
- 监控 Subreddit 动态
- 无需 API key，直接可用

**命令：**
```bash
cd <skill-dir>/scripts
npx tsx reddit.ts search "关键词" --sort top --time month --limit 10
npx tsx reddit.ts thread <帖子URL> --sort top --limit 20
npx tsx reddit.ts hot <subreddit> --limit 10
```

## 使用场景

| 场景 | 触发 |
|------|------|
| 搜索网络/查资料 | 用户说"搜索一下"、"帮我查"、"有来源吗" |
| 竞品分析 | 用户问"竞品怎么样"、"XX 和 YY 比哪个好" |
| 市场调研 | 用户问"市场趋势"、"行业数据"、"目标人群" |
| 用户口碑 | 用户想知道"真实评价"、"社区怎么说" |
| 问题解决 | 用户问"怎么解决"、"有什么方案" |

## 不使用场景

- 纯文案写作（那是写作技能）
- SEO 内容优化
- 品牌宣传无调研目标

## 输出格式

- **网页搜索**：JSON 或 Markdown 列表
- **Reddit 研究**：按点赞排序的讨论摘要，包含关键引用

## 数据来源

- Tavily：覆盖主流网页内容
- Reddit：真实用户讨论和经验分享