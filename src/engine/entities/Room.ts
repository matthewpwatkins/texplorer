import { IRoom, IExit } from '../interfaces';

export class Room implements IRoom {
  public id: string;
  public name: string;
  public description: string;
  public shortDescription: string;
  public longDescription: string;
  public exits: IExit[];
  public itemIds: string[];
  public npcIds: string[];
  public visited: boolean;

  constructor(
    id: string,
    name: string,
    shortDescription: string,
    longDescription: string,
    exits: IExit[] = [],
    itemIds: string[] = [],
    npcIds: string[] = []
  ) {
    this.id = id;
    this.name = name;
    this.description = shortDescription; // For IGameEntity compatibility
    this.shortDescription = shortDescription;
    this.longDescription = longDescription;
    this.exits = exits;
    this.itemIds = [...itemIds];
    this.npcIds = [...npcIds];
    this.visited = false;
  }

  public getDescription(isLong: boolean = false): string {
    const desc = isLong || !this.visited ? this.longDescription : this.shortDescription;
    
    let result = desc;
    
    // Add items if present
    if (this.itemIds.length > 0) {
      result += '\n\nYou can see: ' + this.itemIds.join(', ');
    }
    
    // Add NPCs if present
    if (this.npcIds.length > 0) {
      result += '\n\nPresent: ' + this.npcIds.join(', ');
    }
    
    // Add exits
    const exitList = this.exits.map(exit => exit.direction).join(', ');
    if (exitList) {
      result += '\n\nExits: ' + exitList;
    }
    
    return result;
  }

  public getExits(): IExit[] {
    return [...this.exits];
  }

  public addItem(itemId: string): void {
    if (!this.itemIds.includes(itemId)) {
      this.itemIds.push(itemId);
    }
  }

  public removeItem(itemId: string): void {
    const index = this.itemIds.indexOf(itemId);
    if (index !== -1) {
      this.itemIds.splice(index, 1);
    }
  }

  public addNpc(npcId: string): void {
    if (!this.npcIds.includes(npcId)) {
      this.npcIds.push(npcId);
    }
  }

  public removeNpc(npcId: string): void {
    const index = this.npcIds.indexOf(npcId);
    if (index !== -1) {
      this.npcIds.splice(index, 1);
    }
  }

  public hasExit(direction: string): boolean {
    return this.exits.some(exit => exit.direction.toLowerCase() === direction.toLowerCase());
  }

  public getExit(direction: string): IExit | undefined {
    return this.exits.find(exit => exit.direction.toLowerCase() === direction.toLowerCase());
  }

  public markVisited(): void {
    this.visited = true;
  }
}