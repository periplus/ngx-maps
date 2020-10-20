import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { flatten } from "lodash-es";
import { forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { BoundingBox, POI, POISource, Provider, ZoomLevel } from "ts-geo";

@Injectable()
export class GeoNamesPOISource implements POISource {
	constructor(private http: HttpClient) {
	}

	public readonly name = "GeoNames Wikipedia";

	public readonly provider: Provider = {
		name: "GeoNames",
		attrition: "&copy; GeoNames",
		attritionUrl: "https://www.geonames.org/about.html"
	};

	private getPOIsForLimitedBBox(bbox: BoundingBox): Observable<POI[]> {
		const center = BoundingBox.getCenter(bbox);
		return this.http.get("http://api.geonames.org/findNearbyWikipediaJSON?username=beradrian",
				{
					params: {
						lat: center.y.toString(),
						lng: center.x.toString(),
						radius: "20",
						maxRows: "500"
					}
				})
				.pipe(
					map((response: any) => response.geonames.map(
						(entry: any) => ({
							title: entry.title,
							description: entry.summary,
							url: "//" + entry.wikipediaUrl,
							thumbnailUrl: entry.thumbnailImg,
							position: {
								latitude: entry.lat,
								longitude: entry.lng
							},
							icon: "wikipedia"
						})
					)));
	}

	private maxRequests = 2;
	private maxRadius = 0.3;

	get(mapbbox: BoundingBox, zoom: number): Observable<POI[]> {
		if (zoom < ZoomLevel.CITY) {
			return of([]);
		}
		mapbbox = BoundingBox.clipCenter(mapbbox, this.maxRequests * this.maxRadius);
		return forkJoin(BoundingBox.splitBBox(mapbbox, this.maxRadius).map((bbox) => this.getPOIsForLimitedBBox(bbox)))
					.pipe(map((pois) => flatten(pois)));
	}
}
