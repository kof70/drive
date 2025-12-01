/**
 * Mock for VS Code API
 * Used in Jest tests for extension code
 */

export enum ExtensionMode {
  Production = 1,
  Development = 2,
  Test = 3,
}

export enum ViewColumn {
  Active = -1,
  Beside = -2,
  One = 1,
  Two = 2,
  Three = 3,
}

export class Uri {
  static file(path: string): Uri {
    return new Uri('file', path);
  }

  static joinPath(base: Uri, ...pathSegments: string[]): Uri {
    return new Uri(base.scheme, base.path + '/' + pathSegments.join('/'));
  }

  constructor(public scheme: string, public path: string) {}

  get fsPath(): string {
    return this.path;
  }

  toString(): string {
    return `${this.scheme}://${this.path}`;
  }
}

export class Disposable {
  constructor(private callOnDispose: () => void) {}

  dispose(): void {
    this.callOnDispose();
  }
}

export const window = {
  showInformationMessage: jest.fn().mockResolvedValue(undefined),
  showErrorMessage: jest.fn().mockResolvedValue(undefined),
  showWarningMessage: jest.fn().mockResolvedValue(undefined),
  createWebviewPanel: jest.fn(),
  activeTextEditor: undefined,
  createStatusBarItem: jest.fn(() => ({
    text: '',
    tooltip: '',
    command: '',
    show: jest.fn(),
    hide: jest.fn(),
    dispose: jest.fn(),
  })),
};

export const workspace = {
  getConfiguration: jest.fn(() => ({
    get: jest.fn(),
    update: jest.fn(),
    has: jest.fn(),
    inspect: jest.fn(),
  })),
  workspaceFolders: undefined,
  onDidChangeConfiguration: jest.fn(),
};

export const commands = {
  registerCommand: jest.fn((command: string, callback: (...args: any[]) => any) => {
    return new Disposable(() => {});
  }),
  executeCommand: jest.fn(),
  getCommands: jest.fn().mockResolvedValue([
    'localWorkspace.startServer',
    'localWorkspace.stopServer',
    'localWorkspace.restartServer',
    'localWorkspace.openCanvas',
    'localWorkspace.copyUrl',
    'localWorkspace.showQRCode',
  ]),
};

export const env = {
  clipboard: {
    writeText: jest.fn(),
    readText: jest.fn(),
  },
};

export const StatusBarAlignment = {
  Left: 1,
  Right: 2,
};

export class EventEmitter<T> {
  private listeners: Array<(e: T) => any> = [];

  get event() {
    return (listener: (e: T) => any) => {
      this.listeners.push(listener);
      return new Disposable(() => {
        const index = this.listeners.indexOf(listener);
        if (index >= 0) {
          this.listeners.splice(index, 1);
        }
      });
    };
  }

  fire(data: T): void {
    this.listeners.forEach(listener => listener(data));
  }

  dispose(): void {
    this.listeners = [];
  }
}

export interface WebviewOptions {
  enableScripts?: boolean;
  retainContextWhenHidden?: boolean;
  localResourceRoots?: Uri[];
}

export interface WebviewPanelOptions {
  enableFindWidget?: boolean;
  retainContextWhenHidden?: boolean;
}

export interface Webview {
  html: string;
  options: WebviewOptions;
  cspSource: string;
  asWebviewUri: (uri: Uri) => Uri;
  postMessage: jest.Mock;
  onDidReceiveMessage: jest.Mock;
}

export interface WebviewPanel {
  webview: Webview;
  visible: boolean;
  active: boolean;
  viewColumn?: ViewColumn;
  title: string;
  reveal: jest.Mock;
  dispose: jest.Mock;
  onDidDispose: jest.Mock;
  onDidChangeViewState: jest.Mock;
}
