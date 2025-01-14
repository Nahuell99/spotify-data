import './App.css'
import { useState } from "react";
import { Route, Routes, useLocation } from 'react-router-dom';
import KpiReport from './components/KpiReport/KpiReport';
import FileUploader from "./components/FileUploader/FileUploader";




function App() {
  
  const [files, setFiles] = useState<any[]>([]);

  const location = useLocation(); // Obtener la ubicación actual de la ruta

  return (
    <>
      {location.pathname !== '/kpi-report' && <FileUploader setFiles={setFiles} />}


      <Routes>
        <Route path="/kpi-report" element={<KpiReport files={files}/>} />
      </Routes>

    </>
  )
}

export default App
