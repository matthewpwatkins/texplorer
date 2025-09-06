import { IPlayer } from '../interfaces';

export class Player implements IPlayer {
  public currentRoomId: string;
  public inventory: string[];
  public maxInventoryItems: number;
  private itemWeights: Map<string, number>;

  constructor(startingRoomId: string, maxItems: number = 5) {
    this.currentRoomId = startingRoomId;
    this.inventory = [];
    this.maxInventoryItems = maxItems;
    this.itemWeights = new Map();
  }

  public getCurrentWeight(): number {
    let totalWeight = 0;
    for (const itemId of this.inventory) {
      totalWeight += this.itemWeights.get(itemId) || 1;
    }
    return totalWeight;
  }

  public canCarry(itemId: string): boolean {
    return this.inventory.length < this.maxInventoryItems;
  }

  public addItem(itemId: string): boolean {
    if (this.inventory.includes(itemId)) {
      return false; // Already have this item
    }

    if (!this.canCarry(itemId)) {
      return false; // Too many items
    }

    this.inventory.push(itemId);
    return true;
  }

  public removeItem(itemId: string): boolean {
    const index = this.inventory.indexOf(itemId);
    if (index !== -1) {
      this.inventory.splice(index, 1);
      return true;
    }
    return false;
  }

  public hasItem(itemId: string): boolean {
    return this.inventory.includes(itemId);
  }

  public getInventoryList(): string[] {
    return [...this.inventory];
  }

  public setItemWeight(itemId: string, weight: number): void {
    this.itemWeights.set(itemId, weight);
  }

  public moveToRoom(roomId: string): void {
    this.currentRoomId = roomId;
  }

  public getInventoryDescription(gameEngine?: any): string {
    if (this.inventory.length === 0) {
      return "You are not carrying anything.";
    }

    let itemList: string;
    if (gameEngine) {
      const itemNames = this.inventory
        .map(id => gameEngine.getItem(id))
        .filter(item => item)
        .map(item => item.name);
      itemList = itemNames.join(', ');
    } else {
      itemList = this.inventory.join(', ');
    }

    const countDescription = `(${this.inventory.length}/${this.maxInventoryItems} items)`;
    return `You are carrying: ${itemList} ${countDescription}`;
  }

  public getInventoryWeight(itemId: string): number {
    return this.itemWeights.get(itemId) || 1;
  }

  public clearInventory(): void {
    this.inventory = [];
  }

  // Utility methods for game state management
  public clone(): Player {
    const clone = new Player(this.currentRoomId, this.maxInventoryItems);
    clone.inventory = [...this.inventory];
    clone.itemWeights = new Map(this.itemWeights);
    return clone;
  }

  public serialize(): any {
    return {
      currentRoomId: this.currentRoomId,
      inventory: this.inventory,
      maxInventoryItems: this.maxInventoryItems,
      itemWeights: Object.fromEntries(this.itemWeights)
    };
  }

  public static deserialize(data: any): Player {
    const player = new Player(data.currentRoomId, data.maxInventoryItems || data.maxInventoryWeight || 10);
    player.inventory = data.inventory || [];
    player.itemWeights = new Map(Object.entries(data.itemWeights || {}));
    return player;
  }
}