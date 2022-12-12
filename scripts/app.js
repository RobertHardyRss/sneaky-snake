//@ts-check
/** @type {HTMLCanvasElement} */ //@ts-ignore canvas is an HTMLCanvasElement
const canvas = document.getElementById("game-canvas");
/** @type {CanvasRenderingContext2D} */ //@ts-ignore canvas is an HTMLCanvasElement
const ctx = canvas.getContext("2d");
canvas.width = 800;
canvas.height = 600;

const MOVE_UP = "up";
const MOVE_DOWN = "down";
const MOVE_LEFT = "left";
const MOVE_RIGHT = "right";

// TODO: For Game
//		We need start game screen where we say if it's 1 or 2 players
//			instructions on how to play
//		We need game over with play again
//			2 player end conditions
//			Final scoring is based on body length
//		Player sneak attempt counts on screen
let game = {
	gridSize: 20,
	refreshRate: 100, // milliseconds
};

// player todos
// we need to lose
//		when we hit another player
// Figure out how to reverse
//		HEad and tail change positions
//		Sort our segments
//		Only works if you have sneak attempts

class Player {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {CanvasRenderingContext2D} ctx
	 * @param {game} game
	 */
	constructor(x, y, ctx, game) {
		this.x = x;
		this.y = y;
		this.game = game;
		this.ctx = ctx;

		this.currentDirection = MOVE_DOWN;
		this.head = new Segment(this.x, this.y, "yellow", this.ctx);
		/** @type {Array<Segment>} */
		this.segments = [];
		this.sneakCount = 0;
		this.isDead = false;

		this.lastUpdate = 0;
		this.wireUpEvents();
	}

	/**
	 * @param {number} elapsedTime
	 */
	update(elapsedTime) {
		this.lastUpdate += elapsedTime;
		if (this.lastUpdate < this.game.refreshRate) return;
		this.lastUpdate = 0;

		for (let i = this.segments.length - 1; i >= 1; i--) {
			this.segments[i].x = this.segments[i - 1].x;
			this.segments[i].y = this.segments[i - 1].y;
		}

		if (this.segments.length > 0) {
			this.segments[0].x = this.head.x;
			this.segments[0].y = this.head.y;
		}

		switch (this.currentDirection) {
			case MOVE_DOWN:
				this.head.y += this.game.gridSize;
				break;
			case MOVE_UP:
				this.head.y -= this.game.gridSize;
				break;
			case MOVE_RIGHT:
				this.head.x += this.game.gridSize;
				break;
			case MOVE_LEFT:
				this.head.x -= this.game.gridSize;
				break;
		}

		// check for death
		if (
			this.head.x < 0 ||
			this.head.y < 0 ||
			this.head.x >= canvas.width ||
			this.head.y >= canvas.height ||
			this.segments.some((s) => s.x == this.head.x && s.y == this.head.y)
		) {
			this.isDead = true;
		}
	}

	draw() {
		// if(this.isDead) return;

		this.head.draw();
		this.segments.forEach((s) => {
			s.draw();
		});
	}

	wireUpEvents() {
		document.addEventListener("keydown", (e) => {
			// console.log(e.code);
			switch (e.code) {
				case "ArrowUp":
					this.currentDirection = MOVE_UP;
					break;
				case "ArrowDown":
					this.currentDirection = MOVE_DOWN;
					break;
				case "ArrowRight":
					this.currentDirection = MOVE_RIGHT;
					break;
				case "ArrowLeft":
					this.currentDirection = MOVE_LEFT;
					break;
			}
		});
	}

	grow(growBy) {
		for (let i = 0; i < growBy; i++) {
			this.segments.push(
				new Segment(this.head.x, this.head.y, "lime", this.ctx)
			);
		}
		this.sneakCount++;
	}
}

class Segment {
	/**
	 * @param {number} x
	 * @param {number} y
	 * @param {string} color
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(x, y, color, ctx) {
		this.x = x;
		this.y = y;
		this.w = game.gridSize;
		this.h = this.w;
		this.color = color;
		this.ctx = ctx;
	}

	update() {}

	draw() {
		this.ctx.fillStyle = this.color;
		this.ctx.fillRect(this.x, this.y, this.w, this.h);
	}
}

// Food Todos
// spawn in random grid
//		only spawn on empty grid spots
// How many food spawn?
//  	Make it configurable?
// Change the odds of getting sneak attempts and gold/blue food

class Food {
	/**
	 * @param {CanvasRenderingContext2D} ctx
	 */
	constructor(ctx) {
		this.ctx = ctx;
		this.x = 0;
		this.y = 0;
		this.radius = game.gridSize / 2;
		this.color = "red";
		this.growBy = 1;
		this.isEaten = true;
	}

	spawn() {
		// reset eaten state
		this.isEaten = false;

		let foodType = Math.floor(Math.random() * 3 + 1);
		switch (foodType) {
			case 1:
				this.color = "red";
				this.growBy = 1;
				break;
			case 2:
				this.color = "blue";
				this.growBy = 2;
				break;
			case 3:
				this.color = "gold";
				this.growBy = 3;
				break;
		}

		let xGridMaxValue = canvas.width / game.gridSize;
		let yGridMaxValue = canvas.height / game.gridSize;

		let randomX = Math.floor(Math.random() * xGridMaxValue);
		let randomY = Math.floor(Math.random() * yGridMaxValue);

		this.x = randomX * game.gridSize;
		this.y = randomY * game.gridSize;
	}

	update() {}

	draw() {
		if (this.isEaten) return;

		this.ctx.beginPath();
		this.ctx.fillStyle = this.color;
		this.ctx.arc(
			this.x + this.radius,
			this.y + this.radius,
			this.radius,
			0,
			Math.PI * 2
		);
		this.ctx.fill();
		this.ctx.closePath();
	}
}

// Other Things we can run into  - Ideas
// Bomb
// Makes your faster

let p1 = new Player(5 * game.gridSize, 5 * game.gridSize, ctx, game);

let food = [new Food(ctx), new Food(ctx), new Food(ctx), new Food(ctx)];

/**
 * @param {Array<Player>} players
 * @param {Array<Food>} food
 */
function checkIfFoodIsConsumed(players, food) {
	food.forEach((f) => {
		players.forEach((p) => {
			//
			if (p.head.x == f.x && p.head.y == f.y) {
				console.log("food is eaten");
				// food is eaten
				f.isEaten = true;
				p.grow(f.growBy);
			}
		});
	});
}

let currentTime = 0;

function gameLoop(timestamp) {
	let elapsedTime = timestamp - currentTime;
	currentTime = timestamp;
	ctx.clearRect(0, 0, canvas.width, canvas.height);

	p1.update(elapsedTime);
	p1.draw();

	food.forEach((f) => {
		f.draw();
	});

	checkIfFoodIsConsumed([p1], food);

	// filter out uneaten food, and then respawn food
	// that has been eaten
	food.filter((f) => f.isEaten).forEach((f) => {
		f.spawn();
	});

	let isGameOver = [p1].some((p) => p.isDead);

	if (isGameOver) {
		// do something crazy
		return;
	}

	requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);
