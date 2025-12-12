import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { StudentView } from './views/StudentView';
import { InstructorView } from './views/InstructorView';
import { UserRole } from './types';

const App: React.FC = () => {
  // Simple state to simulate auth/role switching for the prototype
  const [role, setRole] = useState<UserRole>('student');

  return (
    <HashRouter>
      <Layout currentRole={role} onSwitchRole={setRole}>
        {role === 'student' ? (
          <StudentView />
        ) : (
          <InstructorView />
        )}
      </Layout>
    </HashRouter>
  );
};

export default App;