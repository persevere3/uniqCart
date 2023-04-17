import { getTotalApi, discountApi } from '@/api/index'

import { useAll }  from '@/stores/all'

export const useCart = defineStore('cart', () => {
  // store ==================================================
  let { site, user_account } = storeToRefs(useAll())
  let { login, showMessage } = useAll()

  // state ==================================================
  const state = reactive({
    cart: [],
    cartLength: 0,
    cartOLength: 0,

    stepPage: 1,

    discountCode: '',
    successUsedDiscountCode: '',
    discountErrorMessage: '',

    total: {},

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
  // 回饋%數
  const bonus_percent = computed(() => {
    let bonus_percent = 0
    for(let item of state.bonus_array) {
      if((parseInt(state.total.Sum) - parseInt(state.total.Shipping)) >= item.lower) {
        bonus_percent = item.shipping;
      }
    }
    return bonus_percent
  })
  // 消費回饋
  const member_bonus = computed(() => {
    return Math.floor((state.total.Sum - state.total.Shipping) * (bonus_percent.value / 100))
  })

  // methods ==================================================
  const methods = {
    getCart() {
      if(user_account.value) state.cart = JSON.parse(localStorage.getItem(`${site.value.Name}@${user_account.value}@cart`)) || [];
      else state.cart = JSON.parse(localStorage.getItem(`${site.value.Name}@cart`)) || [];

      methods.computedCartLength();
      state.cartOLength = state.cartLength;
    },
    setCart() {
      let key = user_account.value ? `${site.value.Name}@${user_account.value}@cart` : `${site.value.Name}@cart`
      localStorage.setItem(key, JSON.stringify(state.cart));
      methods.computedCartLength();
    },
    computedCartLength() {
      let cartLength = 0;

      state.cart.forEach(cartItem => {
        // 有規格
        if(cartItem.specArr) cartLength += cartItem.specArr.filter(spec => spec.buyQty > 0).length
        // 沒規格
        else cartLength += 1

        // 加價購
        if(cartItem.addPrice) {
          cartItem.addPrice.forEach(addPriceItem => {
            // 有規格
            if(addPriceItem.specArr) cartLength += addPriceItem.specArr.filter(spec => spec.buyQty > 0).length
            // 沒規格
            else if(addPriceItem.buyQty > 0) cartLength += 1;
          })
        }
      })

      state.cartLength = cartLength
    },

    // 取得 金額, 折扣, 運費, 總計 
    async getTotal(params) {
      console.log('getTotal')
      try {
        let res = await getTotalApi(params)
        if(res.data.errormessage) {
          await login();
          methods.getTotal(params)
          return
        }

        state.total = res.data.data[0];
      } catch (error) {
        throw new Error(error)
      }
    },

    async discount() {
      if(!state.discountCode) {
        state.discountErrorMessage = '請輸入折扣碼';
        return;
      }
      const params = `code=${state.discountCode}&Preview=${site.value.Preview}`;
      try {
        let res = await discountApi(params)
        if(res.data.errormessage) {
          await login();
          methods.discount()
          return
        }

        let status = res.data.data[0].status;
        if(status === '1') {
          state.successUsedDiscountCode = state.discountCode;
          state.discountErrorMessage = '';
          showMessage('套用優惠碼成功', true);
        }
        else {
          state.discountCode = '';
          state.successUsedDiscountCode = '';
          if(status === '0') state.discountErrorMessage = '查無此折扣碼' 
          else if (status === '2') state.discountErrorMessage = '折扣碼已用完'
          showMessage(state.discountErrorMessage, false);
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    unDiscount(){
      state.discountCode = '';
      state.successUsedDiscountCode = '';
    },

    // 其他主商品下 此加價購商品的購買數量 總和
    othersAddPriceBuyQty(id, item, spec) {
      let filterCart = state.cart.filter(cartItem => cartItem.ID != id && cartItem.addPrice && cartItem.addPrice.length > 0)
      return filterCart.reduce((accumulator, cartItem) => {
        let addPriceItem = cartItem.addPrice.find(addPriceItem => addPriceItem.ID == item.ID)
        if(addPriceItem) {
          if(spec) {
            let addPriceItemSpec = addPriceItem.specArr.find(addPriceItemSpec => addPriceItemSpec.ID == spec.ID)
            if(addPriceItemSpec) return addPriceItemSpec.buyQty * 1
          }
          else return accumulator + addPriceItem.buyQty
        }
      }, 0)
    },
  }

  return {
    ...toRefs(state),

    member_bonus,

    ...methods
  }
}) 