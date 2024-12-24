# amp-shopify-playground

AMP for GmailでのShopify連携（カート追加）を検証するためのレポジトリです。

## Usage

### 事前準備

#### 1. `.env`に以下の情報を記載し作成

```bash
SHOPIFY_STORE_URL="[YOUR_SHOPIFY_STORE_URL]"
SENDGRID_API_KEY="[YOUR_SENDGRID_API_KEY]"
```

#### 2. 依存関係のインストール

```bash
npm install
```

#### 3. スクリプトを実行

```bash
npm run exec
```

## API調査

- バックオフィス操作 → Admin API
- フロントエンド開発 → Storefront API
- 複雑なデータ取得 → GraphQL Admin API
- イベント処理 → Webhooks
- 実店舗連携 → マーチャントAPI

## AMP for Emailのアプローチ

GmailはAMP for Emailをサポートしており、動的なフォーム送信が可能
Shopifyの/cart/add.jsエンドポイントを利用可能

### 実装時の注意点

#### Shopify側での設定

- CORSヘッダーの設定
- AMP用のエンドポイントの許可

#### メール送信側

- AMP for Emailの仕様に準拠
- Gmailの開発者登録が必要

### 認証の仕組み

- 基本的にShopifyの/cart/add.jsエンドポイントは認証不要
- カートはセッションベースで管理され、ブラウザのCookieに紐付く

ただし、以下の制限があります：
- メール内でのCookie管理は制限される
- クロスドメインでの認証は制限される

### 推奨されるフロー

1. メールからカート追加 → 匿名カート作成
1. チェックアウト時にログインを促す
1. ログイン後にカートを既存アカウントと紐付け

```ts
// 1. 匿名カートの作成
const createAnonymousCart = async () => {
  const response = await fetch(`${SHOPIFY_STORE_URL}/cart/add.js`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: [{
        id: variantId,
        quantity: 1
      }]
    })
  });
  return response.json();
}

// 2. チェックアウトURLへのリダイレクト
const redirectToCheckout = (cartToken) => {
  return `${SHOPIFY_STORE_URL}/cart/${cartToken}`;
}
```

## VS Code Extension

- [amphtml-validator - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=amphtml.amphtml-validator)
