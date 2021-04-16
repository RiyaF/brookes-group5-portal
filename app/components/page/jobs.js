var React = require('react');
var firebase = require('firebase');
var Link = require('react-router').Link;
var hashHistory = require('react-router').hashHistory;

var Jobs = React.createClass({
    getInitialState: function () {
        return {
            currentUserID: this.props.params.id,
            type: null,
            jobs: []
        }
    },

    componentWillMount: function () {
        this.userRef = firebase.database().ref().child('users/' + this.props.params.id);
        this.userRef.once("value", userSnap => {
            this.setState({ type: userSnap.val().type });
            if (userSnap.val().type == 'student' || userSnap.val().type == 'admin') {
                this.jobRef = firebase.database().ref().child('user-joblisting').orderByChild('status').equalTo('approved');
                this.jobRef.on("child_added", snap => {
                    let job = snap.val();
                    this.appRef = firebase.database().ref().child('job-application/' + this.props.params.id + "/" + snap.ref.key)
                    this.appRef.once("value", snapApp => {
                        job.id = snap.ref.key;
                        if (snapApp.val() && snapApp.val().status) {
                            job.user_status = snapApp.val().status;
                        }
                        else {
                            job.user_status = null
                        }
                        this.state.jobs.push(job);
                        this.setState({ jobs: this.state.jobs });
                        console.log(this.state.jobs)

                    })
                });
                this.appRefer = firebase.database().ref().child('job-application/' + this.props.params.id)
                this.appRefer.on("child_added", snapApp => {
                    if (snapApp.val().status == 'applied') {
                        var index = this.state.jobs.map(function (e) { return e.id; }).indexOf(snapApp.key);
                        if (index >= 0) {
                            this.state.jobs[index].user_status = 'applied'
                            this.setState({ jobs: this.state.jobs });
                            console.log(this.state.jobs)

                        }
                    }
                    this.setState({ jobs: this.state.jobs });
                });
            } else if (this.state.type = "organisation") {
                console.log("workingorg")
                this.jobRef = firebase.database().ref().child('user-joblisting').orderByChild('user_id').equalTo(this.props.params.id);
                this.jobRef.on("child_added", snap => {
                    let job = snap.val();
                    this.appRef = firebase.database().ref().child('job-application/' + this.props.params.id + "/" + snap.ref.key)
                    this.appRef.once("value", snapApp => {
                        job.id = snap.ref.key;
                        if (snapApp.val() && snapApp.val().status) {
                            job.user_status = snapApp.val().status;
                        }
                        else {
                            job.user_status = null
                        }
                        this.state.jobs.push(job);
                        this.setState({ jobs: this.state.jobs });
                        console.log(this.state.jobs)

                    })
                });
            }
        });
    },

    componentWillUnmount: function () {
        this.jobRef.off();
    },
    applyJob: function (id) {
        var connectionUpdate = firebase.database().ref().child('job-application/' + this.props.params.id + "/" + id);
        connectionUpdate.update({
            status: "applied"
        });
        var connectionUpdate2 = firebase.database().ref().child('job-applicants/' + id + "/" + this.props.params.id);
        connectionUpdate2.update({
            status: "applied"
        });
    },
    render: function () {
        var showJobs;
        if (this.state.jobs.length == 0) {
            showJobs = <div><center>We currently have no Jobs!</center></div>
        } else {
            showJobs =
                this.state.jobs.map((job, index) => (
                    <div key={index}>

                        <div className="box">
                            <div className="circle">{job.position.charAt(0).toUpperCase() + name.slice(1)}</div>
                            <div style={{ fontSize: '20px' }} className="marker">{job.position}</div>
                            <div className="marker" > <span className='	glyphicon glyphicon-map-marker' title="Jobs"></span><p>{job.location}</p> </div>
                            <div className="marker"> <i className="fas fa-dollar-sign"></i><p>£{job.payrate}/pm</p> </div>
                            <div className="marker"><i className="far fa-clock"></i><p>{job.employmentType}</p> </div>
                            <div> </div> <div></div>
                                <div className="marker"><i className="far fa-clock"></i><p>{job.experienceLevel}</p> </div>
                               <div></div>
                                <div>{(this.state.type == 'student' && job.user_status == 'applied') ? <button style={{ float: 'right' }} className='btn btn-primary' disabled >Applied</button>
                                    : (this.state.type != 'student') ? <div><button style={{ float: 'right' }} className='btn btn-primary' disabled >{job.status}</button><Link to={"applicants/" + job.id}>view applicants</Link></div> :
                                        (job.user_status == 'rejected' || job.user_status == 'shot-listed') ? <button style={{ float: 'right' }} className='btn btn-primary' disabled >{job.user_status}</button>
                                            : <button style={{ float: 'right' }} className='btn btn-primary' onClick={this.applyJob.bind(null, job.id)} >Apply Now</button>
                                }</div>
                            
                        </div>

                        {/* <h3 style={{ float: 'left', width: '20%' }}>{job.position}</h3>
                        <h5 style={{ float: 'left', width: '20%' }}>{job.description}</h5>
                        <h5 style={{ textAlign: 'center' }}>{job.location}</h5>
                        <h5 style={{ textAlign: 'center' }}>{job.employmentType}</h5>
                        <h5 style={{ textAlign: 'center' }}>{job.experienceLevel}</h5>
                        {(job.status == 'applied') ? <button className='btn btn-primary' disabled style={{ float: 'right', width: '20%' }}>Applied</button>
                            : <button className='btn btn-primary' onClick={this.applyJob.bind(null, job.id)} style={{ float: 'right', width: '20%' }}>Apply Now</button>} */}
                        {/* <Link to={"users/" + user.user_id}><h4><img src={user.imageURL} className="grid-img img-circle" alt="" width="150" height="150" style={{ objectFit: 'cover' }} /><br />
                                {user.first + " " + user.last}</h4></Link>
                            <br /><br /> */}
                    </div>
                ))
        }

        return (
            <div className="grid-item-job">
                <center><h1 className="grid-title">Jobs</h1></center>
                {showJobs}
            </div>
        );
    }
});

module.exports = Jobs;

