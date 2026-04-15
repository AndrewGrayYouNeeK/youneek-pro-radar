export const RADAR_PRODUCTS = [
  {
    id: "reflectivity",
    label: "Reflectivity",
    description: "Base radar precipitation view",
    tileUrl: "https://tilecache.rainviewer.com/v2/radar/nowcast_0/256/{z}/{x}/{y}/2/1_1.png",
    opacity: 0.72,
    maxNativeZoom: 12,
  },
];

export function getRadarProduct(productId) {
  return RADAR_PRODUCTS.find((product) => product.id === productId) || RADAR_PRODUCTS[0];
}