# MEMORY.md - Mira 长期记忆

> 工具踩坑 + 经验记录，每次搜索前检查"每次搜索注意"部分。

---

## 身份快照

- **名字:** Mira 🔍
- **角色:** 市场情报收集专家
- **边界:** 收集整理，不做深度分析和报告
- **启动流程:** 详见 `AGENTS.md`（第1步：SOUL.md → 第2步：MEMORY.md → 第3步：SEARCH.md → 第4步：确认任务）

---

## 每次搜索注意

- [ ] 先读 `SEARCH.md` 选渠道，不凭直觉选 skill
- [ ] tavily/reddit/agent-reach 均通过 exec 调用 CLI，不是直接工具
- [ ] agent-reach 需先 `source /workspace/.env`，Twitter Cookie 在该文件中
- [ ] 抖音热搜 API 无需登录，但 TikTok 需要 `agentsmail` 登录
- [ ] MEMORY.md 里没有搜索标准流程，那部分在 `SEARCH.md`

---

## 账号凭证

### agentsmail 邮箱
- **邮箱:** egg-tart-p4ep@agentsmail.org
- **API Key:** am_sk_8bfa53c3b526599feb7db543388856a0b73107af518b7064c37ed2968de5ad1d
- **凭证位置:** `/workspace/.env`（`source /workspace/.env` 后可用）

### Twitter/X Cookie（2026-03-31）
- **auth_token:** f785aeb2cd58e8f69ef7ea79be5bc02e906c5942
- **ct0:** 41a18c85d2efc61c5dcd1919eea533a85ebf0827275e54c6f5f518bec3936b908f52754042518a072211d095fe5a4abc5a1c2dde130f2178a517819276d79ccc44243665381ddff03d504c2a4f56fbce
- **完整 Cookie:** 在 `/workspace/.env`（source 后用）
- **用法:** `source /workspace/.env && /workspace/.local/bin/bird search "关键词" -n 5`

### TikTok 账号
- **用户名:** @mira_tiktok_ai
- **邮箱:** egg-tart-p4ep@agentsmail.org
- **密码:** MiraTikTok2026!

---

## 沙箱环境

| 环境 | 说明 |
|------|------|
| 沙箱 | `openclaw-sandbox-common:bookworm-slim`，网络 bridge |
| 工作目录 | `/workspace`（映射主机 `/home/eric/.openclaw/workspace-analyst/`） |
| Python（有pip） | `/usr/local/bin/python3` |
| Python（无pip） | `/usr/bin/python3` |
| Node | `/usr/local/bin/node` |

### agent-reach 工具绝对路径（不依赖 PATH）
| 工具 | 路径 |
|------|------|
| agent-reach 主程序 | `/workspace/.local/bin/agent-reach` |
| mcporter | `/workspace/.local/bin/mcporter` |
| Twitter bird CLI | `/workspace/.local/bin/bird` |
| yt-dlp | `/workspace/.local/bin/yt-dlp` |
| ffmpeg | `/workspace/.local/bin/ffmpeg` |
| npm 全局 mcporter | `/workspace/.npm-global/bin/mcporter` |
| GitHub CLI | `/workspace/gh/bin/gh` |

---

## 工具安装经验

### pip 包（推荐 --user）
```bash
pip3 install --user <package>   # 装到 ~/.local/bin/
```

### 静态二进制
```bash
curl -L <url> -o /tmp/<file>
chmod +x /tmp/<file>
cp /tmp/<file> /workspace/<bin>
```

### npm 包
```bash
npm install <package> --prefix /workspace
# 二进制在 /workspace/node_modules/.bin/
```

### 脚本安装
```bash
curl -fsSL <install-script> | sh
```

---

## 踩坑记录

### tavily 东南亚数据响应慢
- 超时建议设长一点，或改用 `max-results 5` 减少返回量

### MEMORY.md 更新规则
- 只有工具踩坑、行业基准、工作技巧值得写，不复制任务结果
- 超过 ~200 行时合并整理，标注 `最近整理: YYYY-MM-DD`

最近整理: 2026-03-31

---

## 合并来源：researcher（Scout）经验

### 信息源可信度分级
| 级别 | 来源 | 标注方式 |
|------|------|---------|
| 高 | 官方报告、Reuters/BBC/FT、学术论文 | 直接引用 |
| 中 | Forbes/WSJ、行业报告 | "据...报道" |
| 低 | 博客、社交媒体、论坛 | "据传/有人说" |

---

## 合并来源：data 分析师能力

### 数据分析工具
- Python数据分析（pandas/numpy）
- SQL查询
- BI报表设计

### 数据分析原则
- 结论必须有数据支撑
- 注明数据来源和时间范围
- 不搞"虚假精确"（样本太小不硬撑）
