import React, { Component } from "react";
import "./orderDetail.css";
import { Backdrop, Button, CircularProgress, Modal } from "@material-ui/core";
import Rating from "@material-ui/lab/Rating";
import firebase from "firebase";
import Loader from "../../components/loader/loader";
import moment from "moment";
import close from "../../../assets/close-grey.svg";
import toaster from "toasted-notes";
import axios from "axios";
import NotFound from "../notFound/notFound";
export default class OrderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      order: {},
      loading: true,
      cancelBtn: false,
      uploading: false,
      cancelModal: false,
      ratingModal: false,
      value_for_money: 0,
      quality: 0,
      performance: 0,
      durability: 0,
      packaging: 0,
      review: "",
      user: "",
      rateProducts: [],
      rateProduct: {},
      ratingValue: 0,
      shipmentActivities: [],
      track_url: "",
      notFound: false,
      product_images: [],
      imgErr: "",
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
              this.setState({
                user: {
                  ...doc.data(),
                  id: doc.id,
                },
              });
            });
          });
        this.init();
      } else {
        this.init();
      }
    });
  }

  init = () => {
    firebase
      .firestore()
      .collection("orders")
      .doc(this.props.match.params.id)
      .get()
      .then(async (doc) => {
        if (doc.exists) {
          var order = doc.data();
          if (doc.data().awb_number.length > 0) {
            const config = {
              headers: {
                Authorization:
                  "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjE2MTA0NTMsImlzcyI6Imh0dHBzOi8vYXBpdjIuc2hpcHJvY2tldC5pbi92MS9leHRlcm5hbC9hdXRoL2xvZ2luIiwiaWF0IjoxNjI1NTkzMDYzLCJleHAiOjE2MjY0NTcwNjMsIm5iZiI6MTYyNTU5MzA2MywianRpIjoiY3hDUktISzBicnVlNndTYSJ9.hJA9mVTqq6tVNoNiBgrjg8ZSQdsT7MHRWN38Y8ARegY",
              },
            };
            axios
              .get(
                `https://apiv2.shiprocket.in/v1/external/courier/track/awb/${
                  doc.data().awb_number
                }`,
                config
              )
              .then((res) => {
                console.log(res.data);
                if (
                  !order.status.includes(res.data.tracking_data.shipment_status)
                ) {
                  order.status.push(res.data.tracking_data.shipment_status);
                }
                firebase
                  .firestore()
                  .collection("orders")
                  .doc(this.props.match.params.id)
                  .update({
                    status: order.status,
                  })
                  .then(() => {
                    this.setState({
                      shipmentActivities:
                        res.data.tracking_data.shipment_track_activities,
                      track_url: res.data.tracking_data.track_url,
                    });
                  })
                  .catch((err) => console.log(err));
              })
              .catch((err) => console.log(err));
          }
          if (this.state.user.id) {
            var rateProducts = [];
            for (let i = 0; i < doc.data().products.length; i++) {
              let pro = doc.data().products[i];
              await firebase
                .firestore()
                .collection("products")
                .doc(pro.id)
                .get()
                .then((doc2) => {
                  if (
                    doc2.exists &&
                    !pro.rate &&
                    doc.data().status.includes(7)
                  ) {
                    rateProducts.push(pro);
                  }
                });
            }
          }
          if (doc.data().email === this.state.user.email) {
            if (doc.data().status.includes(7)) {
              this.setState({
                order: order,
                uploading: false,
                ratingModal: rateProducts.length === 0 ? false : true,
                rateProducts: rateProducts,
                rateProduct: rateProducts.length === 1 ? rateProducts[0] : {},
                loading: false,
              });
            } else {
              this.setState({
                order: order,
                cancelBtn: true,
                uploading: false,
                ratingModal: rateProducts.length === 0 ? false : true,
                rateProducts: rateProducts,
                rateProduct: rateProducts.length === 1 ? rateProducts[0] : {},
                loading: false,
              });
            }
          } else {
            this.setState({
              order: order,
              loading: false,
              uploading: false,
              ratingModal: false,
              rateProducts: [],
              rateProduct: {},
            });
          }
        } else {
          this.setState({
            notFound: true,
            loading: false,
          });
        }
      });
  };

  handleProductImagePicker = (e) => {
    var arr = e.target.files[0];
    if (arr.size < 350000 && this.state.product_images.length < 7) {
      this.setState({
        product_images: [...this.state.product_images, arr],
        imgErr: "",
      });
    } else {
      this.setState({
        imgErr: "Image size greater than 350kb are not accepted",
      });
      setTimeout(() => {
        this.setState({
          imgErr: "",
        });
      }, 4000);
    }
  };

  removeImg = (ind) => {
    this.setState({
      product_images: this.state.product_images.filter(
        (_, index) => index !== ind
      ),
    });
  };

  handleImageUpload = async (image) => {
    var url = "";
    const storageRef = firebase
      .storage()
      .ref(`/ratings/${moment().format("DMMYYYY, h:mm:ss:SSS")}`);
    await storageRef
      .put(image)
      .then(async (res) => (url = await res.ref.getDownloadURL()));
    return url;
  };

  handleRate = () => {
    if (this.state.review.length > 0) {
      this.setState(
        {
          uploading: true,
        },
        () => {
          firebase
            .firestore()
            .collection("products")
            .doc(this.state.rateProduct.id)
            .get()
            .then(async (doc) => {
              if (doc.exists) {
                var images = [];
                if (this.state.product_images.length > 0) {
                  for (var i = 0; i < this.state.product_images.length; i++) {
                    var url = await this.handleImageUpload(
                      this.state.product_images[i],
                      true
                    );
                    images.push(url);
                  }
                }
                var ratings = doc.data().ratings;
                ratings.push({
                  review: this.state.review,
                  date: new Date(),
                  image: this.state.user.profilePic || "",
                  product_images: images,
                  name: this.state.user.name,
                  value_for_money: this.state.value_for_money,
                  quality: this.state.quality,
                  packaging: this.state.packaging,
                  durability: this.state.durability,
                  performance: this.state.performance,
                  rate:
                    (this.state.value_for_money +
                      this.state.quality +
                      this.state.packaging +
                      this.state.durability +
                      this.state.performance) /
                    5,
                });
                firebase
                  .firestore()
                  .collection("products")
                  .doc(doc.id)
                  .update({
                    ratings,
                  })
                  .then(() => {
                    var products = this.state.order.products;
                    products.forEach((pro) => {
                      if (pro.id === doc.id) {
                        pro.rate = true;
                      }
                    });
                    firebase
                      .firestore()
                      .collection("orders")
                      .doc(this.props.match.params.id)
                      .update({
                        products: products,
                      })
                      .then(() => {
                        toaster.notify("Product Rated!");
                        this.init();
                        this.setState({
                          uploading: false,
                          value_for_money: 0,
                          quality: 0,
                          packaging: 0,
                          durability: 0,
                          performance: 0,
                          product_images: [],
                          review: "",
                        });
                      });
                  });
              }
            });
        }
      );
    } else {
      toaster.notify("Please write a Review!");
      this.setState({
        uploading: false,
      });
    }
  };

  render() {
    return (
      <div className="orderDetail">
        {this.state.loading ? (
          <Loader />
        ) : this.state.notFound ? (
          <NotFound order />
        ) : (
          <>
            <div className="content">
              <div className="wrap">
                <div className="main">
                  <main>
                    <div className="head">
                      <p>
                        {this.state.order.status.includes(8)
                          ? "Your Order is Cancelled..."
                          : "Thanks for placing your order..."}
                      </p>
                    </div>
                    <div className="section_content">
                      <div className="status">
                        <div className="icon">
                          {this.state.order.status.includes(8) ? (
                            <div
                              style={{
                                width: 300,
                                height: "auto",
                                flexDirection: "row",
                                justifyContent: "center",
                              }}
                            >
                              <i
                                className="fas fa-times"
                                style={{
                                  backgroundColor: "#F17E9A",
                                  color: "#fff",
                                  borderColor: "#F17E9A",
                                  marginRight: 10,
                                }}
                              ></i>
                              <span style={{ color: "#F17E9A", fontSize: 20 }}>
                                Cancelled
                              </span>
                            </div>
                          ) : (
                            <>
                              <div
                                className={
                                  this.state.order.status.includes(0)
                                    ? "done"
                                    : ""
                                }
                              >
                                <i className="fas fa-check"></i>
                                <span className="title">Ordered</span>
                              </div>
                              <div
                                className={
                                  this.state.order.status.includes(18)
                                    ? "done"
                                    : ""
                                }
                              >
                                <i className="fas fa-box"></i>
                                <span className="title">Packed</span>
                              </div>
                              <div
                                className={
                                  this.state.order.status.includes(17)
                                    ? "done"
                                    : ""
                                }
                              >
                                <i className="fas fa-truck"></i>
                                <span className="title">Out for delivery</span>
                              </div>
                              <div
                                className={
                                  this.state.order.status.includes(7)
                                    ? "done"
                                    : ""
                                }
                              >
                                <i className="fas fa-home"></i>
                                <span className="title">Delivered</span>
                              </div>
                            </>
                          )}
                        </div>
                        <div className="icon_text">
                          <h2>
                            {this.state.order.status.includes(7)
                              ? "Your shipment is delivered sucessfully."
                              : this.state.order.status.includes(8)
                              ? "Your shipment is cancelled"
                              : "Your shipment is on the way"}
                          </h2>
                          <p>
                            {!this.state.order.status.includes(8)
                              ? "Come back to this page for updates on your shipment status."
                              : null}
                          </p>
                        </div>
                      </div>
                      {/* <div className="order_update">
                        <h2>Order updates</h2>
                        <div className="overflow_cont">
                          {this.state.shipmentActivities &&
                          this.state.shipmentActivities.length > 0 ? (
                            this.state.shipmentActivities.map(
                              (activity, index) => {
                                return (
                                  <div className="activity" key={index}>
                                    <h5>Activity: {activity.activity}</h5>
                                    <p>Location: {activity.location}</p>
                                    <p>
                                      Date:{" "}
                                      {moment(activity.date).format(
                                        "MMMM Do YYYY, h:mm a"
                                      )}
                                    </p>
                                  </div>
                                );
                              }
                            )
                          ) : (
                            <p className="noUpdates">
                              Currently there are no updates available...
                            </p>
                          )}
                        </div>
                      </div> */}
                      <div className="message">
                        {this.state.order.status.includes(8) ? (
                          <p>
                            Your order has been sucessfully cancelled. You will
                            recieve an E-mail on your registered E-mail Address
                            confirming your order cancellation for the same.
                          </p>
                        ) : (
                          <p>
                            Thank You For Placing Your Order. You will Receive
                            an Email on your registered Email address . Kindly
                            confirm the order via the same
                          </p>
                        )}
                      </div>
                      <div className="customer_information">
                        <h2>Customer information</h2>
                        <div className="content_information">
                          <div className="text_area_a">
                            <h3>Shipping address</h3>
                            <p>
                              {this.state.order.address},{" "}
                              {this.state.order.city} -{" "}
                              {this.state.order.pincode},{" "}
                              {this.state.order.state}
                            </p>
                          </div>
                          <div className="text_area_b">
                            <h3>Payment method</h3>
                            <p>{this.state.order.payment}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="step_footer">
                      <div className="replacement"></div>
                      {this.state.cancelBtn &&
                        !this.state.order.status.includes(8) && (
                          <>
                            <Button
                              className="cancel"
                              variant="outlined"
                              style={{ color: "red" }}
                              onClick={() =>
                                this.setState({ cancelModal: true })
                              }
                            >
                              Cancel
                            </Button>
                            <p
                              style={{
                                width: "auto",
                                alignSelf: "flex-end",
                                marginBottom: 3,
                              }}
                            >
                              {" "}
                              Want To Cancel Your Order ?
                            </p>
                          </>
                        )}
                    </div>
                  </main>
                </div>
              </div>
            </div>
            <div className="summery">
              <div className="inner-summery">
                <h2>SUMMERY</h2>
                <div className="order-details">
                  <h3>Order details</h3>
                  <div className="order-detail">
                    <p>ORDER DATE</p>
                    <p>
                      {moment(this.state.order.date.toDate()).format(
                        "Do MMM YYYY"
                      )}
                    </p>
                  </div>
                  <div className="order-detail">
                    <p>ORDER #</p>
                    <p>{this.props.match.params.id}</p>
                  </div>{" "}
                  <div className="order-detail">
                    <p>ORDER TOTAL</p>
                    <p>
                      Rs {this.state.order.total} (
                      {this.state.order.products.length} items)
                    </p>
                  </div>{" "}
                  <div className="order-detail">
                    <p>PAYMENT</p>
                    <p>{this.state.order.payment}</p>
                  </div>
                  {/* <div className="order-detail">
                    <p>DELIVERY DATE</p>
                    <p>22 may 2020</p>
                  </div> */}
                </div>
                {this.state.order.products.map((item) => (
                  <div className="order-card">
                    <img src={item.images[0].image} alt="" />
                    <div>
                      <p>{item.title}</p>
                      <span>
                        Order Status :{" "}
                        <span>
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
                        </span>
                      </span>
                    </div>
                    {/* <div style={{ marginLeft: 10 }}>
                      {" "}
                      <span style={{ fontSize: 12 }}>
                        {" "}
                        Qty : {item.cartQuantity}
                      </span>
                      <span style={{ fontSize: 12 }}>
                        {" "}
                        QTY : {item.cartQuantity}
                      </span>
                      <span style={{ fontSize: 12 }}>Total : </span>
                    </div> */}
                  </div>
                ))}
                <div className="order-details">
                  <h3>Shipping Address</h3>
                  <div
                    className="order-detail"
                    style={{ marginBottom: "10px" }}
                  >
                    <p style={{ fontWeight: "700", color: "#333" }}>
                      {this.state.order.name}
                    </p>
                    <p style={{ fontWeight: "700", color: "#333" }}>
                      {this.state.order.number}
                    </p>
                  </div>
                  <div className="order-detail">
                    <p>
                      {this.state.order.address}, {this.state.order.city} -{" "}
                      {this.state.order.pincode}, {this.state.order.state}
                    </p>
                  </div>
                </div>
                {/* <div className="order-details">
                  <h3>Order note</h3>
                  <div className="order-detail">
                    <p>
                      Lorem, ipsum dolor sit amet consectetur adipisicing elit.
                      Porro, eveniet!
                    </p>
                  </div>
                </div> */}

                <div className="order-details">
                  <h3>order summery</h3>
                  <div className="order-detail">
                    <p>SubTotal : </p>
                    <p>
                      Rs.{" "}
                      {this.state.order.total - this.state.order.shipping || 0}
                    </p>
                  </div>
                  {/* <div className="order-detail">
                    <p>Packing : </p>
                    <p>Rs. 0</p>
                  </div>
                  <div className="order-detail">
                    <p>Total before tax : </p>
                    <p>Rs. 345</p>
                  </div>
                  <div className="order-detail">
                    <p>tax </p>
                    <p>Rs. 345</p>
                  </div> */}
                  <div className="order-detail">
                    <p>delivery : </p>
                    <p>Rs. {this.state.order.shipping || 0}</p>
                  </div>
                  {/* <div className="order-detail">
                    <p>total : </p>
                    <p>Rs. {this.state.order.total}</p>
                  </div> */}
                  {/* <div className="order-detail">
                    <p>cod charges : </p>
                    <p>Rs. 345</p>
                  </div> */}
                  <div
                    className="order-detail"
                    style={{ fontWeight: "700", marginTop: "10px" }}
                  >
                    <p>total : </p>
                    <p>Rs. {this.state.order.total}</p>
                  </div>
                </div>
              </div>
            </div>
            <Modal
              open={this.state.cancelModal}
              onClose={() => {
                this.setState({ cancelModal: false });
              }}
            >
              <div
                className="cancel-modal"
                style={{
                  width: "300px",
                  padding: "15px",
                  alignItems: "center",
                  background: "#fff",
                  position: "fixed",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%,-50%)",
                  borderRadius: "10px",
                  outline: "none",
                }}
              >
                <div
                  className="head"
                  style={{
                    paddingBottom: " 10px",
                    width: "100%",
                    display: " flex",
                    justifyContent: "space-between",
                    alignItems: " center",
                    borderBottom: " 1px solid #56565660",
                    marginBottom: "10px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "18px",
                      fontWeight: " 400",
                      color: "#000",
                    }}
                  >
                    Are You Sure ?
                  </h4>
                  <img
                    src={close}
                    alt=""
                    style={{ cursor: "pointer" }}
                    onClick={() => this.setState({ cancelModal: false })}
                  />
                </div>
                <div
                  className="buttons"
                  style={{
                    width: "100%",
                    display: "grid",
                    gridTemplateColumns: "1fr 1fr",
                    alignItems: "center",
                  }}
                >
                  <Button
                    variant="contained"
                    style={{
                      background: "#d3212d",
                      color: "#fff",
                      width: "80%",
                      height: "40px",
                      margin: "8px 0",
                      justifySelf: "center",
                    }}
                    onClick={() =>
                      this.setState(
                        {
                          uploading: true,
                        },
                        () => {
                          firebase
                            .firestore()
                            .collection("orders")
                            .doc(this.props.match.params.id)
                            .update({
                              status: [...this.state.order.status, 8],
                            })
                            .then(() => {
                              this.init();
                              this.setState({
                                cancelModal: false,
                              });
                            });
                        }
                      )
                    }
                  >
                    YES
                  </Button>
                  <Button
                    style={{
                      background: "var(--background)",
                      color: "#fff",
                      width: "80%",
                      height: "40px",
                      margin: "8px 0",
                      justifySelf: "center",
                    }}
                    onClick={() => {
                      this.setState({ cancelModal: false });
                    }}
                  >
                    NO
                  </Button>
                </div>
              </div>
            </Modal>
          </>
        )}
        <Modal
          open={this.state.ratingModal}
          onClose={() => {
            this.setState({ ratingModal: false });
          }}
        >
          <div
            className="rating-modal"
            style={{
              display: "flex",
              flexDirection: "column",
              width: "450px",
              padding: "15px",
              alignItems: "center",
              background: "#fff",
              position: "fixed",
              top: "50%",
              left: "50%",
              transform: "translate(-50%,-50%)",
              borderRadius: "10px",
              outline: "none",
            }}
          >
            <div
              className="head"
              style={{
                paddingBottom: " 10px",
                width: "100%",
                display: " flex",
                justifyContent: "space-between",
                alignItems: " center",
                borderBottom: " 1px solid #ccc",
                marginBottom: "10px",
                padding: "5px 5px 10px",
              }}
            >
              <h4
                style={{
                  fontSize: "18px",
                  fontWeight: " 500",
                  color: "#000000",
                }}
              >
                How was the product ?
              </h4>
              <img
                src={close}
                alt=""
                style={{ cursor: "pointer" }}
                onClick={() => this.setState({ ratingModal: false })}
              />
            </div>
            <div
              style={{
                padding: "0 10px",
                width: "100%",
              }}
            >
              {this.state.rateProduct.title ? (
                <>
                  <div id="rating-card">
                    <img src={this.state.rateProduct.images[0].image} alt="" />
                    <div className="info">
                      <p className="name">{this.state.rateProduct.title}</p>
                      <div className="rate-price">
                        <p>₹ {this.state.rateProduct.variation.listing}</p>
                        <p>Quantity : {this.state.rateProduct.cartQuantity}</p>
                      </div>
                    </div>
                  </div>
                  <div
                    // className="rate"
                    style={{
                      //   display: "flex",
                      //   alignItems: "center",
                      //   width: "100%",
                      padding: "15px 10px",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                        marginLeft: 3,
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "400",
                          width: 130,
                          letterSpacing: 1,
                        }}
                      >
                        Value for money:
                      </h5>
                      <Rating
                        value={this.state.value_for_money}
                        onChange={(e, value) =>
                          this.setState({ value_for_money: value })
                        }
                        name="ratings"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                        marginLeft: 3,
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "400",
                          width: 130,
                          letterSpacing: 1,
                        }}
                      >
                        Quality:
                      </h5>
                      <Rating
                        value={this.state.quality}
                        onChange={(e, value) =>
                          this.setState({ quality: value })
                        }
                        name="ratings2"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                        marginLeft: 3,
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "400",
                          width: 130,
                          letterSpacing: 1,
                        }}
                      >
                        Packaging:
                      </h5>
                      <Rating
                        value={this.state.packaging}
                        onChange={(e, value) =>
                          this.setState({ packaging: value })
                        }
                        name="ratings3"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                        marginLeft: 3,
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "400",
                          width: 130,
                          letterSpacing: 1,
                        }}
                      >
                        Durability:
                      </h5>
                      <Rating
                        value={this.state.durability}
                        onChange={(e, value) =>
                          this.setState({ durability: value })
                        }
                        name="ratings4"
                      />
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        margin: "5px 0",
                        marginLeft: 3,
                      }}
                    >
                      <h5
                        style={{
                          fontWeight: "400",
                          width: 130,
                          letterSpacing: 1,
                        }}
                      >
                        Performance:
                      </h5>
                      <Rating
                        value={this.state.performance}
                        onChange={(e, value) =>
                          this.setState({ performance: value })
                        }
                        name="ratings5"
                      />
                    </div>
                  </div>
                  <div
                    className="review"
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      width: "100%",
                      justifyContent: "space-between",
                      padding: "5px 10px",
                    }}
                  >
                    <p style={{ fontSize: 15, letterSpacing: 1 }}>Review : </p>
                    <textarea
                      style={{ width: "80%" }}
                      type="text"
                      variant="outlined"
                      placeholder="Write your review here..."
                      value={this.state.review}
                      onChange={(e) =>
                        this.setState({
                          review: e.target.value,
                        })
                      }
                    />
                  </div>
                  <h5 style={{ margin: "10px 0", fontWeight: "500" }}>
                    Add Product Images:{" "}
                  </h5>
                  <div className="product_images">
                    {this.state.product_images.map((img, index) => (
                      <div className="product_img" key={index}>
                        <img src={URL.createObjectURL(img)} alt="" />
                        <span onClick={() => this.removeImg(index)}>
                          <i className="fas fa-times"></i>
                        </span>
                      </div>
                    ))}
                    {this.state.product_images.length < 6 && (
                      <label htmlFor="picker2" className="picker2">
                        <input
                          type="file"
                          id="picker2"
                          onChange={this.handleProductImagePicker}
                          accept="image/*"
                        />

                        <i className="fas fa-plus"></i>
                      </label>
                    )}
                  </div>
                  <p className="imgErr">{this.state.imgErr}</p>
                </>
              ) : (
                this.state.rateProducts.map((item) => (
                  <div
                    id="rating-card"
                    onClick={() =>
                      this.setState({
                        rateProduct: item,
                      })
                    }
                    style={{
                      borderBottom: "1px solid #ccc",
                      cursor: "pointer",
                    }}
                  >
                    <img src={item.images[0].image} alt="" />
                    <div className="info">
                      <p className="name">{item.title}</p>
                      <div className="rate-price">
                        <p>₹ {item.variation.listing}</p>
                        <p>Quantity : {item.cartQuantity}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            {this.state.rateProduct.title && (
              <div
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {this.state.rateProducts.length !== 1 && (
                  <Button
                    onClick={() =>
                      this.setState({
                        rateProduct: {},
                      })
                    }
                    variant="outlined"
                    style={{
                      borderColor: "rgba(65,105,225,1)",
                      color: "rgba(65,105,225,1)",
                      marginTop: "10px",
                    }}
                  >
                    Back
                  </Button>
                )}
                <Button
                  onClick={this.handleRate}
                  variant="contained"
                  style={{
                    marginLeft: "auto",
                    background: "rgba(65,105,225,1)",
                    color: "#fff",
                    marginTop: "10px",
                  }}
                >
                  Rate
                </Button>
              </div>
            )}
          </div>
        </Modal>
        <Backdrop className="backdrop" open={this.state.uploading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }
}
