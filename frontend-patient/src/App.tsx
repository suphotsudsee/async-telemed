import { useCallback, useState } from 'react';
import LoginScreen from './components/LoginScreen';
import ConsultationForm, { ConsultationData } from './components/ConsultationForm';
import HistoryScreen, { saveConsultationHistoryItem } from './components/HistoryScreen';
import ResultScreen from './components/ResultScreen';
import StatusScreen from './components/StatusScreen';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
const HISTORY_BUTTON_TEXT = '\u0e1b\u0e23\u0e30\u0e27\u0e31\u0e15\u0e34\u0e04\u0e33\u0e02\u0e2d';

type AppState =
  | { status: 'login' }
  | { status: 'consultation'; patientId: string; displayName: string }
  | { status: 'history'; patientId: string; displayName: string }
  | { status: 'result'; patientId: string; consultationId: string; data: ConsultationData }
  | { status: 'status'; patientId: string; consultationId: string; data: ConsultationData; returnTo: 'result' | 'history' };

const EMPTY_DATA: ConsultationData = {
  patientId: '',
  provinceCode: '',
  chiefComplaint: '',
  symptomDurationDays: 0,
  redFlags: [],
  imageUrls: []
};

export default function App() {
  const [state, setState] = useState<AppState>({ status: 'login' });

  const handleLogin = useCallback((userId: string, profile: { displayName: string; pictureUrl?: string }) => {
    setState({ status: 'consultation', patientId: userId, displayName: profile.displayName });
  }, []);

  const handleSubmit = useCallback(async (data: ConsultationData): Promise<void> => {
    if (state.status !== 'consultation') return;

    try {
      const response = await fetch(`${API_BASE}/api/v1/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error('Failed to submit consultation');
      }

      const result = await response.json();
      saveConsultationHistoryItem({
        id: result.id,
        patientId: state.patientId,
        chiefComplaint: data.chiefComplaint,
        provinceCode: data.provinceCode,
        submittedAt: result.submittedAt ?? new Date().toISOString()
      });

      setState({
        status: 'result',
        patientId: state.patientId,
        consultationId: result.id,
        data
      });
    } catch (error) {
      alert('\u0e40\u0e01\u0e34\u0e14\u0e02\u0e49\u0e2d\u0e1c\u0e34\u0e14\u0e1e\u0e25\u0e32\u0e14\u0e43\u0e19\u0e01\u0e32\u0e23\u0e2a\u0e48\u0e07\u0e04\u0e33\u0e02\u0e2d \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07');
      throw error;
    }
  }, [state]);

  const handleNewConsultation = useCallback(() => {
    if (state.status !== 'result') return;
    setState({ status: 'consultation', patientId: state.patientId, displayName: 'User' });
  }, [state]);

  const handleViewHistory = useCallback(() => {
    if (state.status === 'login') return;
    setState({
      status: 'history',
      patientId: state.patientId,
      displayName: 'displayName' in state ? state.displayName : 'User'
    });
  }, [state]);

  const handleViewStatus = useCallback(() => {
    if (state.status !== 'result') return;

    if (!state.consultationId) {
      alert('\u0e44\u0e21\u0e48\u0e21\u0e35\u0e2b\u0e21\u0e32\u0e22\u0e40\u0e25\u0e02\u0e04\u0e33\u0e02\u0e2d \u0e01\u0e23\u0e38\u0e13\u0e32\u0e25\u0e2d\u0e07\u0e43\u0e2b\u0e21\u0e48\u0e2d\u0e35\u0e01\u0e04\u0e23\u0e31\u0e49\u0e07');
      return;
    }

    setState({
      status: 'status',
      consultationId: state.consultationId,
      patientId: state.patientId,
      data: state.data,
      returnTo: 'result'
    });
  }, [state]);

  const handleBackFromStatus = useCallback(() => {
    if (state.status !== 'status') return;

    if (state.returnTo === 'history') {
      setState({
        status: 'history',
        patientId: state.patientId,
        displayName: 'User'
      });
      return;
    }

    setState({
      status: 'result',
      patientId: state.patientId,
      consultationId: state.consultationId,
      data: state.data
    });
  }, [state]);

  const handleBackFromHistory = useCallback(() => {
    if (state.status !== 'history') return;
    setState({
      status: 'consultation',
      patientId: state.patientId,
      displayName: state.displayName
    });
  }, [state]);

  const handleOpenHistoryConsultation = useCallback((consultationId: string) => {
    if (state.status !== 'history') return;
    setState({
      status: 'status',
      consultationId,
      patientId: state.patientId,
      data: { ...EMPTY_DATA, patientId: state.patientId },
      returnTo: 'history'
    });
  }, [state]);

  if (state.status === 'login') {
    return <LoginScreen onLogin={handleLogin} />;
  }

  if (state.status === 'consultation') {
    return (
      <>
        <ConsultationForm patientId={state.patientId} onSubmit={handleSubmit} />
        <button
          onClick={handleViewHistory}
          className="fixed right-4 top-4 z-50 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          {HISTORY_BUTTON_TEXT}
        </button>
      </>
    );
  }

  if (state.status === 'history') {
    return (
      <HistoryScreen
        patientId={state.patientId}
        onBack={handleBackFromHistory}
        onOpenConsultation={handleOpenHistoryConsultation}
      />
    );
  }

  if (state.status === 'result') {
    return (
      <ResultScreen
        consultationId={state.consultationId}
        data={state.data}
        onNewConsultation={handleNewConsultation}
        onViewStatus={handleViewStatus}
        onViewHistory={handleViewHistory}
      />
    );
  }

  if (state.status === 'status') {
    return (
      <>
        <StatusScreen
          consultationId={state.consultationId}
          onBack={handleBackFromStatus}
          data={state.data}
        />
        <button
          onClick={handleViewHistory}
          className="fixed right-4 top-4 z-50 rounded-full bg-white/15 px-4 py-2 text-sm font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
        >
          {HISTORY_BUTTON_TEXT}
        </button>
      </>
    );
  }

  return null;
}
