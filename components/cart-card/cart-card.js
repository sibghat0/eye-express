import React from "react";
import "./cart-card.css";

function CartCard({
  product,
  cart,
  lessThan4,
  increment,
  decrement,
  deleteItem,
  checkOut,
}) {
  return (
    <div className={lessThan4 ? "cart-item less" : "cart-item"}>
      <img
        src={product.images[0].image}
        alt=""
        onClick={() => (window.location.href = `/products/${product.id}`)}
      />
      <div className="details">
        <div className="top">
          <h2>
            {product.title}{" "}
            {checkOut && (
              <span className="quant">Quantity: {product.cartQuantity}</span>
            )}
          </h2>
          {checkOut ? null : (
            <i className="far fa-trash-alt" onClick={deleteItem}></i>
          )}
        </div>
        <p>{product.category}</p>

        <div className="item-price">
          {product.variations?.length && (
            <span
              style={{
                textTransform: "capitalize",
                fontSize: 13,
                letterSpacing: 1,
              }}
            >
              {`${product.variationName || "Variation"}: ${
                product.variation.variation
              }`}
            </span>
          )}
          {checkOut ? (
            <div className="quant">Quantity: {product.cartQuantity}</div>
          ) : (
            <div className="quantity">
              <button type="button" onClick={decrement}>
                -
              </button>
              <span>{product.cartQuantity}</span>
              <button type="button" onClick={increment}>
                +
              </button>
            </div>
          )}
          <span>₹{product.variation.listing}</span>
        </div>
      </div>
    </div>
  );
}

export default CartCard;
