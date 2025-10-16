import axios from 'axios';
import { RENEW_TOKEN } from 'config';
import setLogs from 'config/logs';

/**
 * TokenRenewalManager
 *
 * This is centralized manager for authentication token renewal that prevents race conditions
 * between multiple renewal requests done by various clients. (GraphQL, Axios)
 *
 */
class TokenRenewalManager {
  private renewalPromise: Promise<any> | null = null;

  /**
   * Renew authentication token
   *
   * If a renewal is already in progress then it returns the exsiting promise.
   * Otherwise start a new renewal and returns it's promise.
   *
   * This ensures only one token renewal happens at a time, regardless of
   * how many simultaneous requests trigger renewal.
   *
   * @returns Promise that resolves with the renewal response
   */
  async renewToken(): Promise<any> {
    // if renewal already in progress then return existing promise
    if (this.renewalPromise) {
      setLogs('Token renewal: Waiting for existing renewal to complete', 'info');
      return this.renewalPromise;
    }

    setLogs('Token renewal: Starting new renewal', 'info');

    this.renewalPromise = this.performRenewal();

    try {
      const result = await this.renewalPromise;
      setLogs('Token renewal: Completed successfully', 'info');
      return result;
    } catch (error) {
      setLogs(`Token renewal: Failed - ${error}`, 'error');
      throw error;
    } finally {
      // clear promise after completion (success or failure)
      this.renewalPromise = null;
    }
  }

  /**
   * Perform the actual token renewal API call
   *
   * @private
   * @returns Promise with axios response
   * @throws Error if renewal token is missing or API call fails
   */
  private async performRenewal(): Promise<any> {
    // TODO: Not sure if this is the best way to handle circular dependencies
    // import here to avoid circular dependency
    const { getAuthSession, setAuthSession } = await import('./AuthService');

    const renewalToken = getAuthSession('renewal_token');
    if (!renewalToken) {
      setLogs('Token renewal failed: renewal_token not found', 'error');
      throw new Error('No renewal token available');
    }

    // set authorization header with renewal token
    axios.defaults.headers.common.authorization = renewalToken;

    try {
      const response = await axios.post(RENEW_TOKEN);

      // update session with new tokens
      if (response.data && response.data.data) {
        setAuthSession(response.data.data);
        setLogs('Token renewal: Session updated with new tokens', 'info');
      }

      return response;
    } catch (error: any) {
      setLogs(`Token renewal API error: ${error.message}`, 'error');
      throw error;
    }
  }

  /**
   * Check if a renewal is currently in progress
   *
   * @returns true if renewal is in progress, false otherwise
   */
  isRenewalInProgress(): boolean {
    return this.renewalPromise !== null;
  }
}

// export singleton instance
export const tokenRenewalManager = new TokenRenewalManager();
