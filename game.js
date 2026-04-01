'use strict';

// ── Symbole i opisy figur ──────────────────────────────────────────────────
const SYM = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};
const NAMES = { K:'Król', Q:'Hetman', R:'Wieża', B:'Goniec', N:'Skoczek', P:'Pionek' };

// ── Wartości figur (do AI) ──────────────────────────────────────────────────
const VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// ── Tablice pozycyjne (Piece-Square Tables) — z perspektywy białych ────────
const PST = {
    p:[  0,  0,  0,  0,  0,  0,  0,  0,
        50, 50, 50, 50, 50, 50, 50, 50,
        10, 10, 20, 30, 30, 20, 10, 10,
         5,  5, 10, 25, 25, 10,  5,  5,
         0,  0,  0, 20, 20,  0,  0,  0,
         5, -5,-10,  0,  0,-10, -5,  5,
         5, 10, 10,-20,-20, 10, 10,  5,
         0,  0,  0,  0,  0,  0,  0,  0],
    n:[-50,-40,-30,-30,-30,-30,-40,-50,
       -40,-20,  0,  0,  0,  0,-20,-40,
       -30,  0, 10, 15, 15, 10,  0,-30,
       -30,  5, 15, 20, 20, 15,  5,-30,
       -30,  0, 15, 20, 20, 15,  0,-30,
       -30,  5, 10, 15, 15, 10,  5,-30,
       -40,-20,  0,  5,  5,  0,-20,-40,
       -50,-40,-30,-30,-30,-30,-40,-50],
    b:[-20,-10,-10,-10,-10,-10,-10,-20,
       -10,  0,  0,  0,  0,  0,  0,-10,
       -10,  0,  5, 10, 10,  5,  0,-10,
       -10,  5,  5, 10, 10,  5,  5,-10,
       -10,  0, 10, 10, 10, 10,  0,-10,
       -10, 10, 10, 10, 10, 10, 10,-10,
       -10,  5,  0,  0,  0,  0,  5,-10,
       -20,-10,-10,-10,-10,-10,-10,-20],
    r:[  0,  0,  0,  0,  0,  0,  0,  0,
         5, 10, 10, 10, 10, 10, 10,  5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
        -5,  0,  0,  0,  0,  0,  0, -5,
         0,  0,  0,  5,  5,  0,  0,  0],
    q:[-20,-10,-10, -5, -5,-10,-10,-20,
       -10,  0,  0,  0,  0,  0,  0,-10,
       -10,  0,  5,  5,  5,  5,  0,-10,
        -5,  0,  5,  5,  5,  5,  0, -5,
         0,  0,  5,  5,  5,  5,  0, -5,
       -10,  5,  5,  5,  5,  5,  0,-10,
       -10,  0,  5,  0,  0,  0,  0,-10,
       -20,-10,-10, -5, -5,-10,-10,-20],
    k:[-30,-40,-40,-50,-50,-40,-40,-30,
       -30,-40,-40,-50,-50,-40,-40,-30,
       -30,-40,-40,-50,-50,-40,-40,-30,
       -30,-40,-40,-50,-50,-40,-40,-30,
       -20,-30,-30,-40,-40,-30,-30,-20,
       -10,-20,-20,-20,-20,-20,-20,-10,
        20, 20,  0,  0,  0,  0, 20, 20,
        20, 30, 10,  0,  0, 10, 30, 20]
};

const TIPS = [
    '♟ Kontroluj centrum planszy pionkami e4 i d4.',
    '♞ Rozwijaj skoczki i gońce zanim ruszysz wieże lub hetmana.',
    '♔ Zrób rochade jak najszybciej, aby schować króla.',
    '♛ Nie wyciągaj hetmana zbyt wcześnie — zostanie zaatakowany.',
    '♖ Połącz wieże — postaw je na tej samej linii lub rzędzie.',
    '♝ Para gońców jest bardzo silna w otwartych pozycjach.',
    '⚔️ Przed atakiem upewnij się, że Twój król jest bezpieczny.',
    '🔄 Skoczek porusza się w kształcie litery L i może przeskakiwać figury.',
    '📖 Naucz się kilku prostych debiutów (np. e4 e5, d4 d5).',
    '🏆 Jeśli masz przewagę materiałową — wymieniaj figury!',
    '👀 Zawsze sprawdź, czy Twój ruch nie zostawia figury bez ochrony.',
    '🎯 Pionek, który dotrze do ostatniego rzędu, staje się hetmanem.'
];

// ── Stan gry ───────────────────────────────────────────────────────────────
let chess;
let selected      = null;   // zaznaczone pole
let legalTargets  = [];     // pola legalnych ruchów
let hintSquares   = [];     // podpowiedź
let lastMove      = null;   // { from, to }
let captured      = { w:[], b:[] };
let isThinking    = false;
let pendingPromo  = null;   // { from, to }
let tipIndex      = 0;
let tipTimer      = null;

// ── Inicjalizacja ──────────────────────────────────────────────────────────
function init() {
    chess        = new Chess();
    selected     = null;
    legalTargets = [];
    hintSquares  = [];
    lastMove     = null;
    captured     = { w:[], b:[] };
    isThinking   = false;
    pendingPromo = null;

    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();
    startTips();
}

