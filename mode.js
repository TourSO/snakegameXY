window.onload = function() {
    var longueur = 900;
    var largeur = 600;
    var taille = 30;
    var delais;
    var ctx;
    var snakee;
    var applee;
    var tailleX = longueur / taille;
    var tailleY = largeur / taille;
    var gameOverFlag = false;
    var score;

    resizeCanvas(); 
    selectLevel();
    function resizeCanvas() {
        var canvas = document.querySelector('canvas');
        if (canvas) {
            var style = getComputedStyle(canvas);
            canvas.width = parseInt(style.width);
            canvas.height = parseInt(style.height);
            ctx = canvas.getContext('2d');
        }
    }

    function selectLevel() {
        ctx = setupCanvas(); // Configuration initiale du canvas
        ctx.font = "40px Arial";
        ctx.fillStyle = "black";
        ctx.fillText("Select Level: 1-Easy, 2-Medium, 3-Hard", 50, 300);
        document.onkeydown = function(e) {
            var key = e.key;
            switch (key) {
                case "1":
                    delais = 500;
                    startGame();
                    break;
                case "2":
                    delais = 300;
                    startGame();
                    break;
                case "3":
                    delais = 100;
                    startGame();
                    break;
                default:
                    return;
            }
        };
    }

    function startGame() {
        init();
        document.onkeydown = handleKeyDown;
    }

    function init() {
        clearCanvas();
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        score = 0;
        applee = new Apple([10, 10]);
        refreshCanvas();
    }

    function refreshCanvas() {
        if (!gameOverFlag) {
            snakee.advance();
            if (snakee.checkCollision()) {
                gameOver();
            } else {
                if (snakee.isEatingApple(applee)) {
                    score++;
                    snakee.eatApple = true;
                    do {
                        applee.setNewPosition();
                    } while (applee.isOnSnake(snakee));
                }
                
                clearCanvas();
                drawScore();
                snakee.draw();
                applee.draw();
                setTimeout(refreshCanvas, delais);
            }
        }
    }

    function clearCanvas() {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    }

    function drawScore() {
        ctx.save();
        ctx.font = "40px Arial";
        ctx.fillStyle = "blue";
        ctx.fillText(score.toString(), 5, 45);
        ctx.restore();
    }

    function restart() {
        clearCanvas();
        gameOverFlag = false;
        score = 0;
        snakee = new Snake([[6, 4], [5, 4], [4, 4]], "right");
        applee = new Apple([10, 10]);
        refreshCanvas();
    }

    function gameOver() {
        ctx.save();
        gameOverFlag = true;
        alert("Game over. Score: " + score.toString());
        alert("Press 'Enter' to restart.");
        ctx.restore();
    }

    function setupCanvas() {
        var canvas = document.createElement('canvas');
        canvas.width = longueur;
        canvas.height = largeur;
        canvas.style.border = "20px solid gray";
        document.body.appendChild(canvas);
        return canvas.getContext('2d');
    }

    function drawBlock(ctx, position) {
        var x = position[0] * taille;
        var y = position[1] * taille;
        ctx.fillRect(x, y, taille, taille);
    }

    function Apple(position) {
        this.position = position;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "green";
            ctx.beginPath();
            var radius = taille / 2;
            var x = this.position[0] * taille + radius;
            var y = this.position[1] * taille + radius;
            ctx.arc(x, y, radius, 0, Math.PI * 2, true);
            ctx.fill();
            ctx.restore();
        };
        this.setNewPosition = function() {
            var newX = Math.round(Math.random() * (tailleX - 1));
            var newY = Math.round(Math.random() * (tailleY - 1));
            this.position = [newX, newY];
        };
        this.isOnSnake = function(snakeToCheck) {
            var isOnSnake = false;
            for (var i = 0; i < snakeToCheck.body.length; i++) {
                if (this.position[0] === snakeToCheck.body[i][0] && this.position[1] === snakeToCheck.body[i][1]) {
                    isOnSnake = true;
                }
            }
            return isOnSnake;
        };
    }

    function Snake(body, direction) {
        this.body = body;
        this.direction = direction;
        this.eatApple = false;
        this.draw = function() {
            ctx.save();
            ctx.fillStyle = "red";
            for (var i = 0; i < this.body.length; i++) {
                drawBlock(ctx, this.body[i]);
            }
            ctx.restore();
        };
        this.advance = function() {
            var nextPosition = this.body[0].slice();
            switch (this.direction) {
                case "right":
                    nextPosition[0]++;
                    break;
                case "left":
                    nextPosition[0]--;
                    break;
                case "down":
                    nextPosition[1]++;
                    break;
                case "up":
                    nextPosition[1]--;
                    break;
                default:
                    throw ("invalid direction");
            }
            this.body.unshift(nextPosition);
            if (!this.eatApple) {
                this.body.pop();
            } else {
                this.eatApple = false;
            }
        };
        this.setDirection = function(newDirection) {
            var allowedDirections;
            switch (this.direction) {
                case "left":
                case "right":
                    allowedDirections = ["up", "down"];
                    break;
                case "up":
                case "down":
                    allowedDirections = ["left", "right"];
                    break;
                default:
                    throw ("error");
            }
            if (allowedDirections.indexOf(newDirection) > -1) {
                this.direction = newDirection;
            }
        };
        this.checkCollision = function() {
            var wallCollision = false;
            var snakeCollision = false;
            var head = this.body[0];
            var rest = this.body.slice(1);
            var snakeX = head[0];
            var snakeY = head[1];
            var minX = 0;
            var minY = 0;
            var maxX = tailleX - 1;
            var maxY = tailleY - 1;
            var isNotBetweenHorizontalWalls = snakeX < minX || snakeX > maxX;
            var isNotBetweenVerticalWalls = snakeY < minY || snakeY > maxY;
            if (isNotBetweenHorizontalWalls || isNotBetweenVerticalWalls) {
                wallCollision = true;
            }
            for (var i = 0; i < rest.length; i++) {
                if (snakeX === rest[i][0] && snakeY === rest[i][1]) {
                    snakeCollision = true;
                }
            }
            return wallCollision || snakeCollision;
        };
        this.isEatingApple = function(appleToEat) {
            var head = this.body[0];
            if (head[0] === appleToEat.position[0] && head[1] === appleToEat.position[1]) {
                return true;
            } else {
                return false;
            }
        };
    }

    function handleKeyDown(e) {
        var key = e.key;
        var newDirection;
        switch (key) {
            case "ArrowLeft":
                newDirection = "left";
                break;
            case "ArrowUp":
                newDirection = "up";
                break;
            case "ArrowRight":
                newDirection = "right";
                break;
            case "ArrowDown":
                newDirection = "down";
                break;
            case "Enter":
                if (gameOverFlag) {
                    restart();
                }
                return;
            default:
                return;
        }
        snakee.setDirection(newDirection);
    }
    window.onresize = resizeCanvas;
};