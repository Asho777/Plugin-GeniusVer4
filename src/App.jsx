import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Header } from './components/header';
import { Footer } from './components/footer';
import { HomePage } from './pages/home';
import { CreatePage } from './pages/create';
import { TemplatesPage } from './pages/templates';
import { TemplatePreviewPage } from './pages/template-preview';
import { ToastProvider } from './components/ui/toast';

function App() {
  return (
    <Router>
      <ToastProvider>
        <div className="flex flex-col min-h-screen bg-gray-50">
          <Header />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/create" element={<CreatePage />} />
            <Route path="/templates" element={<TemplatesPage />} />
            <Route path="/templates/:templateId" element={<TemplatePreviewPage />} />
          </Routes>
          <Footer />
        </div>
      </ToastProvider>
    </Router>
  );
}

export default App;
