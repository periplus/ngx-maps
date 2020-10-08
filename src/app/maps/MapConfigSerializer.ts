import { Observable } from 'rxjs';
import { MapConfig } from './map-config.component';

export abstract class MapConfigSerializer {
	abstract save(c: MapConfig): void;
	abstract load(): Observable<MapConfig>;
}
