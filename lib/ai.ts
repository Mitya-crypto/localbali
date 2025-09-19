import { getState, monthlySpendRub, totals, positions } from './investments';

export type Recommendation = { title: string; detail?: string; sev: 'low'|'mid'|'high' };

export function getRecommendations(): Recommendation[] {
  const s = getState();
  const spend = monthlySpendRub();
  const { totalRub, cashRub, heldRub, weights } = totals();

  const recs: Recommendation[] = [];

  // 1) Бюджетный контроль
  if (s.goals.monthlyBudgetRub>0) {
    const used = spend / Math.max(1, s.goals.monthlyBudgetRub);
    if (used >= 1.1) {
      recs.push({ sev:'high', title:'Перерасход бюджета', detail:`Траты ${Math.round(used*100)}% от месячного лимита — стоит заморозить новые покупки и пересмотреть расходы.` });
    } else if (used >= 0.8) {
      recs.push({ sev:'mid', title:'Подхожу к лимиту расходов', detail:`Уже израсходовано ${Math.round(used*100)}% месячного бюджета.` });
    } else {
      recs.push({ sev:'low', title:'Бюджет под контролем', detail:`Израсходовано ${Math.round(used*100)}% лимита.` });
    }
  }

  // 2) Концентрация портфеля
  const maxW = weights.reduce((m,w)=>Math.max(m,w.w), 0);
  if (heldRub>0 && maxW >= 0.6) {
    const top = weights.sort((a,b)=>b.w-a.w)[0];
    recs.push({ sev:'mid', title:'Высокая концентрация в портфеле', detail:`Актив ${top.asset} занимает ~${Math.round(maxW*100)}% — подумай о ребалансировке.` });
  }

  // 3) Кэш → DCA
  if (cashRub >= Math.max(2000, totalRub*0.1) && positions().length >= 2) {
    recs.push({ sev:'low', title:'Можно провести DCA-докупку', detail:'Много кэша относительно портфеля — рассмотри равномерную докупку сильных позиций.' });
  }

  // 4) Риск-профиль
  if (s.risk.score >= 70) {
    recs.push({ sev:'mid', title:'Высокий риск-профиль', detail:'Сократи долю волатильных активов и добавь кэш/стабильные инструменты.' });
  } else if (s.risk.score <= 30) {
    recs.push({ sev:'low', title:'Консервативный профиль', detail:'Можно постепенно увеличить риск-активы малыми долями.' });
  }

  // 5) Пустой портфель → стартовые шаги
  if (totalRub===0) {
    recs.push({ sev:'low', title:'Начни с цели и резерва', detail:'Задай месячный бюджет, сформируй кэш-резерв и добавь активы в список наблюдения.' });
  }

  return recs;
}
