import React, { Component } from "react";
import "./productDescription.css";
import firebase from "firebase";
import share from "../../../assets/share3.png";
import toaster from "toasted-notes";
import { Link } from "react-router-dom";
import edit from "../../../assets/eye-regular.svg";
import active_icon from "../../../assets/active icon.svg";
import indian from "indian-states-cities";
import add1 from "../../../assets/add1.webp";
import add2 from "../../../assets/add2.webp";
import add3 from "../../../assets/add3.webp";
import add4 from "../../../assets/add4.webp";
import add5 from "../../../assets/add5.webp";
import add6 from "../../../assets/add6.webp";
import add7 from "../../../assets/add7.webp";
import add8 from "../../../assets/add8.webp";
import add9 from "../../../assets/add9.webp";
import add10 from "../../../assets/add10.jpg";

import {
  TelegramShareButton,
  TelegramIcon,
  EmailShareButton,
  EmailIcon,
  FacebookIcon,
  FacebookMessengerShareButton,
  FacebookMessengerIcon,
  FacebookShareButton,
  WhatsappShareButton,
  WhatsappIcon,
} from "react-share";
import Loader from "../../components/loader/loader";
import {
  Backdrop,
  Button,
  CircularProgress,
  TextField,
  Modal,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@material-ui/core";

export default class ProductDescription extends Component {
  constructor(props) {
    super(props);
    this.state = {
      imgIndex: 0,
      checkSort: false,
      sortValue: "newest",
      currentTab: "reviews",
      descOpen: false,
      slider: false,
      slider2: false,
      loading: true,
      product: {},
      count: 1,
      description: false,
      user: {},
      isWished: false,
      rating_count: 0,
      notFound: false,
      addressModal: false,
      name: "",
      address2: "",
      state: "",
      city: "",
      pincode: "",
      modal: false,
      images: [],
      number: "",
      error: { input: "", msg: "" },
      uploading: false,
      addressIndex: 0,
      found: false,
      share: false,
      value_for_money: 0,
      quality: 0,
      packaging: 0,
      durability: 0,
      performance: 0,
      variation: null,
      activeVariation: null,
      width: window.innerWidth,
      lensCategory: ["Single Vision", "Zero Power", "Bifocal/Progressive"],
      activeLensCategory: "",
      lenses: [],
      selectedLens: {},
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
          .then((snap) =>
            snap.forEach((doc) =>
              this.setState({
                user: {
                  ...doc.data(),
                  id: doc.id,
                },
              })
            )
          );
      }
      this.handleInit();
    });
    window.addEventListener("resize", () => {
      this.setState({
        width: window.innerWidth,
      });
    });
  }

  handleInit = () => {
    firebase
      .firestore()
      .collection("products")
      .doc(this.props.match.params.id)
      .get()
      .then((doc) => {
        this.state.user.cart?.forEach((item) =>
          this.setState({
            found:
              item.product === doc.id &&
              doc
                .data()
                .variations.find(
                  (variation) =>
                    variation.variation === item.variation.variation
                ),
          })
        );
        this.setState({
          product: {
            ...doc.data(),
            id: doc.id,
          },
          variation: doc.data().variations[0],
          loading: false,
        });
      });
  };

  cartUpdate = () => {
    var found = false;
    firebase
      .firestore()
      .collection("users")
      .where("email", "==", firebase.auth().currentUser.email)
      .get()
      .then((snap) =>
        snap.forEach((doc) => {
          doc.data().cart.forEach((item) => {
            if (item.variation.variation === this.state.variation.variation)
              found = true;
          });
          this.setState({
            found,
            user: { ...doc.data(), id: doc.id },
          });
        })
      );
  };

  onChangeVariation = (event) => {
    var found = false;
    this.state.user.cart?.forEach((item) => {
      if (item.variation.variation === JSON.parse(event.target.value).variation)
        found = true;
    });
    this.setState({
      variation: JSON.parse(event.target.value),
      found: found,
    });
  };

  handleAddToCart = () => {
    if (this.state.user.id) {
      var cart = this.state.user.cart;
      var el = {
        product: this.state.product.id,
        quantity: this.state.count,
        variation: this.state.variation,
      };
      if (!this.state.found) {
        cart.push(el);
        console.log(cart);
        firebase
          .firestore()
          .collection("users")
          .doc(this.state.user.id)
          .update({
            cart,
          })
          .then(() => {
            toaster.notify("Product added to cart");
            this.setState({
              found: true,
            });
            this.props.toggleCart();
            setTimeout(() => {
              this.props.toggleCart();
            }, 2000);
          });
      } else {
        toaster.notify("Product already exists in your cart!");
      }
    } else {
      window.location.href = "/login";
    }
  };

  handleAddress = () => {
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
          firebase
            .firestore()
            .collection("users")
            .doc(this.state.user.id)
            .get()
            .then((doc) => {
              this.setState({
                user: { ...doc.data(), id: doc.id },
                modal: false,
                name: "",
                address2: "",
                state: "",
                city: "",
                pincode: null,
                number: null,
                uploading: false,
                addressIndex: doc.data().addresses.length - 1,
              });
              this.el.scrollIntoView({ behavior: "smooth" });
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
          input: "firstName",
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
      } else {
        error = {
          input: "number",
          msg: "Please Enter Your Number",
        };
      }
      this.setState({ error, uploading: false });
    }
  };

  render() {
    console.log(this.state.product);
    const discount = parseInt(
      ((this.state.variation?.usual - this.state.variation?.listing) /
        this.state.variation?.usual) *
        100
    );
    const dis = "(" + discount + "% off)";
    return (
      <div className="all">
        <div className="productDescription">
          {this.state.loading ? (
            <Loader />
          ) : (
            <>
              {this.state.width > 768 ? (
                <div className="image-side">
                  {this.state.product.images?.map((item, index) => (
                    <div>
                      <img src={item.image} key={index} alt=""></img>
                    </div>
                  ))}
                  {this.state.product.video?.length > 0 ? (
                    <video className="video" controls>
                      <source src={this.state.product.video} type="video" />
                      <source src={this.state.product.video} type="video/mp4" />
                    </video>
                  ) : null}
                </div>
              ) : (
                <div className="left">
                  <div className="image-list">
                    {this.state.product.images?.map((image, idx) => (
                      <img
                        src={image.image}
                        alt=""
                        onMouseOver={() =>
                          this.setState({
                            imgIndex: idx,
                          })
                        }
                        className={
                          this.state.imgIndex === idx ? "active" : null
                        }
                      />
                    ))}
                  </div>
                  <img
                    src={
                      this.state.product.images &&
                      this.state.product.images[this.state.imgIndex].image
                    }
                    className="active-img"
                    alt=""
                  />
                </div>
              )}

              <div className="right">
                <div className="breadcrumb">
                  <a href="/">home</a> -
                  <Link
                    to={{
                      pathname: "/products",
                      state: {
                        category: this.state.product?.category,
                      },
                    }}
                  >
                    {this.state.product?.category}
                  </Link>{" "}
                  -<p> {this.state.product.title}</p>
                </div>
                <h1>{this.state.product.title}</h1>
                <h2>Special Price :</h2>
                <div className="price">
                  <h2 className="mrp">
                    M.R.P
                    <span
                      style={{
                        fontSize: "25px",
                        textDecoration: " line-through",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "12px",
                          textDecoration: "none",
                          marginRight: "5px",
                        }}
                      >
                        Rs
                      </span>
                      {this.state.variation?.usual}
                    </span>
                  </h2>
                  <h2 className="mrp">
                    EYE-EXPRESS PRICE
                    <span
                      style={{
                        color: "rgb(11, 138, 43)",
                      }}
                    >
                      <span style={{ fontSize: "12px" }}>Rs</span>{" "}
                      {this.state.variation?.listing}/-
                    </span>
                  </h2>
                  <h2 className="mrp" style={{ border: "none" }}>
                    YOU SAVE
                    <span>
                      <span style={{ fontSize: "12px" }}>Rs</span>{" "}
                      {this.state.variation?.usual -
                        this.state.variation?.listing}
                    </span>
                    <span>{dis}</span>
                  </h2>
                </div>
                {this.state.product.variations?.length > 0 && (
                  <div className="kgs">
                    <h2>
                      Select {this.state.product.variationName || "Variation"}
                    </h2>
                    <div
                      className="options"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr 1fr",
                        width: "100%",
                      }}
                    >
                      {this.state.lensCategory.map((item, id) => (
                        <div
                          onClick={() => {
                            console.log(item);
                            var arr = [];
                            this.state.product.variations.forEach((variant) => {
                              if (variant.lensType === item) {
                                arr.push(variant);
                              }
                            });

                            this.setState(
                              { lenses: [...arr], activeLensCategory: item },
                              console.log(this.state.lenses)
                            );

                            // this.setState(
                            //   {
                            //     activeLensCategory: item,
                            //   },
                            //   this.setState(
                            //     {
                            //       lenses: this.state.product.variations.filter(
                            //         (item2) => item2.lensType === item
                            //       ),
                            //     },
                            //     console.log(
                            //       this.state.lenses,
                            //       this.state.activeLensCategory
                            //     )
                            //   )
                            // );
                          }}
                          className={
                            item === this.state.activeLensCategory
                              ? "active-variation"
                              : ""
                          }
                          style={{
                            margin: "7px",
                            border: ".8px solid rgba(0,0,0,.5)",

                            borderRadius: "5px",
                            cursor: "pointer",
                            textAlign: "center",
                            textTransform: "capitalize",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            height: 40,
                          }}
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                    {this.state.lenses.length > 0 ? (
                      <>
                        <h2>Select Lens</h2>
                        <br />
                      </>
                    ) : null}
                    <div
                      className="options"
                      style={{
                        display: "grid",
                        gridTemplateColumns: "1fr",
                        width: "100%",
                        maxHeight: "200px",
                        overflowY: "auto",
                        margin: "10px 0px",
                      }}
                    >
                      {this.state.lenses?.map((lens, index) => {
                        return (
                          // <label
                          //   style={{
                          //     margin: "7px",
                          //     border: ".8px solid rgba(0,0,0,.5)",
                          //     borderRadius: "5px",
                          //     cursor: "pointer",
                          //     textAlign: "center",
                          //     textTransform: "capitalize",
                          //     display: "flex",
                          //     justifyContent: "center",
                          //     alignItems: "center",
                          //     height: 120,
                          //   }}

                          // >
                          <div
                            title="Click To Select Lens"
                            key={index}
                            onClick={() => {
                              this.setState({
                                selectedLens: { ...lens, id: index },
                              });
                            }}
                            className={
                              this.state.selectedLens.id === index
                                ? "lens active-variation"
                                : "lens notActive"
                            }
                          >
                            <div>
                              <h2>{lens.lensName}</h2>
                              <p>{lens.lensType}</p>
                              <span>₹ {lens.listing}</span>
                            </div>
                            <div>
                              {lens?.descriptions.map((desc) => (
                                <li>{desc}</li>
                              ))}
                            </div>
                          </div>
                          // </label>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="quantity">
                  {/* <button type="button" onClick={this.handleWishlist}>
              <i
                className={
                  this.state.isWished ? 'fas fa-heart red' : 'far fa-heart'
                }
              ></i>
            </button> */}
                  <button
                    type="button"
                    onClick={() => {
                      this.setState({ share: true });
                    }}
                  >
                    <img src={share} alt="" />
                  </button>
                  <div className="qty">
                    <p>QTY :</p>
                    <span
                      onClick={() => {
                        this.state.count > 1
                          ? this.setState({ count: this.state.count - 1 })
                          : this.setState({ count: 1 });
                      }}
                    >
                      -
                    </span>
                    <span>{this.state.count}</span>
                    <span
                      style={{ borderRight: "none" }}
                      onClick={() => {
                        this.setState({ count: this.state.count + 1 });
                      }}
                    >
                      +
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      this.state.found
                        ? this.props.toggleCart()
                        : this.handleAddToCart()
                    }
                    className={this.state.found ? "green" : ""}
                  >
                    {this.state.found ? "Go to Cart" : "Add To Cart"}
                  </button>
                </div>

                {this.state.user.addresses ? (
                  <div className="delivery-address">
                    {/* <p></p> */}
                    <p>
                      <span>Deliver :</span>
                      {this.state.user.addresses.length > 0 ? (
                        `${
                          this.state.user.addresses[this.state.addressIndex]
                            ?.name
                        }, ${
                          this.state.user.addresses[this.state.addressIndex]
                            ?.address
                        }, ${
                          this.state.user.addresses[this.state.addressIndex]
                            ?.city
                        } - ${
                          this.state.user.addresses[this.state.addressIndex]
                            ?.pincode
                        }, Mob - ${
                          this.state.user.addresses[this.state.addressIndex]
                            ?.number
                        }`
                      ) : (
                        <span
                          style={{ cursor: "pointer" }}
                          onClick={() =>
                            this.setState({
                              modal: true,
                            })
                          }
                        >
                          Add address
                        </span>
                      )}
                    </p>
                    <img
                      src={edit}
                      alt=""
                      onClick={() => {
                        this.state.user.addresses.length > 0
                          ? this.setState({
                              addressModal: true,
                            })
                          : this.setState({
                              modal: true,
                            });
                      }}
                    />
                    <div className="cod">
                      <i className="fas fa-wallet"></i>
                      <p>COD Available</p>
                    </div>
                  </div>
                ) : null}
                {/* <div className="delivery-date">
                <p>Delivery by 4-6 days, 9 Jan, Saturday</p>
              </div> */}
                <div className="description" style={{ margin: "10px 0px" }}>
                  {this.state.product.shortDescription?.length > 0 && (
                    <h2>Short Desc : </h2>
                  )}
                  {this.state.product.shortDescription?.map((desc) => (
                    <li>{desc.length > 0 && desc}</li>
                  ))}
                </div>
                <div
                  className={this.state.descOpen ? "descrip open" : "descrip"}
                >
                  <div>
                    <h2>Description</h2>
                    {this.state.descOpen ? (
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          this.setState({ descOpen: false });
                        }}
                      >
                        -
                      </span>
                    ) : (
                      <span
                        style={{
                          width: 15,
                          height: 15,
                          display: "flex",
                          alignItems: "center",
                        }}
                        onClick={() => {
                          this.setState({ descOpen: true });
                        }}
                      >
                        +
                      </span>
                    )}
                  </div>
                  <p className={this.state.descOpen ? "open" : "close"}>
                    {this.state.product.description}
                  </p>
                </div>

                <Modal
                  open={this.state.share}
                  onClose={() =>
                    this.setState({
                      share: false,
                    })
                  }
                >
                  <div className="share-modal">
                    <TelegramShareButton
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                      url={window.location.href}
                    >
                      <TelegramIcon size={40} round={true} borderRadius={10} />
                      <span style={{ marginLeft: "10px" }}> Telegram </span>
                    </TelegramShareButton>

                    <FacebookShareButton
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                      url={window.location.href}
                    >
                      <FacebookIcon size={40} round={true} borderRadius={10} />
                      <span style={{ marginLeft: "10px" }}> Facebook </span>
                    </FacebookShareButton>
                    <WhatsappShareButton
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                      url={window.location.href}
                    >
                      <WhatsappIcon size={40} round={true} borderRadius={10} />
                      <span style={{ marginLeft: "10px" }}> Whatsapp </span>
                    </WhatsappShareButton>
                    <EmailShareButton
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                      url={window.location.href}
                    >
                      <EmailIcon size={40} round={true} borderRadius={10} />
                      <span style={{ marginLeft: "10px" }}> Mail </span>
                    </EmailShareButton>
                    <FacebookMessengerShareButton
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",
                        marginBottom: "10px",
                      }}
                      url={window.location.href}
                    >
                      <FacebookMessengerIcon
                        size={40}
                        round={true}
                        borderRadius={10}
                      />
                      <span style={{ marginLeft: "10px" }}> Messenger </span>
                    </FacebookMessengerShareButton>
                    <Button
                      style={{
                        width: "100%",
                        display: "flex",
                        alignItems: "center",

                        textTransform: "capitalize",
                        justifyContent: "flex-start",
                        fontSize: "16px",
                      }}
                      onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        toaster.notify("Link Copied !");
                      }}
                    >
                      <i
                        style={{
                          fontSize: "25px",
                          width: "38.75px",
                          height: " 38.75p",
                          display: " flex",
                          justifyContent: " flex-start",
                          alignItems: " center",
                        }}
                        className="fas fa-copy"
                      ></i>
                      <span> Copy Link </span>
                    </Button>
                  </div>
                </Modal>
                <Modal
                  open={this.state.addressModal}
                  onClose={() =>
                    this.setState({
                      addressModal: false,
                    })
                  }
                >
                  <div className="addressModal">
                    <div className="head">
                      <h3>Address</h3>
                      <i
                        className="fas fa-times"
                        onClick={() => this.setState({ addressModal: false })}
                        style={{ cursor: "pointer" }}
                      ></i>
                    </div>
                    <div className="body">
                      {this.state.user?.addresses?.map((item, index) => (
                        <p
                          onClick={() => {
                            this.setState({ addressIndex: index });
                          }}
                          ref={(el) =>
                            this.state.addressIndex === index
                              ? (this.el = el)
                              : null
                          }
                        >
                          {item.name} - {item.number}
                          <br />
                          {item.address}, {item.city} - {item.pincode},{" "}
                          {item.state}
                          {this.state.addressIndex === index && (
                            <img src={active_icon} alt="" />
                          )}
                        </p>
                      ))}
                    </div>
                    <div className="footer">
                      {/* <Button
                      variant="contained"
                      color="primary"
                      onClick={() => this.setState({ modal: true })}
                    >
                      Add
                    </Button> */}
                    </div>
                  </div>
                </Modal>
                <Modal
                  open={this.state.modal}
                  onClose={() => this.setState({ modal: false })}
                  className="modal"
                >
                  <div className="add-address-modal">
                    <div className="head">
                      <h4>Shipping Address</h4>
                      <i
                        className="fas fa-times"
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
                          this.state.error.input === "name"
                            ? this.state.error.msg
                            : ""
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
                          {indian
                            .citiesForState(this.state.state)
                            .map((city) => (
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
                      onClick={this.handleAddress}
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
                <Backdrop open={this.state.uploading} className="backdrop">
                  <CircularProgress color="inherit" />
                </Backdrop>
              </div>
            </>
          )}
        </div>
        <div className="addSec">
          <div className="row">
            <img src={add1} alt="add1" />
            <img src={add2} alt="add2" />
            <img src={add3} alt="add3" />
            <img src={add4} alt="add4" />
            <img src={add5} alt="add5" />
            <img src={add7} alt="add7" />
            <img src={add8} alt="add8" />
            <img src={add9} alt="add9" />
            <img src={add6} alt="add6" />
            <img src={add10} alt="add10" />
          </div>
        </div>
      </div>
    );
  }
}
