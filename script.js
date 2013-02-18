// Generated by CoffeeScript 1.3.3
(function() {
  var audioContext, buffer, bufferFillSize, bufferFiller, canvas, context, div, elFreq, elNeedle, error, fft, fftSize, frequencies, gauss, hp, hr, i, labels, lp, precision, prevNote, sampleRate, scale, success, _i,
    __hasProp = {}.hasOwnProperty;

  scale = document.querySelector(".scale");

  labels = document.querySelector(".labels");

  for (i = _i = 0; _i <= 80; i = ++_i) {
    div = document.createElement("div");
    hr = document.createElement("hr");
    div.appendChild(hr);
    scale.appendChild(div);
  }

  window.AudioContext = window.AudioContext || window.mozAudioContext || window.webkitAudioContext || window.msAudioContext || window.oAudioContext;

  navigator.getUserMedia = navigator.getUserMedia || navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.oGetUserMedia;

  canvas = document.querySelector("canvas");

  elNeedle = document.querySelector(".needle div");

  elFreq = document.querySelector(".frequency .value");

  prevNote = false;

  precision = function(x) {
    return Math.round(x * 100) / 100;
  };

  frequencies = {
    'A0': 27.5,
    'A1': 55,
    'A2': 110,
    'A3': 220,
    'A4': 440,
    'A5': 880,
    'A6': 1760,
    'A7': 3520.00,
    'A#0': 29.1352,
    'A#1': 58.2705,
    'A#2': 116.541,
    'A#3': 233.082,
    'A#4': 466.164,
    'A#5': 932.328,
    'A#6': 1864.66,
    'A#7': 3729.31,
    'B0': 30.8677,
    'B1': 61.7354,
    'B2': 123.471,
    'B3': 246.942,
    'B4': 493.883,
    'B5': 987.767,
    'B6': 1975.53,
    'B7': 3951.07,
    'C1': 32.7032,
    'C2': 65.4064,
    'C3': 130.813,
    'C4': 261.626,
    'C5': 523.251,
    'C6': 1046.50,
    'C7': 2093,
    'C8': 4186.01,
    'C#1': 34.6478,
    'C#2': 69.2957,
    'C#3': 138.591,
    'C#4': 277.183,
    'C#5': 554.365,
    'C#6': 1108.73,
    'C#7': 2217.46,
    'D1': 36.7081,
    'D2': 73.4162,
    'D3': 146.832,
    'D4': 293.665,
    'D5': 587.330,
    'D6': 1174.66,
    'D7': 2349.32,
    'D#1': 38.8909,
    'D#2': 77.7817,
    'D#3': 155.563,
    'D#4': 311.127,
    'D#5': 622.254,
    'D#6': 1244.51,
    'D#7': 2489.02,
    'E1': 41.2034,
    'E2': 82.4069,
    'E3': 164.814,
    'E4': 329.628,
    'E5': 659.255,
    'E6': 1318.51,
    'E7': 2637.02,
    'F1': 43.6563,
    'F2': 87.3071,
    'F3': 174.614,
    'F4': 349.228,
    'F5': 698.456,
    'F6': 1396.91,
    'F7': 2793.83,
    'F#1': 46.2493,
    'F#2': 92.4986,
    'F#3': 184.997,
    'F#4': 369.994,
    'F#5': 739.989,
    'F#6': 1479.98,
    'F#7': 2959.96,
    'G1': 48.9994,
    'G2': 97.9989,
    'G3': 195.998,
    'G4': 391.995,
    'G5': 783.991,
    'G6': 1567.98,
    'G7': 3135.96,
    'G#1': 51.9131,
    'G#': 103.826,
    'G#3': 207.652,
    'G#4': 415.305,
    'G#5': 830.609,
    'G#6': 1661.22,
    'G#7': 3322.44
  };

  context = canvas.getContext('2d');

  audioContext = new AudioContext();

  sampleRate = audioContext.sampleRate;

  fftSize = 8192;

  fft = new FFT(fftSize, sampleRate / 4);

  buffer = (function() {
    var _j, _results;
    _results = [];
    for (i = _j = 0; 0 <= fftSize ? _j < fftSize : _j > fftSize; i = 0 <= fftSize ? ++_j : --_j) {
      _results.push(0);
    }
    return _results;
  })();

  bufferFillSize = 2048;

  bufferFiller = audioContext.createJavaScriptNode(bufferFillSize, 1, 1);

  bufferFiller.onaudioprocess = function(e) {
    var b, input, _j, _k, _ref, _ref1, _results;
    input = e.inputBuffer.getChannelData(0);
    for (b = _j = bufferFillSize, _ref = buffer.length; bufferFillSize <= _ref ? _j < _ref : _j > _ref; b = bufferFillSize <= _ref ? ++_j : --_j) {
      buffer[b - bufferFillSize] = buffer[b];
    }
    _results = [];
    for (b = _k = 0, _ref1 = input.length; 0 <= _ref1 ? _k < _ref1 : _k > _ref1; b = 0 <= _ref1 ? ++_k : --_k) {
      _results.push(buffer[buffer.length - bufferFillSize + b] = input[b]);
    }
    return _results;
  };

  gauss = new WindowFunction(DSP.GAUSS);

  lp = audioContext.createBiquadFilter();

  lp.type = lp.LOWPASS;

  lp.frequency = 8000;

  lp.Q = 0.1;

  hp = audioContext.createBiquadFilter();

  hp.type = hp.HIGHPASS;

  hp.frequency = 20;

  hp.Q = 0.1;

  success = function(stream) {
    var display, getNeighbours, getPitch, maxPeakCount, maxPeaks, maxTime, noiseCount, noiseThreshold, process, render, src;
    maxTime = 0;
    noiseCount = 0;
    noiseThreshold = -Infinity;
    maxPeaks = 0;
    maxPeakCount = 0;
    src = audioContext.createMediaStreamSource(stream);
    src.connect(lp);
    lp.connect(hp);
    hp.connect(bufferFiller);
    bufferFiller.connect(audioContext.destination);
    process = function() {
      var b, bufferCopy, downsampled, firstFreq, freq, interp, left, noiseThrehold, p, peak, peaks, q, right, s, secondFreq, spectrumPoints, thirdFreq, upsampled, x, _j, _k, _l, _len, _len1, _m, _n, _o, _ref, _ref1, _ref2, _ref3, _ref4, _ref5;
      bufferCopy = (function() {
        var _j, _len, _results;
        _results = [];
        for (_j = 0, _len = buffer.length; _j < _len; _j++) {
          b = buffer[_j];
          _results.push(b);
        }
        return _results;
      })();
      gauss.process(bufferCopy);
      downsampled = [];
      for (s = _j = 0, _ref = bufferCopy.length; _j < _ref; s = _j += 4) {
        downsampled.push(bufferCopy[s]);
      }
      upsampled = [];
      for (_k = 0, _len = downsampled.length; _k < _len; _k++) {
        s = downsampled[_k];
        upsampled.push(s);
        upsampled.push(0);
        upsampled.push(0);
        upsampled.push(0);
      }
      fft.forward(upsampled);
      if (noiseCount < 10) {
        _ref1 = fft.spectrum;
        for (_l = 0, _len1 = _ref1.length; _l < _len1; _l++) {
          i = _ref1[_l];
          noiseThreshold = Math.max(noiseThreshold, i);
        }
        noiseThrehold = noiseThreshold > 0.001 ? 0.001 : noiseThreshold;
        noiseCount++;
      }
      spectrumPoints = (function() {
        var _m, _ref2, _results;
        _results = [];
        for (x = _m = 0, _ref2 = fft.spectrum.length / 4; 0 <= _ref2 ? _m < _ref2 : _m > _ref2; x = 0 <= _ref2 ? ++_m : --_m) {
          _results.push({
            x: x,
            y: fft.spectrum[x]
          });
        }
        return _results;
      })();
      spectrumPoints.sort(function(a, b) {
        return b.y - a.y;
      });
      peaks = [];
      for (p = _m = 0; _m < 8; p = ++_m) {
        if (spectrumPoints[p].y > noiseThreshold * 5) {
          peaks.push(spectrumPoints[p]);
        }
      }
      if (peaks.length > 0) {
        for (p = _n = 0, _ref2 = peaks.length; 0 <= _ref2 ? _n < _ref2 : _n > _ref2; p = 0 <= _ref2 ? ++_n : --_n) {
          if (peaks[p] != null) {
            for (q = _o = 0, _ref3 = peaks.length; 0 <= _ref3 ? _o < _ref3 : _o > _ref3; q = 0 <= _ref3 ? ++_o : --_o) {
              if (p !== q && (peaks[q] != null)) {
                if (Math.abs(peaks[p].x - peaks[q].x) < 5) {
                  peaks[q] = null;
                }
              }
            }
          }
        }
        peaks = (function() {
          var _len2, _p, _results;
          _results = [];
          for (_p = 0, _len2 = peaks.length; _p < _len2; _p++) {
            p = peaks[_p];
            if (p != null) {
              _results.push(p);
            }
          }
          return _results;
        })();
        peaks.sort(function(a, b) {
          return a.x - b.x;
        });
        maxPeaks = maxPeaks < peaks.length ? peaks.length : maxPeaks;
        if (maxPeaks > 0) {
          maxPeakCount = 0;
        }
        peak = null;
        firstFreq = peaks[0].x * (sampleRate / fftSize);
        if (peaks.length > 1) {
          secondFreq = peaks[1].x * (sampleRate / fftSize);
          if ((1.4 < (_ref4 = firstFreq / secondFreq) && _ref4 < 1.6)) {
            peak = peaks[1];
          }
        }
        if (peaks.length > 2) {
          thirdFreq = peaks[2].x * (sampleRate / fftSize);
          if ((1.4 < (_ref5 = firstFreq / thirdFreq) && _ref5 < 1.6)) {
            peak = peaks[2];
          }
        }
        if (peaks.length > 1 || maxPeaks === 1) {
          if (!(peak != null)) {
            peak = peaks[0];
          }
          left = {
            x: peak.x - 1,
            y: Math.log(fft.spectrum[peak.x - 1])
          };
          peak = {
            x: peak.x,
            y: Math.log(fft.spectrum[peak.x])
          };
          right = {
            x: peak.x + 1,
            y: Math.log(fft.spectrum[peak.x + 1])
          };
          interp = 0.5 * ((left.y - right.y) / (left.y - (2 * peak.y) + right.y)) + peak.x;
          freq = interp * (sampleRate / fftSize);
          display.draw(freq);
        }
      } else {
        maxPeaks = 0;
        maxPeakCount++;
        if (maxPeakCount > 20) {
          display.clear();
        }
      }
      return render();
    };
    getPitch = function(freq) {
      var diff, key, minDiff, note, val;
      minDiff = Infinity;
      diff = Infinity;
      for (key in frequencies) {
        if (!__hasProp.call(frequencies, key)) continue;
        val = frequencies[key];
        if (Math.abs(freq - val) < minDiff) {
          minDiff = Math.abs(freq - val);
          diff = freq - val;
          note = key;
        }
      }
      return note;
    };
    getNeighbours = function(note) {
      var higher, key, lower, val;
      lower = 'A0';
      higher = 'G#7';
      for (key in frequencies) {
        if (!__hasProp.call(frequencies, key)) continue;
        val = frequencies[key];
        if ((frequencies[lower] < val && val < frequencies[note])) {
          lower = key;
        }
        if ((frequencies[higher] > val && val > frequencies[note])) {
          higher = key;
        }
      }
      return [lower, higher];
    };
    display = {
      draw: function(freq) {
        var activeNote, highStep, higher, low, lowStep, lower, nextLabels, note, prevLabels, span, toRemove, variation, _j, _ref;
        note = getPitch(freq);
        _ref = getNeighbours(note), lower = _ref[0], higher = _ref[1];
        lowStep = (frequencies[note] - frequencies[lower]) / 5;
        highStep = (frequencies[note] - frequencies[lower]) / 5;
        toRemove = document.querySelector(".labels .to-remove");
        if (toRemove) {
          toRemove.parentNode.removeChild(toRemove);
        }
        prevLabels = (document.querySelector(".labels .current")) || document.createElement("div");
        if (frequencies[prevNote] < frequencies[note]) {
          prevLabels.setAttribute("class", "lower");
        } else {
          prevLabels.setAttribute("class", "higher");
        }
        nextLabels = document.createElement("div");
        if (frequencies[prevNote] < frequencies[note]) {
          nextLabels.classList.add("higher");
        } else {
          nextLabels.classList.add("lower");
        }
        for (i = _j = 0; _j < 5; i = ++_j) {
          span = document.createElement("span");
          span.innerHTML = precision(frequencies[note] + (i - 2) * lowStep);
          nextLabels.appendChild(span);
        }
        labels.appendChild(nextLabels);
        nextLabels.classList.add("current");
        nextLabels.classList.remove("higher");
        nextLabels.classList.remove("lower");
        prevLabels.classList.remove("current");
        prevLabels.classList.add("to-remove");
        if (frequencies[prevNote] < frequencies[note]) {
          prevLabels.classList.add("lower");
        } else {
          prevLabels.classList.add("higher");
        }
        elFreq.innerHTML = precision(freq);
        elFreq.classList.remove("inactive");
        elNeedle.classList.remove("inactive");
        low = frequencies[note] - 2 * lowStep;
        variation = (freq - frequencies[note]) / (frequencies[note] - low);
        elNeedle.style.webkitTransform = "rotate(" + (precision(variation * 32 + 90)) + "deg)";
        (document.querySelector(".debug-note")).innerHTML = note;
        (document.querySelector(".debug-frequency")).innerHTML = freq;
        activeNote = document.querySelector(".notes .active");
        if (activeNote) {
          activeNote.classList.remove("active");
        }
        activeNote = document.querySelector("#" + note.replace(/[0-9]+/, '').replace('#', '-sharp').toLowerCase());
        if (activeNote) {
          activeNote.classList.add("active");
        }
        return prevNote = note;
      },
      clear: function() {
        var activeNote;
        activeNote = document.querySelector(".notes .active");
        if (activeNote) {
          activeNote.classList.remove("active");
        }
        elFreq.classList.add("inactive");
        return elNeedle.classList.add("inactive");
      }
    };
    render = function() {
      /*
      		context.clearRect 0, 0, canvas.width, canvas.height
      		newMaxTime = _.reduce buffer, ((max, next) -> if Math.abs(next) > max then Math.abs(next) else max), -Infinity
      		maxTime = if newMaxTime > maxTime then newMaxTime else maxTime
      		context.fillStyle = '#EEE'
      		timeWidth = (canvas.width - 100) / (buffer.length)
      		for s in [0...buffer.length]
      			context.fillRect timeWidth * s, canvas.height / 2, timeWidth, -(canvas.height / 2) * (buffer[s] / maxTime)
      		context.fillStyle = '#F77'
      		freqWidth = (canvas.width - 100) / (fft.spectrum.length / 4)
      		for f in [10...(fft.spectrum.length / 4) - 10]
      			context.fillRect freqWidth * f, canvas.height / 2, freqWidth, -Math.pow(1e4 * fft.spectrum[f], 2)
      */

    };
    return setInterval(process, 100);
  };

  error = function(e) {
    console.log(e);
    return console.log('ARE YOU USING CHROME CANARY (23/09/2012) ON A MAC WITH "Web Audio Input" ENABLED IN chrome://flags?');
  };

  navigator.getUserMedia({
    audio: true
  }, success, error);

}).call(this);
