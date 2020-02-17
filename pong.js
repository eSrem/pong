const canvas = document.getElementById('pong')
const html = document.getElementsByTagName('html')[0]

canvas.width = html.clientWidth
canvas.height = (canvas.width / 16) * 9

class paddle {
    constructor(colour, left) {
        this.width = canvas.width / 35
        this.height = canvas.height / 4
        this.left = left
        this.top = (canvas.height - canvas.height / 4) / 2
        this.colour = colour
        this.maxvelocity = 7
        this.velocity = 0
    }
    changeVelocity(deltav) {
        this.velocity += deltav
        if(this.velocity >= this.maxvelocity) {
            this.velocity = this.maxvelocity
        }
        if(this.velocity <= -this.maxvelocity) {
            this.velocity = -this.maxvelocity
        }
    }
    draw (context) {
        this.move()
        context.fillStyle = this.colour
        context.fillRect(this.left, this.top, this.width, this.height)
    }
    move () {
        this.top += this.velocity
        if(this.top < (0 - (this.height / 2))) {
            this.top = 0 - (this.height / 2)
            this.velocity = 0
        }
        if(this.top > (canvas.height - (this.height / 2))) {
            this.top = canvas.height - (this.height / 2)
            this.velocity = 0
        }
    }
}

class ball {
    constructor (colour) {
        this.colour = colour
        this.maxvelocity = 10
        this.velocityy = 0
        this.velocityx = 0
        this.height = this.width = canvas.width / 35
        this.top = (canvas.height / 2) - (this.height / 2)
        this.left = (canvas.width / 2) - (this.width / 2)
        this.right = this.left + this.width
    }
    draw (context) {
        this.move()
        context.fillStyle = this.colour
        context.fillRect(this.left, this.top, this.width, this.height)
    }
    /*
     * The behaviour for ball movement should be as follows:
     * - When the space bar is pressed, start movement.
     *   Default move direction is +x.
     *   If PaddleA scored, move direction is +x
     *   If PaddleB scored, move direction is -x
     */
    move () {
        if(game.started) {
            if(this.velocityx == 0) {
                this.velocityx = 5
                if(game.lastscored == "paddleA") {
                    this.velocityx = -5
                }
            }
            this.top += this.velocityy
            this.left += this.velocityx

            // Check if right side of ball touches left side of paddleB.
            if(this.left + this.width >= game.paddleB.left) {
                let top = game.paddleB.top - (this.height - 1)
                let bottom = game.paddleB.top + game.paddleB.height + (this.height - 1)
                if(this.top >= top && this.top <= bottom && this.velocityx > 0) {
                    // It's a hit! Reverse direction.
                    this.velocityx = this.velocityx * -1

                    // Calculate the angle of our attack.
                    let paddleCenter = game.paddleB.top + (game.paddleB.height / 2)
                    let ballCenter = this.top + (this.height / 2)
                    this.velocityy = (ballCenter - paddleCenter) / 10
                }
            }

            // Check if left side of ball touches right side of paddleA.
            if(this.left <= game.paddleA.left + game.paddleA.width) {
                let top = game.paddleA.top - (this.height - 1)
                let bottom = game.paddleA.top + game.paddleA.height + (this.height - 1)
                if(this.top >= top && this.top <= bottom && this.velocityx < 0) {
                    // It's a hit! Reverse direction.
                    this.velocityx = this.velocityx * -1

                    // Calculate the angle of our attack.
                    let paddleCenter = game.paddleA.top + (game.paddleA.height / 2)
                    let ballCenter = this.top + (this.height / 2)
                    this.velocityy = (ballCenter - paddleCenter) / 10
                }
            }

            // Check if ball touches top wall.
            if(this.top <= 0) {
                this.velocityy = this.velocityy * -1
            }

            if(this.top + this.height >= canvas.height) {
                this.velocityy = 0 - this.velocityy
            }

            // Check if ball touches the left wall for score B.
            if(this.left + this.width <= 0) {
                game.started = false;
                game.scoreB++
                game.lastscored = "paddleB"
                game.reset()
            }

            // Check if ball touches the left wall for score B.
            if(this.left >= canvas.width) {
                game.started = false;
                game.scoreA++
                game.lastscored = "paddleA"
                game.reset()
            }
        }
    }
}

const game = {
    started: false,
    lastscored: '',
    scoreA: 0,
    scoreB: 0,
    paddleA: new paddle('#ffffff', 10),
    paddleB: new paddle('#666666', canvas.width - (canvas.width / 35) - 15),
    ball: new ball('#ff0000'),
    reset: () => {
        game.paddleA = new paddle('#ffffff', 10)
        game.paddleB = new paddle('#666666', canvas.width - (canvas.width / 35) - 15)
        game.ball = new ball('#ff0000')
    },
    draw: () => {
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height)

        // Draw paddles. This also moves the paddle.
        game.paddleA.draw(context)
        game.paddleB.draw(context)
        game.ball.draw(context)
        context.font = "140px ArcadeClassicFont";
        context.fillStyle = "#ffffff";
        context.textAlign = "center";
        context.fillText(game.scoreA + "   " + game.scoreB, canvas.width/2, 100);

        // Request the next frame.
        requestAnimationFrame(game.draw)
    },
    input: {
    },
    handleKeyUp: (event) => {
        let key = event.code
        event.preventDefault()
        game.input[key] = event.type == 'keydown'
        if(key == "KeyW") {
            game.paddleA.velocity = 0
        }
        if(key == "KeyS") {
            game.paddleA.velocity = 0
        }
        if(key == "ArrowUp") {
            game.paddleB.velocity = 0
        }
        if(key == "ArrowDown") {
            game.paddleB.velocity = 0
        }
        if(key == "Space") {
            game.started = true
        }
    },
    handleKeyDown: (event) => {
        let key = event.code
        event.preventDefault()
        game.input[key] = event.type == 'keydown'
        if(game.input["KeyW"]) {
            game.paddleA.changeVelocity(-1)
        }
        if(game.input["KeyS"]) {
            game.paddleA.changeVelocity(1)
        }
        if(game.input["ArrowUp"]) {
            game.paddleB.changeVelocity(-1)
        }
        if(game.input["ArrowDown"]) {
            game.paddleB.changeVelocity(1)
        }
    },
}
window.addEventListener('keydown', game.handleKeyDown,false);
window.addEventListener('keyup', game.handleKeyUp,false);
requestAnimationFrame(game.draw)
