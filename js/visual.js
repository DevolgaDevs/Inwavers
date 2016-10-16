function drawGameText(ctx, currentScore, highScore, shipLife, width) {
    var greenColor = "rgb(61, 255, 70)";
    writeText(ctx, "SCORE : " + currentScore, 950, 20, 5, greenColor);
    writeText(ctx, "HI-SCORE : " + highScore, 700, 20, 5, greenColor);
    writeText(ctx, "Life : " + shipLife, width - 100, 20, 5, greenColor);
}

function writeText(ctx, text, x, y, lineWidth, mainColor) {
    ctx.save();
    ctx.lineWidth = lineWidth;
    //ctx.fillText(text, x + lineWidth, y + lineWidth);
    ctx.fillStyle = mainColor;
    ctx.font = "bold 15pt Verdana";
    ctx.fillText(text, x, y);
    ctx.restore();
}

function drawEnemyFire(ctx, assets, enemyShotArray) {
    ctx.save();

    for (var i = 0; i < enemyShotArray.length; i++) {
        ctx.drawImage(enemyShotArray[i].getAsset(), enemyShotArray[i].getX(), enemyShotArray[i].getY(), enemyShotArray[i].getWidth(), enemyShotArray[i].getHeight());
    }

    ctx.restore();
}


function drawShip(ctx, assets, ship) {
    ctx.save();
    ctx.drawImage(assets.shipImage, ship.getX(), ship.getY(), ship.getWidth(), ship.getHeight());
    ctx.restore();
}

function drawEnemies(ctx, assets, enemyArray) {
    ctx.save();
    if (enemyArray.length > 0) {
        for (var i = 0; i < enemyArray.length; i++) {
            ctx.drawImage(getEnemyAsset(assets, enemyArray[i].getMonsterNumber()), enemyArray[i].getX(), enemyArray[i].getY(), enemyArray[i].getWidth(), enemyArray[i].getHeight());
        }
    }

    ctx.restore();
}

function showImage(ctx, image, x, y, width, height) {
    ctx.drawImage(image, x, y, width, height);
}

function drawShipFire(ctx, assets, shotArray) {
    ctx.save();
    for (var i = 0; i < shotArray.length; i++) {
        ctx.drawImage(assets.laserImage, shotArray[i].getX(), shotArray[i].getY(), shotArray[i].getWidth(), shotArray[i].getHeight());
    }

    ctx.restore();
}