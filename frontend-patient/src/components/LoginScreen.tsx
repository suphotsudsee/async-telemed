import { useEffect } from 'react';
import useLiff from '../hooks/useLiff';

interface LoginScreenProps {
  onLogin: (userId: string, profile: { displayName: string; pictureUrl?: string }) => void;
}

const TEXT = {
  loading: 'กำลังเชื่อมต่อ LINE Mini App...',
  errorTitle: 'เปิด LINE Mini App ไม่สำเร็จ',
  retry: 'ลองใหม่อีกครั้ง',
  welcome: 'พร้อมเริ่มใช้งานแล้ว',
  entering: 'กำลังเข้าสู่ระบบ...',
  title: 'ปรึกษาแพทย์ผ่าน LINE',
  subtitle: 'ส่งอาการ รูปภาพ และติดตามผลการประเมินได้ใน LINE Mini App เดียว',
  lineOnly: 'สำหรับการใช้งานจริงใน LINE Mini App ให้ตั้งค่า LIFF ID และเปิดผ่าน LINE OA/แชตที่เชื่อม LIFF ไว้',
  mockMode: 'กำลังทำงานในโหมดทดสอบนอก LINE',
  inLine: 'เปิดอยู่ใน LINE แล้ว',
  signIn: 'เข้าสู่ระบบด้วย LINE',
  featureOne: 'เข้าสู่ระบบด้วยบัญชี LINE อัตโนมัติ',
  featureTwo: 'ส่งรูปอาการและติดตามสถานะคำขอได้ทันที',
  featureThree: 'ใช้งานต่อเนื่องในแอป LINE โดยไม่ต้องเปิดเว็บแยก'
} as const;

export default function LoginScreen({ onLogin }: LoginScreenProps) {
  const { isLoggedIn, profile, userId, isLoading, error, login, isInClient, isMockMode } = useLiff();

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
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
          <p className="text-lg">{TEXT.loading}</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
        <div className="w-full max-w-md rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
          <div className="mb-4 text-5xl">!</div>
          <h1 className="mb-2 text-2xl font-semibold text-white">{TEXT.errorTitle}</h1>
          <p className="mb-6 text-white/70">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full rounded-2xl bg-white py-3 font-medium text-brand-ink transition hover:bg-white/90"
          >
            {TEXT.retry}
          </button>
        </div>
      </main>
    );
  }

  if (isLoggedIn && profile) {
    return (
      <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
        <div className="w-full max-w-md rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white"></div>
          <p className="text-lg text-white">{TEXT.welcome} {profile.displayName}</p>
          <p className="mt-2 text-sm text-white/60">{TEXT.entering}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-brand-ink to-brand-navy">
      <div className="w-full max-w-md rounded-3xl bg-white/10 p-8 text-center backdrop-blur">
        <div className="mb-6 text-6xl">LINE</div>

        <h1 className="mb-2 text-3xl font-bold text-white">{TEXT.title}</h1>
        <p className="mb-6 text-white/70">{TEXT.subtitle}</p>

        <div className="mb-6 space-y-3 text-left">
          <FeatureItem text={TEXT.featureOne} />
          <FeatureItem text={TEXT.featureTwo} />
          <FeatureItem text={TEXT.featureThree} />
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left text-sm text-white/75">
          <div>{isMockMode ? TEXT.mockMode : isInClient ? TEXT.inLine : TEXT.lineOnly}</div>
        </div>

        <button
          onClick={login}
          className="w-full rounded-2xl bg-[#06C755] py-4 font-medium text-white transition hover:bg-[#05A248]"
        >
          {TEXT.signIn}
        </button>
      </div>
    </main>
  );
}

function FeatureItem({ text }: { text: string }) {
  return (
    <div className="rounded-xl bg-white/5 px-4 py-3 text-white/90">
      {text}
    </div>
  );
}
