import { IGameEntity } from './IGameEntity';

export interface IExit {
  direction: string;
  roomId: string;
  isLocked?: boolean;
  lockDescription?: string;
}

export interface IRoom extends IGameEntity {
  shortDescription: string;
  longDescription: string;
  exits: IExit[];
  itemIds: string[];
  npcIds: string[];
  visited: boolean;
  
  getDescription(isLong?: boolean, gameEngine?: any): string;
  getExits(): IExit[];
  addItem(itemId: string): void;
  removeItem(itemId: string): void;
  addNpc(npcId: string): void;
  removeNpc(npcId: string): void;
  hasExit(direction: string): boolean;
  getExit(direction: string): IExit | undefined;
  markVisited(): void;
}