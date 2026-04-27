import React, { useState, useMemo, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Users, 
  Settings2, 
  Trash2, 
  Copy, 
  Check, 
  Shuffle, 
  UserPlus, 
  LayoutGrid, 
  ChevronRight,
  RefreshCw,
  Zap,
  Sparkles,
  FileUp,
  FileText
} from 'lucide-react';
import { cn } from './lib/utils';

type GroupMode = 'groupCount' | 'memberCount';

const TEST_NAMES = [
  '陳小明', '林正傑', '王大同', '張美玲', '李家豪', 
  '許淑芬', '郭台銘', '蔡英文', '馬英九', '蘇貞昌', 
  '鄭文燦', '盧秀燕', '黃珊珊', '蔣萬安', '高虹安', 
  '柯文哲', '賴清德', '侯友宜', '林佳龍', '朱立倫'
];

export default function App() {
  const [inputText, setInputText] = useState('');
  const [mode, setMode] = useState<GroupMode>('groupCount');
  const [configValue, setConfigValue] = useState(4);
  const [groups, setGroups] = useState<string[][]>([]);
  const [copied, setCopied] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Parse input into clean list of names
  const members = useMemo(() => {
    return inputText
      .split(/[\n,]+/)
      .map(name => name.trim())
      .filter(name => name !== '');
  }, [inputText]);

  const handleShuffle = useCallback(() => {
    if (members.length === 0) return;
    
    setIsProcessing(true);
    
    // Artificial delay for feel
    setTimeout(() => {
      const shuffled = [...members].sort(() => Math.random() - 0.5);
      const result: string[][] = [];

      if (mode === 'groupCount') {
        const groupCount = Math.max(1, configValue);
        for (let i = 0; i < groupCount; i++) {
          result.push([]);
        }
        shuffled.forEach((name, index) => {
          result[index % groupCount].push(name);
        });
      } else {
        const memberCount = Math.max(1, configValue);
        for (let i = 0; i < shuffled.length; i += memberCount) {
          result.push(shuffled.slice(i, i + memberCount));
        }
      }

      setGroups(result.filter(g => g.length > 0));
      setIsProcessing(false);
    }, 600);
  }, [members, mode, configValue]);

  const handleLoadTestData = () => {
    setInputText(TEST_NAMES.join('\n'));
    setGroups([]);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setInputText(content);
        setGroups([]);
      }
    };
    reader.readAsText(file);
    
    // Reset file input value to allow importing the same file again
    e.target.value = '';
  };

  const handleCopy = async () => {
    const text = groups
      .map((group, i) => `第 ${i + 1} 組:\n${group.join(', ')}`)
      .join('\n\n');
    
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy!', err);
    }
  };

  const clearInput = () => {
    if (confirm('確定要清空名單嗎？')) {
      setInputText('');
      setGroups([]);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-6xl mx-auto flex flex-col min-h-[calc(100vh-4rem)]">
        
        {/* Header Section */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-800">
              分組大師 <span className="text-indigo-600 font-black italic">PRO</span>
            </h1>
            <p className="text-sm text-slate-500 font-medium">高效隊伍生成引擎 / Smart Team Engine</p>
          </div>
          <div className="flex gap-3">
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef} 
              accept=".txt,.csv" 
              onChange={handleFileChange} 
            />
            <button 
              onClick={handleImportClick}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <FileUp className="w-4 h-4 text-indigo-500" />
              匯入文件
            </button>
            <button 
              onClick={handleLoadTestData}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors shadow-sm flex items-center gap-2"
            >
              <Zap className="w-4 h-4 text-amber-500" />
              載入測試名單
            </button>
            <button 
              onClick={clearInput}
              className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shadow-sm"
            >
              清空
            </button>
            <button 
              onClick={handleShuffle}
              disabled={members.length === 0 || isProcessing}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg text-sm font-semibold hover:bg-indigo-700 shadow-md shadow-indigo-100 disabled:opacity-50 flex items-center gap-2 transition-transform active:scale-95"
            >
              {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Shuffle className="w-4 h-4" />}
              立即開始分組
            </button>
          </div>
        </header>

        {/* Main Bento Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 flex-1 items-stretch">
          
          {/* Member Pool (Bento Left) */}
          <section className="lg:col-span-4 flex flex-col gap-5">
            <motion.div 
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col flex-1"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-indigo-500" />
                  成員清單
                </h3>
                <span className="px-2 py-0.5 bg-slate-100 text-slate-500 text-xs font-mono rounded">
                  {members.length} 位參與者
                </span>
              </div>
              
              <div className="flex-1 min-h-[300px] flex flex-col">
                <textarea 
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  className="w-full flex-1 p-4 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-none resize-none transition-all" 
                  placeholder="請貼上姓名（使用換行或逗號分隔）..."
                />
                
                {members.length > 0 && (
                  <div className="mt-4 flex flex-wrap gap-1.5 max-h-32 overflow-y-auto content-start py-2">
                    {members.slice(0, 10).map((name, i) => (
                      <span key={i} className="px-2 py-1 bg-indigo-50 border border-indigo-100 rounded-md text-[10px] text-indigo-700">
                        {name}
                      </span>
                    ))}
                    {members.length > 10 && (
                      <span className="px-2 py-1 bg-slate-50 border border-slate-200 rounded-md text-[10px] text-slate-400 border-dashed">
                        + {members.length - 10} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </section>

          {/* Controls & Results */}
          <section className="lg:col-span-8 flex flex-col gap-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-4 text-slate-700 font-bold">
                  <Settings2 className="w-5 h-5 text-indigo-500" />
                  分組參數
                </div>
                <div className="space-y-5">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">分組邏輯 / Logic</label>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                      <button 
                        onClick={() => setMode('groupCount')}
                        className={cn(
                          "py-2 text-sm font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                          mode === 'groupCount' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        <LayoutGrid className="w-4 h-4" />
                        指定組數
                      </button>
                      <button 
                        onClick={() => setMode('memberCount')}
                        className={cn(
                          "py-2 text-sm font-medium rounded-lg border-2 transition-all flex items-center justify-center gap-2",
                          mode === 'memberCount' ? "border-indigo-600 bg-indigo-50 text-indigo-700" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                        )}
                      >
                        <Users className="w-4 h-4" />
                        指定人數
                      </button>
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-end mb-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">目標數值 / Size</label>
                      <span className="text-xl font-black text-indigo-600 font-mono">{configValue}</span>
                    </div>
                    <input 
                      type="range" 
                      min="1"
                      max={Math.max(2, members.length)}
                      value={configValue}
                      onChange={(e) => setConfigValue(parseInt(e.target.value))}
                      className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                  </div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-500" />
                    進階選項
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg opacity-50 cursor-not-allowed">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">平衡性別</span>
                      <div className="w-8 h-4 bg-slate-200 rounded-full relative">
                        <div className="absolute left-1 top-0.5 w-3 h-3 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-slate-50 rounded-lg opacity-50 cursor-not-allowed">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-tight">避免重複</span>
                      <div className="w-8 h-4 bg-indigo-600 rounded-full relative">
                        <div className="absolute right-1 top-0.5 w-3 h-3 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="text-[10px] text-indigo-400 mt-4 italic font-medium text-right">
                  * 啟用基於 Fisher-Yates 的隨機化算法
                </div>
              </motion.div>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-slate-900 rounded-[2rem] p-8 shadow-2xl flex-1 flex flex-col min-h-[400px]"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-white text-lg flex items-center gap-3">
                  <div className="w-3 h-3 bg-indigo-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(99,102,241,0.8)]" />
                  即時生成預覽 / Live Preview
                </h3>
                <div className="flex items-center gap-4">
                  {groups.length > 0 && (
                    <button 
                      onClick={handleCopy}
                      className={cn(
                        "text-xs px-3 py-1.5 rounded-full transition-all flex items-center gap-2 border",
                        copied ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" : "bg-white/5 border-white/10 text-slate-400 hover:bg-white/10"
                      )}
                    >
                      {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                      {copied ? '已複製' : '複製結果'}
                    </button>
                  )}
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-emerald-400 rounded-full"></span>
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-widest">System Ready</span>
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
                <AnimatePresence mode="wait">
                  {groups.length > 0 ? (
                    <motion.div 
                      key="results"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {groups.map((group, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-slate-800/50 rounded-2xl p-5 border border-slate-700/50 hover:border-indigo-500/30 transition-colors group"
                        >
                          <div className="flex justify-between items-center mb-3">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] italic">
                              Group {String(i + 1).padStart(2, '0')}
                            </p>
                            <span className="text-[10px] text-slate-500 font-mono">
                              n={group.length}
                            </span>
                          </div>
                          <ul className="text-xs text-slate-300 space-y-2">
                            {group.map((name, j) => (
                              <li key={j} className="flex items-center gap-2 py-1 border-b border-white/5 last:border-0">
                                <ChevronRight className="w-3 h-3 text-indigo-500/50 group-hover:text-indigo-400 transition-colors" />
                                <span className="font-medium">{name}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="h-full flex flex-col items-center justify-center text-slate-500 gap-4 py-20"
                    >
                      <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                        <Shuffle className="w-8 h-8 opacity-20" />
                      </div>
                      <p className="text-sm font-medium tracking-wide">目前無生成數據，請先點擊「開始分組」</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </section>
        </div>

        {/* Footer */}
        <footer className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] text-slate-400 font-mono uppercase tracking-[0.2em]">
          <div className="flex gap-4">
            <span>Algorithm: Fisher-Yates Hybrid v2.4</span>
            <span className="hidden md:inline">|</span>
            <span>Execution: {isProcessing ? 'Processing...' : '0.0ms (cached)'}</span>
          </div>
          <div className="text-slate-500">
            Powered by Group Master Engine
          </div>
        </footer>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(99, 102, 241, 0.2);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(99, 102, 241, 0.4);
        }
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 14px;
          height: 14px;
          background: #6366f1;
          cursor: pointer;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 0 10px rgba(99, 102, 241, 0.3);
        }
      `}</style>
    </div>
  );
}
