import { Pipe, PipeTransform } from '@angular/core';
import { Point, tileUrl } from "ts-geo";
import { TileLayerComponent } from './tile-layer.component';

@Pipe({ name: "tileUrl" })
export class TileUrlPipe implements PipeTransform {
	constructor(public readonly host: TileLayerComponent) {
	}

	transform(point: Point, zoom?: number): string {
		return tileUrl(this.host.source, point, typeof zoom !== "undefined" ? zoom : this.host.zoom);
	}
}
