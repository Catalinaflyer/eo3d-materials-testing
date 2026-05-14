import React, { useEffect, useMemo, useRef, useState } from "react";
import materialTestingData from "./data/materialTestingData";
import polymerReferenceData from "./data/polymerReferenceData";

const LIGHT_THEME = {
  background: "#f7f7f8",
  surface: "#ffffff",
  surfaceAlt: "#f1f3f5",
  text: "#111827",
  textSoft: "#4b5563",
  border: "#d1d5db",
  button: "#e5e7eb",
  buttonActive: "#111827",
  buttonActiveText: "#ffffff",
  shadow: "0 8px 24px rgba(0,0,0,0.08)",
};

const DARK_THEME = {
  background: "#0f1115",
  surface: "#171a21",
  surfaceAlt: "#212632",
  text: "#f3f4f6",
  textSoft: "#c3c8d4",
  border: "#2f3747",
  button: "#232938",
  buttonActive: "#f3f4f6",
  buttonActiveText: "#111827",
  shadow: "0 8px 24px rgba(0,0,0,0.35)",
};

const VIEW_OPTIONS = [
  { id: "chart", label: "Chart" },
  { id: "comparison", label: "Comparison" },
  { id: "polymer", label: "Polymer Reference" },
];

const RIGID_METRICS = [
  { key: "X_Axis_Break_Load", label: "X Axis Peak Load", unit: "Kgf" },
  { key: "X_Axis_Yield_Point", label: "X Axis Peak Point", unit: "mm" },
  { key: "X_Axis_Break_Point", label: "X Axis Break Point", unit: "mm" },
  { key: "Layer_Break", label: "Layer Break", unit: "Kgf" },
  { key: "Direct_Thread_Yield", label: "Direct Thread Yield", unit: "Kgf" },
  { key: "Heat_Set_Yield", label: "Heat Set Yield", unit: "Kgf" },
  { key: "Izod_Shock_Break", label: "Izod Shock Break", unit: "Impact Index" },
  { key: "HDT", label: "HDT (Tested)", unit: "°C" },
];

const FLEXIBLE_METRICS = [
  { key: "Shore_Hardness", label: "Shore Hardness", unit: "Shore A (Tested)" },
  { key: "Layer_Peak", label: "Layer Peak", unit: "Kgf" },
  { key: "Flexible_Layer_Break", label: "Flexible Layer Break", unit: "Kgf" },
  { key: "Dist_Break", label: "Distance to Break", unit: "mm" },
  { key: "Bounce", label: "Bounce", unit: "mm" },
  { key: "Six_mm_Pull", label: "6mm Pull", unit: "Kgf" },
  { key: "Sixty_mm_Stretch", label: "60mm Stretch", unit: "Kgf" },
  { key: "Sixty_mm_Peak", label: "60mm Peak", unit: "mm" },
  { key: "Flex_Izod_Break", label: "Izod Break", unit: "Impact Index" },
];

const FALLBACK_COLORS = [
  "#2563eb",
  "#dc2626",
  "#059669",
  "#d97706",
  "#7c3aed",
  "#0891b2",
  "#be123c",
  "#4f46e5",
  "#ea580c",
  "#16a34a",
  "#9333ea",
  "#0284c7",
];

function useDarkMode() {
  const getPreferred = () => {
    if (typeof window === "undefined") return false;
    const saved = window.localStorage.getItem("eo3d-dark-mode");
    if (saved !== null) return saved === "true";
    return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
  };

  const [isDarkMode, setIsDarkMode] = useState(getPreferred);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => {
      const next = !prev;
      window.localStorage.setItem("eo3d-dark-mode", String(next));
      return next;
    });
  };

  return { isDarkMode, toggleDarkMode };
}

