---
name: customer-memory-hook
description: "自动为 customer_* 会话创建用户目录和记忆文件"
important: MIGRATION_REQUIRED - This hook manages customer user directories. When migrating OpenClaw, you MUST copy the entire users/ directory to preserve user profiles and conversation history.
metadata:
  openclaw:
    emoji: "🧸"
    events: ["session:start", "message:received"]
    requires:
      bins: ["node"]
---

# Customer Memory Hook

## 功能

当收到 `customer_*` 或 `agent:main:customer_*` 格式的 sessionKey 消息时，自动创建用户目录和记忆文件。

## 触发条件

- sessionKey 包含 `customer_`
- 事件类型为 `message:received`

## 执行操作

1. 提取 user_id
2. 创建 `workspace/users/{user_id}/` 目录
3. 从模板复制 `profile.json`
4. 创建 `session.md`

## 文件位置

- Hook目录: `~/.openclaw/hooks/customer-memory-hook/`
- 用户目录: `workspace/users/{user_id}/`

## 迁移注意

迁移时需要复制：
- `~/.openclaw/hooks/customer-memory-hook/` (Hook代码)
- `workspace/users/` (所有用户数据)
