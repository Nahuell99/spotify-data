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

      <div className="privacy-notice">
        <p className="privacy-text">
          <strong>🔒 Privacidad:</strong> Este sitio es un front-end estático. Tus datos <strong>NO se almacenan</strong> en ningún servidor. 
          Todo el procesamiento se realiza en tu navegador. Puedes verificar el código fuente en{" "}
          <a href="https://github.com/Nahuell99/spotify-data" target="_blank" rel="noopener noreferrer" className="github-link">
            GitHub
          </a>.
        </p>
      </div>

      {/* Sección de tutorial */}
      <section className="tutorial-section">
        <h2 className="tutorial-title">¿Cómo obtener tus datos de Spotify?</h2>
        <p className="tutorial-intro">
          Para usar esta herramienta, necesitas los archivos JSON con tu historial de reproducción. 
          Busca archivos que se llamen: <code>Streaming_History_Audio_{`{`}Start-year{`}`}-{`{`}End-year{`}`}_{`{`}Counter{`}`}.json</code>
        </p>

        <div className="tutorial-steps">
          <div className="tutorial-step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h3>Ir al sitio de privacidad de Spotify</h3>
              <p>
                Visita <a href="https://www.spotify.com/account/privacy/" target="_blank" rel="noopener noreferrer" className="external-link">
                  https://www.spotify.com/account/privacy/
                </a>
              </p>
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h3>Iniciar sesión en tu cuenta de Spotify</h3>
              <p>Asegúrate de estar logueado con tu cuenta de Spotify</p>
              <img 
                src={`${import.meta.env.BASE_URL}instructions/Paso 0.png`} 
                alt="Iniciar sesión en Spotify" 
                className="step-image"
              />
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h3>Seleccionar "Extended playback history"</h3>
              <p>En la sección de privacidad, busca la opción "Extended playback history" y selecciónala (mínimo)</p>
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h3>Presionar el botón "Request the data"</h3>
              <p>Haz clic en el botón para solicitar tus datos</p>
              <img 
                src={`${import.meta.env.BASE_URL}instructions/Paso 1.png`} 
                alt="Solicitar datos de Spotify" 
                className="step-image"
              />
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">5</div>
            <div className="step-content">
              <h3>Esperar el email de confirmación</h3>
              <p>Spotify te enviará un email con el asunto "You can now download your extended playback history"</p>
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">6</div>
            <div className="step-content">
              <h3>Descargar desde el sitio oficial</h3>
              <p>Cuando recibas el email, descarga tus datos desde el sitio oficial de Spotify que te proporciona el enlace</p>
              <img 
                src={`${import.meta.env.BASE_URL}instructions/Paso 2.png`} 
                alt="Descargar datos de Spotify" 
                className="step-image"
              />
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">7</div>
            <div className="step-content">
              <h3>Buscar el archivo ZIP descargado</h3>
              <p>Localiza el archivo ZIP que descargaste en tu computadora</p>
              <img 
                src={`${import.meta.env.BASE_URL}instructions/Paso 3.1.png`} 
                alt="Archivo ZIP descargado" 
                className="step-image"
              />
            </div>
          </div>

          <div className="tutorial-step">
            <div className="step-number">8</div>
            <div className="step-content">
              <h3>Descomprimir y buscar los archivos JSON</h3>
              <p>
                Descomprime el archivo ZIP y busca los archivos JSON que se llamen:{" "}
                <code>Streaming_History_Audio_{`{`}Start-year{`}`}-{`{`}End-year{`}`}_{`{`}Counter{`}`}.json</code>
              </p>
              <p className="step-note">Esos son los archivos que debes subir a esta herramienta</p>
              <img 
                src={`${import.meta.env.BASE_URL}instructions/Paso 3.2.png`} 
                alt="Archivos JSON de Spotify" 
                className="step-image"
              />
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};

export default FileUploader;
