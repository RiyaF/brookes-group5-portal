var React = require("react");
var ReactDOM = require("react-dom");
var firebase = require("firebase");
var Link = require("react-router").Link;
var hashHistory = require("react-router").hashHistory;

var Search = React.createClass({
  handleSearch: function (e) {
    e.preventDefault();
    if (this.refs.search.value != "") {
      var path = "results/" + this.refs.search.value;
      hashHistory.push(path);
    }
  },

  handleAdvancedSearchForm: function () {
    hashHistory.push("/advanced");
  },

  componentWillMount: function () {
    this.setState({ type: this.props.type });
  },

  componentWillReceiveProps: function (nextProps) {
    this.setState({ type: nextProps.type });
  },

  render: function () {
    var advancedSearch;
    if (this.props.type == 'organisation') {
      advancedSearch = (
        <button
          className="btn btn-link"
          onClick={this.handleAdvancedSearchForm}
        >
          <Link style={{ color: "white" }} to="#">
            Advanced Search
          </Link>
        </button>
      );
    } else {
      advancedSearch = null;
    }

    return (
      <form className="navbar-form pull-left" onChange={this.handleSearch}>
        <div className="form-group">
          <input
            type="text"
            className="form-control navbar-search"
            ref="search"
            placeholder="Search..."
          />
        </div>
        {advancedSearch}
      </form>
    );
  },
});

module.exports = Search;
