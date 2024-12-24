import { Product } from './type'

export const createAmpEmailTemplate = (product: Product) => {
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
      <h2>$xx</h2>
      <p>$xx</p>
      <p>価格: $xxx</p>

      <form method="post" action-xhr="https://your-domain.com/cart/add.js">
        <input type="hidden" name="id" value="${product.variantId}">
        <input type="hidden" name="quantity" value="1">
        <input type="submit" value="カートに追加" class="add-to-cart-button">
      </form>
    </div>
  </body>

  </html>
  `
}
