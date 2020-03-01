import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.min.css";

const notifySuccess = message => toast.success(message);
const notifyError = message => toast.error(message);

export { notifySuccess, notifyError };
