const player = document.getElementById('player');
const ai = document.getElementById('ai');
const ball = document.getElementById('ball');
const game = document.getElementById('game');
const levelSelector = document.getElementById('level');

let playerY = 160; // Position verticale de la raquette du joueur
let aiY = 160; // Position verticale de la raquette de l'IA
let ballX = 295; // Position horizontale de la balle
let ballY = 195; // Position verticale de la balle
let ballSpeedX = 2; // Vitesse horizontale de la balle
let ballSpeedY = 2; // Vitesse verticale de la balle

// Fonction pour mettre à jour la vitesse de la balle en fonction du niveau
function updateBallSpeed() {
    const level = parseInt(levelSelector.value);
    ballSpeedX = 2 + level; // Vitesse de la balle augmente avec le niveau
    ballSpeedY = 2 + level; // Vitesse de la balle augmente avec le niveau
}

// Événement pour détecter le changement de niveau
levelSelector.addEventListener('change', () => {
    updateBallSpeed();
    resetBall(); // Réinitialiser la position de la balle lorsque le niveau change
});

document.addEventListener('mousemove', (event) => {
    const rect = game.getBoundingClientRect();
    playerY = event.clientY - rect.top - player.offsetHeight / 2;
    player.style.top = Math.max(0, Math.min(rect.height - player.offsetHeight, playerY)) + 'px';
});

function moveAI() {
    aiY = ballY - ai.offsetHeight / 2;
    ai.style.top = Math.max(0, Math.min(game.clientHeight - ai.offsetHeight, aiY)) + 'px';
}

function resetBall() {
    ballX = 295; // Position initiale
    ballY = 195; // Position initiale
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';
}

function update() {
    // Mise à jour de la position de la balle
    ballX += ballSpeedX;
    ballY += ballSpeedY;

    // Gestion des collisions avec les murs
    if (ballY <= 0 || ballY >= game.clientHeight - ball.offsetHeight) {
        ballSpeedY = -ballSpeedY; // Inverser la direction
    }

    // Gestion des collisions avec les raquettes
    if (ballX <= player.offsetWidth && ballY + ball.offsetHeight >= playerY && ballY <= playerY + player.offsetHeight) {
        ballSpeedX = -ballSpeedX; // Inverser la direction
    } else if (ballX >= game.clientWidth - ai.offsetWidth - ball.offsetWidth &&
        ballY + ball.offsetHeight >= aiY && ballY <= aiY + ai.offsetHeight) {
        ballSpeedX = -ballSpeedX; // Inverser la direction
    }

    // Réinitialiser la balle si elle sort du jeu
    if (ballX < 0 || ballX > game.clientWidth) {
        resetBall(); // Réinitialiser la position de la balle
    }

    // Mise à jour de la position de la balle
    ball.style.left = ballX + 'px';
    ball.style.top = ballY + 'px';

    moveAI(); // Déplacer l'IA
}

updateBallSpeed(); // Mettre à jour la vitesse de la balle au démarrage
setInterval(update, 20); // Mettre à jour le jeu toutes les 20 ms
