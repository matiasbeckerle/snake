/**
 * HTML5 & JavaScript Snake Game version 1.1
 * 2012-12-18
 * https://github.com/matiasbeckerle/snake
 * Copyright Matias Beckerle
 * Licensed under The MIT License (http://www.opensource.org/licenses/mit-license.php)
 */

var SnakeGame = function(containerId){
        
    var self = this; 
    
    this.containerId = containerId;
    this.context = null;
    this.interval = null;
    this.timeout = null;
    this.countdownSeconds = 3;
        
    this.version = '1.1';    
    this.size = 10; // square size
    this.baseSpeed = 170; // base speed
    this.speed = 0; // current speed
    this.score = 0;
    this.foodPerLevel = 5; // food required per level
    this.foodTaken = 0; // food already eaten
    this.currentLevel = 1;
    this.lastCatchMoment = null; // the time of the last catch
    
    this.keyboardDispatcher = function(event) {
        var keyCode; 
 
        if(event == null) {
            keyCode = window.event.keyCode; 
        } else {
            keyCode = event.keyCode; 
        }
            
        switch(keyCode){
            case 37:
                if (this.Snake.direction != 'right'){
                    this.Snake.moveLeft();
                }
                break;
                        
            case 38:
                if (this.Snake.direction != 'down'){
                    this.Snake.moveUp();
                }
                break; 
          
            case 39:
                if (this.Snake.direction != 'left'){
                    this.Snake.moveRight();
                }
                break; 
        
            case 40:
                if (this.Snake.direction != 'up'){
                    this.Snake.moveDown();
                }
                break; 
        
            default:
                break;
        }
    }
    
    this.start = function() {     
        this.Food.draw();
        this.Snake.draw();
                
        this.restartFoodTaken();
        this.speed -= this.speed * 0.10;
                    
        this.lastCatchMoment = new Date();

        this.clearTimeEvents();
        this.interval = setInterval(this.Snake.move, this.speed);
    }
    
    this.beforeStart = function() {     
        this.clearTimeEvents();
        
        this.context.clearRect(0, 0, this.Screen.gameboard.width, this.Screen.gameboard.height);

        this.Snake.moveRight();
        this.Snake.position.x = 200;
        this.Snake.position.y = 200;
        this.countdownSeconds = 3;
        
        this.Screen.refreshCountdown();
        this.Screen.refreshScore();
        this.Screen.refreshLevel();
        
        this.timeout = setTimeout(this.countdown, 1000);
    }
    
    this.countdown = function() {
        if(self.countdownSeconds > 1) {
            self.countdownSeconds--;
            self.Screen.refreshCountdown();
            self.timeout = setTimeout(self.countdown, 1000);
        } else {
            self.Screen.hideCountdown();
            self.start();
        }
    }
    
    this.events = function() {
        this.Screen.start.onclick = function(){
            self.restart();
            self.beforeStart();
        };
        
        document.onkeydown = function(event) {
            self.keyboardDispatcher(event);
        }  
    }
    
    this.load = function() {
        if(this.Screen.draw()) {
            this.events();
        } else {
            alert('Your browser doesn\'t support canvas.');
            this.Screen.container.innerHTML = '';
        }
    };
    
    this.checkIfCanvasIsSupported = function() {
        var response = false;
        
        if (this.Screen.gameboard.getContext){
            this.context = this.Screen.gameboard.getContext('2d');
            response = true;
        }
        
        return response;
    }
    
    this.restartFoodTaken = function() {
        this.foodTaken = 0;
    }
        
    this.calculateScore = function() {
        var now = new Date();
        var elapsedTime = now - this.lastCatchMoment;
            
        this.score += (this.currentLevel * 10) + Math.round(((100 / elapsedTime) * 1000));
        this.Screen.refreshScore();
            
        if(this.foodTaken == this.foodPerLevel) {
            this.currentLevel++;
            this.beforeStart();
        } else {
            this.Food.draw();
            this.lastCatchMoment = new Date();
        }
    }
        
    this.lost = function() {
        this.clearTimeEvents();
        alert('Game over!\nYou have reached the level ' + this.currentLevel + ' and your score is ' + this.score + '.');
        this.restart();
    }
    
    this.clearTimeEvents = function(){
        if(self.timeout != undefined)
            clearTimeout(self.timeout);
        
        if(self.interval != undefined)
            clearInterval(self.interval);
    }
    
    this.restart = function() {
        this.context.clearRect(0, 0, this.Screen.gameboard.width, this.Screen.gameboard.height);
        this.currentLevel = 1;
        this.score = 0;
        this.Screen.restart();
        this.speed = this.baseSpeed;
        this.Snake.bornAgain();
    }
    
    /**
     * The screen object. Handles the main screen, HTML things.
     */
    this.Screen = {
        container: document.getElementById(self.containerId),
        gameboard: null,
        start: null,
        level: null,
        score: null,
        countdown: null,
        draw: function() {
            var gameHtml = '<div id="snakeGame"><header><h1>Snake</h1><div id="board"><div><a href="javascript:;" id="start">START</a></div><div>Level: <span id="level">?</span></div><div>Score: <span id="score">?</span></div><div><span id="countdown"></span></div></div></header><canvas id="gameboard" width="400" height="400"></canvas><footer><p class="help">Just use the keyboard arrows to handle the snake.</p><p>Snake adaptation v' + self.version + ' by <a href="http://matias.beckerle.com.ar" target="_blank" title="matiasb">matiasb</a></p></footer></div>';
            this.container.innerHTML = gameHtml;
              
            this.gameboard = document.getElementById('gameboard');
            this.start = document.getElementById('start');
            this.level = document.getElementById('level');
            this.score = document.getElementById('score');
            this.countdown = document.getElementById('countdown');
             
            return self.checkIfCanvasIsSupported();
        },
        refreshLevel: function() {
            this.level.innerHTML = self.currentLevel;
        },
        refreshScore: function() {
            this.score.innerHTML = self.score;
        },
        refreshCountdown: function() {
            this.countdown.innerHTML = self.countdownSeconds;
        },
        restart: function() {
            this.level.innerHTML = '?';
            this.score.innerHTML = '?';
            this.hideCountdown();
        },
        hideCountdown: function() {
            this.countdown.innerHTML = '';
        }
    };
    
    /**
     * The food object. Is the food taken by the snake.
     */
    this.Food = {
        randomPoint: [],
        draw: function() {
            this.calculateRandomPoint();
                    
            if (self.Snake.body.some(self.Snake.isPieceOfTail)) {
                this.draw();
            } else {
                self.context.fillStyle = '#f00';
                self.context.fillRect(this.randomPoint[0], this.randomPoint[1], self.size, self.size);
            }
        },
        calculateRandomPoint: function() {
            this.randomPoint = [
            Math.floor(Math.random() * (self.Screen.gameboard.width / self.size)) * self.size, 
            Math.floor(Math.random() * (self.Screen.gameboard.height / self.size)) * self.size
            ];
        }
    };
        
    /**
     * The snake itself.
     */    
    this.Snake = {
        body: [],
        position: {
            x: 0,
            y: 0
        },
        direction: 'right',
        length: 3,
        isPieceOfTail: function(element) {
            return (element[0] == self.Food.randomPoint[0] && element[1] == self.Food.randomPoint[1]);
        },
        hasEatenItself: function(element) {
            return (element[0] == self.Snake.position.x && element[1] == self.Snake.position.y);
        },
        draw: function(){
            if(self.Snake.position.x < 0 || self.Snake.position.x >= self.Screen.gameboard.width || self.Snake.position.y < 0 || self.Snake.position.y >= self.Screen.gameboard.height) {
                self.lost();
                return false;
            }
                
            if (self.Snake.body.some(self.Snake.hasEatenItself)) {
                self.lost();
                return false;
            }
                
            self.Snake.body.push([self.Snake.position.x, self.Snake.position.y]);
            self.context.fillStyle = '#00f';
            self.context.fillRect(self.Snake.position.x, self.Snake.position.y, self.size, self.size);
                
            if (self.Snake.body.length > self.Snake.length) {
                var tailPiece = self.Snake.body.shift();
                self.context.clearRect(tailPiece[0], tailPiece[1], self.size, self.size);
            }  
                
            if (self.Snake.position.x == self.Food.randomPoint[0] && self.Snake.position.y == self.Food.randomPoint[1]) {
                self.foodTaken++;
                self.Snake.length++;
                self.calculateScore();
            }
        },
        move: function(){
            switch(self.Snake.direction) {
                case 'left':
                    self.Snake.position.x -= self.size;
                    break;
                case 'up':
                    self.Snake.position.y -= self.size;
                    break;
                case 'right':
                    self.Snake.position.x += self.size;
                    break;
                case 'down':
                    self.Snake.position.y += self.size;
                    break;
                default:
                    break;
            }
                
            self.Snake.draw();
        },
        moveLeft: function(){
            self.Snake.direction = 'left';
        },
        moveUp: function(){
            self.Snake.direction = 'up';
        },
        moveRight: function(){
            self.Snake.direction = 'right';
        },
        moveDown: function(){
            self.Snake.direction = 'down';
        },
        bornAgain: function() {
            self.Snake.body = [];
            self.Snake.direction = 'right';
            self.Snake.length = 3;
        }
    };
    
    this.load();
    
}