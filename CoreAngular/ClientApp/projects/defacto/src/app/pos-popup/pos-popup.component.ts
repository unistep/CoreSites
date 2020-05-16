import { Component, OnInit, Input, Output, EventEmitter, TemplateRef } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalResult } from '../models/ModalResult';

export class ButtonConfig {
  public text: string;
  public class: string;
  public function?: () => any;
  public canExecute: boolean;
}

@Component({
  selector: 'pos-popup',
  templateUrl: './pos-popup.component.html',
  styleUrls: ['./pos-popup.component.scss']
})
export class PosPopupComponent implements OnInit {

  @Input() leftButton: ButtonConfig;
  @Input() rightButton: ButtonConfig;
  @Input() additionalRightButton: ButtonConfig;
  @Input() iconUrl: string;
  @Input() title: string;
  @Input() rightContentTemplate?: TemplateRef<any>;
  @Output() closeModal: EventEmitter<ModalResult> = new EventEmitter();
  @Output() public leftClick: EventEmitter<any> = new EventEmitter();
  @Output() public rightClick: EventEmitter<any> = new EventEmitter();
  @Output() public additionRightClick: EventEmitter<any> = new EventEmitter();

  constructor(public activeModal: NgbActiveModal) { }

  ngOnInit() {
    if (this.leftButton) {
      this.leftButton.canExecute = this.leftButton.canExecute ? this.leftButton.canExecute : true;
    }
    if (this.rightButton) {
      this.rightButton.canExecute = this.rightButton.canExecute ? this.rightButton.canExecute : true;
    }
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.keyCode === 13) {
      if (this.leftButton && this.leftButton.canExecute) {
        this.onLeftClick();
      }
    }
  }

  close() {
    this.activeModal.close({ success: false } as ModalResult);
  }

  onLeftClick() {
    this.leftClick.emit();
  }

  onRightClick() {
    this.rightClick.emit();
  }

  onAdditionalRightClick() {
    this.additionRightClick.emit();
  }
}
