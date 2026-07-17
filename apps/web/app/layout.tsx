import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NotificationList } from "../components/notification-list";
import "./styles.css";

/** Global metadata for the Taskify browser application. */
export const metadata: Metadata = {
  title: "Taskify",
  description: "Security-first team productivity platform"
};

/** Provides the stable document shell used by every Taskify route. */
export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <header className="site-header">
          <a className="brand" href="/" aria-label="Taskify home">
            Taskify
          </a>
        </header>
        <main>{children}</main>
        <aside className="notification-drawer" aria-label="Active-user notifications">
          <NotificationList />
        </aside>
      </body>
    </html>
  );
}
