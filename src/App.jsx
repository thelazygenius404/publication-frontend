import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Editor from './pages/Editor';
import Settings from './pages/Settings';
import Login from './pages/Login'; // Importation de la page Login

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Route publique (sans le menu latéral) */}
        <Route path="/login" element={<Login />} />

        {/* Routes privées (avec le menu latéral) */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="editor" element={<Editor />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;