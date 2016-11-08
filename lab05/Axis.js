function xyzAxisObject(gl, xyzScale, pMatrix, mvMatrix){
	// init buffer
    var xyzAxisVertexPositionBuffer;
    var xyzAxisVertexColorBuffer;
    var xyzAxisVertexIndexBuffer;
	
    xyzAxisVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xyzAxisVertexPositionBuffer);
    var vertices = [
            -1.0, 0.0, 0.0,
	     1.0, 0.0, 0.0,
			
             0.0,-1.0, 0.0,
	     0.0, 1.0, 0.0,
			
             0.0, 0.0, 1.0,
	     0.0, 0.0,-1.0	
        ];
    for(var i=0; i<vertices.length; i++)
		vertices[i] *= xyzScale;
		
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    xyzAxisVertexPositionBuffer.itemSize = 3;
    xyzAxisVertexPositionBuffer.numItems = 6;

    xyzAxisVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, xyzAxisVertexColorBuffer);

    var colors= [
		[1.0, 0.0, 0.0, 1.0], 
		[0.0, 1.0, 0.0, 1.0], 
		[0.0, 0.0, 1.0, 1.0]
	];
    
    var unpackedColors = [];
    for (var i in colors) {
	var color = colors[i];
	for (var j=0; j < 2; j++) {
		unpackedColors = unpackedColors.concat(color);
	}
    }
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    xyzAxisVertexColorBuffer.itemSize = 4;
    xyzAxisVertexColorBuffer.numItems = 6;

    xyzAxisVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, xyzAxisVertexIndexBuffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 3, 4, 5]), gl.STATIC_DRAW);
    xyzAxisVertexIndexBuffer.itemSize = 1;
    xyzAxisVertexIndexBuffer.numItems = 6;	
	
    // draw
    gl.bindBuffer(gl.ARRAY_BUFFER, xyzAxisVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, xyzAxisVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, xyzAxisVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, xyzAxisVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, xyzAxisVertexIndexBuffer);
	
    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));
	
    gl.drawElements(gl.LINES, xyzAxisVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
}


function rotateAxisObject(scale){
    // init buffer
    var axisVertexPositionBuffer;
    var axisVertexColorBuffer;
    var axisVertexIndexBuffer;
	
    axisVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisVertexPositionBuffer);
	
    var vertices = [
             0.0,-1.0, 0.0,
	     0.0, 1.0, 0.0,
    ];
    for(var i=0; i<vertices.length; i++)
		vertices[i] *= scale;
		
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    axisVertexPositionBuffer.itemSize = 3;
    axisVertexPositionBuffer.numItems = 2;

    axisVertexColorBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, axisVertexColorBuffer);

    var unpackedColors = [1.0, 0.0, 1.0, 1.0, 1.0, 0.0, 1.0, 1.0];
	
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(unpackedColors), gl.STATIC_DRAW);
    axisVertexColorBuffer.itemSize = 4;
    axisVertexColorBuffer.numItems = 2;

    axisVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axisVertexIndexBuffer);

    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1]), gl.STATIC_DRAW);
    axisVertexIndexBuffer.itemSize = 1;
    axisVertexIndexBuffer.numItems = 2;	
	
    // draw
    gl.bindBuffer(gl.ARRAY_BUFFER, axisVertexPositionBuffer);
    gl.vertexAttribPointer(program.vertexPositionAttribute, axisVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, axisVertexColorBuffer);
    gl.vertexAttribPointer(program.vertexColorAttribute, axisVertexColorBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, axisVertexIndexBuffer);
	
    gl.uniformMatrix4fv(program.pMatrixUniform, false, flatten(pMatrix));
    gl.uniformMatrix4fv(program.mvMatrixUniform, false, flatten(mvMatrix));
	
    gl.drawElements(gl.LINES, axisVertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);	
}

