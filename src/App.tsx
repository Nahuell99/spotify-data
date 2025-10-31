import './App.css'
import { useState } from "react";
import { Route, Routes } from 'react-router-dom';
import KpiReport from './components/KpiReport/KpiReport';
import FileUploader from "./components/FileUploader/FileUploader";




function App() {
  
  const [files, setFiles] = useState<any[]>([]);

  return (
    <>
      <Routes>
        <Route path="/" element={<FileUploader setFiles={setFiles} />} />
        <Route path="/kpi-report" element={<KpiReport files={files}/>} />
      </Routes>
    </>
  )
}

export default App
