import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate, useLocation, Routes, Route } from 'react-router-dom';
import { Terminal, MenuBar, HelpModal } from './components';
import { GameEngine, GameLoader } from './engine/managers';
import { IGameData, IGameState } from './engine/interfaces';
import './App.css';

interface GameInfo {
  id: string;
  title: string;
  data: IGameData;
}

function App() {
  const [gameEngine] = useState(() => new GameEngine());
  const [output, setOutput] = useState<string[]>([
    'Welcome to Texplorer!',
    'Type "help" for available commands or select a game from the menu.',
    ''
  ]);
  const [currentGame, setCurrentGame] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [gameState, setGameState] = useState<IGameState | null>(null);
  const [availableGames, setAvailableGames] = useState<GameInfo[]>([]);

  // Load available games on startup
  useEffect(() => {
    const loadAvailableGames = async () => {
      const games: GameInfo[] = [
        {
          id: 'sample',
          title: 'Sample Game',
          data: GameLoader.createSampleGameData()
        }
      ];

      // Load YAML games
      try {
        const mineExplorerData = await GameLoader.loadGameFromUrl(
          'games/mine-explorer.yaml'
        );
        games.push({
          id: 'mine-explorer',
          title: 'Mine Explorer',
          data: mineExplorerData
        });
      } catch (error) {
        console.warn('Failed to load Mine Explorer:', error);
      }

      try {
        const spaceQuestData = await GameLoader.loadGameFromUrl(
          'games/space-quest.yaml'
        );
        games.push({
          id: 'space-quest',
          title: 'Space Quest: Starship Escape',
          data: spaceQuestData
        });
      } catch (error) {
        console.warn('Failed to load Space Quest:', error);
      }

      setAvailableGames(games);
    };

    loadAvailableGames();
  }, []);

  // Setup game engine callbacks only once
  useEffect(() => {
    const outputCallback = (message: string) => {
      setOutput(prev => [...prev, message]);
    };

    const stateCallback = (state: IGameState) => {
      setGameState(state);
    };

    gameEngine.onOutput(outputCallback);
    gameEngine.onGameStateChange(stateCallback);

    // Cleanup function to prevent duplicate callbacks in StrictMode
    return () => {
      gameEngine.removeOutputCallback(outputCallback);
      gameEngine.removeGameStateChangeCallback(stateCallback);
    };
  }, [gameEngine]);

  const addOutput = useCallback((message: string) => {
    setOutput(prev => [...prev, message]);
  }, []);

  const handleGameSelectRef = useRef<((gameId: string) => Promise<void>) | null>(null);

  const handleCommand = useCallback(async (command: string) => {
    if (!command.trim()) return;

    // Add user input to output
    addOutput(`> ${command}`);
    
    // Handle system commands first
    if (command.toLowerCase() === 'clear') {
      setOutput([]);
      return;
    }

    if (command.toLowerCase() === 'games') {
      addOutput('Available games:');
      availableGames.forEach(game => {
        addOutput(`  - ${game.title} (${game.id})`);
      });
      addOutput('');
      return;
    }

    // Check if it's a game selection command
    const gameLoadMatch = command.toLowerCase().match(/^(?:load|play|start)\s+(.+)$/);
    if (gameLoadMatch) {
      const gameId = gameLoadMatch[1].trim();
      const game = availableGames.find(g => 
        g.id.toLowerCase() === gameId.toLowerCase() || 
        g.title.toLowerCase() === gameId.toLowerCase()
      );
      
      if (game) {
        await handleGameSelectRef.current?.(game.id);
        return;
      } else {
        addOutput(`Game "${gameId}" not found. Type "games" to see available games.`);
        return;
      }
    }

    // If no game is loaded, provide guidance
    if (!currentGame) {
      addOutput('No game loaded. Select a game from the menu or type "games" to see available games.');
      return;
    }

    // Process game command
    setIsLoading(true);
    try {
      const result = gameEngine.processCommand(command);
      if (result.message) {
        addOutput(result.message);
      }
    } catch (error) {
      addOutput(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [currentGame, availableGames, addOutput, gameEngine]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleGameSelect = useCallback(async (gameId: string) => {
    const game = availableGames.find(g => g.id === gameId);
    if (!game) {
      addOutput(`Game "${gameId}" not found.`);
      return;
    }

    setIsLoading(true);
    try {
      // Clear output for new game before starting
      setOutput([]);
      
      await gameEngine.loadGame(game.data);
      gameEngine.startNewGame();
      setCurrentGame(game.title);
      
      // Update URL
      navigate(`/games/${gameId}`);
      
    } catch (error) {
      addOutput(`Error loading game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, [availableGames, addOutput, gameEngine, navigate]);

  // Store the latest handleGameSelect in the ref
  useEffect(() => {
    handleGameSelectRef.current = handleGameSelect;
  }, [handleGameSelect]);

  // Handle URL-based game loading
  useEffect(() => {
    const path = location.pathname;
    const gameMatch = path.match(/^\/games\/([^/]+)$/);
    
    if (gameMatch && availableGames.length > 0) {
      const gameId = gameMatch[1];
      const game = availableGames.find(g => g.id === gameId);
      
      if (game && !currentGame) {
        // Only auto-load if no game is currently loaded
        handleGameSelect(gameId);
      } else if (!game) {
        // Game not found, redirect to home
        navigate('/');
        addOutput(`Game "${gameId}" not found. Redirected to home.`);
      }
    }
  }, [location.pathname, availableGames, currentGame, handleGameSelect, navigate, addOutput]);

  const handleNewGame = useCallback(() => {
    if (currentGame) {
      // Clear output before starting new game
      setOutput([]);
      gameEngine.startNewGame();
    } else {
      addOutput('No game loaded. Please select a game first.');
    }
  }, [currentGame, addOutput, gameEngine]);

  const handleSaveGame = useCallback(() => {
    if (!currentGame || !gameState) {
      addOutput('No active game to save.');
      return;
    }

    try {
      const saveData = gameEngine.saveGame();
      // In a real app, you'd save this to localStorage or a server
      localStorage.setItem(`texplorer_save_${currentGame}`, JSON.stringify(saveData));
      addOutput('Game saved successfully.');
    } catch (error) {
      addOutput(`Error saving game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentGame, gameState, addOutput, gameEngine]);

  const handleLoadGame = useCallback(() => {
    if (!currentGame) {
      addOutput('No game loaded. Please select a game first.');
      return;
    }

    try {
      const saveData = localStorage.getItem(`texplorer_save_${currentGame}`);
      if (!saveData) {
        addOutput('No saved game found.');
        return;
      }

      const gameState = JSON.parse(saveData);
      gameEngine.loadGameState(gameState);
      addOutput('Game loaded successfully.');
    } catch (error) {
      addOutput(`Error loading saved game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }, [currentGame, addOutput, gameEngine]);

  const handleHelpClick = useCallback(() => {
    setShowHelp(true);
  }, []);

  const handleHelpClose = useCallback(() => {
    setShowHelp(false);
  }, []);

  const GameComponent = () => (
    <div className="app">
      <MenuBar
        currentGame={currentGame || undefined}
        onHelpClick={handleHelpClick}
        onGameSelect={handleGameSelect}
        availableGames={availableGames}
        onNewGame={handleNewGame}
        onSaveGame={handleSaveGame}
        onLoadGame={handleLoadGame}
      />
      
      <main className="app-main">
        <Terminal
          output={output}
          onCommand={handleCommand}
          isLoading={isLoading}
          prompt={currentGame ? '> ' : 'texplorer> '}
        />
      </main>

      <HelpModal
        isOpen={showHelp}
        onClose={handleHelpClose}
      />
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<GameComponent />} />
      <Route path="/games/:gameId" element={<GameComponent />} />
    </Routes>
  );
}

export default App;
