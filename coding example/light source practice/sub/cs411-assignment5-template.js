"use strict";

////////////////////////////////////////////////////////////////////////////////////////
//
// cs411 assignment 5 - surface rendering
//
/////////////////////////////////////////////////////////////////////////////////////////

var canvas;
var gl;
var buffers;                        // vertex buffers
var model;                          // object model

var lastAnimationTime = Date.now(); // last time tick() was called
var angleStep = 10;                 // increments of rotation angle (degrees)
var fps = 30;                       // frames per second
var currentAngle = 0.0;             // current rotation angle [degree]

//var objName = 'https://raw.githubusercontent.com/cs411iit/public/master/mycube.obj'; 
var objName = 'https://raw.githubusercontent.com/cs411iit/public/master/cow.obj';  

var camZ = 0;
var scale = 1.0
var curRot = new Matrix4();
var leftRot = new Matrix4();
var rightRot = new Matrix4();
var upRot = new Matrix4();
var downRot = new Matrix4();
var tmpRot = new Matrix4();

// vec3(-0.35, 0.35, 0.87); old light direction
// vertex shader program
var VSHADER_SOURCE = 
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'attribute vec4 a_Normal;\n' +
  'uniform mat4 u_MvpMatrix;\n' +
  'uniform mat4 u_NormalMatrix;\n' +
  'uniform vec4 u_LightPos;\n' +
  'uniform vec3 u_attenuation;\n' +
  'uniform vec3 u_lightProps;\n' +
  'uniform vec3 u_materialProps;\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  vec3 lightDirection = normalize(vec3(u_LightPos - a_Position));\n' +
  '  float dist = distance(u_LightPos, a_Position);\n' +
  '  float attFactor = u_attenuation.x + u_attenuation.y * dist + u_attenuation.z * dist * dist;\n' +
  '  gl_Position = u_MvpMatrix * a_Position;\n' +
  '  vec3 normal = normalize(vec3(u_NormalMatrix * a_Normal));\n' +
  '  float nDotL = max(dot(normal, lightDirection), 0.0);\n' +
  '  vec3 camera = vec3(0.0, 500.0, 200.0);\n' +
//  '  v_Color = vec4(a_Color.rgb * nDotL, a_Color.a);\n' +
  '  v_Color = vec4(a_Color.rgb * (u_lightProps.x * u_materialProps.x + (u_lightProps.y * u_materialProps.y * nDotL + u_lightProps.z * u_materialProps.z * dot(normal, normalize(lightDirection + camera - vec3(a_Position)))) / attFactor), a_Color.a);\n' +
  '}\n';

// fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';


// event handlers

function turnLeft()
{
  tmpRot.set(leftRot);
  tmpRot.multiply(curRot);
  curRot.set(tmpRot);    
}

function turnRight()
{
  tmpRot.set(rightRot);
  tmpRot.multiply(curRot);
  curRot.set(tmpRot);    
}

function turnUp()
{
  tmpRot.set(upRot);
  tmpRot.multiply(curRot);
  curRot.set(tmpRot);    
}

function turnDown()
{
  tmpRot.set(downRot);
  tmpRot.multiply(curRot);
  curRot.set(tmpRot);    
}

function zoomIn()
{
  camZ+=1;
}

function zoomOut()
{
  camZ-=1;
  if (camZ<0) camZ=0;
}

function invertNormals()
{
    for(var i=0; i< model.arrays.normals.length; i++)
    {
        model.arrays.normals[i] *= -1
    }
    assignVertexBuffersData(gl, buffers, model)
}

function moveLightUp()
{
    lightPos.elements[1] += 1.0
}

function moveLightDown()
{
    lightPos.elements[1] -= 1.0
}

function moveLightLeft()
{
    lightPos.elements[0] -= 1.0
}

function moveLightRight()
{
    lightPos.elements[0] += 1.0
}

function moveLightForward()
{
    lightPos.elements[2] -= 1.0
}

function moveLightBackward()
{
    lightPos.elements[2] += 1.0
}

var lightProperties = new Vector3()
var materialProperties = new Vector3()
var attenuationProperties = new Vector3()
var lightPos = new Vector4(10.0, -10.0, 10.0, 1.0)

