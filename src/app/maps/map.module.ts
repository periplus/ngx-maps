import { ClipboardModule } from "@angular/cdk/clipboard";
import { DragDropModule } from "@angular/cdk/drag-drop";
import { OverlayModule } from "@angular/cdk/overlay";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule } from "@angular/forms";
import { MatCheckboxModule } from "@angular/material/checkbox";
import { MatExpansionModule } from "@angular/material/expansion";
import { MatSidenavModule } from "@angular/material/sidenav";
import { MatSlideToggleModule } from "@angular/material/slide-toggle";
import { MatSliderModule } from "@angular/material/slider";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { RouterModule } from "@angular/router";
import { ContextMenuModule } from "ngx-contextmenu";
import { MathProjection, Projection } from "ts-geo";

import tileSources from "../../assets/tile-sources.json";
import { ControlsComponent } from "./controls.component";
import { CoordinatesPipe } from "./coordinates.pipe";
import { GeoRefLayerComponent } from "./geo-ref-layer.component";
import { GpsTracker } from "./GpsTracker";
import { LocalStorageMapConfigSerializer } from "./LocalStorageMapConfigSerializer";
import { MapConfigComponent } from "./map-config.component";
import { MapComponent, POI_SOURCES, TILE_SOURCES } from "./map.component";
import { MapConfigSerializer } from "./MapConfigSerializer";
import { POILayerComponent } from "./poi-layer.component";
import { TileLayerComponent } from "./tile-layer.component";
import { TileUrlPipe } from "./tile-url.pipe";
import { Tracker } from "./Tracker";
import { WikipediaPOISource } from "./wikipedia-poi-source";

@NgModule({
	declarations: [
		MapModule.COMPONENTS, MapModule.PIPES
	],
	exports: [
		MapModule.COMPONENTS, MapModule.PIPES
	],
	entryComponents: MapModule.COMPONENTS,
	imports: [
		BrowserAnimationsModule,
		BrowserModule,
		CommonModule,
		ContextMenuModule.forRoot(),
		ClipboardModule,
		DragDropModule,
		FormsModule,
		HttpClientModule,
		MatCheckboxModule,
		MatExpansionModule,
		MatSidenavModule,
		MatSliderModule,
		MatSlideToggleModule,
		OverlayModule,
		RouterModule.forRoot([
			{ path: "", component: MapComponent },
			{ path: ":zoom/:latitude/:longitude", component: MapComponent }
		])
	],
	providers: [
		{ provide: Projection, useValue: new MathProjection() },
		{ provide: TILE_SOURCES, useValue: tileSources },
		{ provide: POI_SOURCES, useClass: WikipediaPOISource, multi: true },
		{ provide: MapConfigSerializer, useClass: LocalStorageMapConfigSerializer },
		{ provide: Tracker, useClass: GpsTracker }
	],
	bootstrap: []
})
export class MapModule {
	public static COMPONENTS = [
			MapComponent,
			MapConfigComponent,
			ControlsComponent,
			GeoRefLayerComponent,
			TileLayerComponent,
			POILayerComponent
			];
	public static PIPES = [ CoordinatesPipe, TileUrlPipe ];
}
