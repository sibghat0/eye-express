import React from "react";
import Lottie from "react-lottie";
import animationData from "../../../assets/file-loading.json";
import "./loader.css";
function Loader() {
  return (
    <div className="loader">
      <Lottie options={{ animationData }} width={100} height={100} />
    </div>
  );
}

export default Loader;
