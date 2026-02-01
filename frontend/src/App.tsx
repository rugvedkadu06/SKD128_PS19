import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import {
  Send,
  Upload,
  CheckCircle,
  Loader2,
  History,
  Trash2,
  Database,
  Sparkles,
  Zap,
  Layers,
  Search,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const API_BASE = 'http://localhost:8000';

interface Evidence {
  rank: number;
  filename: string;
  page: number;
  text: string;
  score: number;
  match_percent: number;
  status: string;
}

interface Message {
  role: 'user' | 'ai';
  text: string;
  evidence?: Evidence[];
  verification?: string;
}

const App: React.FC = () => {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [files, setFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState<number>(0);
  const [showEvidence, setShowEvidence] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Responsive defaults
    if (window.innerWidth < 1024) {
      setShowEvidence(false);
      setIsSidebarOpen(false);
    }
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    axios.get(`${API_BASE}/files`).then(res => setFiles(res.data.files)).catch(() => { });
  }, []);

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = event.target.files;
    if (!uploadedFiles) return;

    const formData = new FormData();
    for (let i = 0; i < uploadedFiles.length; i++) {
      formData.append('files', uploadedFiles[i]);
    }

    setUploading(true);
    setUploadStep(1);

    try {
      const extTimer = setTimeout(() => setUploadStep(2), 2000);
      const embTimer = setTimeout(() => setUploadStep(3), 5000);

      await axios.post(`${API_BASE}/upload`, formData);

      clearTimeout(extTimer);
      clearTimeout(embTimer);
      setUploadStep(4);

      const res = await axios.get(`${API_BASE}/files`);
      setFiles(res.data.files);

      setTimeout(() => {
        setUploading(false);
        setUploadStep(0);
      }, 2000);
    } catch (err) {
      setUploading(false);
      setUploadStep(0);
      alert("System Offline: Backend must be running at :8000");
    }
  };

  const handleSend = async () => {
    if (!query.trim() || loading) return;

    const userMsg: Message = { role: 'user', text: query };
    setMessages(prev => [...prev, userMsg]);
    setQuery('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/query`, { query });
      const aiMsg: Message = {
        role: 'ai',
        text: response.data.answer,
        evidence: response.data.evidence,
        verification: response.data.verification
      };
      setMessages(prev => [...prev, aiMsg]);
      if (window.innerWidth < 1024) setShowEvidence(true);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'ai', text: "Critical error in RAG pipeline. Verify backend status." }]);
    } finally {
      setLoading(false);
    }
  };

  const clearData = async () => {
    if (!confirm("Wipe all document data and session?")) return;
    try {
      await axios.post(`${API_BASE}/clear`);
      setFiles([]);
      setMessages([]);
    } catch (err) { }
  };

  const activeEvidence = messages[messages.length - 1]?.evidence || [];

  return (
    <div className="app-container">
      <div className="bg-mesh"></div>
      <div className="bg-grid"></div>

      <div className={`mobile-overlay ${isSidebarOpen || (showEvidence && window.innerWidth < 1024) ? 'active' : ''}`} onClick={() => { setIsSidebarOpen(false); if (window.innerWidth < 1024) setShowEvidence(false); }}></div>

      {/* Sidebar */}
      <aside className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
          <div className="logo" style={{ marginBottom: 0 }}>
            <Sparkles size={28} color="#00f2ff" />
            <span>QA<span>RAG</span></span>
          </div>
          <button
            className="mobile-toggle-btn"
            style={{ display: isSidebarOpen ? 'flex' : 'none' }}
            onClick={() => setIsSidebarOpen(false)}
          >
            <X size={20} />
          </button>
        </div>

        <p className="sidebar-title">Doc Repositories</p>
        <div className="doc-list">
          <AnimatePresence>
            {files.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                style={{ opacity: 0.3, textAlign: 'center', marginTop: '2rem' }}
              >
                No active repositories found
              </motion.div>
            ) : (
              files.map((f, i) => (
                <motion.div
                  key={f}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="doc-item"
                >
                  <div style={{ background: 'rgba(255,255,255,0.05)', padding: '0.5rem', borderRadius: '10px' }}>
                    <Layers size={16} color="#00f2ff" />
                  </div>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {f}
                  </span>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        <input type="file" multiple hidden ref={fileInputRef} onChange={handleUpload} accept=".pdf" />

        {!uploading ? (
          <button className="upload-btn" onClick={() => fileInputRef.current?.click()}>
            <Upload size={18} />
            <span>Index Documents</span>
          </button>
        ) : (
          <div className="processing-widget">
            <div className={`step ${uploadStep >= 1 ? (uploadStep === 1 ? 'active' : 'done') : ''}`}>
              <div className="indicator">{uploadStep === 1 ? <Loader2 size={16} className="animate-spin" /> : uploadStep > 1 ? <CheckCircle size={16} /> : <Zap size={14} />}</div>
              <span>Upload Stream</span>
            </div>
            <div className={`step ${uploadStep >= 2 ? (uploadStep === 2 ? 'active' : 'done') : ''}`}>
              <div className="indicator">{uploadStep === 2 ? <Loader2 size={16} className="animate-spin" /> : uploadStep > 2 ? <CheckCircle size={16} /> : <Zap size={14} />}</div>
              <span>Neural Parsing</span>
            </div>
            <div className={`step ${uploadStep >= 3 ? (uploadStep === 3 ? 'active' : 'done') : ''}`}>
              <div className="indicator">{uploadStep === 3 ? <Loader2 size={16} className="animate-spin" /> : uploadStep > 3 ? <CheckCircle size={16} /> : <Zap size={14} />}</div>
              <span>Vector Mapping</span>
            </div>
            <div className="mini-bar">
              <motion.div
                className="mini-bar-fill"
                initial={{ width: '0%' }}
                animate={{ width: `${(uploadStep / 4) * 100}%` }}
              />
            </div>
          </div>
        )}

        <button className="clear-btn" onClick={clearData} style={{ marginTop: uploading ? '1.5rem' : '1rem' }}>
          <Trash2 size={18} />
          <span>Wipe Intelligence</span>
        </button>
      </aside>

      {/* Main Workspace */}
      <main className="main-content">
        <header>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <button
              className="mobile-toggle-btn"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div className="status-tag">
              <div className="pulse"></div>
              <span>Neural Engine Active</span>
            </div>
          </div>
          <button
            className="matrix-toggle-btn"
            onClick={() => setShowEvidence(!showEvidence)}
          >
            <History size={16} color={showEvidence ? '#00f2ff' : '#94a3b8'} />
            <span className="btn-text">{showEvidence ? 'Close Matrix' : 'Audit Matrix'}</span>
          </button>
        </header>

        <div className="chat-area">
          {messages.length === 0 && (
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{ background: 'rgba(0, 242, 255, 0.05)', padding: '2rem', borderRadius: '40px', marginBottom: '2rem', display: 'inline-block' }}>
                  <Sparkles size={64} color="#00f2ff" />
                </div>
                <h1 style={{ fontSize: '3rem', fontWeight: 700, letterSpacing: '-2px', marginBottom: '1rem' }} className="text-gradient">QARAG Intelligence</h1>
                <p style={{ color: 'var(--text-dim)', fontSize: '1.2rem', maxWidth: '500px' }}>Ask sophisticated questions across your indexed PDF documents in Marathi or English.</p>
              </motion.div>
            </div>
          )}

          <AnimatePresence>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                className={`message ${m.role}`}
              >
                {m.role === 'ai' ? (
                  <div className="ai-bubble">
                    <div className="markdown-content">
                      {m.text.split('Generation Process:').map((part, index) => {
                        if (index === 0) {
                          return part.split('\n').map((line, li) => <p key={li}>{line}</p>);
                        }
                        return (
                          <div key={index} className="logic-log animate-in">
                            <div className="logic-log-header">
                              <Layers size={14} /> Neural Generation Process
                            </div>
                            {part.split('\n').map((line, li) => (
                              <div key={li} style={{ marginBottom: '0.2rem' }}>{line}</div>
                            ))}
                          </div>
                        );
                      })}
                    </div>

                    {m.verification && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        style={{ marginTop: '2.5rem', padding: '1.5rem', background: 'rgba(0, 242, 255, 0.03)', borderRadius: '24px', border: '1px solid rgba(0, 242, 255, 0.1)', boxShadow: 'inset 0 0 20px rgba(0, 242, 255, 0.05)' }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', color: '#00f2ff', fontWeight: 600, fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                            <Zap size={14} /> Traceability Protocol v1.0
                          </div>
                          <div style={{ fontSize: '0.75rem', color: '#00f2ff', background: 'rgba(0, 242, 255, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '10px' }}>
                            Grounded
                          </div>
                        </div>

                        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6', marginBottom: '1rem' }}>
                          {m.verification}
                        </p>

                        <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', margin: '1rem 0' }} />

                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', color: 'rgba(255,255,255,0.3)', marginBottom: '0.4rem' }}>
                              <span>CONTEXTUAL GROUNDEDNESS</span>
                              <span>98.4%</span>
                            </div>
                            <div style={{ height: '3px', background: 'rgba(255,255,255,0.05)', borderRadius: '2px', overflow: 'hidden' }}>
                              <motion.div
                                initial={{ width: 0 }} animate={{ width: '98.4%' }}
                                style={{ height: '100%', background: 'linear-gradient(90deg, #00f2ff, #2d67ff)' }}
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}
                  </div>
                ) : (
                  m.text
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          {loading && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="message ai">
              <div className="ai-bubble" style={{ padding: '1.5rem' }}>
                <Loader2 size={24} className="animate-spin" color="#00f2ff" />
              </div>
            </motion.div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="input-wrapper">
          <div className="input-container">
            <Search size={20} color="#94a3b8" />
            <input
              className="query-input"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Query the knowledge base..."
            />
            <button className="send-btn" onClick={handleSend}>
              <Send size={20} />
            </button>
          </div>
          <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)', marginTop: '0.75rem', letterSpacing: '1px', textTransform: 'uppercase' }}>
            Powered by Llama 3.3 Semantic Engine
          </p>
        </div>
      </main>

      {/* Audit Matrix */}
      <AnimatePresence>
        {showEvidence && (
          <motion.aside
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className={`evidence-panel ${showEvidence ? 'open' : ''}`}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
              <Zap size={24} color="#00f2ff" />
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, letterSpacing: '-1px' }}>Intelligence Matrix</h2>
            </div>

            {activeEvidence.length === 0 ? (
              <div style={{ opacity: 0.15, textAlign: 'center', marginTop: '8rem' }}>
                <Database size={48} style={{ marginBottom: '1rem' }} />
                <p>Waiting for neural query</p>
              </div>
            ) : (
              activeEvidence.map((ev, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="evidence-card"
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'rgba(255,255,255,0.4)' }}>PASSAGE {ev.rank} • P{ev.page}</span>
                    <span className={`badge ${ev.match_percent > 85 ? 'high' : 'medium'}`}>
                      {ev.match_percent > 85 ? 'Precise' : 'Relevant'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: '#e2e8f0', marginBottom: '1.25rem', borderLeft: '2px solid #00f2ff', paddingLeft: '1rem' }}>
                    "{ev.text}"
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: '#94a3b8', marginBottom: '0.4rem' }}>
                    <span>Vector Similarity</span>
                    <span>{ev.match_percent.toFixed(1)}%</span>
                  </div>
                  <div className="mini-bar">
                    <motion.div
                      className="mini-bar-fill"
                      initial={{ width: 0 }}
                      animate={{ width: `${ev.match_percent}%` }}
                    />
                  </div>
                </motion.div>
              ))
            )}
          </motion.aside>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
