// mockReducers.js
const mockInitialState = {
  auth: {
    currentUser: null,
  },
};

const mockRootReducer = (state = mockInitialState, action) => {
  switch (action.type) {
    default:
      return state;
  }
};

export default mockRootReducer;
