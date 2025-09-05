import * as yaml from 'js-yaml';
import { IGameData, IItemDefinition, INPCDefinition } from '../interfaces';
import { Room, Item, NPC } from '../entities';

export class GameLoader {
  public static async loadGameFromYaml(gameFiles: {
    metadata: string;
    rooms: string;
    items: string;
    npcs: string;
  }): Promise<IGameData> {
    try {
      const metadata = yaml.load(gameFiles.metadata) as any;
      const rooms = yaml.load(gameFiles.rooms) as any;
      const items = yaml.load(gameFiles.items) as any;
      const npcs = yaml.load(gameFiles.npcs) as any;

      return {
        metadata: {
          title: metadata.title || 'Untitled Game',
          author: metadata.author || 'Unknown',
          version: metadata.version || '1.0.0',
          description: metadata.description || 'A text adventure game',
          startingRoomId: metadata.startingRoomId || 'start'
        },
        rooms: rooms || {},
        items: items || {},
        npcs: npcs || {}
      };
    } catch (error) {
      console.error('Error loading game from YAML:', error);
      throw new Error('Failed to load game data');
    }
  }

  public static async loadGameFromUrl(yamlUrl: string): Promise<IGameData> {
    try {
      const response = await fetch(yamlUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch game file: ${response.statusText}`);
      }
      
      const yamlContent = await response.text();
      const gameData = yaml.load(yamlContent) as any;

      // Convert the YAML structure to our IGameData format
      return {
        metadata: {
          title: gameData.title || 'Untitled Game',
          author: gameData.author || 'Unknown',
          version: gameData.version || '1.0.0',
          description: gameData.description || 'A text adventure game',
          startingRoomId: gameData.start_location || 'start'
        },
        rooms: gameData.rooms || {},
        items: gameData.items || {},
        npcs: gameData.npcs || {}
      };
    } catch (error) {
      console.error('Error loading game from URL:', error);
      throw new Error(`Failed to load game: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  public static async loadGameFromFiles(gameDirectory: string): Promise<IGameData> {
    // This would be used in a Node.js environment
    // For browser, we'll load from static files
    throw new Error('File loading not implemented for browser environment');
  }

  public static createRoomFromDefinition(roomId: string, roomDef: any): Room {
    return new Room(
      roomId,
      roomDef.name || roomId,
      roomDef.shortDescription || roomDef.description || 'A room.',
      roomDef.longDescription || roomDef.description || 'A room.',
      roomDef.exits || [],
      roomDef.items || [],
      roomDef.npcs || []
    );
  }

  public static createItemFromDefinition(itemDef: IItemDefinition): Item {
    return new Item(
      itemDef.id,
      itemDef.name,
      itemDef.description,
      itemDef.weight || 1,
      itemDef.type,
      {
        isContainer: itemDef.isContainer,
        containerCapacity: itemDef.containerCapacity,
        isUsable: itemDef.isUsable,
        useDescription: itemDef.useDescription,
        canTake: itemDef.canTake,
        onTakeMessage: itemDef.onTakeMessage,
        onDropMessage: itemDef.onDropMessage,
        specialProperties: itemDef.specialProperties
      }
    );
  }

  public static createNPCFromDefinition(npcDef: INPCDefinition): NPC {
    return new NPC(
      npcDef.id,
      npcDef.name,
      npcDef.description,
      {
        longDescription: npcDef.longDescription,
        isAlive: npcDef.isAlive,
        startingInventory: npcDef.startingInventory,
        dialogues: npcDef.dialogues,
        defaultResponse: npcDef.defaultResponse,
        specialBehaviors: npcDef.specialBehaviors
      }
    );
  }

  public static validateGameData(gameData: IGameData): string[] {
    const errors: string[] = [];

    // Validate metadata
    if (!gameData.metadata.title) {
      errors.push('Game metadata missing title');
    }
    if (!gameData.metadata.startingRoomId) {
      errors.push('Game metadata missing startingRoomId');
    }

    // Validate starting room exists
    if (!gameData.rooms[gameData.metadata.startingRoomId]) {
      errors.push(`Starting room '${gameData.metadata.startingRoomId}' not found`);
    }

    // Validate room exits point to existing rooms
    Object.keys(gameData.rooms).forEach(roomId => {
      const room = gameData.rooms[roomId];
      if (room.exits) {
        room.exits.forEach((exit: any) => {
          if (!gameData.rooms[exit.roomId]) {
            errors.push(`Room '${roomId}' has exit to non-existent room '${exit.roomId}'`);
          }
        });
      }

      // Validate room items exist
      if (room.items) {
        room.items.forEach((itemId: string) => {
          if (!gameData.items[itemId]) {
            errors.push(`Room '${roomId}' contains non-existent item '${itemId}'`);
          }
        });
      }

      // Validate room NPCs exist
      if (room.npcs) {
        room.npcs.forEach((npcId: string) => {
          if (!gameData.npcs[npcId]) {
            errors.push(`Room '${roomId}' contains non-existent NPC '${npcId}'`);
          }
        });
      }
    });

    return errors;
  }

  public static createSampleGameData(): IGameData {
    return {
      metadata: {
        title: 'Sample Game',
        author: 'Test Author',
        version: '1.0.0',
        description: 'A simple test game',
        startingRoomId: 'start'
      },
      rooms: {
        start: {
          name: 'Starting Room',
          description: 'You are in a simple room.',
          shortDescription: 'A simple room.',
          longDescription: 'You are in a simple room with white walls and a single door.',
          exits: [
            { direction: 'north', roomId: 'north_room' }
          ],
          items: ['key'],
          npcs: []
        },
        north_room: {
          name: 'Northern Room',
          description: 'A room to the north.',
          shortDescription: 'Northern room.',
          longDescription: 'This northern room is slightly larger than the previous one.',
          exits: [
            { direction: 'south', roomId: 'start' }
          ],
          items: [],
          npcs: ['guard']
        }
      },
      items: {
        key: {
          id: 'key',
          name: 'brass key',
          description: 'A small brass key that looks important.',
          weight: 0.1,
          type: 'key',
          isUsable: true,
          canTake: true,
          onTakeMessage: 'You pick up the brass key.',
          useDescription: 'This key might unlock something.'
        }
      },
      npcs: {
        guard: {
          id: 'guard',
          name: 'guard',
          description: 'A stern-looking guard.',
          longDescription: 'A tall guard in armor, watching you carefully.',
          isAlive: true,
          dialogues: [
            {
              id: 'greeting',
              trigger: 'talk',
              response: 'Halt! What are you doing here?',
              nextDialogueId: 'explain'
            },
            {
              id: 'explain',
              trigger: 'talk',
              response: 'I see. Well, be careful around here.'
            }
          ],
          defaultResponse: 'The guard nods at you.'
        }
      }
    };
  }
}