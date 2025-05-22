import React, { Component } from "react";
import square1 from "../../../../assets/square1.webp";
import square2 from "../../../../assets/square2.webp";
import square3 from "../../../../assets/square3.webp";
import square4 from "../../../../assets/square4.webp";
import square5 from "../../../../assets/square5.webp";
import "./perfect.css";

export default class Perfect extends Component {
  render() {
    return (
      <div className="Perfect">
        <h4>FIND THE PERFECT FIT</h4>
        <div className="line"></div>
        <div className="imgContainer">
          <div className="left">
            <a href="#">
              <img src={square1} alt="square1" />
            </a>
            <a href="#">
              {" "}
              <img src={square4} alt="square4" />
            </a>
          </div>
          <div className="right">
            <a href="#">
              <img src={square2} alt="square2" />
            </a>
            <a href="#">
              {" "}
              <img src={square3} alt="square3" />
            </a>
            <a href="#">
              {" "}
              <img src={square5} alt="square5" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
