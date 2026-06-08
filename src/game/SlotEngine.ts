export enum SymbolId {
  WILD = 'WILD',
  SCATTER = 'SCATTER',
  POLAR_BEAR = 'POLAR_BEAR',
  REINDEER = 'REINDEER',
  SNOWFLAKE = 'SNOWFLAKE',
  FROZEN_SEVEN = 'FROZEN_SEVEN',
  GOLDEN_BELL = 'GOLDEN_BELL',
  MUG = 'MUG',
}

export const SYMBOLS = {
  [SymbolId.WILD]: { id: SymbolId.WILD, name: 'AURORA WILD', value: 100, color: '#a7f3d0' },
  [SymbolId.SCATTER]: { id: SymbolId.SCATTER, name: '🎁', value: 0, color: '#fca5a5' },
  [SymbolId.POLAR_BEAR]: { id: SymbolId.POLAR_BEAR, name: '🐻‍❄️', value: 50, color: '#e0f2fe' },
  [SymbolId.REINDEER]: { id: SymbolId.REINDEER, name: '🦌', value: 30, color: '#fed7aa' },
  [SymbolId.FROZEN_SEVEN]: { id: SymbolId.FROZEN_SEVEN, name: '7️⃣', value: 20, color: '#bae6fd' },
  [SymbolId.GOLDEN_BELL]: { id: SymbolId.GOLDEN_BELL, name: '🔔', value: 15, color: '#fef08a' },
  [SymbolId.SNOWFLAKE]: { id: SymbolId.SNOWFLAKE, name: '❄️', value: 10, color: '#7dd3fc' },
  [SymbolId.MUG]: { id: SymbolId.MUG, name: '☕', value: 5, color: '#fecaca' },
};

const DEFAULT_REEL_STRIP = [
  SymbolId.MUG, SymbolId.SNOWFLAKE, SymbolId.GOLDEN_BELL, SymbolId.FROZEN_SEVEN, SymbolId.MUG,
  SymbolId.REINDEER, SymbolId.SNOWFLAKE, SymbolId.MUG, SymbolId.POLAR_BEAR, SymbolId.GOLDEN_BELL,
  SymbolId.MUG, SymbolId.FROZEN_SEVEN, SymbolId.WILD, SymbolId.SNOWFLAKE, SymbolId.MUG,
  SymbolId.GOLDEN_BELL, SymbolId.SCATTER, SymbolId.FROZEN_SEVEN, SymbolId.REINDEER, SymbolId.SNOWFLAKE
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
  const isJackpot = frame.every(reel => reel.every(sym => sym === SymbolId.POLAR_BEAR || sym === SymbolId.WILD));

  return { totalWin, winningLines, freeSpinsWon, isJackpot };
}
