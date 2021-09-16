export default ({
    state: {
        user: null,
        token: null,
        isLoggedIn: false,
        locale: 'en'
    },
    getters: {
        token: state => {
            state.token = state.token ?? window.localStorage.getItem('token');
            return state.token
        },
        user: state => {
            state.user = state.user ?? (window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : null);
            return state.user
        },
        locale: state => {
            if (!state.token) return window.localStorage.getItem('locale')
            let user = state.user ?? (window.localStorage.getItem('user') ? JSON.parse(window.localStorage.getItem('user')) : {locale: 'en'});
            return user.locale
        },
        isLoggedIn: state => {
            return !!state.token
        },
    },

    mutations: {
        token: (state, data) => {
            window.localStorage.setItem('token', data.token);
            state.token = data.token;
        },
        user: (state, data) => {
            window.localStorage.setItem('user', JSON.stringify(data.user));
            state.user = data.user;
        },
        locale: (state, data) => {
            window.localStorage.setItem('locale', data.locale);
            state.locale = data.locale;
        },
        logout: (state) => {
            window.localStorage.removeItem('user')
            window.localStorage.removeItem('token')
            state.user, state.token = ''
        },
    }
})