// because the normals are duplicated by the object loader, I find duplicate vertices and use the average of their associated normals as their normal
function smoothNormals() {
    // make a duplicate of the list of indices
    var indices = [...model.arrays.indices]
    var vertices = model.arrays.vertices
    
    while(indices.length > 0) {
        var duplicates = [indices.shift()]
        var choice = duplicates[0]
        
        // find duplicate vertices
        for(var i = 0; i < indices.length; i++) {
            if(vertices[choice * 3 + 0] == vertices[indices[i] * 3 + 0] && vertices[choice * 3 + 1] == vertices[indices[i] * 3 + 1] && vertices[choice * 3 + 2] == vertices[indices[i] * 3 + 2]) {
                duplicates.push(indices.splice(i, 1)[0])
                i--
            }
        }
        var sumX = 0
        var sumY = 0
        var sumZ = 0
        
        // sum the normals
        for(var i = 0; i < duplicates.length; i++) {
            sumX += model.arrays.normals[duplicates[i] * 3 + 0]
            sumY += model.arrays.normals[duplicates[i] * 3 + 1]
            sumZ += model.arrays.normals[duplicates[i] * 3 + 2]
        }
        
        // store the summed normals
        for(var i = 0; i < duplicates.length; i++) {
            model.arrays.normals[duplicates[i] * 3 + 0] = sumX
            model.arrays.normals[duplicates[i] * 3 + 1] = sumY
            model.arrays.normals[duplicates[i] * 3 + 2] = sumZ
        }
    }
    
    // normalize the normals
    for(var i = 0; i < model.arrays.normals.length / 3; i++) {
        var magnitude = Math.sqrt(model.arrays.normals[i * 3 + 0] * model.arrays.normals[i * 3 + 0] + model.arrays.normals[i * 3 + 1] * model.arrays.normals[i * 3 + 1] + model.arrays.normals[i * 3 + 2] * model.arrays.normals[i * 3 + 2])
        model.arrays.normals[i * 3 + 0] /= magnitude
        model.arrays.normals[i * 3 + 1] /= magnitude
        model.arrays.normals[i * 3 + 2] /= magnitude
    }
    assignVertexBuffersData(gl, buffers, model)
}

// create a buffer object, assign it to attribute variable, and enable the assignment
function createEmptyArrayBuffer(gl, a_attribute, num, type) 
{
  var buffer =  gl.createBuffer();  // Create a buffer object
  if (!buffer) {
    console.log('Failed to create the buffer object');
    return null;
  }
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(a_attribute, num, type, false, 0, 0);  // Assign the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_attribute);  // Enable the assignment

  return buffer;
}


function initVertexBuffers(gl, program) 
{
  var o = new Object(); // create new object. Utilize Object object to return multiple buffer objects
  o.vertexBuffer = createEmptyArrayBuffer(gl, program.a_Position, 3, gl.FLOAT); 
  o.normalBuffer = createEmptyArrayBuffer(gl, program.a_Normal, 3, gl.FLOAT);
  o.colorBuffer = createEmptyArrayBuffer(gl, program.a_Color, 4, gl.FLOAT);
  o.indexBuffer = gl.createBuffer();
  if (!o.vertexBuffer || !o.normalBuffer || !o.colorBuffer || !o.indexBuffer) { return null; }

  gl.bindBuffer(gl.ARRAY_BUFFER, null);

  return o;
}


function assignVertexBuffersData(gl, buffers, model) 
{
  // write date into the buffer objects
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertexBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.arrays.vertices, gl.STATIC_DRAW);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normalBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.arrays.normals, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, model.arrays.colors, gl.STATIC_DRAW);
  
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indexBuffer);
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.arrays.indices, gl.STATIC_DRAW);
}


function getShaderVariables(program)
{
  //get the storage locations of attribute and uniform variables
  program.a_Position = gl.getAttribLocation(program, 'a_Position');
  program.a_Normal = gl.getAttribLocation(program, 'a_Normal');
  program.a_Color = gl.getAttribLocation(program, 'a_Color');
  program.u_MvpMatrix = gl.getUniformLocation(program, 'u_MvpMatrix');
  program.u_NormalMatrix = gl.getUniformLocation(program, 'u_NormalMatrix');

  if (program.a_Position < 0 ||  program.a_Normal < 0 || program.a_Color < 0 ||
      !program.u_MvpMatrix || !program.u_NormalMatrix) {
    console.log('attribute, uniform'); 
    return false;
  }
  return true;
}


