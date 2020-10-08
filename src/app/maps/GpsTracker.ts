import { Observable } from "rxjs";
import { finalize } from 'rxjs/operators';
import { watch } from "ts-geo";
import { Tracker } from "./Tracker";

export class GpsTracker extends Tracker {
	private trackObservable: Observable<Coordinates>;

	public start(): Observable<Coordinates> {
		if (!this.trackObservable) {
			this.trackObservable = watch().pipe(finalize(() => delete this.trackObservable));
		}
		return this.trackObservable;
	}
}
