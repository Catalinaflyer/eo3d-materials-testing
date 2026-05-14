// src/data/polymerReferenceData.js
const polymerReferenceData = [
  {
    Polymer_Class: "PLA",
    Polymer_Family: "PLA",
    Typical_Examples: "Generic PLA; Polymaker PLA",
    Anneal_Benefit: "Conditional",
    Anneal_Notes: "Small HDT/toughness bump; high warp risk—fixture if critical.",
    Print_Temp_C: "200–220",
    Bed_Temp_C: "50–60",
    Enclosure_Needed: "No",
    Moisture_Sensitivity: "Low",
    Notes_TLAR: "Easy, dimensionally stable; heat resistance is the limiter."
  },
  {
    Polymer_Class: "PLA+",
    Polymer_Family: "PLA",
    Typical_Examples: "Tough PLA+; Pro PLA+",
    Anneal_Benefit: "Yes",
    Anneal_Notes: "Useful HDT/toughness gains; expect dimensional change, fixture parts.",
    Print_Temp_C: "210–230",
    Bed_Temp_C: "50–60",
    Enclosure_Needed: "No",
    Moisture_Sensitivity: "Low",
    Notes_TLAR: "Nice middle ground when you want tougher PLA behavior."
  },
  {
    Polymer_Class: "PETG",
    Polymer_Family: "Copolyester",
    Typical_Examples: "Polymaker PETG; generic PETG",
    Anneal_Benefit: "No",
    Anneal_Notes: "Designed amorphous; anneal tends to warp/slump with minimal gain.",
    Print_Temp_C: "235–255",
    Bed_Temp_C: "70–85",
    Enclosure_Needed: "No",
    Moisture_Sensitivity: "Medium",
    Notes_TLAR: "Great layer fusion; strings; decent temp resistance as-printed."
  },
  {
    Polymer_Class: "PCTG",
    Polymer_Family: "Copolyester",
    Typical_Examples: "3D-Fuel Pro PCTG",
    Anneal_Benefit: "No/Conditional",
    Anneal_Notes: "Generally stable; small gains at best, distortion risk.",
    Print_Temp_C: "250–275",
    Bed_Temp_C: "75–90",
    Enclosure_Needed: "No",
    Moisture_Sensitivity: "Medium",
    Notes_TLAR: "PETG-like feel with better clarity/impact in some blends."
  },
  {
    Polymer_Class: "PC",
    Polymer_Family: "Polycarbonate",
    Typical_Examples: "PC; PC-MAX",
    Anneal_Benefit: "Yes",
    Anneal_Notes: "Meaningful HDT/stress-relief; fixture parts; enclosure recommended.",
    Print_Temp_C: "260–290",
    Bed_Temp_C: "90–110",
    Enclosure_Needed: "Recommended",
    Moisture_Sensitivity: "High",
    Notes_TLAR: "Strong and heat-capable; wants heat and dry filament."
  },
  {
    Polymer_Class: "PC-CF",
    Polymer_Family: "Polycarbonate",
    Typical_Examples: "PC-CF; PC-CF blends",
    Anneal_Benefit: "Yes",
    Anneal_Notes: "More dimensionally stable than neat PC; still fixture when critical.",
    Print_Temp_C: "260–295",
    Bed_Temp_C: "90–110",
    Enclosure_Needed: "Recommended",
    Moisture_Sensitivity: "High",
    Notes_TLAR: "Great stiffness & heat; fibers help warping and finish."
  },
  {
    Polymer_Class: "PA6/66",
    Polymer_Family: "Polyamide",
    Typical_Examples: "PA6-CF; CoPA",
    Anneal_Benefit: "Conditional",
    Anneal_Notes: "Crystallinity/HDT can improve; warp and moisture are gotchas.",
    Print_Temp_C: "260–290",
    Bed_Temp_C: "70–90",
    Enclosure_Needed: "Recommended",
    Moisture_Sensitivity: "High",
    Notes_TLAR: "Tough with good friction wear; dry it and enclose if you can."
  },
  {
    Polymer_Class: "PA12",
    Polymer_Family: "Polyamide",
    Typical_Examples: "PA12; PA12-CF",
    Anneal_Benefit: "Conditional",
    Anneal_Notes: "Lower warp than PA6/66; benefits exist but geometry-dependent.",
    Print_Temp_C: "250–285",
    Bed_Temp_C: "70–90",
    Enclosure_Needed: "Recommended",
    Moisture_Sensitivity: "Medium/High",
    Notes_TLAR: "More forgiving nylon; still needs dry storage."
  },
  {
    Polymer_Class: "PPA",
    Polymer_Family: "Semi-Aromatic PA",
    Typical_Examples: "PPA-GF; PPA-CF; PPA-CORE",
    Anneal_Benefit: "Yes",
    Anneal_Notes: "High-temp class that responds well; max HDT & stability.",
    Print_Temp_C: "290–320",
    Bed_Temp_C: "80–110",
    Enclosure_Needed: "Required",
    Moisture_Sensitivity: "High",
    Notes_TLAR: "Serious performance; treat like an engineering polymer."
  },
  {
    Polymer_Class: "PPS",
    Polymer_Family: "Aromatic Sulfide",
    Typical_Examples: "PPS-CF",
    Anneal_Benefit: "Yes",
    Anneal_Notes: "Primarily for dimensional stability in high-temp service.",
    Print_Temp_C: "330–360",
    Bed_Temp_C: "80–110",
    Enclosure_Needed: "Required",
    Moisture_Sensitivity: "Low/Medium",
    Notes_TLAR: "Chemically tough, heat beast; print temp is the barrier."
  },
];

export default polymerReferenceData;
