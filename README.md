# 🎮 Texplorer - Text Adventure Game Engine

A modern, web-based text adventure game engine built with React and TypeScript. Texplorer allows you to play classic text-based adventure games in your browser with a retro terminal interface.

## 🌟 Features

- **Interactive Terminal Interface**: Classic text adventure experience with VS Code-inspired styling
- **Multiple Game Support**: Load and play different adventure games from YAML definitions
- **Natural Language Processing**: Intelligent command parsing using the Compromise.js library
- **Save/Load System**: Save your game progress to local storage
- **Responsive Design**: Works on desktop and mobile devices
- **Extensible Architecture**: Easy to add new games and features

## 🎯 Included Games

### Mine Explorer
A classic cave exploration adventure inspired by Colossal Cave Adventure. Navigate through underground tunnels, solve puzzles, avoid dangerous creatures, and discover treasure.

**Features:**
- 15+ interconnected rooms to explore
- Complex item interactions and puzzles
- NPC encounters including an ancient dragon
- Multiple win conditions and scoring system
- Dark rooms requiring light sources

### Space Quest: Starship Escape
A sci-fi adventure where you navigate through different sectors of a space station.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd texplorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## 🎮 How to Play

### Basic Commands

- **Movement**: `go north`, `south`, `n`, `s`, etc.
- **Looking**: `look`, `examine sword`, `look around`
- **Inventory**: `inventory`, `i`, `take sword`, `drop lamp`
- **Interaction**: `use key`, `talk hermit`, `open door`
- **System**: `help`, `save`, `load`, `quit`

### Game Controls

- **Menu Bar**: Access game selection, save/load functions, and help
- **Terminal**: Type commands using natural language
- **Command History**: Use ↑/↓ arrow keys to navigate previous commands
- **URL Navigation**: Direct link to games (e.g., `/games/mine-explorer`)

### Example Gameplay
```
> look
Mine Entrance
You stand before the dark entrance to an abandoned mine...

> take lamp
You pick up the brass lamp.

> go north
You go north.

Main Tunnel
A wide tunnel carved from solid rock...
It is too dark to see anything. You need a source of light.

> use lamp
You light the brass lamp. It flickers to life, casting a warm glow around you.
```

## 🏗️ Architecture

### Core Components

- **Game Engine** ([`GameEngine.ts`](src/engine/managers/GameEngine.ts)): Manages game state, processes commands, and coordinates all game logic
- **Command Parser** ([`CommandParser.ts`](src/engine/parsers/CommandParser.ts)): Uses NLP to interpret natural language commands
- **Game Loader** ([`GameLoader.ts`](src/engine/managers/GameLoader.ts)): Loads and validates game data from YAML files
- **Terminal Component** ([`Terminal.tsx`](src/components/Terminal/Terminal.tsx)): Provides the interactive command-line interface

### Game Entities

- **Room**: Represents locations with descriptions, exits, items, and NPCs
- **Item**: Objects that can be taken, used, and interact with other entities
- **NPC**: Non-player characters with dialogue and behavior
- **Player**: Manages inventory, location, and game state

### Technology Stack

- **Frontend**: React 19, TypeScript
- **NLP**: Compromise.js for command parsing
- **Data Format**: YAML for game definitions
- **Styling**: CSS with VS Code terminal theming
- **Testing**: Jest, React Testing Library, Playwright

## 📝 Creating Your Own Games

Games are defined in YAML format in the [`public/games/`](public/games/) directory. Here's a basic structure:

```yaml
title: "My Adventure"
description: "A thrilling text adventure"
author: "Your Name"
start_location: "starting_room"

rooms:
  starting_room:
    id: "starting_room"
    name: "Starting Room"
    description: "You are in a small room with exits to the north and east."
    exits:
      - { direction: "north", roomId: "hallway" }
      - { direction: "east", roomId: "library" }
    items:
      - "rusty_key"

items:
  rusty_key:
    id: "rusty_key"
    name: "rusty key"
    description: "An old, rusty key that might open something."
    takeable: true
    aliases: ["key"]

# ... more rooms, items, and NPCs
```

See [`mine-explorer.yaml`](public/games/mine-explorer.yaml) for a complete example.

## 🧪 Testing

Run the test suite:

```bash
# Unit and integration tests
npm test

# End-to-end tests (requires browser installation)
npm run test:e2e
```

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run test suite
- `npm run eject` - Eject from Create React App (one-way operation)

### Project Structure

```
src/
├── components/           # React UI components
│   ├── Terminal/        # Terminal interface
│   ├── MenuBar/         # Navigation and menus
│   └── HelpModal/       # Help documentation
├── engine/              # Game engine core
│   ├── interfaces/      # TypeScript interfaces
│   ├── entities/        # Game entities (Room, Item, NPC, Player)
│   ├── managers/        # Game state management
│   └── parsers/         # Command parsing logic
└── App.tsx             # Main application component

public/
└── games/              # Game definition files
    ├── mine-explorer.yaml
    └── space-quest.yaml
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Adding New Games

1. Create a new YAML file in `public/games/`
2. Follow the existing game structure
3. Add the game to the loading logic in [`App.tsx`](src/App.tsx)
4. Test thoroughly with various commands

## 🐛 Troubleshooting

### Common Issues

**Game won't load**: Check browser console for YAML parsing errors
**Commands not recognized**: Try simpler phrasing (e.g., "go north" instead of "walk to the north")
**Dark rooms**: Make sure you have a light source and have used it
**Inventory full**: Drop items you don't need or check item weight limits

### Debug Mode

Enable debug logging in the browser console to see command parsing details:

```javascript
localStorage.setItem('texplorer-debug', 'true');
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by classic text adventures like Zork and Colossal Cave Adventure
- Built with modern web technologies while maintaining retro charm
- Special thanks to the open-source libraries that make this possible

## 🔗 Links

- [Live Demo](your-demo-url)
- [Issue Tracker](your-issues-url)
- [Discussions](your-discussions-url)

---

**Happy Adventuring!** 🗡️✨

<!-- Trigger GitHub Actions workflow for deployment test -->
