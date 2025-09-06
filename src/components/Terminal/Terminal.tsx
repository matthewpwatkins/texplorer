import React, { useEffect, useRef, useState, useCallback, memo } from 'react';
import './Terminal.css';

interface TerminalProps {
  onCommand: (command: string) => void;
  output: string[];
  prompt?: string;
  isLoading?: boolean;
}

const TerminalComponent: React.FC<TerminalProps> = ({ 
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

  // Handle clicking anywhere in terminal to focus input, but avoid triggering on text selection
  const handleTerminalClick = useCallback((e: React.MouseEvent) => {
    // Only focus input if no text is selected
    const selection = window.getSelection();
    if ((!selection || selection.toString() === '') && inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  // Prevent re-rendering of output lines by using stable keys and avoiding inline functions
  const outputLines = React.useMemo(() => {
    return output.map((line, index) => (
      <div key={`line-${index}-${line.substring(0, 20)}`} className={`terminal-line ${line.startsWith('> ') ? 'user-input' : 'game-output'}`}>
        <pre className="terminal-text">{line}</pre>
      </div>
    ));
  }, [output]);

  return (
    <div className="terminal-container" onClick={handleTerminalClick}>
      <div ref={terminalRef} className="terminal-output">
        {outputLines}
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

// Memoize the component to prevent unnecessary re-renders
const MemoizedTerminal = memo(TerminalComponent, (prevProps, nextProps) => {
  // Only re-render if output array actually changed (not just reference)
  return (
    prevProps.output.length === nextProps.output.length &&
    prevProps.output.every((line, index) => line === nextProps.output[index]) &&
    prevProps.prompt === nextProps.prompt &&
    prevProps.isLoading === nextProps.isLoading &&
    prevProps.onCommand === nextProps.onCommand
  );
});

export const Terminal = MemoizedTerminal;
export default MemoizedTerminal;