import { Point } from 'ts-geo';

export function getCursorPositionInViewport(event: MouseEvent) {
	return new Point(event.offsetX, event.offsetY);
}

export enum MouseButton { LEFT = 0, PRIMARY = 0, SECONDARY = 2, RIGHT = 2,
		AUXILIARY = 4, MIDDLE = 4, BUTTON4 = 8, BACK = 8, BUTTON5 = 16, FORWARD = 16 }
