import { getTotalApi, discountApi } from '@/api/index'

export const useCart = defineStore('cart', () => {
  // state ==================================================
  const state = reactive({
    cart: [],
    cartLength: 0,
    cartOLength: 0,

    stepPage: 1,

    total: {},

    discountCode: '',
    useCodeSuccess: '',
    discountErrorMessage: '',

    bonus_array: [],
    total_bonus: 0,
    is_use_bonus: false,
    use_bonus: 0,

    is_click_finish_order: false, // true => 驗證 運送方式 支付方式 地址
    isOrderIng: false,

    isConfirmDiscountCodeUsed: false,

    payResult: {},
    bank: '',
    ECPay_form: '',
  })

  // computed ==================================================
  const bonus_percent = computed(() => {
    for(let item of state.bonus_array) {
      if((parseInt(state.total.Sum) - parseInt(state.total.Shipping)) >= item.lower) {
        return item.shipping;
      }
    }
    return 0
  })
  const member_bonus = computed(() => {
    return Math.floor((state.total.Sum - state.total.Shipping) * (bonus_percent.value / 100))
  })

  // methods ==================================================
  const methods = reactive({
    getCart() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let user_account = localStorage.getItem('user_account')
      if(user_account) state.cart = JSON.parse(localStorage.getItem(`${site.Name}@${user_account}@cart`)) || [];
      else state.cart = JSON.parse(localStorage.getItem(`${site.Name}@cart`)) || [];

      methods.computedCartLength();
      state.cartOLength = state.cartLength;
    },
    setCart() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let user_account = localStorage.getItem('user_account')
      let key = user_account ? `${site.Name}@${user_account}@cart` : `${site.Name}@cart`
      localStorage.setItem(key, JSON.stringify(state.cart));
      methods.computedCartLength();
    },
    computedCartLength() {
      let cartLength = 0;

      state.cart.forEach(cartItem => {
        // 有規格
        if(cartItem.specArr) {
          cartLength += cartItem.specArr.filter(spec => spec.buyQty > 0).length
        }
        // 沒規格
        else {
          cartLength += 1
        }

        // 加價購
        if(cartItem.addPrice) {
          cartItem.addPrice.forEach(addPriceItem => {
            // 有規格
            if(addPriceItem.specArr) {
              cartLength += addPriceItem.specArr.filter(spec => spec.buyQty > 0).length
            }
            // 沒規格
            else {
              if(addPriceItem.buyQty > 0) cartLength += 1;
            }
          })
        }
      })

      state.cartLength = cartLength
    },

    // 取得 金額, 折扣, 運費, 總計 
    // return {isSuccess, message}
    async getTotal(params) {
      console.log('getTotal')
      try {
        let res = await getTotalApi(params)
        if(res.data.errormessage) return {isSuccess: false, message: 'login'}

        state.total = res.data.data[0];
        return {isSuccess: true, message: ''}
      } catch (error) {
        throw new Error(error)
      }
    },

    // return {isSuccess, message}
    async discount() {
      if(!state.discountCode){
        state.discountErrorMessage = '請輸入折扣碼';
        return;
      }
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      const params = `code=${state.discountCode}&Preview=${site.Preview}`;
      try {
        let res = await discountApi(params)
        if(res.data.errormessage) return {isSuccess: false, message: 'login'}

        let status = res.data.data[0].status;
        if(status === '1'){
          state.useCodeSuccess = state.discountCode;
          state.discountErrorMessage = '';
          methods.getTotal(0);
          return {isSuccess: true, message: '套用優惠碼成功'}
        }
        else {
          state.discountCode = '';
          state.useCodeSuccess = '';
          if(status === '0') state.discountErrorMessage = '查無此折扣碼' 
          else if (status === '2') state.discountErrorMessage = '折扣碼已用完'
          methods.getTotal(0);
          return {isSuccess: false, message: state.discountErrorMessage}
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    unDiscount(){
      state.discountCode = '';
      state.useCodeSuccess = '';
      methods.getTotal(0);
    },

    //
    async use_bonus_handler(notGetTotal) {
      let user_account = localStorage.getItem('user_account')
      if(!user_account) {
        state.is_use_bonus = false;
        state.use_bonus = 0;
        return
      }
      
      if(state.use_bonus > 0) {
        let use_bonus_max = Math.min(state.total_bonus * 1, state.total.Total * 1 - state.total.Discount * 1 - state.total.DiscountCode * 1)
        if(state.use_bonus > use_bonus_max) state.use_bonus = use_bonus_max
      }
      if(notGetTotal) return
      await methods.getTotal(1)
    },

    // 其他主商品下 此加價購商品的購買數量 總和
    othersAddPriceBuyQty(id, item, spec) {
      let filterCart = state.cart.filter(cartItem => cartItem.ID != id && cartItem.addPrice && cartItem.addPrice.length > 0)
      return filterCart.reduce((accumulator, cartItem) => {
        let addPriceItem = cartItem.addPrice.find(addPriceItem => addPriceItem.ID == item.ID)
        if(addPriceItem) {
          if(spec){
            let addPriceItemSpec = addPriceItem.specArr.find(addPriceItemSpec => addPriceItemSpec.ID == spec.ID)
            if(addPriceItemSpec) return addPriceItemSpec.buyQty * 1
          }
          else return accumulator + addPriceItem.buyQty
        }
      }, 0)
    },
  })

  return {
    ...toRefs(state),

    member_bonus,

    ...toRefs(methods),
  }
}) 