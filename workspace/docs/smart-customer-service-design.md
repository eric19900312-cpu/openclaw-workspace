# 智能客服系统设计方案

## 一、系统概述

### 1.1 项目目标
基于OpenClaw搭建智能客服系统，实现：
- 客户提问自动回答
- 对话记录全量存储
- 管理员后台管理与优化
- Skill知识库自动更新

### 1.2 系统架构

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  客户前端   │────▶│  C#后端API  │────▶│  OpenClaw  │
│  (问答页面) │     │  (.NET)     │     │   (AI)     │
└─────────────┘     └─────────────┘     └─────────────┘
                          │                    │
                          ▼                    ▼
                   ┌─────────────┐     ┌─────────────┐
                   │  数据库     │     │  Skill/知识库 │
                   │  (SQL)      │     │  (Markdown) │
                   └─────────────┘     └─────────────┘
                          │
                          ▼
                   ┌─────────────┐
                   │  管理后台   │
                   │  (Blazor)   │
                   └─────────────┘
```

---

## 二、数据库设计

### 2.1 核心表结构

```sql
-- 用户表
CREATE TABLE Users (
    Id INT PRIMARY KEY IDENTITY,
    UserId NVARCHAR(50) NOT NULL UNIQUE,  -- 用户唯一标识
    UserName NVARCHAR(100),                -- 用户名
    UserLevel INT DEFAULT 1,               -- 用户等级
    CreateTime DATETIME DEFAULT GETDATE(),
    LastActiveTime DATETIME               -- 最后活跃时间
);

-- 对话记录表
CREATE TABLE Conversations (
    Id INT PRIMARY KEY IDENTITY,
    UserId NVARCHAR(50) NOT NULL,         -- 用户ID
    UserQuestion NVARCHAR(MAX) NOT NULL, -- 客户问题
    AIAnswer NVARCHAR(MAX) NOT NULL,      -- AI回答
    SkillUsed NVARCHAR(100),              -- 使用的Skill分类
    Intent NVARCHAR(100),                  -- 识别到的意图
    Score INT,                            -- 用户评分(1-5)
    CreateTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserId) REFERENCES Users(UserId)
);

-- Skill分类表
CREATE TABLE SkillCategories (
    Id INT PRIMARY KEY IDENTITY,
    CategoryName NVARCHAR(100) NOT NULL,   -- 分类名称
    CategoryKey NVARCHAR(50) NOT NULL,    -- 分类标识
    Description NVARCHAR(500),           -- 分类描述
    Priority INT DEFAULT 0,                -- 优先级
    IsActive BIT DEFAULT 1,               -- 是否启用
    CreateTime DATETIME DEFAULT GETDATE()
);

-- Skill更新日志表(可撤销)
CREATE TABLE SkillUpdateLogs (
    Id INT PRIMARY KEY IDENTITY,
    CategoryId INT NOT NULL,              -- 关联的分类
    OldContent NVARCHAR(MAX),            -- 旧内容(用于撤销)
    NewContent NVARCHAR(MAX),            -- 新内容
    UpdateReason NVARCHAR(500),           -- 更新原因
    UpdateType NVARCHAR(20),             -- 更新类型: Manual/Auto
    OperatorId INT,                      -- 操作人ID
    IsReverted BIT DEFAULT 0,             -- 是否已撤销
    RevertTime DATETIME,                 -- 撤销时间
    CreateTime DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (CategoryId) REFERENCES SkillCategories(Id)
);

