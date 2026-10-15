import type { ReactNode } from "react";

// A template re-mounts on every navigation, so each route's header and sections rise in, staggered.
// Done in CSS (see .page-enter) so no transform is left behind to break fixed-position modals.
export default function Template({ children }: { children: ReactNode }) {
  return <div className="page-enter">{children}</div>;
}
