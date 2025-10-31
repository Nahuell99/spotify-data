import React, { useState, useMemo } from "react";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    Label,
    ResponsiveContainer,
    Cell
} from "recharts";
import './PlatformDistribution.css';

interface PlatformDistributionProps {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    files: { content: any[] }[];
    fromDate: string;
    toDate: string;
}

interface PlatformCategory {
    nivel1: string;
    nivel2: string;
    nivel3: string;
    nivel4: string;
    original: string;
}

type NavigationPath = {
    level: number;
    value: string;
    parent?: NavigationPath;
};

// Convertir API level a versión de Android
const convertirApiAVersionAndroid = (apiVersion: number): string => {
    const apiToVersion: { [key: number]: string } = {
        19: "Android 4.4.x",
        21: "Android 5.0.x",
        22: "Android 5.1.x",
        23: "Android 6.0.x",
        24: "Android 7.0.x",
        25: "Android 7.1.x",
        26: "Android 8.0.x",
        27: "Android 8.1.x",
        28: "Android 9.x",
        29: "Android 10.x",
        30: "Android 11.x",
        31: "Android 12.x",
        32: "Android 12L",
        33: "Android 13.x"
    };
    return apiToVersion[apiVersion] || `Android (API ${apiVersion})`;
};

// Categorizar plataforma (adaptado del Python)
const categorizarPlataforma = (platform: string): PlatformCategory | null => {
    if (!platform) return null;

    const platformLower = platform.toLowerCase();

    // Nivel 1: Tipo de Plataforma
    let nivel1: string;
    if (platformLower.includes("web_player") || platformLower.includes("partner spotify web_player")) {
        nivel1 = "Web";
    } else if (platformLower.includes("partner") && platformLower.includes("chromecast")) {
        nivel1 = "TV";
    } else if (platformLower.includes("partner")) {
        nivel1 = "Partner";
    } else if (platformLower.includes("android-tablet")) {
        nivel1 = "Tablet";
    } else if (platformLower.includes("android")) {
        nivel1 = "Mobile";
    } else if (platformLower.includes("windows") || platformLower.includes("linux")) {
        nivel1 = "Desktop";
    } else {
        nivel1 = "Otros";
    }

    // Nivel 2: Sistema Operativo
    let nivel2: string;
    if (nivel1 === "Web") {
        nivel2 = "Browser";
    } else if (nivel1 === "Mobile" || nivel1 === "Tablet") {
        nivel2 = "Android";
    } else if (platformLower.includes("windows")) {
        nivel2 = "Windows";
    } else if (platformLower.includes("linux")) {
        nivel2 = "Linux";
    } else if (nivel1 === "TV") {
        nivel2 = "Chromecast";
    } else if (nivel1 === "Partner") {
        nivel2 = "Partner";
    } else {
        nivel2 = "Desconocido";
    }

    // Nivel 3: Versión Principal
    let nivel3: string = "Desconocido";

    if (nivel1 === "Web" && platformLower.includes("chrome")) {
        const chromeMatch = platformLower.match(/chrome[ /-](\d+\.\d+)/);
        if (chromeMatch) {
            nivel3 = `Chrome ${chromeMatch[1]}.x`;
        }
    } else if (nivel2 === "Android") {
        const apiMatch = platformLower.match(/api[ /-](\d+)/);
        if (apiMatch) {
            const apiVersion = parseInt(apiMatch[1]);
            nivel3 = convertirApiAVersionAndroid(apiVersion);
        } else {
            nivel3 = "Android (API desconocido)";
        }
    } else if (nivel2 === "Windows") {
        if (platformLower.includes("windows 7")) {
            nivel3 = "Windows 7";
        } else if (platformLower.includes("windows 10")) {
            nivel3 = "Windows 10";
        } else if (platformLower.includes("windows 11")) {
            nivel3 = "Windows 11";
        } else {
            nivel3 = "Windows";
        }
    } else if (nivel2 === "Linux") {
        nivel3 = "Linux";
    } else if (nivel2 === "Chromecast") {
        nivel3 = "Chromecast";
    } else if (nivel2 === "Partner") {
        nivel3 = "Partner";
    }

    // Nivel 4: Dispositivo/Modelo
    let nivel4: string = "Desconocido";

    if (nivel1 === "Mobile" || nivel1 === "Tablet") {
        const modeloMatch = platform.match(/\(([^,]+),\s*([^)]+)\)/);
        if (modeloMatch) {
            const fabricante = modeloMatch[1].trim();
            const modelo = modeloMatch[2].trim();
            nivel4 = `${fabricante} ${modelo}`;
        } else {
            nivel4 = "Modelo desconocido";
        }
    } else if (nivel1 === "Web") {
        nivel4 = platformLower.includes("desktop") ? "Desktop" : "Web";
    } else if (nivel1 === "Desktop") {
        nivel4 = "PC";
    } else if (nivel1 === "TV") {
        nivel4 = "Google Cast";
    }

    return {
        nivel1,
        nivel2,
        nivel3,
        nivel4,
        original: platform
    };
};

