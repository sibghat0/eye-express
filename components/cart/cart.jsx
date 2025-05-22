import React, { useState, useEffect } from "react";
import "./cart.css";
import { Button } from "@material-ui/core";
import firebase from "firebase";
import CartCard from "../cart-card/cart-card";
import Loader from "../loader/loader";
import empty_box from "../../../assets/20824-opening-cardboard-box.json";
import Lottie from "react-lottie";
import { Redirect } from "react-router";

function Cart({ active, onClose, cartUpdate }) {
  const [cart, setCart] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subTotal, setSubTotal] = useState(0);
  const [shipping, setShipping] = useState(0);
  const [userID, setUserID] = useState("");

  useEffect(() => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .onSnapshot((snap) => {
            snap.docChanges().forEach((changes) => {
              var products = [];
              var subTotal = 0;
              var shipping = 0;
              var cart = changes.doc.data().cart;
              setUserID(changes.doc.id);
              changes.doc.data().cart.forEach(async (item, index) => {
                await firebase
                  .firestore()
                  .collection("products")
                  .doc(item.product)
                  .get()
                  .then((doc2) => {
                    if (doc2.exists) {
                      var product = doc2.data();
                      product.id = doc2.id;
                      product.cartQuantity = item.quantity;
                      product.variation = item.variation;
                      products.push(product);
                      subTotal =
                        subTotal + item.variation.listing * item.quantity;
                      shipping += doc2.data().shipping * item.quantity || 0;
                      if (products.length === changes.doc.data().cart.length) {
                        setCart(changes.doc.data().cart);
                        setProducts(products);
                        setLoading(false);
                        setSubTotal(subTotal);
                        setShipping(subTotal > 399 ? 0 : shipping);
                      }
                    } else {
                      cart = cart.filter(
                        (item2) => item2.product !== item.product
                      );
                      firebase
                        .firestore()
                        .collection("users")
                        .doc(changes.doc.id)
                        .update({
                          cart,
                        });
                    }
                  });
                // console.log(index, changes.doc.data().cart.length - 1);
                // if (index === changes.doc.data().cart.length - 1) {
                //   firebase.firestore().collection("users").doc(userID).update({
                //     cart: newCart,
                //   });
                // }
              });

              if (
                products.length > changes.doc.data().cart.length ||
                changes.doc.data().cart.length === 0
              ) {
                setCart(changes.doc.data().cart);
                setProducts([]);
                setLoading(false);
              }
            });
          });
        setLoading(false);
      }
    });
  }, []);

  active
    ? (document.body.style.overflow = "hidden")
    : (document.body.style.overflow = "auto");

  const increment = (data) => {
    firebase
      .firestore()
      .collection("users")
      .doc(userID)
      .get()
      .then((doc) => {
        var cart = doc.data().cart;
        cart.forEach((item) => {
          if (
            item.product === data.id &&
            item.variation.variation === data.variation.variation
          ) {
            item.quantity += 1;
          }
        });
        firebase.firestore().collection("users").doc(doc.id).update({
          cart: cart,
        });
      });
  };

  const decrement = (data) => {
    firebase
      .firestore()
      .collection("users")
      .doc(userID)
      .get()
      .then((doc) => {
        var cart = doc.data().cart;
        cart.forEach((item) => {
          if (
            item.product === data.id &&
            item.variation.variation === data.variation.variation &&
            item.quantity > 1
          ) {
            item.quantity -= 1;
          }
        });
        firebase.firestore().collection("users").doc(doc.id).update({
          cart: cart,
        });
      });
  };

  const deleteItem = (data) => {
    console.log(data);
    firebase
      .firestore()
      .collection("users")
      .doc(userID)
      .get()
      .then((doc) => {
        var cart = doc
          .data()
          .cart.filter(
            (item) =>
              item.product !== data.id ||
              item.variation.variation !== data.variation.variation
          );
        firebase
          .firestore()
          .collection("users")
          .doc(doc.id)
          .update({
            cart,
          })
          .then(() => cartUpdate());
      });
  };

  return (
    <div
      className={active ? "background active" : "background"}
      onClick={onClose}
    >
      {loading ? (
        loading
      ) : (
        <div
          className={active ? "cart active" : "cart"}
          onClick={(e) => e.stopPropagation()}
        >
          <i className="fas fa-times" onClick={onClose}></i>
          <h1>CART</h1>
          {cart.length > 0 ? (
            <>
              <div className="cart-items">
                {products.map((item, index) => (
                  <CartCard
                    product={item}
                    key={JSON.stringify(item.variation)}
                    increment={() => increment(item)}
                    decrement={() => decrement(item)}
                    deleteItem={() => deleteItem(item)}
                    cart={cart}
                    lessThan4={products.length <= 4}
                  />
                ))}
              </div>
              <div className="billing">
                <p>
                  subtotal <span style={{ minWidth: 50 }}>Rs. {subTotal}</span>
                </p>
                <p>
                  shipping
                  <br />
                  (free delivery above Rs.399/-)
                  <span style={{ minWidth: 50 }}>Rs. {shipping}</span>
                </p>
                <p>
                  total <span>Rs. {subTotal + shipping}</span>
                </p>
              </div>
              <div className="paynow">
                <p>₹{subTotal + shipping} /-</p>
                <a href="/checkout">Pay Now</a>
              </div>
            </>
          ) : (
            <div className="noItems">
              <Lottie
                options={{ animationData: empty_box }}
                width={200}
                height={200}
              />
              <h4>No Items in your Cart.</h4>
              <Button
                variant="contained"
                onClick={() => {
                  window.location.href = "/";
                  onClose();
                }}
              >
                Go Shopping
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default Cart;
