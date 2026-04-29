import Anthropic from '@anthropic-ai/sdk';
import express from 'express';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import 'dotenv/config';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());
app.use(express.static(__dirname));

const client = new Anthropic();

const SYSTEM_PROMPT = `Jesteś pomocnym trenerem szachowym i asystentem AI wbudowanym w grę szachową.
Rozmawiasz po polsku z graczem uczącym się szachów.

Możesz:
1. Odpowiadać na pytania o szachy (zasady, strategie, debiuty, końcówki)
2. Wykonywać ruchy na planszy za pomocą narzędzia execute_move gdy gracz o to prosi

Aktualna pozycja jest podana w formacie FEN w każdej wiadomości.

Roszada:
- Krótka roszada (królewska): król z e1→g1 (białe) lub e8→g8 (czarne)
- Długa roszada (hetmańska): król z e1→c1 (białe) lub e8→c8 (czarne)
- Użyj execute_move z from="e1" to="g1" (lub odpowiednim polem)

Ważne zasady:
- Wykonuj ruch TYLKO gdy gracz wyraźnie o to prosi (np. "zrób roszadę", "zagraj e4", "wykonaj ten ruch")
- Przed wykonaniem ruchu sprawdź czy jest on legalny w aktualnej pozycji
- Jeśli gracz pyta o strategię lub zasady — odpowiadaj słownie, bez wykonywania ruchów
- Odpowiadaj krótko i konkretnie, maksymalnie 2-3 zdania
- Graj TYLKO białymi (gracz gra białymi), więc wykonuj ruchy tylko gdy kolej białych (turn=w)

Przykłady poleceń wykonania ruchu:
- "zrób roszadę" / "roszada" → execute_move(e1, g1) jeśli krótka możliwa
- "zagraj e4" → execute_move(e2, e4)
- "skoczek na f3" → execute_move(g1, f3)
- "zbij pionka na e5" → execute_move(d4, e5) (lub inne odpowiednie pole)`;

app.post('/chat', async (req, res) => {
    const { message, fen, turn, moveHistory, history = [] } = req.body;

    const userContent = `[FEN: ${fen} | Kolej: ${turn === 'w' ? 'białe' : 'czarne'} | Ruchy: ${moveHistory || '—'}]

Gracz: ${message}`;

    const messages = [
        ...history,
        { role: 'user', content: userContent }
    ];

    try {
        const response = await client.messages.create({
            model: 'claude-opus-4-6',
            max_tokens: 1024,
            system: SYSTEM_PROMPT,
            tools: [
                {
                    name: 'execute_move',
                    description: 'Wykonaj ruch szachowy na planszy. Używaj tylko gdy gracz wyraźnie prosi o wykonanie ruchu.',
                    input_schema: {
                        type: 'object',
                        properties: {
                            from: {
                                type: 'string',
                                description: 'Pole startowe w notacji algebraicznej (np. "e2", "g1")'
                            },
                            to: {
                                type: 'string',
                                description: 'Pole docelowe w notacji algebraicznej (np. "e4", "f3")'
                            },
                            promotion: {
                                type: 'string',
                                enum: ['q', 'r', 'b', 'n'],
                                description: 'Figura promocji pionka (opcjonalne, domyślnie hetman)'
                            }
                        },
                        required: ['from', 'to']
                    }
                }
            ],
            messages
        });

        let text = '';
        let move = null;

        for (const block of response.content) {
            if (block.type === 'text') {
                text = block.text;
            } else if (block.type === 'tool_use' && block.name === 'execute_move') {
                move = {
                    from: block.input.from,
                    to: block.input.to,
                    promotion: block.input.promotion || null
                };
            }
        }

        // Build updated history for next turn
        const updatedHistory = [
            ...history,
            { role: 'user', content: userContent },
            { role: 'assistant', content: response.content }
        ];

        res.json({ text, move, history: updatedHistory });
    } catch (err) {
        console.error('Claude API error:', err.message);
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
    console.log(`Szachy server running at http://localhost:${PORT}`);
});
