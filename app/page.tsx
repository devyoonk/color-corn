import ColorExtractor from "@/components/ColorExtractor";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16 bg-[var(--background)]">
      {/* Header bar */}
      <div className="w-full max-w-2xl flex justify-end mb-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-2xl flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Color Extractor
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Upload an image to automatically extract 3–5 dominant colors
          </p>
        </div>

        <ColorExtractor />
      </div>
    </main>
  );
}
