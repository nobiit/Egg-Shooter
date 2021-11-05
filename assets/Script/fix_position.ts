import type { Size } from 'cc';
import { _decorator, Component, Node, Canvas, view, size, UITransform } from 'cc';
import lodashDecorators from 'lodash-decorators';
import { nonNull, registerOnReSized } from './utils';
const { ccclass, property } = _decorator;
const { Bind, Memoize } = lodashDecorators;

@ccclass('FixPosition')
export class FixPosition extends Component {
  @property({ type: Node })
  private readonly score?: Node;

  @property({ type: Node })
  private readonly footer?: Node;

  @property({ type: Node })
  private readonly eggStack?: Node;

  @property({ type: Node })
  private readonly rope?: Node;

  @Bind()
  protected onResized(): void {
    this.fixPositionScore();
    this.fixPositionFooter();
    this.fixPositionEggStack();
    this.fixPositionRope();
  }

  @Memoize()
  private getScorePositionY(): number {
    return nonNull(this.score).position.y;
  }

  @Memoize()
  private getRopePositionY(): number {
    return nonNull(this.rope).position.y;
  }

  public start(): void {
    return registerOnReSized(this.onResized.bind(this));
  }

  protected get canvas(): Canvas {
    return nonNull(this.getComponent(Canvas));
  }

  protected get canvasSize(): Size {
    const { width, height } = nonNull(this.canvas.getComponent(UITransform));
    return size(width, height);
  }

  protected get deviceSize(): Size {
    return view.getFrameSize();
  }

  protected get scale(): number {
    return this.canvasSize.x / this.deviceSize.x;
  }

  protected get delta_y(): number {
    return (this.deviceSize.y * this.scale - this.canvasSize.y) / 2;
  }

  protected fixPositionScore(): void {
    if (this.score) {
      this.score.setPosition(this.score.position.x, this.getScorePositionY() + this.delta_y);
    }
  }

  protected fixPositionFooter(): void {
    if (this.footer) {
      this.footer.setPosition(this.footer.position.x, -this.delta_y);
    }
  }

  protected fixPositionEggStack(): void {
    if (this.eggStack) {
      const uiTransform = nonNull(this.eggStack.getComponent(UITransform));
      const height = uiTransform.height + this.delta_y * 2;
      uiTransform.setContentSize(uiTransform.width, height);
    }
  }

  protected fixPositionRope(): void {
    if (this.rope) {
      this.rope.setPosition(this.rope.position.x, this.getRopePositionY() - this.delta_y);
    }
  }
}
