import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 bg-[#0a0a0a] overflow-hidden relative">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] left-[20%] w-[60%] h-[60%] bg-indigo-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />
      </div>

      <div className="z-10 flex flex-col items-center text-center max-w-4xl space-y-8 animate-in fade-in zoom-in duration-700">
        {/* Badge */}
        <div className="px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-white/80 shadow-xl backdrop-blur-md">
          ✨ Experience the future of connection
        </div>

        {/* Hero Text */}
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50 pb-2">
          Vibely
        </h1>
        <p className="text-xl md:text-2xl text-zinc-400 max-w-2xl leading-relaxed">
          The premium real-time chat application designed for those who value <span className="text-indigo-400">aesthetics</span> and <span className="text-purple-400">performance</span>.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8">
          <Link href="/login">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full bg-white text-black hover:bg-zinc-200 transition-colors">
              Get Started
            </Button>
          </Link>
          <Link href="/chat">
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full border-white/20 bg-white/5 text-white hover:bg-white/10 backdrop-blur-sm">
              View Demo
            </Button>
          </Link>
        </div>
      </div>

      {/* Footer */}
      <div className="absolute bottom-6 text-zinc-600 text-sm">
        © 2026 Vibely Inc. Crafted with precision.
      </div>
    </div>
  );
}
