import { EventEmitter } from '@angular/core';

export interface FocusOwner {
    onFocus: EventEmitter<any>;
}
