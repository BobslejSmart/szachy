'use strict';

// ── Symbole i nazwy figur ──────────────────────────────────────────────────
const SYM = {
    wK:'♔', wQ:'♕', wR:'♖', wB:'♗', wN:'♘', wP:'♙',
    bK:'♚', bQ:'♛', bR:'♜', bB:'♝', bN:'♞', bP:'♟'
};
const NAMES = { K:'Król', Q:'Hetman', R:'Wieża', B:'Goniec', N:'Skoczek', P:'Pionek' };

// ── Wartości figur ─────────────────────────────────────────────────────────
const VAL = { p:100, n:320, b:330, r:500, q:900, k:20000 };

// ── Tablice pozycyjne (PST) ────────────────────────────────────────────────
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

// ── Wskazówki (dłuższe, z tytułem) ────────────────────────────────────────
const TIPS = [
    {
        icon: '🎯', title: 'Kontroluj centrum',
        text: 'Centrum planszy (pola e4, d4, e5, d5) to serce szachów — figury tam ustawione kontrolują więcej pól i mają więcej możliwości niż figury na skraju. Zacznij grę ruchem e2→e4 lub d2→d4, żeby od razu zająć centrum i dać gońcowi wolną drogę.'
    },
    {
        icon: '♞', title: 'Rozwijaj figury szybko',
        text: 'W debiucie ruszaj każdą figurę tylko raz i rozwijaj skoczki oraz gońce przed 10. ruchem. Nie trać tempa na wielokrotne ruszanie tą samą figurą — każdy ruch powinien przybliżać Cię do roszady i aktywacji wież.'
    },
    {
        icon: '♔', title: 'Roszada — schowaj króla',
        text: 'Roszada to specjalny ruch: król przesuwa się o 2 pola w stronę wieży, a wieża skacze na pole po drugiej stronie króla. Dzięki temu król chowa się za pionkami, a wieża wchodzi do gry. Zrób roszadę jak najszybciej — król w centrum jest łatwym celem ataku.'
    },
    {
        icon: '♛', title: 'Nie wyciągaj hetmana za wcześnie',
        text: 'Hetman to najpotężniejsza figura, ale jeśli wyjdzie w debiucie, przeciwnik będzie ją atakować pionkami i skoczkami — tracisz czas na ucieczkę zamiast rozwijać pozostałe figury. Poczekaj aż rozwiniesz skoczki, gońce i zroszujesz — dopiero wtedy użyj hetmana aktywnie.'
    },
    {
        icon: '♖', title: 'Aktywuj wieże na otwartych liniach',
        text: 'Wieże są potężne, ale tylko gdy mają wolną drogę — linie bez pionków nazywamy otwartymi. Po roszadzie postaw wieże na takich liniach. Podwojone wieże (obie na tej samej linii) tworzą ogromną presję i bardzo trudno je powstrzymać.'
    },
    {
        icon: '♝', title: 'Para gońców to wielka siła',
        text: 'Posiadanie obu gońców (jasno- i ciemnopolowego) jest bardzo silne — razem kontrolują pola obu kolorów. W otwartych pozycjach ich wartość rośnie znacznie. Uważaj, żeby własne pionki nie blokowały gońca — powinny stać na innym kolorze niż Twój goniec.'
    },
    {
        icon: '⚔️', title: 'Bezpieczeństwo króla przed atakiem',
        text: 'Zanim zaatakujesz, sprawdź czy Twój król jest bezpieczny — najlepiej za pionkami po roszadzie. Atakując z odsłoniętym królem ryzykujesz, że przeciwnik odpowie kontratakiem i będzie szybszy. Zasada: najpierw zadbaj o bezpieczeństwo, potem atakuj.'
    },
    {
        icon: '🔄', title: 'Skoczek — wyjątkowa figura',
        text: 'Skoczek porusza się w kształcie litery L: dwa pola w jednym kierunku i jedno prostopadłe. Jako jedyna figura może przeskakiwać inne — to czyni go nieocenionym w zamkniętych pozycjach. Skoczek jest najsilniejszy w centrum, a najsłabszy w rogach planszy, gdzie ma tylko 2 możliwe ruchy.'
    },
    {
        icon: '💡', title: 'Twórz plany, nie tylko reaguj',
        text: 'Zamiast reagować na każdy ruch przeciwnika, wyznacz sobie cel: zaatakuję skrzydło królewskie, wymienię gońce, otworzę linię dla wież. Mając plan łatwiej wybierasz kolejne ruchy. Szukaj słabości w pozycji przeciwnika — np. słabych pionków, odsłoniętego króla — i atakuj je systematycznie.'
    },
    {
        icon: '🏆', title: 'Masz przewagę? Wymieniaj figury!',
        text: 'Jeśli masz więcej materiału (np. wieżę za skoczka), upraszczaj pozycję wymieniając figury — im mniej figur na planszy, tym większa Twoja względna przewaga. Unikaj skomplikowanych kombinacji gdy możesz wygrać spokojnie. Zasada: przy przewadze wymieniaj figury, nie pionki.'
    },
    {
        icon: '👀', title: 'Sprawdzaj każdy ruch przed wykonaniem',
        text: 'Przed każdym ruchem zadaj sobie 3 pytania: Czy zostawiam figurę bez ochrony? Czy mój ruch osłabia króla? Czy przeciwnik może odpowiedzieć groźnym atakiem? Nawet 10 sekund refleksji eliminuje większość błędów popełnianych przez początkujących.'
    },
    {
        icon: '🎖️', title: 'Promocja pionka — wielka nagroda',
        text: 'Pionek który dotrze do ostatniego rzędu (rząd 8 dla białych) może zmienić się w dowolną figurę — prawie zawsze wybieramy hetmana. Pionek przechodni (bez przeciwnych pionków na jego drodze) jest ogromnym atutem w końcówce. Prowadź go do przodu — przeciwnik musi go zatrzymać za wszelką cenę.'
    }
];