-- 问题优化记录表
CREATE TABLE QuestionOptimizations (
    Id INT PRIMARY KEY IDENTITY,
    ConversationId INT NOT NULL,         -- 原对话ID
    OriginalAnswer NVARCHAR(MAX),         -- 原答案
    OptimizedAnswer NVARCHAR(MAX),       -- 优化后答案
    Status NVARCHAR(20) DEFAULT 'Pending',-- 状态: Pending/Approved/Rejected
    ApprovedBy INT,                       -- 审批人
    CreateTime DATETIME DEFAULT GETDATE(),
    ApproveTime DATETIME,
    FOREIGN KEY (ConversationId) REFERENCES Conversations(Id)
);
```

---

## 三、Skill知识库结构

### 3.1 目录结构

```
skills/
├── _meta.json                      # Skill元数据配置
├── SKILL.md                        # Skill主入口
│
├── knowledge_base/                 # 知识库(公司资料)
│   ├── _meta.json
│   ├── SKILL.md
│   │
│   ├── company/                    # 公司介绍
│   │   ├── SKILL.md               # 问答对
│   │   ├── about.md               # 公司简介
│   │   ├── history.md             # 发展历程
│   │   ├── team.md                # 团队介绍
│   │   └── contact.md             # 联系方式
│   │
│   ├── product/                    # 产品知识
│   │   ├── SKILL.md
│   │   ├── product_list.md        # 产品列表
│   │   ├── product_001.md          # 产品1详情
│   │   ├── product_002.md          # 产品2详情
│   │   └── ...
│   │
│   ├── service/                    # 服务相关
│   │   ├── SKILL.md
│   │   ├── warranty.md             # 保修政策
│   │   ├── return_policy.md         # 退换货政策
│   │   └── shipping.md             # 配送说明
│   │
│   ├── payment/                    # 支付相关
│   │   ├── SKILL.md
│   │   ├── methods.md              # 支付方式
│   │   └── installment.md          # 分期付款
│   │
│   ├── pricing/                    # 价格相关
│   │   ├── SKILL.md
│   │   ├── price_list.md           # 价格表
│   │   └── discount.md             # 优惠政策
│   │
│   └── faq/                        # 常见问题
│       ├── SKILL.md
│       └── qa_list.md              # 问答列表
│
├── skills/                         # 技能(对话能力)
│   ├── _meta.json
│   ├── SKILL.md
│   │
│   ├── greeting/                   # 问候技能
│   │   └── SKILL.md
│   │
│   ├── fallback/                   # 兜底回答
│   │   └── SKILL.md
│   │
│   └── sentiment/                  # 情绪处理
│       └── SKILL.md
│
└── memory/                         # 用户记忆(自动生成)
    ├── _meta.json
    └── SKILL.md
```

### 3.2 Skill文件格式

#### 3.2.1 主入口 SKILL.md

```markdown
---
name: 智能客服
description: 公司智能客服系统，支持产品咨询、订单查询、售后服务
version: 1.0.0
category: customer_service
priority: 10
---

# 智能客服系统

你是一个专业的客服助手，请根据以下知识库回答客户问题。

## 知识库结构

- company/ - 公司介绍
- product/ - 产品知识
- service/ - 服务政策
- payment/ - 支付相关
- pricing/ - 价格信息
- faq/ - 常见问题

## 回答规则

1. 首先识别客户问题属于哪个分类
2. 优先使用对应分类的知识库回答
3. 如果知识库没有，调用通用知识
4. 始终保持友好、专业的态度

## 分类识别关键词

| 分类 | 关键词 |
|------|--------|
| company | 公司、地址、电话、成立、规模 |
| product | 产品、型号、规格、功能、参数 |
| service | 保修、退换货、维修、售后 |
| payment | 支付、付款、发票、优惠 |
| pricing | 价格、费用、多少钱、折扣 |
```

#### 3.2.2 产品分类 SKILL.md

```markdown
---
name: 产品知识库
description: 产品相关问题回答
category: product
priority: 8
---

# 产品知识库

## 产品列表

### 电子产品系列

#### 产品A (Product-A001)
- 名称：智能音箱X1
- 价格：299元
- 功能：语音控制、智能家居中枢、海量音乐
- 特点：内置AI助手，支持多种智能设备

#### 产品B (Product-B002)
- 名称：无线耳机Pro
- 价格：599元
- 功能：主动降噪、30小时续航
- 颜色：黑色、白色、蓝色

