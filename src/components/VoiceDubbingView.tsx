import React, { useState } from 'react';
import { SpeakerProfile, TranscriptSegment } from '../types';
import { 
  Volume2, Sliders, Play, Minimize2, Move, Sparkles, 
  Settings, Zap, CheckCircle2, AlertCircle, Info, RefreshCw
} from 'lucide-react';

interface VoiceDubbingViewProps {
  speakers: SpeakerProfile[];
  segments: TranscriptSegment[];
  onUpdateSpeakers: (updated: SpeakerProfile[]) => void;
  onUpdateSegments: (updated: TranscriptSegment[]) => void;
  targetLanguage: string;
}

export default function VoiceDubbingView({
  speakers,
  segments,
  onUpdateSpeakers,
  onUpdateSegments,
  targetLanguage
}: VoiceDubbingViewProps) {
  const [selectedSpeakerId, setSelectedSpeakerId] = useState<string>(speakers[0]?.speaker_id || '');
  
  // Audio Mixing Level State (Values: 0 to 100)
  const [dialogueVolume, setDialogueVolume] = useState(100);
  const [musicVolume, setMusicVolume] = useState(65);
  const [effectsVolume, setEffectsVolume] = useState(80);
  const [ambientVolume, setAmbientVolume] = useState(40);

  // Lip Sync Configurations
  const [lipSyncMode, setLipSyncMode] = useState<'Fast' | 'Balanced' | 'Studio'>('Balanced');
  const [syncScore, setSyncScore] = useState(96);
  const [frameError, setFrameError] = useState(1.4);
  const [isLipSyncing, setIsLipSyncing] = useState(false);

  // Preview voice state (feedback parameters)
  const [previewingId, setPreviewingId] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [speechWarning, setSpeechWarning] = useState<string | null>(null);

  const selectedSpeaker = speakers.find(s => s.speaker_id === selectedSpeakerId);

  const handleSpeakerSliderChange = (field: keyof SpeakerProfile, value: number) => {
    if (!selectedSpeaker) return;
    const updated = speakers.map(spk => {
      if (spk.speaker_id === selectedSpeakerId) {
        return { ...spk, [field]: value };
      }
      return spk;
    });
    onUpdateSpeakers(updated);
  };

  const handleSpeakerStringChange = (field: keyof SpeakerProfile, value: string) => {
    if (!selectedSpeaker) return;
    const updated = speakers.map(spk => {
      if (spk.speaker_id === selectedSpeakerId) {
        return { ...spk, [field]: value };
      }
      return spk;
    });
    onUpdateSpeakers(updated);
  };

  // Preview Speech generator using local synthesis or call server
  const handlePreviewVoice = async () => {
    if (!selectedSpeaker) return;
    setPreviewingId(selectedSpeaker.speaker_id);
    setSpeechWarning(null);
    
    const sampleLine = segments.find(s => s.speaker === selectedSpeaker.name)?.adapted_translation || "Hello context synthesizer dialogue.";
    
    try {
      const g_voiceMap: Record<string, string> = {
        'male': 'Fenrir',
        'female': 'Kore',
        'neutral': 'Zephyr'
      };
      const matchingVoice = g_voiceMap[selectedSpeaker.gender] || 'Zephyr';

      const response = await fetch('/api/dub-audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sampleLine,
          speakerName: selectedSpeaker.name,
          voiceName: matchingVoice,
          emotion: selectedSpeaker.emotion,
          speed: selectedSpeaker.speed
        })
      });
      const data = await response.json();
      
      if (data.success && data.audio_data) {
        // Playback real base64 binary PCM audio chunk
        const snd = new Audio(`data:audio/wav;base64,${data.audio_data}`);
        snd.volume = dialogueVolume / 100;
        snd.play();
      } else {
        // Fallback to standard client Speech Synthesis if key not defined / failed
        // Browser speech synthesis setup
        if ('speechSynthesis' in window) {
          const utterance = new SpeechSynthesisUtterance(sampleLine);
          // try finding appropriate voice
          const voices = window.speechSynthesis.getVoices();
          const mappedLang = targetLanguage.startsWith("Span") ? "es" : 
                            targetLanguage.startsWith("Fren") ? "fr" : 
                            targetLanguage.startsWith("Ger") ? "de" : "en";
          
          const validVoice = voices.find(v => v.lang.startsWith(mappedLang));
          if (validVoice) utterance.voice = validVoice;
          
          utterance.pitch = selectedSpeaker.gender === 'male' ? 0.8 : selectedSpeaker.gender === 'female' ? 1.2 : 1.0;
          utterance.rate = selectedSpeaker.speed;
          utterance.volume = dialogueVolume / 100;
          
          window.speechSynthesis.speak(utterance);
        } else {
          setSpeechWarning("Local Speech Synthesis interface is not active in this environment.");
        }
      }
    } catch (err) {
      console.warn("Audio Synthesis play failed:", err);
      setSpeechWarning("Speech engine failed to render audio feedback track.");
    } finally {
      setPreviewingId(null);
    }
  };

  // Simulate lip sync run
  const handleTriggerLipSync = () => {
    setIsLipSyncing(true);
    const prevScore = syncScore;
    const interval = setTimeout(() => {
      setIsLipSyncing(false);
      // Give a tiny random flutter to score cards after re-render optimization
      const improvement = lipSyncMode === 'Studio' ? 2 : lipSyncMode === 'Balanced' ? 1 : 0;
      setSyncScore(Math.min(100, 94 + improvement + Math.floor(Math.random() * 3)));
      setFrameError(Math.max(0.1, 1.2 - (improvement * 0.3) + parseFloat((Math.random() * 0.4).toFixed(1))));
    }, 1500);
  };

  return (
    <div id="voice-dubbing-tab" className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns: AI Voice Dubbing Parameter Sliders */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 shadow-sm text-white">
            <div className="flex items-center justify-between border-b border-[#222] pb-3">
              <h2 className="text-white text-[11px] font-bold flex items-center gap-2 uppercase">
                <Sliders className="w-5 h-5 text-[#FF4400]" />
                DUBBING PROFILE CONFIGURATION
              </h2>
              
              <select
                value={selectedSpeakerId}
                onChange={(e) => setSelectedSpeakerId(e.target.value)}
                className="text-[10px] font-bold bg-black border border-[#222] text-white p-1.5 outline-none uppercase"
              >
                {speakers.map(sp => (
                  <option key={sp.speaker_id} value={sp.speaker_id}>{sp.name.toUpperCase()}</option>
                ))}
              </select>
            </div>

            {selectedSpeaker ? (
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Emotion Preset</label>
                    <select
                      value={selectedSpeaker.emotion}
                      onChange={(e: any) => handleSpeakerStringChange('emotion', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-black border border-[#222] text-white outline-none uppercase"
                    >
                      <option value="neutral">Neutral</option>
                      <option value="cheerful">Cheerful / Playful</option>
                      <option value="excited">Excited</option>
                      <option value="serious">Serious / Stern</option>
                      <option value="whispered">Whispered / Private</option>
                      <option value="sad">Sad / Sobbing</option>
                      <option value="angry">Angry / Agitated</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase mb-1">Target Accent Location</label>
                    <select
                      value={selectedSpeaker.accent}
                      onChange={(e) => handleSpeakerStringChange('accent', e.target.value)}
                      className="w-full text-xs px-3 py-2 bg-black border border-[#222] text-white outline-none uppercase"
                    >
                      <option>US Standard English</option>
                      <option>UK Received Pronunciation</option>
                      <option>Spanish Castilian Accent</option>
                      <option>Latin American Spanish</option>
                      <option>Japanese Modern Accent</option>
                      <option>Hindi Northern Style</option>
                    </select>
                  </div>
                </div>

                {/* Range Sliders Controls */}
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium uppercase">
                      <span className="text-slate-400">Voice Similarity (Cloning fidelity)</span>
                      <span className="font-bold text-[#FF4400]">{selectedSpeaker.voice_similarity}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={100}
                      value={selectedSpeaker.voice_similarity}
                      onChange={(e) => handleSpeakerSliderChange('voice_similarity', parseInt(e.target.value))}
                      className="w-full h-1 bg-black rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium uppercase">
                      <span className="text-slate-400">Acoustic Auditory Energy Level</span>
                      <span className="font-bold text-[#FF4400]">{selectedSpeaker.energy}%</span>
                    </div>
                    <input 
                      type="range" 
                      min={0} 
                      max={100}
                      value={selectedSpeaker.energy}
                      onChange={(e) => handleSpeakerSliderChange('energy', parseInt(e.target.value))}
                      className="w-full h-1 bg-black rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-medium uppercase">
                      <span className="text-slate-400">Speaking Pacing / Speed</span>
                      <span className="font-bold text-[#FF4400]">{selectedSpeaker.speed}x</span>
                    </div>
                    <input 
                      type="range" 
                      min={50} 
                      max={200}
                      value={selectedSpeaker.speed * 100}
                      onChange={(e) => handleSpeakerSliderChange('speed', parseFloat((parseInt(e.target.value) / 100).toFixed(2)))}
                      className="w-full h-1 bg-black rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                    />
                  </div>
                </div>

                {/* Synthesis preview test action */}
                <div className="flex flex-col sm:flex-row justify-between items-center bg-[#111] border border-[#222] p-4 mt-2 gap-3">
                  <div className="text-[10px] text-slate-300 flex items-start gap-2 max-w-full">
                    <Info className="w-4 h-4 text-[#FF4400] mt-0.5 flex-shrink-0" />
                    <p className="leading-normal uppercase">
                      Acoustically generate dialog tracks with current emotional properties in <strong>{targetLanguage}</strong> using our voice engine.
                    </p>
                  </div>

                  <button 
                    onClick={handlePreviewVoice}
                    disabled={previewingId === selectedSpeaker.speaker_id}
                    className="flex items-center gap-1.5 px-4 py-2 bg-[#FF4400] hover:bg-[#ff5d24] disabled:bg-slate-800 text-black font-extrabold uppercase transition-all cursor-pointer whitespace-nowrap"
                  >
                    {previewingId === selectedSpeaker.speaker_id ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                        Rendering...
                      </>
                    ) : (
                      <>
                        <Volume2 className="w-4 h-4 text-black" />
                        Preview Voice
                      </>
                    )}
                  </button>
                </div>

                {speechWarning && (
                  <div className="p-3 bg-red-950/30 border border-red-900/40 text-red-400 text-[10px] uppercase">
                    {speechWarning}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-medium uppercase">No active speakers indexed inside project.</p>
            )}
          </div>

          {/* Interactive Lip Sync Controller */}
          <div className="bg-[#0D0D0F] text-white border border-[#222] p-5 space-y-4 shadow-sm">
            <h2 className="text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border-b border-[#222] pb-3 text-[#FF4400]">
              <Zap className="w-4.5 h-4.5" />
              LIP SYNC CO-LATERAL SYNCHRONIZER
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-bold text-slate-500 mb-1">Mouth Flap Sync Rigor Mode</label>
                  <div className="flex gap-1 bg-black p-1 border border-[#222]">
                    {(['Fast', 'Balanced', 'Studio'] as const).map(m => (
                      <button
                        key={m}
                        onClick={() => setLipSyncMode(m)}
                        className={`flex-1 text-center py-1.5 text-[10px] transition-all cursor-pointer font-bold ${
                          lipSyncMode === m 
                            ? 'bg-[#FF4400] text-black' 
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-black border border-[#222] p-3 text-[10px] leading-normal text-slate-400 uppercase">
                  <span className="font-bold text-[#FF4400] block mb-0.5">Viseme Alignment</span>
                  Our Lip Sync engine scans facial structures to synchronise and align initial consonants like <strong>B, P, M</strong>, restoring realistic cinematic continuity.
                </div>
              </div>

              {/* Graphical face visualizer layout */}
              <div className="bg-black border border-[#222] p-4 flex flex-col justify-between items-center relative overflow-hidden min-h-[160px]">
                {/* Simulated mouth visualizer scan graphics */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,68,0,0.03)_1px,transparent_1px)] bg-[size:10px_10px] opacity-40"></div>
                
                {/* Horizontal scanners */}
                <div className="w-full border-t-2 border-dashed border-[#FF4400]/40 absolute top-1/2 -translate-y-1/2 flex items-center justify-between text-[9px] text-[#FF4400] px-3 font-mono">
                  <span>LEFT MESH</span>
                  <span>RIGHT MESH</span>
                </div>

                {isLipSyncing ? (
                  <div className="my-auto flex flex-col items-center gap-2 relative z-10 animate-pulse text-[#FF4400]">
                    <RefreshCw className="w-8 h-8 animate-spin" />
                    <span className="text-[10px] font-mono font-bold tracking-wider uppercase">EXTRACTING LANDMARKS...</span>
                  </div>
                ) : (
                  <div className="my-auto flex flex-col items-center gap-1.5 relative z-10 text-slate-500 font-mono">
                    {/* SVG Face Diagram */}
                    <svg viewBox="0 0 100 100" className="w-14 h-14">
                      <circle cx="50" cy="50" r="45" fill="none" stroke="#FF4400" strokeWidth="2" strokeDasharray="3,3" />
                      {/* Eyes */}
                      <circle cx="35" cy="40" r="4" fill="#666" />
                      <circle cx="65" cy="40" r="4" fill="#666" />
                      {/* Mouth Waveform Lips */}
                      <path d="M 30 65 Q 50 80 70 65 Q 50 68 30 65" fill="#FF4400" stroke="#FF4400" strokeWidth="2" />
                    </svg>
                    <span className="text-[9px] font-bold text-[#FF4400]">GRID CALIBRATION COMPLETE</span>
                  </div>
                )}

                <div className="w-full flex justify-between items-center text-[9px] font-mono text-slate-500 relative z-10 border-t border-[#222] pt-2">
                  <span>ACCURACY: <strong className="text-emerald-400">{syncScore}%</strong></span>
                  <span>AVG ERROR: <strong className="text-[#FF4400]">{frameError} FRAMES</strong></span>
                </div>
              </div>
            </div>

            <button
              onClick={handleTriggerLipSync}
              disabled={isLipSyncing}
              className="w-full py-2 bg-[#FF4400] hover:bg-[#ff5d24] disabled:bg-slate-850 text-black font-extrabold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 fill-current text-black" />
              {isLipSyncing ? 'Recalculating Facemasks...' : 'RECONCILE & RUN LIP SYNC RIG'}
            </button>
          </div>
        </div>

        {/* Right Columns: Audio Mixer Console */}
        <div className="space-y-4">
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-5 shadow-sm text-white">
            <h2 className="text-white text-[11px] font-bold border-b border-[#222] pb-3 uppercase tracking-wider flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-[#FF4400]" />
              SOUND STEM MIXER
            </h2>

            <div className="space-y-4 text-[10px]">
              
              {/* Stem Item: Dialogue */}
              <div className="space-y-1.5 p-3 bg-black border border-[#222] uppercase">
                <div className="flex justify-between font-bold">
                  <span className="text-white">1. DIALOGUE / VOICES</span>
                  <span className="text-[#FF4400]">{dialogueVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-mono w-6">SOLE</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={100}
                    value={dialogueVolume}
                    onChange={(e) => setDialogueVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#222] rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                  />
                  <button className="text-[9px] uppercase font-bold text-[#FF4400] px-1.5 py-0.5 border border-[#222]">Mute</button>
                </div>
              </div>

              {/* Stem Item: Music */}
              <div className="space-y-1.5 p-3 bg-black border border-[#222] uppercase">
                <div className="flex justify-between font-bold">
                  <span className="text-white">2. MUSIC TRACK (BGM)</span>
                  <span className="text-[#FF4400]">{musicVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-mono w-6">BGM</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={100}
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#222] rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                  />
                  <button className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 border border-[#222]">Mute</button>
                </div>
              </div>

              {/* Stem Item: SFX */}
              <div className="space-y-1.5 p-3 bg-black border border-[#222] uppercase">
                <div className="flex justify-between font-bold">
                  <span className="text-white">3. SOUND EFFECTS (SFX)</span>
                  <span className="text-[#FF4400]">{effectsVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-mono w-6">SFX</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={100}
                    value={effectsVolume}
                    onChange={(e) => setEffectsVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#222] rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                  />
                  <button className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 border border-[#222]">Mute</button>
                </div>
              </div>

              {/* Stem Item: Ambient */}
              <div className="space-y-1.5 p-3 bg-black border border-[#222] uppercase">
                <div className="flex justify-between font-bold">
                  <span className="text-white">4. AMBIENCE LOOPS</span>
                  <span className="text-[#FF4400]">{ambientVolume}%</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[9px] text-slate-500 font-mono w-6">ENV</span>
                  <input 
                    type="range" 
                    min={0} 
                    max={100}
                    value={ambientVolume}
                    onChange={(e) => setAmbientVolume(parseInt(e.target.value))}
                    className="flex-1 h-2 bg-[#222] rounded-none appearance-none cursor-pointer accent-[#FF4400]"
                  />
                  <button className="text-[9px] uppercase font-bold text-slate-400 px-1.5 py-0.5 border border-[#222]">Mute</button>
                </div>
              </div>

            </div>

            <div className="pt-2 border-t border-[#222] flex items-center gap-2 bg-black p-2.5 text-[9px] text-slate-400 uppercase leading-normal">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Auto-balancing active: Soundtrack stems will remain preserved during vocal inserts to maintain cinematic loudness standards.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
