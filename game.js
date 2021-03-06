
(function(window){
	/*
	var gameDiv = document.getElementById('game')
	var winWidth = window.screen.width - 600; // la largeur de l'écran
	var winHeight = window.screen.height - 400; // hauteur ...
	gameDiv.setAttribute("width", winWidth);
	gameDiv.setAttribute("height", winHeight);
	*/
	var Game = {
		init: function(){
			this.c                     = document.getElementById("game"); // game = canvas / "c" pour canvas
			//this.c.width               = winWidth;
			//this.c.height              = winHeight;
			this.c.width               = this.c.width;// inutile, mais dans la source originale ?
			this.c.height              = this.c.height;// inutile, mais dans la source originale ?
			this.ctx                   = this.c.getContext("2d");
			this.color                 = "hsl(245,90%,10%)"; // la couleur du fond
			this.bullets               = []; // les tirs du player
			this.enemyBullets          = []; // tirs ennemis
			this.enemies               = []; // les ennemis
			this.particles             = []; // les explosions des ennemis
			this.bulletIndex           = 0;
			this.enemyBulletIndex      = 0;
			this.enemyIndex            = 0;
			this.particleIndex         = 0;
			this.maxParticles          = 18;
			this.maxEnemies            = 8;
			this.maxEnemiesMax         = 24;
			this.enemiesAlive          = 0;
			this.currentFrame          = 0;
			//	this.maxLives = 3;
			//	this.life = 0;
			this.binding(); // "liaison"
			this.player                = new Player();
			this.score                 = 0;
			this.paused                = false;
			this.shooting              = true; // tir automatique - defaut false
			this.oneShot               = false;
			this.isGameOver            = false;
			this.requestAnimationFrame = window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame;

			for(var i = 0; i<this.maxEnemies; i++){
				new Enemy();
				this.enemiesAlive++;
			}
			// this.invincibleMode(2000); // on est invincible au lancement du jeu, en milliseconde, defaut 2000
			this.loop();
		},

		// pour lier les touches au jeu "c"
		// window renvoie à la fenetre du navidateur, 1er element du DOM
		binding: function(){
			window.addEventListener("keydown", this.buttonDown); // lorsqu'on enfonce une touche
			window.addEventListener("keyup", this.buttonUp); // lorsqu'on relache une touche - pas vu de différence si mute
			window.addEventListener("keypress", this.keyPressed); // lorsqu'on laisse apuyer sur une touche
			this.c.addEventListener("click", this.clicked); // pour la sourie
		},

		// this.clicked = pause
		clicked: function(){
			if(!Game.paused) {
				Game.pause();
			} else {
				if(Game.isGameOver){
					Game.init();
				} else {
					Game.unPause();
					Game.loop();
					Game.invincibleMode(1000);
				}
			}
		},

		keyPressed: function(e){
			if(e.keyCode === 38 || e.keyCode === 40){
				if(Game.isGameOver){
					Game.init();
			}
		 }
		},

		// pour trouver a quelle touche correspond quelle keycode
		// http://www.asquare.net/javascript/tests/KeyCode.html
		// 32 = barre d'espace

		buttonUp: function(e){
			if(e.keyCode === 37 || e.keyCode === 65){
				Game.player.movingLeft = false;
			}
			if(e.keyCode === 39 || e.keyCode === 68){
				Game.player.movingRight = false;
			}
		},

		buttonDown: function(e){
			if(e.keyCode === 37 || e.keyCode === 65){
				Game.player.movingLeft = true;
			}
			if(e.keyCode === 39 || e.keyCode === 68){
				Game.player.movingRight = true;
			}
			// npour mette le jeu en pause avec haut et bas
			if(e.keyCode === 40 || e.keyCode === 38){
					if(!Game.paused) {
				Game.pause();
			} else {
				if(Game.isGameOver){
					Game.init();
				} else {
					Game.unPause();
					Game.loop();
					Game.invincibleMode(1000);
				}
			}
			}
		},

		random: function(min, max){
		return Math.floor(Math.random() * (max - min) + min);
		},

		invincibleMode: function(s){
			this.player.invincible = true;
			setTimeout(function(){
				Game.player.invincible = false;
			}, s);
		},

		//gestion des collisions avec x et y
		collision: function(a, b){
			return !(
				((a.y + a.height) < (b.y)) ||
				(a.y > (b.y + b.height)) ||
				((a.x + a.width) < b.x) ||
				(a.x > (b.x + b.width))
				)
		},
		// pour le fond
		clear: function(){
			this.ctx.fillStyle = Game.color;
			this.ctx.fillRect(0, 0, this.c.width, this.c.height);
		  },

		pause: function(){
			this.paused = true;
		},

		unPause: function(){
			this.paused = false;
		},

		gameOver: function(){
			this.isGameOver = true;
			this.clear();
			var message = "GAME OVER";
			var message2 = "Your score: " + Game.score;
			var message3 = "Press Up or Down arrow key to Play Again";
			this.pause();
			this.ctx.fillStyle = "hsl(120,80%,50%)";
			this.ctx.font      = "bold 36px Arial Black, sans-serif";
			this.ctx.fillText(message, this.c.width/2 - this.ctx.measureText(message).width/2, this.c.height/2 - 50);
			this.ctx.fillStyle = "white";
			this.ctx.font      = "bold 24px Lato, sans-serif";
			this.ctx.fillText(message2, this.c.width/2 - this.ctx.measureText(message2).width/2, this.c.height/2 + 2);
			this.ctx.fillStyle = "hsl(120,80%,50%)";
			this.ctx.font      = "bold 18px Lato, sans-serif";
			this.ctx.fillText(message3, this.c.width/2 - this.ctx.measureText(message3).width/2, this.c.height/2 + 50);
		  },

		updateScore: function(){
			this.ctx.fillStyle = "white";
			this.ctx.font      = "20px Lato, sans-serif";
			this.ctx.fillText("Score: " + this.score, 11, 25);
		  },

		// fonction importante
		loop: function(){
			if(!Game.paused){
				Game.clear();
				for(var i in Game.enemies){
					var currentEnemy = Game.enemies[i];
					currentEnemy.draw();
					currentEnemy.update();
					if(Game.currentFrame % currentEnemy.shootingSpeed === 0){
						currentEnemy.shoot();
					}
				}
				for(var x in Game.enemyBullets){
					Game.enemyBullets[x].draw();
					Game.enemyBullets[x].update();
				}
				for(var z in Game.bullets){
					Game.bullets[z].draw();
					Game.bullets[z].update();
				}
				if(Game.player.invincible){
					if(Game.currentFrame % 20 === 0){
						Game.player.draw();
					}
				} else {
					Game.player.draw();
				}

				for(var i in Game.particles){
				  Game.particles[i].draw();
				}

				Game.player.update();
				Game.updateScore();
				Game.currentFrame = Game.requestAnimationFrame.call(window, Game.loop);
			}
		}

	};

	var Player = function(){
		this.width = 48;
		this.height = 24;
		this.x = Game.c.width/2 - this.width/2;
		this.y = Game.c.height - this.height;
		this.movingLeft = false;
		this.movingRight = false;
		this.speed = 12; // 8
		this.invincible = false;
		this.color = "white";
	};


	Player.prototype.die = function(){
		if(Game.life < Game.maxLives){
			Game.invincibleMode(2000);
			Game.life++;
		} else {
			Game.pause();
			Game.gameOver();
		}
	};


	Player.prototype.draw = function(){
		 Game.ctx.fillStyle = this.color;
		 Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};


	Player.prototype.update = function(){
		if(this.movingLeft && this.x > 0){
			this.x -= this.speed;
		}
		if(this.movingRight && this.x + this.width < Game.c.width){
			this.x += this.speed;
		}
		// frequence de tir du joueur
		if(Game.shooting && Game.currentFrame % 15 === 0){
			this.shoot();
		}
		for(var i in Game.enemyBullets){
			var currentBullet = Game.enemyBullets[i];
			if(Game.collision(currentBullet, this) && !Game.player.invincible){
				this.die();
				delete Game.enemyBullets[i];
			}
		}
	};

	Player.prototype.shoot = function(){
		Game.bullets[Game.bulletIndex] = new Bullet(this.x + this.width/4);
		Game.bulletIndex++;
	};

	var Bullet = function(x){
		this.width  = 24;
		this.height = 24;
		this.x      = x;
		this.y      = Game.c.height - 10;
		this.vy     = 11; // defaut 9
		this.index  = Game.bulletIndex;
		this.active = true;
		this.color  = "hsl(0,90%,100%)";
	};


	Bullet.prototype.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	Bullet.prototype.update = function(){
		this.y -= this.vy;
		if(this.y < 0){
			delete Game.bullets[this.index];
		}
	};

	var Enemy = function(){
		this.width  = 48; // 50
		this.height = 48; // 50
		this.x      = Game.random(0, (Game.c.width - this.width));
		this.y      = Game.random(10, 40);
		this.vy     = Game.random(1, 3) * .1;
		this.index  = Game.enemyIndex;
		Game.enemies[Game.enemyIndex] = this;
		Game.enemyIndex++;
		this.speed         = Game.random(2, 7);
		this.shootingSpeed = Game.random(30, 150); // frequence de tirs ennemis - defaut (30, 100)
		this.movingLeft    = Math.random() < 0.5 ? true : false;
		this.color         = "hsl(245,100%,50%)";
	};

	Enemy.prototype.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	Enemy.prototype.update = function(){
		if(this.movingLeft){
			if(this.x > 0){
				this.x -= this.speed;
				this.y += this.vy;
			} else {
				this.movingLeft = false;
			}
		} else {
			if(this.x + this.width < Game.c.width){
				this.x += this.speed;
				this.y += this.vy;
			} else {
				this.movingLeft = true;
			}
		}

		for(var i in Game.bullets){
			var currentBullet = Game.bullets[i];
			if(Game.collision(currentBullet, this)){
				this.die();
				delete Game.bullets[i];
			}
		}
	};

	Enemy.prototype.die = function(){
	  this.explode();
	  delete Game.enemies[this.index];
	  Game.score += 1; //int a changer pour le score 1 = 1 ennemi detruit
	  Game.enemiesAlive = Game.enemiesAlive > 1 ? Game.enemiesAlive - 1 : 0;
	  if(Game.enemiesAlive < Game.maxEnemies){
		Game.enemiesAlive++;
		setTimeout(function(){
			new Enemy();
		}, 2000);
		}
	};

	Enemy.prototype.explode = function(){
		for(var i=0; i<Game.maxParticles; i++){
		new Particle(this.x + this.width/2, this.y, this.color);
	  }
	};

	Enemy.prototype.shoot = function(){
		new EnemyBullet(this.x + this.width/2, this.y, this.color);
	};

	var EnemyBullet = function(x, y, color){
		this.width  = 48; // 50
		this.height = 48; // 50
		this.x      = x;
		this.y      = y;
		this.vy     = 8;
		this.color  = "hsl("+ Game.random(0, 360) +", 90%, 50%)"; //couleur unique pour tout les enememis;
		this.index  = Game.enemyBulletIndex;
		Game.enemyBullets[Game.enemyBulletIndex] = this;
		Game.enemyBulletIndex++;
	};

	EnemyBullet.prototype.draw = function(){
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.width, this.height);
	};

	EnemyBullet.prototype.update = function(){
		this.y += this.vy;
		if(this.y > Game.c.height){
			delete Game.enemyBullets[this.index];
		}
	};

	// todo supprimmer l'argument "color" qui ici est la couleur de fond
	var Particle   = function(x, y, color){
		this.x     = x;
		this.y     = y;
		this.vx    = Game.random(-5, 5);
		this.vy    = Game.random(-5, 5);
		// this.color = color || "orange";
		this.color = "hsl("+ Game.random(0, 360) +", 90%, 50%)";
		Game.particles[Game.particleIndex] = this;
		this.id  = Game.particleIndex;
		Game.particleIndex++;
		this.life    = 0;
		this.gravity = .8;
		this.size    = 60;
		this.maxlife = 800;
	  };

	  Particle.prototype.draw = function(){
		this.x    += this.vx;
		this.y    += this.vy;
		this.vy   += this.gravity;
		this.size *= .89;
		Game.ctx.fillStyle = this.color;
		Game.ctx.fillRect(this.x, this.y, this.size, this.size);
		this.life++;
		if(this.life >= this.maxlife){
		  delete Game.particles[this.id];
		}
	  };

	Game.init();

}(window));
