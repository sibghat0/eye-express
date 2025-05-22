import React from "react";
import "./order-card.css";

import firebase from "firebase";
import Loader from "../loader/loader";
import moment from "moment";

export default class OrderCard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      order: {},
      loading: true,
    };
  }

  componentDidMount() {
    firebase
      .firestore()
      .collection("orders")
      .doc(this.props.order)
      .get()
      .then((doc) => {
        this.setState({
          order: doc.data(),
          loading: false,
        });
      });
  }

  render() {
    return (
      //   <a href="/" className="orderList">
      //     <div className="part1">
      //       <img
      //         src={fruits}
      //         alt="img"
      //       />
      //       <div className="part1-detail">
      //         <h5>Fruits, Vegetables</h5>
      //         <p>Order date : Nov 5, 2020</p>
      //       </div>
      //     </div>
      //     <div className="part2">
      //       <p>₹2599</p>
      //     </div>
      //     <div className="part3">
      //       <div className="one">
      //         <div className="indictionCircle"></div>
      //         <p className="deliveryState">Delivered</p>
      //       </div>
      //       <p className="deliveryDate">Delivered on : Nov 5, 2020</p>
      //     </div>
      //   </a>
      <>
        {this.state.loading ? (
          <Loader />
        ) : (
          <a href={`/orders/${this.props.order}`} className="orderList">
            <div className="part1">
              <img
                src={this.state.order.products[0].images[0].image}
                alt="img"
              />
              <p className="deliveryState">
                {this.state.order.status.includes(0) &&
                !this.state.order.status.includes(18) &&
                !this.state.order.status.includes(7) &&
                !this.state.order.status.includes(8)
                  ? "Process"
                  : this.state.order.status.includes(18) &&
                    !this.state.order.status.includes(7) &&
                    !this.state.order.status.includes(8)
                  ? "Transit"
                  : this.state.order.status.includes(7) &&
                    !this.state.order.status.includes(8)
                  ? "Delivered"
                  : "Canceled"}
              </p>
            </div>

            <div className="left">
              <div className="part2">
                <h4>
                  {this.state.order.products[0].title}{" "}
                  {this.state.order.products.length > 1 ? (
                    <span
                      style={{ fontWeight: 500, color: "#333", fontSize: 14 }}
                    >{`& ${this.state.order.products.length - 1} more`}</span>
                  ) : null}
                </h4>
                <span className="date1">
                  {moment(this.state.order.date.toDate()).format("Do MMM YYYY")}
                </span>
                <span className="date2">
                  {moment(this.state.order.date.toDate()).format("D/MM/YYYY")}
                </span>
              </div>

              <div className="part3">
                <div className="order-info">
                  <h4>Order ID</h4>
                  <span
                    style={{
                      width: 80,
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                    }}
                  >
                    {this.props.order}
                  </span>
                </div>
                <div className="order-info">
                  <h4>Amount</h4>
                  <span>₹ {this.state.order.total}</span>
                </div>
                <div className="order-info">
                  <h4>Payment</h4>
                  <span>
                    {this.state.order.payment === "cash on delivery" ? (
                      <div>
                        <span className="cod">COD</span>
                        <span className="cod2">{this.state.order.payment}</span>
                      </div>
                    ) : (
                      this.state.order.payment
                    )}
                  </span>
                </div>
              </div>
            </div>
          </a>
        )}
      </>
    );
  }
}
