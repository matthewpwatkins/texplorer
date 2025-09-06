import { 
  IGameEngine, 
  IGameData, 
  IGameState, 
  IPlayer, 
  IRoom, 
  IItem, 
  INPC, 
  ICommandResult, 
  ICommand 
} from '../interfaces';
import { Room, Item, NPC, Player } from '../entities';
import { CommandParser } from '../parsers/CommandParser';
import { GameLoader } from './GameLoader';

export class GameEngine implements IGameEngine {
  private gameData: IGameData | null = null;
  private rooms: Map<string, Room> = new Map();
  private items: Map<string, Item> = new Map();
  private npcs: Map<string, NPC> = new Map();
  private player: Player | null = null;
  private gameState: IGameState | null = null;
  private commandParser: CommandParser;
  private gameStateChangeCallbacks: ((state: IGameState) => void)[] = [];
  private outputCallbacks: ((message: string) => void)[] = [];

  constructor() {
    this.commandParser = new CommandParser();
  }

  public async loadGame(gameData: IGameData): Promise<void> {
    // Validate game data
    const errors = GameLoader.validateGameData(gameData);
    if (errors.length > 0) {
      throw new Error(`Game data validation failed: ${errors.join(', ')}`);
    }

    this.gameData = gameData;
    
    // Clear existing data
    this.rooms.clear();
    this.items.clear();
    this.npcs.clear();

    // Load rooms
    Object.keys(gameData.rooms).forEach(roomId => {
      const roomDef = gameData.rooms[roomId];
      const room = GameLoader.createRoomFromDefinition(roomId, roomDef);
      this.rooms.set(roomId, room);
    });

    // Load items
    Object.keys(gameData.items).forEach(itemId => {
      const itemDef = gameData.items[itemId];
      const item = GameLoader.createItemFromDefinition(itemDef);
      this.items.set(itemId, item);
      
      // Set item weights for player
      if (this.player) {
        this.player.setItemWeight(itemId, item.weight);
      }
    });

    // Load NPCs
    Object.keys(gameData.npcs).forEach(npcId => {
      const npcDef = gameData.npcs[npcId];
      const npc = GameLoader.createNPCFromDefinition(npcDef);
      this.npcs.set(npcId, npc);
    });

    this.output(`Loaded game: ${gameData.metadata.title} by ${gameData.metadata.author}`);
  }

  public startNewGame(): void {
    if (!this.gameData) {
      throw new Error('No game data loaded');
    }

    // Create new player
    this.player = new Player(this.gameData.metadata.startingRoomId);
    
    // Set up item weights
    this.items.forEach((item, itemId) => {
      this.player!.setItemWeight(itemId, item.weight);
    });

    // Initialize game state
    this.gameState = {
      currentRoomId: this.gameData.metadata.startingRoomId,
      inventory: [],
      visitedRooms: new Set([this.gameData.metadata.startingRoomId]),
      gameFlags: new Map(),
      gameVariables: new Map(),
      turnCount: 0
    };

    // Mark starting room as visited
    const startingRoom = this.rooms.get(this.gameData.metadata.startingRoomId);
    if (startingRoom) {
      startingRoom.markVisited();
    }

    this.output(`Welcome to ${this.gameData.metadata.title}!`);
    this.output(this.gameData.metadata.description);
    this.output(''); // Empty line
    this.lookAround();
    
    this.notifyGameStateChange();
  }

  public saveGame(): IGameState {
    if (!this.gameState || !this.player) {
      throw new Error('No active game to save');
    }

    return {
      currentRoomId: this.player.currentRoomId,
      inventory: this.player.getInventoryList(),
      visitedRooms: new Set(this.gameState.visitedRooms),
      gameFlags: new Map(this.gameState.gameFlags),
      gameVariables: new Map(this.gameState.gameVariables),
      turnCount: this.gameState.turnCount
    };
  }

  public loadGameState(state: IGameState): void {
    if (!this.player || !this.gameData) {
      throw new Error('No game loaded');
    }

    this.gameState = {
      currentRoomId: state.currentRoomId,
      inventory: [...state.inventory],
      visitedRooms: new Set(state.visitedRooms),
      gameFlags: new Map(state.gameFlags),
      gameVariables: new Map(state.gameVariables),
      turnCount: state.turnCount
    };

    this.player.moveToRoom(state.currentRoomId);
    this.player.clearInventory();
    state.inventory.forEach(itemId => this.player!.addItem(itemId));

    this.notifyGameStateChange();
  }

