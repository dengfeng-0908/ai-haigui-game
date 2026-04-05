import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { MultiRoom } from "./pages/MultiRoom";
import { Result } from "./pages/Result";
import { SingleGame } from "./pages/SingleGame";

export default function App() {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(56,189,248,0.12),transparent_32%),radial-gradient(circle_at_80%_20%,rgba(245,158,11,0.1),transparent_28%),linear-gradient(180deg,#020617_0%,#04101f_45%,#01040c_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 top-0 -z-10 h-72 bg-[radial-gradient(circle,rgba(148,163,184,0.16),transparent_58%)] blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none fixed inset-x-0 bottom-[-10rem] -z-10 h-96 bg-[radial-gradient(circle,rgba(14,165,233,0.12),transparent_60%)] blur-3xl"
      />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/single/:storyId" element={<SingleGame />} />
        <Route path="/multi/room/:roomId" element={<MultiRoom />} />
        <Route path="/result/:storyId" element={<Result />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
