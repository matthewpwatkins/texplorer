import { INPC, IDialogue, IGameEntity } from '../interfaces';

export class NPC implements INPC {
  public id: string;
  public name: string;
  public description: string;
  public longDescription: string;
  public isAlive: boolean;
  public currentDialogueId?: string;
  public inventory: string[];
  public dialogues: Map<string, IDialogue>;
  public defaultResponse: string;
  public specialBehaviors: Record<string, any>;

  constructor(
    id: string,
    name: string,
    description: string,
    options: {
      longDescription?: string;
      isAlive?: boolean;
      startingInventory?: string[];
      dialogues?: IDialogue[];
      defaultResponse?: string;
      specialBehaviors?: Record<string, any>;
    } = {}
  ) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.longDescription = options.longDescription || description;
    this.isAlive = options.isAlive !== false; // Default to true
    this.inventory = options.startingInventory ? [...options.startingInventory] : [];
    this.dialogues = new Map();
    this.defaultResponse = options.defaultResponse || `${name} doesn't respond.`;
    this.specialBehaviors = options.specialBehaviors || {};
    
    // Initialize dialogues
    if (options.dialogues) {
      options.dialogues.forEach(dialogue => {
        this.dialogues.set(dialogue.id, dialogue);
      });
    }
  }

  public examine(): string {
    if (!this.isAlive) {
      return `${this.name} is dead.`;
    }
    
    let result = this.longDescription;
    
    if (this.inventory.length > 0) {
      result += `\n\n${this.name} is carrying: ${this.inventory.join(', ')}`;
    }
    
    return result;
  }

  public interact(action: string, target?: IGameEntity): string {
    if (!this.isAlive) {
      return `${this.name} is dead and cannot respond.`;
    }

    switch (action.toLowerCase()) {
      case 'talk':
      case 'speak':
        return this.talk();
      case 'examine':
      case 'look':
        return this.examine();
      case 'give':
        if (target) {
          return this.giveItem(target.id);
        }
        return "Give what?";
      case 'ask':
        return this.talk();
      default:
        return `You can't ${action} ${this.name}.`;
    }
  }

  public talk(): string {
    if (!this.isAlive) {
      return `${this.name} is dead and cannot speak.`;
    }

    // If there's a current dialogue, continue it
    if (this.currentDialogueId) {
      const dialogue = this.dialogues.get(this.currentDialogueId);
      if (dialogue) {
        const response = dialogue.response;
        
        // Move to next dialogue if specified
        if (dialogue.nextDialogueId) {
          this.currentDialogueId = dialogue.nextDialogueId;
        } else {
          this.currentDialogueId = undefined;
        }
        
        return `${this.name} says: "${response}"`;
      }
    }

    // Find available dialogues (those without conditions or with met conditions)
    const availableDialogues = this.getAvailableDialogues();
    
    if (availableDialogues.length > 0) {
      const dialogue = availableDialogues[0]; // Take first available
      this.currentDialogueId = dialogue.nextDialogueId;
      return `${this.name} says: "${dialogue.response}"`;
    }

    return `${this.name} says: "${this.defaultResponse}"`;
  }

  public giveItem(itemId: string): string {
    if (!this.isAlive) {
      return `${this.name} is dead and cannot give you anything.`;
    }

    if (this.hasItem(itemId)) {
      this.inventory = this.inventory.filter(id => id !== itemId);
      return `${this.name} gives you the ${itemId}.`;
    }
    
    return `${this.name} doesn't have that item.`;
  }

  public takeItem(itemId: string): string {
    if (!this.isAlive) {
      return `${this.name} is dead and cannot take anything.`;
    }

    if (!this.hasItem(itemId)) {
      this.inventory.push(itemId);
      return `${this.name} takes the ${itemId}.`;
    }
    
    return `${this.name} already has that item.`;
  }

  public hasItem(itemId: string): boolean {
    return this.inventory.includes(itemId);
  }

  public setDialogue(dialogueId: string): void {
    if (this.dialogues.has(dialogueId)) {
      this.currentDialogueId = dialogueId;
    }
  }

  public getAvailableDialogues(): IDialogue[] {
    return Array.from(this.dialogues.values()).filter(dialogue => {
      // If no conditions, dialogue is available
      if (!dialogue.conditions || dialogue.conditions.length === 0) {
        return true;
      }
      
      // Check conditions - this would be expanded based on game state
      // For now, just return true
      return true;
    });
  }

  public addDialogue(dialogue: IDialogue): void {
    this.dialogues.set(dialogue.id, dialogue);
  }

  public removeDialogue(dialogueId: string): void {
    this.dialogues.delete(dialogueId);
    if (this.currentDialogueId === dialogueId) {
      this.currentDialogueId = undefined;
    }
  }

  public kill(): void {
    this.isAlive = false;
    this.currentDialogueId = undefined;
  }

  public revive(): void {
    this.isAlive = true;
  }

  // Special behavior methods
  public triggerSpecialBehavior(behaviorName: string, context?: any): string {
    const behavior = this.specialBehaviors[behaviorName];
    if (behavior && typeof behavior === 'function') {
      return behavior(context);
    }
    return '';
  }

  public hasSpecialBehavior(behaviorName: string): boolean {
    return behaviorName in this.specialBehaviors;
  }
}