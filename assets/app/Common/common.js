import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const notifySuccess = message => toast.success(message,{autoClose:5000, hideProgressBar:false});
const notifyError = message => toast.error(message,{autoClose:5000,hideProgressBar:false});

export { notifySuccess, notifyError };
