import { IGameEntity, IExaminable, IInteractable, IPortable } from './IGameEntity';

export interface IItem extends IGameEntity, IExaminable, IInteractable, IPortable {
  weight: number;
  isContainer: boolean;
  containerItems?: string[];
  isUsable: boolean;
  useDescription?: string;
  
  use(target?: IGameEntity): string;
  canUseWith(target: IGameEntity): boolean;
  addToContainer(itemId: string): boolean;
  removeFromContainer(itemId: string): boolean;
  getContainerContents(): string[];
}

export enum ItemType {
  REGULAR = 'regular',
  CONTAINER = 'container',
  KEY = 'key',
  WEAPON = 'weapon',
  TOOL = 'tool',
  CONSUMABLE = 'consumable'
}

export interface IItemDefinition {
  id: string;
  name: string;
  description: string;
  weight: number;
  type: ItemType;
  isContainer?: boolean;
  containerCapacity?: number;
  isUsable?: boolean;
  useDescription?: string;
  canTake?: boolean;
  onTakeMessage?: string;
  onDropMessage?: string;
  onUseMessage?: string;
  specialProperties?: Record<string, any>;
}