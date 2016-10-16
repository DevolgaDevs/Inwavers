// Inits
window.onload = function init() {
    var game = new GF();
    game.start();
};

var GF = function () {

    var assets = {};

    //Vars relative to the canvas
    var canvas, ctx, width = 1280, height = 800;

    //Vars for time based animation
    var delta, oldTime = 0;

    //Var for sound
    var backgroundSoundOn = true;

    //Vars for handling inputs
    var inputStates = {};

    //Vars of the ship
    var shipX = 10;
    var canon1Height = 13;
    var canon2Height = 51;

    //Speed of the shot of the ship
    var shotSpeed = 3000;

    //Speed of the shots of the monsters
    var monsterShotSpeed = 1000;

    //Intervals for calling monster functions
    var intervalMonsterSpawn;
    var intervalMonsterShoot;

    //Intervals Id to stop them when the game is over;
    var intervalMonsterSpawnId;
    var intervalMonsterShootId;

    //Global vars to save between every games
    var highScore = 0;

    //GameStates
    var gameStates = {
        gameRunning: 1,
        gameOver: 2
    };

    //Vars for controller (tested with Xbox 360)
    var controllers = {};

    //Current game
    var currentScore;
    var enemyArray;
    var currentGameState;
    var shotArray;
    var enemyShotArray;


    function showGameOver() {
        showImage(ctx, assets.gameOverImage, 300, 150, 650, 300);
        writeText(ctx, currentScore, 500, 348, 5, "White");
    }

    function drawObjects() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        drawShip(ctx, assets, ship);
        drawShipFire(ctx, assets, shotArray);
        drawEnemies(ctx, assets, enemyArray);
        drawEnemyFire(ctx, assets, enemyShotArray);
        drawGameText(ctx, currentScore, highScore, ship.getLife(), width);
    }

    function startNewGame() {
        ship = new Ship(shipX, 100, 75, 75, assets.shipImage, 3, 500);

        if (currentScore > highScore) {
            highScore = currentScore;
        }

        currentScore = 0;
        enemyArray = [];
        shotArray = [];
        enemyShotArray = [];
        intervalMonsterSpawn = 2000;
        intervalMonsterShoot = 1000;
        currentGameState = gameStates.gameRunning;

        startMonsterSpawner();
        startShotsSpawner();

    }

    function Drawable(x1, y1, w1, h1, asset) {
        var x = x1, y = y1, w = w1, h = h1;

        function draw(ctx) {
            ctx.save();
            ctx.drawImage(asset, x, y, w, h);
            ctx.restore();
        }

        function getWidth() {
            return w;
        }

        function getHeight() {
            return h;
        }

        function getX() {
            return x;
        }

        function setX(x2) {
            x = x2;
        }

        function getY() {
            return y;
        }

        function setY(y2) {
            y = y2;
        }

        //From the assets array
        function getAsset() {
            return asset;
        }

        return {
            draw: draw,
            getX: getX,
            getY: getY,
            setX: setX,
            setY: setY,
            getWidth: getWidth,
            getHeight: getHeight,
            getAsset: getAsset
        }
    }

    function Ship(x, y, w, h, asset, life1, speed1) {
        var api = new Drawable(x, y, w, h, asset);
        var life = life1;
        var speed = speed1;
        var shoot = false;

        api.getSpeed = function () {
            return speed;
        }

        api.setSpeed = function (speed1) {
            life = life1;
        }

        api.getLife = function () {
            return life;
        }
        /*
        api.setLife = function (life1) {
            life = life1;
        }
        */

        api.loseLife = function (lifeLost) {
            if (life - lifeLost < 0) {
                life = 0;
            } else {
                life -= lifeLost;
            }

        }

        api.getShoot = function () {
            return shoot;
        }

        api.setShoot = function (shoot1) {
            shoot = shoot1;
        }

        return api;
    }

    function Enemy(x, y, w, h, asset, life, speed, monsterNumber1) {
        var api = new Ship(x, y, w, h, asset, life, speed);
        var monsterNumber = monsterNumber1;

        api.getMonsterNumber = function () {
            return monsterNumber;
        }

        return api;
    }

    function timer(currentTime) {
        var delta = currentTime - oldTime;
        oldTime = currentTime;
        return delta;
    }

    var mainLoop = function (time) {
        delta = timer(time);
        

        if (controllers.length > 0) {
            updateGamePadStatus();
        }

        switch (currentGameState) {
            case gameStates.gameRunning:
                updateObjects(delta);
                drawObjects();
                break;

            case gameStates.gameOver:
                showGameOver();
                updateGameOver();
                break;

        }

        requestAnimationFrame(mainLoop);
    }

    function gameOver() {
        playSound(assets.sound_gameover);
        enemyArray = [];
        shotArray = [];
        enemyShotArray = [];
        stopMonsterSpawners();
        currentGameState = gameStates.gameOver;
        showGameOver();
    }

    function updateGameOver() {
        if (inputStates.space || inputStates.gamepadstart) {
            startNewGame();
        }
    }

    function updateObjects(delta) {
        updateShip(delta, inputStates, ship, width, height);
        updateShipFire(ship.getShoot(), delta, shotArray, enemyArray, width, shotSpeed);
        updateEnemies(delta, enemyArray);
        updateEnemyFire(delta, enemyShotArray, ship, monsterShotSpeed);
    }

    function correctOutOfScreen(drawable) {
        if (drawable.getX() < 0) {
            drawable.setX(0);
        }
        if (drawable.getY() < 0) {
            drawable.setY(0);
        }
        if (drawable.getX() > width - drawable.getWidth()) {
            drawable.setX(width - drawable.getWidth());
        }
        if (drawable.getY() > height - drawable.getHeight()) {
            drawable.setY(height - drawable.getHeight());
        }
    }

    function shipFire(shotArray, ship) {
        //Create 2 shots for our ship starting from the canons
        shotArray.push(new Drawable(ship.getX() + ship.getWidth(), ship.getY() + canon1Height, assets.laserImage.width, assets.laserImage.height, assets.laserImage));
        shotArray.push(new Drawable(ship.getX() + ship.getWidth(), ship.getY() + canon2Height, assets.laserImage.width, assets.laserImage.height, assets.laserImage));

        //Play shoot sound
        playSound(assets.sound_fireshot);
    }

    function shipIsHit(ship) {
        ship.loseLife(1);
        playSound(assets.sound_enemyfirehit);

        if (ship.getLife() == 0) {
            gameOver();
        }
    }

    function updateShip(delta, inputStates, ship) {
        speedY = 0;

        // check inputStates
        if (inputStates.up || inputStates.gamepadup || inputStates.gamepadaxisup) {
            speedY = -ship.getSpeed();
        }
        if (inputStates.down || inputStates.gamepaddown || inputStates.gamepadaxisdown) {
            speedY = ship.getSpeed();
        }
        if (inputStates.space || inputStates.gamepadspace) {
            ship.setShoot(true);
        } else {
            ship.setShoot(false);
        }
        ship.setY(ship.getY() + calcDistanceToMove(delta, speedY));

        correctOutOfScreen(ship);

    }

    // We want the rectangle to move at speed pixels/s (there are 60 frames in a second)
    // If we are really running at 60 frames/s, the delay between frames should be 1/60
    // = 16.66 ms, so the number of pixels to move = (speed * del)/1000. If the delay is twice
    // longer, the formula works : let's move the rectangle twice longer!
    var calcDistanceToMove = function (delta, speed) {
        return (speed * delta) / 1000;
    };
    function updateEnemies(delta, enemyArray) {
        for (var i = 0; i < enemyArray.length; i++) {
            enemyArray[i].setX(enemyArray[i].getX() - calcDistanceToMove(delta, enemyArray[i].getSpeed()));
        }
    }

    function updateShipFire(createShot, delta, shotArray, enemyArray, width, shotSpeed) {
        var enemyHit = false;
        if (createShot && !isShipFiring(shotArray)) {
            shipFire(shotArray, ship);
        } else {
            for (var i = 0; i < shotArray.length; i++) {
                shotArray[i].setX(shotArray[i].getX() + calcDistanceToMove(delta, shotSpeed));

                for (var j = 0; j < enemyArray.length; j++) {
                    if (typeof shotArray[i] != 'undefined') {
                        if (rectsOverlap(shotArray[i].getX(), shotArray[i].getY(), shotArray[i].getWidth(), shotArray[i].getHeight(),
                            enemyArray[j].getX(), enemyArray[j].getY(), enemyArray[j].getWidth(), enemyArray[j].getHeight())) {
                            //Enemy dies
                            currentScore += 100;
                            shotArray.splice(i, 1);
                            enemyArray.splice(j, 1);
                            playSound(assets.sound_enemydeath);
                            enemyHit = true;
                        }
                    }
                }

                if (!enemyHit && shotArray[i].getX() >= width) {
                    //Delete shoot if out of canvas
                    shotArray.splice(i, 1);
                }
            }
        }
    }

    function updateEnemyFire(delta, enemyShotArray, ship, monsterShotSpeed) {
        for (var i = 0; i < enemyShotArray.length; i++) {
            enemyShotArray[i].setX(enemyShotArray[i].getX() - calcDistanceToMove(delta, monsterShotSpeed));

            //If ship is hit by enemy shot
            if (rectsOverlap(enemyShotArray[i].getX(), enemyShotArray[i].getY(), enemyShotArray[i].getWidth(), enemyShotArray[i].getHeight(),
                ship.getX(), ship.getY(), ship.getWidth(), ship.getHeight())) {
                enemyShotArray.splice(i, 1);
                shipIsHit(ship);
            } else if (enemyShotArray[i].getX() <= 0) {
                //Delete shoot if out of canvas
                enemyShotArray.splice(i, 1);
            }

        }
    }




    //Create 1 shot starting at the middle of every monster
    function monsterFire() {
        for (var i = 0; i < enemyArray.length; i++) {


            var laserImage;
            switch (enemyArray[i].getMonsterNumber()) {
                case 1:
                    laserImage = assets.monster1LaserImage;
                    break;
                case 2:
                    laserImage = assets.monster2LaserImage;
                    break;
                case 3:
                    laserImage = assets.monster3LaserImage;
                    break;

                default:
                    laserImage = assets.monster1LaserImage;
                    break;
            }

            enemyShotArray.push(new Drawable(enemyArray[i].getX(), enemyArray[i].getY() + (enemyArray[i].getHeight() / 2) - (laserImage.height / 2), laserImage.width, laserImage.height, laserImage));
        }

        playSound(assets.sound_enemyfireshot);
    }





    //A monster will be created every intervalMonsterSpawnId milliseconds
    //We use setTimeout to be able to modify the time easily, it seems harder with setinterval
    function startMonsterSpawner() {
        //Decrease monster spawn time every time a new one is created to a minimum of 0.5 seconds
        if (intervalMonsterSpawn > 500) {
            intervalMonsterSpawn -= 10;
        }

        createEnemy();

        intervalMonsterSpawnId = setTimeout(function () { startMonsterSpawner(); }, intervalMonsterSpawn);
    }

    //Monster will shoot every intervalMonsterShoot milliseconds
    function startShotsSpawner() {
        if (intervalMonsterShoot > 500) {
            intervalMonsterShoot -= 1;
        }

        monsterFire();

        intervalMonsterShootId = setTimeout(function () { startShotsSpawner(); }, intervalMonsterShoot);
    }

    //Stop the spawn of monsters and monsters shot by stopping the setTimeout;
    function stopMonsterSpawners() {
        clearTimeout(intervalMonsterSpawnId);
        clearTimeout(intervalMonsterShootId);
    }

    function createEnemy() {
        var monster1 = {
            life: 2,
            speed: 200,
            monsterNumber: 1
        }
        var monster2 = {
            life: 1,
            speed: 275,
            monsterNumber: 2
        }
        var monster3 = {
            life: 1,
            speed: 325,
            monsterNumber: 3
        }
        var DAMONSTER;
        var enemyAsset;
        var random = getRandomInt(1, 3);

        if (random === 1) {
            DAMONSTER = monster1;
            enemyAsset = assets.monster1Image;
        } else if (random === 2) {
            DAMONSTER = monster2;
            enemyAsset = assets.monster2Image;
        } else {
            DAMONSTER = monster3;
            enemyAsset = assets.monster3Image;
        }

        var randomY = getRandomInt(0, height - enemyAsset.height);

        var enemy = new Enemy(width - 1, randomY, enemyAsset.width, enemyAsset.height, enemyAsset, DAMONSTER.life, DAMONSTER.speed, DAMONSTER.monsterNumber);
        enemyArray.push(enemy);
    }

    function playSound(sound) {
        sound.play();
    }

    function stopSound(sound) {
        sound.stop();
    }

    function toggleBackgroundSound() {
        if (backgroundSoundOn) {
            stopSound(assets.sound_bg);
            backgroundSoundOn = false;
        } else {
            playSound(assets.sound_bg);
            backgroundSoundOn = true;
        }
    }


    //Called every frame to move the ship.
    function updateGamePadStatus() {
        scangamepads();

        if(typeof controllers[0] != "undefined"){
        var up = controllers[0].buttons[12];
        var bottom = controllers[0].buttons[13];
        var a = controllers[0].buttons[0];
        var start = controllers[0].buttons[9];
        var verticalAxis = controllers[0].axes[1];

        if (up.value == 1) {
            inputStates.gamepadup = true;
        } else {
            inputStates.gamepadup = false;
        }

        if (bottom.value == 1) {
            inputStates.gamepaddown = true;
        } else {
            inputStates.gamepaddown = false;
        }

        if (a.value == 1) {
            inputStates.gamepadspace = true;
        } else {
            inputStates.gamepadspace = false;
        }

        if (start.value == 1) {
            inputStates.gamepadstart = true;
        } else {
            inputStates.gamepadstart = false;
        }

        if (verticalAxis < -0.25) {
            inputStates.gamepadaxisup = true;
        } else {
            inputStates.gamepadaxisup = false;
        }

        if (verticalAxis > 0.25) {
            inputStates.gamepadaxisdown = true;
        } else {
            inputStates.gamepadaxisdown = false;
        }
        }


    }

    function disconnecthandler(e) {
        delete controllers[gamepad.index];
    }

    function connecthandler(e) {
        addgamepad(e);
    }

    function addgamepad(gamepad) {
        controllers[gamepad.index] = gamepad;
    }

    function allAssetsLoaded(assetsLoaded) {
        console.log("all samples loaded and decoded");
        for (var asset in assetsLoaded) {
            assets[asset] = assetsLoaded[asset];
        }
    }

    function scangamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
        for (var i = 0; i < gamepads.length; i++) {
            if (gamepads[i]) {
                if (!(gamepads[i].index in controllers)) {
                    addgamepad(gamepads[i]);
                } else {
                    controllers[gamepads[i].index] = gamepads[i];
                }
            }
        }
    }


    var start = function () {

        // Canvas, context etc.
        canvas = document.querySelector("#myCanvas");
        ctx = canvas.getContext("2d");
        // default policy for text
        //ctx.font = "20px Arial";

        //Check if a gamepad is connected
        controllers = navigator.getGamepads();
        if(controllers.length > 0){console.log("gamepad ok")};

        //Keyboard keydown listener
        window.addEventListener("keydown", function (event) {
            if (event.keyCode === 37) {
                inputStates.left = true;
            } else if (event.keyCode === 38) {
                inputStates.up = true;
            } else if (event.keyCode === 39) {
                inputStates.right = true;
            } else if (event.keyCode === 40) {
                inputStates.down = true;
            } else if (event.keyCode === 32) {
                inputStates.space = true;
            } else if (event.keyCode === 77) {
                toggleBackgroundSound();
            }
        }, false);

        //Keyboard keyup listener
        window.addEventListener("keyup", function (event) {
            if (event.keyCode === 37) {
                inputStates.left = false;
            } else if (event.keyCode === 38) {
                inputStates.up = false;
            } else if (event.keyCode === 39) {
                inputStates.right = false;
            } else if (event.keyCode === 40) {
                inputStates.down = false;
            } else if (event.keyCode === 32) {
                inputStates.space = false;
            }
        }, false);

        //Events for the gamepad
        window.addEventListener("webkitgamepadconnected", connecthandler);
        window.addEventListener("webkitgamepaddisconnected", disconnecthandler);

        loadAssets(function (assets) {
            // all assets (images, sounds) loaded, we can start the animation
            allAssetsLoaded(assets);
            //Start background music
            playSound(assets.sound_bg);
            startNewGame();
            requestAnimationFrame(mainLoop);
        });
    };

    //our GameFramework returns a public API visible from outside its scope
    return {
        start: start
    };
}