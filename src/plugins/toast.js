import Vue     from 'vue'
import toast   from "vue-toastification";
import "@/assets/styles/toastification/index.scss";

const options = {
  transition: "Vue-Toastification__fade",
  maxToasts : 12,
};
export default Vue.use(toast,options);