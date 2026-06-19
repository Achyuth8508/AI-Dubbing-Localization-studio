import React, { useState, useEffect } from 'react';
import { Project, TranscriptSegment, SpeakerProfile, GlossaryTerm, Comment } from './types';
import DashboardView from './components/DashboardView';
import TranscriptionView from './components/TranscriptionView';
import TranslationView from './components/TranslationView';
import VoiceDubbingView from './components/VoiceDubbingView';
import ReviewStudioView from './components/ReviewStudioView';
import AnalyticsReportView from './components/AnalyticsReportView';
import { 
  Film, Settings, Sparkles, MessageSquare, Award, PlayCircle, 
  ChevronRight, Disc, HardDrive, HelpCircle
} from 'lucide-react';

// Default mock datasets for frictionless instant loading experience
const DEFAULT_PROJECTS: Project[] = [
  {
    project_id: 'proj_cyberpunk',
    title: 'Cyberpunk Cinematic Promo',
    source_language: 'English',
    target_languages: ['Spanish', 'French'],
    status: 'translating',
    owner: 'Director Achyuth',
    created_at: '2026-06-18',
    duration: 45.0,
    resolution: '1920x1080 (16:9)',
    fps: 24,
    channels: 2,
    sample_rate: 48000,
    media_name: 'cyberpunk_intro_directors_cut.mp4',
    media_size: '18.4 MB'
  },
  {
    project_id: 'proj_marketing',
    title: 'Cloud Masterclass Lesson 1',
    source_language: 'English',
    target_languages: ['Japanese', 'Hindi'],
    status: 'draft',
    owner: 'Agency Team',
    created_at: '2026-06-19',
    duration: 120.0,
    resolution: '1920x1080 (16:9)',
    fps: 30,
    channels: 1,
    sample_rate: 44100,
    media_name: 'cloud_tutorial_revised.mp4',
    media_size: '64.2 MB'
  }
];

const DEFAULT_SEGMENTS: TranscriptSegment[] = [
  {
    id: 'seg_1',
    speaker: 'Narrator',
    start: 0.8,
    end: 4.5,
    text: "In the heart of Mega City, shadows don't just protect you—they hide the truth.",
    confidence: 0.96,
    translation: "En el corazón de Mega Ciudad, las sombras no solo te protegen: ocultan la verdad.",
    adapted_translation: "En el corazón de Mega Ciudad, las sombras no te protegen: ocultan la verdad.",
    translation_notes: "Literal adaptation. Adjusted syllable counts for mouth closures.",
    sync_score: 96,
    frame_error: 1.2
  },
  {
    id: 'seg_2',
    speaker: 'Neon Hero',
    start: 4.8,
    end: 9.2,
    text: "Every code has a glitch, and my job is to find yours.",
    confidence: 0.92,
    translation: "Cada código tiene una falla, y mi trabajo es encontrar la tuya.",
    adapted_translation: "Todo código tiene un fallo, mi trabajo es hallar el tuyo.",
    translation_notes: "Used short form 'Todo código' instead of 'Cada código' to trim mouth flap rate.",
    sync_score: 95,
    frame_error: 1.4
  },
  {
    id: 'seg_3',
    speaker: 'Corrupt Executive',
    start: 9.5,
    end: 14.8,
    text: "You think you can disrupt our infrastructure? We own the grid.",
    confidence: 0.87,
    translation: "¿Crees que puedes alterar nuestra infraestructura? Somos dueños de la red.",
    adapted_translation: "¿Crees poder alterar nuestra infraestructura? Mandamos en la red.",
    translation_notes: "Substituted 'Somos dueños de' with 'Mandamos en' for snappy dialogue sync match.",
    sync_score: 93,
    frame_error: 1.8
  },
  {
    id: 'seg_4',
    speaker: 'Cyber Punk AI',
    start: 15.0,
    end: 22.0,
    text: "Warning: Matrix core temperature hazard. Initiate final protocol alignment.",
    confidence: 0.98,
    translation: "Advertencia: Peligro de temperatura del núcleo de la matriz. Iniciar la alineación del protocolo final.",
    adapted_translation: "Alerta: Peligro de calor en núcleo de matriz. Iniciar protocolo final.",
    translation_notes: "Shortened 'Advertencia' to 'Alerta' for mechanical speed matches.",
    sync_score: 97,
    frame_error: 0.8
  }
];