// ── Stan gry ───────────────────────────────────────────────────────────────
let chess;
let selected          = null;
let legalTargets      = [];
let hintSquares       = [];
let lastMove          = null;
let captured          = { w:[], b:[] };
let isThinking        = false;
let pendingPromo      = null;
let tipIndex          = 0;
let tipTimer          = null;
let commentaryEnabled = true;
let commentaryHistory = [];

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

    // Zwiń panele — rozwiną się po pierwszym ruchu
    document.getElementById('card-captured').classList.remove('expanded');
    document.getElementById('card-history').classList.remove('expanded');

    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();
    startTips();
}

function expandPanels() {
    document.getElementById('card-captured').classList.add('expanded');
    document.getElementById('card-history').classList.add('expanded');
}

// ── Renderowanie planszy ───────────────────────────────────────────────────
function renderBoard() {
    const boardEl = document.getElementById('board');
    boardEl.innerHTML = '';

    const board   = chess.board();
    const inCheck = chess.in_check();
    const kingPos = inCheck ? findKing(chess.turn()) : null;

    for (let row = 0; row < 8; row++) {
        for (let col = 0; col < 8; col++) {
            const sq      = colRow(col, row);
            const isLight = (row + col) % 2 === 0;
            const piece   = board[row][col];

            const div = document.createElement('div');
            div.className = 'square ' + (isLight ? 'light' : 'dark');

            if (sq === selected)                                         div.classList.add('selected');
            if (lastMove && (sq === lastMove.from || sq === lastMove.to)) div.classList.add('last-move');
            if (inCheck && sq === kingPos)                               div.classList.add('in-check');
            if (hintSquares.includes(sq))                                div.classList.add('hint');
            if (legalTargets.includes(sq))
                div.classList.add(piece ? 'legal-capture' : 'legal-move');

            if (piece) {
                const span = document.createElement('span');
                span.className = 'piece';
                if (lastMove && sq === lastMove.to) span.classList.add('just-landed');
                span.textContent = SYM[piece.color + piece.type.toUpperCase()];
                span.title = NAMES[piece.type.toUpperCase()];
                div.appendChild(span);
            }

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

            div.dataset.sq = sq;
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
            if (p && p.type === 'k' && p.color === color) return colRow(c, r);
        }
    return null;
}

// ── Kliknięcie w pole ──────────────────────────────────────────────────────
function onSquareClick(sq) {
    if (isThinking || chess.game_over()) return;
    if (chess.turn() !== 'w') return;

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
        if (piece && piece.color === 'w') selectSquare(sq);
    }
}

