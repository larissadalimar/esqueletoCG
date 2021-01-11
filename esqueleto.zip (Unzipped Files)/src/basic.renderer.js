(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------
            Alunos:
            Larissa Dalimar Lima Viana              DRE: 117213958
            Miguel Santos de Araujo do Nascimento   DRE: 115191914
            Tarefa Prática 1 - Computação Gráfica 2020.1
        */



    //Funcao que calcula as coordenadas da Bounding Box da primitiva
    //Para fazer isso, coloco as coordenadas x e y de todos os pontos em arrays separados,
        //e entao pego os valores minimos e maximos de x e de y
    //A funcao entao retorna um objeto com os limites do retangulo da Bounding Box

    function bounding_box(primitive) {

        //Arrays auxiliares com as coordenadas x e y de cada ponto da primitiva
        //Para cada ponto, adiciono sua coordenada ao respectivo array
        var arrX = [];
        var arrY = [];
        for (var vertice of primitive.vertices) {
            arrX.push(vertice[0]);
            arrY.push(vertice[1]);
        }

        var xMin = Math.min.apply(Math, arrX);
        var yMin = Math.min.apply(Math, arrY);
        var xMax = Math.max.apply(Math, arrX);
        var yMax = Math.max.apply(Math, arrY);

        xMin = Math.floor(xMin);
        yMin = Math.floor(yMin);
        xMax = Math.ceil(xMax);
        yMax = Math.ceil(yMax);

        var box = {
                minX: xMin,
                minY: yMin,
                maxX: xMax,
                maxY: yMax
            }

        return box;
    }

    function inside(  x, y, primitive  ) {
            // You should implement your inside test here for all shapes
            // for now, it only returns a false test

            //Ponto que quero calcular se esta dentro do triangulo
            var q = [x, y];

            //Pontos do triangulo
            var p0 = [primitive.vertices[0][0], primitive.vertices[0][1]];
            var p1 = [primitive.vertices[1][0], primitive.vertices[1][1]];
            var p2 = [primitive.vertices[2][0], primitive.vertices[2][1]];

            //Aqui eu calculo os vetores V1, V2 e V3, usados pra achar os vetores normais

            //V1 = p1 - p0
            var v1 = [p1[0] - p0[0], p1[1] - p0[1]];

            //V2 = p2 - p1
            var v2 = [p2[0] - p1[0], p2[1] - p1[1]];

            //V3 = p0 - p2
            var v3 = [p0[0] - p2[0], p0[1] - p2[1]];

            //Aqui eu acho as coordenadas do vetor normal de cada aresta
            //Onde, se eu tenho a aresta Vi = (x,y), ni = (-y,x)
            var n1 = [-v1[1], v1[0]];
            var n2 = [-v2[1], v2[0]];
            var n3 = [-v3[1], v3[0]];

            //Variavel usada para realizar o teste de inclusao.
            //Uso apenas uma pois nao me interessa guardar os resultados, apenas saber se todos deram >= 0.
            //Ou seja, se teste < 0 alguma vez, retorno false
            var teste = 0;

            //Vetor resultante da subtracao (q - Pi), usado no teste de inclusao.
            //Também nao preciso armazena-la, entao uso apenas uma variavel
            var sub = [0,0];

            //Seja "q" o ponto que eu quero saber se esta dentro do triangulo
            //Teste ti = ni . (q - Pi) (Produto interno)
            //"q" esta dentro do triangulo se teste >= 0 em todos os casos
            //teste > 0 -> ponto dentro do triangulo
            //teste = 0 -> ponto na borda do triangulo

            //Teste 1
            sub = [x - p0[0], y - p0[1]];
            //t1 = n1 . (q - p0) (Produto interno)
            teste = n1[0]*sub[0] + n1[1]*sub[1];
            if (teste < 0) { return false; }

            //Teste 2
            sub = [x - p1[0], y - p1[1]];
            //t2 = n2 . (q - p1) (Produto interno)
            teste = n2[0]*sub[0] + n2[1]*sub[1];
            if (teste < 0) { return false; }

            //Teste 3
            sub = [x - p2[0], y - p2[1]];
            //t3 = n3 . (q - p2) (Produto interno)
            teste = n3[0]*sub[0] + n3[1]*sub[1];
            if (teste < 0) { return false; }

            //Se nao retornou false em nenhum teste, retorna true
            return true;
    }

    function triangulateCircle(circle) {
        var p0 = circle.center;
        var r = circle.radius;

        //Numero de pontos gerados para triangular o circulo
        var num_pontos = 50;

        //Angulo formado pelas arestas originadas por 2 pontos adjacentes,
            //sem ser a aresta que os conecta, que se encontram no centro do circulo
        //OBS: theta esta em graus
        var theta = 360 / num_pontos;
        //Passando theta pra radianos
        theta = theta * (Math.PI/180);

        //Array com os pontos gerados, inicializado como vazio
        var pontos = [];

        //OBS: em coordenadas polares tradicionais, temos p = (r*cos(theta), r*sen(theta))
            //mas nesse caso, o angulo theta e medido a partir do eixo x, no sentido anti horario.
            //Aqui, como quero que o primeiro ponto esteja nas coordenadas (0,r) (tomando o centro do circulo como origem),
            //o angulo theta sera medido a partir do eixo y, logo, as coordenas serao p = (r*sen(theta), r*cos(theta)),
            //com o angulo expandindo no sentido horario
        //Como tenho p = (r*sen(theta), r*cos(theta)) quando o centro do circulo esta na origem,
            //se o circulo tem centro de coordenadas C = (Cx, Cy),
            //basta adicionar Cx e Cy as coordenadas de p.
            //Com isso, tenho que p = (Cx + r*sen(theta), Cy + r*cos(theta))

        //Loop que adiciona os pares de coordenadas dos pontos
        for (var i = 0; i <= num_pontos; i++) {
            //pi = (Cx + r*sen(i*theta), Cy + r*cos(i*theta))
            var pi = [p0[0] + r*Math.sin(i*theta), p0[1] + r*Math.cos(i*theta) ];
            //Note que o ultimo ponto do array tera as mesmas coordenadas do primeiro
            //A razao de colocar o mesmo ponto 2 vezes é pra facilitar na hora de pegar os pontos do ultimo triangulo
            //Isso ficara mais claro na hora de criar os triangulos que representam o circulo
            pontos.push(pi);
        }

        //A funcao retorna
        return pontos;
    }

    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);
        this.createImage();
    }

    function multiplicaMatrizVetor(triangle){

        //Para cada vértice da primitiva vamos aplicar a tranformação afim xform
        for(var j = 0; j < triangle.vertices.length; j++){

            triangle.vertices[j][2] = 1.; //Coordenada homogênea aplicada

            var VetorTemp = [0, 0, 0];
            for(var l = 0; l < 3; l++){     //multiplicação entre xform e o vértice
                for(var k = 0; k < 3; k++){
                    VetorTemp[l] += triangle.xform[l][k]*triangle.vertices[j][k];
                }
            }

            triangle.vertices[j] = VetorTemp; //novo vétice após a tranformação

        }
    }

    function verifyTransformation(primitive, triangle){

        if(primitive.hasOwnProperty('xform')){
            triangle.xform = primitive.xform;
            multiplicaMatrizVetor(triangle);
        }

    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc

                var preprop_scene = [];
                var box;

                for( var primitive of scene ) {
                    // do some processing
                    // for now, only copies each primitive to a new list
                    if (primitive.shape == "triangle") {
                        box = bounding_box(primitive);
                    }

                    switch(primitive.shape){
                        case "polygon": //transforma polígonos em triangulos
                           var n = primitive.vertices.length;
                            for (var i = 1; i < n - 1; i++){

                                var triangle =
                                    {
                                        shape: "triangle",
                                        vertices: [ primitive.vertices[0], primitive.vertices[i], primitive.vertices[i+1] ],
                                        color: primitive.color
                                    }

                                verifyTransformation(primitive, triangle);

                                preprop_scene.push(triangle);
                            }
                        break;
                        case "circle": //tranforma círculo em triângulos
                            var pontos = triangulateCircle(primitive);
                            for (var i = 0; i < pontos.length - 1; i++) {
                                var triangle =
                                    {
                                        shape: "triangle",
                                        vertices: [primitive.center, pontos[i+1], pontos[i] ],
                                        color: primitive.color
                                    }

                                verifyTransformation(primitive, triangle);
                                preprop_scene.push(triangle);
                            }
                        break;
                        default: //quando a primitiva já é um triangulo

                            if(primitive.hasOwnProperty('xform'))
                                multiplicaMatrizVetor(primitive);

                            preprop_scene.push( primitive );
                    }
                }
                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;

                var box = [];

                // In this loop, the image attribute must be updated after the rasterization procedure.
                for( var primitive of this.scene ) {
                    //box = [[minX,minY], [maxX,maxY]]
                    box = bounding_box(primitive);

                    // Loop through all pixels
                    for (var i = box.minX; i < box.maxX; i++) {
                        var x = i + 0.5;
                        for( var j = box.minY; j < box.maxY; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = nj.array(primitive.color);
                                this.set_pixel( i, this.height - (j + 1), color );
                            }

                        }
                    }
                }

                /*
                //Original, iterava por todo o canvas
                for( var primitive of this.scene ) {

                    // Loop through all pixels
                    for (var i = 0; i < this.width; i++) {
                        var x = i + 0.5;
                        for( var j = 0; j < this.height; j++) {
                            var y = j + 0.5;

                            // First, we check if the pixel center is inside the primitive
                            if ( inside( x, y, primitive ) ) {
                                // only solid colors for now
                                color = nj.array(primitive.color);
                                this.set_pixel( i, this.height - (j + 1), color );
                            }

                        }
                    }
                }
                */


            },

            set_pixel: function( i, j, colorarr ) {
                // We assume that every shape has solid color

                this.image.set(j, i, 0,    colorarr.get(0));
                this.image.set(j, i, 1,    colorarr.get(1));
                this.image.set(j, i, 2,    colorarr.get(2));
            },

            update: function () {
                // Loading HTML element
                var $image = document.getElementById('raster_image');
                $image.width = this.width; $image.height = this.height;

                // Saving the image
                nj.images.save( this.image, $image );
            }
        }


    );
    exports.Screen = Screen;

})));
