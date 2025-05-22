import React, { Component } from "react";
import "./buypage.css";
import call from "../../../../assets/call.webp";
import whatsapp from "../../../../assets/whatsapp.webp";
import homes from "../../../../assets/homes.webp";
import store from "../../../../assets/store.webp";
export default class Buypage extends Component {
  render() {
    return (
      <div className="poster">
        <h4>BUY IT YOUR WAY</h4>
        <div className="line"></div>
        <div className="imgContainer">
          <div className="left">
            <a href="#">
              <img src={call} alt="call" />
            </a>
            <a href="#">
              <img src={homes} alt="homes" />
            </a>
          </div>
          <div className="right">
            <a href="#">
              <img src={whatsapp} alt="whatsap" />
            </a>
            <a href="#">
              <img src={store} alt="store" />
            </a>
          </div>
        </div>
      </div>
    );
  }
}
