#!/usr/bin/env node
/**
 * Customer Memory API
 * 
 * 前端调用此API创建用户目录和记忆文件
 * 
 * 调用方式:
 *   curl -X POST http://localhost:18789/api/customer-memory \
 *     -H "Content-Type: application/json" \
 *     -H "Authorization: Bearer YOUR_TOKEN" \
 *     -d '{"sessionKey": "agent:main:customer_123_1234567890"}'
 * 
 * 或者直接用用户ID:
 *   curl -X POST http://localhost:18789/api/customer-memory \
 *     -H "Content-Type: application/json" \
 *     -d '{"userId": "123456"}'
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 18790; // 使用18790端口，避免和OpenClaw冲突
const WORKSPACE_DIR = '/home/eric/.openclaw/workspace';
const TOKEN = process.env.API_TOKEN || '22a7ec525705df7409a2eca25782246c5f7063b7a0bb252f';

// Extract user_id from sessionKey
function extractUserId(sessionKey) {
  if (!sessionKey) return null;
  const match = sessionKey.match(/customer_(\d+)_\d+/);
  return match ? match[1] : null;
}

// Create user directory
function ensureUserDir(userId) {
  const userDir = path.join(WORKSPACE_DIR, 'users', userId);
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    console.log(`[API] Created user directory: ${userDir}`);
  }
  return userDir;
}

// Create profile.json
function ensureProfile(workspaceDir, userDir, userId) {
  const profilePath = path.join(userDir, 'profile.json');
  const templatePath = path.join(workspaceDir, 'users', 'template_profile.json');
  
  if (fs.existsSync(profilePath)) {
    console.log(`[API] Profile already exists for user: ${userId}`);
    return;
  }
  
  if (fs.existsSync(templatePath)) {
    let content = fs.readFileSync(templatePath, 'utf-8');
    const profile = JSON.parse(content);
    profile.user_id = userId;
    profile.created_at = new Date().toISOString();
    profile.updated_at = new Date().toISOString();
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
    console.log(`[API] Created profile.json for user: ${userId}`);
  } else {
    const defaultProfile = {
      user_id: userId,
      name: "",
      created_at: new Date().toISOString(),
      preferences: {
        likes: [],
        dislikes: [],
        hobbies: [],
        conversation_style: "直接、简洁",
        language: ""
      },
      ai_personality: {
        tone: "活泼可爱",
        emoji: "🧸",
        formality: "casual",
        humor: true,
        nickname: "Molly",
        special_rules: ["主动提问深入话题"]
      },
      updated_at: new Date().toISOString()
    };
    fs.writeFileSync(profilePath, JSON.stringify(defaultProfile, null, 2));
    console.log(`[API] Created default profile.json for user: ${userId}`);
  }
}

// Create or reset session.md
function ensureSession(userDir, sessionKey) {
  const sessionPath = path.join(userDir, 'session.md');
  
  if (fs.existsSync(sessionPath)) {
    const existingContent = fs.readFileSync(sessionPath, 'utf-8');
    const lines = existingContent.split('\n');
    let existingSessionKey = null;
    
    for (const line of lines) {
      if (line.startsWith('SessionKey:')) {
        existingSessionKey = line.substring('SessionKey:'.length).trim();
        break;
      }
    }
    
    if (existingSessionKey === sessionKey) {
      console.log(`[API] Same session, keeping existing session.md`);
      return;
    } else {
      console.log(`[API] SessionKey changed, clearing session.md`);
    }
  }
  
  const content = `SessionKey: ${sessionKey}
# Session: ${sessionKey}
Started: ${new Date().toISOString()}

## Memory Summary (from frontend on new session)
- (待前端发送)

## Related Memories (from frontend on new session)
- (待前端发送)

## Conversation
`;
  fs.writeFileSync(sessionPath, content);
  console.log(`[API] Created/reset session.md for session: ${sessionKey}`);
}

// Parse JSON body
function parseBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
  });
}

// Handle request
async function handleRequest(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }
  
  // Only allow POST
  if (req.method !== 'POST') {
    res.writeHead(405, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Method not allowed' }));
    return;
  }
  
  try {
    const body = await parseBody(req);
    const { sessionKey, userId } = body;
    
    // Get userId from sessionKey or direct userId
    let targetUserId = userId || extractUserId(sessionKey);
    
    if (!targetUserId) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid sessionKey or userId' }));
      return;
    }
    
    console.log(`[API] Processing request for user: ${targetUserId}, sessionKey: ${sessionKey}`);
    
    // Ensure directories and files
    const userDir = ensureUserDir(targetUserId);
    ensureProfile(WORKSPACE_DIR, userDir, targetUserId);
    if (sessionKey) {
      ensureSession(userDir, sessionKey);
    }
    
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      success: true,
      userId: targetUserId,
      sessionKey: sessionKey,
      profilePath: path.join(WORKSPACE_DIR, 'users', targetUserId, 'profile.json'),
      sessionPath: path.join(WORKSPACE_DIR, 'users', targetUserId, 'session.md')
    }));
    
  } catch (error) {
    console.error(`[API] Error:`, error);
    res.writeHead(500, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: error.message }));
  }
}

// Start server
const server = http.createServer(handleRequest);
server.listen(PORT, () => {
  console.log(`Customer Memory API running on http://localhost:${PORT}`);
  console.log(`Workspace: ${WORKSPACE_DIR}`);
});
