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
  env,
} from "vscode";

class WatermelonAuthSession implements AuthenticationSession {
  readonly account = {
    id: WatermelonAuthenticationProvider.id,
    label: `${this.email}`,
  };
  // This id isn't used for anything in this example, so we set it to a constant
  readonly id = WatermelonAuthenticationProvider.id;
  // Currently no scopes are supported
  readonly scopes = [];

  /**
   *
   * @param accessToken The personal access token to use for authentication
   * @param email The email address of the user
   */
  constructor(
    public readonly accessToken: string,
    private readonly email: string
  ) {
    this.email = email;
  }
}

export class WatermelonAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  static id = "WatermelonAuth";
  private static secretKey = "WatermelonAuth";

  // this property is used to determine if the token has been changed in another window of VS Code.
  // It is used in the checkForUpdates function.
  private currentToken: Promise<string | undefined> | undefined;
  private currentEmail: Promise<string | undefined> | undefined;
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
    const previousEmail = await this.currentEmail;
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
    this.currentToken = this.context.secrets.get("watermelonToken") as Promise<
      string | undefined
    >;

    return this.currentToken;
  }
  private cacheEmailFromStorage() {
    this.currentEmail = this.context.secrets.get("watermelonEmail") as Promise<
      string | undefined
    >;
    return this.currentEmail;
  }

  // This function is called first when `vscode.authentication.getSession is called.
  async getSessions(
    _scopes?: string[]
  ): Promise<readonly AuthenticationSession[]> {
    this.ensureInitialized();
    const token = await this.cacheTokenFromStorage();
    const email = await this.cacheEmailFromStorage();
    let tokenResolved = await token;
    let emailResolved = await email;
    if (tokenResolved && emailResolved) {
      let session = new WatermelonAuthSession(tokenResolved, emailResolved);
      return [session];
    }
    return [];
  }

  // This function is called after `this.getSessions` is called and only when:
  // - `this.getSessions` returns nothing but `createIfNone` was set to `true` in `vscode.authentication.getSessions`
  // - `vscode.authentication.getSessions` was called with `forceNewSession: true`
  // - The end user initiates the "silent" auth flow via the Accounts menu
  async createSession(_scopes: string[]): Promise<AuthenticationSession> {
    this.ensureInitialized();

    // Don't set `currentToken` here, since we want to fire the proper events in the `checkForUpdates` call
    let token = await this.cacheTokenFromStorage();
    let email = await this.cacheEmailFromStorage();
    if (!token || !email) {
      env.openExternal(
        Uri.parse(`https://app.watermelontools.com/${env.uriScheme}`)
      );
      return Promise.reject("Please log in to Watermelon");
    } else {
      console.log("Successfully logged in to Watermelon");
      let session = new WatermelonAuthSession(token, email);
      return session;
    }
  }

  // This function is called when the end user signs out of the account.
  async removeSession(_sessionId: string): Promise<void> {
    await this.context.secrets.delete(
      WatermelonAuthenticationProvider.secretKey
    );
    this.currentEmail = undefined;
    this.currentToken = undefined;
    await this.context.secrets.delete("watermelonToken");
    await this.context.secrets.delete("watermelonEmail");
  }
}
