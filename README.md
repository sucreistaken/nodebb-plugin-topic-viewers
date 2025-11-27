# 🚀 NodeBB Plugin: Topic Viewers

A modern NodeBB plugin that tracks who viewed a topic in real-time and displays them in a stylish **"Facepile"** widget.

![Version](https://img.shields.io/npm/v/nodebb-plugin-topic-viewers)
![License](https://img.shields.io/npm/l/nodebb-plugin-topic-viewers)

---

## ✨ Features

* **⚡ Real-Time Tracking:** Captures topic views instantly using Socket.IO (no page refresh needed).
* **🎨 Facepile Design:** Displays overlapping avatars (like Instagram/LinkedIn) to save space.
* **🔍 Detailed Modal:** Clicking the widget opens a popup showing the full list of viewers, view counts, and timestamps.
* **🚀 High Performance:** Avatars use `lazy-loading` and data is stored efficiently using Sorted Sets.

---

## 📸 Screenshots

| Facepile Widget | Viewer Modal |
|:---:|:---:|
| *(Add screenshot here)* | *(Add screenshot here)* |

---

## 🛠️ Installation

Install the plugin via npm:

```bash
npm install nodebb-plugin-topic-viewers