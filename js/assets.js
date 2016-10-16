
var assetsToLoadURLs = {
    backgroundImage: { url: 'assets/images/background.jpg' },
    shipImage: { url: 'assets/images/ship.png' },
    laserImage: { url: 'assets/images/laser.png' },
    logoImage: { url: 'assets/images/logo.png' },

    monster1Image: { url: 'assets/images/monster_1.png' },
    monster2Image: { url: 'assets/images/monster_2.png' },
    monster3Image: { url: 'assets/images/monster_3.png' },
    monster1LaserImage: { url: 'assets/images/laser_monster_1.png' },
    monster2LaserImage: { url: 'assets/images/laser_monster_2.png' },
    monster3LaserImage: { url: 'assets/images/laser_monster_3.png' },
    gameOverImage: { url: 'assets/images/gameover.png' },

    sound_bg: { url: 'assets/sounds/sound_bg.mp3', buffer: true, loop: true, volume: 0.05 },
    sound_fireshot: { url: 'assets/sounds/sound_fireshot.wav', buffer: false, loop: false, volume: 0.05 },
    sound_firehit: { url: 'assets/sounds/sound_firehit.wav', buffer: false, loop: false, volume: 0.1 },
    sound_enemyfirehit: { url: 'assets/sounds/sound_enemyfirehit.wav', buffer: false, loop: false, volume: 0.5 },
    sound_gameover: { url: 'assets/sounds/sound_gameover.wav', buffer: false, loop: false, volume: 1.0 },
    sound_enemyfireshot: { url: 'assets/sounds/sound_enemyfireshot.wav', buffer: false, loop: false, volume: 0.05 },
    sound_enemydeath: { url: 'assets/sounds/sound_enemydeath.wav', buffer: false, loop: false, volume: 0.05 }
};

function loadAssets(callback) {
    // here we should load the souds, the sprite sheets etc.
    // then at the end call the callback function           
    loadAssetsUsingHowlerAndNoXhr(assetsToLoadURLs, callback);
}

/* ############################
    BUFFER LOADER for loading multiple files asynchronously. The callback functions is called when all
    files have been loaded and decoded 
 ############################## */
function isImage(url) {
    return (url.match(/\.(jpeg|jpg|gif|png)$/) != null);
}

function isAudio(url) {
    return (url.match(/\.(mp3|ogg|wav)$/) != null);
}

function loadAssetsUsingHowlerAndNoXhr(assetsToBeLoaded, callback) {
    var assetsLoaded = {};
    var loadedAssets = 0;
    var numberOfAssetsToLoad = 0;

    // define ifLoad function
    var ifLoad = function () {
        if (++loadedAssets >= numberOfAssetsToLoad) {
            callback(assetsLoaded);
        }
        console.log("Loaded asset " + loadedAssets);
    };

    // get num of assets to load
    for (var name in assetsToBeLoaded) {
        numberOfAssetsToLoad++;
    }

    console.log("Nb assets to load: " + numberOfAssetsToLoad);

    for (name in assetsToBeLoaded) {
        var url = assetsToBeLoaded[name].url;
        console.log("Loading " + url);
        if (isImage(url)) {
            assetsLoaded[name] = new Image();

            assetsLoaded[name].onload = ifLoad;
            // will start async loading. 
            assetsLoaded[name].src = url;
        } else {
            // We assume the asset is an audio file
            console.log("loading " + name + " buffer : " + assetsToBeLoaded[name].loop);
            assetsLoaded[name] = new Howl({
                urls: [url],
                buffer: assetsToBeLoaded[name].buffer,
                loop: assetsToBeLoaded[name].loop,
                autoplay: false,
                volume: assetsToBeLoaded[name].volume,
                onload: function () {
                    if (++loadedAssets >= numberOfAssetsToLoad) {
                        callback(assetsLoaded);
                    }
                    console.log("Loaded asset " + loadedAssets);
                }
            }); // End of howler.js callback
        } // if

    } // for
} // function

