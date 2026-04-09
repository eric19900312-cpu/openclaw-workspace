import * as fs from 'fs';
import * as path from 'path';

const HOOK_ID = 'customer-memory-hook';

// Extract user_id from sessionKey
function extractUserId(sessionKey: string): string | null {
  // Format: customer_10001_20260323143045123 or agent:main:customer_10001_20260323143045123
  const match = sessionKey.match(/customer_(\d+)_\d+/);
  return match ? match[1] : null;
}

// Create user directory (skip if exists)
async function ensureUserDir(workspaceDir: string, userId: string): Promise<string> {
  const userDir = path.join(workspaceDir, 'users', userId);
  
  if (!fs.existsSync(userDir)) {
    fs.mkdirSync(userDir, { recursive: true });
    console.log(`[${HOOK_ID}] Created user directory: ${userDir}`);
  } else {
    console.log(`[${HOOK_ID}] User directory already exists: ${userDir}`);
  }
  
  return userDir;
}

// Create profile.json from template (skip if exists)
async function ensureProfile(workspaceDir: string, userDir: string, userId: string): Promise<void> {
  const profilePath = path.join(userDir, 'profile.json');
  const templatePath = path.join(workspaceDir, 'users', 'template_profile.json');
  
  if (fs.existsSync(profilePath)) {
    console.log(`[${HOOK_ID}] Profile already exists for user: ${userId}`);
    return;
  }
  
  // Copy from template
  if (fs.existsSync(templatePath)) {
    let content = fs.readFileSync(templatePath, 'utf-8');
    const profile = JSON.parse(content);
    profile.user_id = userId;
    profile.created_at = new Date().toISOString();
    profile.updated_at = new Date().toISOString();
    fs.writeFileSync(profilePath, JSON.stringify(profile, null, 2));
    console.log(`[${HOOK_ID}] Created profile.json for user: ${userId}`);
  } else {
    // Create default profile if template not found
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
    console.log(`[${HOOK_ID}] Created default profile.json for user: ${userId}`);
  }
}

// Create or reset session.md based on sessionKey
async function ensureSession(userDir: string, sessionKey: string): Promise<void> {
  const sessionPath = path.join(userDir, 'session.md');
  const sessionKeyMarker = `SessionKey: ${sessionKey}`;
  
  if (fs.existsSync(sessionPath)) {
    // Check if sessionKey has changed
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
      // Same session, keep existing content
      console.log(`[${HOOK_ID}] Same session, keeping existing session.md`);
      return;
    } else {
      // Different sessionKey - clear and recreate
      console.log(`[${HOOK_ID}] SessionKey changed from ${existingSessionKey} to ${sessionKey}, clearing session.md`);
    }
  }
  
  // Create new session content
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
  console.log(`[${HOOK_ID}] Created/reset session.md for session: ${sessionKey}`);
}

export default async function handler(event: any) {
  // Debug: log all events to a file
  const debugLog = `/tmp/customer-hook-debug.log`;
  const fs = require('fs');
  const logEntry = `[${new Date().toISOString()}] Event: ${event.type}:${event.action}, sessionKey: ${event.context?.sessionKey}\n`;
  fs.appendFileSync(debugLog, logEntry);
  
  console.log(`[${HOOK_ID}] DEBUG: Received event ${event.type}:${event.action}`);
  
  // Handle both session:start and message:received
  const isSessionStart = event.type === 'session' && event.action === 'start';
  const isMessageReceived = event.type === 'message' && event.action === 'received';
  
  if (!isSessionStart && !isMessageReceived) {
    console.log(`[${HOOK_ID}] DEBUG: Not handling event type ${event.type}:${event.action}`);
    return;
  }
  
  const sessionKey = event.context?.sessionKey;
  if (!sessionKey) {
    console.log(`[${HOOK_ID}] No sessionKey in event`);
    return;
  }
  
  // Check if it's a customer session
  if (!sessionKey.includes('customer_')) {
    console.log(`[${HOOK_ID}] Not a customer session: ${sessionKey}`);
    return;
  }
  
  console.log(`[${HOOK_ID}] Detected customer session: ${sessionKey}`);
  
  // Extract user_id
  const userId = extractUserId(sessionKey);
  if (!userId) {
    console.log(`[${HOOK_ID}] Could not extract user_id from sessionKey: ${sessionKey}`);
    return;
  }
  
  console.log(`[${HOOK_ID}] Processing customer session for user: ${userId}`);
  
  // Get workspace directory
  const workspaceDir = event.context?.workspaceDir || process.cwd();
  
  // Ensure user directory exists (skip if exists)
  const userDir = await ensureUserDir(workspaceDir, userId);
  
  // Ensure profile.json exists (skip if exists)
  await ensureProfile(workspaceDir, userDir, userId);
  
  // Ensure session.md (reset if sessionKey changed)
  await ensureSession(userDir, sessionKey);
  
  console.log(`[${HOOK_ID}] Setup complete for user: ${userId}`);
}
