import { _decorator, Component, Label } from 'cc';
import { nonNull } from './utils';
const { ccclass, property } = _decorator;

@ccclass('GameUI')
export class GameUI extends Component {
  @property({ type: Label })
  private scoreLabel?: Label;

  public onEnable(): void {
    this.setScore();
    setInterval(() => this.addScore(1), 100);
  }

  public get score(): number {
    try {
      const value = parseInt(nonNull(this.scoreLabel).string);
      if (!Number.isNaN(value)) {
        return value;
      }
    } catch (_) {
      // Ignored
    }
    return 0;
  }

  public setScore(value = 0): void {
    if (value < 0 || value >= 1e6) {
      return this.setScore(0);
    }
    if (this.scoreLabel) {
      this.scoreLabel.string = value.toString();
    }
  }

  public addScore(value: number): void {
    this.setScore(this.score + value);
  }
}