function parseMetricValue(value) {
  if (value === undefined || value === null || value === "" || value === "NA") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function inferMaterialType(item) {
  const explicitType = item.Category || item.MaterialCategory || item.Test_Group || item.Type;
  if (explicitType === "Rigid" || explicitType === "Flexible") return explicitType;

  const flexibleSignals = [
    item.Shore_Hardness,
    item.Layer_Peak,
    item.Flexible_Layer_Break,
    item.Dist_Break,
    item.Bounce,
    item.Six_mm_Pull,
    item.Sixty_mm_Stretch,
    item.Sixty_mm_Peak,
    item.Flex_Izod_Break,
  ].some((value) => parseMetricValue(value) !== null);

  return flexibleSignals ? "Flexible" : "Rigid";
}

function normalizeMaterial(item, index) {
  const type = inferMaterialType(item);
  const metricSet = type === "Flexible" ? FLEXIBLE_METRICS : RIGID_METRICS;

  const normalized = {
    ...item,
    _id: `${item.Material || "material"}-${item.Brand || "brand"}-${index}`,
    _type: type,
    color: item.color || null,
  };

  metricSet.forEach((metric) => {
    normalized[metric.key] = parseMetricValue(item[metric.key]);
  });

  return normalized;
}

function getMetricSet(materialType) {
  return materialType === "Flexible" ? FLEXIBLE_METRICS : RIGID_METRICS;
}

function getMetricByKey(materialType, metricKey) {
  return getMetricSet(materialType).find((metric) => metric.key === metricKey) || null;
}

function getMaterialColor(item, index) {
  return item.color || FALLBACK_COLORS[index % FALLBACK_COLORS.length];
}

function formatMetricValue(value) {
  if (value === null || value === undefined || Number.isNaN(value)) return "NA";
  return Number(value).toFixed(2);
}

function sortByMetric(data, metricKey) {
  return [...data].sort((a, b) => {
    const aVal = a[metricKey] ?? -Infinity;
    const bVal = b[metricKey] ?? -Infinity;
    return bVal - aVal;
  });
}

function sanitizeBrand(brand = "") {
  return brand
    .replace("Siraya Tech", "Siraya")
    .replace("Bambu Lab", "Bambu")
    .replace("Polymaker", "Polymaker")
    .trim();
}

function buildShortChartLabel(item) {
  const material = item.Material || "Unknown";
  const brand = sanitizeBrand(item.Brand || "");

  let shortMaterial = material
    .replace(/^Fiberheart\s+/i, "")
    .replace(/^Fibreheart\s+/i, "")
    .replace(/^Siraya Tech\s+/i, "")
    .replace(/\s+/g, " ")
    .trim();

  if (brand) {
    return `${shortMaterial} (${brand})`;
  }

  return shortMaterial;
}

function truncateText(text, maxLength = 34) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1)}…`;
}

function inputStyle(theme) {
  return {
    width: "100%",
    padding: "11px 12px",
    borderRadius: 12,
    border: `1px solid ${theme.border}`,
    background: theme.surfaceAlt,
    color: theme.text,
    outline: "none",
  };
}

function thStyle(theme) {
  return {
    textAlign: "left",
    padding: "12px 10px",
    borderBottom: `1px solid ${theme.border}`,
    background: theme.surfaceAlt,
    color: theme.text,
    position: "sticky",
    top: 0,
    zIndex: 1,
  };
}

function tdStyle(theme) {
  return {
    padding: "10px",
    borderBottom: `1px solid ${theme.border}`,
    color: theme.text,
    verticalAlign: "top",
  };
}

function tdLabelStyle(theme) {
  return {
    ...tdStyle(theme),
    fontWeight: 700,
    width: 220,
    background: theme.surfaceAlt,
  };
}

function AppButton({ active, onClick, children, theme }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "10px 14px",
        borderRadius: 10,
        border: `1px solid ${active ? theme.buttonActive : theme.border}`,
        background: active ? theme.buttonActive : theme.button,
        color: active ? theme.buttonActiveText : theme.text,
        cursor: "pointer",
        fontWeight: 600,
      }}
    >
      {children}
    </button>
  );
}

function SectionCard({ title, theme, rightContent, children }) {
  return (
    <div
      style={{
        background: theme.surface,
        border: `1px solid ${theme.border}`,
        borderRadius: 18,
        padding: 18,
        boxShadow: theme.shadow,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 12,
          marginBottom: 16,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0, fontSize: 22 }}>{title}</h2>
        {rightContent}
      </div>
      {children}
    </div>
  );
}

function downloadSvgAsImage(svgElement, filename, type = "png") {
  if (!svgElement) return;

  const serializer = new XMLSerializer();
  const svgString = serializer.serializeToString(svgElement);
  const blob = new Blob([svgString], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const img = new Image();

  img.onload = () => {
    const canvas = document.createElement("canvas");
    const width = Number(svgElement.getAttribute("width") || 1400);
    const height = Number(svgElement.getAttribute("height") || 900);

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, 0, 0);

    const mimeType = type === "jpg" ? "image/jpeg" : "image/png";
    const outputUrl = canvas.toDataURL(mimeType, 0.95);

    const link = document.createElement("a");
    link.href = outputUrl;
    link.download = `${filename}.${type}`;
    link.click();

    URL.revokeObjectURL(url);
  };

  img.src = url;
}

function ChartView({
  materials,
  materialType,
  metricKey,
  topCount,
  setTopCount,
  theme,
}) {
  const svgRef = useRef(null);
  const metric = getMetricByKey(materialType, metricKey);
  const sorted = useMemo(() => sortByMetric(materials, metricKey), [materials, metricKey]);
  const visibleMaterials = topCount === "All" ? sorted : sorted.slice(0, Number(topCount));
  const numericValues = visibleMaterials
    .map((item) => item[metricKey])
    .filter((v) => v !== null && v !== undefined);
  const maxValue = Math.max(...numericValues, 1);

  const width = 1400;
  const titleY = 42;
  const subtitleY = 78;
  const topPad = 120;
  const leftPad = 430;
  const rightPad = 110;
  const rowHeight = 38;
  const rowGap = 16;
  const chartWidth = width - leftPad - rightPad;
  const height = Math.max(620, visibleMaterials.length * (rowHeight + rowGap) + 190);

  return (
    <SectionCard
      title="Chart View"
      theme={theme}
      rightContent={
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <select value={topCount} onChange={(e) => setTopCount(e.target.value)} style={inputStyle(theme)}>
            <option value="All">Show All</option>
            <option value="5">Top 5</option>
            <option value="10">Top 10</option>
            <option value="15">Top 15</option>
            <option value="20">Top 20</option>
          </select>
          <AppButton theme={theme} onClick={() => downloadSvgAsImage(svgRef.current, `${metricKey}-chart`, "png")}>
            Download PNG
          </AppButton>
          <AppButton theme={theme} onClick={() => downloadSvgAsImage(svgRef.current, `${metricKey}-chart`, "jpg")}>
            Download JPG
          </AppButton>
        </div>
      }
    >
      <div style={{ overflowX: "auto" }}>
        <svg ref={svgRef} width={width} height={height} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width={width} height={height} fill="#ffffff" />

          <text x="28" y={titleY} fontSize="32" fontWeight="700" fill="#111827">
            EDGE_OF_3D Materials Testing & Comparison
          </text>

          <text x="28" y={subtitleY} fontSize="20" fill="#4b5563">
            {materialType} · {metric?.label || metricKey}
            {metric?.unit ? ` · ${metric.unit}` : ""}
          </text>

          {visibleMaterials.map((item, index) => {
            const y = topPad + index * (rowHeight + rowGap);
            const value = item[metricKey];
            const barWidth = value !== null ? (value / maxValue) * chartWidth : 0;
            const color = getMaterialColor(item, index);
            const shortLabel = truncateText(buildShortChartLabel(item), 36);

            return (
              <g key={item._id}>
                <text
                  x={28}
                  y={y + 24}
                  fontSize="18"
                  fill="#111827"
                  fontWeight="600"
                >
                  {shortLabel}
                </text>

                <rect
                  x={leftPad}
                  y={y}
                  width={chartWidth}
                  height={rowHeight}
                  fill="#e5e7eb"
                  rx="8"
                />

                <rect
                  x={leftPad}
                  y={y}
                  width={barWidth}
                  height={rowHeight}
                  fill={color}
                  rx="8"
                />

                <text
                  x={leftPad + chartWidth + 14}
                  y={y + 24}
                  fontSize="18"
                  fill="#111827"
                  fontWeight="600"
                >
                  {formatMetricValue(value)}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </SectionCard>
  );
}

function ComparisonView({
  materials,
  materialType,
  selectedMaterials,
  setSelectedMaterials,
  theme,
}) {
  const metricSet = getMetricSet(materialType);
  const selectedData = materials.filter((item) => selectedMaterials.includes(item._id));

  const toggleMaterial = (materialId) => {
    setSelectedMaterials((prev) =>
      prev.includes(materialId)
        ? prev.filter((id) => id !== materialId)
        : [...prev, materialId].slice(0, 4)
    );
  };

  return (
    <SectionCard title="Comparison View" theme={theme}>
      <div style={{ display: "grid", gridTemplateColumns: "minmax(260px, 320px) 1fr", gap: 18 }}>
        <div
          style={{
            border: `1px solid ${theme.border}`,
            borderRadius: 14,
            background: theme.surfaceAlt,
            padding: 14,
            maxHeight: 640,
            overflowY: "auto",
          }}
        >
          <div style={{ fontWeight: 700, marginBottom: 10 }}>Select up to 4 materials</div>
          <div style={{ display: "grid", gap: 8 }}>
            {materials.map((item, index) => {
              const active = selectedMaterials.includes(item._id);
              return (
                <button
                  key={item._id}
                  onClick={() => toggleMaterial(item._id)}
                  style={{
                    textAlign: "left",
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: `1px solid ${active ? getMaterialColor(item, index) : theme.border}`,
                    background: active ? theme.button : theme.surface,
                    color: theme.text,
                    cursor: "pointer",
                  }}
                >
                  <div style={{ fontWeight: 700 }}>{item.Material}</div>
                  <div style={{ color: theme.textSoft, fontSize: 13 }}>
                    {(item.Brand || "Unknown brand") + " · " + (item.Polymer || item._type || "")}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 780 }}>
            <thead>
              <tr>
                <th style={thStyle(theme)}>Metric</th>
                {selectedData.map((item) => (
                  <th key={item._id} style={thStyle(theme)}>
                    <div>{item.Material}</div>
                    <div style={{ fontSize: 12, color: theme.textSoft, fontWeight: 500 }}>{item.Brand}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={tdLabelStyle(theme)}>Polymer</td>
                {selectedData.map((item) => (
                  <td key={`${item._id}-polymer`} style={tdStyle(theme)}>
                    {item.Polymer || "NA"}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={tdLabelStyle(theme)}>Color</td>
                {selectedData.map((item) => (
                  <td key={`${item._id}-color`} style={tdStyle(theme)}>
                    {item.Color || "NA"}
                  </td>
                ))}
              </tr>
              <tr>
                <td style={tdLabelStyle(theme)}>Hotend / Bed / Chamber</td>
                {selectedData.map((item) => (
                  <td key={`${item._id}-temps`} style={tdStyle(theme)}>
                    {[item.HotendTemp, item.BedTemp, item.ChamberTemp].filter(Boolean).join(" / ") || "NA"}
                  </td>
                ))}
              </tr>
              {metricSet.map((metric) => (
                <tr key={metric.key}>
                  <td style={tdLabelStyle(theme)}>
                    {metric.label}{metric.unit ? ` · ${metric.unit}` : ""}
                  </td>
                 {selectedData.map((item) => (
                   <td key={`${item._id}-${metric.key}`} style={tdStyle(theme)}>
                     {formatMetricValue(item[metric.key])}
                   </td>
                   ))}
                 </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>
    </SectionCard>
  );
}

function PolymerReferenceView({ theme }) {
  const rows = Array.isArray(polymerReferenceData) ? polymerReferenceData : [];
  const columns = useMemo(() => {
    const first = rows[0];
    return first ? Object.keys(first) : [];
  }, [rows]);

  return (
    <SectionCard title="Polymer Reference" theme={theme}>
      <div style={{ overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 900 }}>
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column} style={thStyle(theme)}>
                  {column.replaceAll("_", " ")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                {columns.map((column) => (
                  <td key={`${index}-${column}`} style={tdStyle(theme)}>
                    {row[column] ?? ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}

export default function App() {
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const theme = isDarkMode ? DARK_THEME : LIGHT_THEME;

  const normalizedMaterials = useMemo(() => {
    const rows = Array.isArray(materialTestingData) ? materialTestingData : [];
    return rows.map((item, index) => normalizeMaterial(item, index));
  }, []);

  const materialTypeOptions = useMemo(() => {
    const detected = [...new Set(normalizedMaterials.map((item) => item._type))];
    return detected.length ? detected : ["Rigid", "Flexible"];
  }, [normalizedMaterials]);

  const [view, setView] = useState("chart");
  const [materialType, setMaterialType] = useState("Rigid");
  const [metricKey, setMetricKey] = useState("X_Axis_Break_Load");
  const [selectedBrand, setSelectedBrand] = useState("All");
  const [search, setSearch] = useState("");
  const [selectedMaterials, setSelectedMaterials] = useState([]);
  const [topCount, setTopCount] = useState("All");

  useEffect(() => {
    if (!materialTypeOptions.includes(materialType)) {
      setMaterialType(materialTypeOptions[0] || "Rigid");
    }
  }, [materialType, materialTypeOptions]);

  const availableMetrics = useMemo(() => getMetricSet(materialType), [materialType]);

  useEffect(() => {
    if (!availableMetrics.some((metric) => metric.key === metricKey)) {
      setMetricKey(availableMetrics[0]?.key || "");
    }
  }, [availableMetrics, metricKey]);

  const filteredByType = useMemo(() => {
    return normalizedMaterials.filter((item) => item._type === materialType);
  }, [normalizedMaterials, materialType]);

  const brands = useMemo(() => {
    return ["All", ...new Set(filteredByType.map((item) => item.Brand).filter(Boolean))];
  }, [filteredByType]);

  const filteredMaterials = useMemo(() => {
    return filteredByType.filter((item) => {
      const brandMatch = selectedBrand === "All" || item.Brand === selectedBrand;
      const searchBlob = `${item.Material || ""} ${item.Brand || ""} ${item.Polymer || ""}`.toLowerCase();
      const searchMatch = !search.trim() || searchBlob.includes(search.trim().toLowerCase());
      return brandMatch && searchMatch;
    });
  }, [filteredByType, selectedBrand, search]);

  useEffect(() => {
    setSelectedMaterials((prev) =>
      prev.filter((id) => filteredMaterials.some((item) => item._id === id)).slice(0, 4)
    );
  }, [filteredMaterials]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: theme.background,
        color: theme.text,
        padding: 20,
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ maxWidth: 1460, margin: "0 auto", display: "grid", gap: 18 }}>
        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 22,
            padding: 20,
            boxShadow: theme.shadow,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 18,
              flexWrap: "wrap",
              alignItems: "center",
            }}
          >
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <img
                src="/eo3d-logo.png"
                alt="EDGE_OF_3D"
                style={{ width: 56, height: 56, objectFit: "contain" }}
              />
              <div>
                <h1 style={{ margin: 0, fontSize: 30 }}>
                  EDGE_OF_3D Materials Testing & Comparison
                </h1>
                <div style={{ color: theme.textSoft, marginTop: 4 }}>
                </div>
              </div>
            </div>

            <AppButton theme={theme} onClick={toggleDarkMode}>
              {isDarkMode ? "Light Mode" : "Dark Mode"}
            </AppButton>
          </div>
        </div>

        <div
          style={{
            background: theme.surface,
            border: `1px solid ${theme.border}`,
            borderRadius: 18,
            padding: 18,
            boxShadow: theme.shadow,
            display: "grid",
            gap: 16,
          }}
        >
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {VIEW_OPTIONS.map((option) => (
              <AppButton
                key={option.id}
                theme={theme}
                active={view === option.id}
                onClick={() => setView(option.id)}
              >
                {option.label}
              </AppButton>
            ))}
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
            {materialTypeOptions.map((type) => (
              <AppButton
                key={type}
                theme={theme}
                active={materialType === type}
                onClick={() => setMaterialType(type)}
              >
                {type}
              </AppButton>
            ))}
          </div>

          {view !== "polymer" && (
            <>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {availableMetrics.map((metric) => (
                  <AppButton
                    key={metric.key}
                    theme={theme}
                    active={metricKey === metric.key}
                    onClick={() => setMetricKey(metric.key)}
                  >
                    {metric.label}
                  </AppButton>
                ))}
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: 12,
                }}
              >
                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: theme.textSoft, fontWeight: 700 }}>Brand</span>
                  <select
                    value={selectedBrand}
                    onChange={(e) => setSelectedBrand(e.target.value)}
                    style={inputStyle(theme)}
                  >
                    {brands.map((brand) => (
                      <option key={brand} value={brand}>
                        {brand}
                      </option>
                    ))}
                  </select>
                </label>

                <label style={{ display: "grid", gap: 6 }}>
                  <span style={{ color: theme.textSoft, fontWeight: 700 }}>Search</span>
                  <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Material, brand, polymer..."
                    style={inputStyle(theme)}
                  />
                </label>

                <div
                  style={{
                    border: `1px solid ${theme.border}`,
                    borderRadius: 12,
                    padding: "11px 12px",
                    background: theme.surfaceAlt,
                    display: "flex",
                    alignItems: "center",
                    fontWeight: 700,
                  }}
                >
                  Showing {filteredMaterials.length} material{filteredMaterials.length === 1 ? "" : "s"}
                </div>
              </div>
            </>
          )}
        </div>

        {view === "chart" && (
          <ChartView
            materials={filteredMaterials}
            materialType={materialType}
            metricKey={metricKey}
            topCount={topCount}
            setTopCount={setTopCount}
            theme={theme}
          />
        )}

        {view === "comparison" && (
          <ComparisonView
            materials={filteredMaterials}
            materialType={materialType}
            selectedMaterials={selectedMaterials}
            setSelectedMaterials={setSelectedMaterials}
            theme={theme}
          />
        )}

        {view === "polymer" && <PolymerReferenceView theme={theme} />}
      </div>
    </div>
  );
}