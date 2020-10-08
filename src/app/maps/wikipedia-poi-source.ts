import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { flatten } from "lodash-es";
import { forkJoin, Observable, of } from "rxjs";
import { map, tap } from "rxjs/operators";
import { BoundingBox, POI, POISource, ZoomLevel } from "ts-geo";

@Injectable()
export class WikipediaPOISource implements POISource {
	constructor(private http: HttpClient) {
	}

	public readonly name = "Wikipedia";

	get(mapbbox: BoundingBox, zoom: number): Observable<POI[]> {
		if (zoom < ZoomLevel.CITY) {
			return of([]);
		}
		return forkJoin(
				BoundingBox.splitBBox(mapbbox, 0.15).map((bbox) =>
				this.http.get("https://en.wikipedia.org/w/api.php?action=query&list=geosearch&gsradius=10000&gslimit=500&format=json&origin=*",
						{
							params: {
								// "gscoord": `${(bbox.left + bbox.right) / 2}|${(bbox.top + bbox.bottom) / 2}`
								"gsbbox": `${bbox.bottom}|${bbox.left}|${bbox.top}|${bbox.right}`
							}
						}).pipe(
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
							)),
							tap((pois: POI[]) => {
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
							})
						)
				)
			).pipe(map((pois) =>
					flatten(pois)
					));
	}
}