const DEFAULT_SPEAKERS: SpeakerProfile[] = [
  {
    speaker_id: 'spk_1',
    name: 'Narrator',
    gender: 'male',
    voice_profile: 'Deep Cinematic',
    voice_similarity: 94,
    emotion: 'serious',
    energy: 75,
    accent: 'US English',
    speed: 0.95
  },
  {
    speaker_id: 'spk_2',
    name: 'Neon Hero',
    gender: 'male',
    voice_profile: 'Energetic Narrative',
    voice_similarity: 88,
    emotion: 'excited',
    energy: 85,
    accent: 'US English',
    speed: 1.1
  },
  {
    speaker_id: 'spk_3',
    name: 'Corrupt Executive',
    gender: 'female',
    voice_profile: 'Sharp Formal',
    voice_similarity: 90,
    emotion: 'serious',
    energy: 80,
    accent: 'UK English',
    speed: 1.05
  },
  {
    speaker_id: 'spk_4',
    name: 'Cyber Punk AI',
    gender: 'neutral',
    voice_profile: 'Synthetic Bot',
    voice_similarity: 95,
    emotion: 'neutral',
    energy: 90,
    accent: 'US English',
    speed: 1.2
  }
];

const DEFAULT_GLOSSARY: GlossaryTerm[] = [
  { source_term: 'Mega City', target_translation: 'Mega Ciudad', notes: 'Locked canonical title', is_locked: true },
  { source_term: 'the grid', target_translation: 'la red', notes: 'Keep lowercase', is_locked: true },
  { source_term: 'matrix core', target_translation: 'núcleo de matriz', notes: 'Vocal mechanical accent rule', is_locked: true }
];

