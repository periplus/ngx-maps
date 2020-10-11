import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';

@Component({
	selector: 'map-geo-ref-layer',
	templateUrl: './geo-ref-layer.component.html',
	styleUrls: ['./geo-ref-layer.component.scss']
})
export class GeoRefLayerComponent {

	@ViewChild("fileInput") fileInput: ElementRef;

	private _image: File;

	public set image(f: File) {
		this._image = f;
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
					this.image = f;
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
		this.image = files.item(0);
	}

	public browse() {
		this.fileInput.nativeElement.click();
	}
}
