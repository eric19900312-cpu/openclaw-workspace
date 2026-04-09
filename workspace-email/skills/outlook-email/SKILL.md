# SKILL.md - Outlook 网页版发邮件

_通过浏览器在 Outlook 网页版发送邮件_

## 适用场景
- 给用户发送邮件

## 前置条件
1. 浏览器已打开 Outlook 并登录 molly19900312@outlook.com
2. 使用 profile="openclaw" 的浏览器

## 操作步骤

### 1. 打开新邮件
- 点击 Outlook 顶部导航的"新邮件"按钮 (ref=e23)
- 等待页面加载完成

### 2. 填写收件人（关键步骤！）
**不要**点击收件人按钮，会弹出联系人选择框导致复杂化。

使用 JavaScript 注入直接设置收件人：
```
browser act -> kind: evaluate
fn: document.querySelector('[aria-label="收件人"]').innerText='eric19900312@outlook.com'
```

### 3. 填写主题
- 点击主题输入框 (textbox placeholder="添加主题")
- 使用 type 输入文本

### 4. 填写正文
- 点击正文输入框 (textbox "邮件正文")
- 使用 type 输入文本

### 5. 发送
- 点击蓝色的"发送"按钮

## 关键技巧

### ✅ 成功的方法
```javascript
// 使用 evaluate 注入文本到收件人
document.querySelector('[aria-label="收件人"]').innerText='eric19900312@outlook.com'
```

### ❌ 不要用这些方法
- 点击"收件人"按钮 → 会弹出联系人选择器
- 在弹出的输入框里 type → 经常失效
- 使用 mailto: 链接 → 无法控制

### 常见问题
- 如果收件人变成乱码/HTML代码，刷新页面重试
- 如果发送变成保存草稿，多点几次发送按钮
- 页面元素 ref 每次会话会变化，用 snapshot 获取最新

## 邮箱地址
- Molly: molly19900312@outlook.com
- Eric: eric19900312@outlook.com

## 完整操作示例

1. snapshot 获取当前页面元素
2. act click ref="e23" 点击新邮件
3. snapshot 确认新邮件窗口打开
4. act evaluate fn="document.querySelector('[aria-label=\"收件人\"]').innerText='eric19900312@outlook.com'"
5. act click ref="[主题输入框]" 
6. act type ref="[主题输入框]" text="主题内容"
7. act click ref="[正文输入框]"
8. act type ref="[正文输入框]" text="正文内容"
9. act click ref="e244" 点击发送按钮
