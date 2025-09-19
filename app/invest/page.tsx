'use client';

export default function InvestPage(){
  return (
    <div className="vstack" style={{gap:16}}>
      <div className="topbar"><b>Инвестиции</b></div>

      <div className="card vstack" style={{gap:0}}>
        <a href="/invest/ai" className="linkrow">
          <span>ИИ-советы</span><span>›</span>
        </a>
        <a href="/invest/portfolio" className="linkrow">
          <span>Портфель</span><span>›</span>
        </a>
      </div>
    </div>
  );
}
