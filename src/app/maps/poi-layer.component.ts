import { CdkOverlayOrigin } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { BaseLayerComponent } from './base-layer.component';
import { POI, POISource } from 'ts-geo';
import { isEqual } from "lodash-es";
import { Subscription } from 'rxjs';

@Component({
	selector: 'map-poi-layer',
	templateUrl: './poi-layer.component.html',
	styleUrls: ['./poi-layer.component.scss'],
	changeDetection: ChangeDetectionStrategy.OnPush
})
export class POILayerComponent extends BaseLayerComponent implements OnInit, OnDestroy {

	private _sources: POISource[];

	public get sources(): POISource[] {
		return this._sources;
	}

	@Input("sources") public set sources(value: POISource[]) {
		if (isEqual(this._sources, value)) {
			return;
		}
		this._sources = value;
		this.reload();
	}

	pois: POI[];

	selected: POI;

	selectedTrigger: CdkOverlayOrigin;

	ngOnInit(): void {
		this.centerChange.subscribe(() => this.reload());
		this.zoomChange.subscribe(() => this.reload());
		this.reload();
	}

	ngOnDestroy() {
		this.cancel();
	}

	private subscriptions: Subscription[];

	private cancel() {
		if (this.subscriptions) {
			this.subscriptions.forEach(s => !s.closed && s.unsubscribe());
		}
	}

	private reload() {
		const bbox = this.coordinatesBBox;

		// TODO investigate
		const left = Math.min(bbox.left, bbox.right);
		const right = Math.max(bbox.left, bbox.right);
		bbox.left = left;
		bbox.right = right;

		this.pois = [];

		this.cancel();

		this.subscriptions = this.sources.map(source =>
				source.get(bbox, this.zoom).subscribe(pois => {
					pois.forEach(poi => poi.source = source);
					this.pois.push(...pois);
					this.cdr.markForCheck();
				}));
	}

	open(event: MouseEvent, selected: POI, selectedTrigger: CdkOverlayOrigin) {
		this.selected = selected;
		this.selectedTrigger = selectedTrigger;
		event.stopImmediatePropagation();
	}

	@HostListener("document:click")
	handleClick() {
		this.selected = null;
	}
}
