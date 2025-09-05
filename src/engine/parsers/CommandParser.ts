import nlp from 'compromise';
import { ICommand } from '../interfaces';

export class CommandParser {
  private synonyms: Map<string, string[]> = new Map();
  private directions: Set<string> = new Set();

  constructor() {
    this.initializeSynonyms();
    this.initializeDirections();
  }

  private initializeSynonyms(): void {
    this.synonyms.set('go', ['move', 'walk', 'travel', 'head', 'run']);
    this.synonyms.set('take', ['get', 'grab', 'pick', 'collect']);
    this.synonyms.set('drop', ['put', 'place', 'leave']);
    this.synonyms.set('look', ['examine', 'inspect', 'check', 'view', 'see']);
    this.synonyms.set('use', ['utilize', 'employ', 'apply']);
    this.synonyms.set('talk', ['speak', 'chat', 'converse']);
    this.synonyms.set('open', ['unlock', 'unseal']);
    this.synonyms.set('close', ['shut', 'seal', 'lock']);
    this.synonyms.set('help', ['assist', 'info', 'instructions']);
    this.synonyms.set('inventory', ['inv', 'items', 'carrying']);
  }

  private initializeDirections(): void {
    const directions = [
      'north', 'south', 'east', 'west', 'northeast', 'northwest', 
      'southeast', 'southwest', 'up', 'down', 'n', 's', 'e', 'w', 
      'ne', 'nw', 'se', 'sw', 'u', 'd'
    ];
    directions.forEach(dir => this.directions.add(dir));
  }

  private normalizeVerb(verb: string): string {
    verb = verb.toLowerCase();
    
    // Check direct synonyms
    const entries = Array.from(this.synonyms.entries());
    for (const [canonical, synonyms] of entries) {
      if (verb === canonical || synonyms.includes(verb)) {
        return canonical;
      }
    }
    
    return verb;
  }

  private expandDirections(input: string): string {
    const directionMap: Record<string, string> = {
      'n': 'north', 's': 'south', 'e': 'east', 'w': 'west',
      'ne': 'northeast', 'nw': 'northwest', 'se': 'southeast', 'sw': 'southwest',
      'u': 'up', 'd': 'down'
    };

    return input.replace(/\b(n|s|e|w|ne|nw|se|sw|u|d)\b/gi, (match) => {
      return directionMap[match.toLowerCase()] || match;
    });
  }

  public parseCommand(input: string): ICommand {
    if (!input || input.trim() === '') {
      return { verb: '' };
    }

    const cleanInput = input.trim().toLowerCase();
    const expandedInput = this.expandDirections(cleanInput);
    
    // Handle single direction commands
    if (this.directions.has(expandedInput)) {
      return {
        verb: 'go',
        object: expandedInput
      };
    }

    // Use compromise for natural language processing
    const doc = nlp(expandedInput);
    
    // Extract verbs
    const verbs = doc.verbs().out('array');
    const nouns = doc.nouns().out('array');
    const adjectives = doc.adjectives().out('array');
    
    // Handle special cases first
    if (cleanInput.includes('inventory') || cleanInput === 'i' || cleanInput === 'inv') {
      return { verb: 'inventory' };
    }
    
    if (cleanInput.includes('help') || cleanInput === '?') {
      return { verb: 'help' };
    }

    if (cleanInput.includes('quit') || cleanInput === 'q') {
      return { verb: 'quit' };
    }

    // Parse verb-object structure
    let verb = '';
    let object = '';
    let preposition = '';
    let indirectObject = '';

    if (verbs.length > 0) {
      verb = this.normalizeVerb(verbs[0]);
    } else if (nouns.length > 0 && this.directions.has(nouns[0])) {
      // Handle cases like "north" without "go"
      verb = 'go';
      object = nouns[0];
    }

    // Extract objects and prepositions
    const words = expandedInput.split(/\s+/);
    let foundVerb = false;
    let foundPreposition = false;
    const prepositions = ['with', 'to', 'on', 'in', 'at', 'from', 'using'];
    
    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      
      if (!foundVerb && (verbs.includes(word) || this.getSynonymVerb(word))) {
        foundVerb = true;
        continue;
      }
      
      if (foundVerb && !foundPreposition && prepositions.includes(word)) {
        preposition = word;
        foundPreposition = true;
        continue;
      }
      
      if (foundVerb && !foundPreposition && !object && word !== 'the' && word !== 'a' && word !== 'an') {
        object = word;
      } else if (foundPreposition && !indirectObject && word !== 'the' && word !== 'a' && word !== 'an') {
        indirectObject = word;
      }
    }

    // Handle compound objects (e.g., "bird cage")
    if (nouns.length > 1 && !object) {
      object = nouns.join(' ');
    } else if (!object && nouns.length > 0) {
      object = nouns[0];
    }

    // Include adjectives in object description
    if (adjectives.length > 0 && object) {
      const adjective = adjectives.find((adj: string) => expandedInput.includes(adj));
      if (adjective && !object.includes(adjective)) {
        object = `${adjective} ${object}`;
      }
    }

    return {
      verb: verb || 'unknown',
      object: object || undefined,
      preposition: preposition || undefined,
      indirectObject: indirectObject || undefined
    };
  }

  private getSynonymVerb(word: string): string | null {
    const entries = Array.from(this.synonyms.entries());
    for (const [canonical, synonyms] of entries) {
      if (synonyms.includes(word)) {
        return canonical;
      }
    }
    return null;
  }

  public getAvailableCommands(): string[] {
    return [
      'go [direction] - Move in a direction (north, south, east, west, etc.)',
      'look / examine [object] - Look around or examine something',
      'take / get [object] - Pick up an item',
      'drop [object] - Drop an item from inventory',
      'use [object] - Use an item',
      'talk [npc] - Talk to a character',
      'inventory / i - Show your inventory',
      'help - Show this help message',
      'quit - Exit the game'
    ];
  }
}