$(document).ready(function () {
    // STATE
    let flases = [true, true, true, 1, true, true];   // [crouch, actionsEnabled, spawnEnemies, bossPhase, timerOn, diedCheckOn]
    let lowing = [100, 100, 0, 0];                    // [soldierHP, bossHP, kills, coins]
    let gunAngle = 0;

    // DOM REFERENCES
    let killcont = document.querySelector('.hit span');
    let coin = document.querySelector('.coin span');
    let time = document.querySelector('.time span');
    const lase = document.querySelector('.laser');
    const gun = document.querySelector('.gun');
    const soldier = document.querySelector('.soil1');
    const bullet = document.querySelector('.bul');
    const boss = document.querySelector('.bosses');
    const bosses = document.querySelector('.boss');
    const healthBoss = document.querySelector('.incr');
    const barriers = document.querySelectorAll('.standin, .st2, .st3');
    const container = document.querySelector('.container');
    const healthSoldier = document.querySelector('.hlt');
    const bulletSpeed = 40;

    // RUNTIME HANDLES
    let enemies = [];
    let bulletInterval = null;
    let spawnInterval = null;
    let timerInterval = null;
    let timeinMin = 2;
    let timeinSec = 30;

    function updateTimeDisplay() {
        const displayMin = timeinMin < 10 ? `0${timeinMin}` : timeinMin;
        const displaySec = timeinSec < 10 ? `0${timeinSec}` : timeinSec;
        time.innerHTML = `${displayMin}:${displaySec}`;
    }

    // Function to create an enemy
    function createEnemy(topPosition) {
        // Don't spawn if game not running / spawning disabled
        if (!flases[1] || !flases[2]) return;

        const enemy = document.createElement('div');
        enemy.classList.add('enemy');
        const enemyImage = document.createElement('img');
        const enemyImages = [
            'img/F-chara Dragon knight01.png',
            'img/F-chara Dragon knight02.png',
            'img/F-chara Dragon knight03.png',
            'img/F-chara Dragon knight04.png',
            'img/F-chara Dragon knight05.png',
            'img/F-chara Dragon knight06.png',
            'img/F-chara Dragon knight07.png',
            'img/F-chara Dragon knight08.png'
        ];

        const randomImageIndex = Math.floor(Math.random() * enemyImages.length);
        const selectedImage = enemyImages[randomImageIndex];

        enemyImage.src = selectedImage;
        enemy.appendChild(enemyImage);

        enemy.style.top = `${topPosition}px`;
        enemy.style.left = `${container.clientWidth + 50}px`; // Start outside the right side of the container
        container.appendChild(enemy);
        enemies.push(enemy);
    }

    function ChangePOse() {
        const enemyImage = document.createElement('img');
        const enemyImages = [
            'img/F-chara Dragon knight07.png',
            'img/F-chara Dragon knight09.png'
        ];

        const randomImageIndex = Math.floor(Math.random() * enemyImages.length);
        const selectedImage = enemyImages[randomImageIndex];
        enemyImage.src = selectedImage;
        $('.bosses').html(enemyImage);
    }
    setInterval(ChangePOse, 80);

    // Spawn enemies at random intervals and positions
    function spawnEnemiesRandomly() {
        // Do not schedule if spawning disabled or game not active
        if (!flases[2] || !flases[1]) return;

        if (flases[2]) {
            for (let i = 0; i < 2; i++) {
                let delay = Math.random() * 3000 + 1000; // Random delay between 1 and 4 seconds
                let topPosition = Math.random() * (container.clientHeight - 50); // Random top position

                setTimeout(() => {
                    createEnemy(topPosition);
                }, delay);
            }
        }
    }

    function moveEnemies() {
        const barriers = document.querySelectorAll('.standin, .st2, .st3'); // Select all barriers

        enemies.forEach((enemy, index) => {
            let enemyRect = enemy.getBoundingClientRect();

            // Move enemies slowly from right to left (toward the gun)
            let newLeft = parseInt(enemy.style.left) - 1; // Move 1px to the left
            let newTop = parseInt(enemy.style.top); // Current top position

            // Check if the enemy is near any barrier
            let avoidBarrier = false;
            barriers.forEach(barrier => {
                let barrierRect = barrier.getBoundingClientRect();

                if (
                    enemyRect.right > barrierRect.left &&
                    enemyRect.left < barrierRect.right &&
                    enemyRect.bottom > barrierRect.top &&
                    enemyRect.top < barrierRect.bottom
                ) {
                    avoidBarrier = true;
                }
            });

            // Adjust enemy movement if a barrier is detected
            if (avoidBarrier) {
                newTop += Math.random() > 0.3 ? -10 : 7;
            }

            // Update enemy position
            enemy.style.left = `${newLeft}px`;
            enemy.style.top = `${newTop}px`;

            inOut();

            // Remove enemy if it goes out of bounds (left side)
            if (newLeft < 250) {
                $('.fire').show();
                setTimeout(function () {
                    $('.fire').hide();
                }, 100);
                lowing[0] -= 2;
                healthSoldier.style.width = `${lowing[0]}%`;
                if (enemy.parentNode === container) {
                    container.removeChild(enemy);
                }
                enemies.splice(index, 1); // Remove enemy from array
            }
        });
    }

    setInterval(moveEnemies, 5);

    function rotateGun(angle) {
        gunAngle += angle;

        if (gunAngle > 40) {
            gunAngle = 40;
        } else if (gunAngle < -40) {
            gunAngle = -40;
        }

        bullet.style.transform = `rotate(${gunAngle}deg)`;
        gun.style.transform = `rotate(${gunAngle}deg)`;
    }

    function shoot() {
        // Clear any ongoing bullet movement
        if (bulletInterval) clearInterval(bulletInterval);

        const gunRect = gun.getBoundingClientRect();

        // Calculate the gun barrel tip position (right end of the gun)
        const gunTipX = gunRect.right - 60;
        const gunTipY = gunRect.top - 75;

        // Set the bullet's position to the gun's tip
        bullet.style.left = `${gunTipX}px`;
        bullet.style.top = `${gunTipY}px`;
        bullet.style.display = 'block';

        // Calculate the angle in radians
        let angleInRadians = gunAngle * (Math.PI / 180);
        let bulletX = gunTipX;
        let bulletY = gunTipY;

        bulletInterval = setInterval(() => {
            bulletX += bulletSpeed * Math.cos(angleInRadians);
            bulletY += bulletSpeed * Math.sin(angleInRadians);
            bullet.style.left = `${bulletX}px`;
            bullet.style.top = `${bulletY}px`;

            // Get the bullet's bounding rectangle
            const bulletRect = bullet.getBoundingClientRect();

            // Collision detection with barriers
            barriers.forEach(barrier => {
                const barrierRect = barrier.getBoundingClientRect();

                if (
                    bulletRect.right >= barrierRect.left &&
                    bulletRect.left <= barrierRect.right &&
                    bulletRect.bottom >= barrierRect.top &&
                    bulletRect.top <= barrierRect.bottom
                ) {
                    // Bullet hits the barrier
                    clearInterval(bulletInterval); // Stop the bullet's current movement
                    bulletDrop(bulletX, bulletY);  // Call function to drop the bullet
                }
            });

            // Collision detection with enemies
            enemies.forEach((enemy, index) => {
                const enemyRect = enemy.getBoundingClientRect();

                if (
                    bulletRect.right >= enemyRect.left &&
                    bulletRect.left <= enemyRect.right &&
                    bulletRect.bottom >= enemyRect.top &&
                    bulletRect.top <= enemyRect.bottom
                ) {
                    lowing[2]++;
                    lowing[3] += 5;
                    killcont.innerHTML = lowing[2];
                    coin.innerHTML = lowing[3];

                    // Remove enemy from DOM
                    if (enemy.parentNode === container) {
                        container.removeChild(enemy);
                    }
                    enemies.splice(index, 1); // Remove enemy from array
                    bullet.style.display = 'none'; // Hide the bullet
                    clearInterval(bulletInterval); // Stop bullet movement
                }
            });

            // Collision detection with the boss
            const bossRect = boss.getBoundingClientRect();

            if (
                bulletRect.right >= bossRect.left &&
                bulletRect.left <= bossRect.right &&
                bulletRect.bottom >= bossRect.top &&
                bulletRect.top <= bossRect.bottom
            ) {
                $('.bleed').show();
                setTimeout(function () {
                    $('.bleed').hide();
                }, 300);
                if (flases[3] === 2) {
                    lowing[1]--;
                }

                // Update the boss health bar
                healthBoss.style.width = `${lowing[1]}%`;

                bullet.style.display = 'none'; // Hide the bullet
                clearInterval(bulletInterval); // Stop bullet movement
            }

            // Stop if the bullet goes out of bounds
            if (
                bulletX > window.innerWidth ||
                bulletX < 0 ||
                bulletY > window.innerHeight ||
                bulletY < 0
            ) {
                bullet.style.display = 'none';
                clearInterval(bulletInterval);
            }
        }, 10); // Repeat bullet movement every 10ms
        inOut();
    }

    function laser() {
        // Boss laser only in phase 2
        if (flases[3] === 2) {
            const soldierRect = soldier.getBoundingClientRect();
            lase.style.display = 'block';

            let laserX = soldierRect.left - 110;
            let laserY = soldierRect.top - 140;

            setTimeout(() => {
                lase.style.left = `${laserX}px`;
                lase.style.top = `${laserY}px`;
                if (flases[0] && (laserX < soldierRect.right || laserX > soldierRect.left)) {

                    // Reduce soldier's health by 20 points
                    $(".aud").html(`<audio src="audio/young-man-being-hurt-95628.mp3" autoplay controls></audio>`);
                    $('.fire').show();
                    setTimeout(function () {
                        $('.fire').hide();
                    }, 100);
                    lowing[0] -= 20;
                    healthSoldier.style.width = `${lowing[0]}%`;
                    if (lowing[0] <= 20) {
                        lowing[0] = 0;
                        healthSoldier.style.width = `${lowing[0]}%`;
                    }
                }
            }, 400);

            setTimeout(() => {
                lase.style.left = `602px`;
                lase.style.top = `210px`;
                lase.style.display = 'none';
            }, 1000);
        }
    }

    setInterval(laser, 6500);

    function inOut() {
        if (lowing[2] === 50) {
            $(".aud").html(`<audio src="audio/natural-thunder-113219.mp3" autoplay controls></audio>`);
            $('.sky2').show();
            $('.sky1').hide();
            $('.born').show();
            $('.bosses').show();
            flases[1] = false;
            flases[2] = false;
            flases[4] = false;
            lowing[2] = +1;
            bosses.style.display = 'block';
            setTimeout(function () {
                $('.born').hide();
                $('.bosses').show();
                $('.sky2').hide();
                $('.sky1').show();
                flases[1] = true;
                flases[4] = true;
                flases[3] = 2;
                bosses.style.display = 'block';
                $(".aud").html(`  <audio src="audio/evil-laugh-89423.mp3" autoplay controls></audio>`);
            }, 10000);
        }
    }

    function gameTiming() {
        // Start from current timeinMin/timeinSec
        updateTimeDisplay();

        // Make sure no old timer is still running
        if (timerInterval) {
            clearInterval(timerInterval);
        }

        timerInterval = setInterval(function () {
            if (!flases[4]) {
                // If the timer is paused or not active, skip the decrement
                return;
            }

            if (timeinSec > 0) {
                timeinSec--;
            } else {
                if (timeinMin > 0) {
                    timeinMin--;
                    timeinSec = 59;
                } else {
                    // Time has run out; trigger game over
                    clearInterval(timerInterval);
                    timerInterval = null;

                    // Stop enemy spawning too
                    if (spawnInterval) {
                        clearInterval(spawnInterval);
                        spawnInterval = null;
                    }

                    $('.fire').show();
                    flases[1] = false;
                    flases[2] = false;
                    flases[3] = 1;
                    flases[4] = false;
                    flases[5] = false;

                    $('.soil1').hide();
                    $('.soil2').show();
                    $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);

                    // Remove any remaining enemies
                    enemies.forEach(enemy => {
                        if (enemy.parentNode) enemy.parentNode.removeChild(enemy);
                    });
                    enemies = [];

                    setTimeout(() => {
                        bosses.style.display = 'none';
                        $('.display').slideDown();
                        $('.fal').slideDown();
                        $('.suc').slideUp();
                        $('main').slideUp();

                        setTimeout(function () {
                            $('.display').slideUp();
                            $('.home').slideDown();
                        }, 3000);
                    }, 6000);

                    return;
                }
            }

            updateTimeDisplay();
        }, 1000);
    }

    function died() {
        if (!flases[5]) return;

        // Boss dead -> Win
        if (lowing[1] <= 0) {
            $('.born').show();
            flases[1] = false;
            flases[2] = false;
            flases[3] = 1;
            flases[4] = false;
            flases[5] = false;
            $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);

            if (spawnInterval) {
                clearInterval(spawnInterval);
                spawnInterval = null;
            }
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            enemies.forEach(enemy => {
                if (enemy.parentNode) enemy.parentNode.removeChild(enemy);
            });
            enemies = [];

            setTimeout(function () {
                bosses.style.display = 'none'; //
            }, 1000);
            setTimeout(() => {
                $('.display').slideDown();
                $('.fal').slideUp();
                $('.suc').slideDown();
                $('main').slideUp();
                setTimeout(function () {
                    $('.display').slideUp();
                    $('.home').slideDown();
                }, 3000);
            }, 6000);

        // Soldier dead -> Lose
        } else if (lowing[0] <= 0) {
            $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
            flases[1] = false;
            flases[2] = false;
            flases[3] = 1;
            flases[4] = false;
            flases[5] = false;
            $('.soil1').hide();
            $('.soil2').show();
            $('.fire').show();

            if (spawnInterval) {
                clearInterval(spawnInterval);
                spawnInterval = null;
            }
            if (timerInterval) {
                clearInterval(timerInterval);
                timerInterval = null;
            }

            enemies.forEach(enemy => {
                if (enemy.parentNode) enemy.parentNode.removeChild(enemy);
            });
            enemies = [];

            setTimeout(() => {
                $('.display').slideDown();
                $('.fal').slideDown();
                $('.suc').slideUp();
                $('main').slideUp();
                setTimeout(function () {
                    $('.display').slideUp();
                    $('.home').slideDown();
                }, 3000);
            }, 6000);
        }
    }
    setInterval(died, 1);

    // Function to make the bullet drop down after hitting a barrier
    function bulletDrop(bulletX, bulletY) {
        let dropInterval = setInterval(() => {
            bulletY += 5; // Move the bullet downward
            bullet.style.top = `${bulletY}px`;

            // Stop the bullet when it reaches the bottom of the container
            if (bulletY > container.clientHeight) {
                bullet.style.display = 'none'; // Hide the bullet
                clearInterval(dropInterval); // Stop the drop movement
            }
        }, 20); // Move the bullet down every 20ms
    }

    function crouch() {
        if (flases[0]) {
            $('.soil1').hide();
            $('.soil2').show();
            flases[0] = false;
        } else {
            $('.soil2').hide();
            $('.soil1').show();
            flases[0] = true;
        }
    }

    // FULL GAME RESET
    function reset() {
        // Stop loops from previous game
        if (spawnInterval) {
            clearInterval(spawnInterval);
            spawnInterval = null;
        }
        if (timerInterval) {
            clearInterval(timerInterval);
            timerInterval = null;
        }
        if (bulletInterval) {
            clearInterval(bulletInterval);
            bulletInterval = null;
        }

        // Remove all enemies from DOM
        enemies.forEach(enemy => {
            if (enemy.parentNode) enemy.parentNode.removeChild(enemy);
        });
        enemies = [];

        // Reset state
        lowing = [100, 100, 0, 0];
        flases = [true, true, true, 1, true, true];

        // Reset HUD
        killcont.innerHTML = lowing[2];
        coin.innerHTML = lowing[3];
        healthBoss.style.width = `${lowing[1]}%`;
        healthSoldier.style.width = `${lowing[0]}%`;

        // Reset timer
        timeinMin = 2;
        timeinSec = 30;
        updateTimeDisplay();

        // Reset visuals
        gunAngle = 0;
        gun.style.transform = 'rotate(0deg)';
        bullet.style.transform = 'rotate(0deg)';
        bullet.style.display = 'none';

        bosses.style.display = 'none';
        boss.style.display = 'none';
        $('.soil2').hide();
        $('.soil1').show();
        $('.fire').hide();
        $('.born').hide();
        $('.bleed').hide();
        lase.style.display = 'none';
    }

    // Arrow keys to rotate the gun / shoot / crouch
    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
                rotateGun(-5);
                break;
            case 'ArrowDown':
                rotateGun(5);
                break;
            case 'ArrowLeft':
                rotateGun(-5);
                break;
            case 'ArrowRight':
                rotateGun(5);
                break;
            case 'x': // shoot
                if (flases[0] && flases[1]) {
                    shoot();
                }
                break;
            case 'c': // crouch
                crouch();
                break;
        }
    });

    $('.p').click(function () {
        rotateGun(-5);
    });

    $('.d').click(function () {
        rotateGun(5);
    });

    $('.x').click(function () {
        if (flases[0] && flases[1]) {
            shoot();
        }
    });

    $('.c').click(function () {
        crouch();
    });

    $(".start").click(function () {
        // Full reset of any previous game
        reset();

        $(".home").hide();
        $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
        $(".hide").slideDown();

        setTimeout(function () {
            // Start enemy spawning and timer once
            spawnInterval = setInterval(spawnEnemiesRandomly, 2000);
            flases[4] = true; // allow timer to run
            gameTiming();

            $(".hide").slideUp();
            $("main").slideDown();
        }, 3500);
    });

    $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
});