# 🐛 Guess The Bug! — Language Selection

A developer trivia game where players identify bugs in code snippets.  
This module is the **first screen** users see — pick a language before playing.

---

https://guess-the-bug.vercel.app/

## 🌐 Supported Languages (16)

Python · JavaScript · TypeScript · Java · C · C++ · C# · HTML · CSS · SQL · PHP · Ruby · Go · Rust · Kotlin · Swift

---

## ⚙️ How It Works

- User must pick **one language** before starting any game mode
- Selection saved to `localStorage` (returning users skip this screen)
- "Change Language" button available on all other screens
- "Random / Surprise Me" card picks a random language

---

## 🎨 UI

- Responsive grid: 2 cols (mobile) → 4 cols (desktop)
- Each card: logo + name + puzzle count
- Selected card: blue glow + checkmark
- "Start Game" disabled until selection
- Dark theme (`#0D1117`), Framer Motion animations

---

## 🛠️ Tech Stack

Next.js 14 · React 18 · Tailwind CSS · shadcn/ui · Framer Motion · Zustand · TypeScript

---

## 📁 Structure
