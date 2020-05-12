// HTML5 thingie that shows an animated "face" in the browser in response to audio level. 
// Pulls three images from the faceDirectory, called 0.png, 1.png, 2.png, 3.png.  0.png is
// shown at the "no audio" level.
//
// Background is default green so you can chroma-key it out.  Capture the area above the controls. 
//
// Adjust the trigger levels for level1/2/3 in the boxes to taste.  Edit mic.html to enter defaults
// once you're happy with them. 
//
// See README.txt for more details. 
//
// Steven Cogswell 
// May 2020 
//
// Thank you to inspiration from: 
// https://codepen.io/zapplebee/pen/gbNbZE
// https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Visualizations_with_Web_Audio_API
// https://developer.mozilla.org/en-US/docs/Web/API/AnalyserNode/getByteTimeDomainData
// https://mdn.github.io/voice-change-o-matic/scripts/app.js
//
// These default levels for the level1/2/3 variables will get overwritten when we setup
// the number box controls on the page.  
var level1 = 1;   // These values are overwritten and are just to initialize the variable
var level2 = 2;
var level3 = 3; 
var debugValues = false;
var faceDirectory = 'faces/darthyall/';  // From this directory it will use 0.png 1.png 2.png and 3.png for the levels

window.onload = function () {
    "use strict";
    var canvas = document.querySelector('.visualizer');
    var canvasCtx = canvas.getContext("2d"); 
    var WIDTH;   // These hold the width/height of the canvas element we draw the images on. 
    var HEIGHT; 
    // The four images for display.  img0 is the "no sound" idle image, and progresively
    // louder for 1/2/3
    var img3 = new Image;
    var img2 = new Image;
    var img1 = new Image;
    var img0 = new Image;

    var audioVal = 0;  // value returned from processing the audio to judge level (currently RMS)

    // Set up listeners for the three level boxes and the debug checkboxes to propogate changes
    this.document.getElementById("level1").addEventListener("change",setLevels(this));
    this.document.getElementById("level2").addEventListener("change",setLevels(this));
    this.document.getElementById("level2").addEventListener("change",setLevels(this));
    // Set default levels for the thresholds from the numbers in the boxes on the .html 
    // by default.  Change the value in the .html file to what you want for defaults when 
    // it starts up based on your own setup. 
    level1=Number(document.getElementById("level1").value);
    level2=Number(document.getElementById("level2").value);
    level3=Number(document.getElementById("level3").value);
    // Check states of checkboxes at startup and set parameters based on them
    if (this.document.getElementById("debugOn").checked == true){
        debugValues = true; 
    } else {
        debugValues = false; 
    }

    // This function gets called if we're allowed to use audio input on the browser 
    // (ie - the actual main function)
    var soundAllowed = function (stream) {
        // Is this still a bug? I carried this over from https://codepen.io/zapplebee/pen/gbNbZE
        //Audio stops listening in FF without // window.persistAudioStream = stream;
        //https://bugzilla.mozilla.org/show_bug.cgi?id=965483
        //https://support.mozilla.org/en-US/questions/984179
        window.persistAudioStream = stream;

        // Change the screen display message to show audio is permitted, and fade out. 
        document.getElementById("needAudio").innerHTML = "Audio Enabled";
        document.getElementById("needAudio").setAttribute('style', 'opacity: 0;');

        // Set up audio processor
        // We would use: 
        //       audioContent = new AudioContext();
        // but we need to use window.webkitAudioContext in order for this to work in Safari Desktop. 
        var audioContentContext = window.AudioContext || window.webkitAudioContext; // for Safari 
        var audioContent = new audioContentContext();

        var audioStream = audioContent.createMediaStreamSource( stream );
        var analyser = audioContent.createAnalyser();
        audioStream.connect(analyser);
        analyser.fftSize = 1024;
        // Array to hold the audio data
        var dataArray = new Uint8Array(analyser.frequencyBinCount);

        // Assign the images from the files on disk.  Change these if you want to rename 
        // the images.  
        img3.src=faceDirectory+'3.png';
        img2.src=faceDirectory+'2.png';
        img1.src=faceDirectory+'1.png';
        img0.src=faceDirectory+'0.png';
        
        // Calculate "something" from the audio to use something to judge how loud the audio is.
        // Currently calculating RMS (root-mean-square) of the audio.  You can do something 
        // different if you want. 
        var processAudio = function(dataArray){
        	var i=0; 
        	var total=0; 
        	var tempVal = 0; 
        	
        	// Calculate RMS of the array	
        	for(i=0; i<dataArray.length; i++){
        		tempVal=dataArray[i]-127;   // array data seems unsigned with 127 being the zero line, so adjust for offset.
        		total += tempVal*tempVal; 
        	}
        	total = Math.floor(Math.sqrt(total/dataArray.length));
        	return total; 
        }
      
        // The animation function, uses requestAnimationFrame() and calls itself in order to get
        // the next frame rendered.  
        //
        // The default canvas size is 100 px x 100 px, if you want to change that change the size
        // of the canvas definition in the .html file, and take that into account here. 
        var doDraw = function () {
        	WIDTH = canvas.width;   // Get size of canvas
        	HEIGHT = canvas.height; 
        	
            requestAnimationFrame(doDraw);

            // Get the time domain data in the array previously defined, and calculate a 
            // single number from processAudio() to use as a level value. 
            analyser.getByteTimeDomainData(dataArray);
            audioVal = processAudio(dataArray); 
            
            canvasCtx.fillStyle = 'rgb(0,255,0)';   // Fill canvas with colour (green for chroma key)
            canvasCtx.fillRect(0,0,WIDTH,HEIGHT);
            canvasCtx.lineWidth=2;               
            canvasCtx.strokeSyle='rgb(0,0,0)';
            
            // determine which image to display in the canvas based on the audio level 
            // we've determined from processAudio().  You don't have to use images, you can
            // put drawing code in here or whatever you want, I ain't your dad, as they say. 
            if (audioVal > level3) {
            	canvasCtx.drawImage(img3,0,0);   // "Loudest"
            } else if (audioVal > level2) {
            	canvasCtx.drawImage(img2,0,0);
            } else if (audioVal > level1) { 
            	canvasCtx.drawImage(img1,0,0);   // "Quietest" but still audible.
            } else {
            	canvasCtx.drawImage(img0,0,0);    // "no audio" threshold
            }
            
            // If debug checkbox is checked, also display the value calculated
            // from processAudio(), helps to determine empirically what works 
            // for your setup.  debugValues variable gets flipped by the setDebug()
            // handler function which is linked to the on-screen checkbox.  
            if (debugValues == true){
                canvasCtx.fillStyle="#555555";  // Box colour
                canvasCtx.fillRect(0,HEIGHT-30,90,30)  // Box behind the text makes it easier to read
                canvasCtx.font = '30px Arial';
                canvasCtx.fillStyle="white";   // Text colour
                canvasCtx.fillText(audioVal,0,HEIGHT);  // Text of RMS value
            }
        }
        
        // All those bits above are functions, so this is the actual entry point into the soundAllowed()
        // function to kick everything off. 
        doDraw();
    }

    // This function gets called if we can't use sound input in the browser, usually 
    // because of permissions not being allowed.  
    var soundNotAllowed = function (error) {
        document.getElementById("needAudio").innerHTML = "You must allow your microphone.";
        console.log(error);
    }

    // This is more or less the "entry point" of the program, see if we can get the audio input
    // from the web browser (will probably prompt the user to select) and call an appropriate
    // routine if we're allowed or not.  
    navigator.mediaDevices.getUserMedia({audio:true}).then(soundAllowed).catch(soundNotAllowed);
};

// Utility function to detect a number box changed value (usually user input) and change the 
// level1/2/3 variable as appropriate 
function setLevels(element){
    var theID = element.id;
    console.log("ID changed: " + theID);
    if (theID == "level1") {
        level1=Number(element.value);
    } else if (theID == "level2") {
        level2=Number(element.value);
    } else if (theID == "level3") {
        level3=Number(element.value);
    } 
    console.log("1:"+level1+" 2:"+level2+" 3: "+level3);
}

// Utility function to detect if the "show debug values" checkbox gets checked or unchecked
// and set the debugValues flag variable in response. 
function setDebug(element){
    var theID=element.id;
    if (theID == "debugOn") {
        if (element.checked == true) {
            debugValues = true; 
        } else {
            debugValues = false; 
        }
    }
}