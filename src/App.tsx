import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/Header';
import { LessonList } from './components/LessonList';
import { CreateLesson } from './components/CreateLesson';
import { Flashbar } from './components/Flashbar';
import { useState, createContext, useContext } from 'react';

interface FlashbarContextType {
  showFlashbar: (message: string) => void;
}

export const FlashbarContext = createContext<FlashbarContextType>({
  showFlashbar: () => {},
});

export const useFlashbar = () => useContext(FlashbarContext);

function App() {
  const [flashbar, setFlashbar] = useState<{ show: boolean; message: string }>({
    show: false,
    message: '',
  });

  const showFlashbar = (message: string) => {
    setFlashbar({ show: true, message });
  };

  return (
    <FlashbarContext.Provider value={{ showFlashbar }}>
      <div className="min-h-screen bg-gray-50">
        <Header />
        {flashbar.show && (
          <Flashbar
            message={flashbar.message}
            onClose={() => setFlashbar({ show: false, message: '' })}
          />
        )}
        <Routes>
          <Route path="/" element={<LessonList />} />
          <Route path="/create" element={<CreateLesson />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </FlashbarContext.Provider>
  );
}

export default App;