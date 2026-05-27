'use client'
import { useTheme, ThemeProvider } from './ThemeContext'
import type { ThemeTokens } from './types'
import type { PortfolioData } from '@/data/types'
import ResumeNav from './ResumeNav'
import ResumeHero from './ResumeHero'
import ResumeSocial from './ResumeSocial'
import ResumeExperience from './ResumeExperience'
import ResumeSkills from './ResumeSkills'
import ResumeProjects from './ResumeProjects'
import ResumeContact from './ResumeContact'
import ResumeFooter from './ResumeFooter'

const DARK: ThemeTokens = {
  bg: '#070600', bgTerm: 'rgba(245,197,24,0.04)', nav: 'rgba(7,6,0,0.92)',
  txt: '#f5eddb', dim: 'rgba(245,237,219,0.54)', dimLo: 'rgba(245,237,219,0.30)',
  gold: '#f5c518', goldDk: '#c49a00', goldLt: '#ffd84d',
  border: 'rgba(245,197,24,0.16)', borderHv: 'rgba(245,197,24,0.44)',
  dotPattern: 'none', scrollThumb: '#c49a00',
}

const LIGHT: ThemeTokens = {
  bg: '#c8980a', bgTerm: 'rgba(0,0,0,0.10)', nav: 'rgba(186,138,0,0.95)',
  txt: '#0a0800', dim: 'rgba(10,8,0,0.68)', dimLo: 'rgba(10,8,0,0.42)',
  gold: '#0f0c00', goldDk: 'rgba(10,8,0,0.55)', goldLt: '#1a1600',
  border: 'rgba(0,0,0,0.18)', borderHv: 'rgba(0,0,0,0.42)',
  dotPattern: `radial-gradient(circle, rgba(0,0,0,0.22) 1.5px, transparent 1.5px)`,
  dotSize: '18px 18px', scrollThumb: 'rgba(0,0,0,0.40)',
}

function Divider({ T }: { T: ThemeTokens }) {
  return <div style={{ height: 1, background: T.border, margin: '48px 0', transition: 'background .35s' }} />
}

const col: React.CSSProperties = { maxWidth: 680, margin: '0 auto', padding: '0 28px' }

function ResumeInner({ data }: { data: PortfolioData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const T = isDark ? DARK : LIGHT

  return (
    <>
      <style>{`
        @keyframes rp-pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #4ade80}50%{opacity:.35;box-shadow:0 0 3px #4ade80} }
        @keyframes rp-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes rp-fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
        .resume-root ::-webkit-scrollbar{width:4px}
        .resume-root ::-webkit-scrollbar-track{background:${T.bg}}
        .resume-root ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px}
        ::selection{background:${isDark?'rgba(245,197,24,0.25)':'rgba(0,0,0,0.28)'};color:${T.txt}}
      `}</style>

      <div
        className="resume-root"
        style={{
          paddingTop: 90, paddingBottom: 100,
          background: T.bg,
          backgroundImage: T.dotPattern,
          backgroundSize: T.dotSize ?? 'auto',
          minHeight: '100vh',
          transition: 'background .35s, color .35s',
          animation: 'rp-fadeIn .4s ease both',
        }}
      >
        <ResumeNav T={T} />
        <div style={col}>
          <ResumeHero
            T={T}
            isDark={isDark}
            name={data.meta.name}
            role={data.meta.role}
            location={data.meta.location}
            bio={[
              "Python developer with 3+ years building scalable APIs, AI agents, and real-time voice systems. Currently at Excellence Technologies — shipping LangGraph pipelines, LiveKit voice agents, and multi-cloud deployments.",
              "Proficient in Django, FastAPI, LangGraph, LangChain. Hands-on with AI workflows: RAG, multi-agent systems, document extraction pipelines. Voice infra via LiveKit and Twilio SIP.",
            ]}
            tldr="I build until it works. Backend engineering and AI isn't just a career — it's the thing I genuinely can't stop improving."
          />
          <Divider T={T} />
          <ResumeSocial T={T} socials={data.contact.socials} email={data.contact.email} />
          <Divider T={T} />
          <ResumeExperience T={T} experience={data.experience} />
          <Divider T={T} />
          <ResumeSkills T={T} skills={data.skills} />
          <Divider T={T} />
          <ResumeProjects T={T} projects={data.projects} />
          <Divider T={T} />
          <ResumeContact T={T} contact={data.contact} />
          <Divider T={T} />
          <ResumeFooter T={T} footer={data.footer} />
        </div>
      </div>
    </>
  )
}

export default function ResumePortfolio({ data }: { data: PortfolioData }) {
  return (
    <ThemeProvider>
      <ResumeInner data={data} />
    </ThemeProvider>
  )
}