const DEFAULT_COMMENTS: Comment[] = [
  {
    id: 'comm_1',
    user: 'Sound Editor (Lead)',
    role: 'Admin',
    text: "Vocal sync rate for Neon Hero feels beautifully centered.",
    timestamp: '00:06',
    created_at: '10:14 AM'
  },
  {
    id: 'comm_2',
    user: 'Native Reviewer',
    role: 'Reviewer',
    text: "Adapted Spanish 'la red' is accurate and natural for core terminology.",
    timestamp: '00:11',
    created_at: '11:22 AM'
  }
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transcription' | 'translation' | 'dubbing' | 'review' | 'analytics'>('dashboard');
  
  // App Global State
  const [projects, setProjects] = useState<Project[]>(DEFAULT_PROJECTS);
  const [selectedProjectId, setSelectedProjectId] = useState<string>('proj_cyberpunk');
  const [segments, setSegments] = useState<TranscriptSegment[]>(DEFAULT_SEGMENTS);
  const [speakers, setSpeakers] = useState<SpeakerProfile[]>(DEFAULT_SPEAKERS);
  const [glossary, setGlossary] = useState<GlossaryTerm[]>(DEFAULT_GLOSSARY);
  const [comments, setComments] = useState<Comment[]>(DEFAULT_COMMENTS);
  
  // API Health indicators (Checking Server Connection)
  const [apiHealth, setApiHealth] = useState<{ has_gemini_key: boolean; status: string } | null>(null);

  useEffect(() => {
    // Check if Express backend + Gemini API are accessible
    fetch('/api/health')
      .then(res => res.json())
      .then(data => {
        setApiHealth({
          has_gemini_key: data.has_gemini_key,
          status: data.status
        });
      })
      .catch(err => {
        console.warn("Backend server not connected or loading, using local mocks:", err);
        setApiHealth({
          has_gemini_key: false,
          status: "mock-environment"
        });
      });
  }, []);

  const selectedProject = projects.find(p => p.project_id === selectedProjectId) || null;

  // Global project additions
  const handleAddProject = (newProj: Project) => {
    setProjects([newProj, ...projects]);
    setSelectedProjectId(newProj.project_id);
    // When creating a new project, reset workspaces back to defaults or blank templates
    setSegments([
      {
        id: 'new_seg_1',
        speaker: 'Main Speaker',
        start: 0.5,
        end: 5.2,
        text: "Please revise this initial phrase to activate dialogue translations.",
        confidence: 0.95
      }
    ]);
    setSpeakers([
      {
        speaker_id: 'new_sp_1',
        name: 'Main Speaker',
        gender: 'neutral',
        voice_profile: 'Standard Narrator',
        voice_similarity: 90,
        emotion: 'neutral',
        energy: 80,
        accent: 'US English',
        speed: 1.0
      }
    ]);
  };

  const handleDeleteProject = (id: string) => {
    const next = projects.filter(p => p.project_id !== id);
    setProjects(next);
    if (selectedProjectId === id && next.length > 0) {
      setSelectedProjectId(next[0].project_id);
    }
  };

  const handleUpdateProjectStatus = (status: Project['status']) => {
    setProjects(projects.map(p => p.project_id === selectedProjectId ? { ...p, status } : p));
  };

  const handlePlayAtTime = (startTime: number) => {
    // Shared callback inside studio timeline to automatically switch review player
    setActiveTab('review');
    console.log(`Instructed review sequencer to jump play-head time to: ${startTime}s`);
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col font-sans antialiased text-[#E0E0E0]">
      
      {/* Top Navigation Bar */}
      <nav className="bg-[#0E0E10] border-b border-[#222222] text-[#E0E0E0] shrink-0 sticky top-0 z-40 px-6 py-3 flex items-center justify-between">
        
        {/* Brand signature */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#FF4400] flex items-center justify-center font-bold text-black text-xs font-mono select-none">
            LS
          </div>
          <div>
            <h1 className="font-semibold text-xs tracking-tight uppercase">
              AI DUBBING + LOCALIZATION STUDIO <span className="text-[#555] mx-2">/</span> <span className="text-[#AAA] font-mono lowercase">{selectedProject ? selectedProject.media_name : 'No Session Selected'}</span>
            </h1>
          </div>
        </div>

        {/* Selected Project Quick Navigation widget */}
        {selectedProject && (
          <div className="hidden md:flex items-center gap-3 bg-[#111115] border border-[#222222] py-1 px-3 text-[11px] font-mono text-slate-300">
            <span className="text-[10px] text-[#555] uppercase tracking-wider">Active Workspace:</span>
            <span className="font-bold text-[#E0E0E0]">{selectedProject.title}</span>
            <span className="text-[#333]">|</span>
            <span className="px-1.5 py-0.2 bg-[#FF4400]/20 border border-[#FF4400]/50 text-[#FF4400] text-[9px] font-bold uppercase">
              {selectedProject.status}
            </span>
          </div>
        )}

        {/* Global info indicators */}
        <div className="flex items-center gap-6 text-[11px] font-mono">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[10px] uppercase tracking-widest text-green-500 font-bold">Engine Online</span>
          </div>
          <div className="hidden sm:block text-right">
            <div className="text-[9px] text-[#555] uppercase">Render Time</div>
            <div className="text-[11px] text-slate-300 font-mono">04:12:09</div>
          </div>
        </div>
      </nav>

      {/* Tab switchers bar */}
      <nav id="studio-workspaces-rail" className="bg-[#0D0D0F] border-b border-[#222222] text-[#888888] shrink-0 sticky top-[53px] z-30 px-6 overflow-x-auto flex gap-1 text-[11px] uppercase tracking-wider font-semibold">
        {[
          { id: 'dashboard', name: 'Dashboard Status' },
          { id: 'transcription', name: 'Transcription / Diarization' },
          { id: 'translation', name: 'Translation Adapt Engine' },
          { id: 'dubbing', name: 'Voice Dubbing Studio' },
          { id: 'review', name: 'Review Timeline console' },
          { id: 'analytics', name: 'Data Metrics Report' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`py-3 px-3 border-r border-t border-transparent transition-all relative flex-shrink-0 cursor-pointer text-xs font-mono select-none ${
              activeTab === tab.id 
                ? 'bg-[#15151A] text-[#FF4400] border-t-2 border-t-[#FF4400] border-x border-x-[#222222]' 
                : 'hover:text-white hover:bg-neutral-900/40'
            }`}
          >
            {tab.name}
          </button>
        ))}
      </nav>

      {/* Main interactive viewport container */}
      <main className="flex-1 overflow-y-auto bg-[#0A0A0C]">
        {activeTab === 'dashboard' && (
          <DashboardView 
            projects={projects}
            selectedProject={selectedProject}
            onSelectProject={(p) => setSelectedProjectId(p.project_id)}
            onAddProject={handleAddProject}
            onDeleteProject={handleDeleteProject}
            apiHealth={apiHealth}
          />
        )}

        {selectedProject ? (
          <>
            {activeTab === 'transcription' && (
              <TranscriptionView 
                segments={segments}
                speakers={speakers}
                onUpdateSegments={setSegments}
                onUpdateSpeakers={setSpeakers}
                onPlayAtTime={handlePlayAtTime}
              />
            )}

            {activeTab === 'translation' && (
              <TranslationView 
                segments={segments}
                targetLanguage={selectedProject.target_languages[0] || 'Spanish'}
                sourceLanguage={selectedProject.source_language}
                glossary={glossary}
                onUpdateSegments={setSegments}
                onUpdateGlossary={setGlossary}
                onPlayAtTime={handlePlayAtTime}
              />
            )}

            {activeTab === 'dubbing' && (
              <VoiceDubbingView 
                speakers={speakers}
                segments={segments}
                onUpdateSpeakers={setSpeakers}
                onUpdateSegments={setSegments}
                targetLanguage={selectedProject.target_languages[0] || 'Spanish'}
              />
            )}

            {activeTab === 'review' && (
              <ReviewStudioView 
                project={selectedProject}
                segments={segments}
                comments={comments}
                onAddComment={(c) => setComments([...comments, c])}
                onUpdateProjectStatus={handleUpdateProjectStatus}
                targetLanguage={selectedProject.target_languages[0] || 'Spanish'}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsReportView />
            )}
          </>
        ) : (
          <div className="p-12 text-center max-w-md mx-auto my-16 bg-[#0D0D0F] border border-[#222222] shadow-2xl space-y-4 text-xs font-mono">
            <HelpCircle className="w-10 h-10 text-[#FF4400]/80 mx-auto" />
            <p className="text-slate-400">NO SESSION LOADED. CHOOSE A LOCALIZATION PROJECT SEQUENCE TO ACCUMULATE AND RENDER POST-PRODUCTION MIX TRACKS.</p>
            <button 
              onClick={() => setActiveTab('dashboard')}
              className="px-5 py-2 bg-[#FF4400] hover:bg-[#ff5d24] text-black font-extrabold uppercase rounded-sm cursor-pointer transition-colors"
            >
              INITIATE WORKSPACE
            </button>
          </div>
        )}
      </main>

      {/* Footer System coordinates */}
      <footer className="h-10 bg-[#000000] border-t border-[#222222] flex items-center px-6 text-[10px] font-mono text-[#555] gap-8 shrink-0">
        <div>SYSTEM: <span className="text-white">v2.0-GRID</span></div>
        <div>ENCODER: <span className="text-white">H.265 / NVENC</span></div>
        <div>MEMORY: <span className="text-white">12.4GB / 64GB</span></div>
        <div className="flex-1"></div>
        <div className="flex gap-4">
          <span>CORES: 6 CONTAINER SLOTS_ACTIVE</span>
          <span className="text-[#FF4400]">LOC_PROTO_ALPHA</span>
        </div>
      </footer>
    </div>
  );
}
