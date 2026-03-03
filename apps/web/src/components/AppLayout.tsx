import { Outlet } from "react-router";
import Navigation from "./Navigation";

export default function AppLayout() {
  return (
    <div className="relative flex h-dvh flex-col">
      <div className="flex-1 isolate overflow-hidden">
        <Outlet />
      </div>
      <Navigation />
    </div>
  );
}
