import { ChangeDetectorRef, Directive, ElementRef, EventEmitter, HostBinding, Input, Output } from "@angular/core";
import { BoundingBox, Point, PointUtils, Projection, ZoomLevel } from "ts-geo";

@Directive()
export abstract class BaseLayerComponent {
	constructor(public readonly cdr: ChangeDetectorRef,
			public readonly host: ElementRef, public readonly projection: Projection) {
	}

	private _heading: number;

	@HostBinding("style.transform")
	public get headingAsCSS(): string {
		return `rotate(${this._heading}deg)`;
	}

	public get heading(): number {
		return this._heading;
	}

	@Input("heading") public set heading(value: number) {
		if (this._heading === value) {
			return;
		}
		this._heading = value % 360;
		this.cdr.markForCheck();
		this.headingChange.emit(value);
	}

	@Output("headingChange") headingChange = new EventEmitter<number>();

	private _center: Coordinates = {latitude: 45.617843, longitude: 25.694046,
			accuracy: 0,
			altitude: 650,
			altitudeAccuracy: 0,
			heading: 0,
			speed: 0
			};

	public get center(): Coordinates {
		return this._center;
	}

	@Input("center") public set center(value: Coordinates) {
		if (!value) {
			return;
		}
		if (this._center?.latitude === value?.latitude && this._center?.longitude === value?.longitude) {
			return;
		}
		this._center = value;
		this.cdr.markForCheck();
		this.centerChange.emit(value);
	}

	@Output("centerChange") centerChange = new EventEmitter<Coordinates>();

	private _zoom = ZoomLevel.CITY;

	public get zoom(): number {
		return this._zoom;
	}

	@Input("zoom") public set zoom(value: number) {
		value = ZoomLevel.clip(value);
		this.beforeZoomChange.emit(value);
		if (this._zoom === value) {
			return;
		}
		this._zoom = value;
		this.cdr.markForCheck();
		this.zoomChange.emit(value);
	}

	@Output("beforeZoomChange") beforeZoomChange = new EventEmitter<number>();

	@Output("zoomChange") zoomChange = new EventEmitter<number>();

	@HostBinding("style.opacity") opacity: number;

	public getMapPositionInPx(c: Coordinates): Point {
		return this.projection.toScreen(c, this.zoom);
	}

	public getViewportPositionInPx(p: Point | Coordinates): Point {
		if (p instanceof Point) {
			return PointUtils.add(this.viewportCenterInPx, PointUtils.delta(this.mapCenterInPx, p));
		}
		if (p.latitude) {
			return this.getViewportPositionInPx(this.getMapPositionInPx(p));
		}
	}

	public getViewportPositionAsCSS(position: Coordinates): string {
		if (!position) {
			return "display: none";
		}
		const p = this.getViewportPositionInPx(position);
		return `left: ${p.x}px; top: ${p.y}px`;
	}

	public getCoordinatesForViewportPosition(p: Point): Partial<Coordinates> {
		return this.projection.toGeo(PointUtils.add(PointUtils.delta(this.viewportCenterInPx, p), this.mapCenterInPx), this.zoom);
	}

	protected get viewportCenterInPx(): Point {
		return new Point(this.width / 2, this.height / 2);
	}

	protected get mapCenterInPx(): Point {
		return this.getMapPositionInPx(this.center);
	}

	protected get coordinatesBBox(): BoundingBox {
		return BoundingBox.getBBoxCoordinaterForMapViewport(this.projection, this.center, this.zoom, this.width, this.height);
	}

	public get width(): number {
		return this.host.nativeElement.offsetWidth;
	}

	public get height(): number {
		return this.host.nativeElement.offsetHeight;
	}
}
