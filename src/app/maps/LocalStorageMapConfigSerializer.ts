import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Observable, of } from 'rxjs';
import { MapConfig, MapConfigSources, SourceConfig, TileSourceConfig } from './map-config.component';
import { MapConfigSerializer } from './MapConfigSerializer';

export const LOCAL_STORAGE_CONFIG_KEY = new InjectionToken("LOCAL_STORAGE_CONFIG_KEY");
export const LOCAL_STORAGE_DEFAULT_KEY_NAME  = "ngxMapConfig";

@Injectable()
export class LocalStorageMapConfigSerializer implements MapConfigSerializer {
	constructor(@Inject(LOCAL_STORAGE_CONFIG_KEY) @Optional() private readonly keyName) {
		if (!this.keyName) {
			this.keyName  = LOCAL_STORAGE_DEFAULT_KEY_NAME;
		}
	}

	save(c: MapConfig): void {
		localStorage.setItem(this.keyName, JSON.stringify(c));
	}

	load(): Observable<MapConfig> {
		const s = localStorage.getItem(this.keyName);
		if (!s) {
			return of(undefined);
		}
		return of(this.makeItAsAType(JSON.parse(s)));
	}

	private makeItAsAType(x: any): MapConfig {
		const c = Object.assign(new MapConfig(), x) as MapConfig;
		const arr = new MapConfigSources<SourceConfig>();
		arr.push(...c.sources.poi.map(s => Object.assign(new SourceConfig(s.name), s)));
		c.sources.poi = arr;
		const arr2 = new MapConfigSources<TileSourceConfig>();
		arr2.push(...c.sources.tile.map(s => Object.assign(new TileSourceConfig(s.name), s)));
		c.sources.tile = arr2;
		return c;
	}
}
