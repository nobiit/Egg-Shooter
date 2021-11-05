import { _decorator, Component, Node, resources, SpriteFrame, UITransform, Sprite, Canvas } from 'cc';
import _, { first, range } from 'lodash';
import type { Position } from './utils';
import { nonNull } from './utils';
const { ccclass } = _decorator;

@ccclass('EggStack')
export class EggStack extends Component {
  public spriteFrames: SpriteFrame[] = [];
  public readonly countOfEggType = 16;
  public readonly eggItemSize = 64;
  public readonly data: number[][] = [];
  private maxEggType = 0;
  private nodes: Node[][] = [];
  private timer?: number;

  public onLoad(): void {
    this.preloadResources();
  }

  public start(): void {
    this.nodes = this.createGrid(this.node);
    this.maxEggType = 3;
    this.loadSpriteFrames();
    this.addRow(5);
  }

  public startTimer(): void {
    this.timer = setInterval(() => this.addRow(), 15 * 1000);
  }

  public destroy(): boolean {
    clearInterval(this.timer);
    return super.destroy();
  }

  public update(): void {
    for (const y of _.keys(this.data)) {
      for (const x of _.keys(_.get(this.data, y))) {
        const _y = this.rows - this.data.length + ~~y;
        const node = _.get(this.nodes, [_y, x]) as Node;
        const sprite = nonNull(node.getComponent(Sprite));
        const v = _.get(this.data, [y, x]) as number;
        sprite.spriteFrame = this.spriteFrames[v];
      }
    }
  }

  public randomEggType(): number {
    let types = _.range(1, this.maxEggType + 1);
    types = _.flatMap(types, (x) => Array(this.countOfEggType - x).fill(x) as number[]);
    return nonNull(_.sample(types));
  }

  public isCollision(p: Position): boolean {
    return false;
    // TODO: Kiểm tra xem có chạm với 1 quả bóng đã tồn tại hay chưa
    for (const items of this.nodes) {
      const firstItem = items.find((x) => x.getComponent(Sprite)?.spriteFrame);
      if (firstItem && firstItem.position.y <= p.y && firstItem.position.y + this.eggItemSize >= p.y) {
        console.log(firstItem.position.x, firstItem.position.y);
        return true;
      }
    }
    return false;
  }

  protected get uiTransform(): UITransform {
    return nonNull(this.node.getComponent(UITransform));
  }

  protected get canvas(): Canvas {
    let node = this.node;
    while (node.parent) {
      if (node.getComponent(Canvas)) {
        break;
      }
      node = node.parent;
    }
    return nonNull(node.getComponent(Canvas));
  }

  protected get rows(): number {
    return Math.floor(this.uiTransform.height / this.eggItemSize);
  }

  protected get columns(): number {
    return Math.floor(this.uiTransform.width / this.eggItemSize);
  }

  protected get isFull(): boolean {
    return this.data.length >= this.rows;
  }

  protected preloadResources(): void {
    for (let i = 1; i <= this.countOfEggType; i++) {
      resources.preload(`egg/egg_${i}/spriteFrame`, SpriteFrame);
    }
  }

  protected addRow(rows = 2, funcValue: () => number = (): number => this.randomEggType()): void {
    if (!this.isFull) {
      for (let i = 0; i < rows; i++) {
        this.data.push(
          Array(this.columns - (this.data.length % 2))
            .fill(null)
            .map(funcValue),
        );
      }
    }
  }

  protected createGrid(parent: Node): Node[][] {
    const nodes: Node[][] = [];
    for (const y of _.range(this.rows)) {
      const row = new Node();
      row.parent = parent;
      row.layer = row.parent.layer;

      const items: Node[] = [];
      for (const x of _.range(this.columns)) {
        const item = new Node();
        item.parent = row;
        item.layer = item.parent.layer;
        let px = ~~x * this.eggItemSize - this.uiTransform.width / 2 + this.eggItemSize / 2;
        const py = ~~y * this.eggItemSize - this.uiTransform.height / 2 + this.eggItemSize / 2;
        if (~~y % 2) {
          px += this.eggItemSize / 2;
        }
        item.setPosition(px, py);
        item.addComponent(Sprite);
        items.push(item);
      }
      nodes.push(items);
    }
    return nodes;
  }

  protected loadSpriteFrames(): void {
    for (let i = 1; i <= this.countOfEggType; i++) {
      resources.load(`egg/egg_${i}/spriteFrame`, SpriteFrame, (err, res) => {
        if (err) {
          throw err;
        }
        this.spriteFrames[i] = res;
      });
    }
  }
}
