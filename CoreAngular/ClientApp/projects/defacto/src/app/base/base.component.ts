
import { OnInit, DoCheck, EventEmitter } from '@angular/core';
import { CommandId } from '../enums/command-id';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { ModalResult } from '../models/ModalResult';
import { FocusOwner } from '../models/focus-owner';

export class Command {
  execute: () => any;
  canExecute: () => boolean;
}

export abstract class BaseComponent implements OnInit, DoCheck, FocusOwner {

  private commands: Map<CommandId, Command> = new Map<CommandId, Command>();
  public enabled = {};
  public onFocus: EventEmitter<any> = new EventEmitter<any>();

  constructor() { }

  ngOnInit() {
    setTimeout(() => this.setUp(), 0);
    this.focusDemand();
  }

  ngDoCheck(): void {
    this.refreshCommands();
  }

  protected refreshCommands() {
    this.commands.forEach((v, k) => {
      this.enabled[CommandId[k]] = v.canExecute === null || v.canExecute();
    });
  }

  protected focusDemand() {
    this.onFocus.emit();
  }

  protected abstract setUp(): void;

  protected cmd(id: CommandId, execute: () => any, canExecute: () => boolean = null) {
    if (this.commands.has(id)) {
      const oldCmd = this.commands.get(id);
      this.commands.set(id, {
        execute: () => {
          oldCmd.execute();
          execute();
        }, canExecute: () => {
          let res = true;
          if (oldCmd.canExecute) {
            res = oldCmd.canExecute();
          }
          if (canExecute && res) {
            res = canExecute();
          }

          return res;
        }
      });
    } else {
      this.commands.set(id, {execute, canExecute});
    }
  }

  protected cmds(ids: CommandId[], execute: () => any, canExecute: () => boolean = null) {
    ids.forEach(id => {
      this.cmd(id, execute, canExecute);
    });
  }

  public execute(param: string) {
    const command: CommandId = CommandId[param];

    if (this.commands.has(command)) {
      const cmd = this.commands.get(command);
      if (!cmd.canExecute || cmd.canExecute()) {
        cmd.execute();
      }
    }
  }
}

export abstract class BasePopupComponent extends BaseComponent {

  constructor(private activeModal: NgbActiveModal) {
    super();
  }

  public close(success: boolean, result?: any) {
    this.activeModal.close({ success, result } as ModalResult);
  }
}
