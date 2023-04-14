import axios from 'axios';

const cartRequest = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : "",
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  withCredentials: true
})

const cartRequestFormData = axios.create({
  baseURL: process.env.NODE_ENV === 'development' ? '/api' : "",
  headers: { 'Content-Type': 'multipart/form-data' },
  withCredentials: true
})

export const loginApi = data => cartRequest.post('/interface/store/UserLogin', data);
export const getSiteApi = () => cartRequest.get('/interface/store/GetSite');
export const getStoreApi = data => cartRequest.post('/interface/store/getStore', data);
export const getCategoriesApi = data => cartRequest.post('/interface/store/GetCategory', data);
export const getProductsApi = data => cartRequest.post('/interface/store/storeLogin', data);
export const getUserInfoApi = data => cartRequestFormData.post('/interface/WebMember/GetMemberInfo', data);
export const getAddPriceApi = data => cartRequest.post('/interface/store/GetAdditional', data);
export const getFavoriteApi = data => cartRequestFormData.post('/interface/WebMember/FavoriteInfo', data);
export const deleteFavoriteApi = data => cartRequestFormData.post('/interface/WebMember/DeleteFavorite', data);
export const addFavoriteApi = data => cartRequestFormData.post('/interface/WebMember/AddFavorite', data);
export const discountApi = data => cartRequest.post('/interface/store/CheckDiscountCode', data);
export const getTotalApi = data => cartRequest.post('/interface/store/GetProductTotal', data);
export const send_verify_codeApi = data => cartRequestFormData.post('/interface/WebMember/SendValidateMessage', data);
export const registerApi = data => cartRequestFormData.post('/interface/WebMember/MemberRegister', data);
export const createOrderApi = data => cartRequestFormData.post('/LineMK/Line/OrderPayRequest', data);
export const getAmountApi = data => cartRequestFormData.post('/interface/store/GetProductQty', data);