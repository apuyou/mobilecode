OpenCode Mobile — Project Summary

### Overview
React Native mobile app to control OpenCode instances remotely, similar to Happy Coder but for OpenCode's server API.

---

### Tech Stack
- **Framework:** Expo SDK 52 with expo-router
- **UI:** NativeWind v4 (Tailwind CSS)
- **State:** Zustand with MMKV persistence
- **HTTP:** fetch or ky
- **SSE:** react-native-sse or EventSource polyfill
- **Icons:** lucide-react-native
- **Crypto:** tweetnacl (for E2E encryption)

---

### Connection Modes

**Mode 1 — Direct (v0.1)**
- Connect directly to OpenCode server URL (e.g., `http://devbox:4001` via Tailscale)
- Simple, works when you have network access

**Mode 2 — E2E Encrypted Relay (v0.3)**
- CLI daemon on dev machine connects to relay (PartyKit)
- Mobile scans QR code containing: relay URL, channel ID, public key
- All traffic E2E encrypted with TweetNaCl (relay sees only blobs)
- Works through NAT/firewalls, no direct network access needed

---

### Data Model

```typescript
interface Server {
  id: string
  name: string
  url: string                    // Direct URL or relay channel
  connectionMode: 'direct' | 'relay'
  publicKey?: string             // For relay mode
  secretKey?: string             // Stored in MMKV secure
}

interface Session {
  serverId: string
  id: string
  title: string
  status: 'idle' | 'busy' | 'retry'
  updatedAt: string
}

interface Message {
  id: string
  role: 'user' | 'assistant'
  parts: Part[]
  createdAt: string
}

type Part = 
  | { type: 'text', content: string }
  | { type: 'tool-invocation', toolName: string, input: any, output?: any, status: string }
```

---

### Screens

```
app/
├── (tabs)/
│   ├── index.tsx           # Dashboard — all servers + sessions overview
│   ├── servers.tsx         # Manage server connections
│   └── settings.tsx        # App settings
├── server/[serverId]/
│   ├── index.tsx           # Session list for this server
│   └── session/[sessionId].tsx  # Chat view
├── add-server.tsx          # Manual URL entry
├── scan.tsx                # QR code scanner for relay pairing
└── _layout.tsx
```

---

### Key Components

- `ServerCard` — Server status tile for dashboard
- `SessionCard` — Session list item with status badge
- `ChatMessage` — User/assistant message bubble
- `ToolInvocation` — Collapsible card showing tool name, input, output
- `MessageInput` — Text input with send button
- `StatusBadge` — idle/busy/retry indicator

---

### OpenCode API Endpoints Used

```
GET  /session              # List sessions
GET  /session/status       # All session statuses
GET  /session/:id/message  # Get messages (with limit param)
POST /session/:id/message  # Send message (sync, waits for response)
POST /session/:id/prompt_async  # Send message (fire-and-forget)
POST /session/:id/abort    # Abort current generation
GET  /event                # SSE stream of all events
```

---

### Zustand Store

```typescript
interface AppState {
  // Servers
  servers: Server[]
  addServer: (server: Omit<Server, 'id'>) => void
  removeServer: (id: string) => void
  
  // Connections (runtime, not persisted)
  connections: Record<string, { status: 'connecting' | 'connected' | 'error', error?: string }>
  
  // Sessions by server
  sessionsByServer: Record<string, Session[]>
  fetchSessions: (serverId: string) => Promise<void>
  
  // Active chat
  activeServerId: string | null
  activeSessionId: string | null
  messages: Message[]
  sendMessage: (text: string) => Promise<void>
}

// Persist only servers to MMKV
```

---

### Milestones

**v0.1 — Core Loop**
- Project setup (Expo + NativeWind + Zustand + MMKV)
- Add server screen (manual URL entry)
- Server list with connection test
- Session list per server
- Basic chat view (send/receive messages)

**v0.2 — Real-time**
- SSE event subscription per server
- Live status updates on dashboard
- Streaming message display
- Abort button

**v0.3 — E2E Relay**
- QR code scanner (expo-camera)
- TweetNaCl encryption layer
- Relay connection mode
- CLI daemon package (separate repo or monorepo)

**v0.4 — Polish**
- Tool invocation cards (collapsible, syntax highlighted)
- Diff viewer for file changes
- Pull-to-refresh
- Error handling and retry logic

**v0.5 — Nice to Have**
- Push notifications (requires relay + Expo push)
- Voice input
- Multi-instance dashboard with unified view
- Dark/light theme toggle

---

### File Structure

```
opencode-mobile/
├── app/                     # expo-router screens
├── components/              # UI components
├── lib/
│   ├── opencode-client.ts   # API client class
│   ├── crypto.ts            # TweetNaCl helpers
│   ├── mmkv.ts              # Storage setup
│   └── sse.ts               # SSE helper
├── stores/
│   └── index.ts             # Zustand store
├── tailwind.config.js
├── app.config.ts
└── package.json
```

---

### CLI Daemon (for relay mode, v0.3)

Separate package `opencode-mobile-cli`:
- Connects to local OpenCode server
- Connects to PartyKit relay
- Shows QR code with channel + public key
- Proxies API requests (encrypted)
- Forwards SSE events (encrypted)

---

### Key Dependencies

```json
{
  "expo": "~52.0.0",
  "expo-router": "~4.0.0",
  "nativewind": "^4.0.0",
  "zustand": "^5.0.0",
  "react-native-mmkv": "^3.0.0",
  "tweetnacl": "^1.0.3",
  "lucide-react-native": "^0.300.0",
  "expo-camera": "~16.0.0"
}
```

