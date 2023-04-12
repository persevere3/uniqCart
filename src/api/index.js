import axios from 'axios';

const cartRequest = axios.create({
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
})

const cartRequestFormData = axios.create({
  headers: { 'Content-Type': 'multipart/form-data' }
})

export const loginApi = data => cartRequest.post('/api/interface/store/UserLogin', data);
export const getSiteApi = () => cartRequest.get('/api/interface/store/GetSite');
export const getStoreApi = data => cartRequest.post('/api/interface/store/getStore', data);
export const getCategoriesApi = data => cartRequest.post('/api/interface/store/GetCategory', data);
export const getProductsApi = data => cartRequest.post('/api/interface/store/storeLogin', data);
export const getUserInfoApi = data => cartRequestFormData.post('/api/interface/WebMember/GetMemberInfo', data);
export const getAddPriceApi = data => cartRequest.post('/api/interface/store/GetAdditional', data);
export const getFavoriteApi = data => cartRequestFormData.post('/api/interface/WebMember/FavoriteInfo', data);
export const deleteFavoriteApi = data => cartRequestFormData.post('/api/interface/WebMember/DeleteFavorite', data);
export const addFavoriteApi = data => cartRequestFormData.post('/api/interface/WebMember/AddFavorite', data);
export const discountApi = data => cartRequest.post('/api/interface/store/CheckDiscountCode', data);
export const getTotalApi = data => cartRequest.post('/api/interface/store/GetProductTotal', data);
export const send_verify_codeApi = data => cartRequestFormData.post('/api/interface/WebMember/SendValidateMessage', data);
export const registerApi = data => cartRequestFormData.post('/api/interface/WebMember/MemberRegister', data);
export const createOrderApi = data => cartRequestFormData.post('/api/LineMK/Line/OrderPayRequest', data);
export const getAmountApi = data => cartRequestFormData.post('/api/interface/store/GetProductQty', data);