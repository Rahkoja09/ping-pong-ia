const canvas = document.querySelector("#ping-pong");
const context = canvas.getContext("2d");

const startBtn = document.querySelector(".start-btn");
const pauseBtn = document.querySelector(".pause-btn");
const restartBtn = document.querySelector(".restart-btn");

let gameRunning = false;
let animationId;

const user = {
    x: 0,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "red",
    score: 0,
    speedBoostActive: false,
    lastSpeedBoostTime: 0,
    widenBoostActive: false,
    lastWidenBoostTime: 0
};

const computer = {
    x: canvas.width - 10,
    y: canvas.height / 2 - 100 / 2,
    width: 10,
    height: 100,
    color: "black",
    score: 0,
    speedBoostActive: false,
    lastSpeedBoostTime: 0
};

const initialBallSpeed = 3;
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: 10,
    speed: initialBallSpeed,
    velocityX: initialBallSpeed,
    velocityY: initialBallSpeed,
    color: "white"
};

const net = {
    x: canvas.width / 2 - 1,
    y: 0,
    width: 2,
    height: 10,
    color: "white"
};

const speedBoostDuration = 5000;
const speedBoostCooldown = 15000;
const widenBoostDuration = 5000;
const widenBoostCooldown = 15000;
const powerUpImage = document.querySelector("#power-up-image");
const powerUpImage2 = document.querySelector("#widen-power-up-image");

function drawRectangle(x, y, w, h, color) {
    context.fillStyle = color;
    context.fillRect(x, y, w, h);
}

function drawCircle(x, y, r, color) {
    context.fillStyle = color;
    context.beginPath();
    context.arc(x, y, r, 0, Math.PI * 2, false);
    context.closePath();
    context.fill();
}

function drawText(text, x, y, color) {
    context.fillStyle = color;
    context.font = "45px Arial";
    context.fillText(text, x, y);
}

function drawNet() {
    for (let i = 0; i <= canvas.height; i += 15) {
        drawRectangle(net.x, i, net.width, net.height, net.color);
    }
}

// Variables pour le suivi des erreurs
let failedAttempts = 0;
let aiAggressiveness = 0.8; // Paramètre ajustable : probabilité d'utilisation des pouvoirs après une défaite

function aiUsePowers() {
    const currentTime = Date.now();

    // Vérifier si l'IA est en retard pour augmenter l'agressivité
    const isLosing = computer.score < user.score;

    // Augmentation de l'agressivité en cas de plusieurs échecs consécutifs
    if (failedAttempts > 3) {
        aiAggressiveness = Math.min(1, aiAggressiveness + 0.1); // Augmente progressivement l'agressivité
        failedAttempts = 0; // Réinitialise après ajustement
    }

    // Utiliser l'accélération si la balle est proche et que l'IA a besoin de réagir rapidement
    if (!computer.speedBoostActive && currentTime - computer.lastSpeedBoostTime > speedBoostCooldown) {
        if (Math.abs(ball.x - computer.x) < 150 || (isLosing && Math.random() < aiAggressiveness)) {
            computer.speedBoostActive = true;
            computer.lastSpeedBoostTime = currentTime;
            setTimeout(() => {
                computer.speedBoostActive = false;
            }, speedBoostDuration);
        }
    }

    // Utiliser l'élargissement si la balle est rapide, difficile à atteindre ou si l'IA est en retard
    if (!computer.widenBoostActive && currentTime - computer.lastWidenBoostTime > widenBoostCooldown) {
        if (
            ball.velocityX > 3 ||
            Math.abs(ball.y - (computer.y + computer.height / 2)) > 50 ||
            (isLosing && Math.random() < aiAggressiveness)
        ) {
            computer.widenBoostActive = true;
            computer.lastWidenBoostTime = currentTime;
            computer.height = 150; // Élargissement temporaire
            setTimeout(() => {
                computer.widenBoostActive = false;
                computer.height = 100; // Retour à la taille normale
            }, widenBoostDuration);
        }
    }
}

// Fonction appelée après chaque point marqué par l'utilisateur
function onPointLost() {
    failedAttempts++;
    console.log("L'IA a perdu un point. Nombre d'échecs consécutifs :", failedAttempts);
}


function moveComputer() {
    const computerCenter = computer.y + computer.height / 2;
    if (computerCenter < ball.y) {
        computer.y += 4;
    } else {
        computer.y -= 4;
    }
    aiUsePowers();
}

function moveBall() {
    let speedMultiplier = 1;
    if (user.speedBoostActive) {
        speedMultiplier *= 4;
        if (Date.now() - user.lastSpeedBoostTime >= speedBoostDuration) {
            user.speedBoostActive = false;
        }
    }

    if (computer.speedBoostActive) {
        speedMultiplier *= 2;
        if (Date.now() - computer.lastSpeedBoostTime >= speedBoostDuration) {
            computer.speedBoostActive = false;
        }
    }

    ball.x += ball.velocityX * speedMultiplier;
    ball.y += ball.velocityY;

    if (ball.y - ball.radius < 0 || ball.y + ball.radius > canvas.height) {
        ball.velocityY = -ball.velocityY;
    }

    let player = (ball.x < canvas.width / 2) ? user : computer;
    if (collision(ball, player)) {
        ball.velocityX = -ball.velocityX;
    }

    if (ball.x - ball.radius < 0) {
        updateScore(computer);
        resetBall();
    } else if (ball.x + ball.radius > canvas.width) {
        updateScore(user);
        onPointLost();
        resetBall();
    }

    moveComputer();
}

