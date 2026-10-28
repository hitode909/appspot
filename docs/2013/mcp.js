// WebMCP 対応: 対応ブラウザでは document.modelContext (旧 navigator.modelContext) に
// ツールを登録し、エージェントからスライダー操作・プリセット適用・画像ダウンロードを呼び出せる。
(function() {
  var PARAM_SELECTORS = {
    radiusDiff: '#radius-diff',
    radiusNoiseDiff: '#radius-noise-diff',
    radianDiff: '#radian-diff',
    strokeWeight: '#stroke-weight'
  };

  var getParameters = function() {
    var values = {};
    Object.keys(PARAM_SELECTORS).forEach(function(name) {
      values[name] = +$(PARAM_SELECTORS[name]).val();
    });
    return values;
  };

  // 指定されたパラメータだけを、スライダーの min/max に収めて反映する。
  // 描画ループが毎フレームスライダーの値を読むので、値を入れるだけで絵も変わる。
  var setParameters = function(params) {
    Object.keys(PARAM_SELECTORS).forEach(function(name) {
      if (typeof params[name] !== 'number') return;
      var $input = $(PARAM_SELECTORS[name]);
      var value = Math.min(Math.max(params[name], +$input.attr('min')), +$input.attr('max'));
      $input.val(value);
    });
  };

  // 言葉ごとに、どのスライダーをどちらへ動かすか。direction: +1 で右、-1 で左
  var ADJUSTMENTS = {
    'すかすかにする': { param: 'radiusDiff', direction: +1 },
    'ぎゅうぎゅうにする': { param: 'radiusDiff', direction: -1 },
    'ぐにゃぐにゃにする': { param: 'radiusNoiseDiff', direction: +1 },
    'まっすぐにする': { param: 'radiusNoiseDiff', direction: -1 },
    'かくかくにする': { param: 'radianDiff', direction: +1 },
    'なめらかにする': { param: 'radianDiff', direction: -1 },
    'ふとくする': { param: 'strokeWeight', direction: +1 },
    'ほそくする': { param: 'strokeWeight', direction: -1 }
  };

  // 1回の呼び出しでスライダーの可動域の2割ぶん動かす
  var ADJUST_RATIO = 0.2;

  var adjustParameter = function(word) {
    var adjustment = ADJUSTMENTS[word];
    var $input = $(PARAM_SELECTORS[adjustment.param]);
    var min = +$input.attr('min');
    var max = +$input.attr('max');
    var params = {};
    params[adjustment.param] = +$input.val() + adjustment.direction * (max - min) * ADJUST_RATIO;
    setParameters(params);
  };

  var textResult = function(text) {
    return { content: [{ type: 'text', text: text }] };
  };

  var tools = [
    {
      name: 'get_parameters',
      description: '謹賀新年の渦巻きを描くパラメータ（4つのスライダー）の現在値を返す',
      inputSchema: { type: 'object', properties: {} },
      execute: function() {
        return textResult(JSON.stringify(getParameters()));
      }
    },
    {
      name: 'set_parameters',
      description: '謹賀新年の渦巻きを描くパラメータを設定する。指定したものだけ変わり、スライダーもその値に動く',
      inputSchema: {
        type: 'object',
        properties: {
          radiusDiff: { type: 'number', description: '半径の増分 (0.01〜10)。大きいほど渦の間隔が広がる' },
          radiusNoiseDiff: { type: 'number', description: '半径ノイズの増分 (0〜0.1)。大きいほどぐにゃぐにゃになる' },
          radianDiff: { type: 'number', description: '角度の増分 (0.001〜3)。小さいほどなめらか、大きいほど角ばる' },
          strokeWeight: { type: 'number', description: '線の太さ (0.01〜10)' }
        }
      },
      execute: function(args) {
        setParameters(args || {});
        return textResult('設定しました: ' + JSON.stringify(getParameters()));
      }
    },
    {
      name: 'adjust',
      description: '謹賀新年の渦巻きを言葉で調整する。対応するスライダーが少し動く。効き足りなければ繰り返し呼べる',
      inputSchema: {
        type: 'object',
        properties: {
          word: {
            type: 'string',
            enum: Object.keys(ADJUSTMENTS),
            description: 'どうしたいか。すかすか/ぎゅうぎゅう: 渦の間隔、ぐにゃぐにゃ/まっすぐ: 歪み、かくかく/なめらか: 角ばり、ふとく/ほそく: 線の太さ'
          }
        },
        required: ['word']
      },
      execute: function(args) {
        var word = args && args.word;
        if (!ADJUSTMENTS.hasOwnProperty(word)) {
          return textResult('知らない言葉です: ' + word);
        }
        adjustParameter(word);
        return textResult(word + ' を1段階かけました: ' + JSON.stringify(getParameters()));
      }
    },
    {
      name: 'download_image',
      description: '現在の謹賀新年をPNG画像としてダウンロードする',
      inputSchema: { type: 'object', properties: {} },
      execute: function() {
        $('#save').click();
        return textResult('画像をダウンロードしました');
      }
    }
  ];

  // コンソールから動作確認するための参照
  window.kinga2013Tools = tools;

  $(function() {
    var modelContext = document.modelContext || navigator.modelContext;
    if (!modelContext) return;
    tools.forEach(function(tool) {
      modelContext.registerTool(tool);
    });
    $('h1').append(' <span class="label label-success">Web MCP available</span>');
  });
})();
