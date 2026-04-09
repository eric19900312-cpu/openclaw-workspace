---
name: agent-reach
description: >
  Give your AI agent eyes to see the entire internet.
  14 platforms via CLI, MCP, curl, and Python scripts.
  Zero config for 8 channels.

  【核心原则】根据用户提问语言自动选择渠道。
  中文问题 → 中文渠道（不翻译）；英文问题 → 英文渠道（不翻译）。
  严禁将用户原文翻译后再搜索。

  渠道分类：
  - 中文渠道：微博 / 抖音 / B站 / 微信公众号 / 小红书 / V2EX
  - 英文渠道：Twitter/X / YouTube / Exa搜索 / Reddit / LinkedIn / RSS
triggers:
  - search: 搜/查/找/search/搜索/查一下/帮我搜
  - social:
    - 小红书: xiaohongshu/xhs/小红书/红书
    - 抖音: douyin/抖音
    - Twitter: twitter/推特/x.com/推文
    - 微博: weibo/微博
    - B站: bilibili/b站/哔哩哔哩
    - V2EX: v2ex
  - career: 招聘/职位/求职/linkedin/领英/找工作
  - web: 网页/链接/文章/公众号/微信文章/rss/读一下/打开这个
  - video: youtube/视频/播客/字幕/小宇宙/转录/yt
metadata:
  openclaw:
    homepage: https://github.com/Panniantong/Agent-Reach
---

# Agent Reach — 路由器

14 平台工具集合。根据用户提问语言自动路由，**原文搜索，不翻译**。

---

## 核心规则：语言路由

### 🌏 中文问题 → 中文渠道（原文直接搜）

| 渠道 | 工具 | 命令示例 |
|------|------|---------|
| 微博 | mcporter weibo | `/workspace/.local/bin/mcporter call 'weibo.search_content(keyword: "原文", limit: 5)'` |
| 微博热搜 | mcporter weibo | `/workspace/.local/bin/mcporter call 'weibo.get_trendings(limit: 10)'` |
| 抖音 | mcporter douyin | `/workspace/.local/bin/mcporter call 'douyin.parse_douyin_video_info(share_link: "URL")'` |
| B站 | yt-dlp | `/workspace/.local/bin/yt-dlp --dump-json "https://www.bilibili.com/video/BVxxx"` |
| 微信公众号 | miku_ai | `python3.12 -c "import asyncio; from miku_ai import get_wexin_article; asyncio.run(get_wexin_article('关键词', 5))"` |
| 小红书 | mcporter xiaohongshu | `mcporter call 'xiaohongshu.search_feeds(keyword: "原文")'`（需Docker）|
| V2EX | curl 公开API | `curl -s "https://www.v2ex.com/api/topics/hot.json" -H "User-Agent: agent-reach/1.0"` |

### 🌎 英文问题 → 英文渠道（原文直接搜）

| 渠道 | 工具 | 命令示例 |
|------|------|---------|
| Exa 搜索 | mcporter exa | `/workspace/.local/bin/mcporter call 'exa.web_search_exa(query: "原文", numResults: 5)'` |
| Twitter/X | bird CLI | `AUTH_TOKEN="$TWITTER_AUTH_TOKEN" CT0="$TWITTER_CT0" /workspace/.local/bin/bird search "原文" -n 10` |
| YouTube | yt-dlp | `/workspace/.local/bin/yt-dlp --dump-json "ytsearch5:原文"` |
| Reddit | curl | `curl -s "https://www.reddit.com/search.json?q=原文"`（需代理）|
| LinkedIn | mcporter linkedin | `/workspace/.local/bin/mcporter call 'linkedin-scraper.search_people(keyword: "原文")'` |
| RSS | feedparser | `python3 -c "import feedparser; ..."` |

---

## 零配置快速命令

```bash
# 环境准备（先执行）
. /workspace/.env

# 中文微博搜索
/workspace/.local/bin/mcporter call 'weibo.search_content(keyword: "搜索词", limit: 5)'

# 英文全网搜索
/workspace/.local/bin/mcporter call 'exa.web_search_exa(query: "search terms", numResults: 5)'

# Twitter 搜索
AUTH_TOKEN="$TWITTER_AUTH_TOKEN" CT0="$TWITTER_CT0" /workspace/.local/bin/bird search "terms" -n 10

# YouTube 搜索
/workspace/.local/bin/yt-dlp --dump-json "ytsearch5:terms"

# B站视频
/workspace/.local/bin/yt-dlp --dump-json "https://www.bilibili.com/video/BVxxx"

# V2EX 热门
curl -s "https://www.v2ex.com/api/topics/hot.json" -H "User-Agent: agent-reach/1.0"

# 通用网页阅读
curl -s "https://r.jina.ai/URL"

# 微信公众号搜索
python3.12 -c "import asyncio; from miku_ai import get_wexin_article; asyncio.run(get_wexin_article('关键词', 5))"

# 环境检查
/workspace/.local/bin/agent-reach doctor
```

## 环境变量凭证（source /workspace/.env）

| 变量 | 用途 |
|------|------|
| `TWITTER_AUTH_TOKEN` | Twitter bird CLI 认证 |
| `TWITTER_CT0` | Twitter bird CLI 认证 |
| `AGENTSMAIL_EMAIL` | agentsmail 邮箱 |
| `AGENTSMAIL_APIKEY` | agentsmail API Key |

## 重要约束

1. **不翻译** — 搜索词原文直接传给渠道
2. **中文问题优先中文渠道** — 微博、抖音、B站、微信公众号
3. **英文问题优先英文渠道** — Exa、Twitter、YouTube
4. **用绝对路径** — 所有工具均用 `/workspace/.local/bin/` 或 `/workspace/.npm-global/bin/` 下的路径，不依赖 PATH
5. **不要在 agent workspace 创建文件** — 临时输出用 `/tmp/`

## 详细文档

- [搜索工具](references/search.md) — Exa（英文）
- [社交媒体](references/social.md) — 微博/抖音/B站（中文）、Twitter/V2EX（通用）
- [职场招聘](references/career.md) — LinkedIn（英文为主）
- [网页阅读](references/web.md) — 微信公众号/B站（中文）、RSS（通用）
- [视频播客](references/video.md) — YouTube/B站（中文关键词）/ 小宇宙

## 配置渠道

https://raw.githubusercontent.com/Panniantong/agent-reach/main/docs/install.md
