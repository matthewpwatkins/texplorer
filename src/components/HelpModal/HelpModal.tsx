import React from 'react';
import './HelpModal.css';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  gameCommands?: string[];
}

export const HelpModal: React.FC<HelpModalProps> = ({ 
  isOpen, 
  onClose, 
  gameCommands = [] 
}) => {
  if (!isOpen) return null;

  const defaultCommands = [
    'go [direction] - Move in a direction (north, south, east, west, etc.)',
    'look / examine [object] - Look around or examine something',
    'take / get [object] - Pick up an item',
    'drop [object] - Drop an item from inventory',
    'use [object] - Use an item',
    'talk [npc] - Talk to a character',
    'inventory / i - Show your inventory',
    'help - Show this help message',
    'quit - Exit the game'
  ];

  const commands = gameCommands.length > 0 ? gameCommands : defaultCommands;

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div 
      className="help-modal-overlay" 
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div className="help-modal" role="dialog" aria-labelledby="help-title" aria-modal="true">
        <div className="help-modal-header">
          <h2 id="help-title">Game Help</h2>
          <button 
            className="help-modal-close" 
            onClick={onClose}
            aria-label="Close help modal"
          >
            ✕
          </button>
        </div>
        
        <div className="help-modal-content">
          <section className="help-section">
            <h3>How to Play</h3>
            <p>
              This is a text adventure game. You interact with the game world by typing 
              commands in the terminal below. The game will respond with descriptions 
              and feedback based on your actions.
            </p>
          </section>

          <section className="help-section">
            <h3>Available Commands</h3>
            <div className="commands-list">
              {commands.map((command, index) => {
                const [cmd, description] = command.split(' - ');
                return (
                  <div key={index} className="command-item">
                    <code className="command-syntax">{cmd}</code>
                    <span className="command-description">{description}</span>
                  </div>
                );
              })}
            </div>
          </section>

          <section className="help-section">
            <h3>Tips</h3>
            <ul className="tips-list">
              <li>
                <strong>Explore:</strong> Use "look" to examine your surroundings and objects
              </li>
              <li>
                <strong>Inventory:</strong> Type "i" or "inventory" to see what you're carrying
              </li>
              <li>
                <strong>Directions:</strong> You can use short forms like "n" for north, "s" for south
              </li>
              <li>
                <strong>Objects:</strong> You can usually refer to objects by their first word
              </li>
              <li>
                <strong>History:</strong> Use the up and down arrow keys to navigate command history
              </li>
              <li>
                <strong>Case:</strong> Commands are case-insensitive - "LOOK" and "look" work the same
              </li>
            </ul>
          </section>

          <section className="help-section">
            <h3>Game Controls</h3>
            <div className="controls-list">
              <div className="control-item">
                <kbd>Enter</kbd>
                <span>Execute command</span>
              </div>
              <div className="control-item">
                <kbd>↑</kbd> / <kbd>↓</kbd>
                <span>Navigate command history</span>
              </div>
              <div className="control-item">
                <kbd>Esc</kbd>
                <span>Close this help dialog</span>
              </div>
            </div>
          </section>

          <section className="help-section">
            <h3>About Texplorer</h3>
            <p>
              Texplorer is a modern text adventure game engine that brings classic 
              interactive fiction to the web. Enjoy exploring virtual worlds through 
              the power of text and imagination!
            </p>
          </section>
        </div>

        <div className="help-modal-footer">
          <button className="help-modal-button" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default HelpModal;