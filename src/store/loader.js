export default ({
  state: {
    isLoading: false,
    loading  : 0
  },

  getters: {
    isLoading: state =>
    {
      return state.isLoading
    },
  },

  mutations: {
    showLoading(state)
    {
      state.isLoading = true
      state.loading++
    },
    hideLoading(state)
    {
      state.loading--
      state.isLoading = state.loading > 0
    },

  }
})

