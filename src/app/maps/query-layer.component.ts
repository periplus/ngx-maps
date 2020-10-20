import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, Output } from '@angular/core';
import { POISource, TileSource } from 'ts-geo';
import Fuse from "fuse.js";
import { MapConfig, SourceConfig } from './map-config.component';

@Component({
	selector: 'map-query-source',
	templateUrl: './query-layer.component.html',
	styles: [":host { display: block; width: 100%; }"],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class QuerySourceComponent {

	constructor(private readonly host: ElementRef, private readonly cdr: ChangeDetectorRef) {
	}

	@Input("config") config: MapConfig;

	@Input("sources") sources: (POISource | TileSource)[];

	public query: string;

	public results: (POISource | TileSource)[];

	doQuery() {
		if (!this.query) {
			this.results = [];
			return;
		}
		const fuse = new Fuse(
				this.sources.filter(s => !(this.config.sources.poi.forName(s.name) || this.config.sources.tile.forName(s.name))),
				{
					isCaseSensitive: false,
					includeScore: false,
					shouldSort: true,
					// includeMatches: false,
					// findAllMatches: false,
					// minMatchCharLength: 1,
					// location: 0,
					// threshold: 0.6,
					// distance: 100,
					// useExtendedSearch: false,
					// ignoreLocation: false,
					// ignoreFieldNorm: false,
					keys: [
						"name",
						"description",
						"provider.name"
					]
				});
		this.results = fuse.search(this.query).map(fr => fr.item);
		this.cdr.markForCheck();
	}

	@Output("change") change = new EventEmitter<POISource | TileSource>();

	doSelect(source: POISource | TileSource) {
		const sourcesConfig = (<any>source).get instanceof Function ? this.config.sources.poi : this.config.sources.tile;
		let sourceConfig = sourcesConfig.forName(source.name);
		if (!sourceConfig) {
			sourceConfig = new SourceConfig(source.name);
			sourcesConfig.push(sourceConfig);
		}
		sourceConfig.disabled = false;
		this.change.emit(source);
		this.clear();
	}

	clear() {
		this.query = "";
		this.doQuery();
	}

	focus() {
		this.host.nativeElement.querySelector("[autofocus]").focus();
	}
}
