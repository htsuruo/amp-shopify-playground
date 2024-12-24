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

## Shopifyの事前知識

- BASEやSTORESのようにShopifyも同様に知識や経験がない初心者でも簡単にECサイトを立ち上げることができるサービス
- サイトテーマやブログなど多数のテンプレートが用意されておりGUIポチポチでECサイトを構築できる
- WordpressなどのCMSのEC版
- CMS同様にカスタマイズ性に乏しい課題があるが、ShopifyはHeadless APIなど多数のAPIが用意されており柔軟なカスタマイズをすることも可能

## API調査

### GraphQL Admin API

- [GraphQL Admin API reference](https://shopify.dev/docs/api/admin-graphql)

> The Admin API lets you build apps and integrations that extend and enhance the Shopify admin.
Shopify管理画面をより効率化するためのAPIに思える。

### Storefront API

- Headless Commerceと呼ばれるもの
  - Wordpressのカスタマイズ性に乏しい面への対策として、バックエンド機能だけを切り出したHeadless CMSがあるが、それと同様にECサイトのバックエンドのみを切り出したもの。カート追加やチェックアウト、商品情報の取得など、ECサイトの裏側で必要となる処理を提供
  - HeadlessなのでフロントはNext.jsやモバイルアプリ、AMPメールなど自由に使うことが可能
- 例えば[cartCreate](https://shopify.dev/docs/api/storefront/2024-10/mutations/cartCreate)がリファレンス

#### Ajax API

- Shopifyサイトをより高度にカスタマイズしたい人向けのAPI
- あくまでShopifyサイトからアクセスすることを前提にしているものでカスタマーのブラウザセッションを元にカート追加などの機能を提供している様子
  - > You can use the Storefront API to interact with a cart during a customer's session.

>The Cart API is used to interact with a cart during a customer's session.
[Cart API reference](https://shopify.dev/docs/api/ajax/reference/cart)

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

## エラー周り

普通に実行するCORSで弾かれるのでShopify側での設定が必要。

> [amp-form] Form submission failed: Error: Request viewerRenderTemplate failed: Error: Class$obf__10: Access to fetch at 'https://[YOUR_DOMAIN]/cart/add.js' from origin 'https://mail.google.com' has been blocked by AMP CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.
