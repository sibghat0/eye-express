import React, { Component } from "react";
import { Link } from "react-router-dom";
import "./category.css";
export default class Category extends Component {
  render() {
    return (
      <div className="categories">
        <h3>Categories</h3>
        <div className="line"></div>
        <div className="cards">
          {this.props.categories &&
            this.props.categories.map((category, index) => {
              return (
                <Link
                  to={{
                    pathname: "/products",
                    state: {
                      category: category.name,
                    },
                  }}
                  key={index}
                >
                  <div
                    className={
                      this.props.categories.length - 1 === index &&
                      this.props.categories.length % 2 !== 0
                        ? "card last-card"
                        : "card"
                    }
                    key={index}
                  >
                    <img src={category.image} alt="" />
                    <p>{category.name}</p>
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    );
  }
}
