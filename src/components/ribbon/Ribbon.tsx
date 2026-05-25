const TOP_ITEMS = [
  'FastAPI','LangGraph','LiveKit','Django','Docker',
  'PostgreSQL','Redis','WebSockets','AWS','Azure','GCP','Python','Nginx','Twilio',
]
const BOTTOM_ITEMS = [
  'BACKEND','AI ENGINEER','REALTIME','VOICE','PYTHON',
  'CLOUD','SCALABLE','AGENTIC','FASTAPI','DEVOPS','OPEN TO WORK','NOIDA, IN',
]

function buildBand(items: string[], isTop: boolean): string {
  const sep = isTop
    ? '<span class="ribbon-sep-top">✦</span>'
    : '<span class="ribbon-sep-bottom">+</span>'
  const cls = isTop ? 'ribbon-item-top' : 'ribbon-item-bottom'
  return items
    .map(t => `<span class="${cls}">${t}${sep}</span>`)
    .join('')
    .repeat(2)
}

export default function Ribbon() {
  return (
    <div className="ribbon-wrap" role="presentation" aria-hidden="true">
      <div style={{ width: '100%', overflow: 'hidden' }}>
        <div className="ribbon-track">
          <div className="ribbon-band ribbon-band-top">
            <div
              className="ribbon-scroll-l"
              // Safe: TOP_ITEMS is a static string constant in this file, not user input
              dangerouslySetInnerHTML={{ __html: buildBand(TOP_ITEMS, true) }}
            />
          </div>
          <div className="ribbon-band ribbon-band-bottom">
            <div
              className="ribbon-scroll-r"
              // Safe: BOTTOM_ITEMS is a static string constant in this file, not user input
              dangerouslySetInnerHTML={{ __html: buildBand(BOTTOM_ITEMS, false) }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
