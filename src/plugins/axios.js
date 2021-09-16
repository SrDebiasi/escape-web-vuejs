import Vue      from 'vue'
import VueAxios from "vue-axios";
import axios    from "axios";
import API_URL  from "../config";
import store    from "@/store";

Vue.use(VueAxios,axios);
Vue.prototype.$axios = axios;
axios.defaults.baseURL = API_URL;

axios.interceptors.request.use(function(request)
{
  //delete axios.defaults.headers.common['Authorization']
  axios.defaults.headers.common['Content-Type'] = 'application/json'
  if(store.getters.isLoggedIn)
    request.headers.common['Authorization'] = 'Bearer ' + store.getters.token;

  return request;
},function(error){ return Promise.reject(error); });