// ── Renderowanie planszy ───────────────────────────────────────────────────
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    const board    = chess.board();
    const inCheck  = chess.in_check();
    const kingPos  = inCheck ? findKing(chess.turn()) : null;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq      = colRow(col, row);
            const isLight = (row + col) % 2 === 0;
            const piece   = board[row][col];

            const div = document.createElement('div');
            div.className = 'square ' + (isLight ? 'light' : 'dark');
            div.dataset.sq = sq;

            // Podświetlenia
            if (sq === selected)                               div.classList.add('selected');
            if (lastMove && (sq === lastMove.from || sq === lastMove.to))
                                                               div.classList.add('last-move');
            if (inCheck && sq === kingPos)                     div.classList.add('in-check');
            if (hintSquares.includes(sq))                      div.classList.add('hint');

            if (legalTargets.includes(sq)) {
                div.classList.add(piece ? 'legal-capture' : 'legal-move');
            }

            // Figura
            if (piece) {
                const span = document.createElement('span');
                span.className = 'piece';
                span.textContent = SYM[piece.color + piece.type.toUpperCase()];
                span.title = NAMES[piece.type.toUpperCase()];
                div.appendChild(span);
            }

            // Współrzędne
            if (col === 0) {
                const r = document.createElement('span');
                r.className = 'coord rank';
                r.textContent = 8 - row;
                div.appendChild(r);
            }
            if (row === 7) {
                const f = document.createElement('span');
                f.className = 'coord file';
                f.textContent = String.fromCharCode(97 + col);
                div.appendChild(f);
            }

            div.addEventListener('click', () => onSquareClick(sq));
            boardEl.appendChild(div);
        }
    }
}

function colRow(col, row) {
    return String.fromCharCode(97 + col) + (8 - row);
}

function findKing(color) {
    const board = chess.board();
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (p && p.type === 'k' && p.color === color)
                return colRow(c, r);
        }
    return null;
}

// ── Kliknięcie w pole ──────────────────────────────────────────────────────
function onSquareClick(sq) {
    if (isThinking || chess.game_over()) return;
    if (chess.turn() !== 'w') return;  // gracz gra białymi

    hintSquares = [];
    const piece = chess.get(sq);

    if (selected) {
        if (legalTargets.includes(sq)) {
            attemptMove(selected, sq);
        } else if (piece && piece.color === 'w') {
            selectSquare(sq);
        } else {
            selected     = null;
            legalTargets = [];
            renderBoard();
        }
    } else {
        if (piece && piece.color === 'w') {
            selectSquare(sq);
        }
    }
}

function selectSquare(sq) {
    selected     = sq;
    legalTargets = chess.moves({ square: sq, verbose: true }).map(m => m.to);
    renderBoard();
}

// ── Wykonanie ruchu ────────────────────────────────────────────────────────
function attemptMove(from, to) {
    const piece = chess.get(from);
    // Sprawdź promocję pionka
    if (piece.type === 'p' && (to[1] === '8' || to[1] === '1')) {
        pendingPromo = { from, to };
        document.getElementById('promo-modal').classList.remove('hidden');
        return;
    }
    executeMove(from, to, null);
}

function executeMove(from, to, promo) {
    const moveObj = promo
        ? chess.move({ from, to, promotion: promo })
        : chess.move({ from, to });

    if (!moveObj) return;

    if (moveObj.captured) {
        const side = moveObj.color === 'w' ? 'b' : 'w';
        captured[side].push(moveObj.captured);
    }

    lastMove     = { from, to };
    selected     = null;
    legalTargets = [];

    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();

    if (!chess.game_over() && chess.turn() === 'b') {
        isThinking = true;
        updateStatus();
        setTimeout(runAI, 250);
    }
}

// ── AI (minimax + alpha-beta) ──────────────────────────────────────────────
function runAI() {
    const depth = parseInt(document.getElementById('difficulty').value, 10);
    const move  = bestMove(depth);
    if (move) {
        chess.move(move);
        if (move.captured) {
            const side = move.color === 'w' ? 'b' : 'w';
            captured[side].push(move.captured);
        }
        lastMove = { from: move.from, to: move.to };
    }
    isThinking = false;
    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();
}

function bestMove(depth) {
    const moves = chess.moves({ verbose: true });
    if (!moves.length) return null;

    // Losowe przetasowanie (różnorodność na tym samym poziomie oceny)
    moves.sort(() => Math.random() - 0.5);

    let best  = null;
    let bestS = Infinity;  // AI = czarne = minimalizuje

    for (const m of moves) {
        chess.move(m);
        const s = minimax(depth - 1, -Infinity, Infinity, true);
        chess.undo();
        if (s < bestS) { bestS = s; best = m; }
    }
    return best;
}

