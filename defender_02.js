var game = new Phaser.Game(800, 600, Phaser.CANVAS, 'phaser-example', { preload: preload, create: create, update: update });

function preload () {

    game.load.image('player', 'assets/ship.png');
    game.load.image('star', 'assets/star2.png');
    game.load.image('baddie', 'assets/space-baddie.png');
    game.load.image('lazer', 'assets/viereck.png');
    game.load.image('stein', 'assets/Stein.png');
    game.load.image('circle', 'assets/circle.png');
    //game.load.atlas('', 'assets/laser.png', 'assets/laser.json');
    
    game.load.audio('blaster', 'assets/blaster.mp3');
    game.load.audio('playerD', 'assets/player_death.wav');
    game.load.audio('baddieD', 'assets/spaceman.wav');
    
    game.load.tilemap ('map_01', 'assets/maps/map_01.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image ('tiles', 'assets/maps/tileset_01.png');

    
    
}

 
var stars;
var baddies;
var player;
var cursors;
var fireButton;
var bulletTime = 0;
var frameTime = 0;
var frames;
var prevCamX = 0;
var coolDownPeriod = 7;
var coolDownCounter = 0;
var blaster;
var numOfBaddies = 120;
var playerDeath;
var baddieDeath;
var speedBaddies = 200;
var speedBaddiesChange = 30;
var bullets;
var maxBulletDistance = 400;
var time;
var kills = 0
var finish;

var map;
var layer;


function create () {
    

    map = game.add.tilemap('map_01');

    //  The first parameter is the tileset name, as specified in the Tiled map editor (and in the tilemap json file)
    //  The second parameter maps this name to the Phaser.Cache key 'tiles'
    map.addTilesetImage('tileset_01', 'tiles');
    
    //  Creates a layer from the World1 layer in the map data.
    //  A Layer is effectively like a Phaser.Sprite, so is added to the display list.
    layer = map.createLayer('Kachelebene 1');
    //  This resizes the game world to match the layer dimensions

    layer.resizeWorld();
    
    

    //map.setTileIndexCallback(indexes, callback, callbackContext, layer)
    // Kollision zwischen Player und Map
    map.setTileIndexCallback([1093, 1094], collidePlayer, this);
    
    //game.world.setBounds(0, 0, 3200, 1600);
    
    game.physics.startSystem(Phaser.Physics.ARCADE);

    frames = Phaser.Animation.generateFrameNames('frame', 2, 30, '', 2);
    frames.unshift('frame02');

    stars = game.add.group();

    bullets = game.add.group();

    for (var i = 0; i < 128; i++)
    {
        stars.create(game.world.randomX, game.world.randomY, 'star');
    }
    
    baddies = game.add.group();
    
    
    for (var i = 0; i < 18; i++)
    {
        baddies.create(game.world.randomX / 2 + game.world.width / 2, game.world.randomY, 'baddie');
        
    }
    
    game.physics.enable(baddies, Phaser.Physics.ARCADE);

	for (var i in baddies.children) {
        baddies.children[i].body.velocity.setTo (speedBaddies * (Math.random ()  - 0.5), speedBaddies * (Math.random () - 0.5));
        baddies.children[i].body.collideWorldBounds = true;
        baddies.children[i].body.bounce.setTo(1,1);
	}
    

    

        
    
    
    game.physics.enable(baddies, Phaser.Physics.ARCADE);

	for (var i in baddies.children) {
        baddies.children[i].body.velocity.setTo (speedBaddies * (Math.random ()  - 0.5), speedBaddies * (Math.random () - 0.5));
        baddies.children[i].body.collideWorldBounds = true;
        baddies.children[i].body.bounce.setTo(1,1);
	}


    /*lazers = game.add.group();
    game.physics.arcade.enable(lazers);
    lazers.enableBody = true;*/    
    
    player = game.add.sprite(100, 300, 'player');
    game.physics.arcade.enable(player);
    player.enableBody = true;
    
    player.anchor.x = 0.5;
    player.anchor.y = 0.5;
    player.body.collideWorldBounds = true;
    
    finish = game.add.sprite(3050, 1650, 'circle');
    finish.anchor.x = 0.5;
    finish.anchor.y = 0.5;
    game.physics.arcade.enable(finish);
    finish.enableBody = true;
    


    game.camera.follow(player, Phaser.Camera.FOLLOW_LOCKON, 0.5);

    cursors = game.input.keyboard.createCursorKeys();
    fireButton = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    prevCamX = game.camera.x;
    
    //sound
    blaster = game.add.audio('blaster');
    playerDeath = game.add.audio('playerD');
    baddieDeath = game.add.audio('baddieD');
    
    game.sound.setDecodedCallback([blaster, playerDeath, baddieDeath], start, this);
    //alert('hi')
    
    
}

function update () {
    
    // collision between player and layer, ruft die jeweiligen Funktionen auf
    game.physics.arcade.collide (player, layer);
    //game.physics.arcade.collide (baddies, layer);

    
    baddies.forEachAlive(bewegung, this);
    
    
    

    player.body.velocity.x = 0;
    player.body.velocity.y = 0;

    if (cursors.left.isDown)
    {
        player.body.velocity.x = -600;
        player.scale.x = -1;
    }
    else if (cursors.right.isDown)
    {
        player.body.velocity.x = 600;
        player.scale.x = 1;
    }

    if (cursors.up.isDown)
    {
        player.body.velocity.y = -600;
    }
    else if (cursors.down.isDown)
    {
        player.body.velocity.y = 600;
    }

    if (coolDownCounter > 0) {
        coolDownCounter--;
    } 
    
    if (fireButton.isDown && coolDownCounter == 0)
    {
        fireBullet();
        coolDownCounter = coolDownPeriod;
    }
    

    game.physics.arcade.overlap (bullets, baddies, killBaddie, null, this);
    game.physics.arcade.overlap (player, baddies, killPlayer, null, this);

    game.physics.arcade.overlap (player, finish, nextLevel, null, this);
    
    
    bullets.forEachAlive(killBullet, this);

    prevCamX = game.camera.x ;
    
    

}



    function fireBullet () {
        var bullet = bullets.create (player.x + 10 * player.scale.x, player.y + 2, 'lazer');
        //bullet = game.add.sprite(player.x + 10 * player.scale.x, player.y + 2, 'lazer');
        game.physics.enable(bullet, Phaser.Physics.ARCADE);
        bullet.body.velocity.setTo (1200 * player.scale.x, 0);
        game.physics.arcade.overlap(bullet, baddies, killBaddie, null, this);
        blaster.play();
    }


    function killBullet (bullet) {
        if (bullet.x - player.x > maxBulletDistance || player.x - bullet.x > maxBulletDistance) {
            bullet.kill ();
        }
    }



function collidePlayer () {    
    player.kill ();
    playerDeath.play();
}


function killPlayer (player, baddie) {    
    player.kill ();
    playerDeath.play();
}

function killBaddie (bullet, baddie) {
    baddie.kill ();
    baddieDeath.play();
    kills++
}


function bewegung (baddie) {
    
    baddie.body.velocity.x += (Math.random () - 0.5) * speedBaddiesChange;
    if (baddie.body.velocity.x >  speedBaddies) {baddie.body.velocity.x = speedBaddies} 
    if (baddie.body.velocity.x < -speedBaddies) {baddie.body.velocity.x = -speedBaddies} 
    baddie.body.velocity.y += (Math.random () - 0.5) * speedBaddiesChange;
    if (baddie.body.velocity.y >  speedBaddies) {baddie.body.velocity.y = speedBaddies} 
    if (baddie.body.velocity.y < -speedBaddies) {baddie.body.velocity.y = -speedBaddies} 
}

function nextLevel () {
    alert('You Win! /n Time: /n Kills: ' + kills)
}



