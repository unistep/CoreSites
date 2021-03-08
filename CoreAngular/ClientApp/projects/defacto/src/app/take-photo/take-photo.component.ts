
import { Component, AfterViewInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalResult } from '../models/ModalResult';
import { WebcamImage, WebcamInitError } from 'ngx-webcam';
import { Subject, Observable } from 'rxjs';

export interface Photo {
  Data: string;
  MouseOver: boolean;
}

@Component({
  selector: 'take-photo',
  templateUrl: './take-photo.component.html',
  styleUrls: ['./take-photo.component.scss']
})

export class TakePhotoComponent implements AfterViewInit {
  public images = [];
  private trigger: Subject<void> = new Subject<void>();

  constructor(public activeModal: NgbActiveModal) {
  }

  ngAfterViewInit(): void {
    //$('.save_button').prop('disabled', true);

    for (var i = 1; i < 5; i++) {
      var _img: any = document.getElementById('img_' + i.toString())
      if (!_img || !_img.src || _img.src === _img.baseURI) continue;

      const photo = {
        Data: _img.src,
        MouseOver: false
      } as Photo;

      this.images.push(photo);
    }
  }

  public checkDisplay(index: number) {
    this.images[index].MouseOver = !this.images[index].MouseOver;
  }

  public takePhoto() {
    if (this.images.length >= 4) return;
    this.trigger.next();
  }

  public uploadPhoto() {
    if (this.images.length >= 4) return;

    var fileTag = document.getElementById("filetag");
      fileTag.click();
  }

  public deletePhoto(index: number) {
    this.images.splice(index, 1);
    //$('.save_button').prop('disabled', false);
  }

  public handleImage(webcamImage: WebcamImage): void {
    const photo = {
      Data: webcamImage.imageAsDataUrl,
      MouseOver: false
    } as Photo;

    this.images.push(photo);
    //$('.save_button').prop('disabled', false);
  }

  public get triggerObservable(): Observable<void> {
    return this.trigger.asObservable();
  }

  public handleInitError(error: WebcamInitError): void {
    if (error.mediaStreamError && error.mediaStreamError.name === 'NotAllowedError') {
      console.warn('Camera access was not allowed by user!');
    }
  }

  protected setUp(): void {
    //this.cmd(CommandId.Ok, this.closeModal.bind(this), () => this.images.length > 0);
  }

  public closeModal() {   
    this.close(true, this.images.map(x=>x.Data));
  }

  public close(success: boolean, result?: any) {
    this.activeModal.close({ success, result } as ModalResult);
  }

  changeImage(event) {
    var reader;
    var self = this;
    if (event.currentTarget.files && event.currentTarget.files[0]) {
      reader = new FileReader();

      reader.onload = function (e) {
        const photo = {
          Data: e.target.result,
          MouseOver: false
        } as Photo;

        self.images.push(photo);
      }

      reader.readAsDataURL(event.currentTarget.files[0]);
    }
  }
}
