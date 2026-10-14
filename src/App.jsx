import React from 'react';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { TaskProvider } from './context/TaskContext';
import { AppLayout } from './components/layout/AppLayout';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <TaskProvider>
          <AppLayout />
        </TaskProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
