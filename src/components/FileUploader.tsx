import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import { Link } from 'react-router-dom';

interface UploadedFile {
  name: string;
  content: any;
}

interface FileUploaderProps {
  setFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>; // Definimos que recibimos la función setFiles
}

const FileUploader: React.FC<FileUploaderProps> = ({ setFiles }) => {
  const [files, setLocalFiles] = useState<UploadedFile[]>([]);

  const onDrop = (acceptedFiles: File[]) => {
    const promises = acceptedFiles.map((file) => {
      return file.text().then((content) => ({
        name: file.name,
        content: JSON.parse(content),
      }));
    });

    Promise.all(promises).then((uploadedFiles) => {
      setLocalFiles((prevFiles) => [...prevFiles, ...uploadedFiles]);
      setFiles(uploadedFiles); // Actualizamos el estado global de archivos cargados
      console.log("Archivos cargados:", uploadedFiles);
    });
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Sube tus datos de Spotify</h1>

      <div
        {...getRootProps()}
        style={{
          border: "2px dashed #007bff",
          padding: "20px",
          borderRadius: "5px",
          textAlign: "center",
          cursor: "pointer",
        }}
      >
        <input {...getInputProps()} />
        <p>Arrastra y suelta archivos JSON aquí, o haz clic para seleccionarlos</p>
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


      <div style={{ marginTop: '20px' }}>
        <Link to="/kpi-report">
          <button style={{ padding: "10px 20px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}>
            Generar informe
          </button>
        </Link>
      </div>

    </div>
  );
};

export default FileUploader;
