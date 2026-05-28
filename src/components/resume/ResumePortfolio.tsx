'use client'
import { useTheme, ThemeProvider } from './ThemeContext'
import type { ThemeTokens } from './types'
import type { PortfolioData } from '@/data/types'
import CustomCursor from '@/components/ui/CustomCursor'
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
  bg: '#fdf6e3',
  bgTerm: 'rgba(184,134,11,0.09)',
  nav: 'rgba(253,246,227,0.97)',
  txt: '#0a0800',
  dim: 'rgba(10,8,0,0.62)',
  dimLo: 'rgba(10,8,0,0.38)',
  gold: '#b8860b',
  goldDk: '#8b6400',
  goldLt: '#d4a017',
  border: 'rgba(184,134,11,0.20)',
  borderHv: 'rgba(184,134,11,0.50)',
  dotPattern: 'none',
  scrollThumb: 'rgba(184,134,11,0.40)',
}

function Divider({ T }: { T: ThemeTokens }) {
  return <div style={{ height: 1, background: T.border, margin: '12px 0', transition: 'background .35s' }} />
}

const col: React.CSSProperties = { maxWidth: 680, margin: '0 auto', padding: '0 28px' }

function ResumeInner({ data }: { data: PortfolioData }) {
  const { theme } = useTheme()
  const isDark = theme === 'dark'
  const T = isDark ? DARK : LIGHT

  return (
    <>
      <CustomCursor />
      <style>{`
        @keyframes rp-pulse { 0%,100%{opacity:1;box-shadow:0 0 8px #4ade80}50%{opacity:.35;box-shadow:0 0 3px #4ade80} }
        @keyframes rp-blink { 0%,100%{opacity:1}50%{opacity:0} }
        @keyframes rp-fadeIn { from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none} }
        @keyframes rp-orb1 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(40px,-28px) scale(1.12)} }
        @keyframes rp-orb2 { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(-30px,32px) scale(0.90)} }
        @keyframes rp-orb3 { 0%,100%{transform:translate(0,0)} 40%{transform:translate(18px,14px)} 80%{transform:translate(-12px,-16px)} }
        .resume-root ::-webkit-scrollbar{width:4px}
        .resume-root ::-webkit-scrollbar-track{background:${T.bg}}
        .resume-root ::-webkit-scrollbar-thumb{background:${T.scrollThumb};border-radius:4px}
        ::selection{background:${isDark?'rgba(245,197,24,0.25)':'rgba(184,134,11,0.22)'};color:${T.txt}}
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
        {/* Floating amber orbs — light mode only */}
        {!isDark && <>
          <div style={{ position:'fixed', inset:0, overflow:'hidden', pointerEvents:'none', zIndex:0 }}>
            <div style={{ position:'absolute', width:420, height:380, borderRadius:'50%', background:'rgba(245,197,24,0.16)', filter:'blur(80px)', top:'-120px', right:'-60px', animation:'rp-orb1 9s ease-in-out infinite' }} />
            <div style={{ position:'absolute', width:320, height:320, borderRadius:'50%', background:'rgba(184,134,11,0.12)', filter:'blur(70px)', bottom:'-80px', left:'-40px', animation:'rp-orb2 11s ease-in-out infinite' }} />
            <div style={{ position:'absolute', width:260, height:260, borderRadius:'50%', background:'rgba(245,160,24,0.10)', filter:'blur(60px)', top:'40%', right:'20%', animation:'rp-orb3 14s ease-in-out infinite' }} />
          </div>
        </>}
        <ResumeNav T={T} />
        <div style={{ ...col, position:'relative', zIndex:1 }}>
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
