import { Product } from './type'
import { formatPrice } from './util'

export const createAmpEmailTemplate = (
  proxyServerUrl: string,
  product: Product
) => {
  return `
  <!doctype html>
  <html ⚡4email>

  <head>
    <meta charset="utf-8">
    <title>商品情報</title>
    <script async src="https://cdn.ampproject.org/v0.js"></script>
    <script async custom-element="amp-form" src="https://cdn.ampproject.org/v0/amp-form-0.1.js"></script>
    <style amp4email-boilerplate>
      body {
        visibility: hidden
      }
    </style>
    <style amp-custom>
      body {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Hiragino Sans', 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif;
      }

      .product-card {
        padding: 16px;
        max-width: 400px;
        margin: 0 auto;
      }

      .add-to-cart-button {
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        border: none;
        cursor: pointer;
      }
    </style>
  </head>

  <body>
    <div class="product-card">
      <h2>${product.title}</h2>
      <p>${product.description}</p>
      <p>価格: ${formatPrice(product.price)}円</p>

      <form method="post" action-xhr="${proxyServerUrl}">
        <input type="hidden" name="id" value="${product.variantId}">
        <input type="hidden" name="quantity" value="1">
        <input type="submit" value="カートに追加" class="add-to-cart-button">
      </form>
    </div>
  </body>

  </html>
  `
}