function selectSquare(sq) {
    selected     = sq;
    legalTargets = chess.moves({ square: sq, verbose: true }).map(m => m.to);
    renderBoard();
}

// ── Animacja ruchu figury ──────────────────────────────────────────────────
function animatePieceMove(from, to, callback) {
    const boardEl = document.getElementById('board');
    const fromEl  = boardEl.querySelector(`[data-sq="${from}"]`);
    const toEl    = boardEl.querySelector(`[data-sq="${to}"]`);
    if (!fromEl || !toEl) { callback(); return; }

    const pieceEl = fromEl.querySelector('.piece');
    if (!pieceEl) { callback(); return; }

    const fr = fromEl.getBoundingClientRect();
    const tr = toEl.getBoundingClientRect();

    const clone = pieceEl.cloneNode(true);
    clone.classList.remove('just-landed');
    Object.assign(clone.style, {
        position:       'fixed',
        left:           fr.left + 'px',
        top:            fr.top  + 'px',
        width:          fr.width  + 'px',
        height:         fr.height + 'px',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        zIndex:         '9999',
        pointerEvents:  'none',
        margin:         '0',
        transition:     'left 0.18s cubic-bezier(0.4,0,0.2,1), top 0.18s cubic-bezier(0.4,0,0.2,1)',
    });

    document.body.appendChild(clone);
    pieceEl.style.opacity = '0';

    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            clone.style.left = tr.left + 'px';
            clone.style.top  = tr.top  + 'px';
        });
    });

    setTimeout(() => { clone.remove(); callback(); }, 200);
}

// ── Wykonanie ruchu ────────────────────────────────────────────────────────
function attemptMove(from, to) {
    const piece = chess.get(from);
    if (piece.type === 'p' && (to[1] === '8' || to[1] === '1')) {
        pendingPromo = { from, to };
        document.getElementById('promo-modal').classList.remove('hidden');
        return;
    }
    executeMove(from, to, null);
}

function executeMove(from, to, promo) {
    const moveObj = chess.move(promo ? { from, to, promotion: promo } : { from, to });
    if (!moveObj) return;

    if (moveObj.captured) {
        captured[moveObj.color === 'w' ? 'b' : 'w'].push(moveObj.captured);
    }

    lastMove     = { from: moveObj.from, to: moveObj.to };
    selected     = null;
    legalTargets = [];

    expandPanels();

    animatePieceMove(from, to, () => {
        renderBoard();
        updateStatus();
        updateHistory();
        updateCaptured();
        autoComment(moveObj);

        if (!chess.game_over() && chess.turn() === 'b') {
            isThinking = true;
            updateStatus();
            setTimeout(runAI, 250);
        }
    });
}

// ── AI (minimax + alpha-beta) ──────────────────────────────────────────────
function runAI() {
    const depth = parseInt(document.getElementById('difficulty').value, 10);
    const move  = bestMove(depth);
    if (move) {
        const result = chess.move(move);
        if (result && result.captured) {
            captured[result.color === 'w' ? 'b' : 'w'].push(result.captured);
        }
        lastMove = { from: move.from, to: move.to };
        animatePieceMove(move.from, move.to, () => {
            isThinking = false;
            renderBoard();
            updateStatus();
            updateHistory();
            updateCaptured();
            autoComment(result);
        });
    } else {
        isThinking = false;
        renderBoard();
        updateStatus();
        updateHistory();
        updateCaptured();
    }
}

