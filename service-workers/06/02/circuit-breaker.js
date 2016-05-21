var CircuitBreaker = (function() {
  'use strict';

  var TEN_SECONDS = 10000,
    TEN_BLOCKS = 10,
    THREE_SECONDS = 3000,
    FIFTY_PERCENT = 50,
    FIVE = 5;

  var CB = function(opts) {
    opts = opts || {};

    this.errorThreshold  = opts.errorThreshold || FIFTY_PERCENT;
    this.numBlocks = opts.numBlocks || TEN_BLOCKS;
    this.timeoutDuration = opts.timeoutDuration || THREE_SECONDS;
    this.volumeThreshold = opts.volumeThreshold || FIVE;
    this.windowDuration  = opts.windowDuration || TEN_SECONDS;

    this.hanldeCircuitOpen   = opts.hanldeCircuitOpen  || function() {};
    this.handleCircuitClose  = opts.handleCircuitClose || function() {};

    this.$buckets = [this.$createBlock()];
    this.$state = CB.CLOSED;

    this.$startTicker();
  };

  CB.OPEN = 0;
  CB.HALF_OPEN = 1;
  CB.CLOSED = 2;

  CB.prototype.run = function(command, fallback) {
    if (this.isOpen()) {
      this.$executeFallback(fallback || function() {});
    } else {
      this.$execCmd(command);
    }
  };

  CB.prototype.forceClose = function() {
    this.$forced = this.$state;
    this.$state = CB.CLOSED;
  };

  CB.prototype.forceOpen = function() {
    this.$forced = this.$state;
    this.$state = CB.OPEN;
  };

  CB.prototype.unforce = function() {
    this.$state = this.$forced;
    this.$forced = null;
  };

  CB.prototype.isOpen = function() {
    return this.$state === CB.OPEN;
  };

  CB.prototype.$startTicker = function() {
    var me = this,
      bucketIndex = 0,
      bucketDuration = this.windowDuration / this.numBlocks;

    var tick = function() {
      if (me.$buckets.length > me.numBlocks) {
        me.$buckets.shift();
      }

      bucketIndex++;

      if (bucketIndex > me.numBlocks) {
        bucketIndex = 0;

        if (me.isOpen()) {
          me.$state = CB.HALF_OPEN;
        }
      }

      me.$buckets.push(me.$createBlock());
    };

    setInterval(tick, bucketDuration);
  };

  CB.prototype.$createBlock = function() {
    return {
      successes: 0,
      failures: 0,
      shortCircuits: 0,
      timeouts: 0
    };
  };

  CB.prototype.$lastBlock = function() {
    var numBlocks = this.$buckets.length,
      lastBlock = this.$buckets[numBlocks - 1];

    return lastBlock;
  };

  CB.prototype.$execCmd = function(command) {
    var me = this,
      increment,
      timeout;

    increment = function(prop) {
      return function() {
        var bucket;

        if (!timeout) {
          return;
        }

        bucket = me.$lastBlock();
        bucket[prop]++;

        if (me.$forced === null) {
          me.$updateState();
        }

        clearTimeout(timeout);
        timeout = null;
      };
    };

    timeout = setTimeout(increment('timeouts'), this.timeoutDuration);

    command(increment('successes'), increment('failures'));
  };

  CB.prototype.$executeFallback = function(fallback) {
    var bucket;

    fallback();

    bucket = this.$lastBlock();
    bucket.shortCircuits++;
  };

  CB.prototype.$calcMetrics = function() {
    var totalCount = 0,
      totalErrors = 0,
      errorPerc = 0,
      bucket,
      errors,
      i;

    for (i = 0, len = this.$buckets.length; i < len; i++) {
      bucket = this.$buckets[i];
      errors = (bucket.failures + bucket.timeouts);

      totalErrors += errors;
      totalCount += (errors + bucket.successes);
    }

    errorPerc = (totalErrors / (totalCount > 0 ? totalCount : 1)) * 100;

    return {
      totalErrors: totalErrors,
      errorPerc: errorPerc,
      totalCount: totalCount
    };
  };

  CB.prototype.$updateState = function() {
    var metrics = this.$calcMetrics();

    if (this.$state == CB.HALF_OPEN) {
      var lastCmdFailed = !this.$lastBlock().successes && metrics.totalErrors > 0;

      if (lastCmdFailed) {
        this.$state = CB.OPEN;
      } else {
        this.$state = CB.CLOSED;
        this.handleCircuitClose(metrics);
      }
    }
    else {
      var overErrorThreshold = metrics.errorPerc > this.errorThreshold,
        overVolumeThreshold = metrics.totalCount > this.volumeThreshold,
        overThreshold = overVolumeThreshold && overErrorThreshold;

      if (overThreshold) {
        this.$state = CB.OPEN;
        this.hanldeCircuitOpen(metrics);
      }
    }
  };

  return CB;
})();
