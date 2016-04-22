var Dispatcher = require("../dispatcher/Dispatcher");
var FluxMapStore = require("flux/lib/FluxMapStore");

class StarStore extends FluxMapStore {

  reduce (state, action) {

    if (typeof action.res === "undefined" ||
        action.res.success === false) {
      console.log(action);
      return state;
    }

    var key = action.res.ballot_item_we_vote_id;

    switch (action.type) {

      case "voterAllStarsStatusRetrieve":
        let newState = {};
        action.res.star_list.forEach(el =>{
          newState[el.ballot_item_we_vote_id] = el.star_on;
        });
        return state.merge(newState);

      case "voterStarOnSave":
        return state.set(key, true);

      case "voterStarOffSave":
        return state.set(key, false);

      case "error-StarRetrieve" || "error-voterStarOnSave" || "error-voterStarOnSave":
        console.log(action.res);
        return state;

      default:
        return state;
    }

  }

}

module.exports = new StarStore(Dispatcher);
