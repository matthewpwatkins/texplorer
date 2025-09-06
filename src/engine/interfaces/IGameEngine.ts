import { IRoom } from './IRoom';
import { IItem } from './IItem';
import { INPC } from './INPC';

export interface ICommandResult {
  success: boolean;
  message: string;
  gameStateChanged?: boolean;
}

export interface IGameState {
  currentRoomId: string;
  inventory: string[];
  visitedRooms: Set<string>;
  gameFlags: Map<string, boolean>;
  gameVariables: Map<string, any>;
  turnCount: number;
}

export interface IPlayer {
  currentRoomId: string;
  inventory: string[];
  maxInventoryItems: number;
  getCurrentWeight(): number;
  canCarry(itemId: string): boolean;
  addItem(itemId: string): boolean;
  removeItem(itemId: string): boolean;
  hasItem(itemId: string): boolean;
  getInventoryList(): string[];
}

export interface IGameEngine {
  // Game lifecycle
  loadGame(gameData: IGameData): Promise<void>;
  startNewGame(): void;
  saveGame(): IGameState;
  loadGameState(state: IGameState): void;
  
  // Command processing
  processCommand(input: string): ICommandResult;
  
  // Game state access
  getCurrentRoom(): IRoom;
  getPlayer(): IPlayer;
  getItem(itemId: string): IItem | undefined;
  getNPC(npcId: string): INPC | undefined;
  getRoom(roomId: string): IRoom | undefined;
  
  // Game state management
  getGameState(): IGameState;
  setGameFlag(flag: string, value: boolean): void;
  getGameFlag(flag: string): boolean;
  setGameVariable(name: string, value: any): void;
  getGameVariable(name: string): any;
  
  // Events
  onGameStateChange(callback: (state: IGameState) => void): void;
  onOutput(callback: (message: string) => void): void;
}

export interface IGameData {
  metadata: {
    title: string;
    author: string;
    version: string;
    description: string;
    startingRoomId: string;
  };
  rooms: Record<string, any>;
  items: Record<string, any>;
  npcs: Record<string, any>;
}

export interface ICommand {
  verb: string;
  object?: string;
  preposition?: string;
  indirectObject?: string;
}