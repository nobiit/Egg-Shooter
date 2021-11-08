import type { EventTouch } from 'cc';
import { Canvas } from 'cc';
import { UITransform } from 'cc';
import { _decorator, Component, Node, Sprite, SpriteFrame } from 'cc';
import _ from 'lodash';
import { EggStack } from './egg_stack';
import type { Position } from './utils';
import { computePosition, getAngle, nonNull } from './utils';
const { ccclass, property } = _decorator;

@ccclass('Slingshot')
export class Slingshot extends Component {
  @property({ type: SpriteFrame })
  private readonly arrowHead?: SpriteFrame;

  @property({ type: SpriteFrame })
  private readonly arrowBody?: SpriteFrame;

  private eggStack!: EggStack;
  private egg!: Node;
  private isDragging = false;
  private eggLines: Position[] = [];

  public onLoad(): void {
    const parent = nonNull(this.node.parent);
    this.eggStack = nonNull(parent.getComponentInChildren(EggStack));
  }

  public start(): void {
    this.egg = new Node();
    this.egg.parent = this.node;
    this.egg.layer = this.egg.parent.layer;
    this.egg.addComponent(Sprite);
    this.reset();
    const parent = nonNull(this.node.parent);
    parent.on(Node.EventType.TOUCH_START, this.startDrag.bind(this));
    parent.on(Node.EventType.TOUCH_END, this.stopDrag.bind(this));
    parent.on(Node.EventType.TOUCH_MOVE, this.moveDrag.bind(this));
  }

  public update(): void {
    if (this.eggLines.length) {
      const p = nonNull(this.eggLines.shift());
      this.egg.setWorldPosition(p.x, p.y, 0);
    }
  }

  protected reset(): void {
    this.egg.setPosition(0, 15);
    const sprite = nonNull(this.egg.getComponent(Sprite));
    const eggType = this.eggStack.randomEggType();
    const spriteFrame = _.get(this.eggStack.spriteFrames, eggType) as SpriteFrame | null;
    if (!spriteFrame) {
      return void setTimeout(() => this.reset(), 100);
    }
    sprite.spriteFrame = spriteFrame;
  }

  protected startDrag(e?: EventTouch): void {
    this.isDragging = true;
    this.egg.setPosition(0, -50);
    this.eggStack.startTimer();
    if (e) {
      return this.moveDrag(e);
    }
  }

  protected stopDrag(e: EventTouch): void {
    this.isDragging = false;
    const location = e.getUILocation();
    const o = this.node.getWorldPosition();
    const angle = getAngle(o, location);
    if (this.isAcceptAngle(angle)) {
      this.eggLines = this.buildLineForEgg(o.x, o.y, angle);
    }
  }

  protected moveDrag(e: EventTouch): void {
    if (this.isDragging) {
      const location = e.getUILocation();
      const o = this.node.getWorldPosition();
      const angle = getAngle(o, location);
      if (this.isAcceptAngle(angle)) {
        const p = computePosition(o, angle, -65);
        this.egg.setWorldPosition(p.x, p.y, 0);
      }
    }
  }

  protected isAcceptAngle(value: number): boolean {
    return 20 <= value && value <= 160;
  }

  protected get max_y(): number {
    let node = this.node;
    while (node.parent) {
      if (node.getComponent(Canvas)) {
        break;
      }
      node = node.parent;
    }
    return nonNull(node.getComponent(UITransform)).height;
  }

  protected buildLineForEgg(x: number, y: number, angle: number): Position[] {
    const items = [];
    const ox = this.node.getWorldPosition().x;
    const on = nonNull(this.node.getComponent(UITransform)).width + this.eggStack.eggItemSize;
    let p: Position = { x, y };
    let i = 0;
    while (p.y < this.max_y) {
      i += 1;
      p = computePosition(p, angle, i);
      items.push(p);
      if (this.eggStack.isCollision(p)) {
        break;
      }
      if (p.x < ox - on || p.x > ox + on) {
        angle = angle + 90 * (angle < 90 ? 1 : -1);
      }
    }
    return items;
  }
}
