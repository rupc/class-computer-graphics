var canvas;
var gl;
var program;

var pyramidVertexPositionBuffer;
var pyramidVertexColorBuffer;

var cubeVertexPositionBuffer;
var cubeVertexColorBuffer;
var cubeVertexIndexBuffer;

var lookAtMatrix;
var mvMatrix;
var pMatrix;

var rPyramid = 0;
var rCube = 0;
var rTotal = 0;

var lastTime = 0;
var mode = 0;
var axis_show=0;


window.onload = function init(){
    canvas = document.getElementById("gl-canvas");
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert("WebGL isn't available");}
	
    gl.viewportWidth = canvas.width;
    gl.viewportHeight = canvas.height;
    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

 //event listeners for buttons
    
    document.getElementById( "obj_stop" ).onclick = function () {
        mode =0;
    };
    document.getElementById( "obj_rotation" ).onclick = function () {
        mode =1;
    };
    document.getElementById( "obj_revolution" ).onclick = function () {
         mode =2;
    };
    document.getElementById( "obj_both" ).onclick = function () {
         mode =3;
    };
        document.getElementById( "show_axis" ).onclick = function () {

		if(axis_show==1){
			axis_show = 0;
			document.getElementById( "show_axis" ).innerHTML = "Show Axis";
		}else{
			axis_show = 1;
			document.getElementById( "show_axis" ).innerHTML = "Hide Axis";		
		}


    };
 

	
    initShaderProgram();
    initBuffer();
    render();
}

function initShaderProgram(){
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    program.vertexPositionAttribute = gl.getAttribLocation( program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);

    program.vertexColorAttribute = gl.getAttribLocation( program, "vColor");
    gl.enableVertexAttribArray(program.vertexColorAttribute);

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
	
}

function initBuffer(){
    pyramidVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);


    var vertices = [
            // Front face
             0.0,  1.0,  0.0,
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,

            // Right face
             0.0,  1.0,  0.0,
             1.0, -1.0,  1.0,
             1.0, -1.0, -1.0,

            // Back face
             0.0,  1.0,  0.0,
             1.0, -1.0, -1.0,
            -1.0, -1.0, -1.0,

            // Left face
             0.0,  1.0,  0.0,
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0
    ];
        
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    pyramidVertexPositionBuffer.itemSize = 3;
    pyramidVertexPositionBuffer.numItems = 12;

    pyramidVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);

    var colors = [
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,
            0.0, 1.0, 0.0, 1.0,

            // Right face
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,
            1.0, 0.0, 0.0, 1.0,

            // Back face
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,
            0.0, 0.0, 1.0, 1.0,

            // Left face
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0,
            1.0, 1.0, 0.0, 1.0
    ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colors), gl.STATIC_DRAW);
    pyramidVertexColorBuffer.itemSize = 4;
    pyramidVertexColorBuffer.numItems = 12;

    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);

    vertices = [
            // Front face
            -1.0, -1.0,  1.0,
             1.0, -1.0,  1.0,
             1.0,  1.0,  1.0,
            -1.0,  1.0,  1.0,

            // Back face
            -1.0, -1.0, -1.0,
            -1.0,  1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0, -1.0, -1.0,

            // Top face
            -1.0,  1.0, -1.0,
            -1.0,  1.0,  1.0,
             1.0,  1.0,  1.0,
             1.0,  1.0, -1.0,

            // Bottom face
            -1.0, -1.0, -1.0,
             1.0, -1.0, -1.0,
             1.0, -1.0,  1.0,
            -1.0, -1.0,  1.0,

            // Right face
             1.0, -1.0, -1.0,
             1.0,  1.0, -1.0,
             1.0,  1.0,  1.0,
             1.0, -1.0,  1.0,

            // Left face
            -1.0, -1.0, -1.0,
            -1.0, -1.0,  1.0,
            -1.0,  1.0,  1.0,
            -1.0,  1.0, -1.0
    ];

    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cubeVertexPositionBuffer.itemSize = 3;
    cubeVertexPositionBuffer.numItems = 24;

    cubeVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);

    colors = [
            [1.0, 0.0, 0.0, 1.0], // Front face
            [1.0, 1.0, 0.0, 1.0], // Back face
            [0.0, 1.0, 0.0, 1.0], // Top face
            [1.0, 0.5, 0.5, 1.0], // Bottom face
            [1.0, 0.0, 1.0, 1.0], // Right face
            [0.0, 0.0, 1.0, 1.0]  // Left face
    ];

    var unpackedColors = [];
    for (var i in colors) {
	var color = colors[i];
	for (var j=0; j < 4; j++) {
		unpackedColors = unpackedColors.concat(color);
	}
    }
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    cubeVertexColorBuffer.itemSize = 4;
    cubeVertexColorBuffer.numItems = 24;

    cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    var cubeVertexIndices = [
            0, 1, 2,      0, 2, 3,    // Front face
            4, 5, 6,      4, 6, 7,    // Back face
            8, 9, 10,     8, 10, 11,  // Top face
            12, 13, 14,   12, 14, 15, // Bottom face
            16, 17, 18,   16, 18, 19, // Right face
            20, 21, 22,   20, 22, 23  // Left face
	];
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
	cubeVertexIndexBuffer.itemSize = 1;
	cubeVertexIndexBuffer.numItems = 36;	
}


