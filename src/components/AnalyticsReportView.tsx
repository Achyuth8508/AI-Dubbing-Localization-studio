import React from 'react';
import { 
  BarChart, Bar, LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Cpu, TrendingUp, Zap, Clock, ThumbsUp, DollarSign, Activity, ListOrdered, Globe
} from 'lucide-react';

export default function AnalyticsReportView() {
  // Chart Data 1: Render times by project size
  const renderTimeData = [
    { name: '10s Clip', renderTime: 4.8, simulatedCpu: 45 },
    { name: '30s Ad', renderTime: 12.5, simulatedCpu: 60 },
    { name: '60s Promo', renderTime: 23.4, simulatedCpu: 78 },
    { name: '5m Course', renderTime: 110.2, simulatedCpu: 85 },
    { name: '15m Episode', renderTime: 320.5, simulatedCpu: 92 },
  ];

  // Chart Data 2: API usage metrics (Gemini tokens, dialogue adapts)
  const apiUsageData = [
    { date: 'Mon', translationTokens: 4200, voicesSynthesized: 12, adaptations: 25 },
    { date: 'Tue', translationTokens: 5800, voicesSynthesized: 18, adaptations: 42 },
    { date: 'Wed', translationTokens: 8100, voicesSynthesized: 31, adaptations: 60 },
    { date: 'Thu', translationTokens: 3900, voicesSynthesized: 15, adaptations: 18 },
    { date: 'Fri', translationTokens: 9400, voicesSynthesized: 42, adaptations: 84 },
    { date: 'Sat', translationTokens: 2500, voicesSynthesized: 8, adaptations: 12 },
    { date: 'Sun', translationTokens: 1200, voicesSynthesized: 4, adaptations: 5 },
  ];

  // Chart Data 3: Quality scores over iterations
  const qualityScoresData = [
    { run: 'Raw Draft', score: 74 },
    { run: 'AI Align V1', score: 83 },
    { run: 'Glossary Lock', score: 89 },
    { run: 'Pacing Adjust', score: 94 },
    { run: 'Lip Sync Rig', score: 97 },
  ];

  // Chart Data 4: Distr. of dub target languages
  const languageStatsData = [
    { name: 'Spanish', value: 45, color: '#FF4400' },
    { name: 'French', value: 25, color: '#E0E0E0' },
    { name: 'Japanese', value: 15, color: '#FF7700' },
    { name: 'Hindi', value: 10, color: '#555555' },
    { name: 'German', value: 5, color: '#222222' },
  ];

  // Render logs queue mock
  const renderLogs = [
    { id: 'LOG_ID__709', file: 'TEASER_TRAILER_FR.MP4', status: 'SUCCESS', ratio: '0.12x', time: '14.2s', date: '10:14 UTC' },
    { id: 'LOG_ID__708', file: 'LECTURE_INTRO_ES.MOV', status: 'SUCCESS', ratio: '0.15x', time: '48.5s', date: '09:31 UTC' },
    { id: 'LOG_ID__707', file: 'AD_CAMPAIGN_DE.MKV', status: 'CANCELED', ratio: 'N/A', time: '2.1s', date: '16:15 UTC' },
    { id: 'LOG_ID__706', file: 'CEO_KEYNOTE_JA.MP4', status: 'SUCCESS', ratio: '0.18x', time: '124.0s', date: '13:08 UTC' },
  ];

  return (
    <div id="analytics-tab" className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* 4 Cards Overview metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        
        <div className="bg-[#0D0D0F] border border-[#222] p-4 flex items-center gap-3.5 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Avg Render Factor</span>
            <span className="text-lg font-black text-white">0.15x</span>
            <span className="text-[9px] text-[#FF4400] font-medium block">SUPER_COMPILE ACTIVE</span>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#222] p-4 flex items-center gap-3.5 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Estimated Savings</span>
            <span className="text-lg font-black text-white">$14,580</span>
            <span className="text-[9px] text-slate-400 font-medium block">VS VOCAL HIRING COSTS</span>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#222] p-4 flex items-center gap-3.5 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">AI API Requests</span>
            <span className="text-lg font-black text-white">842 calls</span>
            <span className="text-[9px] text-green-400 font-medium block">99.8% SUCCESS RATE</span>
          </div>
        </div>

        <div className="bg-[#0D0D0F] border border-[#222] p-4 flex items-center gap-3.5 shadow-sm font-mono text-xs">
          <div className="p-3 bg-black border border-[#222] text-[#FF4400]">
            <ThumbsUp className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[9px] text-slate-500 font-bold uppercase block">Precision Index</span>
            <span className="text-lg font-black text-white">96.4 / 100</span>
            <span className="text-[9px] text-emerald-400 font-medium block">LIP_SYNC VERIFIED</span>
          </div>
        </div>

      </div>

      {/* Main Grid for charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Render Performance BarChart */}
        <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Cpu className="w-4 h-4 text-[#FF4400]" />
              COMPILE & RENDER EFFICIENCY
            </h3>
            <span className="text-[9px] text-slate-500 block">RENDER DURATION IN SECONDS BY TARGET SIZE</span>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={renderTimeData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#1A1A22" />
                <XAxis dataKey="name" tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <YAxis tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <Tooltip contentStyle={{ fontSize: 10, backgroundColor: '#000', borderColor: '#222', color: '#FFF' }} />
                <Legend wrapperStyle={{ fontSize: 10, color: '#AAA' }} />
                <Bar name="Render Time (s)" dataKey="renderTime" fill="#FF4400" radius={[0, 0, 0, 0]} />
                <Bar name="CPU Utilization (%)" dataKey="simulatedCpu" fill="#555" radius={[0, 0, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* API usage trends LineChart */}
        <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Activity className="w-4 h-4 text-[#FF4400]" />
              WEEKLY LOCALIZATION TRAFFIC
            </h3>
            <span className="text-[9px] text-slate-500 block">TRANSLATION CHARACTER VOLUME & VOICE CONVERSIONS</span>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={apiUsageData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" />
                <XAxis dataKey="date" tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <YAxis tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <Tooltip contentStyle={{ fontSize: 10, backgroundColor: '#000', borderColor: '#222', color: '#FFF' }} />
                <Legend wrapperStyle={{ fontSize: 10 }} />
                <Line name="Vocal Synthesized" type="monotone" dataKey="voicesSynthesized" stroke="#FF4400" strokeWidth={2.5} />
                <Line name="Syllable Adapting" type="monotone" dataKey="adaptations" stroke="#E0E0E0" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Quality Iteration AreaChart */}
        <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <TrendingUp className="w-4 h-4 text-[#FF4400]" />
              PRECISION SCORE PROGRESSION
            </h3>
            <span className="text-[9px] text-slate-500 block">SYLLABLE ADAPTATION AUDITS BY PROJECT REVISIONS</span>
          </div>

          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={qualityScoresData}>
                <defs>
                  <linearGradient id="scoreColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF4400" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#FF4400" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1A1A22" />
                <XAxis dataKey="run" tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <YAxis domain={[50, 100]} tick={{ fontSize: 9, fill: '#888' }} stroke="#222" />
                <Tooltip contentStyle={{ fontSize: 10, backgroundColor: '#000', borderColor: '#222', color: '#FFF' }} />
                <Area name="Localization Rating (%)" type="monotone" dataKey="score" stroke="#FF4400" strokeWidth={2.5} fillOpacity={1} fill="url(#scoreColor)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribution Pie chart */}
        <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
          <div>
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5 uppercase tracking-wider">
              <Globe className="w-4 h-4 text-[#FF4400]" />
              TARGET LANGUAGE DISTRIBUTION
            </h3>
            <span className="text-[9px] text-slate-500 block">LANGUAGE FREQUENCY SHARE IN STUDIO STORAGE DIRECTORY</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-around gap-4 h-[240px]">
            <div className="w-[180px] h-[180px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={languageStatsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {languageStatsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 10, backgroundColor: '#000' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-1.5 text-xs text-[#AAA] uppercase">
              {languageStatsData.map((v) => (
                <div key={v.name} className="flex items-center gap-2">
                  <span className="h-2 w-2" style={{ backgroundColor: v.color }}></span>
                  <span className="font-semibold text-slate-400">{v.name}:</span>
                  <span className="font-bold text-white">{v.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Render Logs details queue */}
      <div className="bg-[#0D0D0F] border border-[#222] p-5 space-y-4 font-mono text-xs">
        <h3 className="font-bold text-white text-xs flex items-center gap-1.5 border-b border-[#222] pb-2 uppercase">
          <ListOrdered className="w-4 h-4 text-[#FF4400]" />
          PRODUCTION RENDER HISTORY LOGS
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[11px]">
            <thead>
              <tr className="bg-black border-b border-[#222] text-[#888] uppercase tracking-wider text-[9px]">
                <th className="p-3">Job ID</th>
                <th className="p-3">Target File Name</th>
                <th className="p-3">Status</th>
                <th className="p-3">Realtime Multiplier</th>
                <th className="p-3">Compile Time</th>
                <th className="p-3">Completed Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222] text-slate-300 uppercase">
              {renderLogs.map((log) => (
                <tr key={log.id} className="hover:bg-black/10">
                  <td className="p-3 font-semibold text-[#FF4400]">{log.id}</td>
                  <td className="p-3 text-white">{log.file}</td>
                  <td className="p-3">
                    <span className={`px-2 py-0.5 text-[8.5px] font-bold ${
                      log.status === 'SUCCESS' ? 'bg-green-950 text-green-400 border border-green-900/30' : 'bg-red-950 text-red-400 border border-red-900/30'
                    }`}>
                      {log.status}
                    </span>
                  </td>
                  <td className="p-3 text-slate-400">{log.ratio}</td>
                  <td className="p-3 text-slate-400">{log.time}</td>
                  <td className="p-3 text-slate-500">{log.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
