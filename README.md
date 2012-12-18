# HTML5 & JavaScript Snake Game

adaptation by **Matias Beckerle**

Licensed under The MIT License (http://www.opensource.org/licenses/mit-license.php)

## Installation

1) Include the javascript and stylesheet files. For example:

    <link rel="stylesheet" href="css/main.css" type="text/css" />  
    <script src="js/snake.js"></script>

2) Create an html tag, like body, and identify it.

    <body id="body"></body>

3) Create the game object between script tags.

    <script type="text/javascript">
	var snake = new SnakeGame('body');
    </script>

## Enjoy :)

Play: http://matias.beckerle.com.ar/demos/snake/

## Acknowledgements

To all who wrote tutorials about HTML5 canvas.

## Changelog

### 1.1

* The snake start in the middle.
* Countdown added and some refactoring.
* Added new method "restart" in Screen object.
* Styling.

### 1.0

* First version.