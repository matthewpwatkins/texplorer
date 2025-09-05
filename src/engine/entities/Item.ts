import { IItem, IGameEntity, ItemType } from '../interfaces';

export class Item implements IItem {
  public id: string;
  public name: string;
  public description: string;
  public weight: number;
  public isContainer: boolean;
  public containerItems: string[];
  public isUsable: boolean;
  public useDescription: string;
  public type: ItemType;
  public canTakeItem: boolean;
  public onTakeMessage: string;
  public onDropMessage: string;
  public specialProperties: Record<string, any>;

  constructor(
    id: string,
    name: string,
    description: string,
    weight: number = 1,
    type: ItemType = ItemType.REGULAR,
    options: {
      isContainer?: boolean;
      containerCapacity?: number;
      isUsable?: boolean;
      useDescription?: string;
      canTake?: boolean;
      onTakeMessage?: string;
      onDropMessage?: string;
      specialProperties?: Record<string, any>;
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.weight = weight;
    this.type = type;
    this.isContainer = options.isContainer || false;
    this.containerItems = [];
    this.isUsable = options.isUsable || false;
    this.useDescription = options.useDescription || '';
    this.canTakeItem = options.canTake !== false; // Default to true unless explicitly false
    this.onTakeMessage = options.onTakeMessage || `You take the ${name}.`;
    this.onDropMessage = options.onDropMessage || `You drop the ${name}.`;
    this.specialProperties = options.specialProperties || {};
  }

  public examine(): string {
    let result = this.description;
    
    if (this.isContainer && this.containerItems.length > 0) {
      result += `\n\nInside you can see: ${this.containerItems.join(', ')}`;
    }
    
    if (this.isUsable && this.useDescription) {
      result += `\n\n${this.useDescription}`;
    }
    
    return result;
  }

  public interact(action: string, target?: IGameEntity): string {
    switch (action.toLowerCase()) {
      case 'examine':
      case 'look':
        return this.examine();
      case 'use':
        return this.use(target);
      case 'take':
        return this.onTake();
      case 'drop':
        return this.onDrop();
      default:
        return `You can't ${action} the ${this.name}.`;
    }
  }

  public canTake(): boolean {
    return this.canTakeItem;
  }

  public onTake(): string {
    return this.onTakeMessage;
  }

  public onDrop(): string {
    return this.onDropMessage;
  }

  public use(target?: IGameEntity): string {
    if (!this.isUsable) {
      return `You can't use the ${this.name}.`;
    }
    
    if (target && this.canUseWith(target)) {
      return this.useWith(target);
    }
    
    return this.useDescription || `You use the ${this.name}.`;
  }

  public canUseWith(target: IGameEntity): boolean {
    // Override in specific item implementations for special interactions
    return false;
  }

  private useWith(target: IGameEntity): string {
    // Override in specific item implementations
    return `You use the ${this.name} with the ${target.name}.`;
  }

  public addToContainer(itemId: string): boolean {
    if (!this.isContainer) {
      return false;
    }
    
    if (!this.containerItems.includes(itemId)) {
      this.containerItems.push(itemId);
      return true;
    }
    
    return false;
  }

  public removeFromContainer(itemId: string): boolean {
    if (!this.isContainer) {
      return false;
    }
    
    const index = this.containerItems.indexOf(itemId);
    if (index !== -1) {
      this.containerItems.splice(index, 1);
      return true;
    }
    
    return false;
  }

  public getContainerContents(): string[] {
    return this.isContainer ? [...this.containerItems] : [];
  }

  // Static factory methods for common item types
  static createKey(id: string, name: string, description: string): Item {
    return new Item(id, name, description, 0.1, ItemType.KEY, {
      isUsable: true,
      useDescription: `The ${name} might unlock something.`,
      specialProperties: { isKey: true }
    });
  }

  static createContainer(
    id: string, 
    name: string, 
    description: string, 
    capacity: number = 5
  ): Item {
    return new Item(id, name, description, 2, ItemType.CONTAINER, {
      isContainer: true,
      containerCapacity: capacity,
      specialProperties: { capacity }
    });
  }

  static createWeapon(id: string, name: string, description: string, damage: number): Item {
    return new Item(id, name, description, 1, ItemType.WEAPON, {
      isUsable: true,
      useDescription: `You wield the ${name}.`,
      specialProperties: { damage, isWeapon: true }
    });
  }
}