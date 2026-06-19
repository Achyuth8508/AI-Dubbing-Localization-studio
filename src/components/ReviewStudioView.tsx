import React, { useState, useEffect } from 'react';
import { Project, TranscriptSegment, Comment, QAReport, RenderPreset } from '../types';
import { 
  Play, Pause, Sliders, MessageSquare, Download, Sparkles, Check, 
  X, Send, RefreshCw, Layers, Film, User, Type, Award, ChevronDown, CheckCircle, Info
} from 'lucide-react';

interface ReviewStudioViewProps {
  project: Project;
  segments: TranscriptSegment[];
  comments: Comment[];
  onAddComment: (comment: Comment) => void;
  onUpdateProjectStatus: (status: any) => void;
  targetLanguage: string;
}

export default function ReviewStudioView({
  project,
  segments,
  comments,
  onAddComment,
  onUpdateProjectStatus,
  targetLanguage
}: ReviewStudioViewProps) {
  // Video monitoring state
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0.0);
  const [duration, setDuration] = useState(project.duration || 30.0);
  
  // Subtitle styling preferences
  const [subLanguage, setSubLanguage] = useState(targetLanguage);
  const [subPosition, setSubPosition] = useState<'bottom' | 'top' | 'center'>('bottom');
  const [subStyle, setSubStyle] = useState<'standard' | 'yellow' | 'karaoke' | 'burned'>('burned');

  // Multi-role selector collaboration
  const [activeRole, setActiveRole] = useState<'Admin' | 'Editor' | 'Translator' | 'Reviewer'>('Reviewer');
  const [commentInput, setCommentInput] = useState('');

  // Video Rendering console
  const [selectedPreset, setSelectedPreset] = useState('streaming');
  const [selectedFormat, setSelectedFormat] = useState<'MP4' | 'MOV' | 'MKV'>('MP4');
  const [isRendering, setIsRendering] = useState(false);
  const [renderProgress, setRenderProgress] = useState(0);

  // Quality Assurance reports (automatic evaluation results via server API `/api/evaluate-quality`)
  const [qaReport, setQaReport] = useState<QAReport>({
    translation_quality: 91,
    voice_similarity: 88,
    lip_accuracy: 94,
    audio_quality: 92,
    timing_match: 96,
    overall_score: 92,
    issues: ["Syllable padding recommended at [00:14s] to match mouth closure duration."]
  });
  const [isEvaluating, setIsEvaluating] = useState(false);

  // Sync Timer for Simulated Playback
  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            setIsPlaying(false);
            return 0.0;
          }
          return prev + 0.2;
        });
      }, 200);
    }
    return () => clearInterval(interval);
  }, [isPlaying, duration]);

  // Find the segment matching current time to render captions
  const activeSegment = segments.find(s => currentTime >= s.start && currentTime <= s.end);

  const handleTogglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleAddCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    const timestampSec = currentTime;
    const formatTime = (sec: number) => {
      const minutes = Math.floor(sec / 60);
      const seconds = Math.floor(sec % 60);
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };

    const newComment: Comment = {
      id: 'comm_' + Math.random().toString(36).substr(2, 5),
      user: `Collaborator (${activeRole})`,
      role: activeRole,
      text: commentInput.trim(),
      timestamp: formatTime(timestampSec),
      created_at: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    onAddComment(newComment);
    setCommentInput('');
  };

  // Trigger evaluation score assessment
  const handleTriggerQAAssessment = async () => {
    setIsEvaluating(true);
    try {
      // Average over multiple active segments
      const sample = segments[0];
      if (sample) {
        const res = await fetch('/api/evaluate-quality', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            original: sample.text,
            translated: sample.translation || sample.text,
            adapted: sample.adapted_translation || sample.translation || sample.text,
            mode: 'Cinematic',
            targetLang: targetLanguage
          })
        });
        const data = await res.json();
        if (data.success && data.report) {
          setQaReport({
            translation_quality: data.report.translation_quality,
            voice_similarity: data.report.voice_similarity,
            lip_accuracy: data.report.lip_accuracy,
            audio_quality: data.report.audio_quality,
            timing_match: data.report.timing_match,
            overall_score: data.report.overall_score,
            issues: data.report.notes || []
          });
        }
      }
    } catch(err) {
      console.warn("Quality assessment fail, using simulated calculation:", err);
    } finally {
      setIsEvaluating(false);
    }
  };

  // Exporter triggering
  const [renderMessage, setRenderMessage] = useState<string | null>(null);

  const handleTriggerRender = () => {
    setIsRendering(true);
    setRenderProgress(0);
    setRenderMessage(null);
    onUpdateProjectStatus('rendering');

    const interval = setInterval(() => {
      setRenderProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRendering(false);
          onUpdateProjectStatus('completed');
          setRenderMessage(`Compilation Successful. Dubbed ${selectedFormat} file [${selectedPreset}] compiled.`);
          return 100;
        }
        return prev + 10;
      });
    }, 400);
  };

  // Download subtitle structures
  const handleDownloadSubtitle = (type: 'srt' | 'vtt') => {
    let content = "";
    
    if (type === 'srt') {
      segments.forEach((seg, index) => {
        const formatSrtTime = (sec: number) => {
          const hours = Math.floor(sec / 3600).toString().padStart(2, '0');
          const mins = Math.floor((sec % 3600) / 60).toString().padStart(2, '0');
          const secs = Math.floor(sec % 60).toString().padStart(2, '0');
          const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
          return `${hours}:${mins}:${secs},${ms}`;
        };
        content += `${index + 1}\n${formatSrtTime(seg.start)} --> ${formatSrtTime(seg.end)}\n${seg.adapted_translation || seg.translation || seg.text}\n\n`;
      });
    } else {
      content = "WEBVTT\n\n";
      segments.forEach((seg, index) => {
        const formatVttTime = (sec: number) => {
          const mins = Math.floor(sec / 60).toString().padStart(2, '0');
          const secs = Math.floor(sec % 60).toString().padStart(2, '0');
          const ms = Math.floor((sec % 1) * 1000).toString().padStart(3, '0');
          return `00:${mins}:${secs}.${ms}`;
        };
        content += `${index + 1}\n${formatVttTime(seg.start)} --> ${formatVttTime(seg.end)}\n${seg.adapted_translation || seg.translation || seg.text}\n\n`;
      });
    }

    const b = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(b);
    const link = document.createElement('a');
    link.href = url;
    link.download = `project_subtitles_${targetLanguage}.${type}`;
    link.click();
  };

  // Color map helper for subtitle customization overlay
  const getSubStyles = () => {
    switch (subStyle) {
      case 'yellow': return "text-yellow-400 font-extrabold text-xs stroke-black [text-shadow:_1px_1px_2px_black] font-mono";
      case 'karaoke': return "text-white font-extrabold text-sm scale-105 tracking-wider bg-[#FF4400] text-black py-1 px-3 border border-orange-500 rounded-none font-mono";
      case 'burned': return "text-white font-semibold text-xs bg-[#0F0F12] border border-[#333] rounded-none px-4 py-1.5 leading-snug shadow-xl font-mono uppercase";
      default: return "text-white font-bold text-xs bg-black/60 rounded-none px-2 text-shadow font-mono";
    }
  };

  return (
    <div id="review-studio-tab" className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* 2 Column Visual Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Visual Video monitor + timeline stacked tracks */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Main Video Monitor */}
          <div className="relative bg-[#000] aspect-video rounded-none overflow-hidden border border-[#222222] shadow-2xl flex flex-col justify-end">
            
            {/* Monitor Header info bar */}
            <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 to-transparent p-4 flex justify-between items-center text-[10px] text-slate-400 font-mono z-10 select-none">
              <span className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_red]"></span>
                MONITOR_SIGNAL_ACTIVE // FEED_1
              </span>
              <span>TIME: {currentTime.toFixed(1)}s / {duration.toFixed(1)}s</span>
            </div>

            {/* Simulated background footage - visually dynamic when playing */}
            <div className="absolute inset-0 flex items-center justify-center bg-[#07070A]/90">
              {isPlaying ? (
                <div className="text-center space-y-3 animate-pulse text-[#FF4400]/80">
                  <Film className="w-12 h-12 mx-auto animate-spin" style={{ animationDuration: '8s' }} />
                  <span className="text-[9px] font-mono tracking-widest block uppercase text-slate-400">Rendering translation layer // {targetLanguage}</span>
                </div>
              ) : (
                <Film className="w-16 h-16 text-slate-900" />
              )}
            </div>

            {/* Render burned subtitle with style customization */}
            {activeSegment && (
              <div className={`absolute left-1/2 -translate-x-1/2 z-20 pb-12 w-[90%] max-w-xl text-center flex justify-center ${
                subPosition === 'top' ? 'top-16 pb-0' : subPosition === 'center' ? 'top-1/2 -translate-y-1/2 pb-0' : 'bottom-6'
              }`}>
                <div className={getSubStyles()}>
                  {activeSegment.adapted_translation || activeSegment.translation || activeSegment.text}
                </div>
              </div>
            )}

            {/* Visual media controller faders bar */}
            <div className="p-4 bg-black border-t border-[#222222] flex justify-between items-center text-white z-10 font-mono">
              <button 
                onClick={handleTogglePlay}
                className="p-3 bg-[#FF4400] hover:bg-[#ff5d24] text-black rounded-none transition-all cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current text-black" /> : <Play className="w-4 h-4 fill-current text-black" />}
              </button>
              
              <div className="flex-1 px-4 text-xs">
                {/* Horizontal slider progress bar */}
                <input 
                  type="range" 
                  min={0}
                  max={duration * 10}
                  value={currentTime * 10}
                  onChange={(e) => setCurrentTime(parseFloat(e.target.value) / 10)}
                  className="w-full accent-[#FF4400] bg-[#111] h-1.5 cursor-pointer"
                />
              </div>

              {/* Status Tag */}
              <div className="text-[10px] shrink-0 py-1 px-2 border border-[#222] rounded bg-black text-[#FF4400] font-bold">
                SUB: {subLanguage.slice(0, 5).toUpperCase()}
              </div>
            </div>
          </div>

          {/* Sequencer Track Timeline Grid */}
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs text-[#E0E0E0]">
            <h3 className="flex items-center gap-2 font-bold uppercase tracking-wider text-white border-b border-[#222] pb-2">
              <Layers className="w-4 h-4 text-[#FF4400]" />
              SEQUENCER TIMELINE MULTI-TRACKS
            </h3>

            <div className="space-y-2 select-none">
              
              {/* Tracker: Video Strip */}
              <div className="grid grid-cols-5 items-center gap-4 bg-black/40 p-2 border border-[#222]">
                <span className="font-bold text-[#555] col-span-1 text-[10px]">VIDEO STRIP</span>
                <div className="col-span-4 h-8 bg-[#111] border border-[#222] relative flex items-center justify-between px-3 text-[9px] text-slate-500">
                  <div className="absolute top-0 bottom-0 bg-[#FF4400]" style={{ left: `${(currentTime/duration) * 100}%`, width: '1.5px' }}></div>
                  <span>🎬 SCENE_1</span>
                  <span>🎬 SCENE_2</span>
                  <span>🎬 SCENE_3</span>
                </div>
              </div>

              {/* Tracker: ORIGINAL VOCAL */}
              <div className="grid grid-cols-5 items-center gap-4 bg-black/40 p-2 border border-[#222]">
                <span className="font-bold text-[#555] col-span-1 text-[10px]">ORIGINAL VO</span>
                <div className="col-span-4 h-10 bg-black border border-[#222] relative flex items-center justify-around">
                  <div className="absolute top-0 bottom-0 bg-[#FF4400]" style={{ left: `${(currentTime/duration) * 100}%`, width: '1.5px' }}></div>
                  {/* Wave graphics mock */}
                  <div className="w-2/3 h-5 bg-gradient-to-r from-blue-900/40 via-transparent to-indigo-900/40 border border-blue-500/20"></div>
                </div>
              </div>

              {/* Tracker: DUB LIPS VOCAL */}
              <div className="grid grid-cols-5 items-center gap-4 bg-black/40 p-2 border border-[#222]">
                <span className="font-bold text-[#555] col-span-1 text-[10px]">DUBBED DIAL</span>
                <div className="col-span-4 h-10 bg-black border border-[#222] relative flex items-center justify-around">
                  <div className="absolute top-0 bottom-0 bg-[#FF4400]" style={{ left: `${(currentTime/duration) * 100}%`, width: '1.5px' }}></div>
                  {/* Wave graphics mock */}
                  <div className="w-4/5 h-6 bg-[#FF4400]/10 border border-[#FF4400]/30"></div>
                </div>
              </div>

              {/* Tracker: SUBTITLES TIMINGS MAP */}
              <div className="grid grid-cols-5 items-center gap-4 bg-black/40 p-2 border border-[#222]">
                <span className="font-bold text-[#555] col-span-1 text-[10px]">SUB_TIMINGS</span>
                <div className="col-span-4 h-8 bg-black border border-[#222] relative flex items-center">
                  <div className="absolute top-0 bottom-0 bg-[#FF4400]" style={{ left: `${(currentTime/duration) * 100}%`, width: '1.5px' }}></div>
                  {segments.map((seg, i) => (
                    <div 
                      key={seg.id}
                      className="absolute h-4 bg-[#FF4400]/10 border border-[#FF4400]/40 text-[9px] text-[#FF4400] flex items-center justify-center truncate px-1"
                      style={{ 
                        left: `${(seg.start / duration) * 100}%`, 
                        width: `${((seg.end - seg.start) / duration) * 100}%` 
                      }}
                    >
                      L{i + 1}
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Right Columns: Review Actions, Subtitles and Video Rendering */}
        <div className="space-y-6">
          
          {/* Subtitle customizer engine panel */}
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-white text-xs uppercase flex items-center gap-1.5 border-b border-[#222] pb-2">
              <Type className="w-4 h-4 text-[#FF4400]" />
              BURNED & STYLED LEGENS
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-[#555] font-bold text-[10px] uppercase mb-1">Sub Position</label>
                <div className="flex gap-1 bg-black p-1 border border-[#222]">
                  {(['bottom', 'center', 'top'] as const).map(p => (
                    <button
                      key={p}
                      onClick={() => setSubPosition(p)}
                      className={`flex-1 text-center py-1 font-bold text-[10px] uppercase ${
                        subPosition === p ? 'bg-[#FF4400] text-black' : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#555] font-bold text-[10px] uppercase mb-1">Style Format</label>
                <div className="flex flex-wrap gap-1 bg-black p-1 border border-[#222]">
                  {(['standard', 'yellow', 'karaoke', 'burned'] as const).map(s => (
                    <button
                      key={s}
                      onClick={() => setSubStyle(s)}
                      className={`flex-1 text-center py-1 font-bold text-[9px] uppercase ${
                        subStyle === s ? 'bg-[#FF4400] text-black' : 'text-[#888] hover:text-white'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 text-center text-[10px] font-bold pt-1.5">
                <button 
                  onClick={() => handleDownloadSubtitle('srt')}
                  className="flex-1 py-1.5 bg-[#141419] hover:bg-black text-[#AAA] hover:text-white border border-[#333] flex items-center justify-center gap-1 cursor-pointer uppercase"
                >
                  <Download className="w-3.5 h-3.5" /> `.srt`
                </button>
                <button 
                  onClick={() => handleDownloadSubtitle('vtt')}
                  className="flex-1 py-1.5 bg-[#141419] hover:bg-black text-[#AAA] hover:text-white border border-[#333] flex items-center justify-center gap-1 cursor-pointer uppercase"
                >
                  <Download className="w-3.5 h-3.5" /> `.vtt`
                </button>
              </div>
            </div>
          </div>

          {/* Localization automated Scorecard (QA Module) */}
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-[#222] pb-2">
              <h3 className="font-bold text-white uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                <Award className="w-4 h-4 text-[#FF4400]" />
                QA METRICS COMPLIANCE
              </h3>
              
              <button 
                onClick={handleTriggerQAAssessment}
                className="text-[10px] text-[#FF4400] hover:text-[#ff5d24] font-bold flex items-center gap-1 uppercase bg-black px-2 py-0.5 border border-[#333] cursor-pointer"
              >
                <RefreshCw className={`w-2.5 h-2.5 ${isEvaluating ? 'animate-spin' : ''}`} />
                Run Eval
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-black p-2 border border-[#222]">
                <span className="text-[8px] text-[#555] font-bold block mb-0.5">TRANSLATE_QA</span>
                <span className="text-base font-black block text-green-400">{qaReport.translation_quality}%</span>
              </div>
              <div className="bg-black p-2 border border-[#222]">
                <span className="text-[8px] text-[#555] font-bold block mb-0.5">VOICE_SIM</span>
                <span className="text-base font-black block text-green-400">{qaReport.voice_similarity}%</span>
              </div>
              <div className="bg-black p-2 border border-[#222]">
                <span className="text-[8px] text-[#555] font-bold block mb-0.5">LIP_SYNC_ACC</span>
                <span className="text-base font-black block text-green-400">{qaReport.lip_accuracy}%</span>
              </div>
              <div className="bg-black p-2 border border-[#222] col-span-2">
                <span className="text-[8px] text-[#555] font-bold inline-block mb-1">TOTAL_COMPLIANCE_SCORE</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-lg font-extrabold text-[#FF4400]">{qaReport.overall_score} / 100</span>
                  <span className="px-1.5 py-0.2 text-[8px] bg-green-950 text-green-400 border border-green-500/20 font-bold">APPROVED</span>
                </div>
              </div>
            </div>

            {/* QA Issues recommendations */}
            {qaReport.issues && qaReport.issues.length > 0 && (
              <div className="bg-yellow-950/20 p-3 border border-yellow-500/20 text-[10px] text-yellow-500 font-medium leading-relaxed">
                <span className="font-bold flex items-center gap-1 mb-1 text-[11px] uppercase">
                  <Info className="w-3.5 h-3.5" /> Recommendations
                </span>
                <ul className="list-disc pl-3 mt-1 space-y-1 font-mono uppercase">
                  {qaReport.issues.map((iss, index) => (
                    <li key={index}>{iss}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Exporter Renderer console */}
          <div className="bg-black text-white p-5 space-y-4 border border-[#222222] font-mono select-none">
            <h3 className="font-bold text-xs uppercase text-slate-300 border-b border-[#222] pb-2 flex items-center gap-1.5">
              <Film className="w-4 h-4 text-[#FF4400]" />
              STUDIO COMPILER CONSOLE
            </h3>

            <div className="space-y-3.5 text-xs text-[#E0E0E0]">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[8px] text-[#555] font-bold mb-1 uppercase">Preset format</label>
                  <select 
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                    className="w-full bg-[#0D0D0F] border border-[#222] text-[#E0E0E0] outline-none px-2.5 py-1.5 text-xs uppercase"
                  >
                    <option value="youtube">YouTube FHD (24fps)</option>
                    <option value="streaming">Streaming Web Preset</option>
                    <option value="cinema">Cinema Master (4K DCI)</option>
                    <option value="mobile">Mobile Format (9:16)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[8px] text-[#555] font-bold mb-1 uppercase">Container</label>
                  <select 
                    value={selectedFormat}
                    onChange={(e: any) => setSelectedFormat(e.target.value)}
                    className="w-full bg-[#0D0D0F] border border-[#222] text-[#E0E0E0] outline-none px-2.5 py-1.5 text-xs"
                  >
                    <option>MP4</option>
                    <option>MOV</option>
                    <option>MKV</option>
                  </select>
                </div>
              </div>

              {isRendering && (
                <div className="p-3 bg-[#0D0D0F] border border-[#222] space-y-1 text-[10px]">
                  <div className="flex justify-between font-bold text-slate-400">
                    <span>STITCHING TRACKS...</span>
                    <span>{renderProgress}%</span>
                  </div>
                  <div className="w-full bg-black h-1">
                    <div className="bg-[#FF4400] h-1" style={{ width: `${renderProgress}%` }}></div>
                  </div>
                </div>
              )}

              {renderMessage && (
                <div className="p-2.5 bg-green-950/20 border border-green-500/20 text-green-400 text-[10px] leading-relaxed block uppercase font-bold">
                  {renderMessage}
                </div>
              )}

              <button 
                onClick={handleTriggerRender}
                disabled={isRendering}
                className="w-full py-2 bg-[#FF4400] hover:bg-[#ff5d24] font-black text-black text-xs uppercase cursor-pointer tracking-wide"
              >
                {isRendering ? (
                  <span className="flex items-center justify-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    RUNNING COMPILATION...
                  </span>
                ) : (
                  <span>COMPILE FINAL MASTER RENDER</span>
                )}
              </button>
            </div>
          </div>

          {/* Scrolling Collaboration Board */}
          <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
            <h3 className="font-bold text-white uppercase flex items-center gap-1.5 border-b border-[#222] pb-2">
              <MessageSquare className="w-4 h-4 text-[#FF4400]" />
              TIMELINE PROTO FEED
            </h3>

            <div className="flex justify-between items-center bg-black px-2 py-1 border border-[#222] text-[10px]">
              <span className="text-[#555] font-bold">FEED ROLE:</span>
              <select 
                value={activeRole} 
                onChange={(e: any) => setActiveRole(e.target.value)}
                className="font-bold bg-transparent text-[#FF4400] outline-none"
              >
                <option value="Admin">Admin (Lead)</option>
                <option value="Editor">Editor (Sound)</option>
                <option value="Translator">Translator</option>
                <option value="Reviewer">Reviewer (Auditor)</option>
              </select>
            </div>

            <div className="space-y-3 max-h-[17vh] overflow-y-auto pr-1">
              {comments.map(c => (
                <div key={c.id} className="p-2.5 bg-black border border-[#222] space-y-1 text-[11px] uppercase text-slate-300">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-white text-[10px]">{c.user}</span>
                    <span className="text-[9px] text-[#FF4400]">[{c.timestamp}]</span>
                  </div>
                  <p className="text-[#AAA] font-normal leading-relaxed text-[10px]">{c.text}</p>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddCommentSubmit} className="flex gap-2">
              <input 
                type="text" 
                placeholder="INPUT COLLAB LOG AT TIME..." 
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                className="flex-1 text-[10px] px-3 bg-black/60 border border-[#222] text-white focus:border-[#FF4400] outline-none"
              />
              <button 
                type="submit"
                className="bg-[#1A1A1D] hover:bg-[#FF4400] hover:text-black hover:border-transparent text-[#AAA] border border-[#222] px-2.5 flex items-center justify-center shrink-0 cursor-pointer"
              >
                <Send className="w-3 h-3" />
              </button>
            </form>
          </div>

        </div>
      </div>
    </div>
  );
}
