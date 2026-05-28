document.addEventListener("DOMContentLoaded", () => {

    // ========= ELEMENTS =========
    const loginPage = document.getElementById("loginPage");
    const gamePage = document.getElementById("gamePage");

    const startBtn = document.getElementById("startBtn");
    const backBtn = document.getElementById("backBtn");

    const modeSelect = document.getElementById("loginMode");
    const player2Box = document.getElementById("player2Box");

    const clickSound = document.getElementById("clickSound");
    const winSound = document.getElementById("winSound");
    const drawSound = document.getElementById("drawSound");

    // ========= STATE =========
    let player1 = "";
    let player2 = "";
    let gameMode = "pvp";

    let board = [];
    let currentPlayer = "X";
    let gameActive = true;
    let moveHistory = [];

    let xScore = parseInt(localStorage.getItem("xScore")) || 0;
    let oScore = parseInt(localStorage.getItem("oScore")) || 0;
    let drawScore = parseInt(localStorage.getItem("drawScore")) || 0;

    // ========= INITIAL UI =========
    loginPage.style.display = "block";
    gamePage.style.display = "none";

    // Hide/show Player 2
    function togglePlayer2() {
        if (modeSelect.value === "ai") {
            player2Box.style.display = "none";
        } else {
            player2Box.style.display = "block";
        }
    }

    togglePlayer2();
    modeSelect.addEventListener("change", togglePlayer2);

    // ========= START GAME =========
    startBtn.addEventListener("click", () => {
        document.getElementById("mode").value = gameMode;

        player1 = document.getElementById("player1").value.trim();
        player2 = document.getElementById("player2").value.trim();
        gameMode = modeSelect.value;

        if (player1 === "") {
            alert("Enter Player 1 name");
            return;
        }

        if (gameMode === "pvp" && player2 === "") {
            alert("Enter Player 2 name");
            return;
        }

        if (gameMode === "ai") {
            player2 = "Computer";
        }

        // Switch pages
        loginPage.style.display = "none";
        gamePage.style.display = "block";

        initGame();
    });

    // ========= BACK =========
    backBtn.addEventListener("click", () => {
        gamePage.style.display = "none";
        loginPage.style.display = "block";
    });

    // ========= INIT GAME =========
    function initGame() {

        board = ["", "", "", "", "", "", "", "", ""];
        currentPlayer = "X";
        gameActive = true;
        moveHistory = [];

        const cells = document.querySelectorAll(".cell");
        const status = document.getElementById("status");

        const xScoreDisplay = document.getElementById("x-score");
        const oScoreDisplay = document.getElementById("o-score");
        const drawScoreDisplay = document.getElementById("draw-score");

        updateScoreUI();
        updateTurn();

        cells.forEach(cell => {
            cell.textContent = "";
            cell.classList.remove("winner-cell", "disabled");
            cell.onclick = handleClick;
        });

        document.getElementById("restart").onclick = initGame;
        document.getElementById("undo").onclick = undoMove;
        document.getElementById("resetScore").onclick = resetScore;

        // ===== TURN TEXT =====
        function updateTurn() {
            let name = currentPlayer === "X" ? player1 : player2;
            status.className = "turn";
            status.textContent = `${name}'s Turn (${currentPlayer})`;
        }

        // ===== CLICK =====
        function handleClick(e) {
            const i = e.target.dataset.index;

            if (board[i] !== "" || !gameActive) return;

            makeMove(i, currentPlayer);

            let win = getWin();
            if (win) {
                highlight(win);
                endGame(currentPlayer);
                return;
            }

            if (!board.includes("")) {
                drawGame();
                return;
            }

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            updateTurn();

            if (gameMode === "ai" && currentPlayer === "O") {
                setTimeout(aiMove, 400);
            }
        }

        // ===== MOVE =====
        function makeMove(i, player) {
            board[i] = player;
            cells[i].textContent = player;
            moveHistory.push(i);

            if (clickSound) {
                clickSound.currentTime = 0;
                clickSound.play().catch(() => { });
            }
        }

        // ===== WIN =====
        function getWin() {
            const p = [
                [0, 1, 2], [3, 4, 5], [6, 7, 8],
                [0, 3, 6], [1, 4, 7], [2, 5, 8],
                [0, 4, 8], [2, 4, 6]
            ];

            for (let a of p) {
                let [x, y, z] = a;
                if (board[x] && board[x] === board[y] && board[x] === board[z]) {
                    return a;
                }
            }
            return null;
        }

        function highlight(pattern) {
            pattern.forEach(i => cells[i].classList.add("winner-cell"));
        }

        // ===== AI =====
        function aiMove() {
            let empty = board.map((v, i) => v === "" ? i : null).filter(v => v !== null);
            let move = empty[Math.floor(Math.random() * empty.length)];

            makeMove(move, "O");

            let win = getWin();
            if (win) {
                highlight(win);
                endGame("O");
                return;
            }

            if (!board.includes("")) {
                drawGame();
                return;
            }

            currentPlayer = "X";
            updateTurn();
        }

        // ===== END =====
        function endGame(winner) {
            gameActive = false;

            let name = winner === "X" ? player1 : player2;
            status.className = "win";
            status.textContent = `🎉 ${name} Wins!`;
            if (winner === "X") xScore++;
            else oScore++;

            if (winSound) {
                winSound.currentTime = 0;
                winSound.play().catch(() => { });
            }

            saveScores();
            updateScoreUI();
        }

        function drawGame() {
            gameActive = false;
            status.className = "draw";
            status.textContent = "It's a Draw!";
            drawScore++;

            if (drawSound) {
                drawSound.currentTime = 0;
                drawSound.play().catch(() => { });
            }

            saveScores();
            updateScoreUI();
        }

        // ===== UNDO =====
        function undoMove() {
            if (!moveHistory.length || !gameActive) return;

            let last = moveHistory.pop();
            board[last] = "";
            cells[last].textContent = "";

            currentPlayer = currentPlayer === "X" ? "O" : "X";
            updateTurn();
        }

        // ===== SCORE =====
        function updateScoreUI() {
            xScoreDisplay.textContent = xScore;
            oScoreDisplay.textContent = oScore;
            drawScoreDisplay.textContent = drawScore;
        }

        function saveScores() {
            localStorage.setItem("xScore", xScore);
            localStorage.setItem("oScore", oScore);
            localStorage.setItem("drawScore", drawScore);
        }

        function resetScore() {
            if (!confirm("Reset scores?")) return;

            xScore = 0;
            oScore = 0;
            drawScore = 0;

            saveScores();
            updateScoreUI();
        }
    }

    document.getElementById("mode").addEventListener("change", function () {
        gameMode = this.value;
        initGame(); // restart with new mode
    });
});