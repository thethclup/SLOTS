export enum SymbolId {
  WILD = 'WILD',
  SCATTER = 'SCATTER',
  DIAMOND = 'DIAMOND',
  SEVEN = 'SEVEN',
  BELL = 'BELL',
  PLUM = 'PLUM',
  LEMON = 'LEMON',
  CHERRY = 'CHERRY',
}

export const SYMBOLS = {
  [SymbolId.WILD]: { id: SymbolId.WILD, name: 'WILD', value: 100, color: '#f0abfc' },
  [SymbolId.SCATTER]: { id: SymbolId.SCATTER, name: 'SPIN', value: 0, color: '#cbd5e1' },
  [SymbolId.DIAMOND]: { id: SymbolId.DIAMOND, name: '💎', value: 50, color: '#22d3ee' },
  [SymbolId.SEVEN]: { id: SymbolId.SEVEN, name: '7️⃣', value: 20, color: '#f87171' },
  [SymbolId.BELL]: { id: SymbolId.BELL, name: '🔔', value: 15, color: '#facc15' },
  [SymbolId.PLUM]: { id: SymbolId.PLUM, name: '🔮', value: 10, color: '#c084fc' },
  [SymbolId.LEMON]: { id: SymbolId.LEMON, name: '🍋', value: 5, color: '#fde047' },
  [SymbolId.CHERRY]: { id: SymbolId.CHERRY, name: '🍒', value: 2, color: '#fca5a5' },
};

const DEFAULT_REEL_STRIP = [
  SymbolId.CHERRY, SymbolId.LEMON, SymbolId.PLUM, SymbolId.BELL, SymbolId.CHERRY,
  SymbolId.SEVEN, SymbolId.LEMON, SymbolId.CHERRY, SymbolId.DIAMOND, SymbolId.PLUM,
  SymbolId.CHERRY, SymbolId.BELL, SymbolId.WILD, SymbolId.LEMON, SymbolId.CHERRY,
  SymbolId.PLUM, SymbolId.SCATTER, SymbolId.BELL, SymbolId.SEVEN, SymbolId.LEMON
];

export function generateReelFrame(reelsCount: number, rowsCount: number): SymbolId[][] {
  const frame: SymbolId[][] = [];
  for (let r = 0; r < reelsCount; r++) {
    const reelFrame: SymbolId[] = [];
    for (let row = 0; row < rowsCount; row++) {
      const randomIdx = Math.floor(Math.random() * DEFAULT_REEL_STRIP.length);
      reelFrame.push(DEFAULT_REEL_STRIP[randomIdx]);
    }
    frame.push(reelFrame);
  }
  return frame;
}

export function checkWins(frame: SymbolId[][], bet: number, lines: number) {
  let totalWin = 0;
  const winningLines: number[] = [];
  
  // Basic horizontal check for now
  const rowsCount = frame[0].length;
  const reelsCount = frame.length;
  
  for (let row = 0; row < rowsCount; row++) {
    let currentSym = frame[0][row];
    let count = 1;
    let isWildStart = currentSym === SymbolId.WILD;
    
    for (let col = 1; col < reelsCount; col++) {
      const sym = frame[col][row];
      if (sym === currentSym || sym === SymbolId.WILD || (isWildStart && sym !== SymbolId.SCATTER)) {
        count++;
        if (isWildStart && sym !== SymbolId.WILD && sym !== SymbolId.SCATTER) {
          currentSym = sym; // wild resolves to this symbol
          isWildStart = false;
        }
      } else {
        break;
      }
    }
    
    if (count >= 3) {
      const symData = SYMBOLS[currentSym];
      const winVal = symData.value * (count === 5 ? 3 : (count === 4 ? 2 : 1)) * bet;
      if (winVal > 0) {
        totalWin += winVal;
        winningLines.push(row);
      }
    }
  }

  // Scatter check (Scatters pay / trigger regardless of lines)
  let scatterCount = 0;
  frame.forEach(reel => {
    reel.forEach(sym => {
        if(sym === SymbolId.SCATTER) scatterCount++;
    })
  });
  
  const freeSpinsWon = scatterCount >= 3 ? 10 : 0;
  const isJackpot = frame.every(reel => reel.every(sym => sym === SymbolId.DIAMOND || sym === SymbolId.WILD));

  return { totalWin, winningLines, freeSpinsWon, isJackpot };
}
