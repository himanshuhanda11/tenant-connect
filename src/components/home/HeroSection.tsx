import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowRight, 
  Play,
  Sparkles,
  CheckCircle,
  Users,
  Pause
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import dashboardVideo from '@/assets/dashboard-demo.mp4';

export default function HeroSection() {
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  return (
    <section className="relative min-h-[80vh] lg:min-h-[85vh] flex items-center bg-white overflow-hidden">
      {/* Subtle background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-10 sm:top-20 right-[5%] sm:right-[10%] w-[200px] sm:w-[350px] lg:w-[450px] h-[200px] sm:h-[350px] lg:h-[450px] bg-gradient-to-br from-green-100/50 via-emerald-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-5 sm:bottom-10 left-[5%] w-[150px] sm:w-[250px] lg:w-[350px] h-[150px] sm:h-[250px] lg:h-[350px] bg-gradient-to-tr from-blue-50/40 via-cyan-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:50px_50px] lg:bg-[size:70px_70px]" />
      </div>

      <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="max-w-6xl mx-auto">
          {/* Text Content - Centered */}
          <div className="text-center max-w-4xl mx-auto mb-8 sm:mb-10 lg:mb-12">
            <Badge className="mb-4 sm:mb-5 bg-green-50 text-green-700 border-green-200 hover:bg-green-100 px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm">
              <Sparkles className="w-3 sm:w-3.5 h-3 sm:h-3.5 mr-1.5 sm:mr-2" />
              AI-Powered WhatsApp Platform
            </Badge>
            
            <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4 sm:mb-5 text-slate-900">
              Run WhatsApp Like a{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-500">
                Growth Machine
              </span>
              {' '}— Powered by AI.
            </h1>
            
            <p className="text-base sm:text-lg lg:text-xl text-slate-600 mb-6 sm:mb-8 max-w-2xl mx-auto">
              AI-driven WhatsApp automation, team inbox, Meta Ads attribution, and flow diagnostics — all in one platform.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col xs:flex-row flex-wrap gap-3 sm:gap-4 mb-4 sm:mb-5 justify-center">
              <Button 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base bg-gradient-to-r from-green-600 to-emerald-500 hover:from-green-700 hover:to-emerald-600 shadow-lg shadow-green-500/25 transition-all hover:shadow-xl hover:shadow-green-500/30" 
                onClick={() => navigate('/signup')}
              >
                Start Free Trial
                <ArrowRight className="w-4 sm:w-5 h-4 sm:h-5 ml-2" />
              </Button>
              <Button 
                variant="outline" 
                size="lg" 
                className="h-12 sm:h-14 px-6 sm:px-8 text-sm sm:text-base border-slate-300 hover:bg-slate-50" 
                onClick={() => navigate('/contact')}
              >
                Book Demo
              </Button>
            </div>

            {/* Trust Line */}
            <div className="text-xs sm:text-sm text-slate-500 flex items-center gap-2 justify-center flex-wrap">
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                No credit card
              </span>
              <span className="text-slate-300">•</span>
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                Setup in minutes
              </span>
              <span className="hidden xs:inline text-slate-300">•</span>
              <span className="hidden xs:flex items-center gap-1">
                <CheckCircle className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-green-500" />
                WhatsApp Cloud API
              </span>
            </div>
          </div>

          {/* Dashboard Video Preview */}
          <div className="relative max-w-5xl mx-auto">
            <div className="relative rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-slate-200 bg-slate-900">
              <video
                ref={videoRef}
                src={dashboardVideo}
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto"
              />
              {/* Play/Pause overlay button */}
              <button
                onClick={togglePlay}
                className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-sm shadow-lg flex items-center justify-center hover:bg-white transition-colors"
              >
                {isPlaying ? (
                  <Pause className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700" />
                ) : (
                  <Play className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 ml-0.5" />
                )}
              </button>
            </div>

            {/* Floating Stats */}
            <div className="absolute -bottom-3 sm:-bottom-5 -left-2 sm:-left-6 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-xl p-2.5 sm:p-4 hidden sm:block">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 sm:w-10 h-8 sm:h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-4 sm:w-5 h-4 sm:h-5 text-green-600" />
                </div>
                <div>
                  <div className="text-sm sm:text-lg font-bold text-slate-900">2,000+</div>
                  <div className="text-[10px] sm:text-xs text-slate-500">Active Teams</div>
                </div>
              </div>
            </div>
            
            <div className="absolute -top-3 sm:-top-5 -right-2 sm:-right-6 bg-white rounded-lg sm:rounded-xl border border-slate-200 shadow-xl p-2.5 sm:p-4 hidden sm:block">
              <div className="text-lg sm:text-2xl font-bold text-green-600">98.5%</div>
              <div className="text-[10px] sm:text-xs text-slate-500">Delivery Rate</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
