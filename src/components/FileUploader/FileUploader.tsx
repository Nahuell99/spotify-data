import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from 'react-router-dom';
import './FileUploader.css';

interface UploadedFile {
  name: string;
  content: any;
}

interface FileUploaderProps {
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
}

const FileUploader: React.FC<FileUploaderProps> = ({ setFiles }) => {
  const [files, setLocalFiles] = useState<UploadedFile[]>([]);
  const [isLoadingSamples, setIsLoadingSamples] = useState<boolean>(false);

  const onDrop = (acceptedFiles: File[]) => {
    const promises = acceptedFiles.map((file) => {
      return file.text().then((content) => ({
        name: file.name,
        content: JSON.parse(content),
      }));
    });

    Promise.all(promises).then((uploadedFiles) => {
      setLocalFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      setFiles(uploadedFiles);
      console.log("Archivos cargados:", uploadedFiles);
    });
  };

  const loadSampleData = async () => {
    const sampleFiles = [
      'Streaming_History_Audio_2016-2018_0.json',
      'Streaming_History_Audio_2018-2020_1.json',
      'Streaming_History_Audio_2020-2022_2.json',
      'Streaming_History_Audio_2022-2024_3.json',
      'Streaming_History_Audio_2024_4.json'
    ];

    setIsLoadingSamples(true);
    try {
      const baseUrl = import.meta.env.BASE_URL || '/';
      const promises = sampleFiles.map(async (filename) => {
        // Los archivos en public/ se sirven desde la raíz considerando el base URL
        // Si baseUrl es '/', usar /data/, si no usar baseUrl/data/
        let url: string;
        if (baseUrl === '/') {
          url = `/data/${filename}`;
        } else {
          // Remover la barra final del baseUrl si existe y construir la URL
          const cleanBase = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
          url = `${cleanBase}/data/${filename}`;
        }
        
        url = url.replace(/\/+/g, '/');
        console.log(`Intentando cargar desde: ${url} (BASE_URL: "${baseUrl}")`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Error al cargar ${filename}: ${response.status} ${response.statusText}`);
        }
        const content = await response.json();
        return {
          name: filename,
          content: content,
        };
      });

      const uploadedFiles = await Promise.all(promises);
      setLocalFiles(uploadedFiles);
      setFiles(uploadedFiles);
      console.log("Datos de muestra cargados:", uploadedFiles);
    } catch (error) {
      console.error("Error al cargar datos de muestra:", error);
      alert("Error al cargar los datos de muestra. Asegúrate de que los archivos estén en la carpeta public/data");
    } finally {
      setIsLoadingSamples(false);
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  return (
    <div className="file-uploader">
      <h1>Subí tus datos json de Spotify</h1>
      
      {/* Botón para cargar datos de muestra */}
      <div className="sample-data-section">
        <button 
          className="sample-data-button" 
          onClick={loadSampleData}
          disabled={isLoadingSamples}
        >
          {isLoadingSamples ? 'Cargando...' : 'Cargar datos de muestra'}
        </button>
        <p className="sample-data-description">
          Carga archivos de ejemplo para ver el informe sin tus propios datos
        </p>
      </div>

      <div className="separator">O</div>

      <div className="drag-and-drop" {...getRootProps()}>
        <input {...getInputProps()} />
        <p>Arrastrá y soltá los archivos JSON aquí, o haz clic para seleccionarlos</p>
        {files.length > 0 && (
          <div style={{ marginTop: "20px" }}>
            <h4>Archivos cargados:</h4>
            <ul>
              {files.map((file, index) => (
                <li key={index}>{file.name}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div className="divButton">
        <Link to="/kpi-report">
          <button className="generar-informe" disabled={files.length === 0}>
            Generar informe
          </button>
        </Link>
      </div>

    </div>
  );
};

export default FileUploader;
