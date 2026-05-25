const TOOLS = [
  '🐍 Python', '⚡ FastAPI', '🟢 Django',
  '🧠 LangGraph', '🔗 LangChain', '🎙️ LiveKit',
  '🐘 PostgreSQL', '⚡ Redis', '🐳 Docker',
  '☁️ AWS', '💠 Azure', '☁️ GCP',
  '🌐 Nginx', '▲ Next.js', '🐙 Git', '🔷 TypeScript',
]

export default function BentoToolbox() {
  return (
    <div className="bc bc-toolbox">
      <div className="bc-label">My Toolbox</div>
      <div className="bc-title">Tech that powers my creations</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '8px' }}>
        {TOOLS.map(tool => (
          <span key={tool} className="tpill">{tool}</span>
        ))}
      </div>
    </div>
  )
}
