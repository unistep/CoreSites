import { Injectable, Type, EventEmitter } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalResult } from '../models/ModalResult';

@Injectable({
  providedIn: 'root'
})
export class PopupService {

  private _popupsCount = 0;
  public get popupsCount(): number {
    return this._popupsCount;
  }
  public set popupsCount(v: number) {
    this._popupsCount = v;
    this.popupsCountChanged.emit(v);
  }

  public popupsCountChanged: EventEmitter<number> = new EventEmitter<number>();

  constructor(private modalService: NgbModal) { }

  public show<T>(content: Type<T>, config?: { "size": "xl" }/*Partial<T>*/): Promise<ModalResult> {
    const modal = this.modalService.open(content, {
      centered: true,
      keyboard: false
    });

    if (config) {
      Object.assign(modal.componentInstance, config);
    }

    this.popupsCount++;
    modal.result.then(res => {
      this.popupsCount--;
    });

    return modal.result;
  }
}
