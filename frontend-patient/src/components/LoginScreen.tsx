import { useEffect } from 'react';
import useLiff from '../hooks/useLiff';

interface LoginScreenProps {
  onLogin: (userId: string, profile: { displayName: string; pictureUrl?: string }) => void;
}

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { isLoggedIn, profile, userId, isLoading, error, login } = useLiff();

  useEffect(() => {
    if (isLoggedIn && userId && profile) {
      onLogin(userId, {
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl
      });
    }
  }, [isLoggedIn, userId, profile, onLogin]);

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-lg">กำลังโหลด...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h1 className="text-2xl font-semibold text-white mb-2">เกิดข้อผิดพลาด</h1>
          <p className="text-white/70 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-white text-brand-ink font-medium py-3 rounded-2xl hover:bg-white/90 transition"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </main>
    );
  }

  if (isLoggedIn && profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
        <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
          <p className="text-lg text-white">ยินดีต้อนรับ, {profile.displayName}</p>
          <p className="text-white/60 text-sm mt-2">กำลังเข้าสู่ระบบ...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
      <div className="bg-white/10 backdrop-blur rounded-3xl p-8 max-w-md w-full text-center">
        {/* Logo */}
        <div className="text-6xl mb-6">🩺</div>
        
        <h1 className="text-3xl font-bold text-white mb-2">Telemed</h1>
        <p className="text-white/70 mb-8">
          ปรึกษาแพทย์ผิวหนังออนไลน์<br />
          สะดวก รวดเร็ว ปลอดภัย
        </p>

        {/* Features */}
        <div className="space-y-3 mb-8 text-left">
          <FeatureItem icon="📱" text="ถ่ายรูปผิวหนัง ส่งให้แพทย์" />
          <FeatureItem icon="⏰" text="ตอบกลับภายใน 4 ชั่วโมง" />
          <FeatureItem icon="💊" text="รับใบสั่งยา e-Prescription" />
          <FeatureItem icon="🔒" text="เข้ารหัสข้อมูล ปลอดภัยตาม PDPA" />
        </div>

        {/* Login Button */}
        <button
          onClick={login}
          className="w-full bg-[#06C755] hover:bg-[#05A248] text-white font-medium py-4 rounded-2xl transition flex items-center justify-center gap-3"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.5 12c0-4.14-3.36-7.5-7.5-7.5S4.5 7.86 4.5 12c0 3.72 2.71 6.8 6.25 7.39v-5.22H8.75V12h2v-1.67c0-1.98 1.18-3.08 2.99-3.08.86 0 1.77.15 1.77.15v1.96h-1c-.98 0-1.28.61-1.28 1.23V12h2.17l-.35 2.17h-1.82v5.22c3.54-.59 6.27-3.67 6.27-7.39z"/>
          </svg>
          เข้าสู่ระบบด้วย LINE
        </button>

        <p className="text-white/50 text-xs mt-6">
          กดเข้าสู่ระบบเพื่อยืนยันตัวตน<br />
          และใช้บริการตรวจทางไกล
        </p>
      </div>
    </main>
  );
}

function FeatureItem({ icon, text }: { icon: string; text: string }) {
  return (
    <div className="flex items-center gap-3 bg-white/5 rounded-xl px-4 py-3">
      <span className="text-2xl">{icon}</span>
      <span className="text-white/90">{text}</span>
    </div>
  );
}