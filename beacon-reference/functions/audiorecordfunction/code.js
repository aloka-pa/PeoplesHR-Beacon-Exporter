(function () {
  window.AudioWidget = {
    mediaRecorder: null,
    audioChunks: [],
    audioBlob: null,
    audioUrl: null,
    audioContext: null,
    analyser: null,
    animationId: null,
    isRecording: false,
    timerInterval: null,
    timeLeft: 60,
    onSubmit: null,
    stream: null,
    fname: '001883',

    open: function (callback, options) {
      this.reset();
      this.onSubmit = callback || null;
      if (options && options.fname) this.fname = options.fname;
      this.createUI();
      this.initWaveform();
    },

    reset: function () {
      if (this.isRecording) this.stopRecording();
      this.audioChunks = [];
      this.audioBlob = null;
      this.audioUrl = null;
      this.isRecording = false;
      this.timeLeft = 60;
      clearInterval(this.timerInterval);
      cancelAnimationFrame(this.animationId);
    },

    close: function () {
      if (this.isRecording) this.stopRecording();
      var overlay = document.getElementById('audioWidgetOverlay');
      if (overlay) overlay.remove();
      document.removeEventListener('keydown', this._escHandler);
    },

    createUI: function () {
      var existing = document.getElementById('audioWidgetOverlay');
      if (existing) existing.remove();
      var self = this;

      // Built with DOM APIs (createElement/appendChild/textContent) instead of
      // innerHTML so this works on pages that enforce a Trusted Types CSP
      // (which blocks raw-string innerHTML assignment). Same structure,
      // ids, classes, and behavior as before - no logic changed.

      var css = "#audioWidgetOverlay{position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.5);display:flex;align-items:center;justify-content:center;z-index:99999;font-family:-apple-system,BlinkMacSystemFont,Segoe UI,Roboto,sans-serif;}#audioWidgetBox{background:white;border-radius:12px;padding:24px;width:400px;max-width:90vw;box-shadow:0 10px 40px rgba(0,0,0,0.2);}#audioWidgetBox h3{margin:0 0 20px 0;font-size:16px;color:#333;}.aw-controls{display:flex;align-items:center;gap:12px;margin-bottom:20px;}.aw-mic{width:40px;height:40px;background:#e8f5e9;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0;}.aw-mic svg{width:20px;height:20px;fill:#4caf50;}.aw-mic.active{background:#ffebee;}.aw-mic.active svg{fill:#f44336;}.aw-wave{flex:1;height:40px;background:#f0f0f0;border-radius:20px;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:2px;padding:0 12px;}.aw-bar{width:3px;height:4px;background:#ccc;border-radius:2px;transition:height 0.1s;}.aw-bar.on{background:#4caf50;}.aw-timer{text-align:center;font-size:32px;font-weight:700;color:#333;margin-bottom:16px;font-variant-numeric:tabular-nums;}.aw-timer.warn{color:#f44336;}.aw-btns{display:flex;gap:8px;}.aw-btn{flex:1;padding:10px;border:none;border-radius:6px;font-size:13px;font-weight:600;cursor:pointer;transition:0.2s;}.aw-btn:disabled{opacity:0.4;cursor:not-allowed;}.aw-btn-record{background:#4caf50;color:white;}.aw-btn-record:hover:not(:disabled){background:#43a047;}.aw-btn-record.recording{background:#f44336;}.aw-btn-stop{background:#9e9e9e;color:white;}.aw-btn-stop:hover:not(:disabled){background:#757575;}.aw-btn-play{background:#e3f2fd;color:#1976d2;}.aw-btn-play:hover:not(:disabled){background:#bbdefb;}.aw-btn-submit{background:#4caf50;color:white;}.aw-btn-submit:hover:not(:disabled){background:#388e3c;}.aw-btn-close{background:#f5f5f5;color:#666;}.aw-btn-close:hover{background:#e0e0e0;}.aw-status{text-align:center;font-size:12px;color:#888;margin-top:12px;min-height:18px;}.aw-status.rec{color:#f44336;}.aw-status.ok{color:#4caf50;}.aw-status.err{color:#f44336;}.aw-preview{margin-top:12px;display:none;}.aw-preview.show{display:block;}.aw-preview audio{width:100%;border-radius:6px;}";

      var overlay = document.createElement('div');
      overlay.id = 'audioWidgetOverlay';

      var style = document.createElement('style');
      style.textContent = css; // textContent is not a Trusted Types sink, so this is fine
      overlay.appendChild(style);

      var box = document.createElement('div');
      box.id = 'audioWidgetBox';

      var heading = document.createElement('h3');
      heading.textContent = 'Audio Message';
      box.appendChild(heading);

      var controls = document.createElement('div');
      controls.className = 'aw-controls';

      var mic = document.createElement('div');
      mic.className = 'aw-mic';
      mic.id = 'awMic';
      var svgNS = 'http://www.w3.org/2000/svg';
      var svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      var path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm-1-9c0-.55.45-1 1-1s1 .45 1 1v6c0 .55-.45 1-1 1s-1-.45-1-1V5zm6 6c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z');
      svg.appendChild(path);
      mic.appendChild(svg);
      controls.appendChild(mic);

      var wave = document.createElement('div');
      wave.className = 'aw-wave';
      wave.id = 'awWave';
      controls.appendChild(wave);

      box.appendChild(controls);

      var timer = document.createElement('div');
      timer.className = 'aw-timer';
      timer.id = 'awTimer';
      timer.textContent = '1:00';
      box.appendChild(timer);

      var btns = document.createElement('div');
      btns.className = 'aw-btns';

      var recordBtn = document.createElement('button');
      recordBtn.className = 'aw-btn aw-btn-record';
      recordBtn.id = 'awRecord';
      recordBtn.textContent = 'Record';
      btns.appendChild(recordBtn);

      var stopBtn = document.createElement('button');
      stopBtn.className = 'aw-btn aw-btn-stop';
      stopBtn.id = 'awStop';
      stopBtn.disabled = true;
      stopBtn.textContent = 'Stop';
      btns.appendChild(stopBtn);

      var playBtn = document.createElement('button');
      playBtn.className = 'aw-btn aw-btn-play';
      playBtn.id = 'awPlay';
      playBtn.disabled = true;
      playBtn.textContent = 'Play';
      btns.appendChild(playBtn);

      var submitBtn = document.createElement('button');
      submitBtn.className = 'aw-btn aw-btn-submit';
      submitBtn.id = 'awSubmit';
      submitBtn.disabled = true;
      submitBtn.textContent = 'Submit';
      btns.appendChild(submitBtn);

      var closeBtn = document.createElement('button');
      closeBtn.className = 'aw-btn aw-btn-close';
      closeBtn.id = 'awClose';
      closeBtn.textContent = '\u2715';
      btns.appendChild(closeBtn);

      box.appendChild(btns);

      var status = document.createElement('div');
      status.className = 'aw-status';
      status.id = 'awStatus';
      box.appendChild(status);

      var preview = document.createElement('div');
      preview.className = 'aw-preview';
      preview.id = 'awPreview';
      var audioEl = document.createElement('audio');
      audioEl.id = 'awAudio';
      audioEl.controls = true;
      preview.appendChild(audioEl);
      box.appendChild(preview);

      overlay.appendChild(box);
      document.body.appendChild(overlay);

      recordBtn.addEventListener('click', function () { self.startRecording(); });
      stopBtn.addEventListener('click', function () { self.stopRecording(); });
      playBtn.addEventListener('click', function () { self.playRecording(); });
      submitBtn.addEventListener('click', function () { self.submitRecording(); });
      closeBtn.addEventListener('click', function () { self.close(); });
      overlay.addEventListener('click', function (e) { if (e.target === overlay) self.close(); });
      this._escHandler = function (e) { if (e.key === 'Escape') self.close(); };
      document.addEventListener('keydown', this._escHandler);
    },

    initWaveform: function () {
      var wave = document.getElementById('awWave');
      while (wave.firstChild) { wave.removeChild(wave.firstChild); }
      for (var i = 0; i < 30; i++) {
        var bar = document.createElement('div');
        bar.className = 'aw-bar';
        wave.appendChild(bar);
      }
    },

    animateWaveform: function () {
      var self = this;
      if (!this.analyser || !this.isRecording) return;
      var data = new Uint8Array(this.analyser.frequencyBinCount);
      this.analyser.getByteFrequencyData(data);
      var bars = document.querySelectorAll('#awWave .aw-bar');
      var step = Math.floor(data.length / bars.length);
      bars.forEach(function (bar, i) {
        var h = Math.max(4, (data[i * step] / 255) * 36);
        bar.style.height = h + 'px';
        bar.classList.add('on');
      });
      this.animationId = requestAnimationFrame(function () { self.animateWaveform(); });
    },

    resetWaveform: function () {
      document.querySelectorAll('#awWave .aw-bar').forEach(function (b) {
        b.style.height = '4px';
        b.classList.remove('on');
      });
    },

    updateTimer: function () {
      var m = Math.floor(this.timeLeft / 60);
      var s = this.timeLeft % 60;
      var el = document.getElementById('awTimer');
      el.textContent = m + ':' + (s < 10 ? '0' : '') + s;
      if (this.timeLeft <= 10) { el.classList.add('warn'); } else { el.classList.remove('warn'); }
    },

    startRecording: function () {
      var self = this;
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        this.setStatus('Microphone not supported.');
        return;
      }
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(function (stream) {
          self.stream = stream;
          self.audioContext = new (window.AudioContext || window.webkitAudioContext)();
          var src = self.audioContext.createMediaStreamSource(stream);
          self.analyser = self.audioContext.createAnalyser();
          self.analyser.fftSize = 256;
          src.connect(self.analyser);
          self.mediaRecorder = new MediaRecorder(stream);
          self.audioChunks = [];
          self.mediaRecorder.ondataavailable = function (e) { if (e.data.size > 0) self.audioChunks.push(e.data); };
          self.mediaRecorder.onstop = function () {
            self.audioBlob = new Blob(self.audioChunks, { type: 'audio/webm' });
            self.audioUrl = URL.createObjectURL(self.audioBlob);
            document.getElementById('awAudio').src = self.audioUrl;
            document.getElementById('awPreview').classList.add('show');
            document.getElementById('awPlay').disabled = false;
            document.getElementById('awSubmit').disabled = false;
            self.setStatus('Ready to play or submit.', 'ok');
            stream.getTracks().forEach(function (t) { t.stop(); });
          };
          self.mediaRecorder.start(100);
          self.isRecording = true;
          self.timeLeft = 60;
          document.getElementById('awRecord').disabled = true;
          document.getElementById('awRecord').classList.add('recording');
          document.getElementById('awStop').disabled = false;
          document.getElementById('awPlay').disabled = true;
          document.getElementById('awSubmit').disabled = true;
          document.getElementById('awMic').classList.add('active');
          document.getElementById('awPreview').classList.remove('show');
          self.setStatus('Recording...', 'rec');
          self.animateWaveform();
          self.updateTimer();
          self.timerInterval = setInterval(function () {
            self.timeLeft--;
            self.updateTimer();
            if (self.timeLeft <= 0) self.stopRecording();
          }, 1000);
        })
        .catch(function (err) {
          console.error(err);
          self.setStatus('Microphone access denied.');
        });
    },

    stopRecording: function () {
      if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
        this.mediaRecorder.stop();
      }
      this.isRecording = false;
      clearInterval(this.timerInterval);
      cancelAnimationFrame(this.animationId);
      var recBtn = document.getElementById('awRecord');
      var stopBtn = document.getElementById('awStop');
      var mic = document.getElementById('awMic');
      if (recBtn) { recBtn.disabled = false; recBtn.classList.remove('recording'); }
      if (stopBtn) stopBtn.disabled = true;
      if (mic) mic.classList.remove('active');
      this.resetWaveform();
    },

    playRecording: function () {
      var self = this;
      var audio = document.getElementById('awAudio');
      audio.currentTime = 0;
      audio.play();
      this.setStatus('Playing...');
      audio.onended = function () { self.setStatus('Done.', 'ok'); };
    },

    convertToWav: function (webmBlob) {
      function writeString(view, offset, string) {
        for (var i = 0; i < string.length; i++) { view.setUint8(offset + i, string.charCodeAt(i)); }
      }
      return new Promise(function (resolve, reject) {
        var reader = new FileReader();
        reader.onload = function () {
          var audioContext = new (window.AudioContext || window.webkitAudioContext)();
          audioContext.decodeAudioData(reader.result, function (buffer) {
            var numChannels = 1, sampleRate = buffer.sampleRate, bitDepth = 16;
            var bytesPerSample = bitDepth / 8, blockAlign = numChannels * bytesPerSample;
            var dataSize = buffer.length * blockAlign, totalSize = 44 + dataSize;
            var arrayBuffer = new ArrayBuffer(totalSize);
            var view = new DataView(arrayBuffer);
            writeString(view, 0, 'RIFF');
            view.setUint32(4, totalSize - 8, true);
            writeString(view, 8, 'WAVE');
            writeString(view, 12, 'fmt ');
            view.setUint32(16, 16, true);
            view.setUint16(20, 1, true);
            view.setUint16(22, numChannels, true);
            view.setUint32(24, sampleRate, true);
            view.setUint32(28, sampleRate * blockAlign, true);
            view.setUint16(32, blockAlign, true);
            view.setUint16(34, bitDepth, true);
            writeString(view, 36, 'data');
            view.setUint32(40, dataSize, true);
            var offset = 44;
            var samples = buffer.getChannelData(0);
            for (var i = 0; i < samples.length; i++) {
              var s = Math.max(-1, Math.min(1, samples[i]));
              view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
              offset += 2;
            }
            var wavBlob = new Blob([arrayBuffer], { type: 'audio/wav' });
            audioContext.close();
            resolve(wavBlob);
          }, reject);
        };
        reader.onerror = reject;
        reader.readAsArrayBuffer(webmBlob);
      });
    },

    submitRecording: function () {
      var self = this;
      if (!this.audioBlob) return;
      this.setStatus('Converting audio...');
      this.convertToWav(this.audioBlob).then(function (wavBlob) {
        self.setStatus('Uploading...');
        var formData = new FormData();
        formData.append('fname', self.fname);
        formData.append('data', wavBlob, 'blob');
        fetch('https://hrmmainphdev01.phrsandbox.dev/hr/GrievanceV9/RecordGrievance/SaveAudio', {
          method: 'POST',
          headers: { 'accept': 'application/json, text/plain, */*' },
          body: formData,
          credentials: 'include'
        })
          .then(function (response) {
            return response.text().then(function (raw) {
              if (!response.ok) {
                console.error('[AudioWidget] Upload failed, status ' + response.status + ', body:', raw);
                throw new Error('Upload failed: ' + response.status);
              }
              console.log(raw);
              self.close();
            });
          })
          .catch(function (err) {
            console.error('Upload error:', err);
            self.setStatus('Upload failed: ' + err.message, 'err');
          });
      }).catch(function (err) {
        self.setStatus('Audio conversion failed.', 'err');
      });
    },

    setStatus: function (msg, cls) {
      var el = document.getElementById('awStatus');
      if (!el) return;
      el.textContent = msg;
      el.className = 'aw-status' + (cls ? ' ' + cls : '');
    }
  };
  (function autoOpenAudioWidget() {
    function launch() {
      try {
        console.log('[AudioWidget] launching, document.readyState =', document.readyState);
        AudioWidget.open(null, { fname: '001883' });
      } catch (e) {
        console.error('[AudioWidget] failed to open:', e);
      }
    }
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', launch);
    } else {
      launch();
    }
  })();
});