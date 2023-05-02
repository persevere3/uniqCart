import { getTotalApi, discountApi } from '@/api/index'

import bank_json from '@/json/bank'

import { useCommon }  from '@/stores/common/common'

export const useCart = defineStore('cart', () => {
  // store ==================================================
  let { site, user_account } = storeToRefs(useCommon())
  let { login, showMessage } = useCommon()
  let { number, numberThousands } = useCommon()

  // state ==================================================
  const state = reactive({
    cart: [],
    cartLength: 0,
    cartOLength: 0,

    stepPage: 1,

    total: {},
    
    discountCode: '',
    successUsedDiscountCode: '',
    discountErrorMessage: '',

    // 運送方式
    transport: '0', // 1一般宅配 2到店自取 3 7-11
    // 支付方式, PayType: store[pay_method]
    pay_method: '0', // CreditCard ATM PayCode PayBarCode PayOnDelivery LinePay

    bonus_array: [],
    total_bonus: 0,
    is_use_bonus: false,
    use_bonus: 0,

    is_click_finish_order: false, // true => 驗證 運送方式 支付方式 地址
    isOrderIng: false,

    payResult: {},
    bank: bank_json,
    ECPay_form_value: '',
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
    getCart(selectProductID) {
      if(selectProductID) {
        state.cart = JSON.parse(localStorage.getItem(`${site.value.Name}@${selectProductID}@cart`)) || [];
      }
      else {
        if(user_account.value) state.cart = JSON.parse(localStorage.getItem(`${site.value.Name}@${user_account.value}@cart`)) || [];
        else state.cart = JSON.parse(localStorage.getItem(`${site.value.Name}@cart`)) || [];
      }

      methods.computedCartLength();
      state.cartOLength = state.cartLength;
    },
    setCart(selectProductID) {
      if(selectProductID) {
        localStorage.setItem(`${site.value.Name}@${selectProductID}@cart`, JSON.stringify(state.cart));
      }
      else {
        let key = user_account.value ? `${site.value.Name}@${user_account.value}@cart` : `${site.value.Name}@cart`
        localStorage.setItem(key, JSON.stringify(state.cart));
      }
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
    async getTotal(isStepTwo) {
      console.log('getTotal')

      let { id, qry, additionalid, additionalqry, specificationid, specificationqty } = methods.createCartStrObj();
      if(!id && !specificationid) return

      isStepTwo = isStepTwo ? 1 : 0

      let paramsObj = {
        id,
        qry,
        additionalid,
        additionalqry,
        specificationid,
        specificationqty,
        type: isStepTwo,
        code: state.successUsedDiscountCode,
        shipping: state.transport == 0 ? 0 : state.transport * 1 + 1,
        memberWallet: state.is_use_bonus ? state.use_bonus : 0, 
        Preview: site.value.Preview,
      }
      let params = ''
      for(let key in paramsObj) {
        let value = paramsObj[key]
        params += `${params ? '&' : ''}${key}=${value}`
      }

      try {
        let res = await getTotalApi(params)
        if(res.data.errormessage) {
          await login();
          methods.getTotal(isStepTwo)
          return
        }

        state.total = res.data.data[0];
      } catch (error) {
        throw new Error(error)
      }
    },
    createCartStrObj() {
      let cartStrObj = {
        'id': '',
        'price': '',
        'qry': '',

        'additionalid':'',
        'additionalprice':'',
        'additionalqry':'',

        'specificationid':'',
        'specificationqty':'',

        'ItemName': '',
      };
      state.cart.forEach(function(cartItem) {
        let nowPriceStr = numberThousands(cartItem.NowPrice);

        // 有規格
        if(cartItem.specArr) {
          cartItem.specArr.forEach(spec => {
            if(spec.buyQty != 0) {
              cartStrObj.specificationid += (cartStrObj.specificationid ? ',' : '') + spec.ID
              cartStrObj.specificationqty += (cartStrObj.specificationqty ? ',' : '') + spec.buyQty
              cartStrObj.ItemName +=  (cartStrObj.ItemName ? '#' : '') + `${cartItem.Name} (${spec.Name}) NT$${nowPriceStr} x ${spec.buyQty}`
            }
          })
        }
        // 沒規格
        else {
          cartStrObj.id += (cartStrObj.id ? ',' : '') + cartItem.ID
          cartStrObj.price += (cartStrObj.price ? ',' : '') + cartItem.NowPrice
          cartStrObj.qry += (cartStrObj.qry ? ',' : '') + cartItem.buyQty
          cartStrObj.ItemName += (cartStrObj.ItemName ? '#' : '') + + `${cartItem.Name} NT$${nowPriceStr} x ${cartItem.buyQty}`
        }
        
        // 加價購
        if(cartItem.addPrice) {
          cartItem.addPrice.forEach(addPriceItem => {
            let addPriceStr = numberThousands(addPriceItem.Price);

            // 有規格
            if(addPriceItem.specArr) {
              addPriceItem.specArr.forEach(addPriceSpec => {
                if(addPriceSpec.buyQty) {
                  cartStrObj.specificationid += (cartStrObj.specificationid ? ',' : '') + addPriceSpec.ID
                  cartStrObj.specificationqty += (cartStrObj.specificationqty ? ',' : '') + addPriceSpec.buyQty                
                  cartStrObj.ItemName +=  (cartStrObj.ItemName ? '#' : '') + + `加價購 ${addPriceItem.Name} (${addPriceSpec.Name}) NT$${addPriceStr} x ${addPriceSpec.buyQty}`
                }
              })
            }
            // 沒規格
            else {
              if(addPriceItem.buyQty != 0){
                cartStrObj.additionalid += (cartStrObj.additionalid ? ',' : '') + addPriceItem.ID
                cartStrObj.additionalprice += (cartStrObj.additionalprice ? ',' : '') + addPriceItem.Price
                cartStrObj.additionalqry += (cartStrObj.additionalqry ? ',' : '') + addPriceItem.buyQty              
                cartStrObj.ItemName +=  (cartStrObj.ItemName ? '#' : '') + `加價購 ${addPriceItem.Name} NT$${addPriceStr} x ${addPriceItem.buyQty}` 
              }
            }
          })
        }
      })
      return cartStrObj;
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
    unDiscount() {
      state.discountCode = '';
      state.successUsedDiscountCode = '';
    },

    // 
    async filter_use_bonus() {
      if(!user_account.value) {
        state.is_use_bonus = false;
        state.use_bonus = 0;
        return
      }

      state.use_bonus = number(state.use_bonus)
      
      if(state.use_bonus > 0) {
        let use_bonus_max = Math.min(state.total_bonus * 1, state.total.Total * 1 - state.total.Discount * 1 - state.total.DiscountCode * 1)
        if(state.use_bonus > use_bonus_max) state.use_bonus = use_bonus_max
      }

      await methods.getTotal(2)
    },

    // 其他主商品下 此加價購商品的購買數量 總和
    getOthersAddPriceBuyQty(id, item, spec) {
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