function printModelInfo(model) 
{
  console.log("number of vertices=%d",model.arrays.vertices.length/3);
  console.log("number of normals=%d",model.arrays.normals.length/3);
  console.log("number of colors=%d",model.arrays.colors.length/4);
  console.log("nummer of faces=%d",model.arrays.indices.length/3);

  for(var i=0;i<10 && i< model.arrays.vertices.length; i++){
    console.log("v[%d]=(%f,%f,%f)",i,
      model.arrays.vertices[i*3+0],
      model.arrays.vertices[i*3+1],
      model.arrays.vertices[i*3+2]);
  }
  for(var i=0;i<10 && i< model.arrays.vertices.length; i++){
    console.log("n[%d]=(%f,%f,%f)",i,
      model.arrays.normals[i*3+0],
      model.arrays.normals[i*3+1],
      model.arrays.normals[i*3+2]);
  }
  for(var i=0;i<10 && i< model.arrays.indices.length; i++){
    console.log("f[%d]=(%d,%d,%d)",i,
      model.arrays.indices[i*3+0],
      model.arrays.indices[i*3+1],
      model.arrays.indices[i*3+2]);
  }
}

function setScale(model)
{
    var minX = model.arrays.vertices[0]
    var maxX = model.arrays.vertices[0]
    var minY = model.arrays.vertices[1]
    var maxY = model.arrays.vertices[1]
    var minZ = model.arrays.vertices[2]
    var maxZ = model.arrays.vertices[2]
    for(var i = 1; i < model.arrays.vertices.length / 3; i++) {
        minX = Math.min(minX, model.arrays.vertices[i * 3 + 0])
        maxX = Math.max(maxX, model.arrays.vertices[i * 3 + 0])
        minY = Math.min(minX, model.arrays.vertices[i * 3 + 1])
        maxY = Math.max(maxX, model.arrays.vertices[i * 3 + 1])
        minZ = Math.min(minX, model.arrays.vertices[i * 3 + 2])
        maxZ = Math.max(maxX, model.arrays.vertices[i * 3 + 2])
    }
    
    var dx = maxX - minX
    var dy = maxY - minY
    var dz = maxZ - minZ
    
    scale = 120.0 / Math.max(Math.max(dx, dy), dz)
}

function initScene()
{
  // set the clear color and enable the depth test
  gl.clearColor(0.2, 0.2, 0.2, 1.0);
  gl.enable(gl.DEPTH_TEST);

  // select the viewport
  gl.viewportWidth = canvas.width;
  gl.viewportHeight = canvas.height;
  gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
 
  // set the projection matrix
  pMatrix.setPerspective(30.0, canvas.width/canvas.height, 1.0, 5000.0);

  // set the modelview matrix
  mvMatrix.setIdentity(); // erase all prior transformations
  mvMatrix.lookAt(0.0, 500.0, 200.0,   0.0, 0.0, 0.0,   0.0, 1.0, 0.0);

  // start reading the OBJ file
  model = new Object();
  var scale=60; // 1
  readOBJFile(objName, gl, model, scale, true); // cube.obj

  // init rotation matrices
  curRot.setIdentity(); 
  leftRot.setRotate ( 5, 0,1,0);
  rightRot.setRotate(-5, 0,1,0);
  upRot.setRotate   (-5, 0,0,1);
  downRot.setRotate ( 5, 0,0,1);

}


function drawScene(gl, program, angle, buffers, model) 
{
    updateSliders()
  // get model arrays if necessary
  if (!model.arrays){
    if(isOBJFileLoaded(model)){
      extractOBJFileArrays(model);
      assignVertexBuffersData(gl, buffers, model);
      printModelInfo(model);
      setScale(model)
      smoothNormals()
    }
    if (!model.arrays) return;   // drawing failed
  }  

  // clear canvas
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);  // Clear color and depth buffers

  // perform modeling transformations (rotate)
  mvPushMatrix();
  mvMatrix.rotate(angle, 1.0, 0.0, 0.0); // about x
  mvMatrix.rotate(angle, 0.0, 1.0, 0.0); // about y
  mvMatrix.rotate(angle, 0.0, 0.0, 1.0); // about z
  mvMatrix.multiply(curRot)

  // set the normal matrix
  nMatrix.setInverseOf(mvMatrix);
  nMatrix.transpose();
  gl.uniformMatrix4fv(program.u_NormalMatrix, false, nMatrix.elements);

  // compute the combined transformation matrix
  mvpMatrix.set(pMatrix); 
  mvpMatrix.multiply(mvMatrix);
  mvpMatrix.scale(scale, scale, scale)
  mvpMatrix.scale(1 + camZ, 1 + camZ, 1 + camZ)
  gl.uniformMatrix4fv(program.u_MvpMatrix, false, mvpMatrix.elements);
  mvPopMatrix();

  // draw
  gl.drawElements(gl.TRIANGLES, model.arrays.indices.length, gl.UNSIGNED_SHORT, 0);

}


