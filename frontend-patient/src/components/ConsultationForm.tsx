import { useState } from 'react';

interface ConsultationFormProps {
  patientId: string;
  onSubmit: (data: ConsultationData) => Promise<void>;
}

export interface ConsultationData {
  patientId: string;
  provinceCode: string;
  chiefComplaint: string;
  symptomDurationDays: number;
  redFlags: string[];
  imageUrls: string[];
}

const PROVINCES = [
  { code: '10', name: 'กรุงเทพมหานคร' },
  { code: '11', name: 'สมุทรปราการ' },
  { code: '12', name: 'นนทบุรี' },
  { code: '13', name: 'ปทุมธานี' },
  { code: '50', name: 'เชียงใหม่' },
  { code: '51', name: 'ลำพูน' },
  { code: '52', name: 'ลำปาง' },
  { code: '83', name: 'ภูเก็ต' }
];

const RED_FLAGS = [
  { id: 'fever', label: 'มีไข้', description: 'ไข้สูงเกิน 38°C' },
  { id: 'rapid-spread', label: 'กระจายเร็ว', description: 'ผื่นลามเร็วใน 24-48 ชม.' },
  { id: 'facial-swelling', label: 'บวมหน้า', description: 'หน้าบวมหรือตาบวม' },
  { id: 'drug-reaction', label: 'แพ้ยา', description: 'คิดว่าเกิดจากยา' },
  { id: 'severe-pain', label: 'ปวดมาก', description: 'ปวดหรือคันมาก' },
  { id: 'blistering', label: 'มีตุ่มน้ำ', description: 'มีตุ่มน้ำหรือแผล' }
];

