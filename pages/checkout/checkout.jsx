import React, { Component } from "react";
import "./checkout.css";
import {
  Backdrop,
  Button,
  ButtonBase,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@material-ui/core";
import {
  createMuiTheme,
  ThemeProvider,
  ClickAwayListener,
} from "@material-ui/core";
import { Modal, TextField } from "@material-ui/core";
import firebase from "firebase";
import CartCard from "../../components/cart-card/cart-card";
import close from "../../../assets/close-grey.svg";
import razorpay from "../../../assets/razorpay_logo.png";
// import logo from "../../../assets/logo.png";
import toaster from "toasted-notes";
import { Redirect } from "react-router-dom";
import Loader from "../../components/loader/loader";
import indian from "indian-states-cities";

export default class Checkout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      payment: false,
      modal: false,
      name: "",
      address2: "",
      state: "",
      city: "",
      pincode: "",
      redirect: false,
      number: "",
      error: { input: "", msg: "" },
      width: window.innerWidth,
      address: {},
      index: null,
      cart: [],
      products: [],
      loading: false,
      subTotal: null,
      shipping: 0,
      user: {},
      addressSelected: false,
      orders: [],
      uploading: false,
    };
  }

  componentDidMount() {
    this.init();
    window.addEventListener("resize", () => {
      this.setState({
        width: window.innerWidth,
      });
    });
  }

  init = () => {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        firebase
          .firestore()
          .collection("users")
          .where("email", "==", user.email)
          .get()
          .then((snap) => {
            snap.forEach((doc) => {
              var products = [];
              var subTotal = 0;
              var shipping = 0;
              if (doc.data().cart.length > 0) {
                doc.data().cart.forEach(async (item) => {
                  await firebase
                    .firestore()
                    .collection("products")
                    .doc(item.product)
                    .get()
                    .then((doc2) => {
                      var product = doc2.data();
                      product.id = doc2.id;
                      product.cartQuantity = item.quantity;
                      product.variation = item.variation;
                      products.push(product);
                      subTotal =
                        subTotal + item.variation.listing * item.quantity;
                      shipping += doc2.data().shipping * item.quantity || 0;
                      if (products.length === doc.data().cart.length) {
                        this.setState({
                          cart: doc.data().cart,
                          products,
                          loading: false,
                          subTotal,
                          shipping: subTotal > 399 ? 0 : shipping,
                          user: { ...doc.data(), id: doc.id },
                          orders: doc.data().orders,
                        });
                      }
                    });
                });
              } else {
                window.location.href = "/";
              }
              // if (
              //   products.length > change.doc.data().cart.length ||
              //   change.doc.data().cart.length === 0
              // ) {
              //   this.setState({
              //     cart: change.doc.data().cart,
              //     products: [],
              //     loading: false,
              //     userId: change.doc.id,
              //   });
              // }
            });
          });
      } else {
        this.setState({
          redirect: true,
        });
      }
    });
  };

  componentWillUnmount() {
    window.removeEventListener("resize", () => {});
    if (this.state.redirect) {
      toaster.notify("Please login to Place an Order!");
    }
  }

  handleChange = (e) => {
    if (e.target.name === this.state.error.input) {
      var error = {
        input: "",
        msg: "",
      };
      this.setState({ error });
    }
    this.setState({
      [e.target.name]: e.target.value,
    });
  };

  handleForm = () => {
    this.setState({
      uploading: true,
    });
    if (
      this.state.name.length > 0 &&
      this.state.address2.length > 0 &&
      this.state.state.length > 0 &&
      this.state.city.length > 0 &&
      this.state.pincode.length > 0 &&
      this.state.number.length >= 10
    ) {
      var obj = {};
      obj.name = this.state.name;
      obj.address = this.state.address2;
      obj.state = this.state.state;
      obj.city = this.state.city;
      obj.pincode = this.state.pincode;
      obj.number = this.state.number;
      var add = [...this.state.user.addresses, obj];
      firebase
        .firestore()
        .collection("users")
        .doc(this.state.user.id)
        .update({
          addresses: add,
        })
        .then(() => {
          this.init();
          this.setState({
            modal: false,
            name: "",
            address2: "",
            state: "",
            city: "",
            pincode: null,
            number: null,
            uploading: false,
          });
        })
        .catch((err) => {
          console.log(err);
          toaster.notify("Something went wrong, Please try again!");
          this.setState({
            uploading: false,
          });
        });
    } else {
      var error = {};
      if (this.state.name.length === 0) {
        error = {
          input: "name",
          msg: "Please Enter Your Name",
        };
      } else if (this.state.address2.length === 0) {
        error = {
          input: "address2",
          msg: "Please Enter Your Address",
        };
      } else if (this.state.state.length === 0) {
        error = {
          input: "state",
          msg: "Please Enter Your State",
        };
      } else if (this.state.city.length === 0) {
        error = {
          input: "city",
          msg: "Please Enter Your City",
        };
      } else if (this.state.pincode.length === 0) {
        error = {
          input: "pincode",
          msg: "Please Enter Your Pincode",
        };
      } else if (this.state.number.length < 10) {
        error = {
          input: "number",
          msg: "Please Enter Your Number",
        };
      }
      this.setState({ error, uploading: false });
    }
  };

  handleRazorpay = () => {
    if (this.state.address.address) {
      var options = {
        key: "rzp_test_5yEtWvrCdnf2lG", // Enter the Key ID generated from the Dashboard
        // amount: 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        amount: (this.state.subTotal + this.state.shipping) * 100, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "E-commerce",
        description: "E-commerce",
        image: razorpay,
        // order_id: "order_9A33XWu170gUtm", //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        handler: (res) => {
          this.setState(
            {
              uploading: true,
            },
            () => {
              var products = [];
              this.state.products.forEach((product) => {
                var p = product;
                p.rate = false;
                products.push(p);
              });
              firebase
                .firestore()
                .collection("orders")
                .add({
                  products: products,
                  name: this.state.address.name,
                  city: this.state.address.city,
                  pincode: this.state.address.pincode,
                  state: this.state.address.state,
                  email: this.state.user.email,
                  address: this.state.address.address,
                  number: this.state.address.number,
                  status: [0],
                  awb_number: "",
                  date: new Date(),
                  total: this.state.subTotal + this.state.shipping,
                  shipping: this.state.shipping,
                  payment: "Prepaid",
                  razorpay_id: res.razorpay_payment_id,
                })
                .then((res) => {
                  this.state.products.forEach((product) => {
                    firebase
                      .firestore()
                      .collection("products")
                      .doc(product.id)
                      .get()
                      .then((doc) => {
                        var sold = doc.data().sold;
                        sold += product.cartQuantity;
                        firebase
                          .firestore()
                          .collection("products")
                          .doc(product)
                          .update({
                            sold: sold,
                          })
                          .catch((err) => console.log(err));
                      })
                      .catch((err) => console.log(err));
                  });
                  firebase
                    .firestore()
                    .collection("users")
                    .doc(this.state.user.id)
                    .update({
                      orders: [...this.state.orders, res.id],
                      cart: [],
                    })
                    .then(() => {
                      this.setState({
                        uploading: false,
                      });
                      window.location.href = `/orders/${res.id}`;
                    });
                });
            }
          );
        },
        prefill: {
          name: this.state.name,
          email: this.state.user.email,
          contact: this.state.address.number,
        },
        theme: {
          color: "#333",
        },
      };
      this.setState({
        payment: false,
      });
      var rzp1 = new window.Razorpay(options);
      rzp1.on("payment.failed", function (response) {
        // alert(response.error.code);
        toaster.notify(response.error.description);
        // alert(response.error.source);
        // alert(response.error.step);
        // alert(response.error.reason);
        // alert(response.error.metadata.order_id);
        // alert(response.error.metadata.payment_id);
      });
      rzp1.open();
    } else {
      toaster.notify("Please Select an Address");
    }
  };

  placeOrder = () => {
    if (this.state.address.address) {
      this.setState(
        {
          uploading: true,
        },
        () => {
          var products = [];
          this.state.products.forEach((product) => {
            var p = product;
            p.rate = false;
            products.push(p);
          });
          console.log(products);
          firebase
            .firestore()
            .collection("orders")
            .add({
              products: products,
              name: this.state.address.name,
              city: this.state.address.city,
              pincode: this.state.address.pincode,
              state: this.state.address.state,
              address: this.state.address.address,
              number: this.state.address.number,
              email: this.state.user.email,
              status: [0],
              awb_number: "",
              date: new Date(),
              total: this.state.subTotal + this.state.shipping,
              shipping: this.state.shipping || 0,
              payment: "cash on delivery",
            })
            .then((res) => {
              this.state.products.forEach((product) => {
                firebase
                  .firestore()
                  .collection("products")
                  .doc(product.id)
                  .get()
                  .then((doc) => {
                    var sold = doc.data().sold;
                    var quantity = doc.data().quantity;
                    sold += product.cartQuantity;
                    quantity -= product.cartQuantity;
                    firebase
                      .firestore()
                      .collection("products")
                      .doc(product.id)
                      .update({
                        sold: sold,
                        quantity,
                      })
                      .catch((err) => console.log(err));
                  })
                  .catch((err) => console.log(err));
              });
              firebase
                .firestore()
                .collection("users")
                .doc(this.state.user.id)
                .update({
                  orders: [...this.state.orders, res.id],
                  cart: [],
                })
                .then(() => {
                  this.setState({
                    uploading: false,
                  });
                  window.location.href = `/orders/${res.id}`;
                });
            });
        }
      );
    } else {
      toaster.notify("Please Select an Address");
    }
  };

  render() {
    const theme = createMuiTheme({
      props: {
        MuiButtonBase: {
          TouchRippleProps: {
            classes: {
              root: "CustomizeTouchRipple",
            },
          },
        },
      },
    });

    console.log(this.state.user);

    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
    return (
      <div className="checkout">
        {this.state.loading ? (
          <Loader />
        ) : (
          <>
            <div className="address-wrapper">
              <h1 className="heading">Checkout</h1>
              {/* <ClickAwayListener
                onClickAway={() => {
                  this.setState({ addressSelected: false });
                }}
              > */}
              <div className="all-wrapper" style={{ width: "100%" }}>
                <div
                  className="all-address"
                  style={
                    this.state.width <= 680
                      ? {
                          gridTemplateColumns: `repeat(${
                            this.state.user.addresses?.length + 1
                          },1fr)`,
                        }
                      : null
                  }
                >
                  {this.state.user.addresses?.map((item, index) => (
                    <ThemeProvider theme={theme}>
                      <ButtonBase
                        className={
                          this.state.index === index
                            ? "ripple active"
                            : "ripple"
                        }
                        onClick={() => {
                          this.setState({ index, address: item });
                        }}
                      >
                        <div className="address">
                          <p>
                            {item.name} - {item.number}
                          </p>
                          <p>
                            {item.address}, {item.city} - {item.pincode},{" "}
                            {item.state}
                          </p>
                        </div>
                      </ButtonBase>
                    </ThemeProvider>
                  ))}
                  <div
                    onClick={() => {
                      this.setState({ modal: true });
                    }}
                    style={{
                      width: "100%",
                      background: "#f7f7f7",
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      cursor: "pointer",
                      height: this.state.width <= 680 ? 100 : 91,
                    }}
                    className="ripple"
                  >
                    <span
                      style={{
                        fontSize: "12px",
                        whiteSpace: "nowrap",
                        color: "#555",
                        fontWeight: "600",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ fontSize: "30px" }}>+</span>
                      ADD NEW ADDRESS
                    </span>
                  </div>
                </div>
              </div>
              {/* </ClickAwayListener> */}

              <div className="add-add">
                <Button
                  className="place-order"
                  variant="contained"
                  style={{ color: "#fff" }}
                  onClick={() => {
                    if (this.state.address.address) {
                      this.setState({
                        payment: true,
                      });
                    } else {
                      toaster.notify("Please select an address to continue!");
                    }
                  }}
                >
                  place an order
                </Button>
              </div>
            </div>
            <div className="checkout-items">
              <h3>Items</h3>
              <div className="items">
                {this.state.products.map((item, index) => (
                  <CartCard
                    product={item}
                    key={item.id}
                    cart={this.state.cart}
                    userID={this.state.user.id}
                    checkOut
                    lessThan4={index <= 4}
                  />
                ))}
              </div>
              <div className="billing">
                <p>
                  subtotal <span>Rs. {this.state.subTotal}</span>
                </p>
                <p>
                  shipping
                  <span>Rs. {this.state.shipping}</span>
                </p>
                <p>
                  total
                  <span>Rs. {this.state.subTotal + this.state.shipping}</span>
                </p>
              </div>
            </div>
          </>
        )}
        <Modal
          open={this.state.modal}
          onClose={() => this.setState({ modal: false })}
          className="modal"
        >
          <div className="add-address-modal">
            <div className="head">
              <h4>Shipping Address</h4>
              <img
                src={close}
                alt=""
                style={{ cursor: "pointer" }}
                onClick={() => this.setState({ modal: false })}
              />
            </div>
            <div className="form">
              <TextField
                type="text"
                variant="outlined"
                label="Full Name"
                size="small"
                className="inputField fullwidth"
                name="name"
                value={this.state.name}
                onChange={this.handleChange}
                error={this.state.error.input === "name"}
                helperText={
                  this.state.error.input === "name" ? this.state.error.msg : ""
                }
              />

              <TextField
                type="text"
                variant="outlined"
                label="Address"
                size="small"
                className="inputField fullwidth"
                name="address2"
                value={this.state.address2}
                onChange={this.handleChange}
                error={this.state.error.input === "address2"}
                helperText={
                  this.state.error.input === "address2"
                    ? this.state.error.msg
                    : ""
                }
              />
              <TextField
                type="number"
                variant="outlined"
                label="Phone Number"
                size="small"
                className="inputField"
                name="number"
                value={this.state.number}
                onChange={this.handleChange}
                error={this.state.error.input === "number"}
                helperText={
                  this.state.error.input === "number"
                    ? this.state.error.msg
                    : ""
                }
              />
              <FormControl
                className="inputField"
                variant="outlined"
                size="small"
              >
                <InputLabel>State</InputLabel>
                <Select
                  value={this.state.state}
                  onChange={(e) =>
                    this.setState({
                      state: e.target.value,
                    })
                  }
                  label="State"
                >
                  {indian.allStates().map((state) => (
                    <MenuItem value={state}>{state}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl
                className="inputField"
                variant="outlined"
                size="small"
              >
                <InputLabel>City</InputLabel>
                <Select
                  value={this.state.city}
                  onChange={(e) =>
                    this.setState({
                      city: e.target.value,
                    })
                  }
                  label="City"
                >
                  {indian.citiesForState(this.state.state).map((city) => (
                    <MenuItem value={city}>{city}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                type="text"
                variant="outlined"
                label="Pincode"
                size="small"
                className="inputField"
                name="pincode"
                value={this.state.pincode}
                onChange={this.handleChange}
                error={this.state.error.input === "pincode"}
                helperText={
                  this.state.error.input === "pincode"
                    ? this.state.error.msg
                    : ""
                }
              />
            </div>
            <Button
              onClick={this.handleForm}
              variant="contained"
              style={{
                alignSelf: "flex-end",
                background: "rgba(65,105,225,1)",
                color: "#fff",
              }}
            >
              Add
            </Button>
          </div>
        </Modal>
        <Modal
          open={this.state.payment}
          onClose={() => this.setState({ payment: false })}
          className="p-modal"
        >
          <div
            className="payment-modal"
            style={{ width: "300px", padding: "15px", alignItems: "center" }}
          >
            <div
              className="head"
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "10px",
              }}
            >
              <h4>Payment Options</h4>
              <img
                src={close}
                alt=""
                style={{ cursor: "pointer" }}
                onClick={() => this.setState({ payment: false })}
              />
            </div>
            <Button
              variant="contained"
              style={{
                background: "#072551",
                color: "#fff",
                width: "90%",
                height: "45px",
                margin: "8px 0",
              }}
              onClick={this.handleRazorpay}
            >
              <img
                src={razorpay}
                alt=""
                style={{
                  width: "80%",
                  objectFit: "contain",
                }}
              />
            </Button>
            <div
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                margin: "5px 0",
              }}
            >
              <span
                style={{ width: 110, height: 1, background: "#ccc" }}
              ></span>
              <span
                style={{ color: "#858686", fontSize: 12, fontWeight: "500" }}
              >
                OR
              </span>
              <span
                style={{ width: 110, height: 1, background: "#ccc" }}
              ></span>
            </div>
            <Button
              variant="contained"
              style={{
                border: "1px solid #000",
                background: "transparent",
                color: "#000",
                width: "90%",
                height: "45px",
                margin: "8px 0",
                fontWeight: "600",
                boxShadow: "none",
              }}
              onClick={this.placeOrder}
            >
              Cash on Delivery
            </Button>
          </div>
        </Modal>
        <Backdrop className="backdrop" open={this.state.uploading}>
          <CircularProgress color="inherit" />
        </Backdrop>
      </div>
    );
  }
}
