import React, { useState } from "react";
import "./notFound.css";
import Lottie from "react-lottie";
import notFound from "../../../assets/62541-404-error-robot.json";
import { Button } from "@material-ui/core";
import { Redirect } from "react-router-dom";

function NotFound({ product, order }) {
  const [redirect, setRedirect] = useState(false);
  if (redirect) {
    return <Redirect to="/" />;
  }
  return (
    <div className={order ? "notFound order" : "notFound"}>
      <Lottie options={{ animationData: notFound }} width={300} height={300} />
      <h1>{product ? "Product" : order ? "Order" : "Page"} Not Found</h1>
      <Button variant="contained" onClick={() => setRedirect(true)}>
        Go Home
      </Button>
    </div>
  );
}

export default NotFound;
