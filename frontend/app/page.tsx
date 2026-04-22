import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex-1 flex flex-col items-center justify-center p-8 bg-darker relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/20 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/20 blur-[120px] pointer-events-none" />

      <div className="z-10 text-center max-w-3xl">
        <div className="inline-block px-4 py-2 rounded-full glass-panel text-sm text-primary mb-6 animate-pulse">
          🚀 Phiên bản Beta đã ra mắt
        </div>
        
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
          Học tiếng Anh chưa bao giờ <span className="text-gradient">dễ dàng đến thế</span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
          Đọc báo, xem tài liệu, bôi đen từ vựng và lưu lại ngay lập tức. SNIP-LANG sử dụng AI để phân tích ngữ pháp, từ vựng và gợi ý ngữ cảnh tự động cho bạn.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link href="/login" className="px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-semibold shadow-lg shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all">
            Bắt đầu miễn phí
          </Link>
          <a href="#" className="px-8 py-4 rounded-xl glass-panel text-slate-300 font-semibold hover:bg-white/5 transition-all">
            Cài đặt Extension
          </a>
        </div>
      </div>
    </main>
  )
}
