# hitode909.appspot.com

This is my homepage.

http://hitode909.appspot.com/

## App Engine Redirect Application

このリポジトリのルートディレクトリには、hitode909.appspot.com から GitHub Pages へのリダイレクトを行うための最小限の Google App Engine アプリケーションが含まれています。

### 概要

このアプリケーションは以下のリダイレクトを実行します：

- `https://hitode909.appspot.com/` → `https://hitode909.github.io/appspot/`
- `http://hitode909.appspot.com/` → `https://hitode909.github.io/appspot/`
- `http://hitode909.appspot.com/foo/bar?baz=qux` → `https://hitode909.github.io/appspot/foo/bar?baz=qux`

パスとクエリパラメータは全て保持されます。

### ファイル構成

- `app.yaml` - Google App Engine 設定ファイル
- `index.html` - JavaScript によるリダイレクト処理を含む静的HTMLファイル

### デプロイ方法

#### 前提条件

1. Google Cloud CLI (gcloud) がインストールされていること
2. Google Cloud プロジェクトに適切な権限があること

#### デプロイ手順

1. **プロジェクトの設定**
   ```bash
   gcloud config set project hitode909-hrd
   ```

2. **必要なサービスの有効化**
   ```bash
   gcloud services enable appengine.googleapis.com
   gcloud services enable cloudbuild.googleapis.com
   ```

3. **権限の設定（必要に応じて）**
   ```bash
   # App Engine Deployer 権限
   gcloud projects add-iam-policy-binding hitode909-hrd \
       --member="user:hitode909@gmail.com" \
       --role="roles/appengine.deployer"
   
   # Storage Admin 権限（サービスアカウント用）
   gcloud projects add-iam-policy-binding hitode909-hrd \
       --member="serviceAccount:hitode909-hrd@appspot.gserviceaccount.com" \
       --role="roles/storage.admin"
   ```

4. **デプロイ実行**
   ```bash
   gcloud app deploy
   ```

5. **デプロイ確認**
   ```bash
   gcloud app browse
   ```

#### 注意事項

- デプロイには課金アカウントが設定されている必要があります
- Python 3.9 ランタイムは 2025年10月に廃止予定です
- 自動スケーリングのmax_instancesは20に設定されます

### ローカルテスト

```bash
npx http-server . -p 8080 -c-1
```

ブラウザで `http://localhost:8080` にアクセスしてリダイレクトをテストできます。

### トラブルシューティング

#### 権限エラーが発生する場合

Google Cloud Console で以下を確認してください：

1. プロジェクトに課金アカウントが関連付けられているか
2. App Engine API が有効になっているか  
3. 適切な IAM ロールが設定されているか

#### デプロイが失敗する場合

```bash
# 認証を更新
gcloud auth login

# プロジェクトを再設定
gcloud config set project hitode909-hrd

# 再デプロイ
gcloud app deploy
```

# LICENSE

MIT