  public processCommand(input: string): ICommandResult {
    if (!this.gameState || !this.player) {
      return { success: false, message: 'No active game' };
    }

    const command = this.commandParser.parseCommand(input);
    this.gameState.turnCount++;

    let result: ICommandResult;

    try {
      result = this.executeCommand(command);
    } catch (error) {
      result = { 
        success: false, 
        message: `Error executing command: ${error instanceof Error ? error.message : 'Unknown error'}` 
      };
    }

    if (result.gameStateChanged) {
      this.notifyGameStateChange();
    }

    return result;
  }

  private executeCommand(command: ICommand): ICommandResult {
    const verb = command.verb.toLowerCase();

    switch (verb) {
      case 'go':
      case 'move':
        return this.handleMovement(command.object || '');
      
      case 'look':
      case 'examine':
        return this.handleLook(command.object);
      
      case 'take':
      case 'get':
        return this.handleTake(command.object || '');
      
      case 'drop':
        return this.handleDrop(command.object || '');
      
      case 'use':
        return this.handleUse(command.object || '', command.indirectObject);
      
      case 'talk':
      case 'speak':
        return this.handleTalk(command.object || '');
      
      case 'inventory':
        return this.handleInventory();
      
      case 'help':
        return this.handleHelp();
      
      case 'quit':
        return { success: true, message: 'Thanks for playing!' };
      
      case '':
        return { success: false, message: 'Please enter a command.' };
      
      default:
        return { success: false, message: `I don't understand "${verb}".` };
    }
  }

  private handleMovement(direction: string): ICommandResult {
    if (!direction) {
      return { success: false, message: 'Go where?' };
    }

    const currentRoom = this.getCurrentRoom();
    const exit = currentRoom.getExit(direction);

    if (!exit) {
      return { success: false, message: `You can't go ${direction} from here.` };
    }

    if (exit.isLocked) {
      return { 
        success: false, 
        message: exit.lockDescription || `The way ${direction} is blocked.` 
      };
    }

    const newRoom = this.rooms.get(exit.roomId);
    if (!newRoom) {
      return { success: false, message: 'That room doesn\'t exist.' };
    }

    // Move player
    this.player!.moveToRoom(exit.roomId);
    this.gameState!.currentRoomId = exit.roomId;
    this.gameState!.visitedRooms.add(exit.roomId);
    
    // Mark room as visited
    newRoom.markVisited();

    this.output(`You go ${direction}.`);
    this.lookAround();

    return { success: true, message: '', gameStateChanged: true };
  }

  private handleLook(target?: string): ICommandResult {
    if (!target) {
      this.lookAround();
      return { success: true, message: '' };
    }

    // Look at item in room or inventory
    const item = this.findItemInRoomOrInventory(target);
    if (item) {
      return { success: true, message: item.examine() };
    }

    // Look at NPC
    const npc = this.findNPCInRoom(target);
    if (npc) {
      return { success: true, message: npc.examine() };
    }

    return { success: false, message: `You don't see any ${target} here.` };
  }

  private handleTake(itemName: string): ICommandResult {
    if (!itemName) {
      return { success: false, message: 'Take what?' };
    }

    const item = this.findItemInRoom(itemName);
    if (!item) {
      return { success: false, message: `You don't see any ${itemName} here.` };
    }

    if (!item.canTake()) {
      return { success: false, message: `You can't take the ${item.name}.` };
    }

    if (!this.player!.canCarry(item.id)) {
      return { success: false, message: 'You are carrying too much weight.' };
    }

    // Remove from room and add to inventory
    const currentRoom = this.getCurrentRoom();
    currentRoom.removeItem(item.id);
    this.player!.addItem(item.id);

    return { 
      success: true, 
      message: item.onTake(), 
      gameStateChanged: true 
    };
  }

  private handleDrop(itemName: string): ICommandResult {
    if (!itemName) {
      return { success: false, message: 'Drop what?' };
    }

    const item = this.findItemInInventory(itemName);
    if (!item) {
      return { success: false, message: `You don't have any ${itemName}.` };
    }

    // Remove from inventory and add to room
    this.player!.removeItem(item.id);
    const currentRoom = this.getCurrentRoom();
    currentRoom.addItem(item.id);

    return { 
      success: true, 
      message: item.onDrop(), 
      gameStateChanged: true 
    };
  }