function collision(b, p) {
    return b.x - b.radius < p.x + p.width &&
           b.x + b.radius > p.x &&
           b.y - b.radius < p.y + p.height &&
           b.y + b.radius > p.y;
}

function resetBall() {
    alert('continuer la partie?');
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = initialBallSpeed; 
    ball.velocityX = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
    ball.velocityY = initialBallSpeed * (Math.random() > 0.5 ? 1 : -1);
}

function render() {
    const countdownDisplay = document.querySelector("#countdown");
    const countdownDisplay2 = document.querySelector("#countdown2");
    if (user.speedBoostActive) {
        countdownDisplay.style.display = "block";
        countdownDisplay2.style.display = "block";
        powerUpImage.style.opacity = 0.2;
        powerUpImage2.style.opacity = 0.2;
        if (Date.now() - user.lastSpeedBoostTime >= speedBoostDuration) {
            user.speedBoostActive = false;
            powerUpImage.style.opacity = 1;
            powerUpImage2.style.opacity = 1;
        }
    } else if (Date.now() - user.lastSpeedBoostTime < speedBoostCooldown) {
        powerUpImage.style.opacity = 0.5;
        powerUpImage2.style.opacity = 0.5;
    } else {
        countdownDisplay.style.display = "none";
        countdownDisplay2.style.display = "none";
        powerUpImage.style.opacity = 1;
        powerUpImage2.style.opacity = 1;
    }

    if (user.widenBoostActive) {
        user.height = 160; // Augmente la taille immédiatement
        if (Date.now() - user.lastWidenBoostTime >= widenBoostDuration) {
            user.widenBoostActive = false;
            user.height = 100; // Réinitialise la taille après la durée
        }
    }

    context.clearRect(0, 0, canvas.width, canvas.height);
    drawNet();
    drawText(user.score, canvas.width / 4, canvas.height / 5, "white");
    drawText(computer.score, 3 * canvas.width / 4, canvas.height / 5, "white");
    drawRectangle(user.x, user.y, user.width, user.height, user.color);
    drawRectangle(computer.x, computer.y, computer.width, computer.height, computer.color);
    drawCircle(ball.x, ball.y, ball.radius, ball.color);
}

function checkWinCondition() {
    if (user.score === 7 || computer.score === 7) {
        alert(`${user.score === 7 ? 'Vous avez gagné !' : 'L\'ordinateur a gagné !'}`);
        user.score = 0;
        computer.score = 0;
        resetBall();
    }
}

function updateScore(player) {
    player.score++;
    checkWinCondition();
}

function game() {
    if (gameRunning) {
        moveBall();
        render();
        animationId = requestAnimationFrame(game);
    }
}

startBtn.addEventListener("click", () => {
    if (!gameRunning) {
        gameRunning = true;
        game();
    }
});

let countdownTime = 15;
let countdownTime2 = 10;
let countdownInterval;

function startCountdown() {
    countdownTime = 15;
    const countdownDisplay = document.querySelector("#countdown");
    countdownDisplay.innerText = countdownTime;

    countdownInterval = setInterval(() => {
        countdownTime--;
        countdownDisplay.innerText = countdownTime;

        if (countdownTime <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.innerText = "";
        }
    }, 1000);
}

function startCountdown2() {
    countdownTime2 = 10;
    const countdownDisplay = document.querySelector("#countdown2");
    countdownDisplay.innerText = countdownTime2;

    countdownInterval = setInterval(() => {
        countdownTime2--;
        countdownDisplay.innerText = countdownTime2;

        if (countdownTime2 <= 0) {
            clearInterval(countdownInterval);
            countdownDisplay.innerText = "";
        }
    }, 1000);
}

pauseBtn.addEventListener("click", () => {
    gameRunning = false;
    cancelAnimationFrame(animationId);
});

canvas.addEventListener("mousemove", (event) => {
    let rect = canvas.getBoundingClientRect();
    user.y = event.clientY - rect.top - user.height / 2;

    if (user.y < 0) user.y = 0;
    if (user.y + user.height > canvas.height) user.y = canvas.height - user.height;
});

document.addEventListener("keydown", (event) => {
    const currentTime = Date.now();

    // Activation du pouvoir de vitesse
    if (event.key === "a" && !user.speedBoostActive && (currentTime - user.lastSpeedBoostTime > speedBoostCooldown)) {
        user.speedBoostActive = true;
        user.lastSpeedBoostTime = currentTime; 
        startCountdown();
    }

    // Activation du pouvoir d'élargissement
    if (event.key === "z" && !user.widenBoostActive && (currentTime - user.lastWidenBoostTime > widenBoostCooldown) && (currentTime - startTime > 10000)) {
        user.widenBoostActive = true;
        user.lastWidenBoostTime = currentTime;
        user.height = 160;
        user.width = 30; // Élargit la raquette immédiatement
        startCountdown2();
        setTimeout(() => {
            user.widenBoostActive = false;
            user.height = 100;
            user.width = 10; // Réinitialise la taille après la durée
        }, widenBoostDuration);
    }
});

let startTime = Date.now();

restartBtn.addEventListener("click", () => {
    user.score = 0;
    computer.score = 0;
    resetBall();
    gameRunning = false;
    cancelAnimationFrame(animationId);
});
