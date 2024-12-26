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

#### 3. ローカルサーバーの起動

```bash
npm run serve
```

#### 4. スクリプトの実行

```bash
npm run exec
```

## Shopifyの事前知識

- BASEやSTORESのようにShopifyも同様に知識や経験がない初心者でも簡単にECサイトを立ち上げることができるサービス
- サイトテーマやブログなど多数のテンプレートが用意されておりGUIポチポチでECサイトを構築できる
- WordpressなどのCMSのEC版
- CMS同様にカスタマイズ性に乏しい課題があるが、ShopifyはHeadless APIなど多数のAPIが用意されており柔軟なカスタマイズをすることも可能

## API調査

### Admin API

- [GraphQL Admin API reference](https://shopify.dev/docs/api/admin-graphql)
- アプリや外部サービスをShopifyストアと連携するのに利用するAPI

> The Admin API lets you build apps and integrations that extend and enhance the Shopify admin.
Shopify管理画面をより効率化するためのAPIに思える

### Storefront API

- [Storefront API reference](https://shopify.dev/docs/api/storefront)
  - ref. [Docs](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client#readme)
- Shopifyストアの外でもショッピング体験を作ることができるAPI
  - 例）他のサイトで購入したアイテムをカートに追加するなど
- Headless Commerceと呼ばれるもの
  - Wordpressのカスタマイズ性に乏しい面への対策として、バックエンド機能だけを切り出したHeadless CMSがあるが、それと同様にECサイトのバックエンドのみを切り出したもの。カート追加やチェックアウト、商品情報の取得など、ECサイトの裏側で必要となる処理を提供
  - HeadlessなのでフロントはNext.jsやモバイルアプリ、AMPメールなど自由に使うことが可能

#### Ajax API

- Shopifyサイトに閉じた世界でより高度にカスタマイズしたい人向けのAPI
- いわゆる`/cart/add.js`とかそういった類のもの
- あくまでShopifyサイトからアクセスすることを前提にしているものでカスタマーのブラウザセッションを元にカート追加などの機能を提供している様子
  - > You can use the Storefront API to interact with a cart during a customer's session.
- [Cart API reference](https://shopify.dev/docs/api/ajax/reference/cart)
  - >The Cart API is used to interact with a cart during a customer's session.

参考: ドメイン外から叩こうとすると普通に実行するCORSで弾かれるのでやはりShopifyサイト内での利用に限定している様子。

> [amp-form] Form submission failed: Error: Request viewerRenderTemplate failed: Error: Class$obf__10: Access to fetch at 'https://[YOUR_DOMAIN]/cart/add.js' from origin 'https://mail.google.com' has been blocked by AMP CORS policy: No 'Access-Control-Allow-Origin' header is present on the requested resource.

## ユーザに成り代わって商品をカート追加する方法

結論、認証はユーザー操作が必要なので王道のイメージではできない気がする。

追記: これでできそうかも？
[Create and update a cart with the Storefront API](https://shopify.dev/docs/storefronts/headless/building-with-the-storefront-api/cart/manage)

### `cartBuyerIdentityUpdate`が使えない理由

- 顧客カート更新であれば[`cartBuyerIdentityUpdate`](https://shopify.dev/docs/api/storefront/2024-04/mutations/cartbuyeridentityupdate)が用意されているが、これは`buyerIdentity`に`customerAccessToken`を指定する必要がある。
- `customerAccessToken`の取得には[`customerAccessTokenCreate`](https://shopify.dev/docs/api/storefront/2024-10/mutations/customeraccesstokencreate)ミューテーションで生成する必要があり、入力には顧客のemailとpasswordの指定が必要（つまり顧客の操作なしでは実行不可）
- 設計上顧客のカートの中身を勝手に弄ることは許されていないのだろう

## VS Code Extension

- [amphtml-validator - Visual Studio Marketplace](https://marketplace.visualstudio.com/items?itemName=amphtml.amphtml-validator)

## References

- [shopify_flutter | Flutter package](https://pub.dev/packages/shopify_flutter)
  - モバイルアプリ（Shopifyの外の世界）でどうやって実装するものなのかを知るのが理解早い。
