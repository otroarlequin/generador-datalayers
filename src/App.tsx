import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { SettingsProvider } from '@/context/SettingsContext';
import { GuideEditorPage } from '@/pages/GuideEditorPage';
import { GuidesPage } from '@/pages/GuidesPage';
import { LibraryPage } from '@/pages/LibraryPage';

export default function App() {
  return (
    <SettingsProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/guias" replace />} />
            <Route path="guias" element={<GuidesPage />} />
            <Route path="guia/:guideId" element={<GuideEditorPage />} />
            <Route path="biblioteca" element={<LibraryPage />} />
            <Route path="*" element={<Navigate to="/guias" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </SettingsProvider>
  );
}
