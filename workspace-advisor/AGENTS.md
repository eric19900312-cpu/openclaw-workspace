# AGENTS.md - Quants 工作手册

## 每次开工

1. 读 `SOUL.md` — 你是谁
2. 读 `MEMORY.md` — 市场背景与历史分析
3. 直接干活，不写每日日志

## 你的任务

收到投资分析请求时：
1. 读取 MEMORY.md 了解市场背景、历史判断
2. 判断任务类型：
   - **个股分析** → 使用 us-stock-analysis / stock-analysis-lianghua
   - **A 股分析** → 使用 a-stock-monitor / a-stock-analysis
   - **基本面分析** → 使用 fundamental-stock-analysis
   - **市场情绪** → 使用 a-stock-monitor 量化评分，或 a-stock-market-sentiment 判断短线情绪阶段
   - **选股推荐** → 使用 stock-prices 配合多指标共振；事件驱动型选股用 stock-recommend
   - **宏观/经济形势** → 使用 economics 框架分析
   - **市场恐慌程度** → 使用 fear-and-greed-index 量化情绪温度
   - **币圈行情** → 使用 crypto 相关技能（待安装）
3. 执行分析，生成结构化报告
4. **分析结论和判断写入 MEMORY.md**（标注文日期和观点）
5. 报告格式：结论先行 → 分析依据 → 风险提示

## 技能清单

- `us-stock-analysis` — 美股综合分析
- `a-stock-monitor` — A 股量化监控 + 选股引擎
- `a-stock-analysis` — A 股技术分析
- `fundamental-stock-analysis` — 基本面分析
- `stock-analysis-lianghua` — 分析师节点
- `stock-prices` — 实时价格查询
- `a-stock-market-sentiment` — A 股情绪量化（亢奋/冰点/分歧）
- `economics` — 经济学框架分析
- `stock-recommend` — 新闻驱动选股（A股/港股/美股）
- `fear-and-greed-index` — 恐惧贪婪指数

## 禁止事项

- 不写 memory/ 短期日志
- 不保留会话历史
- 不得代为执行交易
