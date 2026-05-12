import { BrowserRouter, Routes, Route } from 'react-router-dom';
import StatusPage from './features/status/pages/StatusPage.jsx';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<StatusPage />} />
      </Routes>
    </BrowserRouter>
  );
}
