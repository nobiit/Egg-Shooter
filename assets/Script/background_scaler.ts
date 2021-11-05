import type { Size } from 'cc';
import { _decorator, view, size, Component, Sprite, UITransform } from 'cc';
import lodashDecorators from 'lodash-decorators';
import { nonNull, registerOnReSized } from './utils';
const { ccclass } = _decorator;
const { Bind } = lodashDecorators;

@ccclass('BackgroundScaler')
export class BackgroundScaler extends Component {
  private sprite?: Sprite;

  @Bind()
  protected onResized(): void {
    const width = this.deviceSize.width * this.scale;
    const height = this.deviceSize.height * this.scale;
    this.uiTransform.setContentSize(width, height);
  }

  public start(): void {
    this.sprite = nonNull(this.getComponent(Sprite));
    return registerOnReSized(this.onResized.bind(this));
  }

  protected get uiTransform(): UITransform {
    return nonNull(this.node.getComponent(UITransform));
  }

  protected get spriteSize(): Size {
    const { width, height } = nonNull(nonNull(this.sprite).spriteFrame);
    return size(width, height);
  }

  protected get deviceSize(): Size {
    return view.getFrameSize();
  }

  protected get scale(): number {
    return this.spriteSize.width / this.deviceSize.width;
  }
}
