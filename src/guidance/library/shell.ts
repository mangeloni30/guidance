// import getpass
// import sys
// import subprocess
// import shlex
// import os
// import subprocess
// import asyncio

import { execSync } from 'child_process';

export function shell(command: string, safe: boolean = true, _parser_context?: any): string {
  const partial_output = _parser_context['partial_output'];
  partial_output(`{{execute '${command}'}}`);

  if (safe) {
    let c = "";
    while (c !== "\r" && c !== "\n") {
      c = getch();
      if (c === '\x03') {
        throw new Error("KeyboardInterrupt");
      } else if (c === "\x1b") {
        partial_output("\nABORTED BY USER\n");
        return `{{execute '${command}'}}\nABORTED BY USER\n`;
      }
    }
  }

  let all_output = "\n";
  partial_output(all_output);
  try {
    const output = execSync(command, { encoding: 'utf-8' });
    all_output += output;
    partial_output(output);
  } catch (e) {
    all_output += `${e}\n`;
    partial_output(`${e}\n`);
  }

  return `{{execute '${command}'}}${all_output}`;
}

class _Getch {
  private impl: any;

  constructor() {
    try {
      this.impl = new _GetchWindows();
    } catch (e) {
      this.impl = new _GetchUnix();
    }
  }

  public call(): string {
    return this.impl();
  }
}

class _GetchUnix {
  constructor() {}

  public call(): string {
    const tty = require('tty');
    const termios = require('termios');

    const fd = process.stdin.fd;
    const oldSettings = termios.tcgetattr(fd);
    try {
      tty.setRawMode(fd);
      const ch = process.stdin.readSync(1);
      return ch;
    } finally {
      termios.tcsetattr(fd, termios.TCSADRAIN, oldSettings);
    }
  }
}

class _GetchWindows {
  constructor() {}

  public call(): string {
    const msvcrt = require('msvcrt');
    return msvcrt.getch();
  }
}

const getch = new _Getch().call;

class Shell {
  private shell_cmd: string;
  private master_fd: number;
  private slave_fd: number;
  private p: any;
  private _env_inited: boolean;
  private loop: any;
  private command_finished: any;
  private _current_output: string;

  constructor() {
    const pty = require('node-pty');
    const os = require('os');
    const subprocess = require('child_process');

    this.shell_cmd = process.env.SHELL || '/bin/sh';
    [this.master_fd, this.slave_fd] = pty.openpty();
    const my_env = process.env;
    this.p = subprocess.spawn(this.shell_cmd, {
      stdio: [this.slave_fd, this.slave_fd, this.slave_fd],
      env: my_env,
      shell: true,
    });
    this._env_inited = false;
    this.loop = require('asyncio').get_event_loop();
    this.loop.add_reader(this.master_fd, this.read);

    this.command_finished = require('asyncio').Event();
    this._current_output = "";
  }

  public read(): void {
    const new_text = require('fs').readSync(this.master_fd, 10240).toString();
    this._current_output += new_text;
    if (this._current_output.endsWith('autosh$ ')) {
      this.command_finished.set();
    }
  }

  public async call(command: string): Promise<string> {
    if (!this._env_inited) {
      this._env_inited = true;
      await this.call('export set PS1="autosh$ "');
    }

    command = command + '\n';
    require('fs').writeSync(this.master_fd, command);

    await this.command_finished.wait();
    this.command_finished.clear();

    const out = this._current_output;
    this._current_output = "";
    return out;
  }
}

