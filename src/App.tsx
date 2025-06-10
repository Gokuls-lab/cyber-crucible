import { StorageService } from './services/StorageService';

// ...existing code...

function App() {
  // ...existing code...

  useEffect(() => {
    // Load saved selections when app starts
    const savedExam = StorageService.getSelectedExam();
    const savedVersion = StorageService.getSelectedVersion();
    
    if (savedExam) {
      setSelectedExam(savedExam);
    }
    if (savedVersion) {
      setSelectedVersion(savedVersion);
    }
  }, []);

  const handleExamChange = (examId: string) => {
    setSelectedExam(examId);
    StorageService.saveSelectedExam(examId);
  };

  const handleVersionChange = (versionId: string) => {
    setSelectedVersion(versionId);
    StorageService.saveSelectedVersion(versionId);
  };

  // Update your JSX to use the new handlers
  return (
    // ...existing code...
    <select onChange={(e) => handleExamChange(e.target.value)}>
      // ...existing code...
    </select>
    <select onChange={(e) => handleVersionChange(e.target.value)}>
      // ...existing code...
    </select>
    // ...existing code...
  );
}