### 配件系列

#### 配件A
- 名称：保护壳
- 价格：49元
- 兼容型号：X1系列

## 常见问题

**Q: 产品有保修吗？**
A: 我们提供一年官方保修服务。

**Q: 可以退换货吗？**
A: 7天无理由退换，15天质量问题换货。
```

#### 3.2.3 公司介绍 SKILL.md

```markdown
---
name: 公司介绍
description: 公司基本信息
category: company
priority: 9
---

# 公司介绍

## 关于我们

我们是XXX科技有限公司，成立于2020年，专注于智能硬件产品的研发与销售。

## 公司信息

- **成立时间**：2020年3月
- **总部地址**：XX市XX区XX大厦
- **联系电话**：400-XXX-XXXX
- **工作时间**：周一至周五 9:00-18:00
- **官方网站**：www.example.com

## 发展历程

- 2020年：公司成立
- 2021年：推出第一款智能产品
- 2022年：用户突破100万
- 2023年：开设线下门店

## 团队规模

- 员工总数：200+
- 研发团队：80+
- 客服团队：30+
```

### 3.3 _meta.json 配置文件

```json
{
  "version": "1.0.0",
  "lastUpdated": "2024-01-01",
  "categories": [
    {
      "key": "company",
      "name": "公司介绍",
      "description": "公司基本信息、联系方式、发展历程",
      "file": "company/SKILL.md",
      "priority": 9
    },
    {
      "key": "product",
      "name": "产品知识",
      "description": "产品列表、规格参数、功能介绍",
      "file": "product/SKILL.md",
      "priority": 8
    },
    {
      "key": "service",
      "name": "售后服务",
      "description": "保修政策、退换货、维修服务",
      "file": "service/SKILL.md",
      "priority": 8
    },
    {
      "key": "payment",
      "name": "支付相关",
      "description": "支付方式、发票、分期",
      "file": "payment/SKILL.md",
      "priority": 7
    },
    {
      "key": "pricing",
      "name": "价格相关",
      "description": "产品价格、优惠政策",
      "file": "pricing/SKILL.md",
      "priority": 7
    },
    {
      "key": "faq",
      "name": "常见问题",
      "description": "常见问题解答",
      "file": "faq/SKILL.md",
      "priority": 6
    }
  ],
  "keywords": {
    "company": ["公司", "地址", "电话", "成立", "规模", "团队", "介绍"],
    "product": ["产品", "型号", "规格", "功能", "参数", "怎么样", "好用"],
    "service": ["保修", "退换货", "维修", "售后", "服务"],
    "payment": ["支付", "付款", "优惠", "打折", "发票"],
    "pricing": ["价格", "多少钱", "费用", "便宜", "贵"],
    "faq": ["怎么办", "如何", "怎么", "为什么"]
  }
}
```

---

## 四、C# API接口设计

### 4.1 客户接口

```csharp
// 客户提问
POST /api/chat
{
    "userId": "user_001",
    "question": "这个产品多少钱？"
}

// 返回
{
    "success": true,
    "data": {
        "conversationId": 1001,
        "answer": "这款产品目前售价299元...",
        "skillUsed": "pricing",
        "confidence": 0.95
    }
}

// 用户评分
POST /api/chat/{conversationId}/rate
{
    "score": 5
}
```

### 4.2 管理后台接口

```csharp
// 获取对话列表
GET /api/admin/conversations?page=1&pageSize=20&skillType=all

// 获取待优化的问题
GET /api/admin/optimizations?status=Pending

// 提交优化
POST /api/admin/optimizations
{
    "conversationId": 1001,
    "optimizedAnswer": "这是优化后的回答..."
}

// 执行Skill更新
POST /api/admin/skill/update
{
    "categoryId": 2,
    "newContent": "...",
    "reason": "优化了产品描述"
}

// 撤销更新
POST /api/admin/skill/revert/{logId}

// 获取更新日志
GET /api/admin/skill/logs?categoryId=2

