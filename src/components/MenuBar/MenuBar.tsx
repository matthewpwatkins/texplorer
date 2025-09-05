import React, { useState } from 'react';
import './MenuBar.css';

interface MenuBarProps {
  gameTitle?: string;
  currentGame?: string;
  onHelpClick: () => void;
  onGameSelect?: (gameId: string) => void;
  availableGames?: Array<{ id: string; title: string }>;
  onNewGame?: () => void;
  onSaveGame?: () => void;
  onLoadGame?: () => void;
}

export const MenuBar: React.FC<MenuBarProps> = ({
  gameTitle = 'Texplorer',
  currentGame,
  onHelpClick,
  onGameSelect,
  availableGames = [],
  onNewGame,
  onSaveGame,
  onLoadGame
}) => {
  const [showGameMenu, setShowGameMenu] = useState(false);
  const [showFileMenu, setShowFileMenu] = useState(false);

  const handleGameSelect = (gameId: string) => {
    onGameSelect?.(gameId);
    setShowGameMenu(false);
  };

  const handleFileAction = (action: () => void) => {
    action();
    setShowFileMenu(false);
  };

  return (
    <div className="menubar">
      <div className="menubar-left">
        <div className="menubar-title">
          <span className="app-name">{gameTitle}</span>
          {currentGame && (
            <>
              <span className="separator">-</span>
              <span className="game-name">{currentGame}</span>
            </>
          )}
        </div>
      </div>

      <div className="menubar-center">
        {/* Optional: Add breadcrumb or status info here */}
      </div>

      <div className="menubar-right">
        {/* File Menu */}
        <div className="menu-dropdown">
          <button 
            className="menu-button"
            onClick={() => setShowFileMenu(!showFileMenu)}
            onBlur={() => setTimeout(() => setShowFileMenu(false), 150)}
          >
            File
          </button>
          {showFileMenu && (
            <div className="dropdown-menu">
              {onNewGame && (
                <button 
                  className="dropdown-item"
                  onClick={() => handleFileAction(onNewGame)}
                >
                  New Game
                </button>
              )}
              {onSaveGame && (
                <button 
                  className="dropdown-item"
                  onClick={() => handleFileAction(onSaveGame)}
                >
                  Save Game
                </button>
              )}
              {onLoadGame && (
                <button 
                  className="dropdown-item"
                  onClick={() => handleFileAction(onLoadGame)}
                >
                  Load Game
                </button>
              )}
            </div>
          )}
        </div>

        {/* Games Menu */}
        {availableGames.length > 0 && (
          <div className="menu-dropdown">
            <button 
              className="menu-button"
              onClick={() => setShowGameMenu(!showGameMenu)}
              onBlur={() => setTimeout(() => setShowGameMenu(false), 150)}
            >
              Games
            </button>
            {showGameMenu && (
              <div className="dropdown-menu">
                {availableGames.map(game => (
                  <button 
                    key={game.id}
                    className={`dropdown-item ${currentGame === game.title ? 'active' : ''}`}
                    onClick={() => handleGameSelect(game.id)}
                  >
                    {game.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Help Button */}
        <button className="menu-button" onClick={onHelpClick}>
          Help
        </button>
      </div>
    </div>
  );
};

export default MenuBar;