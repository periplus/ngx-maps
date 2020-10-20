import { CdkDragDrop, moveItemInArray, transferArrayItem } from "@angular/cdk/drag-drop";
import { Component, EventEmitter, Input, Output } from "@angular/core";
import { POISource, TileSource } from "ts-geo";

export class SourceConfig {
	constructor(public name: string) {}
	public disabled: boolean;
}

export class TileSourceConfig extends SourceConfig {
	public opacity = 1;
}

export class MapConfigSources<T extends SourceConfig> extends Array<T> {
	forName(name: string): T {
		return this.find(c => c.name === name);
	}
}

export class MapConfig {
	autoCenter: boolean;
	syncUrl: boolean;
	center: Partial<Coordinates>;
	zoom: number;
	navExpanded: boolean;
	sources = {
			poi: new MapConfigSources<SourceConfig>(),
			tile: new MapConfigSources<TileSourceConfig>()
			};
	geoRef = {
		show: true,
		disable: false
	};
}

@Component({
	selector: 'map-config',
	templateUrl: './map-config.component.html',
	styleUrls: ['./map-config.component.scss']
})
export class MapConfigComponent {

	@Input("config") config: MapConfig;

	@Input("tileSources") tileSources: TileSource[];

	@Input("poiSources") poiSources: POISource[];

	@Output("change") change = new EventEmitter<MapConfig>();

	drop(event: CdkDragDrop<string[]>) {
		if (event.previousContainer === event.container) {
			moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
		} else {
			transferArrayItem(event.previousContainer.data, event.container.data,
					event.previousIndex, event.currentIndex);
		}
	}

	toggle(sourceConfig: SourceConfig) {
		sourceConfig.disabled = !sourceConfig.disabled;
		if (sourceConfig instanceof TileSourceConfig && sourceConfig.opacity === 0) {
			sourceConfig.opacity = 1;
		}
		this.change.emit(this.config);
	}

	public disableIfNoOpacity(sourceConfig: TileSourceConfig) {
		if (sourceConfig.opacity === 0) {
			sourceConfig.disabled = true;
		}
		this.change.emit(this.config);
	}

	public addSource(source: POISource | TileSource) {
		const sourcesConfig = (<any>source).get instanceof Function ? this.config.sources.poi : this.config.sources.tile;
		let sourceConfig = sourcesConfig.forName(source.name);
		if (!sourceConfig) {
			sourceConfig = new SourceConfig(source.name);
			sourcesConfig.push(sourceConfig);
		}
		sourceConfig.disabled = false;
		this.change.emit(this.config);
	}
}
