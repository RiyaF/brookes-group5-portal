var React = require('react');
var firebase = require('firebase');
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;
var Search = require('./search.js');
var countDownDate
var countdown = null
var x
var Layout = React.createClass({

    //sets the initial logged in state
    getInitialState: function () {
        return {
            isLoggedIn: (null != firebase.auth().currentUser),
            type: null,
            imgURL: "",
            requests: [],
            countdown: null
        }
    },

    //checks for login/logout changes and sets the logged in state accordingly, also gets the user's name
    componentWillMount: function () {
        var that = this;

        this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            this.setState({ isLoggedIn: (null != user) });
            this.setState({ type: this.state.isLoggedIn == false ? false : null });
            this.setState({ name: this.state.isLoggedIn ? user.displayName : null });
            this.setState({ user_id: this.state.isLoggedIn ? user.uid : null });
            if (this.state.isLoggedIn) {
                this.userRef = firebase.database().ref().child('users/' + firebase.auth().currentUser.uid);
                this.userRef.on("value", snapUser => {
                    var user = snapUser.val();
                    this.setState({ imgURL: user.imageURL });
                    this.setState({ type: (user == null || !user.type) ? false : user.type });
                    if (user.type == "student" && user.graduationDate) {
                        countDownDate = new Date(user.graduationDate);
                        if (new Date() > new Date(countDownDate)) {
                            countDownDate.setFullYear(countDownDate.getFullYear() + 1);
                            this.countDown();
                        }
                    }
                });


                this.connectionRef = firebase.database().ref().child('connections/' + user.uid).orderByChild('status').equalTo('awaiting-acceptance');
                this.connectionRef.on("child_added", snap => {
                    if (snap.val()) {
                        var requesterID = snap.ref.key;
                        var requesterRef = firebase.database().ref().child('users/' + requesterID);
                        requesterRef.once("value", snap => {
                            var userData = snap.val();
                            if (userData) {
                                this.state.requests.push({ type: "connection", id: requesterID });
                                this.setState({ requests: this.state.requests });
                            }
                        });
                    }
                });

                this.connectionRefUpdate = firebase.database().ref().child('connections/' + user.uid);
                this.connectionRefUpdate.on("child_changed", snap => {
                    if (snap.val().status == 'accepted') {

                        var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                        if (index >= 0) {
                            this.state.requests.splice(index, 1);
                            this.setState({ requests: this.state.requests });
                        }
                    }
                });

                this.connectionRefRemoved = firebase.database().ref().child('connections/' + user.uid);
                this.connectionRefRemoved.on("child_removed", snap => {
                    var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                    if (index >= 0) {
                        this.state.requests.splice(index, 1);
                        this.setState({ requests: this.state.requests });
                    }
                });
                this.userRef = firebase.database().ref().child('users/' + firebase.auth().currentUser.uid);
                this.userRef.on("value", snapUser => {

                    if (snapUser.val().type == "student" && snapUser.val().graduationDate) {
                        countDownDate = new Date(snapUser.val().graduationDate);
                        if (new Date() > new Date(countDownDate)) {
                            countDownDate.setFullYear(countDownDate.getFullYear() + 1);
                            this.countDown();
                        }
                    }
                    if (user.type == "student" && countDownDate < Date.now()) {
                        firebase.auth().signOut();
                        this.setState({ isLoggedIn: null });

                        return;
                    }
                    var user = snapUser.val();
                    this.setState({ type: (user == null || !user.type) ? false : user.type });
                    if (this.state.type == 'admin') {

                        this.joblisting = firebase.database().ref().child('user-joblisting').orderByChild('status').equalTo('approval_pending');
                        this.joblisting.on("child_added", snap => {
                            console.log(1111)
                            if (snap.val()) {
                                var requesterID = snap.ref.key;
                                var requesterRef = firebase.database().ref().child('users/' + snap.val().user_id);
                                requesterRef.once("value", snap => {
                                    var userData = snap.val();
                                    if (userData) {
                                        this.state.requests.push({ type: "job-listing", id: requesterID });
                                        this.setState({ requests: this.state.requests });

                                    }
                                });
                            }
                        });
                        this.joblisting = firebase.database().ref().child('user-joblisting');
                        this.joblisting.on("child_changed", snap => {
                            console.log(2222)
                            if (snap.val().status == 'approved' || snap.val().status == 'rejected') {
                                var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                                if (index >= 0) {
                                    this.state.requests.splice(index, 1);
                                    this.setState({ requests: this.state.requests });
                                }
                            }
                        });

                        this.joblisting = firebase.database().ref().child('user-joblisting');
                        this.joblisting.on("child_removed", snap => {
                            console.log(3333)
                            var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                            if (index >= 0) {
                                this.state.requests.splice(index, 1);
                                this.setState({ requests: this.state.requests });
                            }
                        });
                    }
                });
            }
        });
    },

    componentWillReceiveProps: function (nextProps) {
        var that = this;
        this.unsubscribe();
        //this.state.requests.splice(0, this.state.requests.length);

        this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
            this.setState({ isLoggedIn: (null != user) });
            this.setState({ type: this.state.isLoggedIn == false ? false : null });
            this.setState({ name: this.state.isLoggedIn ? user.displayName : null });
            this.setState({ user_id: this.state.isLoggedIn ? user.uid : null });

            if (this.state.isLoggedIn) {
                this.userRef = firebase.database().ref().child('users/' + firebase.auth().currentUser.uid);
                this.userRef.on("value", snap => {
                    clearInterval(x);
                    var user = snap.val();
                    if (user.type == "student" && user.graduationDate) {
                        countDownDate = new Date(user.graduationDate);
                        if (new Date() > new Date(countDownDate)) {
                            countDownDate.setFullYear(countDownDate.getFullYear() + 1);
                            this.countDown();
                        }
                    }
                    if (user.type == "student" && countDownDate < Date.now()) {
                        firebase.auth().signOut();
                        this.setState({ isLoggedIn: null });
                        return;
                    }
                    this.setState({ imgURL: user.imageURL });
                    this.setState({ type: (user == null || !user.type) ? false : user.type });
                });

                this.connectionRef = firebase.database().ref().child('connections/' + user.uid).orderByChild('status').equalTo('awaiting-acceptance');
                this.connectionRef.on("child_added", snap => {
                    if (snap.val()) {
                        var requesterID = snap.ref.key;
                        var requesterRef = firebase.database().ref().child('users/' + requesterID);
                        requesterRef.once("value", snap => {
                            var userData = snap.val();
                            if (userData) {
                                if (this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key) < 0) {
                                    this.state.requests.push({ type: "connection", id: requesterID });
                                    this.setState({ requests: this.state.requests });
                                }
                            }
                        });

                    }
                });

                this.connectionRefUpdate = firebase.database().ref().child('connections/' + user.uid);
                this.connectionRefUpdate.on("child_changed", snap => {
                    if (snap.val().status == 'approved' || snap.val().status == 'rejected') {
                        var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                        if (index >= 0) {
                            this.state.requests.splice(index, 1);
                            this.setState({ requests: this.state.requests });
                        }
                    }
                });

                this.connectionRefRemoved = firebase.database().ref().child('connections/' + user.uid);
                this.connectionRefRemoved.on("child_removed", snap => {
                    var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                    if (index >= 0) {
                        this.state.requests.splice(index, 1);
                        this.setState({ requests: this.state.requests });
                    }
                });
                if (this.state.type == 'admin') {
                    this.joblisting = firebase.database().ref().child('user-joblisting').orderByChild('status').equalTo('approval_pending');
                    this.joblisting.on("child_added", snap => {
                        console.log(4444)
                        if (snap.val()) {
                            var requesterID = snap.ref.key;
                            var requesterRef = firebase.database().ref().child('users/' + snap.val().user_id);
                            requesterRef.once("value", snap => {

                                var userData = snap.val();
                                if (userData) {
                                    if (this.state.requests.map(function (e) { return e.id; }).indexOf(requesterID) < 0) {
                                        this.state.requests.push({ type: "job-listing", id: requesterID });
                                        this.setState({ requests: this.state.requests });
                                    }
                                }
                            });

                        }
                    });
                    this.joblisting = firebase.database().ref().child('user-joblisting');
                    this.joblisting.on("child_changed", snap => {
                        console.log(5555)
                        if (snap.val().status == 'accepted') {
                            var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                            if (index >= 0) {
                                this.state.requests.splice(index, 1);
                                this.setState({ requests: this.state.requests });
                            }
                        }
                    });

                    this.joblisting = firebase.database().ref().child('user-joblisting');
                    this.joblisting.on("child_removed", snap => {
                        console.log(6666)
                        var index = this.state.requests.map(function (e) { return e.id; }).indexOf(snap.ref.key);
                        if (index >= 0) {
                            this.state.requests.splice(index, 1);
                            this.setState({ requests: this.state.requests });
                        }
                    });
                }
            }
        });
    },
    countDown: function () {
        // Update the count down every 1 second
        x = setInterval(() => {

            // Get today's date and time
            var now = new Date().getTime();

            // Find the distance between now and the count down date
            var distance = countDownDate - now;

            // Time calculations for days, hours, minutes and seconds
            var days = Math.floor(distance / (1000 * 60 * 60 * 24));
            var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
            var seconds = Math.floor((distance % (1000 * 60)) / 1000);
            // Output the result in an element with id="demo"
            countdown = days + "d " + hours + "h "
                + minutes + "m " + seconds + "s ";

            // If the count down is over, write some text 
            if (distance < 0) {
                clearInterval(x);
                countdown = "EXPIRED";
            }
            if (!this.state.isLoggedIn) {
                clearInterval(x);
                countdown = ''
            }
            this.setState({ countdown: countdown })
        }, 1000);
    },
    componentWillUnmount: function () {
        this.unsubscribe();
    },
    logoutFn() {
        this.unsubscribe();
        this.setState({ requests: [], isLoggedIn: false }, () => {
            console.log(this.state.requests, this.state.isLoggedIn)
            firebase.auth().signOut();
            hashHistory.push('/login');
        });
    },
    render: function () {
        var loginOrOut;
        var profile;
        var signUp;
        var accountSettings;
        var requests;
        var connections;
        var companies;
        var Jobs
        var search;

        var navClassName;

        var div;
        var divStyle = {
            fontSize: '10px',
            textAlign: 'center',
            color: 'white',
            width: '15px',
            height: '15px',
            position: 'relative',
            backgroundColor: 'red',
            borderRadius: '5px',
            top: '-30px',
            right: '-10px',
            zIndex: '1'
        }

        if (this.state.requests.length > 0) {
            div = <div style={divStyle}>{this.state.requests.length}</div>
        } else {
            div = null;
        }


        //if the user is logged in, show the logout and profile link
        if (this.state.isLoggedIn) {
            loginOrOut = <li onClick={this.logoutFn}><Link className="navbar-brand"><span className="glyphicon glyphicon-off navbar-icon" title="Logout"></span></Link></li>;
            profile = <li><Link to={"/users/" + this.state.user_id} title="Profile" className="navbar-brand"><img src={this.state.imgURL} className="img-circle" width="20" height="20" style={{ objectFit: 'cover' }} /></Link></li>;
            signUp = null;

            accountSettings = <li><Link to="/accountSettings" className="navbar-brand"><span className="glyphicon glyphicon-cog navbar-icon" title="Settings"></span></Link></li>;
            requests = <li><Link to="/requests" className="navbar-brand"><span className='glyphicon glyphicon-bell navbar-icon' title="Requests"></span>{div}</Link></li>;
            connections = <li><Link to="/connections" className="navbar-brand connections-icon"><span className='ionicons ion-ios-people navbar-icon' title="Connections"></span></Link></li>;
            companies = <Link to="/companies" className="navbar-brand briefcase"><span className='glyphicon glyphicon-th-large navbar-icon' title="Companies"></span></Link>;
            Jobs = <Link to={"/jobs/" + this.state.user_id} className="navbar-brand briefcase"><span className='glyphicon glyphicon-briefcase navbar-icon' title="Jobs"></span></Link>;
            search = <Search type={this.state.type} />

            //if the user is not logged in, show the login and signup links
        } else {
            loginOrOut = <li><Link to="/login" className="navbar-brand">Login</Link></li>;
            profile = null;
            signUp = <li><Link to="/signup" className="navbar-brand">Sign Up</Link></li>;
            accountSettings = null;
            requests = null;
            connections = null;
            companies = null;
            search = null;
        }
        //if type= organisation -> black navbar, else job seeker -> default navbar
        if (this.state.type == 'organisation') {
            navClassName = "navbar navbar-inverse navbar-static-top";
        } else {
            navClassName = "navbar navbar-default navbar-static-top";
        }

        return (
            <span>
                <nav className={navClassName}>
                    <div className="container">
                        <div className="navbar-header">
                            <Link to="/" className="navbar-brand">
                                {/*<span className="glyphicon glyphicon-home navbar-icon" title="Home"></span>*/}
                                <img src="logo.png" alt="logo" height={35} />
                            </Link>
                            {companies}
                            {Jobs}


                        </div>
                        {search}
                        <ul className="nav navbar-nav pull-right">
                            {signUp} {/*shows only if user is not logged in*/}
                            {profile} {/*shows only if user is logged in*/}
                            {requests}
                            {connections}
                            {accountSettings}
                            {loginOrOut} {/*shows login or logout link depending on logged in state*/}
                        </ul>
                        <div style={{ fontSize: '19px', color: "darkred", paddingTop: '10px' }}>
                            {this.state.countdown}</div>

                    </div>
                </nav>

                {/*shows the rest of the page: home, login, signup, etc. */}
                <div className="container">
                    {this.props.children}
                </div>
            </span>
        )
    }
});

module.exports = Layout;