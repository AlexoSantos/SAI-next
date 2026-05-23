import { ReactNode } from "react";
import { Sidebar } from "./sidebar";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-screen bg-background overflow-hidden selection:bg-primary/30">
      <Sidebar />
      <main className="flex-1 h-full overflow-y-auto overflow-x-hidden relative">
        <div className="absolute inset-0 pointer-events-none z-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/5 via-background to-background"></div>
        <div className="relative z-10 h-full p-8 max-w-[1600px] mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
