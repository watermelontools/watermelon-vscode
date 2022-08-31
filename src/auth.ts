import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  Event,
  EventEmitter,
  ExtensionContext,
  Uri,
  UriHandler,
  window,
} from "vscode";
import { PromiseAdapter } from "./utils/authUtils";
class UriEventHandler extends EventEmitter<Uri> implements UriHandler {
  public handleUri(uri: Uri) {
    this.fire(uri);
  }
}
class WatermelonAuthSession implements AuthenticationSession {
  // We don't know the user's account name, so we'll just use a constant
  readonly account = {
    id: WatermelonAuthenticationProvider.id,
    label: "Watermelon Auth",
  };
  // This id isn't used for anything in this example, so we set it to a constant
  readonly id = WatermelonAuthenticationProvider.id;
  // We don't know what scopes the PAT has, so we have an empty array here.
  readonly scopes = [];

  /**
   *
   * @param accessToken The personal access token to use for authentication
   */
  constructor(public readonly accessToken: string) {}
}

export class WatermelonAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  static id = "WatermelonAuth";
  private static secretKey = "WatermelonAuth";

  // this property is used to determine if the token has been changed in another window of VS Code.
  // It is used in the checkForUpdates function.
  private currentToken: Promise<string | undefined> | undefined;
  private initializedDisposable: Disposable | undefined;

  private _onDidChangeSessions =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  get onDidChangeSessions(): Event<AuthenticationProviderAuthenticationSessionsChangeEvent> {
    return this._onDidChangeSessions.event;
  }

  constructor(private readonly context: ExtensionContext) {}

  dispose(): void {
    this.initializedDisposable?.dispose();
  }
  public static handleUri: (
    scopes: readonly string[]
  ) => PromiseAdapter<Uri, string> =
    (scopes) => async (uri, resolve, reject) => {
      console.log("uri", uri);
    };

  private ensureInitialized(): void {
    if (this.initializedDisposable === undefined) {
      void this.cacheTokenFromStorage();

      this.initializedDisposable = Disposable.from(
        // This onDidChange event happens when the secret storage changes in _any window_ since
        // secrets are shared across all open windows.
        this.context.secrets.onDidChange((e) => {
          if (e.key === WatermelonAuthenticationProvider.secretKey) {
            void this.checkForUpdates();
          }
        }),
        // This fires when the user initiates a "silent" auth flow via the Accounts menu.
        authentication.onDidChangeSessions((e) => {
          if (e.provider.id === WatermelonAuthenticationProvider.id) {
            void this.checkForUpdates();
          }
        })
      );
    }
  }

  // This is a crucial function that handles whether or not the token has changed in
  // a different window of VS Code and sends the necessary event if it has.
  private async checkForUpdates(): Promise<void> {
    const added: AuthenticationSession[] = [];
    const removed: AuthenticationSession[] = [];
    const changed: AuthenticationSession[] = [];

    const previousToken = await this.currentToken;
    const session = (await this.getSessions())[0];

    if (session?.accessToken && !previousToken) {
      added.push(session);
    } else if (!session?.accessToken && previousToken) {
      removed.push(session);
    } else if (session?.accessToken !== previousToken) {
      changed.push(session);
    } else {
      return;
    }

    void this.cacheTokenFromStorage();
    this._onDidChangeSessions.fire({
      added: added,
      removed: removed,
      changed: changed,
    });
  }

  private cacheTokenFromStorage() {
    this.currentToken = this.context.secrets.get(
      WatermelonAuthenticationProvider.secretKey
    ) as Promise<string | undefined>;
    return this.currentToken;
  }

  // This function is called first when `vscode.authentication.getSessions` is called.
  async getSessions(
    _scopes?: string[]
  ): Promise<readonly AuthenticationSession[]> {
    this.ensureInitialized();
    const token = await this.cacheTokenFromStorage();
    return token ? [new WatermelonAuthSession(token)] : [];
  }

  // This function is called after `this.getSessions` is called and only when:
  // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
  // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
  // - The end user initiates the "silent" auth flow via the Accounts menu
  async createSession(_scopes: string[]): Promise<AuthenticationSession> {
    this.ensureInitialized();

    // Prompt for the PAT.
    const token = await window.showInputBox({
      ignoreFocusOut: true,
      placeHolder: "Email",
      prompt: "Type the email to use for Magic Link.",
      password: false,
    });

    // Note: this example doesn't do any validation of the token beyond making sure it's not empty.
    if (!token) {
      throw new Error("Email is required");
    }

    // Don't set `currentToken` here, since we want to fire the proper events in the `checkForUpdates` call
    await this.context.secrets.store(
      WatermelonAuthenticationProvider.secretKey,
      token
    );
    console.log("Successfully logged in to Watermelon");

    return new WatermelonAuthSession(token);
  }

  // This function is called when the end user signs out of the account.
  async removeSession(_sessionId: string): Promise<void> {
    await this.context.secrets.delete(
      WatermelonAuthenticationProvider.secretKey
    );
  }
}
