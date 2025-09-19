if (typeof window==='undefined'){ console.log('Open /investments in browser to seed'); process.exit(0); }
localStorage.setItem('inv.v1.txs', JSON.stringify([
  {id:'a', ts: Date.now()-86400000*10, kind:'income', valueRub: 150000},
  {id:'b', ts: Date.now()-86400000*9,  kind:'buy', asset:'BTC', amount:0.01, valueRub: 80000},
  {id:'c', ts: Date.now()-86400000*5,  kind:'buy', asset:'SOL', amount:10, valueRub: 20000},
  {id:'d', ts: Date.now()-86400000*2,  kind:'expense', valueRub: 15000},
]));
localStorage.setItem('inv.v1.cash', '35000');
localStorage.setItem('inv.v1.goals', JSON.stringify({ monthlyBudgetRub: 50000 }));
localStorage.setItem('inv.v1.risk', JSON.stringify({ score: 55 }));
localStorage.setItem('inv.v1.watch', JSON.stringify([{symbol:'BTC'},{symbol:'ETH'},{symbol:'SOL'}]));
alert('Demo data seeded. Refresh the page.');
