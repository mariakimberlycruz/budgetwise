import { act, renderHook, waitFor } from '@testing-library/react-native';

import { AuthProvider, useAuth } from '@/context/AuthContext';
import { fetchCurrentUser, loginUser, registerUser } from '@/services/auth';
import { clearToken, getToken, setToken } from '@/utils/token-storage';

jest.mock('@/services/auth', () => ({
  fetchCurrentUser: jest.fn(),
  loginUser: jest.fn(),
  registerUser: jest.fn(),
}));

jest.mock('@/utils/token-storage', () => ({
  getToken: jest.fn(),
  setToken: jest.fn(),
  clearToken: jest.fn(),
}));

const user = { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' };

async function renderAuth() {
  return renderHook(() => useAuth(), { wrapper: AuthProvider });
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('AuthContext authentication state', () => {
  it('settles as unauthenticated when there is no stored token', async () => {
    getToken.mockResolvedValue(null);

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(fetchCurrentUser).not.toHaveBeenCalled();
  });

  it('restores an authenticated session when a valid token is already stored', async () => {
    getToken.mockResolvedValue('stored-token');
    fetchCurrentUser.mockResolvedValue(user);

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it('clears the token and stays signed out if the stored token is no longer valid', async () => {
    getToken.mockResolvedValue('expired-token');
    fetchCurrentUser.mockRejectedValue(new Error('401'));

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
    expect(clearToken).toHaveBeenCalledTimes(1);
  });

  it('signIn stores the token and loads the current user', async () => {
    getToken.mockResolvedValue(null);
    loginUser.mockResolvedValue({ access_token: 'new-token', token_type: 'bearer' });
    fetchCurrentUser.mockResolvedValue(user);

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signIn('ada@example.com', 'password123');
    });

    expect(loginUser).toHaveBeenCalledWith({ email: 'ada@example.com', password: 'password123' });
    expect(setToken).toHaveBeenCalledWith('new-token');
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user).toEqual(user);
  });

  it('signUp registers, then signs the new user in', async () => {
    getToken.mockResolvedValue(null);
    registerUser.mockResolvedValue(user);
    loginUser.mockResolvedValue({ access_token: 'fresh-token', token_type: 'bearer' });
    fetchCurrentUser.mockResolvedValue(user);

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.signUp('Ada Lovelace', 'ada@example.com', 'password123');
    });

    expect(registerUser).toHaveBeenCalledWith({
      name: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'password123',
    });
    expect(result.current.isAuthenticated).toBe(true);
  });

  it('signOut clears the token and resets to signed-out state', async () => {
    getToken.mockResolvedValue('stored-token');
    fetchCurrentUser.mockResolvedValue(user);

    const { result } = await renderAuth();
    await waitFor(() => expect(result.current.isAuthenticated).toBe(true));

    await act(async () => {
      await result.current.signOut();
    });

    expect(clearToken).toHaveBeenCalled();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });
});
