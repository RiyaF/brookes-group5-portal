var React = require("react");
var firebase = require("firebase");
var Link = require("react-router").Link;
var hashHistory = require("react-router").hashHistory;

var SignUpForm = React.createClass({
  //initially, no submission errors
  getInitialState: function () {
    return { hasError: false };
  },

  handleSignUp: function () {
    var that = this;

    //gets the data from the form fields
    var type = this.state.type;
    var firstName = this.refs.firstName.value;
    var lastName = this.refs.lastName.value;
    var email = this.refs.email.value;
    var password = this.refs.password.value;
    var password_confirmation = this.refs.password_confirmation.value;
    var graduationDate = this.refs.graduationDate?this.refs.graduationDate.value:null;
    console.log(graduationDate)
    if (type == "organisation") {
      if (firstName && lastName) {
        //creates the user on firebase
        firebase
          .auth()
          .createUserWithEmailAndPassword(
            email,
            password == password_confirmation ? password : "nil"
          )
          .catch(function (error) {
            if (error) {
              that.setState({ hasError: true });
              that.setState({
                errorMsg:
                  "Please enter a valid email address with a password of at least 6 characters.",
              });
            }
          });
      } else {
        that.setState({ hasError: true });
        that.setState({
          errorMsg: "First or last name field cannot be empty.",
        });
      }
    } else {
      console.log("Student signup");
      var isValidEmail = this.validateBrookesID(email);
      if (isValidEmail) {
        console.log("Yup Valid student or professor");
        let login = (type == "student")?graduationDate?true:false:true
        console.log("login",login)
        if (firstName && lastName && login) {
          //creates the user on firebase
          firebase
            .auth()
            .createUserWithEmailAndPassword(
              email,
              password == password_confirmation ? password : "nil"
            )
            .catch(function (error) {
              if (error) {
                that.setState({ hasError: true });
                that.setState({
                  errorMsg:
                    "Please enter a valid email address with a password of at least 6 characters.",
                });
              }
            });
        } else {
          that.setState({ hasError: true });
          that.setState({
            errorMsg: "First name, last name, graduation date fields cannot be empty.",
          });
        }
      } else {
        console.log("Some random email id - don't signup");
        that.setState({ hasError: true });
        that.setState({
          errorMsg: "It is not a valid Brookes University ID",
        });
      }
    }
    /* if (firstName && lastName) {
      //creates the user on firebase
      firebase
        .auth()
        .createUserWithEmailAndPassword(
          email,
          password == password_confirmation ? password : "nil"
        )
        .catch(function (error) {
          if (error) {
            that.setState({ hasError: true });
            that.setState({
              errorMsg:
                "Please enter a valid email address with a password of at least 6 characters.",
            });
          }
        });
    } else {
      that.setState({ hasError: true });
      that.setState({ errorMsg: "First or last name field cannot be empty." });
    } */

    //if successfully logged in, add the user child to the database with the name and email.
    this.unsubscribe = firebase.auth().onAuthStateChanged(function (user) {
      if (user) {
        console.log("testfgnfj")
        var userData = {
          email: email,
          first: firstName,
          last: lastName,
          type: type,
          imageURL:
            "https://icon-library.net/images/default-profile-icon/default-profile-icon-17.jpg",
          interests: "",
          skills: "",
          creationDate: Date.now(),
        };
        if(type == 'student') {
          userData.graduationDate=new Date(graduationDate).getTime()
        }
        console.log(userData)
        firebase
          .database()
          .ref("users/" + firebase.auth().currentUser.uid)
          .set(userData);

        //update display name for user
        user.updateProfile({
          displayName: firstName + " " + lastName,
        });

        hashHistory.push("/");
      }
    });
  },

  validateBrookesID: function (email) {
    var studentIDRegEx = /^[0-9]+@brookes.ac.uk$/;
    var profIDRegEx = /^p[0-9]+@brookes.ac.uk$/;
    console.log(studentIDRegEx.test(email), this.state.type)
    if (studentIDRegEx.test(email) && this.state.type == "student") {
      console.log("Valid student id");
      return true;
    } else if (profIDRegEx.test(email) && this.state.type == "admin") {
      console.log("Valid professor id");
      return true;
    } else {
      console.log("Stranger Danger");
      return false;
    }
  },

  componentWillUnmount: function () {
    if (typeof this.unsubscribe == "function") {
      this.unsubscribe();
    }
  },

  //if "Enter" was pressed, act as Sign Up was clicked
  handleKeyPress: function (e) {
    if (e.key == "Enter") {
      try {
        this.handleSignUp();
      } catch (e) { }
    }
  },

  //sets the type state true or false depending on the radio button
  accountChange: function (e) {
    this.setState({ type: e.target.value });
    console.log(e)

  },

  //creates a div alert-danger with the error message
  errorMessage: function () {
    return (
      <div className="alert alert-danger">
        <strong>Error! </strong>
        {this.state.errorMsg}
      </div>
    );
  },

  //creates an empty div if no error message
  noErrorMessage: function () {
    return <div></div>;
  },

  render: function () {
    //gets the appropriate error alert div depending on whether or not the form has an error
    var errorAlert;
    if (this.state.hasError) {
      errorAlert = this.errorMessage();
    } else {
      errorAlert = this.noErrorMessage();
    }
    var alumini = null
    if (this.state.type == 'student') {
      alumini = 
        <input type="date"  ref="graduationDate" placeholder="Graduation Date"
        className="form-control"/>
    }
    return (
      <div>
        {errorAlert}

        <div className="col-md-5"></div>

        <div className="col-md-5 margin-top-30">
          <center>
            <h1>Sign Up</h1>
            <br />
            <div className="sign-up-form">
              <div className="sign-up-type">
                <input
                  type="radio"
                  name="type"
                  value="student"
                  onChange={this.accountChange}
                  className="radio-icon"
                />
                <span className="radio-icon">Student</span>
                <input
                  type="radio"
                  name="type"
                  value="organisation"
                  onChange={this.accountChange}
                  className="radio-icon"
                />
                <span className="radio-icon">Organisation</span>
                <input
                  type="radio"
                  name="type"
                  value="admin"
                  onChange={this.accountChange}
                  className="radio-icon"
                />
                <span className="radio-icon">Administrator</span>
              </div>
              <input
                type="text"
                ref="firstName"
                placeholder="First Name"
                className="form-control"
                onKeyPress={this.handleKeyPress}
              />
              <br />
              <input
                type="text"
                ref="lastName"
                placeholder="Last Name"
                className="form-control"
                onKeyPress={this.handleKeyPress}
              />
              <br />
              <input
                type="email"
                ref="email"
                placeholder="Email Address"
                className="form-control"
                onKeyPress={this.handleKeyPress}
              />
              <br />
              <input
                type="password"
                ref="password"
                placeholder="Password"
                className="form-control"
                onKeyPress={this.handleKeyPress}
              />
              <br />
              <input
                type="password"
                ref="password_confirmation"
                placeholder="Password Confirmation"
                className="form-control"
                onKeyPress={this.handleKeyPress}
              />
              <br />
              {alumini}
              <br />
              <button
                onClick={this.handleSignUp}
                className="btn btn-primary margin-bottom-10"
              >
                Create Account
              </button>
              <br />
              Have an account? <Link to="/login">Login!</Link>
            </div>
          </center>
        </div>
        <div className="col-md-5"></div>
      </div>
    );
  },
});

module.exports = SignUpForm;
