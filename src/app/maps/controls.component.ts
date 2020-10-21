import { Clipboard } from "@angular/cdk/clipboard";
import {
	ChangeDetectorRef,
	Component,
	ElementRef,
	EventEmitter,
	HostListener,
	Input,
	OnInit,
	Output,
	ViewChild
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { ContextMenuComponent, ContextMenuService } from "ngx-contextmenu";
import { Subscription } from "rxjs";
import { Point, PointUtils, Projection, Provider, ZoomLevel } from "ts-geo";

import { BaseLayerComponent } from "./base-layer.component";
import { getCursorPositionInViewport, MouseButton } from "./browser";
import { Tracker } from "./Tracker";


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
			private readonly clipboard: Clipboard,
			private readonly router: Router,
			private readonly activatedRoute: ActivatedRoute) {
		super(cdr, host, projection);
	}

	navExpanded: boolean;

	@ViewChild(ContextMenuComponent) public contextMenu: ContextMenuComponent;

	ngOnInit() {
		this.startFollowMe();
	}

	private paramsSubscription: Subscription;
	private centerSubscription: Subscription;
	private zoomSubscription: Subscription;

	public get syncUrl(): boolean {
		return this.paramsSubscription && !this.paramsSubscription.closed;
	}

	@Input("syncUrl") public set syncUrl(value: boolean) {
		if (value && !this.paramsSubscription) {
			this.paramsSubscription = this.activatedRoute.params.subscribe((params) => {
				this.updateFromUri(params);
			});
			this.updateFromUri(this.activatedRoute.snapshot.params);

			this.centerSubscription = this.centerChange.subscribe(() => this.updateUri());
			this.zoomSubscription = this.zoomChange.subscribe(() => this.updateUri());
		}
		if (!value) {
			this.stop(this.paramsSubscription);
			delete this.paramsSubscription;
			this.stop(this.centerSubscription);
			delete this.centerSubscription;
			this.stop(this.zoomSubscription);
			delete this.zoomSubscription;
		}
		this.syncUrlChange.emit(value);
	}

	@Output("syncUrlChange") syncUrlChange = new EventEmitter<boolean>();

	private stop(subscription: Subscription) {
		if (subscription && !subscription.closed) {
			subscription.unsubscribe();
		}
	}

	private updateUri() {
		if (!this.syncUrl) {
			return;
		}
		if ((typeof this.zoom === "undefined") || (typeof this.center === "undefined")) {
			return;
		}
		this.router.navigate(["/", this.zoom, this.center.latitude, this.center.longitude]);
	}

	private updateFromUri(params: Params) {
		if (!this.syncUrl) {
			return;
		}
		if ((typeof params.zoom === "undefined") || (typeof params.latitude === "undefined") || (typeof params.longitude === "undefined")) {
			return;
		}
		this.zoom = params.zoom;
		this.center = {latitude: params.latitude, longitude: params.longitude};
	}

	@HostListener("contextmenu", ['$event'])
	public showContextMenu(event: MouseEvent): void {
		if (event.target !== this.host.nativeElement) {
			return;
		}
		const p = this.getCoordinatesForViewportPosition(getCursorPositionInViewport(event));
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
		const zoomDelta = event.deltaY * -0.01;

		// move center only if zoom in
		if (zoomDelta > 0  && !this.autoCenter) {
			const d = PointUtils.delta(new Point(this.width / 2, this.height / 2), getCursorPositionInViewport(event));
			this.moveCenterByPx(d);
		}

		this.zoom += zoomDelta;
	}

	private startDragPoint: Point;
	public startDragCoordinates: Partial<Coordinates>;
	public cursorCoordinates: Partial<Coordinates>;

	@HostListener("mousemove", ["$event"])
	handleMove(event: DragEvent) {
		if (event.target !== this.host.nativeElement) {
			return;
		}
		this.cursorCoordinates = this.getCoordinatesForViewportPosition(getCursorPositionInViewport(event));
	}

	@HostListener("mouseleave")
	handleMoveleave() {
		delete this.cursorCoordinates;
	}

	@HostListener("mousedown", ["$event"])
	handleDragStart(event: DragEvent) {
		if (event.target !== this.host.nativeElement) {
			return;
		}
		this.startDragPoint = getCursorPositionInViewport(event);
		this.startDragCoordinates =  this.getCoordinatesForViewportPosition(this.startDragPoint);
	}

	@HostListener("mouseup", ["$event"])
	handleDragEnd(event: DragEvent) {
		if (event.target !== this.host.nativeElement) {
			return;
		}
		const endDragPoint = getCursorPositionInViewport(event);
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

	@Input("providers") providers: Provider[];

}
