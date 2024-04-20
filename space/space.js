//quadro
var tamanhodobloco = 32;
var linhas = 16;
var colunas = 16;

var quadro;
var quadroWidth = tamanhodobloco * colunas; // 32 * 16
var quadroHeight = tamanhodobloco * linhas; // 32 * 16
var context;

//nave
var naveWidth = tamanhodobloco*3;
var naveHeight = tamanhodobloco*3;
var naveX = tamanhodobloco * colunas/2 - tamanhodobloco;
var naveY = tamanhodobloco * linhas - tamanhodobloco*2;

var nave = {
    x : naveX,
    y : naveY,
    width : naveWidth,
    height : naveHeight
}

var naveImg;
var naveVelocityX = tamanhodobloco; //velocidade de movimento da nave

//invasores
var invasorArray = [];
var invasorWidth = tamanhodobloco*1.9;
var invasorHeight = tamanhodobloco*1.9;
var invasorX = tamanhodobloco;
var invasorY = tamanhodobloco;
var invasorImg;

var invasorlinhas = 2;
var invasorcolunas = 3;
var invasorCount = 0; //número de invasores para derrotar
var invasorVelocityX = 1; //velocidade do invasores

//balas
var balasArray = [];
var balasVelocityY = -10; //velocidade da bala

var somdotiro = new Audio("tiro.mp3")

var pontuação = 0;
var gameOver = false;

window.onload = function() {
    quadro = document.getElementById("quadro");
    quadro.width = quadroWidth;
    quadro.height = quadroHeight;
    context = quadro.getContext("2d"); //Usado para desenhar no quadro

    // Desenha o navio inicial
    // context.fillStyle="verde";
    // context.fillRect(nave.x, nave.y, nave.width, nave.height);

    //carrega as imagens
    naveImg = new Image();
    naveImg.src = "./nave.png";
    naveImg.onload = function() {
        context.drawImage(naveImg, nave.x, nave.y, nave.width, nave.height);
    }

    invasorImg = new Image();
    invasorImg.src = "./invasor.png";
    createinvasors();

    requestAnimationFrame(update);
    document.addEventListener("keydown", movenave);
    document.addEventListener("keyup", shoot);
}

function update() {
    requestAnimationFrame(update);

    if (gameOver) {
        return;
       
    }

    context.clearRect(0, 0, quadro.width, quadro.height);

    //nave
    context.drawImage(naveImg, nave.x, nave.y, nave.width, nave.height);

    //invasor
    for (var i = 0; i < invasorArray.length; i++) {
        var invasor = invasorArray[i];
        if (invasor.alive) {
            invasor.x += invasorVelocityX;

            //se o invasor tocar na borda
            if (invasor.x + invasor.width >= quadro.width || invasor.x <= 0) {
                invasorVelocityX *= -1;
                invasor.x += invasorVelocityX*2;

                //move todos os invasores para uma linha acima
                for (var j = 0; j < invasorArray.length; j++) {
                    invasorArray[j].y += invasorHeight;
                }
            }
            context.drawImage(invasorImg, invasor.x, invasor.y, invasor.width, invasor.height);

            if (invasor.y >= nave.y) {
                gameOver = true;
                window.alert('Você perdeu!');
                window.location.reload();
                
            }
        }
    }

    //balas
    for (var i = 0; i < balasArray.length; i++) {
        var balas = balasArray[i];
        balas.y += balasVelocityY;
        context.fillStyle="red";
        context.fillRect(balas.x, balas.y, balas.width, balas.height);

        //Colisão da bala com o invasor
        for (var j = 0; j < invasorArray.length; j++) {
            var invasor = invasorArray[j];
            if (!balas.used && invasor.alive && detectCollision(balas, invasor)) {
                balas.used = true;
                invasor.alive = false;
                invasorCount--;
                pontuação += 100;
            }
        }
    }

   
    while (balasArray.length > 0 && (balasArray[0].used || balasArray[0].y < 0)) {
        balasArray.shift(); //remove o primeiro elemento do array
    }

    //próximo level
    if (invasorCount == 0) {
        //aumente o número de invasores em colunas e linhas em 1
        pontuação += invasorcolunas * invasorlinhas * 100; //pontos extras :)
        invasorcolunas = Math.min(invasorcolunas + 1, colunas/2 -2); //limite em 16/2 -2 = 6
        invasorlinhas = Math.min(invasorlinhas + 1, linhas-4);  //limite em 16-4 = 12
        if (invasorVelocityX > 0) {
            invasorVelocityX += 0.2; //aumenta a velocidade do invasorígena para a direita
        }
        else {
            invasorVelocityX -= 0.2; //aumentar a velocidade de movimento do invasor para a esquerda
        }
        invasorArray = [];
        balasArray = [];
        createinvasors();
    }

    //pontuação
    context.fillStyle="white";
    context.font="20px courier";
    context.fillText(pontuação, 5, 20);
}

function movenave(e) {
    if (gameOver) {
        return;
       
    }

    if (e.code == "ArrowLeft" && nave.x - naveVelocityX >= 0) {
        nave.x -= naveVelocityX; //move um bloco para a esquerda
    }
    else if (e.code == "ArrowRight" && nave.x + naveVelocityX + nave.width <= quadro.width) {
        nave.x += naveVelocityX; //move um bloco para a direita
    }
}

function createinvasors() {
    for (var c = 0; c < invasorcolunas; c++) {
        for (var r = 0; r < invasorlinhas; r++) {
            var invasor = {
                img : invasorImg,
                x : invasorX + c*invasorWidth,
                y : invasorY + r*invasorHeight,
                width : invasorWidth,
                height : invasorHeight,
                alive : true
            }
            invasorArray.push(invasor);
        }
    }
    invasorCount = invasorArray.length;
}


function shoot(e) {
    if (gameOver) {
        return;
    }

    if (e.code == "Space") {

        somdotiro.play();

        //tiro
        var balas = {
            x : nave.x + naveWidth*15/32,
            y : nave.y,
            width : tamanhodobloco/8,
            height : tamanhodobloco/2,
            used : false
        }
        balasArray.push(balas);
    }
}

function detectCollision(a, b) {
    return a.x < b.x + b.width &&   //O canto superior esquerdo de a não alcança o canto superior direito de b
           a.x + a.width > b.x &&   //O canto superior direito de a passa pelo canto superior esquerdo de b
           a.y < b.y + b.height &&  //O canto superior esquerdo de a não alcança o canto inferior esquerdo de b
           a.y + a.height > b.y;    //O canto inferior esquerdo de a passa pelo canto superior esquerdo de b
}

