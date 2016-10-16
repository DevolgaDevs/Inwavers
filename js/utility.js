function getEnemyAsset(assets, monsterNumber) {
    switch (monsterNumber) {
        case 1:
            return assets.monster1Image;
            break;

        case 2:
            return assets.monster2Image;
            break;

        case 3:
            return assets.monster3Image;
            break;

        default:
            return assets.monster1Image;

    }
}

function isShipFiring(shotArray) {
    if (shotArray.length > 0) {
        return true;
    } else {
        return false;
    }
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}