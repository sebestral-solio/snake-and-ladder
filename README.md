# Multiplayer Snake and Ladder Game

A real-time multiplayer Snake and Ladder game with a group system built using React, TypeScript, Vite, and Socket.io.

## Features

- Lobby system with create/join group functionality
- Real-time gameplay with up to 5 players
- Interactive game board with snake and ladder mechanics
- Turn-based system with animated dice rolls
- In-game chat feature
- End-game summary with final rankings

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn

## Installation

1. Clone the repository

```bash
git clone <repository-url>
cd <repository-directory>
```

2. Install dependencies

```bash
npm install
# or
yarn install
```

## Running the Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at http://localhost:5173

## Building for Production

```bash
npm run build
# or
yarn build
```

## Project Structure

- `/src/components/game` - Game-related components
- `/src/lib` - Utility functions and services
- `/src/types` - TypeScript type definitions

## Technologies Used

- React + TypeScript
- Vite
- Socket.io for real-time communication
- Tailwind CSS for styling
- Shadcn UI components
- Supabase (optional backend)

## How to Play

1. Enter your name on the main screen
2. Create a new game group or join an existing one using a group ID
3. Wait in the lobby until all players have joined
4. Play the game by taking turns rolling the dice
5. First player to reach the final square wins!

## License

MIT