// 获取Skill分类列表
GET /api/admin/skill/categories

// 更新Skill分类内容
PUT /api/admin/skill/categories/{id}
{
    "content": "新的内容..."
}
```

---

## 五、对话流程

### 5.1 客户提问流程

```
1. 客户在前端输入问题
2. POST /api/chat
3. 后端记录问题到数据库
4. 调用OpenClaw(传递上下文)
5. OpenClaw分析问题→匹配Skill→生成回答
6. 后端收到回答→存入数据库
7. 返回给客户
8. 同时记录使用的Skill分类
```

### 5.2 管理员优化流程

```
1. 管理员在后台看到对话列表
2. 选中某个回答，点击"优化"
3. 编辑新回答内容
4. 点击"更新Skill"
5. 后端调用OpenClaw:
   "对比原回答和新回答，分析差异点，
    更新对应的Skill分类文档"
6. OpenClaw更新Skill文件
7. 后端记录更新日志(保存旧内容)
8. 返回更新结果给后台
9. 管理员可查看更新内容或撤销
```

---

## 六、记忆管理

### 6.1 用户记忆结构

```
memory/
├── users/
│   ├── user_001.md
│   ├── user_002.md
│   └── ...
└── sessions/
    └── session_xxx.md
```

### 6.2 记忆压缩(每晚定时任务)

```csharp
// Cron: 每天凌晨2点执行
// 压缩逻辑:
// 1. 查询超过1周的用户记忆
// 2. 提取关键信息(偏好、购买记录)
// 3. 生成压缩版记忆
// 4. 保留最近30天完整对话
// 5. 旧对话转入归档
```

---

## 七、需要准备的资料

### 7.1 公司资料

| 分类 | 需要准备 |
|------|----------|
| 公司介绍 | 成立时间、规模、总部地址、联系方式 |
| 产品知识 | 产品列表、型号、价格、功能参数 |
| 服务政策 | 保修期限、退换货政策、维修流程 |
| 支付方式 | 支持的支付渠道、发票说明 |
| 价格信息 | 产品价格表、优惠政策 |

### 7.2 FAQ常见问题

提前整理50-100个常见问题及标准答案

---

## 八、实施步骤

### Phase 1: 基础搭建
1. 部署OpenClaw
2. 搭建C# Web API
3. 创建数据库表
4. 实现基础问答功能

### Phase 2: 知识库建设
1. 整理公司资料
2. 创建Skill分类结构
3. 填充知识库内容
4. 测试问答准确率

### Phase 3: 管理后台
1. 开发管理后台页面
2. 实现对话记录查看
3. 实现Skill更新功能
4. 实现更新日志与撤销

### Phase 4: 优化完善
1. 记忆管理系统
2. 问题分析统计
3. 持续优化知识库

---

## 九、预期效果

| 指标 | 目标 |
|------|------|
| 首次回答准确率 | >85% |
| 用户满意度 | >4.0/5 |
| 问题覆盖范围 | >90%常见问题 |
| 平均响应时间 | <3秒 |

---

*文档版本: 1.0.0*
*创建时间: 2024-01-01*

---

## 十、客户上下文与记忆管理

### 10.1 客户记忆存储结构

```
memory/
├── users/
│   ├── user_001.md      # 客户1的记忆
│   ├── user_002.md      # 客户2的记忆
│   └── ...
└── sessions/
    └── session_xxx.md
```

### 10.2 客户记忆内容格式

```markdown
# 用户 user_001 记忆

## 基本信息
- 首次访问: 2024-01-01
- 用户等级: VIP
- 偏好: 电子产品

## 历史对话摘要
- 2024-01-01: 咨询了产品A的价格
- 2024-01-02: 询问了保修政策

