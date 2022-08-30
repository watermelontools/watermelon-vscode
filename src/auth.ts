import {
  authentication,
  AuthenticationProvider,
  AuthenticationProviderAuthenticationSessionsChangeEvent,
  AuthenticationSession,
  Disposable,
  EventEmitter,
  ExtensionContext,
} from "vscode";

export const AUTH_TYPE = `watermelon`;
const AUTH_NAME = `watermelon`;

export class WatermelonAuthenticationProvider
  implements AuthenticationProvider, Disposable
{
  private _sessionChangeEmitter =
    new EventEmitter<AuthenticationProviderAuthenticationSessionsChangeEvent>();
  private _disposable: Disposable;

  constructor(private readonly context: ExtensionContext) {
    this._disposable = Disposable.from(
      authentication.registerAuthenticationProvider(
        AUTH_TYPE,
        AUTH_NAME,
        this,
        { supportsMultipleAccounts: false }
      )
    );
  }

  get onDidChangeSessions() {
    return this._sessionChangeEmitter.event;
  }

  /**
   * Get the existing sessions
   * @param scopes
   * @returns
   */
  public async getSessions(
    scopes?: string[]
  ): Promise<readonly AuthenticationSession[]> {
    return [];
  }

  /**
   * Create a new auth session
   * @param scopes
   * @returns
   */
  public async createSession(scopes: string[]): Promise<AuthenticationSession> {
    return null as any as AuthenticationSession;
  }

  /**
   * Remove an existing session
   * @param sessionId
   */
  public async removeSession(sessionId: string): Promise<void> {}

  /**
   * Dispose the registered services
   */
  public async dispose() {
    this._disposable.dispose();
  }
}
