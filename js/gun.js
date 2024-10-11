
const bullet = document.querySelector('.bul');
const bulletSpeed = 40
$(document).ready(function () {
    let flases = [true, true, true, 1, true,true]
    let lowing = [100, 100, 0, 0];
    let gunAngle = 0;
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
    let bulletInterval;

   
    // Array to store enemies
    let enemies = [];


    // Function to create an enemy
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
        const selectedImage = enemyImages[randomImageIndex];

        enemyImage.src = selectedImage;
        enemy.appendChild(enemyImage);

        // const enemies = querySelectorAll('.enemy')
        enemy.style.top = `${topPosition}px`;
        enemy.style.left = `${container.clientWidth + 50}px`; // Start outside the right side of the container
        container.appendChild(enemy);
        enemies.push(enemy);
        // for(e = 0 ; e < enemie.length; e++){
        //    e.
        // }


    }

    function ChangePOse() {
        //   const enemy =  document.querySelector('.bosses');
        const enemyImage = document.createElement('img');
        const enemyImages = [
            'img/F-chara Dragon knight07.png',
            'img/F-chara Dragon knight09.png'
        ];

        const randomImageIndex = Math.floor(Math.random() * enemyImages.length);
        const selectedImage = enemyImages[randomImageIndex];
        enemyImage.src = selectedImage;
        $('.bosses').html(enemyImage)
    }
    setInterval(ChangePOse, 80)


    // Spawn enemies at random intervals and positions
    function spawnEnemiesRandomly() {

        if (flases[2]) {
            for (let i = 0; i < 2; i++) {
                // Random delay for enemy appearance
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

                // Check if the enemy is within a "danger zone" near the barrier
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
                // Move the enemy up or down to avoid the barrier
                newTop += Math.random() > 0.3 ? -10 : 7;
            }

            // Update enemy position
            enemy.style.left = `${newLeft}px`;
            enemy.style.top = `${newTop}px`;

            inOut()
            // Remove enemy if it goes out of bounds (left side)
            if (newLeft < 250) {
                $('.fire').show()
                setTimeout(function () {
                    $('.fire').hide()
                }, 100)
                lowing[0] -= 2
                healthSoldier.style.width = `${lowing[0]}%`
                container.removeChild(enemy);
                enemies.splice(index, 1); // Remove enemy from array
            }
        });
    }
    // setInterval(moveEnemies, speed());

    setInterval(moveEnemies, 5)



    function rotateGun(angle) {
        // Add the angle to the current gun angle, but constrain it between -90 and 90 degrees
        gunAngle += angle;

        // Limit the gunAngle to a maximum of 90 degrees and a minimum of -90 degrees
        if (gunAngle > 40) {
            gunAngle = 40;
        } else if (gunAngle < -40) {
            gunAngle = -40;
        }

        // Apply the rotation to both the gun and the bullet
        bullet.style.transform = `rotate(${gunAngle}deg)`;
        gun.style.transform = `rotate(${gunAngle}deg)`;
    }



    function shoot() {
        clearInterval(bulletInterval); // Clear any ongoing bullet movement

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

                if (bulletRect.right >= enemyRect.left &&
                    bulletRect.left <= enemyRect.right &&
                    bulletRect.bottom >= enemyRect.top &&
                    bulletRect.top <= enemyRect.bottom) {

                    lowing[2]++
                    lowing[3] += 5
                    killcont.innerHTML = lowing[2]
                    coin.innerHTML = lowing[3]
                    // Remove enemy from DOM
                    container.removeChild(enemy);
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
                $('.bleed').show()
                setTimeout(function () {
                    $('.bleed').hide()
                }, 300)
                if (flases[3] === 2) {
                    lowing[1]--;
                }

                // Update the boss health bar
                healthBoss.style.width = `${lowing[1]}%`

                // Check if the boss is defeated


                bullet.style.display = 'none'; // Hide the bullet
                clearInterval(bulletInterval); // Stop bullet movement
            }

            // Stop if the bullet goes out of bounds
            if (bulletX > window.innerWidth || bulletX < 0 || bulletY > window.innerHeight || bulletY < 0) {
                bullet.style.display = 'none';
                clearInterval(bulletInterval);
            }
        }, 10); // Repeat bullet movement every 10ms
        inOut()
    }

    function laser() {
        // Get the current position of the soldier

        if (flases[3] === 2) {
            const soldierRect = soldier.getBoundingClientRect();
            lase.style.display = 'block';
            // Adjust the laser's position to target the soldier
            let laserX = soldierRect.left - 110;
            let laserY = soldierRect.top - 140;

            setTimeout(() => {
                lase.style.left = `${laserX}px`;
                lase.style.top = `${laserY}px`;
                if (flases[0] && laserX < soldierRect.right || laserX > soldierRect.left
                ) {

                    // Reduce soldier's health by 20 points
                    $(".aud").html(`<audio src="audio/young-man-being-hurt-95628.mp3" autoplay controls></audio>`)
                    $('.fire').show()
                    setTimeout(function () {
                        $('.fire').hide()
                    }, 100)
                    lowing[0] -= 20;
                    healthSoldier.style.width = `${lowing[0]}%`;
                    if (lowing[0] <= 20) {
                        lowing[0] = 0
                        healthSoldier.style.width = `${lowing[0]}%`;
                    }
                    // Check if health is depleted (game over condition)

                }
            }, 400)
            // Trigger the laser visually (show it briefly)


            setTimeout(() => {
                lase.style.left = `602px`;
                lase.style.top = `210px`;
                lase.style.display = 'none';
            }, 1000); // Laser will be visible for 500ms


        }
        // Check if the laser hits the soldier

    }

    setInterval(laser, 6500);



    function inOut() {
        if (lowing[2] === 50) {
            $(".aud").html(`<audio src="audio/natural-thunder-113219.mp3" autoplay controls></audio>`)
            $('.sky2').show()
            $('.sky1').hide()
            $('.born').show()
            $('.bosses').show()
            flases[1] = false
            flases[2] = false
            flases[4] = false
            lowing[2] = + 1
            bosses.style.display = 'block';
            setTimeout(function () {
                $('.born').hide()
                $('.bosses').show()
                $('.sky2').hide()
                $('.sky1').show()
                flases[1] = true
                flases[4] = true
                flases[3] = 2
                bosses.style.display = 'block';
                $(".aud").html(`  <audio src="audio/evil-laugh-89423.mp3" autoplay controls></audio>`)
            }, 10000)
        }
    }

    function gameTiming() {
        let timeinMin = 2;
        let timeinSec = 30;
    
        function updateDisplay() {
            const displayMin = timeinMin < 10 ? `0${timeinMin}` : timeinMin;
            const displaySec = timeinSec < 10 ? `0${timeinSec}` : timeinSec;
            time.innerHTML = `${displayMin}:${displaySec}`;
        }
    
        // Initial display update
        updateDisplay();
    
        const timerInterval = setInterval(function () {
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
                    clearInterval(timerInterval); // Stop the timer
    
                    // Display game over effects
                    $('.fire').show();
                    flases[1] = false;
                    flases[4] = false;
                    flases[3] = 1;
                    $('.soil1').hide();
                    $('.soil2').show();
                    $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`) 
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
    
                    return; // Exit the function to prevent further execution
                }
            }
    
            updateDisplay()
        }, 1000); 
    }
    
           
        


    

    function died() {
      if(flases[5]){
        if (lowing[1] <= 0) {
            $('.born').show()
            flases[1] = false
            flases[4] = false
            flases[5] = false
            flases[3] = 1
            $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`) 
            setTimeout(function () {
                bosses.style.display = 'none'; //
            }, 1000)
            setTimeout(() => {
                timeinMin = 2
                timeinSec = 60
                $('.display').slideDown()
                $('.fal').slideUp()
                $('.suc').slideDown()
                $('main').slideUp()
                setTimeout(function () {
                    $('.display').slideUp()
                    $('.home').slideDown()
                }, 3000)
            }, 6000);
        } else if (lowing[0] <= 0) {
            $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`) 
            flases[1] = false
            flases[4] = false
            flases[5] = false
            flases[3] = 1
            $('.soil1').hide()
            $('.soil2').show()
            $('.fire').show()
            setTimeout(() => {
                timeinMin = 2
                timeinSec = 60
                $('.display').slideDown()
                $('.fal').slideDown()
                $('.suc').slideUp()
                $('main').slideUp()
                setTimeout(function () {
                    $('.display').slideUp()
                    $('.home').slideDown()
                }, 3000)
            }, 6000);


        }
      }
    }
    setInterval(died, 1)

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
            $('.soil1').hide()
            $('.soil2').show()
            flases[0] = false
        } else {
            $('.soil2').hide()
            $('.soil1').show()
            flases[0] = true
        }
    }
    function reset (){
        lowing = [100, 100, 0, 0];
        flases = [true, true, true, 1, true,true]
        healthBoss.style.width = `${lowing[1]}%`
        healthSoldier.style.width = `${lowing[0]}%`
        bosses.style.display = 'none'; //
        gunAngle = 0;
        timeinMin = 2;
        timeinSec = 30;
        $('.soil2').hide()
        $('.soil1').show()
        $('.fire').hide()
    }
    // Arrow keys to rotate the gun
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
            case 'x': // Use 'x' to shoot
                if (flases[0] && flases[1]) {   
                    shoot();
                }
                break;
            case 'c': // Use 'b' to throw a bomb
                crouch();
                break;
        }
    });

    $(".start").click(function () {
        reset()
        $(".home").hide()
        $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`) 
        $(".hide").slideDown()
        setTimeout(function () {
            setInterval(spawnEnemiesRandomly, 2000);
            gameTiming()
            $(".hide").slideUp()
            $("main").slideDown()
            reset()
        }, 3500)
    })
    $(".aud").html(` <audio src="audio/Amaarae-Sad-Girlz-Luv-Money-(TrendyBeatz.com).mp3" autoplay controls></audio>`)    

});