## 关键信息
- 关注产品: 智能音箱、耳机
- 预算: 300-600元
```

### 10.3 记忆调用流程

```
1. 客户提问 → 后端API
2. 后端读取该用户的memory文件
3. 传递给OpenClaw上下文
4. OpenClaw根据记忆+知识库回答
5. 回答存入DB + 更新记忆
```

### 10.4 记忆回答场景

- **之前问过的产品**: "你之前问的那个耳机有货吗？"
- **客户偏好**: "给我推荐一个你上次看的那种"
- **历史问题**: "上次那个保修政策再说说"

---

## 十一、前端技术方案

### 11.1 推荐技术栈

| 技术 | 网页 | iOS | Android | 说明 |
|------|------|-----|---------|------|
| **Flutter** | ✅ | ✅ | ✅ | 推荐，一套代码全平台 |
| React + RN | ✅ | ✅ | ✅ | JS生态丰富 |
| .NET MAUI | ⚠️ | ✅ | ✅ | 微软生态，C#统一语言 |
| TWA | ✅ | ✅ | ❌ | 网页打包Android |

### 11.2 推荐：Flutter

**优点：**
- 一套代码跑网页+iOS+Android
- 性能好，UI漂亮
- Google维护，免费

**学习成本（有AI帮助）：**
- 语法Dart: 1-2周
- 整体: 2-4周可上手

---

## 十二、会话管理与APP功能

### 12.1 H5会话不过期方案

| 技术 | 说明 |
|------|------|
| **Token** | 登录后返回token，存localStorage，每次请求带Token |
| **Refresh Token** | access token过期前，用refresh token刷新 |
| **WebSocket** | 保持长连接，适合实时对话 |
| **轮询** | 简单，每30秒请求一次保活 |

**推荐流程：**
```
1. 客户首次访问 → 生成临时Token
2. 每次提问带Token
3. 后端验证Token有效性
4. 超过24小时 → 提示重新授权
```

### 12.2 APP智能助手功能

```
H5页面(嵌入WebView)     APP(原生开发)
        ↓                      ↓
    共用同一个C#后端API
        ↓
    共用同一个OpenClaw
```

**APP特有功能：**
- 消息推送
- 语音输入
- 表情包、图片
- 离线缓存

### 12.3 首次引导流程

```
┌─────────────────────────────────┐
│  1. 欢迎语 + 介绍             │
│  "你好！我是智能助手小X"       │
└─────────────────────────────────┘
                ↓
┌─────────────────────────────────┐
│  2. 引导了解客户               │
│  • 你想了解什么？              │
│  • 产品 / 服务 / 公司          │
│  • 或者直接提问                │
└─────────────────────────────────┘
                ↓
┌─────────────────────────────────┐
│  3. 根据回答更新用户记忆       │
│  标记: 初次访问-已了解偏好    │
└─────────────────────────────────┘
```

### 12.4 主动打招呼逻辑

```csharp
// 定时任务或APP启动时
if (user.IsReturning && user.LastVisit > 7 days) {
    // 7天没来了，主动问候
    SendMessage("您好！最近有什么可以帮您的？");
}
```

---

## 十三、开发周期估算

### 13.1 Flutter学习

| 阶段 | 时间 | 说明 |
|------|------|------|
| Dart语法 | 1周 | 基础语法 |
| Flutter组件 | 1周 | UI布局 |
| 状态管理 | 1周 | Provider/Bloc |
| **合计** | **2-3周** | 可上手开发 |

### 13.2 客服系统开发

| 阶段 | 时间 | 工作量 |
|------|------|--------|
| Flutter环境搭建 | 1天 | 搭建+UI |
| 基础问答页面 | 2-3天 | 对话列表+输入 |
| 对接C# API | 2天 | HTTP/WS |
| 用户记忆功能 | 2天 | 读写memory |
| 管理后台 | 3-5天 | 增删改查 |
| 测试与调试 | 2天 |  |
| **前端合计** | **12-15天** | |

### 13.3 后端开发

| 阶段 | 时间 |
|------|------|
| API接口 | 5天 |
| 数据库设计 | 2天 |
| OpenClaw集成 | 2天 |
| Skill更新逻辑 | 3天 |
| **后端合计** | **12天** |

### 13.4 发布到苹果商店

| 步骤 | 时间 | 说明 |
|------|------|------|
| 开发者账号 | 即时 | $99/年 |
| App Store审核 | 1-3天 | 苹果人工审核 |
| **上架** | **3-5天** | 审核通过后 |

### 13.5 总周期

| 项目 | 时间 |
|------|------|
| 学习Flutter | 2-3周 |
| 前端开发 | 12-15天 |
| 后端开发 | 12天 |
| 苹果上架 | 3-5天 |
| **总计** | **约2个月** |

---

## 十四、版本记录

| 版本 | 日期 | 修改内容 |
|------|------|----------|
| 1.0.0 | 2024-01-01 | 初始版本 |
| 1.1.0 | 2026-03-18 | 新增：客户记忆管理、前端技术方案、APP功能 |


---

## 十五、OpenClaw远程部署方案

### 15.1 架构设计

```
C#后端 (AWS) ──HTTP/HTTPS──▶ OpenClaw (AWS Linux)
    (内网/公网)                (同一台或不同服务器)
