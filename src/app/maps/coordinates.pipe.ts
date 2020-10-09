import { DecimalPipe } from '@angular/common';
import { Pipe } from '@angular/core';

@Pipe({name: "coordinates"})
export class CoordinatesPipe extends DecimalPipe {
	transform(value: any): string | null {
		return super.transform(value, "1.2-4");
	}
}