function minimax(depth, alpha, beta, maximizing) {
    if (depth === 0 || chess.game_over()) return evaluate();

    const moves = chess.moves({ verbose: true });
    if (maximizing) {
        let v = -Infinity;
        for (const m of moves) {
            chess.move(m);
            v = Math.max(v, minimax(depth - 1, alpha, beta, false));
            chess.undo();
            alpha = Math.max(alpha, v);
            if (beta <= alpha) break;
        }
        return v;
    } else {
        let v = Infinity;
        for (const m of moves) {
            chess.move(m);
            v = Math.min(v, minimax(depth - 1, alpha, beta, true));
            chess.undo();
            beta = Math.min(beta, v);
            if (beta <= alpha) break;
        }
        return v;
    }
}

function evaluate() {
    if (chess.in_checkmate()) return chess.turn() === 'w' ? -99999 : 99999;
    if (chess.in_stalemate() || chess.in_draw()) return 0;

    let score = 0;
    const board = chess.board();
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const pstIdx = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
            const s = VAL[p.type] + PST[p.type][pstIdx];
            score += p.color === 'w' ? s : -s;
        }
    }
    return score;
}

// ── Podpowiedź ─────────────────────────────────────────────────────────────
function showHint() {
    if (isThinking || chess.turn() !== 'w') return;
    const m = bestMove(2);
    if (!m) return;
    hintSquares = [m.from, m.to];
    renderBoard();
    setTimeout(() => { hintSquares = []; renderBoard(); }, 2000);
}

// ── Cofnij ruch ────────────────────────────────────────────────────────────
function undoMove() {
    if (isThinking) return;
    chess.undo();  // cofnij ruch AI
    chess.undo();  // cofnij ruch gracza
    recalcCaptured();
    lastMove     = null;
    selected     = null;
    legalTargets = [];
    hintSquares  = [];
    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();
}

function recalcCaptured() {
    captured = { w:[], b:[] };
    for (const m of chess.history({ verbose: true })) {
        if (m.captured) {
            const side = m.color === 'w' ? 'b' : 'w';
            captured[side].push(m.captured);
        }
    }
}

// ── Aktualizacje UI ────────────────────────────────────────────────────────
function updateStatus() {
    const el = document.getElementById('status');
    el.className = 'status-box';

    if (chess.in_checkmate()) {
        const w = chess.turn() === 'w' ? 'Czarne' : 'Białe';
        el.textContent = `Mat! ${w} wygrały! 🏆`;
        el.classList.add('checkmate');
    } else if (chess.in_stalemate()) {
        el.textContent = 'Pat! Remis! 🤝';
        el.classList.add('draw');
    } else if (chess.in_draw()) {
        el.textContent = 'Remis! 🤝';
        el.classList.add('draw');
    } else if (isThinking) {
        el.textContent = 'AI myśli… 🤔';
        el.classList.add('thinking');
    } else if (chess.in_check()) {
        const w = chess.turn() === 'w' ? 'Ty (białe)' : 'AI (czarne)';
        el.textContent = `Szach! Musi ruszać: ${w} ⚠️`;
        el.classList.add('check');
    } else {
        el.textContent = chess.turn() === 'w' ? 'Twoja kolej (Białe)' : 'Kolej AI (Czarne)';
    }
}

function updateHistory() {
    const el   = document.getElementById('move-history');
    const hist = chess.history();
    let html = '<table>';
    for (let i = 0; i < hist.length; i += 2) {
        html += `<tr>
            <td class="move-num">${Math.floor(i / 2) + 1}.</td>
            <td>${hist[i]}</td>
            <td>${hist[i + 1] || ''}</td>
        </tr>`;
    }
    html += '</table>';
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
}

function updateCaptured() {
    const capSym = { p:'♟', n:'♞', b:'♝', r:'♜', q:'♛' };
    const whiSym = { p:'♙', n:'♘', b:'♗', r:'♖', q:'♕' };

    document.getElementById('captured-by-white').innerHTML =
        `<span class="cap-label">Zdobyte przez Ciebie:</span>` +
        captured.b.map(t => capSym[t] || '').join(' ');

    document.getElementById('captured-by-black').innerHTML =
        `<span class="cap-label">Zdobyte przez AI:</span>` +
        captured.w.map(t => whiSym[t] || '').join(' ');
}

// ── Wskazówki (rotujące co 6 s) ───────────────────────────────────────────
function startTips() {
    clearTimeout(tipTimer);
    tipIndex = 0;
    showTip();
}

function showTip() {
    document.getElementById('tip-text').textContent = TIPS[tipIndex % TIPS.length];
    tipIndex++;
    tipTimer = setTimeout(showTip, 6000);
}

// ── Promocja pionka ────────────────────────────────────────────────────────
document.querySelectorAll('.promo-choices button').forEach(btn => {
    btn.addEventListener('click', () => {
        document.getElementById('promo-modal').classList.add('hidden');
        if (pendingPromo) {
            const { from, to } = pendingPromo;
            pendingPromo = null;
            executeMove(from, to, btn.dataset.piece);
        }
    });
});

// ── Przyciski ──────────────────────────────────────────────────────────────
document.getElementById('btn-new').addEventListener('click', init);
document.getElementById('btn-undo').addEventListener('click', undoMove);
document.getElementById('btn-hint').addEventListener('click', showHint);

// ── Start ──────────────────────────────────────────────────────────────────
init();
