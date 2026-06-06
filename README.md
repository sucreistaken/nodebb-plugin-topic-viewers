# nodebb-plugin-topic-viewers

NodeBB plugin that shows **who is viewing or has recently viewed a topic** — a facepile in the topic header.

Makes a forum feel less empty. Even if no one has replied in an hour, you can see that three people read the post in the last 10 minutes. Borrowed from Slack channels and Discord "who's online" — adapted to forum threads.

## What it does

- Tracks viewer presence per topic via socket events
- Shows up to N avatars in the topic header, with "+X more" overflow
- Hovering an avatar shows the username + how long ago they viewed
- Privacy respected: users with "hide presence" enabled don't appear
- Lightweight: no DB writes per view, in-memory presence with TTL

## Install

```bash
cd /path/to/nodebb
npm install nodebb-plugin-topic-viewers
./nodebb activate nodebb-plugin-topic-viewers
./nodebb build
./nodebb restart
```

## Config

ACP → Plugins → Topic Viewers:
- Max avatars in facepile (default 5)
- "Recently viewed" window (default 30 min)
- Show count even when facepile is hidden by privacy settings (yes/no)

## Status

Beta. Core facepile works; admin granular controls are still incomplete.