export default function ConsultationForm({ patientId, onSubmit }: ConsultationFormProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState<ConsultationData>({
    patientId,
    provinceCode: '10',
    chiefComplaint: '',
    symptomDurationDays: 3,
    redFlags: [],
    imageUrls: []
  });

  const [images, setImages] = useState<string[]>([]);

  const updateForm = (updates: Partial<ConsultationData>) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const toggleRedFlag = (flagId: string) => {
    setFormData(prev => ({
      ...prev,
      redFlags: prev.redFlags.includes(flagId)
        ? prev.redFlags.filter(f => f !== flagId)
        : [...prev.redFlags, flagId]
    }));
  };

  const compressImage = (dataUrl: string, maxWidth = 800, maxHeight = 800, quality = 0.7): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions maintaining aspect ratio
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(compressedDataUrl);
        } else {
          resolve(dataUrl);
        }
      };
      img.onerror = () => resolve(dataUrl);
      img.src = dataUrl;
    });
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        if (images.length >= 5) break;

        const reader = new FileReader();
        reader.onload = async (e) => {
          const originalUrl = e.target?.result as string;
          
          // Compress and resize image
          const compressedUrl = await compressImage(originalUrl, 800, 800, 0.7);
          
          setImages(prev => [...prev, compressedUrl]);
          updateForm({ imageUrls: [...formData.imageUrls, compressedUrl] });
          
          // If this is the last file, stop loading
          if (images.length + 1 >= Array.from(files).length || images.length >= 5) {
            setLoading(false);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Image upload failed:', error);
      setLoading(false);
      alert('เกิดข้อผิดพลาดในการอัปโหลดรูปภาพ');
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
    updateForm({ imageUrls: formData.imageUrls.filter((_, i) => i !== index) });
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSubmit(formData);
    } finally {
      setLoading(false);
    }
  };

  const totalSteps = 4;

  return (
    <main className="min-h-screen bg-gradient-to-br from-brand-ink to-brand-navy px-4 py-6">
      <div className="mx-auto max-w-md">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-6">
          {Array.from({ length: totalSteps }, (_, i) => i + 1).map(s => (
            <div
              key={s}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition ${
                s < step
                  ? 'bg-brand-leaf text-white'
                  : s === step
                  ? 'bg-white text-brand-ink'
                  : 'bg-white/20 text-white/50'
              }`}
            >
              {s < step ? '✓' : s}
            </div>
          ))}
        </div>

        {/* Step 1: Province Selection */}
        {step === 1 && (
          <section className="bg-white/10 backdrop-blur rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📍 เลือกจังหวัดที่ต้องการรับบริการ
            </h2>
            <p className="text-white/70 mb-4">
              แพทย์จะถูกจัดสรรตามจังหวัดที่คุณเลือก
            </p>

            <div className="space-y-2 max-h-80 overflow-y-auto">
              {PROVINCES.map(province => (
                <button
                  key={province.code}
                  onClick={() => updateForm({ provinceCode: province.code })}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition ${
                    formData.provinceCode === province.code
                      ? 'bg-brand-leaf text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  {province.name}
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(2)}
              disabled={!formData.provinceCode}
              className="w-full mt-6 bg-brand-leaf disabled:bg-white/20 text-white font-medium py-3 rounded-2xl transition"
            >
              ถัดไป
            </button>
          </section>
        )}

        {/* Step 2: Chief Complaint */}
        {step === 2 && (
          <section className="bg-white/10 backdrop-blur rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📝 อาการหลัก
            </h2>
            
            <div className="mb-4">
              <label className="block text-white/70 mb-2">ระบุอาการที่พบ</label>
              <textarea
                value={formData.chiefComplaint}
                onChange={(e) => updateForm({ chiefComplaint: e.target.value })}
                placeholder="เช่น มีผื่นแดงคันบริเวณแขน 2 วัน"
                className="w-full bg-white/10 text-white rounded-2xl px-4 py-3 min-h-32 placeholder:text-white/40"
              />
            </div>

            <div className="mb-4">
              <label className="block text-white/70 mb-2">เป็นมากี่วันแล้ว?</label>
              <div className="flex items-center gap-3">
                <input
                  type="number"
                  min="1"
                  max="365"
                  value={formData.symptomDurationDays}
                  onChange={(e) => updateForm({ symptomDurationDays: parseInt(e.target.value) || 1 })}
                  className="w-24 bg-white/10 text-white rounded-xl px-4 py-3 text-center"
                />
                <span className="text-white/70">วัน</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white/10 text-white font-medium py-3 rounded-2xl"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={formData.chiefComplaint.length < 10}
                className="flex-1 bg-brand-leaf disabled:bg-white/20 text-white font-medium py-3 rounded-2xl"
              >
                ถัดไป
              </button>
            </div>
          </section>
        )}

        {/* Step 3: Image Upload */}
        {step === 3 && (
          <section className="bg-white/10 backdrop-blur rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              📷 ถ่ายรูปผิวหนัง (ไม่บังคับ)
            </h2>
            <p className="text-white/70 mb-4">
              ถ่ายรูปบริเวณที่มีอาการ (0-5 รูป) - สามารถข้ามได้
            </p>

            {/* Image Previews */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img, i) => (
                <div key={i} className="relative">
                  <img
                    src={img}
                    alt={`Upload ${i + 1}`}
                    className="w-full aspect-square object-cover rounded-2xl"
                  />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs"
                  >
                    ✕
                  </button>
                </div>
              ))}
              
              {images.length < 5 && (
                <label className="w-full aspect-square bg-white/10 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-white/20 transition">
                  <span className="text-3xl">📷</span>
                  <span className="text-white/60 text-sm mt-1">ถ่ายรูป</span>
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white/10 text-white font-medium py-3 rounded-2xl"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-brand-leaf text-white font-medium py-3 rounded-2xl"
              >
                ถัดไป
              </button>
            </div>
          </section>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <section className="bg-white/10 backdrop-blur rounded-3xl p-6">
            <h2 className="text-xl font-semibold text-white mb-4">
              ⚠️ อาการที่ต้องระวัง
            </h2>
            <p className="text-white/70 mb-4">
              เลือกอาการที่เกี่ยวข้อง (ถ้ามี)
            </p>

            <div className="space-y-2 mb-6">
              {RED_FLAGS.map(flag => (
                <button
                  key={flag.id}
                  onClick={() => toggleRedFlag(flag.id)}
                  className={`w-full text-left px-4 py-3 rounded-2xl transition ${
                    formData.redFlags.includes(flag.id)
                      ? 'bg-red-500/80 text-white'
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  <div className="font-medium">{flag.label}</div>
                  <div className="text-sm opacity-70">{flag.description}</div>
                </button>
              ))}
            </div>

            {/* Summary */}
            <div className="bg-white/5 rounded-2xl p-4 mb-6">
              <h3 className="text-white font-medium mb-2">สรุปข้อมูล</h3>
              <div className="space-y-2 text-white/80 text-sm">
                <p>📍 จังหวัด: {PROVINCES.find(p => p.code === formData.provinceCode)?.name}</p>
                <p>📝 อาการ: {formData.chiefComplaint}</p>
                <p>⏱️ เป็นมา: {formData.symptomDurationDays} วัน</p>
                <p>📷 รูป: {images.length} รูป</p>
                {formData.redFlags.length > 0 && (
                  <p>⚠️ อาการเตือน: {formData.redFlags.length} รายการ</p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-white/10 text-white font-medium py-3 rounded-2xl"
              >
                ย้อนกลับ
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 bg-brand-leaf disabled:bg-white/20 text-white font-medium py-3 rounded-2xl"
              >
                {loading ? 'กำลังส่ง...' : 'ส่งคำขอปรึกษา'}
              </button>
            </div>
          </section>
        )}
      </div>
    </main>
  );
}