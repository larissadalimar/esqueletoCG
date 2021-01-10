(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (global = global || self, factory(global.BasicRenderer = {}));
}(this, (function (exports) { 'use strict';


        /* ------------------------------------------------------------ */


    //Função que calcula as coordenadas da Bounding Box da primitiva
    //Para fazer isso, coloco as coordenadas x e y de todos os pontos em arrays separados, e então pego os valores mínimos e máximos de x e de y
    //A função então retorna um par de coordenadas que define os limites do retângulo da Bounding Box
    function bounding_box(primitive) {
        var arrX = [];
        //Array auxiliar com as coordenadas x de cada ponto da primitiva
        //Para cada ponto, adiciono sua coordenada x ao array
        for (vertice in primitive.vertices) {
            arrX.push(vertice[0]);
        }
        var arrY = [];
        //Array auxiliar com as coordenadas y de cada ponto da primitiva
        //Para cada ponto, adiciono sua coordenada y ao array
        for (vertice in primitive.vertices) {
            arrY.push(vertice[1]);
        }

        var minX = Math.min(arrX);
        var minY = Math.min(arrY);
        var maxX = Math.max(arrX);
        var maxY = Math.max(arrY);

        return [[minX,minY], [maxX,maxY]];
    }

    function inside(  x, y, primitive  ) {
            // You should implement your inside test here for all shapes
            // for now, it only returns a false test


            if (primitive.shape == "triangle") {
                return insideTriangle(x, y, primitive);
            }

            
            return false
    }

    function multiplicaMatrizVetor(triangle){

        for(var j = 0; j < triangle.vertices.length; j++){

            triangle.vertices[j][2] = 1.;
        
            var VetorTemp = [0, 0, 0];
            for(var l = 0; l < 3; l++){
                for(var k = 0; k < 3; k++){
                    VetorTemp[l] += triangle.xform[l][k]*triangle.vertices[j][k];
                }                
            } 

            triangle.vertices[j] = VetorTemp;

        }
    }

    function insideTriangle(x, y, triangle) {
        //Ponto que quero calcular se está dentro do triângulo
        var q = [x, y];

        //Pontos do triângulo
        var p0 = [triangle.vertices[0][0], triangle.vertices[0][1]];
        var p1 = [triangle.vertices[1][0], triangle.vertices[1][1]];
        var p2 = [triangle.vertices[2][0], triangle.vertices[2][1]];

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

        //Variável usada para realizar o teste de inclusão.
        //Uso apenas uma pois não me interessa guardar os resultados, apenas saber se todos deram > 0. Ou seja, se teste <= 0 alguma vez, retorno false
        var teste = 0;

        //Vetor resultante da subtração (q - Pi), usado no teste de inclusão.
        //Também não preciso armazená-lo, então uso apenas uma variável
        var sub = [0,0];

        //Seja "q" o ponto que eu quero saber se está dentro do triângulo
        //Teste ti = ni . (q - Pi) (Produto interno)
        //"q" está dentro do triângulo se teste >= 0 em todos os casos
        //teste > 0 -> ponto dentro do triângulo
        //teste = 0 -> ponto na borda do triângulo
        //Teste 1
        sub = [x - p0[0], y - p0[1]];
        teste = n1[0]*sub[0] + n1[1]*sub[1]; //t1 = n1 . (q - p0) (Produto interno)
        if (teste < 0) { return false; }

        //Teste 2
        sub = [x - p1[0], y - p1[1]];
        teste = n2[0]*sub[0] + n2[1]*sub[1]; //t2 = n2 . (q - p1) (Produto interno)
        if (teste < 0) { return false; }

        //Teste 3
        sub = [x - p2[0], y - p2[1]];
        teste = n3[0]*sub[0] + n3[1]*sub[1]; //t3 = n3 . (q - p2) (Produto interno)
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

                    switch(primitive.shape){
                        case "polygon":
                           var n = primitive.vertices.length;
                            for (var i = 1; i < n - 1; i++){

                                var triangle = 
                                    {  
                                        shape: "triangle",
                                        vertices: [ primitive.vertices[0], primitive.vertices[i], primitive.vertices[i+1] ],
                                        color: primitive.color
                                    }
                                
                               
                                if(primitive.hasOwnProperty('xform')){
                                    triangle.xform = primitive.xform;
                                    multiplicaMatrizVetor(triangle);
                                }

                                preprop_scene.push(triangle);
                            }
                        break;
                        case "circle": 
                        break;
                        default:
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