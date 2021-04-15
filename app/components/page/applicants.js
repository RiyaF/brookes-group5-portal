var React = require('react');
var firebase = require('firebase');
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;

var Applicants = React.createClass({
    getInitialState: function () {
        return {
            currentUserID: "",
            applicants: []
        }
    },

    componentWillMount: function () {
        var applicantsRef = firebase.database().ref().child('job-applicants/' + this.props.params.jobId);
        applicantsRef.on("child_added", snap => {
            this.userRef = firebase.database().ref().child('users/' + snap.ref.key);
            this.userRef.once("value", userSnap => {
                this.jobRef = firebase.database().ref().child('user-joblisting/' + this.props.params.jobId)
                this.jobRef.once("value", jobSnap => {
                    let applicants = snap.val();
                    console.log(applicants)
                    applicants.userDetails = userSnap.val()
                    applicants.jobdetails = jobSnap.val()
                    applicants.userId = snap.ref.key
                    // company.user_id = snap.ref.key;
                    this.state.applicants.push(applicants);
                    this.setState({ applicants: this.state.applicants });
                })
            });
        });
        this.appRefer = firebase.database().ref().child('job-applicants/' + this.props.params.jobId)
        this.appRefer.on("child_changed", snapApp => {
            console.log('test',snapApp.ref.key)
            if (snapApp.val().status == 'rejected' || snapApp.val().status == 'shot-listed') {
                var index = this.state.applicants.map(function (e) { return e.userId; }).indexOf(snapApp.ref.key);
                if (index >= 0) {
                    this.state.applicants[index].status = snapApp.val().status
                    this.setState({ applicants: this.state.applicants });

                }
            }
            this.setState({ applicants: this.state.applicants });
        });
    },

    componentWillUnmount: function () {
        this.companyRef.off();
    },

    handleRejectApplicant: function (userId) {
        console.log("reject",userId)
        var applicantUpdate = {};
        applicantUpdate['job-applicants/' + this.props.params.jobId + "/" + userId] = { status: "rejected" }
        firebase.database().ref().update(applicantUpdate);

        var applicantOtherUpdate = {};
        applicantOtherUpdate['job-application/' + userId + "/" + this.props.params.jobId] = { status: "rejected" }
        firebase.database().ref().update(applicantOtherUpdate);
        console.log("reject",applicantUpdate,applicantOtherUpdate)

    },


    handleAcceptApplicant: function (userId) {
        console.log("accept",userId)
        var applicantUpdate = {};
        applicantUpdate['job-applicants/' + this.props.params.jobId + "/" + userId] = { status: "shot-listed" }
        firebase.database().ref().update(applicantUpdate);

        var applicantOtherUpdate = {};
        applicantOtherUpdate['job-application/' + userId + "/" + this.props.params.jobId] = { status: "shot-listed" }
        firebase.database().ref().update(applicantOtherUpdate);
        console.log("accept",applicantUpdate,applicantOtherUpdate)

    },
    render: function () {
        var showApplicants;
        if (this.state.applicants.length == 0) {
            showApplicants = <div><center>No applicants!</center></div>
        } else {
            showApplicants =
                this.state.applicants.map((each, index) => (
                    <div key={index}>

                        <div className="box">
                            <div className="circle">{each.jobdetails.position.charAt(0).toUpperCase() + name.slice(1)}</div>
                            <div style={{ fontSize: '20px' }} className="marker">{each.jobdetails.position}</div>
                            <div className="marker"><p>Applicant Name:{each.userDetails.first + " " + each.userDetails.last}</p> </div>
                            <div className="marker"><i className="fas fa-dollar-sign"></i><p>Applicant Email:{each.userDetails.email}</p> </div>
                            <div className="marker"><i className="far fa-clock"></i><p>Skills:{each.userDetails.skills}</p> </div>
                            {(each.status == 'applied')?<div><button className='btn btn-primary' onClick={this.handleAcceptApplicant.bind(null,each.userId)}>Short list</button>
                            <button className='btn btn-danger' onClick={this.handleRejectApplicant.bind(null,each.userId)}>Reject</button></div>
                            :<button className='btn btn-danger' disabled>{each.status}</button>}
                        </div>
                    </div>
                ))
        }

        return (
            <div className="grid-item-job">
                <center><h1 className="grid-title">Applicants</h1></center>
                {showApplicants}
            </div>
        );
    }
});

module.exports = Applicants;