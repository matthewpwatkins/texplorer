import { IGameEntity, IExaminable, IInteractable } from './IGameEntity';

export interface IDialogue {
  id: string;
  trigger: string;
  response: string;
  nextDialogueId?: string;
  conditions?: string[];
}

export interface INPC extends IGameEntity, IExaminable, IInteractable {
  isAlive: boolean;
  currentDialogueId?: string;
  inventory: string[];
  
  talk(): string;
  giveItem(itemId: string): string;
  takeItem(itemId: string): string;
  hasItem(itemId: string): boolean;
  setDialogue(dialogueId: string): void;
  getAvailableDialogues(): IDialogue[];
}

export interface INPCDefinition {
  id: string;
  name: string;
  description: string;
  longDescription?: string;
  isAlive: boolean;
  startingInventory?: string[];
  dialogues: IDialogue[];
  defaultResponse?: string;
  specialBehaviors?: Record<string, any>;
}