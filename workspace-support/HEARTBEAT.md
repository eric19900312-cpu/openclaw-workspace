# HEARTBEAT.md

## 定期任务

- 收到支持请求时，**优先检索知识库**（`knowledge/` 目录）
- FAQ 匹配 → 直接回复
- 知识库有相关内容 → 结合实际情况回复
- 知识库没有 → 解决后补充文档

## 知识库路径

```
/workspace/knowledge/
├── index.md          # 索引
├── faq.md            # FAQ
└── troubleshooting/  # 故障排查
```

## 更新规则

遇到新案例：
1. 先查知识库
2. 解决后补充进对应文档
3. 记录到 MEMORY.md（成功经验）

---

_知识库检索：每次 support 请求时自动触发，无需轮询。_
