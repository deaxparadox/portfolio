'use client'
import { NKMAction } from './types'

interface Props { open: boolean; dispatch: React.Dispatch<NKMAction> }

export function NKMPowerMenu({ open, dispatch }: Props) {
  const close = () => dispatch({ type: 'CLOSE_POWER' })

  return (
    <div
      className={`nkm-power-menu ${open ? 'open' : ''}`}
      onClick={e => { if (e.target === e.currentTarget) close() }}
    >
      <div className="nkm-pm-sheet">
        <div className="nkm-pm-title">Power Options</div>
        <div className="nkm-pm-btns">
          <div className="nkm-pm-btn danger" onClick={() => dispatch({ type: 'SHUTDOWN' })}>
            <div className="nkm-pm-btn-ico">⏻</div>
            <div className="nkm-pm-btn-lbl">Shut Down</div>
          </div>
          <div className="nkm-pm-btn" onClick={() => dispatch({ type: 'REBOOT' })}>
            <div className="nkm-pm-btn-ico">🔄</div>
            <div className="nkm-pm-btn-lbl">Restart</div>
          </div>
          <div className="nkm-pm-btn" onClick={() => { dispatch({ type: 'LOCK' }); close() }}>
            <div className="nkm-pm-btn-ico">🔒</div>
            <div className="nkm-pm-btn-lbl">Lock</div>
          </div>
        </div>
        <div className="nkm-pm-cancel" onClick={close}>Cancel</div>
      </div>
    </div>
  )
}
