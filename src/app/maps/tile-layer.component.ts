import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { range } from "lodash-es";
import { BoundingBox, Point, PointUtils, TileSource } from "ts-geo";
import { BaseLayerComponent } from './base-layer.component';

@Component({
	selector: 'map-tile-layer',
	templateUrl: './tile-layer.component.html',
	styleUrls: ['./tile-layer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class TileLayerComponent extends BaseLayerComponent implements OnInit {
	previousZoom: number;
	previousTiles: {xTiles: {}, yTiles: {}};
	private temporaryScale;

	ngOnInit() {
		this.beforeZoomChange.subscribe((newZoom: number) => {
			this.previousZoom = this.zoom;
			this.previousTiles = {xTiles: this.xTiles, yTiles: this.yTiles};
			this.temporaryScale = Math.pow(2, newZoom - this.zoom);
			this.cdr.markForCheck();
		});
	}

	public get temporaryScaleAsCSS(): string {
		return `scale(${this.temporaryScale})`;
	}

	@Input("source") source: TileSource;

	private centerOfTilesInPx(startTile: number, endTile: number): number {
		return (startTile + (endTile - startTile + 1) / 2) * this.source.tileSize;
	}

	private get centerTileInPx(): Point {
		const bounds = this.bounds;
		return { x: this.centerOfTilesInPx(bounds.left, bounds.right),
				y: this.centerOfTilesInPx(bounds.top, bounds.bottom) };
	}

	private get translateCenter(): Point {
		return PointUtils.delta(this.mapCenterInPx, this.centerTileInPx);
	}

	public get translateCenterAsCSS(): string {
		let d = this.translateCenter;
		d = { x: d.x - this.offsetTile * this.source.tileSize,
				y: d.y - this.offsetTile * this.source.tileSize };
		return `translate(${d.x}px, ${d.y}px)`;
	}

	private offsetTile = 1;

	public get bounds(): BoundingBox {
		const bounds = BoundingBox.getBBoxInTilesForMapViewport(this.projection, this.center, this.zoom,
				this.width, this.height,
				this.source.tileSize);
		bounds.top -= this.offsetTile;
		bounds.left -= this.offsetTile;
		bounds.bottom += this.offsetTile;
		bounds.right += this.offsetTile;
		return bounds;
	}

	public get xTiles(): number[] {
		return this.range(this.bounds.left, this.bounds.right);
	}

	public get yTiles(): number[] {
		return this.range(this.bounds.top, this.bounds.bottom);
	}

	public range(from: number, to: number) {
		return range(from, to + 1);
	}
}
