/**
 * Base interface for all game entities (rooms, items, NPCs)
 */
export interface IGameEntity {
  id: string;
  name: string;
  description: string;
}

/**
 * Interface for entities that can be examined
 */
export interface IExaminable {
  examine(): string;
}

/**
 * Interface for entities that can be interacted with
 */
export interface IInteractable {
  interact(action: string, target?: IGameEntity): string;
}

/**
 * Interface for entities that can be taken/dropped
 */
export interface IPortable {
  canTake(): boolean;
  onTake(): string;
  onDrop(): string;
}