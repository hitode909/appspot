# hitode909.appspot.com → GitHub Pages 移行計画

## プロジェクト概要
Google App Engine で動いていたアーティスト/開発者のポートフォリオサイトを GitHub Pages に移行する計画です。
約80個のWebアプリケーションが含まれており、そのうち約80%は完全静的コンテンツで GitHub Pages に移行可能です。

## 移行対象コンテンツ分類

### 🟢 即座に移行可能（完全静的）- 残すコンテンツ

#### メインコンテンツ（優先度高）
- **htdocs/index.html** - トップページ（リンク修正必要）
- **htdocs/slitscan/** - Slit-Scan写真エフェクト
- **htdocs/rinkaku/** - 輪郭検出
- **htdocs/html909/** - TR-909風ドラムマシン
- **htdocs/stainless_shower_synthesizer/** - シンセサイザー
- **htdocs/speed_reading/** - 速読ツール
- **htdocs/10sec_wav/** - オーディオファイル処理
- **htdocs/sort_color/** - 画像の色分析
- **htdocs/text_to_image/** - テキスト画像変換

#### インタラクティブコンテンツ
- **htdocs/blink1-6/** - 点滅エフェクト集（6種類）
- **htdocs/diary/** - 日記機能（ローカルストレージ）
- **htdocs/drum/** - ドラムパッド
- **htdocs/inputlog/** - 入力履歴記録
- **htdocs/threshold_filter/** - Canvas閾値フィルター
- **htdocs/whispper/** - テキスト処理
- **htdocs/yureta/** - 揺れエフェクト
- **htdocs/compass/** - コンパス機能
- **htdocs/accgraph/** - 加速度センサーグラフ

#### 音楽・オーディオ関連
- **htdocs/amen/** - WAVファイル解析
- **htdocs/sin/** - 音波シンセサイザー
- **htdocs/sound_button/** - 音が出るボタン
- **htdocs/wav/** - WAVファイル処理
- **htdocs/audiotag/** - オーディオタグ

#### 視覚・アート系
- **htdocs/2013/** - 新年ビジュアル（Processing.js）
- **htdocs/agif/** - アニメーションGIF表示
- **htdocs/cuteicon/** - アイコン表示
- **htdocs/marquee/** - マーキー表示
- **htdocs/screensaver/** - スクリーンセーバー
- **htdocs/breakfastselector/** - 朝食セレクター

#### 共通ライブラリ（保持）
- **htdocs/js/** - 共通JavaScriptライブラリ
- **htdocs/css/** - 共通CSS
- **htdocs/jquery-lightbox-0.5/** - ライトボックスライブラリ
- **htdocs/jquery.plot/** - プロットライブラリ

### 🟡 修正後移行可能 - 一部修正して残すコンテンツ

#### API依存（APIキー更新・代替検討）
- **htdocs/map/** - Google Maps API使用（APIキー要更新）
- **htdocs/paralleltube/** - YouTube API使用
- **htdocs/youtube_looper/** - YouTube API使用
- **htdocs/youtube_looper2/** - YouTube API使用
- **htdocs/image_search_presentation/** - Google Search API使用
- **htdocs/realinternet/** - Google Maps API使用

#### サーバーサイド処理依存
- **htdocs/sentence_imager/** - `/text/` エンドポイント使用（要代替実装）
- **htdocs/nagameru/** - Tumblr API使用（要代替実装）
- **htdocs/blink6/** - 外部API依存（要代替実装）

### 🔴 移行困難・削除対象 - 捨てるコンテンツ

#### Flash依存（廃止技術）
- **htdocs/game/** - Flash Invaderゲーム（game.swf）
- **htdocs/gomi/** - Flash友達ゴミ箱ゲーム（gomi.swf）
- **htdocs/swf/** - Flash ロゴジェネレーター

#### App Engine バックエンド依存
- **thumbnail.to/** - Python App Engine バックエンドが必要

#### Python App Engine コード（全て削除対象）
- **album/** - 写真アルバム機能
- **blogparts/** - ブログパーツ
- **color/** - 色関連API
- **dic/** - 辞書機能
- **glitch/** - Glitch API
- **oauth/** - OAuth認証
- **png/** - PNG処理
- **proxy/** - プロキシ
- **public_list/** - 公開リスト
- **text/** - テキスト保存
- **tinyurl/** - URL短縮
- **tweet/** - Twitter連携
- **app.yaml** - App Engine設定
- **index.yaml** - データベースインデックス

#### ビルドツール（npm dependencies は保持）
- **gulpfile.js** - ビルド設定（GitHub Pages では不要）
- **node_modules/** - 削除（.gitignore で除外）

## 技術的準備

### ローカル開発環境セットアップ
```bash
# 静的サーバー起動（開発用）
npx http-server htdocs -p 8080 -c-1

# または Python 簡易サーバー
cd htdocs && python3 -m http.server 8080
```

### ディレクトリ構造変更
```
現在: /htdocs/xxx/index.html
移行後: /xxx/index.html （htdocs を root に）
```

### メインページ修正
- **htdocs/index.html** のリンク修正
- Google Analytics ID 確認・更新
- 広告コード削除・更新検討

## 移行手順

### Phase 1: 即座実行
1. ✅ プロジェクト調査完了
2. ✅ Python コード削除
3. ✅ ローカル静的サーバーでテスト
4. ⏳ htdocs/を GitHub Pages で配信させる形でセットアップ

### Phase 2: 修正対応
1. Google APIs のキー更新
2. 外部API依存コンテンツの修正・代替実装
3. リンク修正・テスト

### Phase 3: 最適化
1. 不要ファイル削除
2. パフォーマンス最適化
3. モバイル対応確認

## 期待される結果
- 約80%のコンテンツが GitHub Pages で正常動作
- 保守コスト大幅削減
- クリエイティブな Web アプリケーションポートフォリオとして復活
- レスポンシブ対応の現代化余地

## 備考
- MIT ライセンス適用済み
- ドメイン hitode909.github.io でアクセス可能予定
- カスタムドメイン設定も可能