# Implementation Plan - Phase 2: Premium UI & Real-time Enhancements

## Goal
Elevate the Vibely frontend to a premium standard by implementing presence indicators, read receipts, relative timestamps, and smooth animations.

## Proposed Changes

### 1. Presence System (Online Status)
#### [MODIFY] [backend/src/chat/chat.gateway.ts](file:///f:/projects/Vibely/backend/src/chat/chat.gateway.ts)
- Update `handleConnection`: Set `isOnline: true` in DB.
- Update `handleDisconnect`: Set `isOnline: false` and `lastSeen: now`.
- Emit `userStatusChanged` event to all connected clients.

#### [MODIFY] [frontend/src/store/use-chat-store.ts](file:///f:/projects/Vibely/frontend/src/store/use-chat-store.ts)
- Add `updateUserStatus` action to update the `isOnline` status for people in the friend list/conversations.

### 2. Read Receipts & Message Status
#### [MODIFY] [backend/src/chat/chat.gateway.ts](file:///f:/projects/Vibely/backend/src/chat/chat.gateway.ts)
- Add `markAsSeen` event: Update message status to `SEEN` in DB.
- Emit `messageStatusUpdated` to the sender.

#### [MODIFY] [frontend/src/components/chat/chat-window.tsx](file:///f:/projects/Vibely/frontend/src/components/chat/chat-window.tsx)
- Add visual checkmarks based on message status.
- Trigger `socket.emit('markAsSeen', conversationId)` when a chat is viewed.

### 3. Premium UI & Motion
#### [MODIFY] [frontend/src/components/chat/chat-window.tsx](file:///f:/projects/Vibely/frontend/src/components/chat/chat-window.tsx)
- Use `framer-motion` for message entry animations.
- Implement relative time utility (e.g., `formatDistanceToNow` or simple logic).
- Refine message bubble gradients and shadows for a "glass" look.

#### [MODIFY] [frontend/src/components/chat/sidebar.tsx](file:///f:/projects/Vibely/frontend/src/components/chat/sidebar.tsx)
- Add green/gray status dots to user avatars.
- Improve conversation list animations.

## Verification Plan
1. **Presence**: Login with User A. Verify User B sees User A's status turn green.
2. **Read Receipts**: User A sends message to User B. User A sees one checkmark. User B views. User A sees two checkmarks.
3. **Animations**: Verify messages slide/fade in smoothly when sent or received.
4. **Time**: Verify "Just now" or "X mins ago" shows instead of "10:30 PM".
