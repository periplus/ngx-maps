import { Observable } from 'rxjs';

export abstract class Tracker {
	abstract start(): Observable<Coordinates>;
}
