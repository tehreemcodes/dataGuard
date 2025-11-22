import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import UploadDataset from "./pages/UploadDataset";
import CreatePolicy from "./pages/CreatePolicy";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/upload" element={<UploadDataset />} />
        <Route path="/policy" element={<CreatePolicy />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