  private handleUse(itemName: string, target?: string): ICommandResult {
    if (!itemName) {
      return { success: false, message: 'Use what?' };
    }

    const item = this.findItemInInventory(itemName);
    if (!item) {
      return { success: false, message: `You don't have any ${itemName}.` };
    }

    let targetEntity;
    if (target) {
      targetEntity = this.findItemInRoomOrInventory(target) || this.findNPCInRoom(target);
      if (!targetEntity) {
        return { success: false, message: `You don't see any ${target} here.` };
      }
    }

    const result = item.use(targetEntity);
    return { success: true, message: result, gameStateChanged: true };
  }

  private handleTalk(npcName: string): ICommandResult {
    if (!npcName) {
      return { success: false, message: 'Talk to whom?' };
    }

    const npc = this.findNPCInRoom(npcName);
    if (!npc) {
      return { success: false, message: `You don't see any ${npcName} here.` };
    }

    const response = npc.talk();
    return { success: true, message: response };
  }

  private handleInventory(): ICommandResult {
    return { success: true, message: this.player!.getInventoryDescription() };
  }

  private handleHelp(): ICommandResult {
    const commands = this.commandParser.getAvailableCommands();
    return { success: true, message: 'Available commands:\n' + commands.join('\n') };
  }

  private lookAround(): void {
    const currentRoom = this.getCurrentRoom();
    this.output(currentRoom.getDescription(true));
  }

  // Helper methods
  public getCurrentRoom(): IRoom {
    if (!this.player) {
      throw new Error('No active player');
    }
    const room = this.rooms.get(this.player.currentRoomId);
    if (!room) {
      throw new Error('Current room not found');
    }
    return room;
  }

  public getPlayer(): IPlayer {
    if (!this.player) {
      throw new Error('No active player');
    }
    return this.player;
  }

  public getItem(itemId: string): IItem | undefined {
    return this.items.get(itemId);
  }

  public getNPC(npcId: string): INPC | undefined {
    return this.npcs.get(npcId);
  }

  public getRoom(roomId: string): IRoom | undefined {
    return this.rooms.get(roomId);
  }

  public getGameState(): IGameState {
    if (!this.gameState) {
      throw new Error('No active game state');
    }
    return this.gameState;
  }

  public setGameFlag(flag: string, value: boolean): void {
    if (this.gameState) {
      this.gameState.gameFlags.set(flag, value);
    }
  }

  public getGameFlag(flag: string): boolean {
    return this.gameState?.gameFlags.get(flag) || false;
  }

  public setGameVariable(name: string, value: any): void {
    if (this.gameState) {
      this.gameState.gameVariables.set(name, value);
    }
  }

  public getGameVariable(name: string): any {
    return this.gameState?.gameVariables.get(name);
  }

  public onGameStateChange(callback: (state: IGameState) => void): void {
    this.gameStateChangeCallbacks.push(callback);
  }

  public onOutput(callback: (message: string) => void): void {
    this.outputCallbacks.push(callback);
  }

  public removeGameStateChangeCallback(callback: (state: IGameState) => void): void {
    const index = this.gameStateChangeCallbacks.indexOf(callback);
    if (index > -1) {
      this.gameStateChangeCallbacks.splice(index, 1);
    }
  }

  public removeOutputCallback(callback: (message: string) => void): void {
    const index = this.outputCallbacks.indexOf(callback);
    if (index > -1) {
      this.outputCallbacks.splice(index, 1);
    }
  }

  public clearAllCallbacks(): void {
    this.gameStateChangeCallbacks = [];
    this.outputCallbacks = [];
  }

  private notifyGameStateChange(): void {
    if (this.gameState) {
      this.gameStateChangeCallbacks.forEach(callback => callback(this.gameState!));
    }
  }

  private output(message: string): void {
    this.outputCallbacks.forEach(callback => callback(message));
  }

  // Item/NPC finding helpers
  private findItemInRoom(itemName: string): Item | undefined {
    const currentRoom = this.getCurrentRoom();
    return currentRoom.itemIds
      .map(id => this.items.get(id))
      .find(item => item && item.name.toLowerCase().includes(itemName.toLowerCase()));
  }

  private findItemInInventory(itemName: string): Item | undefined {
    return this.player!.getInventoryList()
      .map(id => this.items.get(id))
      .find(item => item && item.name.toLowerCase().includes(itemName.toLowerCase()));
  }

  private findItemInRoomOrInventory(itemName: string): Item | undefined {
    return this.findItemInRoom(itemName) || this.findItemInInventory(itemName);
  }

  private findNPCInRoom(npcName: string): NPC | undefined {
    const currentRoom = this.getCurrentRoom();
    return currentRoom.npcIds
      .map(id => this.npcs.get(id))
      .find(npc => npc && npc.name.toLowerCase().includes(npcName.toLowerCase()));
  }
}