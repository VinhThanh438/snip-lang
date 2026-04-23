import {
  ArrowRight,
  BookOpen,
  Brain,
  Monitor,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#020617] text-white selection:bg-primary/30">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/20">
              <span className="text-xl font-bold">✦</span>
            </div>
            <span className="text-xl font-bold tracking-tighter">
              SNIP-LANG
            </span>
          </div>

          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">
              Tính năng
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Hướng dẫn
            </a>
            <a href="#" className="hover:text-white transition-colors">
              Giá cả
            </a>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-white/5 transition-colors"
            >
              Đăng nhập
            </Link>
            <Link
              href="/login"
              className="px-5 py-2.5 rounded-xl bg-white text-slate-950 text-sm font-bold hover:bg-slate-200 transition-all shadow-xl shadow-white/10"
            >
              Bắt đầu ngay
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 flex flex-col pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[calc(100vh-80px)] flex items-center justify-center px-6 overflow-hidden">
          {/* Ambient Background Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px] animate-pulse" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/20 blur-[120px] animate-pulse" />
            <div className="absolute top-[20%] right-[10%] w-[30%] h-[30%] rounded-full bg-indigo-500/10 blur-[100px]" />
          </div>

          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

          <div className="relative z-10 max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold uppercase tracking-widest mb-6 animate-in fade-in slide-in-from-bottom-4 duration-1000">
              <Sparkles size={12} /> Phiên bản Beta đã ra mắt
            </div>

            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.15] animate-in fade-in slide-in-from-bottom-8 duration-1000 text-white">
              Học tiếng Anh chưa <br className="hidden md:block" /> bao giờ{" "}
              <span className="text-gradient">dễ dàng đến thế</span>
            </h1>

            <p className="text-base md:text-lg text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
              Đọc báo, xem tài liệu, bôi đen từ vựng và lưu lại ngay lập tức.
              SNIP-LANG sử dụng AI để phân tích ngữ pháp, từ vựng và gợi ý ngữ
              cảnh tự động cho bạn.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
              <Link
                href="/login"
                className="group relative px-8 py-4 rounded-xl bg-gradient-to-r from-primary to-secondary text-white font-bold text-base shadow-2xl shadow-primary/25 hover:shadow-primary/40 hover:-translate-y-1 transition-all overflow-hidden"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Bắt đầu miễn phí{" "}
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>

              <a
                href="#"
                className="flex items-center gap-3 px-8 py-4 rounded-xl glass-panel text-slate-300 font-bold text-base hover:bg-white/10 hover:text-white transition-all border border-white/5"
              >
                <Monitor size={20} className="text-blue-400" />
                Cài đặt Extension
              </a>
            </div>

            {/* Social Proof */}
            <div className="mt-16 pt-8 border-t border-white/5 animate-in fade-in duration-1000 delay-500">
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mb-6">
                Được tin dùng bởi hơn 2,000+ người học
              </p>
              <div className="flex flex-wrap justify-center gap-8 md:gap-12 opacity-30 grayscale hover:grayscale-0 transition-all duration-500">
                <div className="text-lg font-black">Medium</div>
                <div className="text-lg font-black">Substack</div>
                <div className="text-lg font-black">Wikipedia</div>
                <div className="text-lg font-black">BBC News</div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview Section */}
        <section id="features" className="py-24 px-6 bg-[#020617] relative">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-8 md:p-10 rounded-[2rem] border border-white/10 hover:border-primary/50 transition-all group flex flex-col h-full hover:-translate-y-2 duration-300 backdrop-blur-sm bg-transparent">
                <div className="w-16 h-16 rounded-2xl bg-primary text-white flex items-center justify-center mb-8 shadow-xl shadow-primary/20">
                  <Brain size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Phân tích bằng AI
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg flex-1">
                  Tự động phân tích ngữ pháp, thì và cách dùng từ trong ngữ cảnh
                  thực tế bạn đang đọc.
                </p>
              </div>

              <div className="p-8 md:p-10 rounded-[2rem] border border-white/10 hover:border-secondary/50 transition-all group flex flex-col h-full hover:-translate-y-2 duration-300 backdrop-blur-sm bg-transparent">
                <div className="w-16 h-16 rounded-2xl bg-secondary text-white flex items-center justify-center mb-8 shadow-xl shadow-secondary/20">
                  <Zap size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Lưu trữ tức thì
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg flex-1">
                  Chỉ cần bôi đen và nhấn lưu. Toàn bộ câu và từ vựng sẽ được
                  đồng bộ vào dashboard của bạn.
                </p>
              </div>

              <div className="p-8 md:p-10 rounded-[2rem] border border-white/10 hover:border-indigo-500/50 transition-all group flex flex-col h-full hover:-translate-y-2 duration-300 backdrop-blur-sm bg-transparent">
                <div className="w-16 h-16 rounded-2xl bg-indigo-500 text-white flex items-center justify-center mb-8 shadow-xl shadow-indigo-500/20">
                  <BookOpen size={32} />
                </div>
                <h3 className="text-2xl font-bold mb-4 text-white">
                  Ôn tập khoa học
                </h3>
                <p className="text-slate-300 leading-relaxed text-lg flex-1">
                  Hệ thống ôn tập SRS (Spaced Repetition) giúp bạn ghi nhớ từ
                  vựng vĩnh viễn với nỗ lực tối thiểu.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-white/5 text-center text-slate-500 text-sm">
        <p>© 2024 SNIP-LANG. Build for better English learning experience.</p>
      </footer>
    </div>
  );
}
