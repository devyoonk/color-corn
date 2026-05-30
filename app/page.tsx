import ColorExtractor from "@/components/ColorExtractor";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-4 py-16">
      <div className="w-full max-w-2xl flex flex-col gap-10">
        <div className="text-center flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            색상 추출기
          </h1>
          <p className="text-gray-500 text-sm">
            이미지를 업로드하면 주요 색상 3~5개를 자동으로 추출합니다
          </p>
        </div>

        <ColorExtractor />
      </div>
    </main>
  );
}
