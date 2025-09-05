import { IPlayer } from '../interfaces';

export class Player implements IPlayer {
  public currentRoomId: string;
  public inventory: string[];
  public maxInventoryWeight: number;
  private itemWeights: Map<string, number>;

  constructor(startingRoomId: string, maxWeight: number = 50) {
    this.currentRoomId = startingRoomId;
    this.inventory = [];
    this.maxInventoryWeight = maxWeight;
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
    const itemWeight = this.itemWeights.get(itemId) || 1;
    return this.getCurrentWeight() + itemWeight <= this.maxInventoryWeight;
  }

  public addItem(itemId: string): boolean {
    if (this.inventory.includes(itemId)) {
      return false; // Already have this item
    }

    if (!this.canCarry(itemId)) {
      return false; // Too heavy
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

  public getInventoryDescription(): string {
    if (this.inventory.length === 0) {
      return "You are not carrying anything.";
    }

    const weightDescription = `(${this.getCurrentWeight()}/${this.maxInventoryWeight} kg)`;
    return `You are carrying: ${this.inventory.join(', ')} ${weightDescription}`;
  }

  public getInventoryWeight(itemId: string): number {
    return this.itemWeights.get(itemId) || 1;
  }

  public clearInventory(): void {
    this.inventory = [];
  }

  // Utility methods for game state management
  public clone(): Player {
    const clone = new Player(this.currentRoomId, this.maxInventoryWeight);
    clone.inventory = [...this.inventory];
    clone.itemWeights = new Map(this.itemWeights);
    return clone;
  }

  public serialize(): any {
    return {
      currentRoomId: this.currentRoomId,
      inventory: this.inventory,
      maxInventoryWeight: this.maxInventoryWeight,
      itemWeights: Object.fromEntries(this.itemWeights)
    };
  }

  public static deserialize(data: any): Player {
    const player = new Player(data.currentRoomId, data.maxInventoryWeight);
    player.inventory = data.inventory || [];
    player.itemWeights = new Map(Object.entries(data.itemWeights || {}));
    return player;
  }
}