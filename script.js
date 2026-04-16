import Grid from "./Grid.js";
import Tile from "./Tile.js";

const versoes ={
    "DBZ": {
        nome: "Dragon Ball Z",
        classe: "dbz",
        prefixo: "dbz"
    },
    "DBS": {
        nome: "Dragon Ball Super",
        classe: "dbs",
        prefixo: "dbs"
    },
    "DBGT": {
        nome: "Dragon Ball GT",
        classe: "dbgt",
        prefixo: "dbgt"
    }
}


const gameBoard = document.getElementById("game-board");
const scoreText = document.getElementById("score");

var game_score = 0;

let grid;

// Não inicializa o grid até que uma versão seja selecionada

var touchstartX
var touchstartY
var touchendX
var touchendY
let inputConfigured = false

function setupInput() {
    if (inputConfigured) return
    inputConfigured = true

    window.addEventListener("keydown", e => {
        handleInput(e.key)
    })

    gameBoard.addEventListener("touchstart", e => {
        if (e.changedTouches.length > 0) {
            touchstartX = e.changedTouches[0].screenX
            touchstartY = e.changedTouches[0].screenY
        }
    }, {passive: true})

    gameBoard.addEventListener("touchend", e => {
        if (e.changedTouches.length > 0) {
            touchendX = e.changedTouches[0].screenX
            touchendY = e.changedTouches[0].screenY
            handleGesture()
        }
    })

    gameBoard.addEventListener("touchmove", e => {
        if (e.changedTouches.length > 0) {
            e.preventDefault()
        }
    }, {passive: false})
}

function handleGesture() {
    const deltaX = touchendX - touchstartX
    const deltaY = touchendY - touchstartY
    const distance = Math.max(Math.abs(deltaX), Math.abs(deltaY))
    const swipeThreshold = 30

    if (distance < swipeThreshold) {
        return
    }

    if (Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
            handleInput("ArrowLeft")
        } else {
            handleInput("ArrowRight")
        }
    } else {
        if (deltaY < 0) {
            handleInput("ArrowUp")
        } else {
            handleInput("ArrowDown")
        }
    }
}



async function handleInput(dir) {
    console.log("handleInput chamado com direção:", dir);
    console.log("Grid existe?", grid);
    console.log("Grid cells:", grid ? grid.cells : "GRID NÃO EXISTE!");
    
    switch (dir) {
        case "ArrowUp":
            console.log("Testando canMoveUp...");
            if (!canMoveUp()) {
                if (isGameOver()) {
                    mostrarGameOver();
                    return;
                }
                setupInput();
                return;
            }
            await moveUp();
            break;
        case "ArrowDown":
            if (!canMoveDown()) {
                if (isGameOver()) {
                    mostrarGameOver();
                    return;
                }
                setupInput();
                return;
            }
            await moveDown();
            break;
        case "ArrowLeft":
            if (!canMoveLeft()) {
                if (isGameOver()) {
                    mostrarGameOver();
                    return;
                }
                setupInput();
                return;
            }
            await moveLeft();
            break;
        case "ArrowRight":
            if (!canMoveRight()) {
                if (isGameOver()) {
                    mostrarGameOver();
                    return;
                }
                setupInput();
                return;
            }
            await moveRight();
            break;
        default:
            console.log("Tecla não reconhecida:", dir);
            setupInput()
            return
            break
    }

    var round_score = 0;
    for (let i = 0; i < grid.cells.length; i++) {
        var cell = grid.cells[i];
        round_score += cell.mergeTiles();
    }
    let prev_score = game_score;
    game_score += round_score;


    //Animate the score counter
    function animateValue(obj, start, end, duration) {
        let startTimestamp = null;
          const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            obj.innerHTML = "Score: "+ Math.floor(progress * (end - start) + start);
            if (progress < 1) {
              window.requestAnimationFrame(step);
            }
          };
          window.requestAnimationFrame(step);
        }
        
        const obj = document.getElementById("value");
        animateValue(scoreText, prev_score, game_score, 1000);

    const emptyCell = grid.randomEmptyCell();
    if (emptyCell == null) {
        if (isGameOver()) {
            mostrarGameOver();
            return;
        }
        setupInput();
        return;
    }

    const newTile = new Tile(gameBoard);
    emptyCell.tile = newTile;

    if (isGameOver()) {
        console.log("Game Over!");
        mostrarGameOver();
        return;
    }

    setupInput();
}

function moveLeft() {
    return slideTiles(grid.cellsByRow)
}

function moveRight() {
    return slideTiles(grid.cellsByRow.map(row => [...row].reverse()))
}

function moveUp() {
    return slideTiles(grid.cellsByColumn)
}

function moveDown() {
    return slideTiles(grid.cellsByColumn.map(column => [...column].reverse()))
}


function slideTiles(cells) {
    return Promise.all(
    cells.flatMap(group => {
        const promises = []
        for (let i = 1; i < group.length; i++) {
            const cell = group[i]
            if (cell.tile == null) continue
            let lastValidCell
            for(let j = i - 1; j >= 0; j--) {
                const moveToCell = group[j]
                if (!moveToCell.canAccept(cell.tile)) break
                lastValidCell = moveToCell
            }


            if (lastValidCell != null) {
                promises.push(cell.tile.waitForTransition())
                if(lastValidCell.tile != null) {
                    lastValidCell.mergeTile = cell.tile
                } else {
                    lastValidCell.tile = cell.tile
                }
                cell.tile = null
            }
        }
        return promises
    }));
}

