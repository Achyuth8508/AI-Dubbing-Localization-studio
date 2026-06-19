import React, { useState } from 'react';
import { TranscriptSegment, GlossaryTerm } from '../types';
import { 
  Globe, BookOpen, Lock, Unlock, HelpCircle, 
  Sparkles, Sliders, ChevronRight, RefreshCw, Scissors, Maximize2, Send, Save, CheckCircle
} from 'lucide-react';

interface TranslationViewProps {
  segments: TranscriptSegment[];
  targetLanguage: string;
  sourceLanguage: string;
  glossary: GlossaryTerm[];
  onUpdateSegments: (updated: TranscriptSegment[]) => void;
  onUpdateGlossary: (updated: GlossaryTerm[]) => void;
  onPlayAtTime: (start: number) => void;
}

export default function TranslationView({
  segments,
  targetLanguage,
  sourceLanguage,
  glossary,
  onUpdateSegments,
  onUpdateGlossary,
  onPlayAtTime
}: TranslationViewProps) {
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(segments[0]?.id || null);
  const [translationMode, setTranslationMode] = useState<'Literal' | 'Natural' | 'Cinematic' | 'Marketing' | 'Educational'>('Cinematic');
  
  // Translation Glossary Editor
  const [newSourceTerm, setNewSourceTerm] = useState('');
  const [newTargetTerm, setNewTargetTerm] = useState('');
  const [termNotes, setTermNotes] = useState('');

  // Local state for temporary loading indicator during server processes
  const [loadingAction, setLoadingAction] = useState<{ id: string; type: string } | null>(null);

  const handleUpdateTranslationText = (id: string, text: string) => {
    const updated = segments.map(seg => {
      if (seg.id === id) {
        return { ...seg, translation: text, adapted_translation: text };
      }
      return seg;
    });
    onUpdateSegments(updated);
  };

  // call server API /api/translate
  const handleTriggerAITranslate = async (id: string, sourceText: string) => {
    setLoadingAction({ id, type: 'translate' });
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: sourceText,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage,
          mode: translationMode,
          glossary: glossary
        })
      });
      const data = await res.json();
      if (data.success) {
        const updated = segments.map(seg => {
          if (seg.id === id) {
            return {
              ...seg,
              translation: data.translation,
              adapted_translation: data.translation,
              translation_notes: data.notes,
              translation_confidence: data.confidence
            };
          }
          return seg;
        });
        onUpdateSegments(updated);
      }
    } catch (err) {
      console.error("AI Translation failure:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  // call server API /api/adapt-dialogue (shorten / expand / rewrite)
  const handleTriggerAIAdapt = async (id: string, action: 'shorten' | 'expand' | 'rewrite') => {
    const seg = segments.find(s => s.id === id);
    if (!seg) return;

    setLoadingAction({ id, type: action });
    try {
      const res = await fetch('/api/adapt-dialogue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          original: seg.text,
          currentTranslation: seg.adapted_translation || seg.translation || seg.text,
          action: action,
          targetDuration: seg.end - seg.start,
          sourceLang: sourceLanguage,
          targetLang: targetLanguage
        })
      });
      const data = await res.json();
      if (data.success) {
        const updated = segments.map(s => {
          if (s.id === id) {
            return {
              ...s,
              adapted_translation: data.adapted_translation,
              translation_notes: `AI Adapted (${action}): ${data.notes}`,
              sync_score: data.timing_match_pct || 96
            };
          }
          return s;
        });
        onUpdateSegments(updated);
      }
    } catch (err) {
      console.error("AI Adaptation failure:", err);
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCreateGlossaryTerm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSourceTerm.trim() || !newTargetTerm.trim()) return;

    const newTerm: GlossaryTerm = {
      source_term: newSourceTerm.trim(),
      target_translation: newTargetTerm.trim(),
      notes: termNotes.trim() || undefined,
      is_locked: true
    };

    onUpdateGlossary([...glossary, newTerm]);
    setNewSourceTerm('');
    setNewTargetTerm('');
    setTermNotes('');
  };

  const handleToggleTermLock = (index: number) => {
    const next = glossary.map((g, i) => i === index ? { ...g, is_locked: !g.is_locked } : g);
    onUpdateGlossary(next);
  };

  const handleRemoveTerm = (index: number) => {
    const next = glossary.filter((_, i) => i !== index);
    onUpdateGlossary(next);
  };

  const handleBulkAIAction = async () => {
    // Process all untranslated lines with loading simulation
    setLoadingAction({ id: 'bulk-translate', type: 'bulk' });
    try {
      for (const seg of segments) {
        if (!seg.translation || seg.translation === seg.text) {
          await handleTriggerAITranslate(seg.id, seg.text);
        }
      }
    } finally {
      setLoadingAction(null);
    }
  };

  const activeSegment = segments.find(s => s.id === activeSegmentId);

  return (
    <div id="translation-tab" className="p-6 space-y-6 max-w-7xl mx-auto font-mono text-xs">
      
      {/* Upper Dual Controls: Global translation profile options */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#0D0D0F] border border-[#222] p-4 shadow-xs text-white">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="p-1.5 bg-black border border-[#222] text-[#FF4400]">
              <Globe className="w-5 h-5" />
            </span>
            <div>
              <span className="text-[9px] text-slate-500 block uppercase font-bold tracking-wider">Localization Route</span>
              <span className="font-bold text-white uppercase">{sourceLanguage} → {targetLanguage}</span>
            </div>
          </div>

          <div className="border-l border-[#222] h-8 hidden sm:block"></div>

          <div>
            <label className="block text-[9px] text-[#888] font-bold uppercase tracking-wider mb-1">Preserve Target Mood Preset</label>
            <div className="flex flex-wrap gap-1 bg-black p-1 border border-[#222]">
              {(['Literal', 'Natural', 'Cinematic', 'Marketing', 'Educational'] as const).map(m => (
                <button
                  key={m}
                  onClick={() => setTranslationMode(m)}
                  className={`px-3 py-1 text-[10px] uppercase font-bold transition-all cursor-pointer ${
                    translationMode === m 
                      ? 'bg-[#FF4400] text-black' 
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
        </div>

        <button 
          onClick={handleBulkAIAction}
          className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2 bg-[#FF4400] hover:bg-[#ff5d24] text-black font-extrabold uppercase transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-black fill-current" />
          BULK TRANSLATE REMAINING
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Side-by-side list of dialogues */}
        <div className="lg:col-span-2 space-y-3 max-h-[70vh] overflow-y-auto pr-1">
          {segments.map((seg) => {
            const isActive = activeSegmentId === seg.id;
            const hasTranslation = seg.translation && seg.translation !== seg.text;
            
            return (
              <div 
                key={seg.id}
                onClick={() => setActiveSegmentId(seg.id)}
                className={`p-4 border cursor-pointer transition-all ${
                  isActive 
                    ? 'border-[#FF4400] bg-[#141418]' 
                    : 'border-[#222] bg-[#0D0D0F] hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#222]">
                  <span className="text-[9px] bg-black border border-[#222] p-1.5 text-[#FF4400] font-bold">
                    [{seg.start.toFixed(1)}S - {seg.end.toFixed(1)}S] DURATION: {(seg.end - seg.start).toFixed(1)}S
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white uppercase">{seg.speaker}</span>
                    {hasTranslation ? (
                      <span className="text-[8.5px] text-green-400 font-bold bg-green-950/40 border border-green-900/35 px-2 py-0.5 flex items-center gap-1 uppercase">
                        <CheckCircle className="w-3 h-3" /> Translated
                      </span>
                    ) : (
                      <span className="text-[8.5px] text-slate-500 font-bold bg-black border border-[#222] px-2 py-0.5 uppercase">
                        Pending
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-white">
                  <div>
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold">{sourceLanguage} (Source)</span>
                    <p className="text-xs text-slate-300 mt-1 uppercase">{seg.text}</p>
                  </div>
                  
                  <div className="border-t md:border-t-0 md:border-l border-[#222] pt-2 md:pt-0 md:pl-4">
                    <span className="text-[8.5px] text-slate-500 block uppercase font-bold">{targetLanguage} (Dub Lyric)</span>
                    <p className="text-xs text-[#FF4400] font-medium mt-1 uppercase">
                      {seg.adapted_translation || seg.translation || <span className="text-slate-600 italic">No translation generated</span>}
                    </p>
                  </div>
                </div>

                {/* Local Loader inside target card */}
                {loadingAction?.id === seg.id && (
                  <div className="mt-3.5 flex items-center gap-2 text-[9px] text-[#FF4400] font-bold uppercase">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Processing cinematic adaptation engine...</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Right Column: Detailed Translation & Adapting Board + Glossary Manager */}
        <div className="space-y-6">
          
          {/* Active Workspace Editor */}
          {activeSegment ? (
            <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 shadow-sm text-white">
              <div className="flex items-center justify-between border-b border-[#222] pb-3">
                <h3 className="font-bold text-white text-[11px] flex items-center gap-1.5 uppercase">
                  <Sliders className="w-4 h-4 text-[#FF4400]" />
                  TIMING ALIGNMENT UNIT
                </h3>
                <span className="text-[9px] bg-black text-[#FF4400] border border-[#222] px-2 py-0.5 font-bold uppercase">
                  TARGET: {(activeSegment.end - activeSegment.start).toFixed(1)}S
                </span>
              </div>

              <div className="space-y-1">
                <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Original Text ({sourceLanguage})</span>
                <p className="bg-black text-slate-300 p-2.5 border border-[#222] text-[10px] leading-normal uppercase">
                  "{activeSegment.text}"
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] text-slate-500 font-bold uppercase tracking-wider">Localized Translation ({targetLanguage})</span>
                  <button 
                    onClick={() => handleTriggerAITranslate(activeSegment.id, activeSegment.text)}
                    disabled={loadingAction?.id === activeSegment.id}
                    className="text-[9px] text-[#FF4400] hover:text-[#ff5d24] font-bold flex items-center gap-1 cursor-pointer uppercase"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#FF4400]" />
                    AI RESET_TRANSLATE
                  </button>
                </div>
                
                <textarea
                  value={activeSegment.adapted_translation || activeSegment.translation || ''}
                  onChange={(e) => handleUpdateTranslationText(activeSegment.id, e.target.value)}
                  placeholder="Insert custom phrase script..."
                  className="w-full text-xs p-3 bg-black border border-[#222] text-white focus:border-[#FF4400] focus:outline-none font-mono uppercase"
                  rows={3}
                />
              </div>

              {/* Advanced adapting controls with nice timing metrics indicator */}
              <div className="space-y-3 pt-3 border-t border-[#222]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-400 uppercase">
                    Dialogue Adapt Controls
                  </span>
                  <span className={`text-[8.5px] font-bold px-2 py-0.5 ${
                    (activeSegment.sync_score || 0) >= 95 ? 'bg-green-950/40 text-green-400 border border-green-900/40' : 'bg-[#111] text-slate-400 border border-[#222]'
                  }`}>
                    Timing Match: {activeSegment.sync_score || 94}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-bold">
                  <button
                    onClick={() => handleTriggerAIAdapt(activeSegment.id, 'shorten')}
                    disabled={loadingAction?.id === activeSegment.id}
                    className="flex flex-col items-center justify-center p-2 bg-black border border-[#222] hover:border-[#FF4400] hover:text-[#FF4400] transition-colors gap-1 cursor-pointer"
                  >
                    <Scissors className="w-3.5 h-3.5 text-rose-500" />
                    <span className="uppercase">Shorten</span>
                  </button>
                  <button
                    onClick={() => handleTriggerAIAdapt(activeSegment.id, 'expand')}
                    disabled={loadingAction?.id === activeSegment.id}
                    className="flex flex-col items-center justify-center p-2 bg-black border border-[#222] hover:border-[#FF4400] hover:text-[#FF4400] transition-colors gap-1 cursor-pointer"
                  >
                    <Maximize2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="uppercase">Expand</span>
                  </button>
                  <button
                    onClick={() => handleTriggerAIAdapt(activeSegment.id, 'rewrite')}
                    disabled={loadingAction?.id === activeSegment.id}
                    className="flex flex-col items-center justify-center p-2 bg-black border border-[#222] hover:border-[#FF4400] hover:text-[#FF4400] transition-colors gap-1 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 text-indigo-400 ${loadingAction?.id === activeSegment.id ? 'animate-spin' : ''}`} />
                    <span className="uppercase">Alternative</span>
                  </button>
                </div>

                {activeSegment.translation_notes && (
                  <div className="bg-[#111] border border-[#222] p-3 text-[9px] text-[#FF4400] space-y-1 uppercase leading-normal">
                    <span className="font-extrabold block text-[8px] text-slate-500">Cinematic Insights</span>
                    <p>{activeSegment.translation_notes}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-[#0D0D0F] border border-dashed border-[#222] p-8 text-center text-[10px] text-slate-500 uppercase">
              Select any line from the sidebar directory to access fine-tuned dialogue adaptation and timing alignment controls.
            </div>
          )}

          {/* Translation Glossary Dictionary Board */}
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 shadow-sm text-white">
            <h3 className="font-bold text-white text-[11px] flex items-center gap-1.5 border-b border-[#222] pb-2 uppercase">
              <BookOpen className="w-4 h-4 text-[#FF4400]" />
              Terminology Lock (Glossary)
            </h3>

            <form onSubmit={handleCreateGlossaryTerm} className="space-y-3">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <input 
                  type="text" 
                  placeholder="Source term..." 
                  required
                  value={newSourceTerm}
                  onChange={(e) => setNewSourceTerm(e.target.value)}
                  className="w-full text-[10px] px-2.5 py-1.5 bg-black border border-[#222] text-white focus:border-[#FF4400] focus:outline-none uppercase"
                />
                <input 
                  type="text" 
                  placeholder="Target translation..." 
                  required
                  value={newTargetTerm}
                  onChange={(e) => setNewTargetTerm(e.target.value)}
                  className="w-full text-[10px] px-2.5 py-1.5 bg-black border border-[#222] text-white focus:border-[#FF4400] focus:outline-none uppercase"
                />
              </div>
              <input 
                type="text" 
                placeholder="Contextual rules e.g. Keep capitalised..." 
                value={termNotes}
                onChange={(e) => setTermNotes(e.target.value)}
                className="w-full text-[9px] px-2.5 py-1.5 bg-black border border-[#222] text-white focus:border-[#FF4400] focus:outline-none uppercase"
              />
              <button 
                type="submit"
                className="w-full bg-[#FF4400] hover:bg-[#ff5d24] text-black rounded-none text-[10px] font-extrabold py-1.5 cursor-pointer uppercase"
              >
                Add & Lock Term
              </button>
            </form>

            <div className="space-y-2 max-h-[22vh] overflow-y-auto">
              {glossary.map((g, i) => (
                <div key={i} className="bg-[#111] p-2.5 border border-[#222] text-[10px] flex justify-between items-start gap-3">
                  <div className="space-y-0.5 truncate flex-1 leading-normal">
                    <div className="font-bold space-x-1.5 truncate uppercase">
                      <span className="text-white">{g.source_term}</span>
                      <span className="text-slate-500">→</span>
                      <span className="text-[#FF4400]">{g.target_translation}</span>
                    </div>
                    {g.notes && <span className="text-[9px] text-slate-400 block truncate uppercase">{g.notes}</span>}
                  </div>
                  
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button 
                      onClick={() => handleToggleTermLock(i)}
                      className={`p-1 hover:bg-[#222] cursor-pointer ${g.is_locked ? 'text-[#FF4400]' : 'text-slate-500'}`}
                      title={g.is_locked ? "Unlocked / Release matching constraint" : "Force Term Alignment"}
                    >
                      {g.is_locked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                    </button>
                    <button 
                      onClick={() => handleRemoveTerm(i)}
                      className="p-1 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 cursor-pointer font-bold"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
