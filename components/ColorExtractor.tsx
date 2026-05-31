"use client";

import { useCallback, useRef, useState } from "react";
import ColorPalette from "./ColorPalette";

interface ExtractedColor {
  rgb: [number, number, number];
  hex: string;
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    "#" +
    [r, g, b]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function extractDominantColors(
  imageData: Uint8ClampedArray,
  k: number
): [number, number, number][] {
  const pixels: [number, number, number][] = [];
  const step = 8;
  for (let i = 0; i < imageData.length; i += 4 * step) {
    if (imageData[i + 3] < 128) continue;
    pixels.push([imageData[i], imageData[i + 1], imageData[i + 2]]);
  }
  if (pixels.length < k) return pixels.slice(0, k);

  const centroids: [number, number, number][] = [
    pixels[Math.floor(Math.random() * pixels.length)],
  ];
  while (centroids.length < k) {
    const dists = pixels.map((p) =>
      Math.min(
        ...centroids.map(
          (c) => (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2
        )
      )
    );
    const total = dists.reduce((a, b) => a + b, 0);
    let rand = Math.random() * total;
    for (let i = 0; i < dists.length; i++) {
      rand -= dists[i];
      if (rand <= 0) {
        centroids.push(pixels[i]);
        break;
      }
    }
  }

  let current = [...centroids] as [number, number, number][];
  for (let iter = 0; iter < 12; iter++) {
    const clusters: [number, number, number][][] = Array.from({ length: k }, () => []);
    for (const p of pixels) {
      let best = 0;
      let bestDist = Infinity;
      for (let i = 0; i < current.length; i++) {
        const c = current[i];
        const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
        if (d < bestDist) { bestDist = d; best = i; }
      }
      clusters[best].push(p);
    }
    current = clusters.map((cluster, i) => {
      if (cluster.length === 0) return current[i];
      const n = cluster.length;
      const sum = cluster.reduce(
        (acc, p) => [acc[0] + p[0], acc[1] + p[1], acc[2] + p[2]],
        [0, 0, 0]
      );
      return [Math.round(sum[0] / n), Math.round(sum[1] / n), Math.round(sum[2] / n)];
    });
  }

  const clusterSizes = new Array(k).fill(0);
  for (const p of pixels) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < current.length; i++) {
      const c = current[i];
      const d = (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2;
      if (d < bestDist) { bestDist = d; best = i; }
    }
    clusterSizes[best]++;
  }

  return current
    .map((c, i) => ({ color: c, size: clusterSizes[i] }))
    .sort((a, b) => b.size - a.size)
    .map(({ color }) => color);
}

export default function ColorExtractor() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [colors, setColors] = useState<ExtractedColor[]>([]);
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [colorCount, setColorCount] = useState<3 | 4 | 5>(3);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const extractColors = useCallback((url: string) => {
    setLoading(true);
    setColors([]);
    const img = new window.Image();
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxDim = 300;
        const scale = Math.min(1, maxDim / Math.max(img.width, img.height));
        canvas.width = Math.floor(img.width * scale);
        canvas.height = Math.floor(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) throw new Error("canvas context unavailable");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const palette = extractDominantColors(data, 5);
        setColors(palette.map((rgb) => ({ rgb, hex: rgbToHex(rgb[0], rgb[1], rgb[2]) })));
      } catch (err) {
        console.error("Color extraction failed:", err);
      } finally {
        setLoading(false);
      }
    };
    img.onerror = () => setLoading(false);
    img.src = url;
  }, []);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    const url = URL.createObjectURL(file);
    setImageUrl(url);
    extractColors(url);
  }, [extractColors]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-8">
      {/* Upload area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        className={`
          relative flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed cursor-pointer select-none transition-colors
          ${dragging
            ? "border-indigo-400 bg-indigo-50 dark:bg-indigo-950"
            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-800"}
          ${imageUrl ? "min-h-[260px]" : "min-h-[220px] py-12"}
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleInputChange}
        />

        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Uploaded"
            className="max-h-56 max-w-full rounded-xl object-contain shadow"
          />
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-300 dark:text-gray-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"
              />
            </svg>
            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium">
              Drag & drop an image or click to upload
            </p>
            <p className="text-gray-400 dark:text-gray-500 text-xs">PNG, JPG, WEBP, GIF supported</p>
          </>
        )}

        {imageUrl && (
          <p className="absolute bottom-3 text-xs text-gray-400 dark:text-gray-500">
            Click to upload a different image
          </p>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center gap-2 text-gray-500 dark:text-gray-400 text-sm">
          <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-indigo-500 rounded-full animate-spin" />
          Analyzing colors…
        </div>
      )}

      {/* Results */}
      {colors.length > 0 && !loading && (
        <>
          {/* Color count toggle */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Colors</span>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              {([3, 4, 5] as const).map((n) => (
                <button
                  key={n}
                  onClick={() => setColorCount(n)}
                  className={`px-4 py-1.5 text-sm font-semibold transition-colors
                    ${colorCount === n
                      ? "bg-indigo-500 text-white"
                      : "text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <ColorPalette colors={colors.slice(0, colorCount)} />
        </>
      )}
    </div>
  );
}
