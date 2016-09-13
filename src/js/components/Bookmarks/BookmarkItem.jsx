import React, { Component, PropTypes } from "react";
import { Link } from "react-router";
import StarAction from "../Widgets/StarAction";

export default class Bookmarks extends Component {
  static propTypes = {
    bookmark: PropTypes.object.isRequired,
  };

  render () {
    const {kind_of_ballot_item, we_vote_id, ballot_item_display_name } = this.props.bookmark;
    let link;
    if (kind_of_ballot_item === "CANDIDATE"){
      link = "/candidate/" + we_vote_id;
    } else if (kind_of_ballot_item === "OFFICE"){
      link = "/office/" + we_vote_id;
    } else {
      link = "/measure/" + we_vote_id;
    }
    return <div className="position-item card-child">
      <StarAction we_vote_id={we_vote_id} type={kind_of_ballot_item}/>
      <Link className="linkLight"
            to={link}
            onlyActiveOnIndex={false}>
        <div>
          {ballot_item_display_name}
        </div>
      </Link>
    </div>;
  }
}
