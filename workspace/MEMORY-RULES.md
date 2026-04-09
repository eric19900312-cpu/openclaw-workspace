# 记忆系统规则

## 1. 存储结构

```
users/
├── {user_id}/
│   ├── profile.json    # 用户偏好 + AI性格（长期）
│   └── session.md     # 当前会话内容（临时）
```

## 2. sessionKey 解析

- 格式：`customer_{user_id}_{timestamp}`
- 例：`customer_10001_20260323143045123` → user_id = `10001`
- 提取规则：从 `customer_` 后到第一个 `_` 之前的数字

## 3. 会话判断

- **新会话**：sessionKey 变化（首次出现或与上次不同）
- **旧会话**：同一 sessionKey 继续对话

## 4. 处理流程

### 新会话开始
1. 解析 sessionKey → 提取 user_id
2. 创建/读取 `users/{user_id}/profile.json`
3. 清空旧的 `session.md`（如存在）
4. 等待前端发送记忆摘要 + 关联记忆
5. 写入前端发的记忆到 `session.md`

### 对话过程中
1. 每次回复 → 追加对话内容到 `session.md`
2. 发现用户偏好变化 → 询问用户确认 → 更新 `profile.json`

### 新用户首次对话
1. 正常回答用户问题
2. 主动询问用户偏好来创建 profile
3. 示例询问：
   - "有什么我可以记住的偏好吗？"
   - "你喜欢怎么称呼？"
   - "有什么特别感兴趣的话题吗？"

## 5. profile.json 结构

```json
{
  "user_id": "10001",
  "name": "用户名称",
  "created_at": "2026-03-23T16:00:00Z",
  "preferences": {
    "likes": [],
    "dislikes": [],
    "hobbies": [],
    "conversation_style": "直接、简洁"
  },
  "ai_personality": {
    "tone": "活泼可爱",
    "emoji": "🧸",
    "formality": "casual",
    "humor": true,
    "nickname": "Molly",
    "special_rules": []
  },
  "updated_at": "2026-03-23T16:00:00Z"
}
```

## 6. session.md 结构

```markdown
# Session: customer_10001_20260323143045123
Started: 2026-03-23 16:30:00

## 记忆摘要（新会话时前端发送）
- 用户最近在研究xxx
- 上次讨论了xxx

## 关联记忆（新会话时前端发送）
- 用户偏好：xxx
- 历史对话：xxx

## 对话记录
[16:30] 用户：xxx
[16:31] AI：xxx
[16:35] 用户：xxx
[16:36] AI：xxx
```

## 7. 重要规则

- **不依赖本地向量库**：记忆由前端管理
- **用户隔离**：每个 user_id 独立存储
- **隐私优先**：不读取其他用户的记忆
- **最小化存储**：只存必要信息

## 8. 更新时机

| 场景 | 操作 |
|------|------|
| 新会话开始 | 读取 profile + 初始化 session.md |
| 对话中 | 追加到 session.md |
| 发现偏好变化 | 询问确认后更新 profile.json |
| 会话结束 | session.md 保留（下次可能被覆盖） |
