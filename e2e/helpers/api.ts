import { APIRequestContext, expect } from "@playwright/test";
import { UserData } from "./test-data";

export const API_URL =
  process.env["API_URL"] ?? "https://conduit-api.bondaracademy.com/api";

/**
 * Registers a user directly through the API — much faster than the UI
 * when a test only needs an existing account as a precondition.
 */
export async function createUserViaApi(
  request: APIRequestContext,
  user: UserData,
): Promise<UserData> {
  const response = await request.post(`${API_URL}/users`, { data: { user } });
  expect(
    response.ok(),
    `Creating user failed: ${await response.text()}`,
  ).toBeTruthy();
  return user;
}
