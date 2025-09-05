import React, { useEffect, useRef, useState, useCallback } from 'react';
import './Terminal.css';

interface TerminalProps {
  onCommand: (command: string) => void;
  output: string[];
  prompt?: string;
  isLoading?: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ 
  onCommand, 
  output, 
  prompt = '> ',
  isLoading = false 
}) => {
  const [inputValue, setInputValue] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new output is added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [output]);

  // Keep input focused
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  const handleSubmit = useCallback((command: string) => {
    if (command.trim() && !isLoading) {
      // Add to command history
      setCommandHistory(prev => [...prev, command]);
      setHistoryIndex(-1);
      
      // Execute command
      onCommand(command);
      
      // Clear input
      setInputValue('');
    }
  }, [onCommand, isLoading]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      case 'Enter':
        e.preventDefault();
        handleSubmit(inputValue);
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (commandHistory.length > 0) {
          const newIndex = historyIndex === -1 
            ? commandHistory.length - 1 
            : Math.max(0, historyIndex - 1);
          setHistoryIndex(newIndex);
          setInputValue(commandHistory[newIndex]);
        }
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (historyIndex !== -1) {
          const newIndex = historyIndex + 1;
          if (newIndex >= commandHistory.length) {
            setHistoryIndex(-1);
            setInputValue('');
          } else {
            setHistoryIndex(newIndex);
            setInputValue(commandHistory[newIndex]);
          }
        }
        break;
      
      case 'Tab':
        e.preventDefault();
        // TODO: Implement tab completion
        break;
    }
  }, [inputValue, commandHistory, historyIndex, handleSubmit]);

  // Handle clicking anywhere in terminal to focus input
  const handleTerminalClick = useCallback(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  return (
    <div className="terminal-container" onClick={handleTerminalClick}>
      <div ref={terminalRef} className="terminal-output">
        {output.map((line, index) => (
          <div key={index} className={`terminal-line ${line.startsWith('> ') ? 'user-input' : 'game-output'}`}>
            <pre className="terminal-text">{line}</pre>
          </div>
        ))}
        {isLoading && (
          <div className="terminal-line loading">
            <pre className="terminal-text">
              <span className="loading-cursor">Processing...</span>
            </pre>
          </div>
        )}
        
        {/* Current input line */}
        <div className="terminal-line current-input">
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="terminal-input"
            disabled={isLoading}
            placeholder={isLoading ? "Processing..." : ""}
            autoComplete="off"
            spellCheck="false"
          />
          <span className="terminal-cursor">|</span>
        </div>
      </div>
    </div>
  );
};

export default Terminal;