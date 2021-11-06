import { sys, view } from 'cc';
import _ from 'lodash';

export interface Position {
  x: number;
  y: number;
}

export const nonNull = <T>(value: T | null | undefined): T => {
  if (_.isNull(value) || _.isUndefined(value)) {
    throw new Error('Expect are not null/undefined');
  }
  return value;
};

export const registerOnReSized = (listener: () => void): void => {
  if (sys.isMobile) {
    window.addEventListener('resize', listener);
  } else {
    view.on('canvas-resize', listener, this);
  }
  listener.apply(null);
};

export const rad2Reg = (value: number): number => {
  return (value * 180) / Math.PI;
};

export const reg2Rad = (value: number): number => {
  return value / rad2Reg(1);
};

export const getAngle = (a: Position, b: Position): number => {
  return rad2Reg(Math.atan2(b.y - a.y, b.x - a.x));
};

export const computePosition = (o: Position, angle: number, n: number): Position => {
  return {
    x: Math.cos(reg2Rad(angle)) * n + o.x,
    y: Math.sin(reg2Rad(angle)) * n + o.y,
  };
};
