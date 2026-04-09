#!/usr/bin/env python3
"""
Telegram 对话自动同步到三层记忆系统
按私聊/每个群组分开存储
"""

import os
import json
import subprocess
from datetime import datetime
from pathlib import Path
from agent_memory_core import MemoryManager

# 配置
SESSIONS_DIR = Path("/home/eric/.openclaw/agents/main/sessions")
MEMORY_BASE = Path("/home/eric/.openclaw/workspace/memory")
MEMORY_MANAGER_PATH = "/home/eric/.openclaw/workspace"

# 会话ID到群组名的映射（可以手动添加更多）
GROUP_NAMES = {
    "5134230723": "japanese-speaking",  # 日语口语练习群
    "5296441162": "chinastock",  # 中国股票群
}

def get_sessions_from_api():
    """从OpenClaw API获取会话列表"""
    try:
        result = subprocess.run(
            ["openclaw", "sessions", "list", "--limit", "50"],
            capture_output=True,
            text=True,
            timeout=10
        )
        if result.returncode == 0:
            return json.loads(result.stdout)
    except Exception as e:
        print(f"获取会话列表失败: {e}")
    return {"sessions": []}

def get_session_key_map():
    """从会话文件解析会话信息"""
    key_map = {}
    
    for filepath in SESSIONS_DIR.glob("*.jsonl"):
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                # 搜索包含 key 的行
                for line in f:
                    if '"key"' in line and 'telegram' in line:
                        try:
                            data = json.loads(line)
                            if data.get("type") == "message":
                                content = data.get("message", {}).get("content", [])
                                if content and isinstance(content, list):
                                    text_content = content[0].get("text", "")
                                    if "key" in text_content:
                                        import re
                                        match = re.search(r'"key":\s*"([^"]+)"', text_content)
                                        if match:
                                            key = match.group(1)
                                            session_id = filepath.stem
                                            key_map[session_id] = key
                                        break
                        except:
                            continue
        except Exception as e:
            print(f"读取失败 {filepath}: {e}")
    
    return key_map

def parse_session_type(key: str) -> tuple[str, str]:
    """解析会话类型和ID"""
    # 格式: agent:main:telegram:direct:8679334238 或 agent:main:telegram:group:-5296441162
    parts = key.split(":")
    if len(parts) >= 5:
        session_type = parts[3]  # direct or group
        session_id = parts[4].lstrip("-")  # 去掉-号
        return session_type, session_id
    return "unknown", "unknown"

def get_memory_filename(session_type: str, session_id: str) -> str:
    """获取对应的记忆文件名"""
    if session_type == "direct":
        return "dm-eric.md"
    elif session_type == "group":
        # 尝试使用已知的群组名
        if session_id in GROUP_NAMES:
            return f"group-{GROUP_NAMES[session_id]}.md"
        return f"group-{session_id}.md"
    return "other.md"

def parse_session_file(filepath: Path) -> list[dict]:
    """解析会话文件，提取消息"""
    messages = []
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            for line in f:
                try:
                    data = json.loads(line.strip())
                    if data.get("type") == "message":
                        msg = data.get("message", {})
                        role = msg.get("role", "unknown")
                        content = ""
                        
                        # 提取文本内容
                        for block in msg.get("content", []):
                            if block.get("type") == "text":
                                content = block.get("text", "")
                                break
                        
                        if content:
                            timestamp = data.get("timestamp", "")
                            messages.append({
                                "role": role,
                                "content": content[:500],  # 截断太长内容
                                "timestamp": timestamp
                            })
                except json.JSONDecodeError:
                    continue
    except Exception as e:
        print(f"读取文件失败 {filepath}: {e}")
    
    return messages

def format_messages_to_markdown(messages: list[dict], session_name: str) -> str:
    """将消息格式化为markdown"""
    lines = [f"# {session_name}", ""]
    lines.append(f"最后更新: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    lines.append("")
    
    for msg in messages[-100:]:  # 只保留最近100条
        role = msg.get("role", "unknown")
        content = msg.get("content", "")
        timestamp = msg.get("timestamp", "")[:10]  # 只取日期
        
        if role == "user":
            lines.append(f"## 👤 User ({timestamp})")
        else:
            lines.append(f"## 🤖 Assistant ({timestamp})")
        lines.append(content)
        lines.append("")
    
    return "\n".join(lines)

def sync_conversations():
    """同步所有对话到记忆系统"""
    print("🔄 开始同步对话...")
    
    # 从API获取会话映射
    print("📡 从API获取会话信息...")
    key_map = get_session_key_map()
    print(f"   找到 {len(key_map)} 个会话")
    
    # 收集所有会话消息
    sessions_data = {}
    
    for filepath in SESSIONS_DIR.glob("*.jsonl"):
        session_id = filepath.stem
        
        # 从API获取会话类型
        session_type, session_id_part = "unknown", "unknown"
        if session_id in key_map:
            session_type, session_id_part = parse_session_type(key_map[session_id])
        
        # 解析消息
        messages = parse_session_file(filepath)
        if not messages:
            continue
        
        # 获取对应的记忆文件名
        filename = get_memory_filename(session_type, session_id_part)
        
        if filename not in sessions_data:
            sessions_data[filename] = []
        sessions_data[filename].extend(messages)
        print(f"📂 {filename}: {len(messages)} 条消息 (type={session_type}, id={session_id_part})")
    
    # 写入记忆文件
    for filename, messages in sessions_data.items():
        memory_file = MEMORY_BASE / filename
        content = format_messages_to_markdown(messages, filename.replace(".md", ""))
        
        with open(memory_file, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ 已写入: {filename} ({len(messages)} 条消息)")
    
    # 重新索引记忆
    print("🔄 重新索引记忆...")
    mm = MemoryManager(MEMORY_MANAGER_PATH)
    stats = mm.index()
    print(f"✅ 索引完成: {stats['chunks']} 文本块, {stats['nodes']} 图节点")
    
    return len(sessions_data)

if __name__ == "__main__":
    sync_conversations()
