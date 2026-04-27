import { Chess, type Move } from "chess.js";

// Piece values for a simple evaluation function
const PIECE_VALUES: Record<string, number> = {
  p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000,
};

// Basic positional bonuses (pawn-centric)
const PAWN_TABLE = [
  0,  0,  0,  0,  0,  0,  0,  0,
  50, 50, 50, 50, 50, 50, 50, 50,
  10, 10, 20, 30, 30, 20, 10, 10,
  5,  5, 10, 25, 25, 10,  5,  5,
  0,  0,  0, 20, 20,  0,  0,  0,
  5, -5,-10,  0,  0,-10, -5,  5,
  5, 10, 10,-20,-20, 10, 10,  5,
  0,  0,  0,  0,  0,  0,  0,  0,
];

const KNIGHT_TABLE = [
  -50,-40,-30,-30,-30,-30,-40,-50,
  -40,-20,  0,  0,  0,  0,-20,-40,
  -30,  0, 10, 15, 15, 10,  0,-30,
  -30,  5, 15, 20, 20, 15,  5,-30,
  -30,  0, 15, 20, 20, 15,  0,-30,
  -30,  5, 10, 15, 15, 10,  5,-30,
  -40,-20,  0,  5,  5,  0,-20,-40,
  -50,-40,-30,-30,-30,-30,-40,-50,
];

function squareIndex(square: string, color: "w" | "b"): number {
  const file = square.charCodeAt(0) - 97;
  const rank = parseInt(square[1], 10) - 1;
  // table indexed from white's perspective top-down (rank 8 first)
  const idx = (7 - rank) * 8 + file;
  return color === "w" ? idx : 63 - idx;
}

function evaluateBoard(chess: Chess): number {
  if (chess.isCheckmate()) return chess.turn() === "w" ? -100000 : 100000;
  if (chess.isDraw() || chess.isStalemate()) return 0;

  let score = 0;
  const board = chess.board();
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const piece = board[r][f];
      if (!piece) continue;
      const value = PIECE_VALUES[piece.type];
      const sq = String.fromCharCode(97 + f) + (8 - r);
      let positional = 0;
      if (piece.type === "p") positional = PAWN_TABLE[squareIndex(sq, piece.color)];
      else if (piece.type === "n") positional = KNIGHT_TABLE[squareIndex(sq, piece.color)];
      const total = value + positional;
      score += piece.color === "w" ? total : -total;
    }
  }
  return score;
}

// Negamax with alpha-beta pruning
function search(chess: Chess, depth: number, alpha: number, beta: number, color: 1 | -1): number {
  if (depth === 0 || chess.isGameOver()) {
    return color * evaluateBoard(chess);
  }
  const moves = chess.moves({ verbose: true }) as Move[];
  // simple move ordering: captures first
  moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

  let best = -Infinity;
  for (const move of moves) {
    chess.move(move);
    const score = -search(chess, depth - 1, -beta, -alpha, color === 1 ? -1 : 1);
    chess.undo();
    if (score > best) best = score;
    if (best > alpha) alpha = best;
    if (alpha >= beta) break;
  }
  return best;
}

export type Difficulty = "easy" | "medium" | "hard";

export function getBestMove(fen: string, difficulty: Difficulty): Move | null {
  const chess = new Chess(fen);
  const moves = chess.moves({ verbose: true }) as Move[];
  if (moves.length === 0) return null;

  // Easy: 70% random move, 30% best at depth 1
  if (difficulty === "easy" && Math.random() < 0.7) {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  const depth = difficulty === "easy" ? 1 : difficulty === "medium" ? 2 : 3;
  const color: 1 | -1 = chess.turn() === "w" ? 1 : -1;

  let bestMove: Move = moves[0];
  let bestScore = -Infinity;
  // shuffle to avoid deterministic openings on equal scores
  const shuffled = [...moves].sort(() => Math.random() - 0.5);
  for (const move of shuffled) {
    chess.move(move);
    const score = -search(chess, depth - 1, -Infinity, Infinity, color === 1 ? -1 : 1);
    chess.undo();
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }
  return bestMove;
}
