# SEARCH.md - Mira 标准搜索策略

> 每次调研任务都从读这份文件开始。

---

## 一、决策树：先选渠道，再搜

### 按任务类型选 Skill

| 查询类型 | 首选渠道 | 备选/补充渠道 |
|----------|---------|--------------|
| 平台数据 / 统计报告 | `tavily-search` | `news-summary` |
| 社区讨论 / 口碑调研 | `reddit-research` | `agent-reach`（YouTube / Twitter/X） |
| 社交媒体热帖 / KOL 讨论 / 视频 | `agent-reach` | `reddit-research` |
| 新闻 / 时事 | `news-summary` | `tavily-search` |
| 天气 | `weather` | — |
| 深度行业报告 / 研究 | `tavily-search` | `agent-reach`（英文渠道） |
| **中文专属内容**（微博/B站/小红书/公众号） | `agent-reach`（中文渠道）| `tavily-search` |
| **英文专属内容**（Twitter/X / Reddit） | `agent-reach`（英文渠道） | `reddit-research` |

### Skill 路径速查

| Skill | 读取路径 | 执行方式 |
|-------|---------|---------|
| `tavily-search` | `skills/openclaw-tavily-search/SKILL.md` | `python3 .../tavily_search.py --query "..." --max-results N --format md` |
| `reddit-research` | `skills/reddit-search-but-free/SKILL.md` | `npx tsx reddit.ts search "..." --sort top --time month --limit N --provider pullpush` |
| `news-summary` | `skills/news-summary/SKILL.md` | 按 SKILL.md 内指令执行 |
| `weather` | `skills/weather/SKILL.md` | 按 SKILL.md 内指令执行 |
| `agent-reach` | `skills/agent-reach/SKILL.md` | 按 SKILL.md 内指令执行 |
| `agentsmail` | `skills/agentsmail/SKILL.md` | 按 SKILL.md 内指令执行 |

> ⚠️ 读取路径统一用 `skills/xxx/SKILL.md`（workspace 相对），不要用 `~/.openclaw/skills/`

---

## 二、标准搜索流程

```
收到任务 → 判断渠道 → 选主+辅Skill → 搜索 → 交叉验证 → 整理交付
```

### Step 1：判断渠道（2分钟内决定）
- 看任务语言：中文 → 先想 agent-reach 中文渠道；英文 → 先想 agent-reach 英文渠道 / reddit
- 看任务类型：数据统计 → tavily；社区口碑 → reddit + agent-reach；视频内容 → agent-reach

### Step 2：选主 + 辅 Skill
- 主力：负责主要信息（1个）
- 验证：负责交叉验证或补充缺口（1个）
- 最多同时跑 2 个，不叠加

### Step 3：执行搜索
- `max-results`：默认 **5-8 条**，不超过 10 条
- 超过 3 个不同方向 → 分多轮搜索，不堆在一个查询里
- 遇到 403 / Forbidden → **立即跳过，换来源，不重试，不换路径怼同一来源**

### Step 4：交叉验证
- 至少 2 个独立来源交叉确认同一事实
- 矛盾信息 → **同时列出，标注矛盾点**，不替用户选

### Step 5：整理交付
- 每条信息标注：📌要点 + 🔗来源 + 📅时间 + ⚖️可信度
- 交付格式见下方模板

---

## 三、每条信息的标注规范

```
- 内容要点 [来源名称](URL) 📅YYYY-MM | ⚖️高/中/低
```

| 字段 | 说明 |
|------|------|
| 要点 | 一句话描述核心信息 |
| 来源 | 品牌/媒体/平台名，不写原始 URL |
| 时间 | 信息发布/抓取时间，YYYY-MM 精度 |
| 可信度 | 高（权威媒体/官方数据）/ 中（行业报告/第三方）/ 低（论坛/未证实）|

---

## 四、交付格式模板

```
## 搜索主题：XXX

### 核心发现
- 发现1 [来源](链接) 📅YYYY-MM | ⚖️高
- 发现2 [来源](链接) 📅YYYY-MM | ⚖️中

### 信息分类
#### 类别A
| 信息点 | 来源 | 时间 | 可信度 |
|--------|------|------|--------|
| ... | ... | ... | 高/中/低 |

### 矛盾/待核实
- A说X，B说Y，待核实

### 信息缺口
- 未找到：XXX
- 建议补充渠道：XXX

### 移交建议
- [ ] 建议交给 **advisor** 进行深度分析
- [ ] 建议交给 **reporter** 生成正式报告
```

---

## 五、质量检查清单（交付前必查）

- [ ] 每条信息都有来源？
- [ ] 标注了时间/时效性？
- [ ] 可信度有评估？
- [ ] 矛盾信息有标注？
- [ ] 信息缺口有说明？
- [ ] 该移交的标注了？
- [ ] 没超过 10 条搜索结果？
- [ ] 没遇 403 还重试？

---

## 六、禁止行为

- ❌ 逐篇抓取网页全文（只读摘要/snippet）
- ❌ 超过 10 条搜索结果
- ❌ 遇 403 后换路径重试同一来源
- ❌ 代替分析/报告 agent 做深度分析
- ❌ 把未经确认的信息说得很确定
- ❌ 用单一来源作为唯一证据

---

## 七、已安装 Skills 全量清单

> 以下路径均为 workspace 相对路径（`skills/xxx/SKILL.md`），不要用 `~/.openclaw/skills/`

| Skill | 用途 | 读取路径 |
|-------|------|---------|
| `tavily-search` | 网络搜索（新闻/官网/公开数据） | `skills/openclaw-tavily-search/SKILL.md` |
| `reddit-research` | Reddit 社区挖掘 | `skills/reddit-search-but-free/SKILL.md` |
| `news-summary` | RSS 新闻汇总 + 语音摘要 | `skills/news-summary/SKILL.md` |
| `weather` | 天气预报 | `skills/weather/SKILL.md` |
| `agent-reach` | 社交媒体搜索（微博/B站/小红书/Twitter/YouTube等） | `skills/agent-reach/SKILL.md` |
| `agentsmail` | AI Agent 免费邮件收发 | `skills/agentsmail/SKILL.md` |

---

## 八、工具实操经验（来自踩坑记录）

### tavily-search
```bash
python3 /workspace/skills/openclaw-tavily-search/scripts/tavily_search.py --query "..." --max-results 5 --format md
```
- **不需要直接工具**，exec 调脚本完全正常
- 默认 raw 输出带完整 content，md 格式返回可读摘要

### reddit-research
```bash
cd /workspace/skills/reddit-search-but-free/scripts && npx tsx reddit.ts search "..." --sort top --time month --limit 8
```
- PullPush provider 适合历史/被删内容；Reddit provider 适合实时内容
- Arctic Shift 需要 `--sub` 或 `--author` 参数

### agent-reach（Twitter/X）
```bash
. /workspace/.env && /workspace/.local/bin/bird search "关键词" -n 5
```
- 先执行 `source /workspace/.env` 加载 Twitter Cookie
- Cookie 在 `/workspace/.env`

### 抖音热搜（无需登录）
```bash
curl -s "https://www.douyin.com/aweme/v1/web/hot/search/list/"
```

### news-summary
```bash
curl -s "https://feeds.bbci.co.uk/news/world/rss.xml" | grep -E "<title>|<description>"
```
- BBC RSS 无需 API Key，直接可用

---

*Mira 🔍 | 最近更新：2026-03-31*
