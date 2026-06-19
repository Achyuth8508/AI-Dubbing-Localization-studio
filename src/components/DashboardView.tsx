import React, { useState, useRef } from 'react';
import { Project, ProjectStatus } from '../types';
import { 
  Film, Plus, Folder, Clock, CheckCircle, Play, Sparkles, 
  Upload, Database, AlertCircle, FileVideo, HardDrive, Trash2, Globe
} from 'lucide-react';

interface DashboardViewProps {
  projects: Project[];
  selectedProject: Project | null;
  onSelectProject: (p: Project) => void;
  onAddProject: (p: Project) => void;
  onDeleteProject: (id: string) => void;
  apiHealth: { has_gemini_key: boolean; status: string } | null;
}

export default function DashboardView({
  projects,
  selectedProject,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  apiHealth
}: DashboardViewProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newSrcLang, setNewSrcLang] = useState('English');
  const [newTargetLangs, setNewTargetLangs] = useState<string[]>(['Spanish']);
  const [targetLangInput, setTargetLangInput] = useState('');
  
  // File Upload State
  const [dragActive, setDragActive] = useState(false);
  const [uploadFile, setUploadFile] = useState<{name: string; size: string; type: string} | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [extractedMetadata, setExtractedMetadata] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFile = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    setExtractedMetadata(null);

    // Simulate Resumable Ingestion Chunk Upload
    const interval = setInterval(() => {
      setUploadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsUploading(false);
          setUploadFile({
            name: file.name,
            size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
            type: file.type || "video/mp4"
          });
          
          // Generate simulated metadata extraction & scene segmentation
          setExtractedMetadata({
            duration: 48.5,
            resolution: file.type.includes("audio") ? "N/A" : "1920x1080 (16:9)",
            fps: file.type.includes("audio") ? 0 : 24,
            channels: 2,
            sample_rate: 48000,
            scenes: [
              { id: 1, start: "00:00", end: "00:12", description: "Close-up of character 1 introduction" },
              { id: 2, start: "00:12", end: "00:28", description: "Two-shot dialogue transition" },
              { id: 3, start: "00:28", end: "00:48", description: "B-roll emotional response showcase" }
            ]
          });
          return 100;
        }
        return prev + 25;
      });
    }, 400);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleAddLanguage = () => {
    if (targetLangInput.trim() && !newTargetLangs.includes(targetLangInput.trim())) {
      setNewTargetLangs([...newTargetLangs, targetLangInput.trim()]);
      setTargetLangInput('');
    }
  };

  const handleRemoveLanguage = (lang: string) => {
    setNewTargetLangs(newTargetLangs.filter(l => l !== lang));
  };

  const handleSubmitProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newProj: Project = {
      project_id: 'proj_' + Math.random().toString(36).substr(2, 9),
      title: newTitle,
      source_language: newSrcLang,
      target_languages: newTargetLangs,
      status: 'draft',
      owner: 'Admin Lead',
      created_at: new Date().toISOString().split('T')[0],
      duration: extractedMetadata?.duration || 30.0,
      resolution: extractedMetadata?.resolution || "1920x1080",
      fps: extractedMetadata?.fps || 24,
      channels: extractedMetadata?.channels || 2,
      sample_rate: extractedMetadata?.sample_rate || 48000,
      media_name: uploadFile?.name || "sample_reel.mp4",
      media_size: uploadFile?.size || "12.4 MB"
    };

    onAddProject(newProj);
    setShowCreateModal(false);
    // Reset state
    setNewTitle('');
    setNewSrcLang('English');
    setNewTargetLangs(['Spanish']);
    setUploadFile(null);
    setExtractedMetadata(null);
  };

  return (
    <div id="dashboard-tab" className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between bg-[#0E0E10] p-6 border border-[#222222] text-white select-none">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold uppercase tracking-widest bg-[#FF4400] text-black">STUDIO CORE ACTIVE</span>
            <div className="flex items-center gap-1.5 text-xs text-green-400 font-mono">
              <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_8px_#22c55e]"></span>
              LIVE_ENGINE_STREAMING
            </div>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight uppercase">AI Dubbing + Localization Studio</h1>
          <p className="text-[#AAA] text-xs max-w-2xl leading-relaxed">
            ACCESSIBLE MULTILINGUAL CINEMATIC PIPELINE // AUTOMATE RE-VOICING WITH SYLLABLE-LEVEL PACE-MATCHING, DIALOGUE ALIGNMENT, ATMOSPHERE MIXING, AND SRT SUBTITLE COMPRESSION.
          </p>
        </div>
        
        {/* Gemini API Key Status Widget */}
        <div className="mt-4 md:mt-0 px-4 py-3 bg-[#0D0D0F] border border-[#222] max-w-sm flex items-start gap-3">
          <Sparkles className="w-4 h-4 text-[#FF4400] mt-0.5 flex-shrink-0" />
          <div className="text-xs space-y-1 font-mono">
            <span className="font-bold block text-white uppercase text-[10px] tracking-wider">Gemini Core Translation Engine</span>
            {apiHealth?.has_gemini_key ? (
              <span className="text-green-400 font-bold flex items-center gap-1 text-[10px]">
                ● DIRECT_KEY_STATE: ONLINE
              </span>
            ) : (
              <span className="text-amber-500 font-bold flex items-center gap-1 text-[10px]">
                ▲ SIMULATOR_RUNNERS: SIMULATED
              </span>
            )}
            <p className="text-slate-500 leading-tight text-[10px] uppercase">
              {apiHealth?.has_gemini_key 
                ? "BOUND DEVIATION MODELS IN USE: GEMINI-3.5-FLASH & FLASH-TTS."
                : "TO LINK NATIVE GENERATIVE DUBBING, REGISTER GEMINI_API_KEY SECRET."}
            </p>
          </div>
        </div>
      </div>

      {/* Main Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Project List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between border-b border-[#222] pb-2">
            <h2 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-2 font-mono">
              <Folder className="w-4 h-4 text-[#FF4400]" />
              LOADED PIPELINE DIRECTORY
            </h2>
            <button 
              id="btn-new-project"
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-1.5 px-4 py-1.5 bg-[#FF4400] hover:bg-[#ff5d24] text-black text-xs font-extrabold uppercase tracking-tight transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-black stroke-[3px]" />
              New Sequence
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const isSelected = selectedProject?.project_id === proj.project_id;
              return (
                <div 
                  key={proj.project_id}
                  onClick={() => onSelectProject(proj)}
                  className={`group relative cursor-pointer p-5 transition-all border ${
                    isSelected 
                      ? 'border-[#FF4400] bg-[#141419]/60 shadow-[0_0_12px_rgba(255,68,0,0.15)]' 
                      : 'border-[#222222] bg-[#0D0D0F] hover:border-[#333] hover:bg-[#111114]'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="p-2 bg-[#1A1A1E] border border-[#2c2c31] text-[#FF4400] group-hover:text-white transition-colors">
                      <Film className="w-4 h-4" />
                    </div>
                    <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase border ${
                      proj.status === 'completed' ? 'bg-green-950/40 text-green-400 border-green-500/30' :
                      proj.status === 'rendering' ? 'bg-amber-950/40 text-amber-500 border-amber-500/30 animate-pulse' :
                      proj.status === 'translating' ? 'bg-blue-950/40 text-blue-400 border-blue-500/30' :
                      proj.status === 'transcribing' ? 'bg-purple-950/40 text-purple-400 border-purple-500/30' :
                      'bg-neutral-850 text-slate-400 border-slate-700/30'
                    }`}>
                      {proj.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1">
                    <h3 className="font-bold text-white text-sm font-mono flex items-center gap-1.5 group-hover:text-[#FF4400] transition-colors uppercase">
                      {proj.title}
                    </h3>
                    <p className="text-[10px] text-slate-450 font-mono">
                      SRC: {proj.media_name || 'No video loaded'}
                    </p>
                  </div>

                  {/* Badges/Specs */}
                  <div className="mt-4 pt-3 border-t border-[#222] grid grid-cols-3 gap-2 text-[10px] text-slate-400 font-mono uppercase">
                    <div>
                      <span className="text-[9px] text-[#555] block">Src Lang</span>
                      <span className="truncate block text-slate-300 font-bold">{proj.source_language}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555] block">Dubs Map</span>
                      <span className="truncate block text-[#FF4400] font-bold">{proj.target_languages.join(', ')}</span>
                    </div>
                    <div>
                      <span className="text-[9px] text-[#555] block">Stamp</span>
                      <span className="truncate block text-slate-300">{proj.created_at}</span>
                    </div>
                  </div>

                  {/* Absolute Delete Button */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      if(confirm("Delete this project? All custom translations & audios will be reset.")) {
                        onDeleteProject(proj.project_id);
                      }
                    }}
                    className="absolute top-4 right-16 opacity-0 group-hover:opacity-100 p-1 bg-black/60 hover:bg-rose-950 text-[#555] hover:text-rose-400 border border-[#222] transition-all"
                    title="Delete Project"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>

                  {/* Enter Project Action */}
                  <div className="absolute right-4 bottom-14 opacity-0 group-hover:opacity-100 transition-all font-mono">
                    <span className="flex items-center gap-1 text-[9px] text-[#FF4400] font-bold uppercase tracking-tight">
                      Open_Mxr <Play className="w-2.5 h-2.5 fill-[#FF4400] stroke-[3px]" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Quick Batch/Ingestion Sidebar Info Card */}
        <div className="space-y-4">
          <h2 className="text-xs font-semibold text-white uppercase tracking-widest flex items-center gap-2 font-mono border-b border-[#222] pb-2">
            <HardDrive className="w-4 h-4 text-[#FF4400]" />
            Ingestion Terminal
          </h2>
          
          <div className="bg-[#0D0D0F] border border-[#222222] p-5 space-y-4">
            <h3 className="font-bold text-white text-xs font-mono uppercase tracking-wider">RESUMABLE DEEP PACKET SEGMENTATION</h3>
            <p className="text-[11px] text-[#AAA] leading-relaxed">
              Stage high-definition streams. The internal binary parser maps audio sample structures, and splits layout scenes instantly.
            </p>
            
            <div className="space-y-2">
              <div className="flex justify-between items-center text-[10px] text-slate-300 bg-black/40 p-2.5 border border-[#222] font-mono uppercase">
                <span className="font-bold text-white truncate max-w-[125px]">master_commercial.mkv</span>
                <span className="text-[#555]">Separate VO</span>
                <span className="text-green-400 font-bold">READY</span>
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-300 bg-black/40 p-2.5 border border-[#222] font-mono uppercase">
                <span className="font-bold text-white truncate max-w-[125px]">ep2_marketing_reel.mov</span>
                <span className="text-[#555]">4K ProRes</span>
                <span className="text-indigo-400 font-medium">SEGMENTED</span>
              </div>
            </div>

            <div className="bg-[#FF4400]/5 border border-[#FF4400]/20 p-3 flex gap-2.5 text-xs">
              <Database className="w-4 h-4 text-[#FF4400] mt-0.5 flex-shrink-0" />
              <div className="font-mono">
                <span className="font-bold text-white uppercase text-[10px] block tracking-wide">Storage Import integrations</span>
                <p className="text-slate-400 text-[10px] leading-snug mt-1 leading-relaxed">
                  DIRECT MOUNT PATHS FOR GCP STANDARD BUCKETS, S3 CLOUDS AND STRAW AUDIO REPO STEMS FOR FLUID TRANSCRIPT CONVERSIONS.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Creation Modal */}
      {showCreateModal && (
        <div id="new-project-modal" className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-[#0D0D0F] border border-[#333] max-w-2xl w-full overflow-hidden font-mono text-xs text-[#E0E0E0] select-none">
            <div className="bg-black p-5 border-b border-[#222222] flex justify-between items-center">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-white">Initialize localization project</h3>
                <p className="text-[10px] text-[#555]">Configure and map sequence stream pointers</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-[#555] hover:text-white font-bold text-base"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmitProject} className="p-6 space-y-5">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Project Details */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Project Name *</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. CYBER_TEASER_REFR"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 bg-black/50 border border-[#222] text-[#E0E0E0] outline-none focus:border-[#FF4400]"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Source Language</label>
                    <select 
                      value={newSrcLang}
                      onChange={(e) => setNewSrcLang(e.target.value)}
                      className="w-full text-xs px-3.5 py-2 bg-black border border-[#222] text-[#E0E0E0] outline-none focus:border-[#FF4400]"
                    >
                      <option>English</option>
                      <option>Spanish</option>
                      <option>French</option>
                      <option>German</option>
                      <option>Japanese</option>
                      <option>Hindi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Target Languages</label>
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text"
                        placeholder="e.g. Hindi, French"
                        value={targetLangInput}
                        onChange={(e) => setTargetLangInput(e.target.value)}
                        className="flex-1 text-xs px-3 py-1 bg-black/50 border border-[#222] text-[#E0E0E0] outline-none focus:border-[#FF4400]"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddLanguage}
                        className="px-4 py-1 bg-[#1A1A1E] text-white border border-[#333] tracking-tight uppercase font-bold text-[10px]"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {newTargetLangs.map(l => (
                        <span key={l} className="inline-flex items-center gap-1.5 text-[10px] font-bold bg-black border border-[#333] text-[#FF4400] px-2 py-0.5">
                          {l}
                          <button type="button" onClick={() => handleRemoveLanguage(l)} className="text-white hover:text-rose-500 font-extrabold ml-1 font-sans">×</button>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Media Uploader Ingestion */}
                <div className="space-y-4">
                  <span className="block text-[10px] font-bold text-[#555] uppercase tracking-wider mb-1">Ingest Master Media</span>
                  
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={`border border-dashed p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center ${
                      dragActive ? 'border-[#FF4400] bg-[#FF4400]/5' : 'border-[#333] bg-black/20 hover:bg-black/50 hover:border-[#444]'
                    }`}
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef}
                      onChange={handleFileChange}
                      accept="video/*,audio/*"
                      className="hidden" 
                    />
                    
                    <Upload className="w-6 h-6 text-slate-500 mb-2" />
                    <span className="text-[10px] font-bold text-white block uppercase tracking-tight">DRAG & DROP RAW MASTER DATA</span>
                    <span className="text-[9px] text-[#555] block mt-1 uppercase">Supports MP4, MOV, WAV (Max 50MB)</span>
                  </div>

                  {/* Uploading progress */}
                  {isUploading && (
                    <div className="bg-black/40 p-3 border border-[#222] text-[10px]">
                      <div className="flex justify-between font-bold text-slate-300 mb-1">
                        <span>STAGING PACKETS...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="w-full bg-[#111] h-1">
                        <div className="bg-[#FF4400] h-1" style={{ width: `${uploadProgress}%` }}></div>
                      </div>
                    </div>
                  )}

                  {/* Extracted Metadata Feedback */}
                  {extractedMetadata && (
                    <div className="bg-black text-[#E0E0E0] border border-[#222] p-3.5 text-[10px] space-y-2">
                      <span className="text-green-400 font-bold block border-b border-[#222] pb-1 flex items-center gap-1 uppercase">
                        <CheckCircle className="w-3.5 h-3.5" /> METADATA_EXTRACTION: SUCCESS
                      </span>
                      <div className="grid grid-cols-2 gap-2 text-slate-400">
                        <div>Duration: <span className="text-white">{extractedMetadata.duration}s</span></div>
                        <div>Resolution: <span className="text-white">{extractedMetadata.resolution}</span></div>
                        <div>FPS: <span className="text-white">{extractedMetadata.fps}</span></div>
                        <div>Sample Rate: <span className="text-white">{extractedMetadata.sample_rate}Hz</span></div>
                      </div>
                      <div>
                        <span className="text-[9px] text-[#555] block mt-1 uppercase font-bold">Automatic scenes mapping:</span>
                        <div className="text-[9px] text-[#888] space-y-1 mt-1 font-mono">
                          {extractedMetadata.scenes.map((s: any) => (
                            <div key={s.id} className="truncate">SEG {s.id}: [{s.start}-{s.end}] {s.description.toUpperCase()}</div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {uploadFile && !extractedMetadata && (
                    <div className="flex items-center gap-2 bg-black border border-[#222] text-green-400 p-2 text-[10px]">
                      <FileVideo className="w-3.5 h-3.5" />
                      <span className="truncate flex-1">{uploadFile.name.toUpperCase()} ({uploadFile.size})</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-4 border-t border-[#222222] flex justify-end gap-3 text-xs">
                <button 
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 border border-[#333] bg-transparent hover:bg-[#1A1A22] text-[#AAA] font-bold uppercase text-[10px] tracking-wider cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#FF4400] hover:bg-[#ff5d24] text-black font-extrabold uppercase text-[10px] tracking-wider cursor-pointer transition-colors"
                >
                  Create Studio Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