```

### 15.2 推荐方案：API方式

**优点：**
- 速度快（HTTP调用）
- 稳定可靠
- 易于扩展

### 15.3 部署步骤

#### 步骤1：部署OpenClaw到AWS Linux

```bash
# 1. 连接AWS EC2
ssh -i your-key.pem ec2-user@your-ip

# 2. 安装OpenClaw（参考官方文档）
# ...

# 3. 配置为API模式
# 修改配置文件，启用API端口
```

#### 步骤2：配置AWS安全组

```
入站规则：
- 类型: 自定义TCP
- 端口: 8080 (OpenClaw API端口)
- 来源: C#服务器IP 或 0.0.0.0/0
```

#### 步骤3：配置防火墙

```bash
# 如果使用iptables
sudo iptables -A INPUT -p tcp --dport 8080 -s YOUR_CSHARP_SERVER_IP -j ACCEPT
```

#### 步骤4：C#调用OpenClaw

```csharp
public class OpenClawClient
{
    private readonly HttpClient _client;
    private readonly string _baseUrl;
    
    public OpenClawClient(string baseUrl, string apiToken)
    {
        _baseUrl = baseUrl;
        _client = new HttpClient();
        _client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiToken}");
    }
    
    public async Task<string> Chat(string userId, string question)
    {
        var content = new StringContent(
            JsonSerializer.Serialize(new { userId, question }),
            Encoding.UTF8,
            "application/json"
        );
        
        var response = await _client.PostAsync($"{_baseUrl}/api/chat", content);
        return await response.Content.ReadAsStringAsync();
    }
}
```

### 15.4 HTTPS配置（推荐）

#### 使用Nginx反向代理

```nginx
server {
    listen 443 ssl;
    server_name openclaw.yourdomain.com;
    
    ssl_certificate /path/to/ssl.crt;
    ssl_certificate_key /path/to/ssl.key;
    
    location / {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

#### C#调用HTTPS

```csharp
// 只需要把地址改成HTTPS
var client = new OpenClawClient("https://openclaw.yourdomain.com", "YOUR_TOKEN");
```

### 15.5 需要配置的内容

| 项目 | 说明 |
|------|------|
| AWS EC2 | Linux服务器 |
| 安全组 | 开放API端口 |
| 公网IP/域名 | 访问地址 |
| 防火墙 | 允许访问 |
| Token认证 | 保护API安全 |
| SSL证书 | HTTPS可选 |

### 15.6 备选方案：SSH命令行

如果必须分开的服务器，也可以用SSH：

```csharp
// C#通过SSH执行命令
using var ssh = new SshClient("host", "username", "password");
ssh.Connect();
var result = ssh.RunCommand("openclaw chat '你好'");
ssh.Disconnect();
```

**缺点：** 慢，不推荐生产环境

