export interface UserData {
  username: string;
  email: string;
  password: string;
}

/**
 * Builds a unique user so parallel runs never collide on the shared hosted API.
 */
export function generateUser(): UserData {
  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  return {
    username: `pw${id}`,
    email: `pw${id}@test.com`,
    // The API rejects passwords longer than 20 characters.
    password: `Pw1!${id.slice(-10)}`,
  };
}
