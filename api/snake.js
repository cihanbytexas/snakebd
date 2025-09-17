let games = {}; // { userId: { snake, direction, food, score, game_over } }

const WIDTH = 6;
const HEIGHT = 6;

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST allowed" });
  }

  const { userId, action, direction } = req.body;

  if (!userId) {
    return res.status(400).json({ error: "userId gerekli" });
  }

  // Yeni oyun başlat
  if (action === "new") {
    games[userId] = {
      snake: [{ x: 2, y: 2 }],
      direction: "RIGHT",
      food: {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
      },
      score: 0,
      game_over: false,
    };
    return res.json(renderBoard(games[userId]));
  }

  // Hareket
  if (action === "move") {
    let game = games[userId];
    if (!game) return res.json({ error: "Oyun bulunamadı, önce başlat!" });
    if (game.game_over) return res.json({ board: "☠️ Oyun bitti!", score: game.score, game_over: true });

    // Yeni yön
    if (direction) game.direction = direction;

    // Yeni kafa
    let head = { ...game.snake[game.snake.length - 1] };
    if (game.direction === "UP") head.y--;
    if (game.direction === "DOWN") head.y++;
    if (game.direction === "LEFT") head.x--;
    if (game.direction === "RIGHT") head.x++;

    // Çarpışma kontrol
    if (
      head.x < 0 ||
      head.y < 0 ||
      head.x >= WIDTH ||
      head.y >= HEIGHT ||
      game.snake.some((s) => s.x === head.x && s.y === head.y)
    ) {
      game.game_over = true;
      return res.json({ board: "☠️ Oyun bitti!", score: game.score, game_over: true });
    }

    // Hareket uygula
    game.snake.push(head);

    // Yem kontrol
    if (head.x === game.food.x && head.y === game.food.y) {
      game.score++;
      game.food = {
        x: Math.floor(Math.random() * WIDTH),
        y: Math.floor(Math.random() * HEIGHT),
      };
    } else {
      game.snake.shift();
    }

    return res.json(renderBoard(game));
  }

  res.status(400).json({ error: "Geçersiz action" });
}

// 🔹 Board'u emoji haline çevirme
function renderBoard(game) {
  let board = "";

  for (let y = 0; y < HEIGHT; y++) {
    for (let x = 0; x < WIDTH; x++) {
      if (game.snake.some((s) => s.x === x && s.y === y)) {
        board += "🟩";
      } else if (game.food.x === x && game.food.y === y) {
        board += "🍎";
      } else {
        board += "⬛";
      }
    }
    board += "\n";
  }

  return {
    board,
    score: game.score,
    game_over: game.game_over,
  };
}
