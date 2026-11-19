import type { WorkspaceAccess, WorkspaceAccessOptions } from "../enterprise.ts";

export function createFixtureWorkspaceAccess(
  { entitled }: Pick<WorkspaceAccessOptions, "entitled">,
  sessionIds: readonly string[] = [],
): WorkspaceAccess {
  return {
    async handlePublic() { return false; },
    async authorize(_req, auth) {
      if (!entitled()) return { status: 503, error: "Fixture admin entitlement is unavailable." };
      if (auth.kind === "session" && auth.session.membershipAuthority === "portal" && sessionIds.includes(auth.session.id)) return null;
      return { status: 401, error: "A pre-issued fixture session is required." };
    },
    async revalidate() {},
  };
}
