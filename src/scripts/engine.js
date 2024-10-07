const state = {
    view: {
        squares: [],
        timeLeft: document.querySelector("#time-left"),
        score: document.querySelector("#score"),
        pauseBtn: document.querySelector("#pause-btn"),
        panel: document.querySelector("#panel"),
    },
    values: {
        gameVelocity: 1000,
        hitPosition: null,
        hitResult: 0,
        currentTime: 60,
        lives: 3,
        level: 1,
        enemiesCount: 1,
    },
    actions: {
        timerId: null,
        countDownTimerId: null,
        gamePaused: false,
    },
};

let hitSound = new Audio('./src/sounds/hit.m4a');
hitSound.volume = 0.2;
let bgSound = new Audio('./src/sounds/mid.m4a');
bgSound.volume = 0.5;

// Tocar som de hit
const playBackgroundSound = () => {
    bgSound.loop = true; // Faz o som de fundo tocar em loop
    bgSound.play(); // Toca o som de fundo
};

// Tocar som de hit
const playHitSound = () => {
    hitSound.currentTime = 0; // Reinicia o som de hit
    hitSound.play(); // Toca o som de hit
};


// Função para decrementar vidas
const decrementLives = () => {
    state.values.lives--;
    document.querySelector(".menu-lives h2").textContent = `X${state.values.lives}`;

    if (state.values.lives <= 0) {
        clearInterval(state.actions.timerId);
        clearInterval(state.actions.countDownTimerId);
        alert("Você perdeu todas as vidas! Game Over.");
        restartGame(); 
    } else if (state.values.currentTime <= 0) {
        alert(`Parabéns, você passou de fase! Seu resultado foi ${state.values.hitResult}`);
        nextPhase();
    }
};

// Reiniciar o jogo
const restartGame = () => {
    state.values.lives = 3;
    state.values.hitResult = 0;
    state.values.currentTime = 60;
    state.values.gameVelocity = 1000;
    state.values.level = 1;
    state.values.enemiesCount = 1;

    document.querySelector(".menu-lives h2").textContent = `X${state.values.lives}`;
    state.view.score.textContent = state.values.hitResult;
    state.view.timeLeft.textContent = state.values.currentTime;

    clearInterval(state.actions.timerId);
    clearInterval(state.actions.countDownTimerId);

    createSquares();
    moveEnemies();
    gameTimer();
};

// Passar de fase
const nextPhase = () => {
    state.values.level++;
    state.values.enemiesCount++; // Aumentar o número de inimigos
    state.values.currentTime = 60; // Resetar o tempo
    state.values.gameVelocity -= 100; // Aumentar a velocidade do jogo

    state.view.timeLeft.textContent = state.values.currentTime;

    // Em vez de aumentar o número de quadrados, apenas mude a dificuldade aqui
    adjustDifficulty(); // Chame uma função que altera a dificuldade

    clearInterval(state.actions.timerId);
    moveEnemies(); // Move os inimigos
    addListenerHitBox(); // Adiciona os listeners
    gameTimer(); // Inicia o timer do jogo
};

const adjustDifficulty = () => {
    // Aqui você pode alterar propriedades como a cor dos quadrados ou a velocidade
    state.view.squares.forEach((square) => {
        // Exemplo de como mudar a cor ou a opacidade dos quadrados para aumentar a dificuldade
        square.style.backgroundColor = getRandomColor(); // Muda a cor para um valor aleatório
        // Você pode adicionar mais lógica aqui, como aumentar a opacidade ou mudar a forma
    });
};




// Função para aumentar a dificuldade
const increaseDifficulty = () => {
    if (state.values.hitResult % 10 === 0) {
        state.values.gameVelocity -= 100;
        clearInterval(state.actions.timerId);
        moveEnemies(); 
    }
};

// Criar quadrados
const createSquares = () => {
    state.view.panel.innerHTML = '';
    state.view.squares = []; // Certifique-se de limpar a lista de quadrados

    let totalSquares = 9 + (state.values.level - 1) * 3;
    for (let i = 1; i <= totalSquares; i++) {
        const square = document.createElement("div");
        square.classList.add("square");
        square.id = i;
        state.view.panel.appendChild(square);
        state.view.squares.push(square);
    }

    addListenerHitBox(); // Adicionar listeners após criar quadrados
};

// Função de contagem regressiva
const countDown = () => {
    if (!state.actions.gamePaused) {
        state.values.currentTime--;
        state.view.timeLeft.textContent = state.values.currentTime;
        if (state.values.currentTime <= 0) {
            clearInterval(state.actions.countDownTimerId);
            clearInterval(state.actions.timerId);
            alert(`Fase ${state.values.level} finalizada! Seu resultado foi ${state.values.hitResult}`);
            nextPhase();
        }
    }
};

// Escolher quadrado aleatório para o inimigo
const randomSquare = () => {
    state.view.squares.forEach(square => square.classList.remove("enemy"));
    let selectedSquares = [];
    for (let i = 0; i < state.values.enemiesCount; i++) {
        let randomIndex = Math.floor(Math.random() * state.view.squares.length);
        selectedSquares.push(state.view.squares[randomIndex]);
    }
    selectedSquares.forEach(square => {
        square.classList.add("enemy");
        state.values.hitPosition = square.id;
    });
};

// Mover inimigos
const moveEnemies = () => {
    state.actions.timerId = setInterval(randomSquare, state.values.gameVelocity);
};

// Pausar/Continuar Jogo
const togglePause = () => {
    if (state.actions.gamePaused) {
        state.actions.gamePaused = false;
        state.view.pauseBtn.textContent = "Pausar";
        moveEnemies();
        state.actions.countDownTimerId = setInterval(countDown, 1000);
    } else {
        state.actions.gamePaused = true;
        state.view.pauseBtn.textContent = "Continuar";
        clearInterval(state.actions.timerId);
        clearInterval(state.actions.countDownTimerId);
    }
};

// Temporizador do jogo
const gameTimer = () => {
    state.actions.countDownTimerId = setInterval(countDown, 1000);
};

// Adicionar listeners aos quadrados
const addListenerHitBox = () => {
    state.view.squares.forEach((square) => {
        square.addEventListener("mousedown", () => {
            if (square.classList.contains("enemy")) {
                state.values.hitResult++;
                state.view.score.textContent = state.values.hitResult;
                playHitSound();
                increaseDifficulty();
                square.classList.remove("enemy");
            } else {
                decrementLives(); 
            }
        });
    });
};

// Iniciar o jogo
const init = () => {
    createSquares();
    moveEnemies();
    gameTimer();
    playBackgroundSound();
};

state.view.pauseBtn.addEventListener("click", togglePause);
init();

window.addEventListener("beforeunload", saveScore);
