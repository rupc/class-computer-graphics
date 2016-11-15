var canvas;
var gl;
var program;

var cubeVertexPositionBuffer;
var cubeVertexIndexBuffer;
var cubeNormalBuffer;
 
var sphereVertexPositionBuffer;
var sphereNormalBuffer;
var index = 0; //구를 생성하기 위해 호출되는 정점의 개수 
// 구체 면을 나누는 단계
var numTimesToSubdivide = 4;//삼각메쉬 분할개수
 
var floorVertexPositionBuffer;
var floorVertexIndexBuffer;
var floorNormalBuffer;

var lookAtMatrix;
var mvMatrix;
var pMatrix;


// Light 속성
var lightPosition = vec4(0.0, 5.0, 10.0, 0.0 ); //광원의 위치
var lightAmbient = vec4(0.5, 0.5, 0.5, 1.0 );
var lightDiffuse = vec4( 1.0, 1.0, 1.0, 1.0 );
var lightSpecular = vec4( 1.0, 1.0, 1.0, 1.0 );

// 재질 속성
var materialAmbient = vec4( 1.0, 0.0, 1.0, 1.0 );
var materialDiffuse = vec4( 0.4, 0.4, 0.0, 1.0);
var materialSpecular = vec4( 1.0, 0.8, 0.0, 1.0 );
var materialShininess = 100.0;

var ambientColor, diffuseColor, specularColor; //light*material


// for interface control
var rSphere = 0;
var rCube = 0;
var rTotal = 0;

var lastTime = 0;
var mode = 0;

// 구체 생성(초기값-사면체) 알고리즘 - 교재 참조
var va = vec4(0.0, 0.0, -1.0,1);
var vb = vec4(0.0, 0.942809, 0.333333, 1);
var vc = vec4(-0.816497, -0.471405, 0.333333, 1);
var vd = vec4(0.816497, -0.471405, 0.333333,1);

var sphereVertices = [];
var sphereNormals = [];

function triangle(a, b, c) {
     sphereVertices.push(a);
     sphereVertices.push(b);      
     sphereVertices.push(c);
    
     // normals are vectors    
     sphereNormals.push(a[0],a[1], a[2], 0.0);
     sphereNormals.push(b[0],b[1], b[2], 0.0);
     sphereNormals.push(c[0],c[1], c[2], 0.0);

     index += 3;     
}

function divideTriangle(a, b, c, count) {
    if ( count > 0 ) {             
        var ab = mix( a, b, 0.5); //a, b위치의 중점(0.5)
        var ac = mix( a, c, 0.5);
        var bc = mix( b, c, 0.5);
                
        ab = normalize(ab, true);
        ac = normalize(ac, true);
        bc = normalize(bc, true);
                                
        divideTriangle( a, ab, ac, count - 1 );
        divideTriangle( ab, b, bc, count - 1 );
        divideTriangle( bc, c, ac, count - 1 );
        divideTriangle( ab, bc, ac, count - 1 );
    }
    else { 
        triangle( a, b, c );
    }
}

function tetrahedron(a, b, c, d, n) {
    divideTriangle(a, b, c, n);
    divideTriangle(d, c, b, n);
    divideTriangle(a, d, b, n);
    divideTriangle(a, c, d, n);
}
/////////////////////////////////////////////////

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
	
    initShaderProgram();
    initBuffer();
    render();
}

function initShaderProgram(){
    var ambientProduct = mult(lightAmbient, materialAmbient);
    var diffuseProduct = mult(lightDiffuse, materialDiffuse);
    var specularProduct = mult(lightSpecular, materialSpecular);
	
    program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
	
    program.vertexPositionAttribute = gl.getAttribLocation( program, "vPosition");
    gl.enableVertexAttribArray(program.vertexPositionAttribute);
	
    program.normalAttribute = gl.getAttribLocation( program, "vNormal");
    gl.enableVertexAttribArray(program.normalAttribute);

    program.pMatrixUniform = gl.getUniformLocation(program, "uPMatrix");
    program.mvMatrixUniform = gl.getUniformLocation(program, "uMVMatrix");
    program.lookAtMatrixUniform = gl.getUniformLocation(program, "uLookAtMatrix");

    //shader에 보낼 변수와 vertex shader에서 사용할 변수(""안의 변수)에 값 넘겨줌.
    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));	
    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(lightPosition));       
    gl.uniform1f(gl.getUniformLocation(program, "shininess"),materialShininess);
}

