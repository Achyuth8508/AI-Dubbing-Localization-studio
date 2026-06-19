import React, { useState } from 'react';
import { TranscriptSegment, SpeakerProfile } from '../types';
import { 
  Users, UserPlus, HelpCircle, Save, Mic, AlertTriangle, 
  Tag, Play, Search, Eye, AlertCircle, RefreshCw, Volume2
} from 'lucide-react';

interface TranscriptionViewProps {
  segments: TranscriptSegment[];
  speakers: SpeakerProfile[];
  onUpdateSegments: (updated: TranscriptSegment[]) => void;
  onUpdateSpeakers: (updated: SpeakerProfile[]) => void;
  onPlayAtTime: (start: number) => void;
}

export default function TranscriptionView({
  segments,
  speakers,
  onUpdateSegments,
  onUpdateSpeakers,
  onPlayAtTime
}: TranscriptionViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSegmentId, setEditingSegmentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState('');
  const [editingSpeaker, setEditingSpeaker] = useState('');

  // Speaker Profiler Dialog Box
  const [showSpeakerModal, setShowSpeakerModal] = useState(false);
  const [newSpeakerName, setNewSpeakerName] = useState('');
  const [newSpeakerGender, setNewSpeakerGender] = useState<'male' | 'female' | 'neutral'>('neutral');
  const [newSpeakerVoice, setNewSpeakerVoice] = useState('Deep Narrative');

  const handleEditSegment = (seg: TranscriptSegment) => {
    setEditingSegmentId(seg.id);
    setEditingText(seg.text);
    setEditingSpeaker(seg.speaker);
  };

  const handleSaveSegment = (id: string) => {
    const nextSecs = segments.map(seg => {
      if (seg.id === id) {
        return {
          ...seg,
          text: editingText,
          speaker: editingSpeaker,
          confidence: 1.0 // Overwritten by manual human verify override
        };
      }
      return seg;
    });
    onUpdateSegments(nextSecs);
    setEditingSegmentId(null);
  };

  const handleAddSpeaker = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpeakerName.trim()) return;

    const newProfile: SpeakerProfile = {
      speaker_id: 'spk_' + Math.random().toString(36).substr(2, 5),
      name: newSpeakerName,
      gender: newSpeakerGender,
      voice_profile: newSpeakerVoice,
      voice_similarity: 90,
      emotion: 'neutral',
      energy: 80,
      accent: 'US English',
      speed: 1.0
    };

    onUpdateSpeakers([...speakers, newProfile]);
    setShowSpeakerModal(false);
    setNewSpeakerName('');
  };

  // Find overlap speech timestamps
  const overlaps: Array<{ s1: string; s2: string; start: number; end: number }> = [];
  for (let i = 0; i < segments.length - 1; i++) {
    const cur = segments[i];
    const nxt = segments[i + 1];
    if (cur.end > nxt.start) {
      overlaps.push({
        s1: cur.speaker,
        s2: nxt.speaker,
        start: nxt.start,
        end: Math.min(cur.end, nxt.end)
      });
    }
  }

  const filteredSegments = segments.filter(seg => 
    seg.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    seg.speaker.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div id="transcription-tab" className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Upper Diagnostic Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-[#0D0D0F] border border-[#222] text-white rounded-none p-5 flex items-center gap-4 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Acoustic Word Precision</span>
            <span className="text-xl font-black text-rose-500">94.8%</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">Confidence Score Indicator</span>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#222] text-white rounded-none p-5 flex items-center gap-4 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <Users className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Diarised Voices</span>
            <div className="flex items-center justify-between mt-1 gap-2">
              <span className="text-base font-black text-white">{speakers.length} Speakers</span>
              <button 
                onClick={() => setShowSpeakerModal(true)}
                className="px-2 py-0.5 bg-black hover:bg-[#FF4400] text-[#FF4400] hover:text-black hover:border-transparent text-[9px] font-bold border border-[#333] cursor-pointer"
              >
                + ADD SPEAKER
              </button>
            </div>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#222] text-white rounded-none p-5 flex items-center gap-4 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Overlap / Collisions</span>
            <span className="text-xl font-black text-rose-500">{overlaps.length} Incidents</span>
            <span className="text-[10px] text-rose-500 block mt-0.5">SIMULTANEOUS TALK FLAGGED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Toolbar & Speakers Manager */}
        <div className="space-y-4">
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-white border-b border-[#222] pb-2 text-[11px] uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-[#FF4400]" />
              SPEAKER LOG REGISTRY
            </h3>
            
            <div className="space-y-2.5">
              {speakers.map(spk => (
                <div key={spk.speaker_id} className="p-3 bg-black border border-[#222] flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="font-bold text-[11px] block text-white uppercase">{spk.name}</span>
                    <span className="text-[9px] text-slate-400 block bg-[#111] px-1.5 py-0.5 border border-[#222] uppercase w-max">
                      {spk.voice_profile.slice(0, 15).toUpperCase()} ({spk.gender})
                    </span>
                  </div>
                  
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-[#FF4400] block">{spk.voice_similarity}%</span>
                    <span className="text-[9px] text-slate-500 block uppercase">{spk.accent}</span>
                  </div>
                </div>
              ))}
            </div>

            {overlaps.length > 0 && (
              <div className="bg-rose-950/20 border border-rose-900/30 p-3 space-y-2 mt-4 text-[11px] leading-relaxed">
                <span className="font-bold text-rose-500 block flex items-center gap-1 uppercase">
                  <AlertCircle className="w-3.5 h-3.5" /> Overlap Warnings
                </span>
                <div className="space-y-1.5 text-[9px] text-[#FF4400] font-mono uppercase">
                  {overlaps.map((ov, index) => (
                    <div key={index} className="border-b border-[#222] pb-1 last:border-0 leading-normal">
                      [{ov.start.toFixed(1)}S - {ov.end.toFixed(1)}S] OVERLAP {ov.s1} * {ov.s2}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Area: Interactive Editor Console */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Timeline Search Filter */}
          <div className="flex flex-col md:flex-row gap-3.5 items-center justify-between bg-[#0D0D0F] border border-[#222] p-4 font-mono text-xs text-[#E0E0E0]">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-500 w-4 h-4" />
              <input 
                type="text"
                placeholder="PROMPT DIALOGUE PHRASES OR SPEAKERS..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full text-[10px] pl-9 pr-4 py-2 bg-black border border-[#222] text-white focus:outline-none focus:border-[#FF4400]"
              />
            </div>
            
            <div className="text-[10px] text-slate-500 uppercase">
              GRID_VIEW: <strong className="text-[#FF4400]">{filteredSegments.length}</strong> / {segments.length} BLOCKS
            </div>
          </div>

          {/* Transcript dialogue segments rows */}
          <div className="space-y-3 font-mono">
            {filteredSegments.map((seg) => {
              const isEditing = editingSegmentId === seg.id;
              
              // Color map for confidence indicators
              let confidenceColor = "bg-green-950/40 text-green-400 border border-green-900/35";
              if (seg.confidence < 0.7) confidenceColor = "bg-red-950/40 text-red-400 border border-red-900/35";
              else if (seg.confidence < 0.85) confidenceColor = "bg-yellow-950/40 text-yellow-400 border border-yellow-900/35";

              return (
                <div 
                  key={seg.id}
                  className={`bg-[#0D0D0F] border p-4 transition-all ${
                    isEditing ? 'border-[#FF4400]' : 'border-[#222]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b border-[#222] gap-2 text-xs text-white">
                    
                    {/* Timestamp specs */}
                    <div className="flex flex-wrap items-center gap-3">
                      <button 
                        onClick={() => onPlayAtTime(seg.start)}
                        className="flex items-center gap-1 text-[#FF4400] hover:text-white bg-black hover:bg-[#FF4400]/10 px-2.5 py-1 border border-[#222] text-[10px] font-bold cursor-pointer"
                      >
                        <Play className="w-3 h-3 fill-current" />
                        [{seg.start.toFixed(1)}S - {seg.end.toFixed(1)}S]
                      </button>
                      
                      <div className="text-[10px] font-bold text-white flex items-center gap-1 uppercase">
                        <Users className="w-3 h-3 text-slate-500" />
                        {isEditing ? (
                          <select 
                            value={editingSpeaker}
                            onChange={(e) => setEditingSpeaker(e.target.value)}
                            className="bg-black border border-[#222] text-white text-[10px] px-2 py-0.5 outline-none"
                          >
                            {speakers.map(s => (
                              <option key={s.name} value={s.name}>{s.name.toUpperCase()}</option>
                            ))}
                          </select>
                        ) : (
                          <span>{seg.speaker}</span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`text-[8.5px] font-bold px-2 py-0.5 ${confidenceColor}`}>
                        CONF: {(seg.confidence * 100).toFixed(0)}%
                      </span>
                      {seg.confidence < 0.8 && (
                        <span className="text-[8.5px] font-bold text-red-400 flex items-center gap-0.5 bg-red-950/30 border border-red-900/20 px-1.5 py-0.5">
                          <HelpCircle className="w-3 h-3" /> CONFIDENCE WARNING
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dialogue Content Text area */}
                  {isEditing ? (
                    <div className="space-y-3.5">
                      <textarea 
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="w-full text-xs p-3 bg-black border border-[#222] text-[#E0E0E0] focus:border-[#FF4400] outline-none font-mono"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2 text-[10px] font-bold uppercase">
                        <button 
                          onClick={() => setEditingSegmentId(null)}
                          className="px-3 py-1.5 border border-[#333] bg-transparent text-[#AAA] hover:text-white cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => handleSaveSegment(seg.id)}
                          className="px-3.5 py-1.5 bg-[#FF4400] text-black font-extrabold flex items-center gap-1 cursor-pointer"
                        >
                          <Save className="w-3.5 h-3.5 text-black" />
                          SAVE_REVISION
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-between gap-4">
                      <p className="text-[#E0E0E0] text-xs leading-relaxed uppercase">{seg.text}</p>
                      
                      <button 
                        onClick={() => handleEditSegment(seg)}
                        className="text-[9px] text-[#FF4400] hover:text-[#ff5d24] font-bold flex-shrink-0 cursor-pointer self-start uppercase border border-[#222] bg-black px-2 py-0.5"
                      >
                        [EDIT_TEXT]
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Speaker Profiler Modal */}
      {showSpeakerModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 font-mono select-none">
          <div className="bg-[#09090C] border border-[#222] shadow-2xl max-w-md w-full overflow-hidden text-white">
            <div className="bg-black p-4 border-b border-[#222] flex justify-between items-center text-xs">
              <h3 className="font-bold uppercase tracking-wider text-[#FF4400]">Add Speaker Profile</h3>
              <button onClick={() => setShowSpeakerModal(false)} className="text-[#888] hover:text-white cursor-pointer text-xs">✕</button>
            </div>
            <form onSubmit={handleAddSpeaker} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Speaker Name *</label>
                <input 
                  type="text"
                  required
                  placeholder="E.G. TRANSLATOR_A / NEWS_CASTER"
                  value={newSpeakerName}
                  onChange={(e) => setNewSpeakerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 bg-black border border-[#222] text-white focus:border-[#FF4400] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Gender Registry</label>
                  <select 
                    value={newSpeakerGender}
                    onChange={(e: any) => setNewSpeakerGender(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-black border border-[#222] text-white outline-none uppercase"
                  >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="neutral">Neutral/Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 uppercase tracking-wider mb-1">Voice Signature Profile</label>
                  <select 
                    value={newSpeakerVoice}
                    onChange={(e) => setNewSpeakerVoice(e.target.value)}
                    className="w-full text-xs px-3 py-2 bg-black border border-[#222] text-[#E0E0E0] outline-none uppercase"
                  >
                    <option>Deep Narrative (Cinematic)</option>
                    <option>Energetic Host (Ad)</option>
                    <option>Soft Academic (Educational)</option>
                    <option>Neutral Dialog (Flat)</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#222] flex justify-end gap-3 text-[10px] font-bold uppercase">
                <button 
                  type="button" 
                  onClick={() => setShowSpeakerModal(false)}
                  className="px-3.5 py-1.5 border border-[#333] text-[#AAA] bg-transparent cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-1.5 bg-[#FF4400] text-black font-extrabold cursor-pointer hover:bg-[#ff5d24]"
                >
                  Confirm Speaker
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
