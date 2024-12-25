import { Product } from './types/types'
import { formatPrice } from './util'

export const createAmpEmailTemplate = (
  proxyServerUrl: string,
  products: Product[]
) => {
  return `
  <!doctype html>
  <html ⚡4email>

  <head>
    <meta charset="utf-8">
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

      .product-container {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
      }

      .product-card {
        padding: 4px;
        max-width: 400px;
        margin: 4px;
        flex: 1 1 calc(33.333% - 32px); /* 3 columns with space between */
        box-sizing: border-box;
      }

      .add-to-cart-button {
        background-color: #4CAF50;
        color: white;
        padding: 12px 20px;
        border: none;
        cursor: pointer;
      }

      .product-description {
        display: -webkit-box;
        -webkit-line-clamp: 3;
        -webkit-box-orient: vertical;
        overflow: hidden;
        text-overflow: ellipsis;
        line-height: 1.5em; /* 行の高さ */
        max-height: 4.5em; /* 3行分の高さ */
      }
    </style>
  </head>

  <body>
    <div class="product-container">
      ${products
        .map(
          (product) => `
        <div class="product-card">
          <h2>${product.title}</h2>
          <p class="product-description">${product.description}</p>
          <amp-img layout="responsive" width="400" height="300" src="${
            product.imageUrl
          }"></amp-img>
          <p>価格: ${formatPrice(product.price)}円</p>

          <form method="post" action-xhr="${proxyServerUrl}">
            <input type="hidden" name="id" value="${product.variantId}">
            <input type="hidden" name="quantity" value="1">
            <input type="submit" value="カートに追加" class="add-to-cart-button">
          </form>
        </div>
      `
        )
        .join('')}
    </div>
  </body>

  </html>
  `
}
