(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */



    function inside(  x, y, primitive  ) {
            // You should implement your inside test here for all shapes
            // for now, it only returns a false test
            if (primitive.shape == "triangle") {
                return insideTriangle(x, y, primitive);
            }

            //if (primitive.shape != "triangle") { triangular a primitiva e chamar inside para todos os triângulos resultantes }

            return false
    }

    function insideTriangle(x, y, triangle) {
        //Pontos do triângulo
        var p1 = new Point(0,0);
        var p2 = new Point(0,0);
        var p3 = new Point(0,0);

        //Pegando as coordenadas do primeiro ponto do triângulo
        p1.x = triangle.vertices[0][0];
        p1.y = triangle.vertices[0][1];

        //Pegando as coordenadas do segundo ponto do triângulo
        p2.x = triangle.vertices[1][0];
        p2.y = triangle.vertices[1][1];

        //Pegando as coordenadas do terceiro ponto do triângulo
        p3.x = triangle.vertices[2][0];
        p3.y = triangle.vertices[2][1];

        //Arestas do triângulo, usadas pra verificar se o ponto está dentro do triângulo
        var v1 = new Vector2(0,0);
        var v2 = new Vector2(0,0);
        var v3 = new Vector2(0,0);

        //Aqui eu calculo os vetores V1, V2 e V3, usados pra achar os vetores normais
        //V1 = P2 - P1
        v1.x = p2.x - p1.x;
        v1.y = p2.y - p1.y;

        //V2 = P3 - P2
        v2.x = p3.x - p2.x;
        v2.y = p3.y - p2.y;

        //V3 = P1 - P3
        v3.x = p1.x - p3.x;
        v3.y = p1.y - p3.y;

        //Vetores normais das arestas do triângulo
        var n1 = new Vector2(0,0);
        var n2 = new Vector2(0,0);
        var n3 = new Vector2(0,0);

        //Aqui eu acho as coordenadas do vetor normal de cada aresta
        //Onde, se eu tenho a aresta Vi = (x1,x2), ni = (-x2,x1)
        n1.x = -v1.y; n1.y = v1.x;
        n2.x = -v2.y; n2.y = v2.x;
        n3.x = -v3.y; n3.y = v3.x;

        //Variável usada para realizar o teste de inclusão.
        //Uso apenas uma pois não me interessa guardar os resultados, apenas saber se todos deram > 0. Ou seja, se teste <= 0 alguma vez, retorno false
        var teste = 0;

        //Vetor resultante da subtração (q - Pi), usado no teste de inclusão.
        //Também não preciso armazená-lo, então uso apenas uma variável
        var sub = new Vector2(0,0);

        //Seja "q" o ponto que eu quero saber se está dentro do triângulo
        //Teste ti = ni . (q - Pi) (Produto interno)
        //"q" está dentro do triângulo se teste >= 0 em todos os casos
        //teste > 0 -> ponto dentro do triângulo
        //teste = 0 -> ponto na borda do triângulo
        //Teste 1
        sub.x = x - p1.x;
        sub.y = y - p1.y;
        teste = vectorDot(n1, sub);
        if (teste < 0) { return false; }

        //Teste 2
        sub.x = x - p2.x;
        sub.y = y - p2.y;
        teste = vectorDot(n2, sub);
        if (teste < 0) { return false; }

        //Teste 3
        sub.x = x - p3.x;
        sub.y = y - p3.y;
        teste = vectorDot(n3, sub);
        if (teste < 0) { return false; }

        //Se não retornou false em nenhum teste, retorna true
        return true;
    }


    function Screen( width, height, scene ) {
        this.width = width;
        this.height = height;
        this.scene = this.preprocess(scene);
        this.createImage();
    }

    Object.assign( Screen.prototype, {

            preprocess: function(scene) {
                // Possible preprocessing with scene primitives, for now we don't change anything
                // You may define bounding boxes, convert shapes, etc

                var preprop_scene = [];

                for( var primitive of scene ) {
                    // do some processing
                    // for now, only copies each primitive to a new list

                    preprop_scene.push( primitive );

                }


                return preprop_scene;
            },

            createImage: function() {
                this.image = nj.ones([this.height, this.width, 3]).multiply(255);
            },

            rasterize: function() {
                var color;

                // In this loop, the image attribute must be updated after the rasterization procedure.
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

    //Classe ponto pra deixar mais legível as operações com os pontos do triângulo
    class Point {
        constructor(x,y) {
            this.x = x;
            this.y = y;
        }
    }

    //Classe vetor 2D para deixar mais legível as operações entre vetores
    class Vector2 {
        constructor(x, y) {
            this.x = x;
            this.y = y;
        }

        //Soma
        vectorAdd(vec1, vec2) {
            var vecRes = new Vector2(0,0);
            vecRes.x = vec1.x + vec2.x;
            vecRes.y = vec1.y + vec2.y;
            return vecRes;
        }

        //Subtração
        vectorSub(vec1, vec2) {
            var vecRes = new Vector2(0,0);
            vecRes.x = vec1.x - vec2.x;
            vecRes.y = vec1.y - vec2.y;
            return vecRes;
        }

        //Produto interno
        vectorDot(vec1, vec2) {
            var dotProduct = 0;
            var dotX = vec1.x * vec2.x;
            var dotY = vec1.y * vec2.y;
            dotProduct = dotX + dotY;
            return dotProduct;
        }
    }

    exports.Screen = Screen;

})));