const PlatformDistribution: React.FC<PlatformDistributionProps> = ({
    files,
    fromDate,
    toDate,
}) => {
    const [navigationPath, setNavigationPath] = useState<NavigationPath | null>(null);

    // Filtrar datos por fecha
    const filteredData = useMemo(() => {
        const startDate = fromDate ? new Date(fromDate) : null;
        const endDate = toDate ? new Date(toDate) : null;

        const combinedData = files.flatMap((file) => file.content);

        return combinedData.filter((entry) => {
            const entryDate = new Date(entry.ts);
            const isAfterFrom = startDate ? entryDate >= startDate : true;
            const isBeforeTo = endDate ? entryDate <= endDate : true;
            return isAfterFrom && isBeforeTo;
        });
    }, [files, fromDate, toDate]);

    // Categorizar todas las plataformas
    const categorias = useMemo(() => {
        const cats: PlatformCategory[] = [];
        filteredData.forEach((entry) => {
            if (entry.platform) {
                const categoria = categorizarPlataforma(entry.platform);
                if (categoria) {
                    cats.push(categoria);
                }
            }
        });
        return cats;
    }, [filteredData]);

    // Obtener la ruta completa desde la raíz hasta el nodo actual
    const getFullPath = (path: NavigationPath | null): string[] => {
        const fullPath: string[] = [];
        let current: NavigationPath | null | undefined = path;
        while (current) {
            fullPath.unshift(current.value);
            current = current.parent;
        }
        return fullPath;
    };

    // Obtener datos del nivel actual según la navegación
    const getCurrentLevelData = (): { name: string; count: number }[] => {
        // El nivel actual que vamos a mostrar es navigationPath.level + 1 si existe, sino nivel 1
        const currentLevel = navigationPath ? navigationPath.level + 1 : 1;
        
        // Obtener la ruta completa de selección (valores seleccionados en niveles anteriores)
        const fullPath = getFullPath(navigationPath);
        
        // Filtrar categorías según la ruta de selección
        let filteredCategorias = categorias;
        
        if (fullPath.length > 0) {
            filteredCategorias = categorias.filter(cat => {
                // Si hemos seleccionado nivel 1, filtrar por nivel1
                if (fullPath.length >= 1 && cat.nivel1 !== fullPath[0]) {
                    return false;
                }
                // Si hemos seleccionado nivel 2, filtrar por nivel2
                if (fullPath.length >= 2 && cat.nivel2 !== fullPath[1]) {
                    return false;
                }
                // Si hemos seleccionado nivel 3, filtrar por nivel3
                if (fullPath.length >= 3 && cat.nivel3 !== fullPath[2]) {
                    return false;
                }
                return true;
            });
        }

        // Contar según el nivel actual que vamos a mostrar
        const counts: { [key: string]: number } = {};

        filteredCategorias.forEach(cat => {
            let key: string;
            if (currentLevel === 1) {
                key = cat.nivel1;
            } else if (currentLevel === 2) {
                key = cat.nivel2;
            } else if (currentLevel === 3) {
                key = cat.nivel3;
            } else {
                key = cat.nivel4;
            }

            counts[key] = (counts[key] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    };

    const chartData = getCurrentLevelData();
    const currentLevel = navigationPath ? navigationPath.level + 1 : 1;

    // Obtener título según el nivel
    const getTitle = (): string => {
        if (currentLevel === 1) {
            return "Distribución por Tipo de Plataforma";
        } else if (currentLevel === 2) {
            return `Sistema Operativo - ${navigationPath?.value}`;
        } else if (currentLevel === 3) {
            return `Versión Principal - ${navigationPath?.value}`;
        } else {
            return `Dispositivos/Modelos - ${navigationPath?.value}`;
        }
    };

    // Manejar click en una barra
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleBarClick = (data: any) => {
        if (!data || !data.name) return;

        const clickedValue = data.name;
        const newLevel = currentLevel + 1;

        if (newLevel <= 4) {
            const newPath: NavigationPath = {
                level: newLevel - 1,
                value: clickedValue,
                parent: navigationPath || undefined
            };
            setNavigationPath(newPath);
        }
    };

    // Manejar botón de volver
    const handleGoBack = () => {
        if (navigationPath?.parent) {
            setNavigationPath(navigationPath.parent);
        } else {
            setNavigationPath(null);
        }
    };

    // Colores para las barras
    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#0088fe', '#00c49f', '#ffbb28'];

    const maxCount = Math.max(...chartData.map(d => d.count), 0);
    const adjustedMax = Math.ceil(maxCount * 1.1);

    return (
        <div className="platform-distribution-container">
            <div className="platform-distribution-header">
                <h3 className="platform-distribution-title">{getTitle()}</h3>
                {navigationPath && (
                    <button 
                        className="platform-back-button"
                        onClick={handleGoBack}
                        title="Volver al nivel anterior"
                    >
                        ← Volver
                    </button>
                )}
            </div>
            <div className="platform-distribution-chart-wrapper" style={{ width: '100%', height: '350px' }}>
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                        data={chartData}
                        margin={{ top: 20, right: 5, bottom: 40, left: 5 }}
                        barCategoryGap="1%"
                        maxBarSize={100}
                    >
                        <CartesianGrid strokeDasharray="3 3" stroke="#A1A1AA" />
                        <XAxis 
                            dataKey="name" 
                            stroke="#FFF"
                            angle={-45}
                            textAnchor="end"
                            height={100}
                        >
                            <Label
                                value={currentLevel === 1 ? "Tipo de Plataforma" : currentLevel === 2 ? "Sistema Operativo" : currentLevel === 3 ? "Versión Principal" : "Dispositivo/Modelo"}
                                offset={-10}
                                position="insideBottom"
                                style={{ fill: "#FFF" }}
                            />
                        </XAxis>
                        <YAxis
                            stroke="#FFF"
                            domain={[0, adjustedMax]}
                            tickFormatter={(value) => value.toString()}
                        />
                        <Tooltip 
                            contentStyle={{ backgroundColor: "#333", color: "#FFF" }}
                            cursor={{ fill: 'rgba(255, 255, 255, 0.1)' }}
                        />
                        <Legend wrapperStyle={{ color: "#FFF" }} />
                        <Bar 
                            dataKey="count" 
                            fill="#82ca9d" 
                            name="Cantidad"
                            onClick={currentLevel < 4 ? handleBarClick : undefined}
                            style={currentLevel < 4 ? { cursor: 'pointer' } : {}}
                        >
                            {chartData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                            ))}
                        </Bar>
                    </BarChart>
                </ResponsiveContainer>
            </div>
            {currentLevel < 4 && (
                <p className="platform-hint">💡 Haz clic en una barra para ver más detalles</p>
            )}
        </div>
    );
};

export default PlatformDistribution;

