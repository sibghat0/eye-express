import React, { Component } from "react";
import "./order.css";
import Lottie from "react-lottie";
import noItems from "../../../assets/20824-opening-cardboard-box.json";
import { Button } from "@material-ui/core";
import { Tab, Tabs } from "@material-ui/core";
import OrderCard from "../../components/order-card/order-card";
import Loader from "../../components/loader/loader";
import firebase from "firebase";
import { Redirect } from "react-router-dom";
import toaster from "toasted-notes";
export default class Order extends Component {
  constructor(props) {
    super(props);
    this.state = {
      orders: [],
      sortedOrders: [],
      loading: true,
      currentTab: "all",
      width: window.innerWidth,
    };
  }
  componentDidMount() {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              var orderProducts = [];
              if (doc.data().orders.length > 0) {
                doc.data().orders?.forEach((order) => {
                  firebase
                    .firestore()
                    .collection("orders")
                    .doc(order)
                    .get()
                    .then((doc2) => {
                      if (doc2.exists) {
                        var orderProduct = doc2.data();
                        orderProduct.id = doc2.id;
                        orderProducts.push(orderProduct);
                        if (doc.data().orders.length === orderProducts.length) {
                          var process_orders = [];
                          var transit_orders = [];
                          var delivered_orders = [];
                          var cancel_orders = [];
                          orderProducts.forEach((item, index) => {
                            if (
                              item.status.includes(0) &&
                              !item.status.includes(18) &&
                              !item.status.includes(7) &&
                              !item.status.includes(8)
                            ) {
                              process_orders.push(item.id);
                            } else if (
                              item.status.includes(18) &&
                              !item.status.includes(7) &&
                              !item.status.includes(8)
                            ) {
                              transit_orders.push(item.id);
                            } else if (
                              item.status.includes(7) &&
                              !item.status.includes(8)
                            ) {
                              delivered_orders.push(item.id);
                            } else {
                              cancel_orders.push(item.id);
                            }

                            if (index === orderProducts.length - 1) {
                              var obj = {
                                all: doc.data().orders,
                                process: process_orders,
                                transit: transit_orders,
                                delivered: delivered_orders,
                                canceled: cancel_orders,
                              };
                              this.setState({
                                orders: doc.data().orders,
                                sortedOrders: obj,
                                loading: false,
                              });
                            }
                          });
                        }
                      }
                    });
                });
              } else {
                this.setState({
                  orders: doc.data().orders,
                  loading: false,
                });
              }
            });
            this.setState({
              loading: false,
            });
          });
      } else {
        this.setState({
          redirect: true,
        });
      }
    });
    window.addEventListener("resize", () => {
      this.setState({
        width: window.innerWidth,
      });
    });
  }

  componentWillUnmount() {
    window.removeEventListener("resize", () => {});
    if (this.state.redirect) {
      toaster.notify("Please login to access Order page!");
    }
  }

  render() {
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div className="orderPage">
        {this.state.loading && this.state.orders.length === 0 ? (
          <Loader />
        ) : (
          <>
            <h1 className="heading">Orders</h1>
            <div className="main">
              <div className="tabBar">
                <Tabs
                  orientation="vertical"
                  className="tabs"
                  value={this.state.currentTab}
                  onChange={(e, value) => this.setState({ currentTab: value })}
                  TabIndicatorProps={{
                    style: { backgroundColor: "#333", width: 3 },
                  }}
                >
                  <Tab label="All" value="all" />
                  <Tab label="Process" value="process" />
                  <Tab label="Transit" value="transit" />
                  <Tab label="Delivered" value="delivered" />
                  <Tab label="Canceled" value="canceled" />
                </Tabs>
                <Tabs
                  orientation="horizontal"
                  className="tabs-phone"
                  variant="scrollable"
                  scrollButtons="auto"
                  value={this.state.currentTab}
                  onChange={(e, value) => this.setState({ currentTab: value })}
                  TabIndicatorProps={{
                    style: { backgroundColor: "#333", height: 3 },
                  }}
                >
                  <Tab label="All" value="all" />
                  <Tab label="Process" value="process" />
                  <Tab label="Transit" value="transit" />
                  <Tab label="Delivered" value="delivered" />
                  <Tab label="Canceled" value="canceled" />
                </Tabs>
              </div>
              {this.state.orders.length > 0 ? (
                <div className="right-orders">
                  <p className="all-order">{this.state.currentTab} Orders</p>
                  <div className="w-list">
                    {this.state.sortedOrders[this.state.currentTab].length >
                    0 ? (
                      this.state.sortedOrders[this.state.currentTab].map(
                        (item) => <OrderCard order={item} key={item} />
                      )
                    ) : (
                      <h4
                        style={{
                          fontWeight: 500,
                          textAlign: "center",
                          marginTop: 100,
                        }}
                      >
                        No Order has been {this.state.currentTab}
                      </h4>
                    )}
                  </div>
                </div>
              ) : (
                <div className="right-orders">
                  <p className="all-order">{this.state.currentTab} Orders</p>
                  <div className="noItems">
                    <Lottie
                      options={{ animationData: noItems }}
                      width={300}
                      height={300}
                    />
                    <h1>No Orders, Order Something!</h1>
                    <Button
                      variant="contained"
                      onClick={() => (window.location.href = "/")}
                    >
                      Continue Shopping
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  }
}
