// eslint-disable-next-line no-unused-vars

export default ({
    state: {
        info: null,
    },
    getters: {
        info: state => {
            state.info = state.info ?? (window.localStorage.getItem('info') ? JSON.parse(window.localStorage.getItem('info')) : null);
            return state.info
        },
    },

    mutations: {
        info: (state, data) => {
            if (data.action == 'refresh') {
                window.localStorage.setItem('info', JSON.stringify(data.data));
                state.info = data.data
            }
        },
    }
})

