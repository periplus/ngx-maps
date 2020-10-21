import { Component, ElementRef, HostBinding, HostListener, ViewChild } from "@angular/core";
import { DomSanitizer, SafeUrl } from "@angular/platform-browser";
import { MathUtils, Point, PointUtils } from "ts-geo";

import { getCursorPositionInViewport, MouseButton } from "./browser";

@Component({
	selector: 'map-geo-ref-layer',
	templateUrl: './geo-ref-layer.component.html',
	styleUrls: ['./geo-ref-layer.component.scss']
})
export class GeoRefLayerComponent {

	@ViewChild("image")	image: ElementRef;

	constructor(private readonly domSanitizer: DomSanitizer) {
	}

	@HostBinding("class.image-selected")
	get imageSelected(): boolean {
		return !!this.imageFile;
	}

	@ViewChild("fileInput") fileInput: ElementRef;

	private _imageFile: File;
	private _imageUrl: SafeUrl;

	public get imageFile(): File {
		return this._imageFile;
	}

	public set imageFile(f: File) {
		this._imageFile = f;
		this._imageUrl = this.domSanitizer.bypassSecurityTrustUrl(URL.createObjectURL(f));
	}

	public get imageUrl(): SafeUrl {
		return this._imageUrl;
	}

	private _opacity = 1;

	public get opacity(): number {
		return this._opacity;
	}

	public set opacity(v: number) {
		this._opacity = MathUtils.clip(v, 0, 1);
	}

	public passThrough: boolean;

	get pointerEvents() {
		return this.image && !this.passThrough ? "all" : "none";
	}

	handleInputChange(event: Event) {
		this.add((<HTMLInputElement>event.target).files);
		event.stopImmediatePropagation();
	}

	@HostListener('paste', ['$event'])
	handlePaste(event: ClipboardEvent) {
		const clipboardData = event.clipboardData;
		if (!this.isPastingFiles(clipboardData)) {
			return;
		}
		event.stopPropagation();
		event.preventDefault();
		this.addFilesFromDataTransfer(clipboardData);
	}

	private isPastingFiles(clipboardData): boolean {
		if (!clipboardData) {
			return false;
		}
		if (clipboardData.files && clipboardData.files.length) {
			return true;
		}
		if (clipboardData.items) {
			for (let i = 0, n = clipboardData.items.length; i < n; i++) {
				const item = clipboardData.items[i];
				if (item && item.kind === "file") {
					return true;
				}
			}
		}
		return false;
	}

	@HostListener('drop', ['$event'])
	handleDrop(event: DragEvent) {
		event.stopPropagation();
		event.preventDefault();
		this.addFilesFromDataTransfer(event.dataTransfer);
	}

	private addFilesFromDataTransfer(dt: DataTransfer) {
		if (dt.items) {
			// Use DataTransferItemList interface to access the file(s)
			for (let i = 0; i < dt.items.length; i++) {
				if (dt.items[i].kind === "file") {
					const f = dt.items[i].getAsFile();
					this.imageFile = f;
				}
			}
		} else {
			// Use DataTransfer interface to access the file(s)
			this.add(dt.files);
		}
	}

	private add(files: FileList) {
		if (!files?.length) {
			return;
		}
		this.imageFile = files.item(0);
	}

	public browse() {
		this.fileInput.nativeElement.click();
	}

	private _scale = 1;

	public get scale(): number {
		return this._scale;
	}

	public set scale(v: number) {
		this._scale = MathUtils.clip(v, 0.1, 10);
	}

	handleMouseWheel(event: WheelEvent) {
		if (!this.image || event.target !== this.image.nativeElement) {
			return;
		}
		if (!event.deltaY) {
			return;
		}
		const delta = event.deltaY * -0.001;
		if (event.shiftKey) {
			this.opacity += MathUtils.clip(delta, 0.1, 1);
			return;
		}
		if (event.ctrlKey || event.buttons === MouseButton.RIGHT) {
			this.rotation += delta * 10;
			event.preventDefault();
			event.stopImmediatePropagation();
			return;
		}
		this.scale = this.scale + delta;
	}

	public position = new Point(0, 0);

	public get x(): number {
		return this.position.x;
	}

	public set x(v: number) {
		this.position = new Point(v, this.position.y);
	}

	public get y(): number {
		return this.position.y;
	}

	public set y(v: number) {
		this.position = new Point(this.position.x, v);
	}

	private startDragPoint: Point;

	@HostListener("window:mousedown", ["$event"])
	handleDragStart(event: DragEvent) {
		if (!this.image || event.target !== this.image.nativeElement) {
			return;
		}
		this.startDragPoint = new Point(event.screenX, event.screenY);
	}

	@HostListener("window:mouseup", ["$event"])
	handleDragEnd(event: DragEvent) {
		if (!this.startDragPoint) {
			return;
		}
		const endDragPoint = new Point(event.screenX, event.screenY);
		const delta = PointUtils.delta(this.startDragPoint, endDragPoint);
		this.position = PointUtils.add(this.position, delta);
		delete this.startDragPoint;
	}

	private _rotation = 0;

	public get rotation(): number {
		return this._rotation;
	}

	public set rotation(v: number) {
		this._rotation = v % 360;
	}

	public get imageTransform(): string {
		return `scale(${this.scale}) translate(${this.position.x}px, ${this.position.y}px) rotate(${this.rotation}deg)`;
	}
}