function animate(angle) 
{
  var now = Date.now(); 
  var elapsed = now - lastAnimationTime;
  if(elapsed < 1000/fps) return angle;
  lastAnimationTime = now;
  // update the current rotation angle (adjusted by elapsed time)
  var newAngle = angle + (angleStep * elapsed) / 1000.0;
  return newAngle % 360;
}

function updateSliders()
{
    lightProperties.elements[0] = document.getElementById('ambientSl').value
    lightProperties.elements[1] = document.getElementById('diffuseSl').value
    lightProperties.elements[2] = document.getElementById('specularSl').value
    materialProperties.elements[0] = document.getElementById('ambientCoSl').value
    materialProperties.elements[1] = document.getElementById('diffuseCoSl').value
    materialProperties.elements[2] = document.getElementById('specularCoSl').value
    attenuationProperties.elements[0] = document.getElementById('constantSl').value
    attenuationProperties.elements[1] = document.getElementById('linearSl').value
    attenuationProperties.elements[2] = document.getElementById('quadraticSl').value
    
    var u_attenuation = gl.getUniformLocation(gl.program, 'u_attenuation')
    var u_lightProps = gl.getUniformLocation(gl.program, 'u_lightProps')
    var u_materialProps = gl.getUniformLocation(gl.program, 'u_materialProps')
    var u_LightPos = gl.getUniformLocation(gl.program, 'u_LightPos')
    
    gl.uniform3fv(u_attenuation, attenuationProperties.elements)
    gl.uniform3fv(u_lightProps, lightProperties.elements)
    gl.uniform3fv(u_materialProps, materialProperties.elements)
    gl.uniform4fv(u_LightPos, lightPos.elements)
}

function tick() 
{
    currentAngle = animate(currentAngle); // update current rotation angles
    drawScene(gl, gl.program, currentAngle, buffers, model);
    requestAnimationFrame(tick, canvas);
}


function main() 
{
  // retrieve the <canvas> element
  canvas = document.getElementById('webgl');

  // get rendering context for WebGL
  gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // get storage locations of attribute and uniform variables
  var program = gl.program;
  if(!getShaderVariables(program)){
    console.log('error locating shader variables');
    return; 
  }

  // prepare empty buffer objects 
  buffers = initVertexBuffers(gl, program);
  if (!buffers) {
    console.log('Failed to set the vertex information');
    return;
  }


  // set button event listeners
  var turnLeftBtn = document.getElementById('turnLeftBtn');
  turnLeftBtn.addEventListener('click', turnLeft);

  var turnRightBtn = document.getElementById('turnRightBtn');
  turnRightBtn.addEventListener('click', turnRight);

  var turnUpBtn = document.getElementById('turnUpBtn');
  turnUpBtn.addEventListener('click', turnUp);

  var turnDownBtn = document.getElementById('turnDownBtn');
  turnDownBtn.addEventListener('click', turnDown);

  var zoomInBtn = document.getElementById('zoomInBtn');
  zoomInBtn.addEventListener('click', zoomIn);

  var zoomOutBtn = document.getElementById('zoomOutBtn');
  zoomOutBtn.addEventListener('click', zoomOut);

  var invertNormalsBtn = document.getElementById('invertNormalsBtn');
  invertNormalsBtn.addEventListener('click', invertNormals);
  
  document.getElementById('lightUpBtn').addEventListener('click', moveLightUp)
  document.getElementById('lightDownBtn').addEventListener('click', moveLightDown)
  document.getElementById('lightLeftBtn').addEventListener('click', moveLightLeft)
  document.getElementById('lightRightBtn').addEventListener('click', moveLightRight)
  document.getElementById('lightForwardBtn').addEventListener('click', moveLightForward)
  document.getElementById('lightBackwardBtn').addEventListener('click', moveLightBackward)

  // initialize the scene and start animation
  initScene();
  tick();
}


// EOF


