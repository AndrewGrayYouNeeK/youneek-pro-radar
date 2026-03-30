export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: "Reflectivity",
    description: "Base radar precipitation view",
    tileUrl: "https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png",
    opacity: 0.72,
    maxNativeZoom: 12,
  },
  {
    id: "velocity",
    label: "Velocity",
    description: "Wind motion and rotation view",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0U-0/{z}/{x}/{y}.png",
    opacity: 0.65,
    maxNativeZoom: 12,
  },
  {
    id: "correlation",
    label: "Correlation Coefficient",
    description: "Debris and hydrometeor structure look",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0C-0/{z}/{x}/{y}.png",
    opacity: 0.68,
    maxNativeZoom: 12,
  },
  {
    id: "spectrum",
    label: "Spectrum Width",
    description: "Turbulence and shear texture",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-N0S-0/{z}/{x}/{y}.png",
    opacity: 0.68,
    maxNativeZoom: 12,
  },
  {
    id: "hail",
    label: "Hail Index",
    description: "Hail core spotting view",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-NHI-0/{z}/{x}/{y}.png",
    opacity: 0.68,
    maxNativeZoom: 12,
  },
  {
    id: "echo_tops",
    label: "Echo Tops",
    description: "Storm height and intensity structure",
    tileUrl: "https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/ridge::USCOMP-NET-0/{z}/{x}/{y}.png",
    opacity: 0.66,
    maxNativeZoom: 12,
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}