$(document).ready(function () {
    // flases: [standing, canShoot, spawnEnemies, bossPhase, timerActive, gameRunning]
    let flases = [true, true, true, 1, true, true];
    // lowing: [soldierHealth%, bossHealth%, kills, coins]
    let lowing = [100, 100, 0, 0];
    let gunAngle = 0;
    let bulletInterval;
    let enemies = [];

    // Global timer values
    let timeinMin = 2;
    let timeinSec = 30;

    // DOM references
    const killcont = document.querySelector('.hit span');
    const coin = document.querySelector('.coin span');
    const time = document.querySelector('.time span');
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
    const shadowMan = document.querySelector('.shadow-man');

    const bulletSpeed = 40;

    // Layout metrics for responsiveness (container position/size)
    let containerRect = container.getBoundingClientRect();
    function updateLayoutMetrics() {
        containerRect = container.getBoundingClientRect();
    }
    window.addEventListener('resize', updateLayoutMetrics);
    updateLayoutMetrics();

    // ================= ENEMIES =================
    function createEnemy(topPosition) {
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
        enemyImage.src = enemyImages[randomImageIndex];
        enemy.appendChild(enemyImage);

        enemy.style.top = `${topPosition}px`;
        enemy.style.left = `${container.clientWidth + 50}px`; // Start just outside the right
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
        enemyImage.src = enemyImages[randomImageIndex];
        $('.bosses').html(enemyImage);
    }
    setInterval(ChangePOse, 80);

    function spawnEnemiesRandomly() {
        if (flases[2]) {
            for (let i = 0; i < 2; i++) {
                const delay = Math.random() * 3000 + 1000; // 1–4 seconds
                const maxTop = container.clientHeight - 50;
                const topPosition = Math.random() * (maxTop > 0 ? maxTop : 0);

                setTimeout(() => {
                    createEnemy(topPosition);
                }, delay);
            }
        }
    }

    function moveEnemies() {
        const soldierRect = shadowMan.getBoundingClientRect();

        enemies.forEach((enemy, index) => {
            let currentLeft = parseFloat(enemy.style.left) || 0;
            let currentTop = parseFloat(enemy.style.top) || 0;

            let newLeft = currentLeft - 1; // move left
            let newTop = currentTop;

            let enemyRect = enemy.getBoundingClientRect();

            // Avoid barriers
            let avoidBarrier = false;
            barriers.forEach(barrier => {
                const barrierRect = barrier.getBoundingClientRect();
                if (
                    enemyRect.right > barrierRect.left &&
                    enemyRect.left < barrierRect.right &&
                    enemyRect.bottom > barrierRect.top &&
                    enemyRect.top < barrierRect.bottom
                ) {
                    avoidBarrier = true;
                }
            });

            if (avoidBarrier) {
                newTop += Math.random() > 0.3 ? -10 : 7;
            }

            enemy.style.left = `${newLeft}px`;
            enemy.style.top = `${newTop}px`;

            // Recalculate rect
            enemyRect = enemy.getBoundingClientRect();

            // Enemy hits player (responsive)
            if (
                enemyRect.right > soldierRect.left &&
                enemyRect.left < soldierRect.right &&
                enemyRect.bottom > soldierRect.top &&
                enemyRect.top < soldierRect.bottom
            ) {
                $('.fire').show();
                setTimeout(() => $('.fire').hide(), 100);

                lowing[0] -= 2;
                if (lowing[0] < 0) lowing[0] = 0;
                healthSoldier.style.width = `${lowing[0]}%`;

                container.removeChild(enemy);
                enemies.splice(index, 1);
                return;
            }

            // Delete when out of container to the left
            if (enemyRect.right < containerRect.left) {
                container.removeChild(enemy);
                enemies.splice(index, 1);
            }
        });

        inOut();
    }

    setInterval(moveEnemies, 5);

    // ================= GUN & BULLET =================
    function rotateGun(angle) {
        gunAngle += angle;
        if (gunAngle > 40) gunAngle = 40;
        if (gunAngle < -40) gunAngle = -40;

        bullet.style.transform = `rotate(${gunAngle}deg)`;
        gun.style.transform = `rotate(${gunAngle}deg)`;
    }

    function shoot() {
        clearInterval(bulletInterval);

        const gunRect = gun.getBoundingClientRect();

        // Gun tip = right center of gun
        const gunTipX = gunRect.right;
        const gunTipY = gunRect.top + gunRect.height / 2;

        let bulletX = gunTipX;
        let bulletY = gunTipY;

        bullet.style.left = `${bulletX}px`;
        bullet.style.top = `${bulletY}px`;
        bullet.style.display = 'block';

        const angleInRadians = gunAngle * (Math.PI / 180);

        bulletInterval = setInterval(() => {
            bulletX += bulletSpeed * Math.cos(angleInRadians);
            bulletY += bulletSpeed * Math.sin(angleInRadians);
            bullet.style.left = `${bulletX}px`;
            bullet.style.top = `${bulletY}px`;

            const bulletRect = bullet.getBoundingClientRect();

            // Bullet vs barriers
            barriers.forEach(barrier => {
                const barrierRect = barrier.getBoundingClientRect();
                if (
                    bulletRect.right >= barrierRect.left &&
                    bulletRect.left <= barrierRect.right &&
                    bulletRect.bottom >= barrierRect.top &&
                    bulletRect.top <= barrierRect.bottom
                ) {
                    clearInterval(bulletInterval);
                    bulletDrop(bulletX, bulletY);
                }
            });

            // Bullet vs enemies
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
                    killcont.textContent = lowing[2];
                    coin.textContent = lowing[3];

                    container.removeChild(enemy);
                    enemies.splice(index, 1);

                    bullet.style.display = 'none';
                    clearInterval(bulletInterval);
                }
            });

            // Bullet vs boss
            const bossRect = boss.getBoundingClientRect();
            if (
                bulletRect.right >= bossRect.left &&
                bulletRect.left <= bossRect.right &&
                bulletRect.bottom >= bossRect.top &&
                bulletRect.top <= bossRect.bottom
            ) {
                $('.bleed').show();
                setTimeout(() => $('.bleed').hide(), 300);

                if (flases[3] === 2) {
                    lowing[1]--;
                    if (lowing[1] < 0) lowing[1] = 0;
                    healthBoss.style.width = `${lowing[1]}%`;
                }

                bullet.style.display = 'none';
                clearInterval(bulletInterval);
            }

            // Out of container bounds
            if (
                bulletRect.right > containerRect.right ||
                bulletRect.left < containerRect.left ||
                bulletRect.bottom > containerRect.bottom ||
                bulletRect.top < containerRect.top
            ) {
                bullet.style.display = 'none';
                clearInterval(bulletInterval);
            }
        }, 10);

        inOut();
    }

    function bulletDrop(bulletX, bulletY) {
        const dropInterval = setInterval(() => {
            bulletY += 5;
            bullet.style.top = `${bulletY}px`;

            const bulletRect = bullet.getBoundingClientRect();
            if (bulletRect.bottom > containerRect.bottom) {
                bullet.style.display = 'none';
                clearInterval(dropInterval);
            }
        }, 20);
    }

    // ================= LASER (BOSS ATTACK) =================
    function laser() {
        // Only shoot laser during boss phase
        if (flases[3] !== 2) return;

        const soldierRect = soldier.getBoundingClientRect();
        lase.style.display = 'block';

        const laserX = soldierRect.left - 110;
        const laserY = soldierRect.top - 140;

        setTimeout(() => {
            lase.style.left = `${laserX}px`;
            lase.style.top = `${laserY}px`;

            // Hit soldier if standing
            if (
                flases[0] &&
                laserX < soldierRect.right &&
                laserX > soldierRect.left
            ) {
                $(".aud").html(`<audio src="audio/young-man-being-hurt-95628.mp3" autoplay controls></audio>`);
                $('.fire').show();
                setTimeout(() => $('.fire').hide(), 100);

                lowing[0] -= 20;
                if (lowing[0] < 0) lowing[0] = 0;
                healthSoldier.style.width = `${lowing[0]}%`;
            }
        }, 400);

        setTimeout(() => {
            lase.style.display = 'none';
        }, 1000);
    }

    setInterval(laser, 6500);

    // ================= GAME STATE / BOSS SPAWN =================
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
            lowing[2] = +1; // (kept as in your original code)
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
                $(".aud").html(`<audio src="audio/evil-laugh-89423.mp3" autoplay controls></audio>`);
            }, 10000);
        }
    }

    // ================= TIMER =================
    function gameTiming() {
        timeinMin = 2;
        timeinSec = 30;

        function updateDisplay() {
            const displayMin = timeinMin < 10 ? `0${timeinMin}` : timeinMin;
            const displaySec = timeinSec < 10 ? `0${timeinSec}` : timeinSec;
            time.textContent = `${displayMin}:${displaySec}`;
        }

        updateDisplay();

        const timerInterval = setInterval(function () {
            if (!flases[4]) {
                return; // paused
            }

            if (timeinSec > 0) {
                timeinSec--;
            } else if (timeinMin > 0) {
                timeinMin--;
                timeinSec = 59;
            } else {
                // Time over
                clearInterval(timerInterval);

                $('.fire').show();
                flases[1] = false;
                flases[4] = false;
                flases[3] = 1;
                $('.soil1').hide();
                $('.soil2').show();
                $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);

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

            updateDisplay();
        }, 1000);
    }

    // ================= DEATH / WIN CHECK =================
    function died() {
        if (flases[5]) {
            if (lowing[1] <= 0) {
                // Boss dead => win
                $('.born').show();
                flases[1] = false;
                flases[4] = false;
                flases[5] = false;
                flases[3] = 1;
                $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
                setTimeout(function () {
                    bosses.style.display = 'none';
                }, 1000);
                setTimeout(() => {
                    timeinMin = 2;
                    timeinSec = 60;
                    $('.display').slideDown();
                    $('.fal').slideUp();
                    $('.suc').slideDown();
                    $('main').slideUp();
                    setTimeout(function () {
                        $('.display').slideUp();
                        $('.home').slideDown();
                    }, 3000);
                }, 6000);
            } else if (lowing[0] <= 0) {
                // Soldier dead => lose
                $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
                flases[1] = false;
                flases[4] = false;
                flases[5] = false;
                flases[3] = 1;
                $('.soil1').hide();
                $('.soil2').show();
                $('.fire').show();
                setTimeout(() => {
                    timeinMin = 2;
                    timeinSec = 60;
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
    }
    setInterval(died, 1);

    // ================= PLAYER ACTIONS =================
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

    function reset() {
        lowing = [100, 100, 0, 0];
        flases = [true, true, true, 1, true, true];
        healthBoss.style.width = `${lowing[1]}%`;
        healthSoldier.style.width = `${lowing[0]}%`;
        bosses.style.display = 'none';
        gunAngle = 0;
        timeinMin = 2;
        timeinSec = 30;
        $('.soil2').hide();
        $('.soil1').show();
        $('.fire').hide();
    }

    window.addEventListener('keydown', (e) => {
        switch (e.key) {
            case 'ArrowUp':
            case 'ArrowLeft':
                rotateGun(-5);
                break;
            case 'ArrowDown':
            case 'ArrowRight':
                rotateGun(5);
                break;
            case 'x':
                if (flases[0] && flases[1]) {
                    shoot();
                }
                break;
            case 'c':
                crouch();
                break;
        }
    });




    // ================= START BUTTON =================
    $('.start').click(function () {
        reset();
        $('.home').hide();
        $('.aud').html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
        $('.hide').slideDown();
        setTimeout(function () {
            setInterval(spawnEnemiesRandomly, 2000);
            gameTiming();
            $('.hide').slideUp();
            $('main').slideDown();
            reset();
        }, 3500);
    });


    $('.p').click(function () {
        rotateGun(-5);
    })

    $('.d').click(function () {
        rotateGun(5);
    })
    $('.x').click(function () {
        if (flases[0] && flases[1]) {
            shoot();
        }
    })
    $('.c').click(function () {
        crouch();
    })


    // Default background audio
    $('.aud').html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`);
});