function bestMove(depth) {
    const moves = chess.moves({ verbose: true });
    if (!moves.length) return null;

    moves.sort(() => Math.random() - 0.5);

    let best  = null;
    let bestS = Infinity;

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
    for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++) {
            const p = board[r][c];
            if (!p) continue;
            const idx = p.color === 'w' ? r * 8 + c : (7 - r) * 8 + c;
            const s = VAL[p.type] + PST[p.type][idx];
            score += p.color === 'w' ? s : -s;
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
    if (!chess.history().length) return;

    chess.undo(); // cofnij ostatni ruch (AI lub gracza)
    // jeśli teraz jest kolej czarnych, cofnij też ruch gracza
    if (chess.turn() !== 'w' && chess.history().length > 0) chess.undo();

    recalcCaptured();

    const hist = chess.history({ verbose: true });
    lastMove = hist.length
        ? { from: hist[hist.length - 1].from, to: hist[hist.length - 1].to }
        : null;

    selected     = null;
    legalTargets = [];
    hintSquares  = [];

    // Zwiń panele z powrotem jeśli cofnęliśmy do początku
    if (!chess.history().length) {
        document.getElementById('card-captured').classList.remove('expanded');
        document.getElementById('card-history').classList.remove('expanded');
    }

    renderBoard();
    updateStatus();
    updateHistory();
    updateCaptured();
}

function recalcCaptured() {
    captured = { w:[], b:[] };
    for (const m of chess.history({ verbose: true })) {
        if (m.captured) captured[m.color === 'w' ? 'b' : 'w'].push(m.captured);
    }
}

// ── Aktualizacje UI ────────────────────────────────────────────────────────
function updateStatus() {
    const el = document.getElementById('status');
    el.className = 'status-box';

    if (chess.in_checkmate()) {
        el.textContent = (chess.turn() === 'w' ? 'Czarne' : 'Białe') + ' wygrały! Mat! 🏆';
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
        el.textContent = (chess.turn() === 'w' ? 'Szach! Twój król jest atakowany ⚠️' : 'Szach! Król AI jest atakowany ⚠️');
        el.classList.add('check');
    } else {
        el.textContent = chess.turn() === 'w' ? 'Twoja kolej (Białe)' : 'Kolej AI (Czarne)';
    }
}

function updateHistory() {
    const el   = document.getElementById('move-history');
    const hist = chess.history();
    if (!hist.length) { el.innerHTML = ''; return; }
    let html = '<table>';
    for (let i = 0; i < hist.length; i += 2) {
        html += `<tr><td class="move-num">${Math.floor(i / 2) + 1}.</td><td>${hist[i]}</td><td>${hist[i + 1] || ''}</td></tr>`;
    }
    html += '</table>';
    el.innerHTML = html;
    el.scrollTop = el.scrollHeight;
}

function updateCaptured() {
    const bSym = { p:'♟', n:'♞', b:'♝', r:'♜', q:'♛' };
    const wSym = { p:'♙', n:'♘', b:'♗', r:'♖', q:'♕' };

    document.getElementById('captured-by-white').innerHTML =
        '<span class="cap-label">Zdobyte przez Ciebie:</span> ' +
        (captured.b.map(t => bSym[t] || '').join(' ') || '—');

    document.getElementById('captured-by-black').innerHTML =
        '<span class="cap-label">Zdobyte przez AI:</span> ' +
        (captured.w.map(t => wSym[t] || '').join(' ') || '—');
}

// ── Wskazówki ──────────────────────────────────────────────────────────────
function startTips() {
    clearTimeout(tipTimer);
    tipIndex = 0;
    showTip();
}

function showTip() {
    clearTimeout(tipTimer);
    const i   = ((tipIndex % TIPS.length) + TIPS.length) % TIPS.length;
    const tip = TIPS[i];
    document.getElementById('tip-icon').textContent    = tip.icon;
    document.getElementById('tip-title').textContent   = tip.title;
    document.getElementById('tip-body').textContent    = tip.text;
    document.getElementById('tip-counter').textContent = `${i + 1}/${TIPS.length}`;
    tipTimer = setTimeout(() => { tipIndex++; showTip(); }, 9000);
}

