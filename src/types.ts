/**
 * Project and Core Workflow types for the AI Dubbing + Localization Studio
 */

export type ProjectStatus = 'draft' | 'transcribing' | 'translating' | 'dubbing' | 'rendering' | 'completed';

export interface Project {
  project_id: string;
  title: string;
  source_language: string;
  target_languages: string[];
  status: ProjectStatus;
  owner: string;
  created_at: string;
  duration?: number; // in seconds
  resolution?: string; // e.g. "1920x1080"
  fps?: number;
  channels?: number;
  sample_rate?: number; // in Hz
  media_url?: string;
  media_name?: string;
  media_size?: string;
}

export interface TranscriptSegment {
  id: string;
  speaker: string;
  start: number; // in seconds
  end: number; // in seconds
  text: string;
  confidence: number; // 0 to 1
  translation?: string;
  adapted_translation?: string;
  translation_notes?: string;
  translation_confidence?: number;
  sync_score?: number; // 0 to 100
  frame_error?: number; // in frames
  dub_audio_base64?: string; // from TTS
}

export interface SpeakerProfile {
  speaker_id: string;
  name: string;
  gender: 'male' | 'female' | 'neutral';
  voice_profile: string; // e.g., "Deep Cinematic", "Warm Narrative"
  voice_similarity: number; // 0 to 100
  emotion: 'neutral' | 'cheerful' | 'excited' | 'serious' | 'whispered' | 'sad' | 'angry';
  energy: number; // 0 to 100
  accent: string; // e.g. "US English", "British", "Neutral Spanish"
  speed: number; // 0.5 to 2.0
}

export interface GlossaryTerm {
  source_term: string;
  target_translation: string;
  notes?: string;
  is_locked: boolean;
}

export interface Comment {
  id: string;
  user: string;
  role: string;
  text: string;
  timestamp: string; // duration timestamp e.g. "00:15"
  created_at: string;
}

export interface RenderPreset {
  id: string;
  name: string;
  resolution: string;
  fps: number;
  format: 'MP4' | 'MOV' | 'MKV';
  video_codec: string;
  audio_codec: string;
}

export interface QAReport {
  translation_quality: number; // 0 to 100
  voice_similarity: number; // 0 to 100
  lip_accuracy: number; // 0 to 100
  audio_quality: number; // 0 to 100
  timing_match: number; // 0 to 100
  overall_score: number; // average
  issues: string[];
}
