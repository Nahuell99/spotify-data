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

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: { "application/json": [".json"] },
  });

  return (
    <div className="file-uploader">
      <h1>Subí tus datos json de Spotify</h1>
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
          <button className="generar-informe">
            Generar informe
          </button>
        </Link>
      </div>

    </div>
  );
};

export default FileUploader;