document.getElementById('tip-next').addEventListener('click', () => {
    tipIndex++;
    showTip();
});
document.getElementById('tip-prev').addEventListener('click', () => {
    tipIndex--;
    showTip();
});

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
document.getElementById('btn-new').addEventListener('click', () => {
    commentaryHistory = [];
    init();
});
document.getElementById('btn-undo').addEventListener('click', undoMove);
document.getElementById('btn-hint').addEventListener('click', showHint);

document.getElementById('commentary-toggle').addEventListener('change', e => {
    commentaryEnabled = e.target.checked;
});

// ── Automatyczny komentarz AI ──────────────────────────────────────────────
async function autoComment(move) {
    if (!commentaryEnabled) return;

    const pieceName  = NAMES[move.piece.toUpperCase()] || move.piece;
    const isWhite    = move.color === 'w';
    const captureStr = move.captured ? `, bijąc ${NAMES[move.captured.toUpperCase()] || move.captured}` : '';
    const san        = move.san || `${move.from}→${move.to}`;
    const who        = isWhite ? 'Gracz zagrał' : 'AI zagrało';
    const msg        = `${who} ${pieceName} ${san}${captureStr}. Skomentuj ten ruch jednym krótkim zdaniem po polsku — dla początkującego gracza.`;

    const thinkingEl = appendMsg('assistant', '📝 …', 'thinking');

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                fen:         chess.fen(),
                turn:        chess.turn(),
                moveHistory: chess.history().join(' ') || null,
                history:     commentaryHistory
            })
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        thinkingEl.remove();
        commentaryHistory = data.history || commentaryHistory;
        if (data.text) appendMsg('assistant', '📝 ' + mdToHtml(data.text), 'commentary');
    } catch {
        thinkingEl.remove();
    }
}

// ── Chat z AI ─────────────────────────────────────────────────────────────
let chatHistory = [];

function appendMsg(role, text, extra = '') {
    const wrap = document.getElementById('chat-messages');
    const div  = document.createElement('div');
    div.className = `chat-msg ${role}${extra ? ' ' + extra : ''}`;
    const bubble = document.createElement('span');
    bubble.className = 'msg-bubble';
    bubble.innerHTML = text;
    div.appendChild(bubble);
    wrap.appendChild(div);
    wrap.scrollTop = wrap.scrollHeight;
    return div;
}

async function sendChat() {
    const input = document.getElementById('chat-input');
    const btn   = document.getElementById('chat-send');
    const msg   = input.value.trim();
    if (!msg) return;

    input.value = '';
    btn.disabled = true;

    appendMsg('user', escapeHtml(msg));

    const thinking = appendMsg('assistant', 'Myślę…', 'thinking');

    try {
        const res = await fetch('/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: msg,
                fen: chess.fen(),
                turn: chess.turn(),
                moveHistory: chess.history().join(' ') || null,
                history: chatHistory
            })
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        thinking.remove();
        chatHistory = data.history || chatHistory;

        if (data.text) {
            appendMsg('assistant', mdToHtml(data.text));
        }

        if (data.move && chess.turn() === 'w' && !chess.game_over()) {
            const { from, to, promotion } = data.move;
            const legal = chess.moves({ verbose: true });
            const isLegal = legal.some(m => m.from === from && m.to === to);

            if (isLegal) {
                executeMove(from, to, promotion || null);
                appendMsg('assistant', `Wykonuję ruch: <strong>${from}→${to}</strong>`, 'move-confirm');
            } else {
                appendMsg('assistant', `Ruch ${from}→${to} jest nielegalny w tej pozycji.`);
            }
        }
    } catch (err) {
        thinking.remove();
        appendMsg('assistant', `Błąd połączenia z serwerem AI (${escapeHtml(err.message)}). Uruchom <code>node server.js</code> w folderze szachy.`);
    }

    btn.disabled = false;
    input.focus();
}

function escapeHtml(str) {
    return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function mdToHtml(str) {
    return escapeHtml(str)
        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.+?)\*/g, '<em>$1</em>');
}

document.getElementById('chat-send').addEventListener('click', sendChat);
document.getElementById('chat-input').addEventListener('keydown', e => {
    if (e.key === 'Enter') sendChat();
});

// ── Start ──────────────────────────────────────────────────────────────────
init();
