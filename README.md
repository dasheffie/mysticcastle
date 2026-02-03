# 🏰 MysticCastle

A classic text adventure game where you explore a mysterious castle, solve puzzles, and uncover ancient secrets.

## Features

- **11 interconnected rooms** with atmospheric descriptions
- **8 collectible items** each with uses and descriptions
- **3 puzzles** to solve:
  - Dark cellar requiring a lamp
  - Locked bedroom with crystal key
  - Magical barrier requiring spell book knowledge
- **Hidden secrets** to discover (loose stone, wardrobe passage)
- **Two win conditions**: Find the Crown of Whispers OR discover the secret vault
- **Typewriter text effect** for immersive storytelling
- **Command history** (up/down arrows)
- **Auto-save** to localStorage
- **Mobile-friendly** with quick-command buttons

## How to Play

### Commands
- **Movement**: `north`, `south`, `east`, `west`, `up`, `down` (or `n`, `s`, `e`, `w`, `u`, `d`)
- **Look**: `look`, `look [item]`, `examine [thing]`
- **Inventory**: `take [item]`, `drop [item]`, `inventory` (or `i`)
- **Use items**: `use [item]`, `read [book]`
- **Game**: `help`, `save`, `load`, `new game`

### Tips
- Examine everything - descriptions often contain hints
- The cellar is dark - you'll need a light source
- Some things are hidden and require careful searching
- There's more than one way to "win"

## Running Locally

```bash
npm install
npm start
```

Then visit http://localhost:3000

## Tech Stack

- Pure HTML/CSS/JS (single-file app)
- Express.js for serving static files
- localStorage for save/load
- No external dependencies in the game itself

## The Story

*You have heard tales of the legendary Crown of Whispers, hidden somewhere within the ancient MysticCastle. Many have sought it; none have returned. Will you be the first to uncover its secrets?*

---

Built with ❤️ for the Lodestar portfolio
