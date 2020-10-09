import { ChangeDetectorRef, Component, ElementRef, EventEmitter, HostListener, Input, OnInit, Output, ViewChild } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { ContextMenuComponent, ContextMenuService } from 'ngx-contextmenu';
import { Point, watch, PointUtils, Projection, ZoomLevel } from 'ts-geo';
import { BaseLayerComponent } from './base-layer.component';
import { GpsTracker } from './GpsTracker';
import { Tracker } from './Tracker';

export enum MouseButton { LEFT, MIDDLE, RIGHT }

@Component({
	selector: 'map-controls',
	templateUrl: './controls.component.html',
	styleUrls: ['./controls.component.scss']
})
export class ControlsComponent extends BaseLayerComponent implements OnInit {

	ZoomLevel = ZoomLevel;

	constructor(cdr: ChangeDetectorRef, host: ElementRef, projection: Projection,
			public readonly tracker: Tracker,
			public readonly contextMenuService: ContextMenuService,
			private clipboard: Clipboard) {
		super(cdr, host, projection);
	}

	navExpanded: boolean;

	@ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

	@HostListener("contextmenu", ['$event'])
	public showContextMenu(event: MouseEvent): void {
		const p = this.getCoordinatesForViewportPosition(this.getCursorPositionInViewport(event));
		this.contextMenuService.show.next({
			// Optional - if unspecified, all context menu components will open
			contextMenu: this.contextMenu,
			event: event,
			item: p
		});
		event.preventDefault();
		event.stopPropagation();
	}

	public copyToClipboard(c: Coordinates) {
		this.clipboard.copy(`${c.latitude}, ${c.longitude}`);
	}

	ngOnInit() {
		this.startFollowMe();
	}

	public trackError: any;

	private startFollowMe() {
		this.tracker.start().subscribe(coordinates => {
			this.myPosition = coordinates;
			if (!this.myPosition) {
				this.trackError = "Location unavailable";
				return;
			}
			delete this.trackError;
			if (this.autoCenter) {
				this.center = coordinates;
			}
		}, (error) => this.trackError = error);
	}

	public myPosition: Coordinates;

	public get myPositionAsCSS(): string {
		return this.getViewportPositionAsCSS(this.myPosition);
	}

	private _autoCenter: boolean;

	get autoCenter(): boolean {
		return this._autoCenter;
	}

	@Input("autoCenter") set autoCenter(value: boolean) {
		if (this._autoCenter === value) {
			return;
		}
		this._autoCenter = value;
		this.autoCenterChange.emit(value);
		if (this._autoCenter && !this.myPosition) {
			this.center = this.myPosition;
		}
	}

	@Output("autoCenterChange") autoCenterChange = new EventEmitter<boolean>();

	@HostListener('mousewheel', ['$event'])
	handleWheel(event: WheelEvent) {
		const zoomDelta = Math.sign(-event.deltaY) * Math.round(Math.max(Math.abs(event.deltaY), 300) / 300);

		// move center only if zoom in
		if (zoomDelta > 0  && !this.autoCenter) {
			const d = PointUtils.delta(new Point(this.width / 2, this.height / 2), this.getCursorPositionInViewport(event));
			this.moveCenterByPx(d);
		}

		this.zoom += zoomDelta;
	}

	private getCursorPositionInViewport(event: MouseEvent) {
		return new Point(event.offsetX, event.offsetY);
	}

	private startDragPoint: Point;
	public startDragCoordinates: Partial<Coordinates>;
	public cursorCoordinates: Partial<Coordinates>;

	@HostListener("mousemove", ["$event"])
	handleMove(event: DragEvent) {
		this.cursorCoordinates = this.getCoordinatesForViewportPosition(this.getCursorPositionInViewport(event));
	}

	@HostListener("mousedown", ["$event"])
	handleDragStart(event: DragEvent) {
		this.startDragPoint = this.getCursorPositionInViewport(event);
		this.startDragCoordinates =  this.getCoordinatesForViewportPosition(this.startDragPoint);
	}

	@HostListener("mouseup", ["$event"])
	handleDragEnd(event: DragEvent) {
		const endDragPoint = this.getCursorPositionInViewport(event);
		const delta = PointUtils.delta(endDragPoint, this.startDragPoint);
		switch (event.button) {
			case MouseButton.LEFT:
				this.moveCenterByPx(delta);
				break;
			case MouseButton.MIDDLE:
				// TODO rotate
				break;
		}
		delete this.startDragPoint;
		delete this.startDragCoordinates;
	}

	private moveCenterByPx(delta: Point) {
		if (delta.x === 0 && delta.y === 0) {
			return;
		}
		let centerPx = this.projection.toScreen(this.center, this.zoom);
		centerPx = PointUtils.add(centerPx, delta);
		this.autoCenter = false;
		this.center = Object.assign({}, this.center, this.projection.toGeo(centerPx, this.zoom));
	}

}
