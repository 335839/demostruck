import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Assets from './pages/Assets';
import Admin from './pages/Admin';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/assets" element={<Assets />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}
