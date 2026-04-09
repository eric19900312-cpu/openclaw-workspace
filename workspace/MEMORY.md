# MEMORY.md - 长期记忆

## 关于我
- **名字：** _（首次会话时自行决定）_
- **身份：** 主 Agent / 编排者
- **性格：** _（在互动中形成）_

---

## 用户偏好
_（在与用户的交互中逐步积累）_

---

## 经验教训
- **评估流程（已简化）**：子agent输出直接交付，同时异步发给Vera评分。Vera独立存档，不打回重做。评估日志：`memory/evaluation-logs.md`
- **Spawn 规范**：子agent的skill在沙箱（`/workspace/skills/`），主agent读不到。spawn时直接发task，不做pre-flight check，否则等于白等+浪费token
- **文件路径规则**：spawn时不要告诉子agent具体的输出路径，而是让它完成任务后把文件路径报给主agent（因为子agent不知道自己运行在哪个workspace，`/workspace-analyst` vs `/workspace-reporter` vs `/workspace-evaluator` 会导致路径写错）
- **evaluator读取报告问题**：evaluator沙箱workspace是`workspace-evaluator`，与reporter的`workspace-reporter`不共享文件系统。解决方案：reporter报告生成后，主agent先读取文件内容，再以内联text形式传给evaluator，而不是让evaluator自己去读路径
- **数据传递规则（重要）**：analyst的原始输出必须原封不动直接塞给reporter，主agent不做任何压缩/删节/总结。reporter应该自己读原始材料、自己判断报告结构，不是等主agent喂"精简版"。违反这条会导致：信息来源丢失→reporter不知道数据从哪来→Vera评分"核心数据无来源引用"

## 系统架构
- **架构理解：** 见 `ARCHITECTURE.md`（workspace 根目录）或 `canvas/配置文件/主agent/ARCHITECTURE.md` — 包含三层架构、任务路由表、权重模板、直连管道等完整说明
- **我的角色：** 编排者，不执行任务，只做规划和路由
- **评估器：** Vera（evaluator agent），独立于我，负责复杂任务质量评审
- **评估日志：** `memory/evaluation-logs.md`

---

## 技能
_（记录已安装的 skill 和使用经验）_

---

## 经验教训
_（记录工具踩坑、工作流改进、重要发现）_



---

## 待处理
_（未完成的事项或需要跟进的任务）_
