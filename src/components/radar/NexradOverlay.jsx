import { useEffect, useRef } from "react";

/**
 * Draws a live NEXRAD radar image onto the radar canvas as an overlay.
 * The image is fetched from NOAA MRMS and projected onto the circular canvas.
 */
export default function NexradOverlay({ canvasRef, imageUrl, bbox, opacity = 0.75 }) {
  const imgRef = useRef(null);

  useEffect(() => {
    if (!imageUrl) return;
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => { imgRef.current = img; };
  }, [imageUrl]);

  // We expose a draw function that RadarDisplay can call during its animation loop
  // via a shared ref. Instead, we use a second canvas layered on top.
  // Actually: we return a draw callback the parent can call.
  return null; // rendering is done externally via drawOverlay
}

/**
 * Returns a draw function that paints the NEXRAD image onto a canvas context.
 * Call this inside the radar animation loop after clearing/drawing the base layer.
 */
export function createNexradDrawer(imageUrl, bbox) {
  let img = null;
  let loaded = false;

  if (imageUrl) {
    img = new Image();
    img.crossOrigin = "anonymous";
    img.src = imageUrl;
    img.onload = () => { loaded = true; };
  }

  return function drawNexrad(ctx, canvasW, canvasH, radius, cx, cy, opacity = 0.75) {
    if (!img || !loaded || !bbox) return;

    // Save and clip to the radar circle
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, radius, 0, 2 * Math.PI);
    ctx.clip();

    ctx.globalAlpha = opacity;
    ctx.drawImage(img, cx - radius, cy - radius, radius * 2, radius * 2);
    ctx.globalAlpha = 1;

    ctx.restore();
  };
}