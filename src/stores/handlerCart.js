import { defineStore, storeToRefs } from 'pinia'
import { useCommonStore } from './common'
import { useProductsStore } from './products'
import { useCartStore } from './cart'
import { useInfoStore } from './info'

export const useHandlerCartStore = defineStore('handlerCart', () => {
  // store ==================================================
  const { site, user_account, userInfo, getSite, get_user_account, getStore, 
          getCategories, getUserInfo } = storeToRefs(useCommonStore())
  const { getProducts } = storeToRefs(useProductsStore())
  const { bonus_array, total_bonus } = storeToRefs(useCartStore())
  const { info } = storeToRefs(useInfoStore())

  // state ==================================================
  const state = reactive({
    
  })


  // watch ==================================================
  // cart info
  // total_bonus userInfo
  watch(() => userInfo, (newV, oldV) => {
    console.log('watch: userInfo', newV, oldV)
    if(!newV.Phone && !newV.Email) {
      user_account = '';
      set_user_account();
    }
  }, {deep: true})
  watch(() => userInfo.Wallet, (newV, oldV) => {
    console.log('watch: userInfo.Wallet', newV, oldV)
    total_bonus = newV * 1
  })

  // computed ==================================================
  // common info
  // userInfo, info, has_address
  const receiver_address = computed(() => {
    let address = `${info.address.city_active} ${info.address.district_active} ${info.address.detail_address}`
    if(userInfo.address_obj){
      has_address = false;
      for(let key in userInfo.address_obj) {
        let item = userInfo.address_obj[key];
        if(item.address == address){
          has_address = true;
        }
      }
    }
    return address;
  })

  // methods ==================================================
  const methods = reactive({
    // common cart
    // login, showMessage, discount
    async discountHandler() {
      let res = await discount()
      if(res.message === 'login') {
        await login();
        methods.discountHandler()
        return
      }

      showMessage(res.message, res.isSuccess);
    },
    // common cart info filters
    // login, useCodeSuccess, is_use_bonus, use_bonus, createCartStrObj, getTotal, transport, numberThousands
    async getTotalHandler(isStepTwo) {
      let o = methods.createCartStrObj();
      if(!o.id && !o.specificationid) return

      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      const params = `id=${o.id}&qry=${o.qry}&additionalid=${o.additionalid}&additionalqry=${o.additionalqry}&specificationid=${o.specificationid}&specificationqty=${o.specificationqty}&code=${useCodeSuccess}&shipping=${transport == 0 ? 0 : transport * 1 + 1}&type=${isStepTwo ? 1 : 0}&Preview=${site.Preview}&memberWallet=${is_use_bonus ? use_bonus : 0}`;

      let res = await getTotal(params)
      if(res.message === 'login') {
        await login();
        methods.getTotalHandler()
        return
      }
    },
    // getTotal, createOrder
    createCartStrObj() {
      let o = {
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
              o.specificationid += (o.specificationid ? ',' : '') + spec.ID
              o.specificationqty += (o.specificationqty ? ',' : '') + spec.buyQty
              o.ItemName +=  (o.ItemName ? '#' : '') + `${cartItem.Name} (${spec.Name}) NT$${nowPriceStr} x ${spec.buyQty}`
            }
          })
        }
        // 沒規格
        else {
          o.id += (o.id ? ',' : '') + cartItem.ID
          o.price += (o.price ? ',' : '') + cartItem.NowPrice
          o.qry += (o.qry ? ',' : '') + cartItem.buyQty
          o.ItemName += (o.ItemName ? '#' : '') + + `${cartItem.Name} NT$${nowPriceStr} x ${cartItem.buyQty}`
        }
        
        // 加價購
        if(cartItem.addPrice){
          cartItem.addPrice.forEach(addPriceItem => {
            let addPriceStr = numberThousands(addPriceItem.Price);

            // 有規格
            if(addPriceItem.specArr) {
              addPriceItem.specArr.forEach(addPriceSpec => {
                if(addPriceSpec.buyQty) {
                  o.specificationid += (o.specificationid ? ',' : '') + addPriceSpec.ID
                  o.specificationqty += (o.specificationqty ? ',' : '') + addPriceSpec.buyQty                
                  o.ItemName +=  (o.ItemName ? '#' : '') + + `加價購 ${addPriceItem.Name} (${addPriceSpec.Name}) NT$${addPriceStr} x ${addPriceSpec.buyQty}`
                }
              })
            }
            // 沒規格
            else {
              if(addPriceItem.buyQty != 0){
                o.additionalid += (o.additionalid ? ',' : '') + addPriceItem.ID
                o.additionalprice += (o.additionalprice ? ',' : '') + addPriceItem.Price
                o.additionalqry += (o.additionalqry ? ',' : '') + addPriceItem.buyQty              
                o.ItemName +=  (o.ItemName ? '#' : '') + `加價購 ${addPriceItem.Name} NT$${addPriceStr} x ${addPriceItem.buyQty}` 
              }
            }
          })
        }
      })
      return o;
    },

    // currentPage
    // common cart info verify product
    // site, store, userInfo, protocol, api, showPage, isConfirmToPay, isConfirmIsRegister, isConfirmATM, getCategories
    // showMessage, urlPush, discountCode, useCodeSuccess, use_bonus, member_bonus, is_click_finish_order, isOrderIng, total
    // isConfirmDiscountCodeUsed, use_bonus_handler, createOrder, ECPay_form, payResult, bank
    // info, info_message, is_save_address, has_address, transport, pay_method, invoice_type, invoice_title, invoice_uniNumber, verify
    // getProducts productCompleted currentPage
    async checkOrder() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      if(site.Preview == 2) {
        showMessage( '預覽模式不開放完成訂單', false);
        return;
      }
      if(isOrderIng) return;
      
      is_click_finish_order = true;

      let verify_arr = [info.purchaser_email, info.purchaser_name, info.purchaser_number, 
                        info.receiver_name, info.receiver_number]
      if(transport == 1) verify_arr.push(info.address)

      let v = verify(...verify_arr)
      if(v) {
        if (transport !== '0' && 
            pay_method !== '0' &&
            (
              (store.Receipt === '0') || 
              (invoice_type === '1' || 
                (invoice_type==='2' && invoice_title !== '' && invoice_uniNumber !== '')
              )
            )
          ) {
          await use_bonus_handler();
          createOrder();
        }
      }
    },
    async cancelDiscountCodeCreateOrder() {
      discountCode = '';
      useCodeSuccess = '';
      await methods.getTotalHandler(1)
      isConfirmDiscountCodeUsed = false;
      methods.createOrder();
    },
    async createOrder() {
      isOrderIng = true;

      let cartStrObj = methods.createCartStrObj();

      let id = new Date().getTime();
      let saveAddressStr = '';
      if(userInfo.address_obj && Object.keys(userInfo.address_obj).length < 3 && !has_address && is_save_address) {
        saveAddressStr = `${id}_ _${receiver_address.value.replace(/ /g, '_ _')}`
      }
      let formDataObj = {
        // 商店
        'Site': site.Site,
        'StoreName': site.Name,
        'productName': store.Name,
        'LogoUrl': protocol + '//' + api + store.PayLogo,
        'Preview': site.Preview,

        // 商品
        'ProductIdList': cartStrObj.id,
        'PriceList': cartStrObj.price,
        'AmountList': cartStrObj.qry,
        'ExtraProductIdList': cartStrObj.additionalid,
        'ExtraPriceList': cartStrObj.additionalprice,
        'ExtraAmountList': cartStrObj.additionalqry,
        'SizeIdList': cartStrObj.specificationid,
        'SizeAmountList': cartStrObj.specificationqty,
        'ItemName': cartStrObj.ItemName,

        // 折扣碼
        'DiscountCode': useCodeSuccess,
  
        // 購買人
        'Email': info.purchaser_email.value,
        'Name': info.purchaser_name.value,
        'Phone': info.purchaser_number.value,
        'Receiver': info.receiver_name.value,
        'ReceiverPhone': info.receiver_number.value,
        'Address': receiver_address.value,
        saveAddressStr,
        'Message': info_message,
        'Type': invoice_type * 1,
        'Title': invoice_title,
        'UniNumber': invoice_uniNumber,

        // 運送方式 支付方式
        'SendWay': transport * 1,
        'PayMethod': pay_method,
        'PayType': store[pay_method],

        // 金額
        'Discount': total.Discount * 1,
        'DiscountPrice': total.DiscountCode*1,
        'Shipping': total.Shipping * 1,
        'Total': total.Sum * 1,
        
        // 購物金
        'MemberWallet': use_bonus,
        'MemberBonus': member_bonus.value,
      }
      let formData = new FormData();
      for(let key in formDataObj) formData.append(key, formDataObj[key])

      try {
        let res = await createOrderApi(formData)
        if(res.data.errormessage) {
          await login()
          methods.createOrder()
          return
        }
        if(!res.data.success) {
          if(res.data.message.indexOf('已使用過折扣碼') > -1) {
            isOrderIng = false;
            isConfirmDiscountCodeUsed = true;
            return;
          }
  
          if(res.data.message.indexOf('數量不足') > -1) {
            methods.clearCart();
          }
          if(res.data.message.indexOf('購物金不足') > -1) {
            await getUserInfo(user_account);
            use_bonus = 0;
            methods.getTotalHandler(1);
          }
  
          isOrderIng = false;
          showMessage(res.data.message, false)
        }
        else {
          isOrderIng = false;
  
          payResult = res.data;
  
          // 沒有開啟會員功能
          if(!parseInt(site.MemberFuction)) isConfirmToPay = true;
          else {
            // 沒有登入
            if(!user_account) {
              let hasAcount = await methods.checkAccount();
              if(hasAcount) isConfirmToPay = true; 
              else isConfirmIsRegister = true;
            }
            // 登入
            else {
              isConfirmToPay = true;
              getUserInfo(user_account)
            }
          }
  
          methods.clearCart();
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    async checkAccount() {
      let formDataObj = {
        "storeid": site.Name,
        "type": store.NotificationSystem,
        "phone": info.purchaser_number.value,
        "email": info.purchaser_email.value,
        "name": '',
        "validate": '',
        "validate2": '',
        "password": '',
        "birthday": '',
        "gender": 0,
        "recommender": '',
      }
      let formData = new FormData();
      for(let key in formDataObj) formData.append(key, formDataObj[key])

      try {
        let res = await registerApi(formData)
        if(res.data.errormessage) {
          await login();
          methods.checkAccount()
          return
        }
  
        return res.data.msg.indexOf('已註冊') > -1
      } catch (error) {
        throw new Error(error)
      }
    },
    toPay() {
      isConfirmToPay = false;

      // LinePay
      if(pay_method == 'LinePay'){
        urlPush(payResult.payUrl)
      }
      // company account
      else if(pay_method == 'ATM' && store.ATM == 1){
        bank = require('../assets/bank.json');
        isConfirmATM = true;
      }
      else if(state.pay_method == 'PayOnDelivery') {

      }
      // ecpay
      else {
        if(api.indexOf('demo.uniqcarttest') > -1){
          ECPay_form = `<form id="ECPay_form" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        } else {
          ECPay_form = `<form id="ECPay_form" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        }
        for(let item in payResult){
          if(item === 'success' || item === 'message' || item === 'membered') continue
          // EncryptType, TotalAmount, ExpireDate: number，other: string
          ECPay_form += `<input type="${item == 'EncryptType' || item == 'TotalAmount' || item == 'ExpireDate' ? 'number' : 'text'}" name="${item}" value="${payResult[item]}">`;
        }
        ECPay_form += `</form>`;

        setTimeout(()=> {
          let ECPay_form = document.querySelector('#ECPay_form');
          ECPay_form.submit();
        }, 1000)
      }
    },
    clearCart() {
      cart = [];
      setCart();
  
      discountCode = '';
      useCodeSuccess = '';

      is_use_bonus = false;
      use_bonus = 0;

      productCompleted = false;
      showPage = 'main'
      
      getCategories();
      getProducts();
      currentPage = 1;
    }
  })

  return {
    ...toRefs(state),

    ...toRefs(methods)
  }
})