function drawScene() {
    // 여기서 색상이 전부 사라짐...
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
	
    var pMatrix = perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    

    // mvMatrix for pyramid 
    var mvMatrix = lookAtMatrix;
    //mvMatrix = translate(0.0, 0.0, -10.0);
    mvMatrix = mult( mvMatrix, translate(0.0, 0.0, -10.0));
    // --- end of modification 

    if(axis_show){
        xyzAxisObject(gl, 0.3, pMatrix, mvMatrix);	
        //rotateAxisObject(2);
    }
    mvMatrix = mult(mvMatrix, rotate(rTotal, [0, 1, 0]));
    mvMatrix =  mult(mvMatrix, translate(2, 0.0, 0.0));
    if(axis_show) rotateAxisObject(1.2);

    mvMatrix = mult(mvMatrix, rotate(rPyramid, [0, 1, 0]));	
    if(axis_show) xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, pyramidVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, pyramidVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, pyramidVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawArrays(gl.TRIANGLES, 0, pyramidVertexPositionBuffer.numItems);
	
    // --- drawing cube
    mvMatrix = lookAtMatrix;
    //mvMatrix = translate(0.0, 0.0, -10.0);
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -10.0));

    mvMatrix = mult(mvMatrix, rotate(rTotal, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(-2, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(rCube, [1, 1, 1]));
	
    if(axis_show)xyzAxisObject(gl, 1.2, pMatrix, mvMatrix);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, cubeVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);

    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	

    //--drawing axis
    mvMatrix = lookAtMatrix;

    //mvMatrix = translate(0.0, 0.0, -10.0);
    mvMatrix = mult(mvMatrix, translate(0.0, 0.0, -10.0));
    mvMatrix = mult(mvMatrix, rotate(rTotal, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(-2, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(45, [1,  0, 0]));
    mvMatrix = mult(mvMatrix, rotate(-35, [0,  0, 1]));
    if(axis_show) rotateAxisObject(1.9);
}

function setNextTimeScene() {
    var timeNow = new Date().getTime();
    var elaped;
    
    switch(mode){
    case 0: 
		lastTime = timeNow;
		break;
    case 1: 
        if (lastTime != 0) {
            elapsed = timeNow - lastTime;
            rPyramid += (90 * elapsed) / 1000.0;
            rCube += (180 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
        break;
    case 2: 
        if (lastTime != 0) {
            elapsed = timeNow - lastTime;
	    rTotal += (45 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
        break;
    case 3:
        if (lastTime != 0) {
            elapsed = timeNow - lastTime;
            rPyramid += (90 * elapsed) / 1000.0;
            rCube += (180 * elapsed) / 1000.0;
	    rTotal += (45 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }
}

function render() {

    // --- camera setting ----  
    // gl.clearColor(255,0,0,1);
    // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    
    lookAtMatrix = lookAt( vec3(0,0,0), vec3(0,0,-10), vec3(0,1,0) );
    gl.viewport(canvas.width/2, canvas.height/2, canvas.width/2, canvas.height/2);
    drawScene();

    lookAtMatrix = lookAt( vec3(0,10,0), vec3(0,0,-10), vec3(0,1,0) );
    gl.viewport(0, canvas.height/2, canvas.width/2, canvas.height/2);
    drawScene();

    lookAtMatrix = lookAt( vec3(0,10,0), vec3(0,0,-10), vec3(0,1,0) );
    gl.viewport(0, 0, canvas.width/2, canvas.height/2);
    drawScene();

    lookAtMatrix = lookAt( vec3(0,10,0), vec3(0,0,-10), vec3(0,1,0) );
    gl.viewport(canvas.width/2, 0, canvas.width/2, canvas.height/2);
    drawScene();



    // lookAtMatrix = lookAt( vec3(0,10,0), vec3(0,0,-10), vec3(0,1,0) );
    // drawScene();

    setNextTimeScene();	
    window.requestAnimFrame(render);	
}
