import authReducer, { loginSuccess, logout } from '../../src/features/authSlice';

describe('authSlice', () => {
  const initialState = {
    currentUser: JSON.parse(localStorage.getItem('user')) || null,
  };

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should return the initial state', () => {
    const result = authReducer(undefined, {});
    expect(result).toEqual(initialState);
  });

  it('should handle loginSuccess', () => {
    const mockUser = { id: 1, username: 'testUser' };

    // Simulate login success action
    const action = loginSuccess(mockUser);
    const result = authReducer(initialState, action);

    // Expect currentUser to be the mockUser
    expect(result.currentUser).toEqual(mockUser);
    expect(localStorage.getItem('user')).toEqual(JSON.stringify(mockUser));
  });

  it('should handle logout', () => {
    const mockUser = { id: 1, username: 'testUser' };
    const action = loginSuccess(mockUser);

    // Set user in the state first
    let result = authReducer(initialState, action);

    // Ensure login was successful and user is in state
    expect(result.currentUser).toEqual(mockUser);

    // Perform logout
    result = authReducer(result, logout());

    // Expect currentUser to be null after logout
    expect(result.currentUser).toBeNull();
    expect(localStorage.getItem('user')).toBeNull();
    expect(localStorage.getItem('token')).toBeNull();
  });
});
