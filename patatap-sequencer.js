/**
*
* Patatap - Sequencer
*
* Step sequencer and looper for JonoBr1's
* web app, Patatap: http://patatap.com
*
**/

function createSequencer() {
  var beatsPerLoop = superloops.getBPL();
  var windowWidth = beatsPerLoop * 24;  //approx 24px per beat

  //make the child window
  var x = window.open("","Sequencer","width="+windowWidth+",height=640");
  if (x == null || typeof(x)=='undefined') {  
    alert('Please disable your pop-up blocker and load the code again to enable the sequencer pop-up'); 
  } else {  
    x.focus();
  }

  x.document.open();
  x.document.write('<body style="background-color:rgb(181,181,181); font-family: Consolas, &quot;Andale Mono&quot;, &quot;monospace Courier&quot;, &quot;monospace Fixed&quot;, &quot;monospace monospace&quot;  ;font-size: 14px; padding-left:10px"');

  //play/pause/clear buttons
  x.document.write('</br>');
  x.document.write('<button type="button" onclick="playSequencer();">Play</button>');
  x.document.write('<button type="button" onclick="pauseSequencer();">Pause</button>');
  x.document.write('<button type="button" onclick="randomClear();">Random Clear</button>');
  x.document.write('<button type="button" onclick="clearSequencer();">Clear All</button>');
  x.document.write('</br></br>');

  //edit the beats per minute
  x.document.write('<small>Tempo (BPM): <input type="range" id="bpm" min="100" max="260" step="2" value="200" onchange="updateBPM();">');
  x.document.write('<a id="bpm_txt">200</a></small></br></br>');

  //draw the sequencer
  var alpha = "abcdefghijklmnopqrstuvwxyz".split("");
  for(var i=0;i<alpha.length;i++){
    x.document.write('<form id="'+alpha[i]+'_form" style="height:5px;">');
    x.document.write(alpha[i]+':');
    x.document.write('|');
    for(var j=0;j<beatsPerLoop;j++){
      x.document.write('<input type="checkbox" name="trigger" value="'+alpha[i]+'" onclick="toggleBeat(this)">');
      if((j+1)%4==0){
        x.document.write('|');
      }
    }
    x.document.write('</form>');
  }
  x.document.write('</body>');

/**
*
* Collection of sequencer functions
* 
**/

  //toggle the beat into the sequencer loop
  x.document.toggleBeat = function(val) {
  var loop = "";
  var track = val.parentNode;
  var beat = val.value;
  for(var i=0; i<track.trigger.length;i++){
    if(track.trigger[i].checked){
      loop = loop + track.trigger[i].value;
    }else{
      loop = loop + "-";
    }
    loop = loop + " ";
  }
  superloops.add(beat,loop);
  };
  //random delete of a track to remix
  x.document.randomClear = function() {
    var alpha = "abcdefghijklmnopqrstuvwxyz".split("");
    var tracks = x.document.forms;
    var ind = Math.floor((Math.random()*tracks.length)+1);
    tracks[ind].reset();
    superloops.remove(alpha[ind]);
  };
  //(re)start the music
  x.document.playSequencer = function() {
    superloops.play();
  };
  //pause the music
  x.document.pauseSequencer = function() {
    superloops.pause();
  };
  //start from scratch 
  x.document.clearSequencer = function() {
    var tracks = x.document.forms;
    for(var i=0; i < tracks.length; i++) {
    tracks[i].reset();
    }
    superloops.clear();
  };
  //update beats per minute from slider onchange
  x.document.updateBPM = function() {
    var bpm = x.document.getElementById("bpm").value;
    x.document.getElementById("bpm_txt").innerHTML = bpm;
    superloops.setBPM(bpm);
  };
  x.document.close();
}

/**
*
* forked from patatap-looper by reimertz:
* https://github.com/reimertz/patatap-looper
*
* This looper has minor changes tailored 
* for the sequencer
*
**/
function looper() {
  var stepTimer;
  var SL = {
    beatsPerLoop: 16,
    beatsPerMinute: 200,
    _loops: {},
    _stop: false,

    add: function (name, beats) {
      this._loops[name] = beats.split(' ');
    },
    remove: function (name) {
      delete this._loops[name];
    },
    play: function() {
      this._stop = false;
      superloop(0, this.beatsPerLoop, this.beatsPerMinute);
    },
    pause: function () {
      this._stop = true;
    },
    clear: function () {
      this._loops = {};
    },
    getBPM: function () {
      return this.beatsPerMinute;
    },
    setBPM: function (bpm) {
      window.clearTimeout(stepTimer);
      this.beatsPerMinute = bpm;
      superloop(0, this.beatsPerLoop, this.beatsPerMinute);
    },
    getBPL: function () {
      return this.beatsPerLoop;
    },
    list: function() {
      var count = 0;
      for (key in this._loops) {
        console.log(key + ': ' + this._loops[key].join(' '));
        count++;
      }
      console.log(count + ' loop(s)');
    }
  };
  function playBeat (loop, beat) {
    if(loop[beat]!== '-') {
      var e = jQuery.Event("keydown");
      try {
        e.which = loop[beat].toUpperCase().charCodeAt(0);
      } catch(error) {
        console.warn('Typo at beat ' + beat);
      }
      $("input").val(String.fromCharCode(e.which));
      $("html").trigger(e);
    }
  };
  function superloop(beat, bpl, bpm) {
    _.each(SL._loops, function(loop) {
      playBeat(loop, beat);
    });
    if (SL._stop)
      return
    stepTimer = setTimeout(function(){
      var nextBeat = (beat+1)%bpl;
      superloop(nextBeat, bpl, bpm);
      }, (1000 * 60) / bpm);
  };
  superloop(0, SL.beatsPerLoop, SL.beatsPerMinute);
  window.superloops = SL;
  
  //clear the console
  console.clear();
}

//start the looper
looper();
//open the sequencer
createSequencer();
