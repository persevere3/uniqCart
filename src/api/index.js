import axios from 'axios';

let baseURL = process.env.NODE_ENV === 'development' ? '/api' : ""
let withCredentials = true

const formRequest = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  withCredentials,
})

const formDataRequest = axios.create({
  baseURL,
  headers: { 'Content-Type': 'multipart/form-data' },
  withCredentials,
})

export const loginApi = data => formRequest.post('/interface/store/UserLogin', data);
export const getSiteApi = () => formRequest.get('/interface/store/GetSite');
export const getGAApi = data => formDataRequest.post('/interface/web/getStore', data);
export const getStoreApi = data => formRequest.post('/interface/store/getStore', data);
export const getCategoriesApi = data => formRequest.post('/interface/store/GetCategory', data);
export const getProductsApi = data => formRequest.post('/interface/store/storeLogin', data);
export const getUserInfoApi = data => formDataRequest.post('/interface/WebMember/GetMemberInfo', data);
export const getAddPriceApi = data => formRequest.post('/interface/store/GetAdditional', data);
export const getFavoriteApi = data => formDataRequest.post('/interface/WebMember/FavoriteInfo', data);
export const deleteFavoriteApi = data => formDataRequest.post('/interface/WebMember/DeleteFavorite', data);
export const addFavoriteApi = data => formDataRequest.post('/interface/WebMember/AddFavorite', data);
export const discountApi = data => formRequest.post('/interface/store/CheckDiscountCode', data);
export const getTotalApi = data => formRequest.post('/interface/store/GetProductTotal', data);
export const send_verify_codeApi = data => formDataRequest.post('/interface/WebMember/SendValidateMessage', data);
export const registerApi = data => formDataRequest.post('/interface/WebMember/MemberRegister', data);
export const createOrderApi = data => formDataRequest.post('/LineMK/Line/OrderPayRequest', data);
export const getAmountApi = data => formDataRequest.post('/interface/store/GetProductQty', data);