(function() {
  "use strict";

  var global = window;
  var requestFileSystem = global.requestFileSystem || global.webkitRequestFileSystem;
  
  var WavStreamWriter = (function() {
    function WavStreamWriter() {
      this.sampleRate = 44100;
      this.channels   = 2;
      this.duration   = Infinity;
      this._chunk = [];
      this._totalLength = 0;
    }
    WavStreamWriter.prototype.write = function(chunk) {
      this._chunk.push(chunk);
      this._totalLength += chunk.length;
      return this;
    };
    WavStreamWriter.prototype.close = function() {
      this._chunk = [];
      this._totalLength = 0;
      return this;
    };
    
    WavStreamWriter.prototype.flush = function(filename, callback) {
      var i, imax;
      var chunk = this._chunk;
      var duration = Math.max(0, this.duration);
      if (duration === Infinity) {
        duration = this._totalLength / (this.sampleRate * this.channels);
      }
      duration = Math.min(duration, this.duration);
      
      var chunk      = this._chunk;
      var sampleRate = this.sampleRate;
      var channels   = this.channels;
      var sampleLen  = (duration * sampleRate * channels)|0;
      var fileSize   = sampleLen * 2 + 44;
      
      requestFileSystem(global.TEMPORARY, fileSize, function(fs) {
        fs.root.getFile(filename, {create:true, exclusive:false}, function(entry) {
          entry.createWriter(function(writer) {
            writer.onwriteend = function() {
              callback(null, entry.toURL());
            };
            writer.onerror = function(e) {
              callback(err);
            };
            
            var wav   = new Uint8Array(fileSize);
            var wav16 = new Int16Array(wav.buffer, 44);
            var wav32 = new Uint32Array(wav.buffer);
            
            wav32[ 0] = 1179011410; // 'RIFF'
            wav32[ 1] = sampleLen * 2 - 8;
            wav32[ 2] = 1163280727; // 'WAVE'
            wav32[ 3] = 544501094;  // 'fmt '
            wav32[ 4] = 16;
            wav32[ 5] = (channels << 16) + 1;
            wav32[ 6] = sampleRate;
            wav32[ 7] = sampleRate * channels * 2;
            wav32[ 8] = 1048580;
            wav32[ 9] = 1635017060; // 'data'
            wav32[10] = wav32[1] - 36;
            
            var nsmps;
            var remain = sampleLen;
            var index  = 0;
            var samples = chunk[index++];
            var i = 0, j;
            while (remain > 0 && samples) {
              nsmps   = Math.min(remain, samples.length);
              remain -= nsmps;
              j = 0;
              while (nsmps--) {
                wav16[i++] = samples[j++] * 32768;
              }
              samples = chunk[index++];
            }
            writer.write(new Blob([ wav.buffer ], { type:"audio/wav" }));
          }, function(err) {
            callback(err);
          });
        });
      });
      return this.close();
    };
    
    return WavStreamWriter;
  })();
  
  window.WavStreamWriter = WavStreamWriter;

})();