function canMoveRight() {
    return canMove(grid.cellsByRow.map(row => [...row].reverse()))
}
function canMoveLeft() {
    return canMove(grid.cellsByRow)
}
function canMoveUp() {
    return canMove(grid.cellsByColumn)
}
function canMoveDown() {
    return canMove(grid.cellsByColumn.map(column => [...column].reverse()))
}

function canMove(cells) {
    return cells.some(group => {
        return group.some((cell, index) => {
            if (index === 0) return false // Cannot move the top cell up
            if (cell.tile == null) return false // cannot move a cell that doesn't exist
            const moveToCell = group[index-1]
            return moveToCell.canAccept(cell.tile) // can the above cell accept us??
        })
    })
}

function isGameOver() {
    return (
        !canMoveUp() &&
        !canMoveDown() &&
        !canMoveLeft() &&
        !canMoveRight()
    );
}

function restartGame() {
    // 1. Reseta o score
    game_score = 0;
    scoreText.textContent = "Score: 0";

    // 2. Limpa o board e recria a grade para manter as células visíveis
    gameBoard.innerHTML = "";
    grid = new Grid(gameBoard);

    // 3. Adiciona os dois primeiros tiles
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    grid.randomEmptyCell().tile = new Tile(gameBoard);
    setupInput();
}

const botoesVersao = document.querySelectorAll(".versao-btn");

botoesVersao.forEach((botao) => {
    botao.addEventListener("click", () => {
        //Pega o valor do data-versao do botão clicado
        const saga = botao.getAttribute("data-versao");

        console.log(`Iniciando jogo da saga ${saga}...`);

        startGame(saga);
    });
});

function startGame(versao) {
    const startScreen = document.getElementById("start-screen");
    const gameContainer = document.getElementById("game-container");

    console.log("startGame chamado com versão:", versao);
    console.log("gameBoard existe?", gameBoard);
    console.log("gameContainer existe?", gameContainer);

    // 1. Aplica o tema imediatamente
    document.body.className = "tema-" + versao.toLowerCase();

    // 2. Esconde o menu COMPLETAMENTE
    startScreen.classList.add("hidden");
    gameContainer.classList.add("show"); 
    
    console.log("game-container display:", gameContainer.style.display);
    console.log("start-screen hidden:", startScreen.classList.contains("hidden"));

    // 3. Pequeno "atraso" para garantir que o Board já tem tamanho na tela
    setTimeout(() => {
        console.log("Iniciando lógica de blocos...");
        console.log("gameBoard innerHTML antes:", gameBoard.innerHTML);
        console.log("gameBoard computedStyle width:", window.getComputedStyle(gameBoard).width);
        console.log("gameBoard computedStyle height:", window.getComputedStyle(gameBoard).height);
        
        // Inicializa o grid apenas quando uma versão é selecionada
        if (!grid) {
            console.log("Criando novo Grid...");
            grid = new Grid(gameBoard);
            console.log("Grid criado com sucesso");
        } else {
            // Se está reiniciando, limpa o board
            gameBoard.innerHTML = "";
        }
        
        console.log("gameBoard innerHTML depois de Grid:", gameBoard.innerHTML);
        console.log("gameBoard offsetWidth:", gameBoard.offsetWidth);
        console.log("gameBoard offsetHeight:", gameBoard.offsetHeight);
        
        // Cria os tiles iniciais
        const tile1 = new Tile(gameBoard);
        grid.randomEmptyCell().tile = tile1;
        
        const tile2 = new Tile(gameBoard);
        grid.randomEmptyCell().tile = tile2;
        
        console.log("Tiles criados, iniciando input...");
        
        setupInput();
    }, 150); // Aumentado para 150ms
}

// Adiciona listener para os botões de reiniciar
const restartBtn = document.getElementById("restart-button");
const backBtn = document.getElementById("back-button");
const restartBtnOver = document.getElementById("restart-button-over");
if (restartBtn) {
    restartBtn.addEventListener("click", restartGame);
}
if (backBtn) {
    backBtn.addEventListener("click", () => {
        const gameOverScreen = document.getElementById("game-over");
        const startScreen = document.getElementById("start-screen");
        const gameContainer = document.getElementById("game-container");

        if (gameOverScreen) {
            gameOverScreen.classList.remove("show");
        }
        if (gameContainer) {
            gameContainer.classList.remove("show");
        }
        if (startScreen) {
            startScreen.classList.remove("hidden");
        }

        gameBoard.innerHTML = "";
        grid = null;
        game_score = 0;
        scoreText.textContent = "Score: 0";
        document.body.className = "";
    });
}
if (restartBtnOver) {
    restartBtnOver.addEventListener("click", () => {
        const gameOverScreen = document.getElementById("game-over");
        if (gameOverScreen) {
            gameOverScreen.classList.remove("show");
        }
        restartGame();
    });
}

function mostrarGameOver() {
    const gameOverScreen = document.getElementById("game-over");
    if (gameOverScreen) {
        gameOverScreen.classList.add("show");
    }
}