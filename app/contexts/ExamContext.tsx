import React, { createContext, useContext, useState, ReactNode } from 'react';

interface ExamContextType {
  exam: any;
  setExam: (exam: any) => void;
  version: any;
  setVersion: (version: any) => void;
  subject: any;
  setSubject: (subject: any) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: ReactNode }) {
  const [exam, setExam] = useState<any>(null);
  const [version, setVersion] = useState<any>(null);
  const [subject, setSubject] = useState<any>(null);

  return (
    <ExamContext.Provider value={{ exam, setExam, version, setVersion, subject, setSubject }}>
      {children}
    </ExamContext.Provider>
  );
}

export function useExam() {
  const context = useContext(ExamContext);
  if (!context) throw new Error('useExam must be used within an ExamProvider');
  return context;
} 