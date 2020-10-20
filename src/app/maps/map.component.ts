import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, Inject, InjectionToken, Input, ViewChild } from "@angular/core";
import { DEFAULT_TILE_SOURCE, Projection, TileSource, POISource, Provider } from 'ts-geo';

import { BaseLayerComponent } from "./base-layer.component";
import { ControlsComponent } from './controls.component';
import { MapConfig, SourceConfig, TileSourceConfig } from './map-config.component';
import { MapConfigSerializer } from './MapConfigSerializer';

export const TILE_SOURCES = new InjectionToken("TILE_SOURCES");
export const POI_SOURCES = new InjectionToken("POI_SOURCES");

@Component({
	selector: "ngx-map",
	templateUrl: "./map.component.html",
	styleUrls: ["./map.component.scss"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class MapComponent extends BaseLayerComponent {

	private _controls: ControlsComponent;

	@ViewChild(ControlsComponent) set controls(controls: ControlsComponent) {
		this._controls = controls;
		this._controls.navExpanded = this.config.navExpanded;
	}

	constructor(cdr: ChangeDetectorRef, host: ElementRef, projection: Projection,
			public readonly configSerializer: MapConfigSerializer,
			@Inject(TILE_SOURCES) public readonly tileSources: TileSource[],
			@Inject(POI_SOURCES) public readonly poiSources: POISource[]) {
		super(cdr, host, projection);
		this.tileSources = this.tileSources.map(source =>
				Object.assign({}, DEFAULT_TILE_SOURCE, source));

		this.loadConfig();
	}

	@Input("config") config: MapConfig;

	public get enabledPoiSources(): POISource[] {
		if (!this.config) {
			return undefined;
		}
		return this.poiSources.filter(source => !this.config.sources.poi.forName(source.name)?.disabled);
	}

	public get enabledTileSources(): TileSource[] {
		if (!this.config) {
			return undefined;
		}
		return this.config.sources.tile.filter(c => !c.disabled).map(c =>
				this.tileSources.find(s => s.name === c.name));
	}

	public get enabledProviders(): Provider[] {
		const providers: Provider[] = [];
		this.enabledPoiSources.map(s => s.provider).concat(this.enabledTileSources.map(s => s.provider)).forEach(p => {
			if (!p) {
				return;
			}
			if (!providers.find(existing => existing?.name === p?.name)) {
				providers.push(p);
			}
		});
		return providers;
	}

	private createDefaultConfig() {
		this.config = new MapConfig();
		this.tileSources.forEach(source =>
				this.config.sources.tile.push(new TileSourceConfig(source.name)));
		this.poiSources.forEach(source =>
				this.config.sources.poi.push(new SourceConfig(source.name)));
	}

	private loadConfig() {
		this.configSerializer.load().subscribe(c => {
			if (!c) {
				this.createDefaultConfig();
				return;
			}
			this.cdr.detach();
			this.config = c;
			this.center = this.config.center;
			this.zoom = this.config.zoom;
			this.cdr.reattach();
		});
	}

	public saveConfig() {
		this.config.center = this.center;
		this.config.zoom = this.zoom;
		this.config.navExpanded = this._controls.navExpanded;
		this.configSerializer.save(this.config);
	}

	@HostListener("window:resize")
	handleResize() {
		this.cdr.markForCheck();
	}
}
