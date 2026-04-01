import { Navigate, Route, Routes } from "react-router-dom";

import { Home } from "./pages/Home";
import { MultiRoom } from "./pages/MultiRoom";
import { Result } from "./pages/Result";
import { SingleGame } from "./pages/SingleGame";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/single/:storyId" element={<SingleGame />} />
      <Route path="/multi/room/:roomId" element={<MultiRoom />} />
      <Route path="/result/:storyId" element={<Result />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
