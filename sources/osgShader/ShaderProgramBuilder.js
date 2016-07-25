'use strict';

var Notify = require( 'osg/Notify' );
var Shader = require( 'osg/Shader' );
var Program = require( 'osg/Program' );
var optimizer = require( 'osgShader/optimizer' );
var preProcessor = require( 'osgShader/preProcessor' );

// GLSL Shader & Program manager and build
// Those Three lines Code get repeated a lot, factorized once and for all
// faster compilation and require .(one rrequire instead of two)
// good place to add timeing and post compilation optimizers
// ideally as pre/post hooks callback


var optimizeShader = function ( shaderSourceText, shaderName, doTimeCompilation ) {


    var shaderText = shaderSourceText;
    Notify.info( 'shader optimization: ' + shaderName );
    Notify.info( 'shader before optimization\n' + shaderText );


    if ( doTimeCompilation ) console.time( 'shaderPreprocess: ' + shaderName );

    var preprocessedShader = preProcessor( shaderText );
    shaderText = preprocessedShader;

    if ( doTimeCompilation ) console.timeEnd( 'shaderPreprocess: ' + shaderName );

    if ( doTimeCompilation ) console.time( 'shaderOptimize: ' + shaderName );

    var optShader = optimizer( shaderText );
    shaderText = optShader;

    if ( doTimeCompilation ) console.timeEnd( 'shaderOptimize: ' + shaderName );
    Notify.info( 'shader after optimization\n' + shaderText );

    return shaderText;
};

var createProgram = function ( vertexShader, fragmentShader, vertexName, fragmentName, programName ) {

    var progName = programName;
    var fragName = fragmentName;
    if ( !fragName ) fragName = fragmentName ? fragmentName : vertexName;
    if ( !progName ) progName = fragName;

    this._osgShader = this._osgShader || require( 'osgShader/osgShader' );
    var doEnableOptimisation = this._osgShader.enableShaderOptimizer;
    var doTimeCompilation = this._osgShader.enableShaderCompilationTiming;

    var vertexText = vertexShader;
    if ( doEnableOptimisation ) vertexText = optimizeShader( vertexShader, vertexName, doTimeCompilation );
    var vertexShaderObject = new Shader( Shader.VERTEX_SHADER, vertexText, vertexName );

    var fragmentText = fragmentShader;
    if ( doEnableOptimisation ) fragmentText = optimizeShader( fragmentText, fragName );
    var fragmentShaderObject = new Shader( Shader.FRAGMENT_SHADER, fragmentText, fragName, doTimeCompilation );

    var program = new Program( vertexShaderObject, fragmentShaderObject, progName );

    return program;

};

module.exports = {
    createProgram: createProgram
};
