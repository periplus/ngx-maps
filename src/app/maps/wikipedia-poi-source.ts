import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { flatten } from "lodash-es";
import { forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { BoundingBox, POI, POISource, ZoomLevel } from "ts-geo";
import { Provider } from 'ts-geo/lib/Provider';

@Injectable()
export class WikipediaPOISource implements POISource {
	constructor(private http: HttpClient) {
	}

	public readonly name = "Wikipedia";

	public readonly provider: Provider = {
		name: "Wikipedia",
		attrition: "&copy; Wikipedia",
		attritionUrl: "http://wikipedia.org"
	};

	private getPOIsForLimitedBBox(bbox: BoundingBox): Observable<POI[]> {
		// const center = BoundingBox.getCenter(bbox);
		return this.http.get("https://en.wikipedia.org/w/api.php?action=query&list=geosearch&format=json&origin=*",
				{
					params: {
						// gscoord: `${center.x}|${center.y}`,
						// gsradius: "10000",
						// gslimit: "500"
						gsbbox: `${bbox.bottom}|${bbox.left}|${bbox.top}|${bbox.right}`
					}
				})
				.pipe(
					map((q: any) => q.query.geosearch.map(
						(result: any) => ({
							id: result.pageid,
							title: result.title,
							position: {
								latitude: result.lat,
								longitude: result.lon
							},
							icon: "wikipedia"
						})
					)));
	}

	private getInfo(poiObs: Observable<POI[]>): Observable<POI[]> {
		return poiObs.pipe(tap((pois: POI[]) => {
				if (!pois?.length) {
					return;
				}
				const ids = pois.map(p => p.id).join("|");
				this.http.get("https://en.wikipedia.org/w/api.php?action=query&prop=info|pageprops&inprop=url&format=json&origin=*",
						{
							params: {
								"pageids": ids
							}
						}).subscribe((result: any) => {
							const pages = result.query.pages;
							pois.forEach(poi => {
								poi.url = pages[poi.id].fullurl;
								const thumbnailFile = pages[poi.id]?.pageprops?.page_image_free;
								poi.thumbnailUrl = `https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/${thumbnailFile}/250px-${thumbnailFile}`;
							});
						});
				}));
	}

	private maxRequests = 2;
	private maxRadius = 0.15;

	get(mapbbox: BoundingBox, zoom: number): Observable<POI[]> {
		if (zoom < ZoomLevel.CITY) {
			return of([]);
		}
		mapbbox = BoundingBox.clipCenter(mapbbox, this.maxRequests * this.maxRadius);
		return this.getInfo(
				forkJoin(BoundingBox.splitBBox(mapbbox, this.maxRadius).map((bbox) => this.getPOIsForLimitedBBox(bbox)))
					.pipe(map((pois) => flatten(pois)))
				);
	}
}
