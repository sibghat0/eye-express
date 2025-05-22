import React from "react";
import "./profile.css";
import {
  Backdrop,
  Button,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Modal,
  Select,
  TextField,
} from "@material-ui/core";
import user from "../../../assets/user.png";
import DateFnsUtils from "@date-io/date-fns";
import {
  MuiPickersUtilsProvider,
  KeyboardDatePicker,
} from "@material-ui/pickers";
import close from "../../../assets/close-grey.svg";
import firebase from "firebase";
import { Redirect } from "react-router-dom";
import toaster from "toasted-notes";
import Loader from "../../components/loader/loader";
import moment from "moment";
import indian from "indian-states-cities";

export default class Profile extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: null,
      edit: false,
      modal: false,
      name: "",
      address2: "",
      state: "",
      city: "",
      profilePic: null,
      pincode: "",
      number: "",
      error: { input: "", msg: "" },
      editName: "",
      editPhone: "",
      editWhatsapp: "",
      editAddresses: [],
      loading: true,
      uploading: false,
      redirect: false,
    };
  }

  componentDidMount() {
    this.init();
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
              this.setState({
                user: {
                  ...doc.data(),
                  id: doc.id,
                },
                loading: false,
              });
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
  };

  componentWillUnmount() {
    if (this.state.redirect) {
      toaster.notify("Please login to continue!!");
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

  handleAddAddress = () => {
    if (
      this.state.name.length > 0 &&
      this.state.address2.length > 0 &&
      this.state.state.length > 0 &&
      this.state.city.length > 0 &&
      this.state.pincode.length > 0 &&
      this.state.number.length === 10
    ) {
      var obj = {};
      obj.name = this.state.name;
      obj.address = this.state.address2;
      obj.state = this.state.state;
      obj.city = this.state.city;
      obj.pincode = this.state.pincode;
      obj.number = this.state.number;
      this.setState({
        editAddresses: [...this.state.editAddresses, obj],
        modal: false,
        name: "",
        address2: "",
        state: "",
        city: "",
        pincode: null,
        number: null,
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

  handleImageUpload = async () => {
    var url = "";
    const storageRef = firebase.storage().ref(`/users/${this.state.user.id}`);
    await storageRef
      .put(this.state.profilePic)
      .then(async (res) => (url = await res.ref.getDownloadURL()));
    return url;
  };

  handleEdit = async () => {
    this.setState({
      uploading: true,
    });
    var img = this.state.profilePic || "";
    if (img.name) {
      img = await this.handleImageUpload();
    }
    if (this.state.editName.length > 0 && this.state.editPhone.length > 0) {
      firebase
        .firestore()
        .collection("users")
        .doc(this.state.user.id)
        .update({
          name: this.state.editName,
          number: this.state.editPhone,
          dob: this.state.selectedDate,
          addresses: this.state.editAddresses,
          profilePic: img,
        })
        .then(() => {
          toaster.notify("Profile Updated Successfully!");
          this.init();
          this.setState({
            uploading: false,
            edit: false,
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
      if (this.state.editName.length === 0) {
        toaster.notify("Name cannot be empty!");
        this.setState({
          uploading: false,
        });
      } else {
        toaster.notify("Phone number cannot be empty!");
        this.setState({
          uploading: false,
        });
      }
    }
  };

  handleDateChange = (date) => {
    this.setState({ selectedDate: date });
  };

  handleLogout = () => {
    firebase
      .auth()
      .signOut()
      .then(() => {
        window.location.reload();
      })
      .catch((err) => {
        alert("Please Reload Page to continue!!");
        console.log(err);
      });
  };

  render() {
    if (this.state.redirect) {
      return <Redirect to="/" />;
    }
    return (
      <>
        {this.state.loading ? (
          <Loader />
        ) : !this.state.edit ? (
          <div className="profile">
            <div className="inner-div">
              <div className="top">
                <div className="left">
                  <img src={this.state.user.profilePic || user} alt="" />
                </div>
                <div className="right">
                  <p>
                    <span>Name: </span>
                    {this.state.user.name}
                  </p>
                  <p>
                    <span>Mobile: </span>+91{" "}
                    {this.state.user.number.length > 0
                      ? this.state.user.number
                      : "XXXXX XXXXX"}
                  </p>
                  <p>
                    <span>Email: </span>
                    {this.state.user.email}
                  </p>
                  <p>
                    <span>Date Of Birth: </span>
                    {this.state.user.dob &&
                      moment(this.state.user.dob).format("L")}
                  </p>
                </div>
              </div>
              <div className="bottom">
                <h4>Addresses: </h4>
                <div className="address-conatiner">
                  {this.state.user.addresses.length > 0 ? (
                    this.state.user.addresses.map((item) => (
                      <div className="address">
                        <span
                          className="add"
                          style={{
                            width: "90%",
                            display: "flex",
                            // alignItems: "center",
                            flexDirection: "column",
                          }}
                        >
                          <p>
                            <i className="fas fa-map-marker-alt"></i>
                            {item.name} - {item.number}
                          </p>
                          <p>
                            {item.address}, {item.city} - {item.pincode},{" "}
                            {item.state}
                          </p>
                        </span>
                      </div>
                    ))
                  ) : (
                    <h5
                      style={{
                        fontSize: 18,
                        color: "#707070",
                        fontWeight: "600",
                      }}
                    >
                      There are currently no addresses available, Go to edit
                      profile to add addresses
                    </h5>
                  )}
                </div>
              </div>
            </div>
            <button
              className="logout-btn"
              title="Logout"
              onClick={this.handleLogout}
            >
              <i className="fas fa-power-off"></i>
              <p>Logout</p>
            </button>
            <Button
              variant="contained"
              className="edit-btn"
              onClick={() => {
                this.setState({
                  edit: true,
                  editName: this.state.user.name,
                  editPhone: this.state.user.number,
                  editAddresses: this.state.user.addresses,
                  selectedDate: this.state.user.dob,
                  profilePic: this.state.user.profilePic,
                });
              }}
            >
              Edit Profile
            </Button>
          </div>
        ) : (
          <div className="profile edit">
            <div className="top">
              <div className="left">
                <label htmlFor="choose">
                  <img
                    src={
                      this.state.profilePic
                        ? this.state.profilePic.name
                          ? URL.createObjectURL(this.state.profilePic)
                          : this.state.profilePic
                        : user
                    }
                    alt=""
                  />
                  <input
                    type="file"
                    id="choose"
                    onChange={(e) => {
                      if (e.target.files[0].size <= 350000) {
                        this.setState({
                          profilePic: e.target.files[0],
                        });
                      } else {
                        toaster.notify(
                          "Image size cannot be greater than 350KB"
                        );
                      }
                    }}
                    accept="image/*"
                    style={{ display: "none" }}
                  />
                </label>
              </div>
              <div className="right">
                <TextField
                  type="text"
                  label="Name"
                  variant="standard"
                  name="editName"
                  value={this.state.editName}
                  onChange={this.handleChange}
                />
                <TextField
                  type="number"
                  label="Phone Number"
                  variant="standard"
                  name="editPhone"
                  value={this.state.editPhone}
                  onChange={this.handleChange}
                />
                <TextField
                  type="email"
                  label="Email"
                  variant="standard"
                  value={this.state.user.email}
                  disabled
                />
                <MuiPickersUtilsProvider utils={DateFnsUtils}>
                  <KeyboardDatePicker
                    format="dd/MM/yyyy"
                    margin="normal"
                    id="date-picker-inline"
                    label="DOB"
                    value={this.state.selectedDate}
                    onChange={this.handleDateChange}
                    KeyboardButtonProps={{
                      "aria-label": "change date",
                    }}
                  />
                </MuiPickersUtilsProvider>
              </div>
              <div className="buttons">
                <Button
                  variant="outlined"
                  style={{
                    background: "#fff",
                    border: "1px solid #333",
                    color: "#000",
                    zIndex: "10",
                  }}
                  className="edit-btn"
                  onClick={() => {
                    this.setState({
                      edit: false,
                      editName: "",
                      editAddresses: [],
                      editPhone: "",
                      selectedDate: null,
                      editWhatsapp: "",
                      profilePic: "",
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="contained"
                  className="edit-btn"
                  onClick={this.handleEdit}
                >
                  Save
                </Button>
              </div>
            </div>
            <div className="bottom">
              <h4>Addresses: </h4>

              <div className="address-conatiner">
                {this.state.editAddresses.map((item, index) => (
                  <div className="address" key={index}>
                    <span
                      className="add"
                      style={{
                        width: "90%",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <p>
                        <i className="fas fa-map-marker-alt"></i>
                        {item.name} - {item.number}
                      </p>
                      <p>
                        {item.address}, {item.city} - {item.pincode},{" "}
                        {item.state}
                      </p>
                    </span>
                    <span style={{ display: "flex", alignItems: "center" }}>
                      <i
                        className="fas fa-pen"
                        onClick={() => {
                          this.setState({
                            modal: true,
                            name: item.name,
                            number: item.number,
                            address: item.address,
                            city: item.city,
                            pincode: item.pincode,
                            state: item.state,
                          });
                        }}
                        style={{ marginRight: 20, color: "#4DC274" }}
                      />
                      <i
                        className="fas fa-trash"
                        onClick={() =>
                          this.setState({
                            editAddresses: this.state.editAddresses.filter(
                              (_, index2) => index !== index2
                            ),
                          })
                        }
                      />
                    </span>
                  </div>
                ))}
                <Button
                  className="add-address"
                  variant="text"
                  onClick={() => {
                    this.setState({ modal: true });
                  }}
                >
                  <i className="fas fa-plus"></i>
                  Add new Address
                </Button>
              </div>
            </div>
            <Modal
              open={this.state.modal}
              onClose={() =>
                this.setState({
                  modal: false,
                  name: "",
                  number: "",
                  address: "",
                  city: "",
                  pincode: "",
                  state: "",
                })
              }
              className="modal"
            >
              <div className="add-address-modal">
                <div className="head">
                  <h4>Shipping Address</h4>
                  <img
                    src={close}
                    alt=""
                    style={{ cursor: "pointer" }}
                    onClick={() =>
                      this.setState({
                        modal: false,
                        name: "",
                        number: "",
                        address: "",
                        city: "",
                        pincode: "",
                        state: "",
                      })
                    }
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
                  onClick={this.handleAddAddress}
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
            <Backdrop className="backdrop" open={this.state.uploading}>
              <CircularProgress color="inherit" />
            </Backdrop>
          </div>
        )}
      </>
    );
  }
}
