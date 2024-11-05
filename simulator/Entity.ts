import { type Position } from "./Position";
import { type VisualEvent, VisualEventType } from "./VisualEvent";

export enum EntityType {
  Box,
  Landmine,
  Player,
  Rock,
  Zombie,
}

export abstract class Entity {
  protected destructible: boolean;
  protected health: number;
  protected position: Position;
  protected type: EntityType;
  protected visualEvents: VisualEvent[] = [];

  public abstract getToken(): string;

  public constructor(
    type: EntityType,
    destructible: boolean,
    health: number,
    position: Position,
  ) {
    this.destructible = destructible;
    this.health = health;
    this.position = position;
    this.type = type;
  }

  public addVisualEvent(visualEvent: VisualEvent): void {
    this.visualEvents.push(visualEvent);
  }

  public clearVisualEvents(): void {
    this.visualEvents = [];
  }

  public dead(): boolean {
    return this.health === 0;
  }

  public die(): void {
    this.health = 0;
  }

  public getVisualEvent<T extends VisualEventType>(type: T) {
    const visualEvent = this.visualEvents.find(
      (visualEvent) => visualEvent.type === type,
    );

    if (visualEvent === undefined) {
      throw new Error("Unable to find visual event of this type");
    }

    return visualEvent as Extract<VisualEvent, { type: T }>;
  }

  public getChanges(): VisualEvent[] {
    return this.visualEvents;
  }

  public getPosition(): Position {
    return this.position;
  }

  public getDisplayName(): string {
    return "";
  }

  public getPositionId(): string {
    return `${this.position.x}.${this.position.y}`;
  }

  public getPositionAsNumber(): number {
    return this.position.x + this.position.y;
  }

  public getType(): EntityType {
    return this.type;
  }

  public hasVisualEvent(type: VisualEventType): boolean {
    return this.visualEvents.some((visualEvent) => visualEvent.type === type);
  }

  public hasVisualEvents(): boolean {
    return this.visualEvents.length !== 0;
  }

  public hit() {
    if (!this.destructible) {
      return;
    }

    const initialHealth = this.health;
    this.health--;

    if (initialHealth !== 0 && this.health === 0) {
      this.addVisualEvent({ type: VisualEventType.Destructured });
    } else if (initialHealth !== this.health) {
      this.addVisualEvent({ type: VisualEventType.Hit });
    }
  }

  public getHealth(): number {
    return this.health;
  }

  public isDestructible(): boolean {
    return this.destructible;
  }

  public moveTo(position: Position) {
    const initialPosition = { ...this.position };
    this.position = position;

    this.addVisualEvent({
      type: VisualEventType.Moving,
      from: initialPosition,
      to: this.position,
    });
  }
}
