import React, { useEffect, useState } from "react";
import "./card.css";
import firebase from "firebase";
// import Loader from "../loader/loader";
import toaster from "toasted-notes";
import "toasted-notes/src/styles.css";
import { Rating } from "@material-ui/lab";
import Loader from "../loader/loader";

export default function Card({ id, view, normalz }) {
  const [item, setItem] = useState({});
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  const [userID, setUserID] = useState("");
  const [isWished, setIsWished] = useState(false);

  useEffect(() => {
    firebase
      .firestore()
      .collection("products")
      .doc(id)
      .get()
      .then((doc) => {
        var product = doc.data();
        product.id = doc.id;
        setItem(product);
        setWishlist([]);
        setIsWished(false);
        setUserID("");
        setLoading(false);
      });
  }, []);

  const discount =
    item.variations?.length > 0
      ? parseInt(
          ((item.variations[0]?.usual - item.variations[0]?.listing) /
            item.variations[0]?.usual) *
            100
        )
      : 0;

  const handleWishList = (e) => {
    e.preventDefault();
    firebase
      .firestore()
      .collection("users")
      .doc(userID)
      .get()
      .then((doc) => {
        if (isWished) {
          let arr = doc.data().wishlist.filter((item) => item !== id);
          firebase
            .firestore()
            .collection("users")
            .doc(userID)
            .update({
              wishlist: arr,
            })
            .then(() => {
              toaster.notify("Removed from Wishlist");
              setIsWished(false);
              setWishlist(arr);
            });
        } else {
          let wishArr = doc.data().wishlist;
          wishArr.push(id);
          firebase
            .firestore()
            .collection("users")
            .doc(userID)
            .update({
              wishlist: wishArr,
            })
            .then(() => {
              toaster.notify("Added to Wishlist");
              setIsWished(true);
              setWishlist(wishArr);
            });
        }
      });
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : item.quantity > 0 ? (
        <a href={`/products/${item.id}`} className="box list">
          <img src={item.images[0].image} alt="" />
          <div className="details">
            <div className="name">
              <p>{item.title}</p>
              <p>{item.category}</p>
            </div>
            <div className="pricing">
              <span className="price">₹{item.variations[0].listing}</span>
              <span>₹{item.variations[0].usual}</span>
              <span>{discount}% off</span>
            </div>
          </div>
        </a>
      ) : null}
    </>
  );
}
