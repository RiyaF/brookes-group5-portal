var React = require('react');
var firebase = require('firebase');
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;

var AwaitingAcceptance = React.createClass({
	getInitialState: function () {
		return {
			currentUserID: "",
			requesters: []
		}
	},

	componentWillMount: function () {
		var that = this;
		this.unsubscribe = firebase.auth().onAuthStateChanged((user) => {
			this.setState({ currentUserID: user.uid });
			this.userRef = firebase.database().ref().child('users/' + firebase.auth().currentUser.uid);
			this.userRef.on("value", snapUser => {
				var user = snapUser.val();
				this.setState({ type: (user == null || !user.type) ? false : user.type });
			});
			//get connections whose status is awaiting acceptance
			this.connectionRef = firebase.database().ref().child('connections/' + this.state.currentUserID).orderByChild('status').equalTo('awaiting-acceptance');
			this.connectionRef.on("child_added", snap => {
				var requesterID = snap.ref.key;
				var requesterRef = firebase.database().ref().child('users/' + requesterID);
				requesterRef.once("value", snap => {
					var userData = snap.val();
					if (userData) {
						var userInfo = {
							first: userData.first,
							last: userData.last,
							hasProfileImage: userData.hasProfileImage,
							user_id: snap.ref.key,
							imageURL: userData.imageURL,
							type: "connection"
						};
						var updatedRequesters = that.state.requesters.slice();
						updatedRequesters.push(userInfo);
						that.setState({ requesters: updatedRequesters });
					}
				});
			});


			//if status was updated, remove from array of requesters
			this.connectionRefUpdate = firebase.database().ref().child('connections/' + this.state.currentUserID);
			this.connectionRefUpdate.on("child_changed", snap => {
				var userChangedKey = snap.ref.key;
				var index = -1;
				for (var i = 0; i < this.state.requesters.length; i++) {
					if (this.state.requesters[i].user_id == userChangedKey) {
						index = i;
					}
				}

				if (index > -1) {
					var updatedRequesters = this.state.requesters.slice();
					updatedRequesters.splice(index, 1);
					this.setState({ requesters: updatedRequesters });
				}
			});

			if (this.state.type == 'admin') {
				console.log('test')
				this.joblistingRef = firebase.database().ref().child('user-joblisting').orderByChild('status').equalTo('approval_pending');
				this.joblistingRef.on("child_added", snapjob => {
					var requesterID = snapjob.ref.key;
					var requesterRef = firebase.database().ref().child('users/' + snapjob.val().user_id);
					requesterRef.once("value", snap => {
						var userData = snap.val();
						if (userData) {
							var userInfo = {
								jobId: requesterID,
								jobDetail: snapjob.val(),
								first: userData.first,
								last: userData.last,
								hasProfileImage: userData.hasProfileImage,
								user_id: snap.ref.key,
								imageURL: userData.imageURL,
								type: "joblist"
							};
							console.log(userInfo)
							var updatedRequesters = that.state.requesters.slice();
							updatedRequesters.push(userInfo);
							that.setState({ requesters: updatedRequesters });
							console.log(this.state.requesters)
						}
					});
				});
				this.joblistingRef = firebase.database().ref().child('user-joblisting');
				this.joblistingRef.on("child_changed", snap => {
					var userChangedKey = snap.ref.key;
					var index = -1;
					for (var i = 0; i < this.state.requesters.length; i++) {
						if (this.state.requesters[i].jobId == userChangedKey) {
							index = i;
						}
					}

					console.log(snap.val(), index)
					if (index > -1) {
						var updatedRequesters = this.state.requesters.slice();
						updatedRequesters.splice(index, 1);
						this.setState({ requesters: updatedRequesters });
					}
				});
			}
			//if rejected acceptance, remove from array of requesters
			//var connectionRefRemove = firebase.database().ref().child('connections/' + this.state.currentUserID);
			this.connectionRefUpdate.on("child_removed", snap => {
				var userChangedKey = snap.ref.key;
				var index = -1;
				for (var i = 0; i < this.state.requesters.length; i++) {
					if (this.state.requesters[i].user_id == userChangedKey) {
						index = i;
					}
				}

				if (index > -1) {
					var updatedRequesters = this.state.requesters.slice();
					updatedRequesters.splice(index, 1);
					this.setState({ requesters: updatedRequesters });
				}
			});
		});
	},

	componentWillUnmount: function () {
		this.connectionRef.off();
		this.connectionRefUpdate.off();
		this.unsubscribe();
	},

	//update the connection status to accepted
	handleAcceptConnection: function (user) {
		var connectionUpdate = {};
		connectionUpdate['connections/' + this.state.currentUserID + '/' + user.user_id] = { status: "accepted" }
		firebase.database().ref().update(connectionUpdate);

		var connectionOtherUpdate = {};
		connectionOtherUpdate['connections/' + user.user_id + '/' + this.state.currentUserID] = { status: "accepted" }
		firebase.database().ref().update(connectionOtherUpdate);
	},
	handleJobApprove: function (user) {
		var connectionUpdate = firebase.database().ref().child('user-joblisting/' + user.jobId);
		connectionUpdate.update({ status: "approved" });
	},
	//remove the connection
	handleRemoveConnection: function (user) {
		var connectionRef = firebase.database().ref().child('connections/' + this.state.currentUserID + '/' + user.user_id);
		connectionRef.remove();

		var connectionOtherRef = firebase.database().ref().child('connections/' + user.user_id + '/' + this.state.currentUserID);
		connectionOtherRef.remove();
	},
	handleJobReject: function (user) {
		var connectionUpdate = firebase.database().ref().child('user-joblisting/' + user.jobId);
		connectionUpdate.update({ status: "rejected" });
	},

	//show the accept & delete request buttons
	showAwaitingAcceptance: function (user) {
		return (
			<div>
				<button className='btn btn-primary request-button' onClick={this.handleAcceptConnection.bind(null, user)}>Accept Connection</button>
				<button className='btn btn-default request-button' onClick={this.handleRemoveConnection.bind(null, user)}>Delete Request</button>
			</div>
		);
	},

	//accept reject for job
	showAwaitingJobAcceptance: function (user) {
		return (
			<div>
				<button className='btn btn-primary request-button' onClick={this.handleJobApprove.bind(null, user)}>Approve</button>
				<button className='btn btn-default request-button' onClick={this.handleJobReject.bind(null, user)}>Decline</button>
			</div>
		);
	},

	render: function () {
		var showRequests;
		if (this.state.requesters.length == 0) {
			showRequests = <div><center>No new requests!</center></div>
		} else {
			showRequests =
				this.state.requesters.map((user, index) => {
					if (user.type == 'connection') {
						return (
							<div className="grid-item col-md-3" key={index}>
								<Link to={"users/" + user.user_id}><h4><img src={user.imageURL} className="grid-img img-circle" alt="" width="100" height="100" style={{ objectFit: 'cover' }} /><br />
									{user.first + " " + user.last}</h4></Link>
								{this.showAwaitingAcceptance(user)}
								<br />
							</div>
						)
					} else if (user.type == 'joblist') {
						return (
							<div className="grid-item col-md-1" key={index}>
								<h4>Job Add Request</h4>
								<Link to={"users/" + user.user_id}><h5><img src={user.imageURL} className="grid-img img-circle" alt="" width="35" height="35" style={{ objectFit: 'cover' }} /><br />
									{user.first + " " + user.last}</h5></Link>
								<h4>{user.jobDetail.position + "-" + user.jobDetail.experienceLevel}</h4>
								<h6>{user.jobDetail.location}</h6>
								{this.showAwaitingJobAcceptance(user)}
								<br />
							</div>
						)
					}
				})
		}

		return (
			<div>
				<center><h1 className="grid-title">Requests</h1></center>
				{showRequests}
			</div>
		);
	}
});

module.exports = AwaitingAcceptance;