function initBuffer(){
    //cube
    cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    var vertices = [
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

    //for normal vector of cube face
    cubeNormalBuffer  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(flatten(makeCubeNormals(vertices))), gl.STATIC_DRAW);
    cubeNormalBuffer.itemSize = 3;
    cubeNormalBuffer.numItems = 24;
	
    // sphere
    tetrahedron(va, vb, vc, vd, numTimesToSubdivide);
    sphereNormalBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(sphereNormals), gl.STATIC_DRAW );	
	
    sphereVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(sphereVertices), gl.STATIC_DRAW);
	
    // floor
    floorVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
    vertices = [
		-10.0, 0.0, -10.0,
		-10.0, 0.0,  10.0, 
		 10.0, 0.0,  10.0, 
		 10.0, 0.0, -10.0
    ];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    floorVertexPositionBuffer.itemSize = 3;
    floorVertexPositionBuffer.numItems = 4;
	
    floorVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);

    var floorVertexIndices = [
       0, 1, 2, 0, 2, 3
	];
	
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(floorVertexIndices), gl.STATIC_DRAW);
    floorVertexIndexBuffer.itemSize = 1;
    floorVertexIndexBuffer.numItems = 6;
	
    floorNormalBuffer  = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, floorNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0]), gl.STATIC_DRAW);
    floorNormalBuffer.itemSize = 3;
    floorNormalBuffer.numItems = 4;
	
}

function makeCubeNormals(vertices) {
	var normals = [];
	for(var i=0; i<6*12; i+=12){//한 면에 하나의 법선벡터 계산
		var t1 = subtract(vec3(vertices[i+3], vertices[i+4], vertices[i+5]), vec3(vertices[i], vertices[i+1], vertices[i+2]));
		var t2 = subtract(vec3(vertices[i+6], vertices[i+7], vertices[i+8]), vec3(vertices[i+3], vertices[i+4], vertices[i+5]));
		var normal = cross(t1, t2);
		for(var j=0; j<4; j++)
			normals.push(vec3(normal));
	}
	return normals;
}

function render() {
    //gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // 45도
    lookAtMatrix = lookAt( vec3(0, 10, 0), vec3(0, 0, -10), vec3(0, 1, 0));	
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);	
	
    drawScene();	   
    setNextTimeScene();	
    window.requestAnimFrame(render);	
}

function drawScene() {
    pMatrix = perspective(45, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
	
    // cube
    mvMatrix = translate(0.0, 0.0, -10.0);
    mvMatrix = mult(mvMatrix, rotate(rTotal, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(-2, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(rCube, [0, 1, 0]));
		
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, cubeVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, cubeNormalBuffer);
    gl.vertexAttribPointer(program.normalAttribute, cubeNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cubeVertexIndexBuffer);
	
    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));
    gl.uniformMatrix4fv(program.lookAtMatrixUniform, false, flatten(lookAtMatrix));
	
    gl.drawElements(gl.TRIANGLES, cubeVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
	
    // sphere
    mvMatrix = translate(0.0, 0.0, -10.0);
    mvMatrix = mult(mvMatrix, rotate(rTotal, [0, 1, 0]));
    mvMatrix = mult(mvMatrix, translate(2, 0.0, 0.0));
    mvMatrix = mult(mvMatrix, rotate(rSphere, [1, 1, 1]));
	
    gl.bindBuffer( gl.ARRAY_BUFFER, sphereNormalBuffer);

    var vNormal = gl.getAttribLocation( program, "vNormal" );
    gl.vertexAttribPointer( vNormal, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vNormal);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, sphereVertexPositionBuffer);

    var vPosition = gl.getAttribLocation( program, "vPosition");
    gl.vertexAttribPointer(vPosition, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vPosition);	
	
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));

    for( var i=0; i<index; i+=3) 
        gl.drawArrays( gl.TRIANGLES, i, 3 ); 

    // floor
    mvMatrix = translate(0.0, -3.0, -10.0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, floorVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, floorVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);
	
    gl.bindBuffer(gl.ARRAY_BUFFER, floorNormalBuffer);
    gl.vertexAttribPointer(program.normalAttribute, floorNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);
    
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, floorVertexIndexBuffer);

    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));	
    gl.drawElements(gl.TRIANGLES, floorVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);		
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
            rSphere += (90 * elapsed) / 1000.0;
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
            rSphere += (90 * elapsed) / 1000.0;
            rCube += (180 * elapsed) / 1000.0;
			rTotal += (45 * elapsed) / 1000.0;
        }
        lastTime = timeNow;
    }
}


