import { defineStore, storeToRefs } from 'pinia'
import { useCommon } from './common'
import { useProducts } from './products'
import { useCart } from './cart'
import { useVerify } from './verify'
import { useInfo } from './info'
import { useFilters } from './filters'
import { useHandlerProducts } from './handlerProducts'

import { createOrderApi, registerApi } from '@/api/index'

export const useHandlerCart = defineStore('handlerCart', () => {
  // store ==================================================
  let { site, store, user_account, showPage, 
    isConfirmDiscountCodeUsed, isConfirmToPay, isConfirmIsRegister, isConfirmATM 
  } = storeToRefs(useCommon())
  let { login, getCategories, getUserInfo , showMessage, urlPush } = useCommon()
  let { discountCode, successUsedDiscountCode, total_bonus, is_use_bonus, use_bonus, member_bonus,
    total, is_click_finish_order, isOrderIng 
  } = storeToRefs(useCart())
  let { discount, use_bonus_handler, getTotal } = useCart()
  let { 
    info, transport, pay_method, invoice_type, invoice_title, invoice_uniNumber, info_message,
    has_address, is_save_address, userInfo,
  } = storeToRefs(useInfo())
  let { verify } = useVerify()
  let { numberThousands } = useFilters()
  let { getProductsHandler } = useHandlerProducts()

  // computed ==================================================
  const receiver_address = computed(() => {
    let address = `${info.value.address.city_active} ${info.value.address.district_active} ${info.value.address.detail_address}`
    if(userInfo.value.address_obj){
      has_address.value = false;
      for(let key in userInfo.value.address_obj) {
        let item = userInfo.value.address_obj[key];
        if(item.address == address){
          has_address.value = true;
        }
      }
    }
    return address;
  })

  // methods ==================================================
  const methods = {
    async getTotalHandler(isStepTwo) {
      let { id, qry, additionalid, additionalqry, specificationid, specificationqty } = methods.createCartStrObj();
      if(!id && !specificationid) return

      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      paramsObj = {
        id,
        qry,
        additionalid,
        additionalqry,
        specificationid,
        specificationqty,
        type: isStepTwo ? 1 : 0,
        code: successUsedDiscountCode.value,
        shipping: transport.value == 0 ? 0 : transport.value * 1 + 1,
        memberWallet: is_use_bonus.value ? use_bonus.value : 0, 
        Preview: site.value.Preview,
      }
      let params = ''
      for(let key in paramsObj) {
        let value = paramsObj[key]
        params += `${params ? '&' : ''}${key}=${value}`
      }

      getTotal(params)
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
      cart.value.forEach(function(cartItem) {
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
        if(cartItem.addPrice){
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

    async checkOrder() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      if(site.Preview == 2) {
        showMessage( '預覽模式不開放完成訂單', false);
        return;
      }
      if(isOrderIng.value) return;
      
      is_click_finish_order.value = true;

      let verify_arr = [info.purchaser_email, info.purchaser_name, info.purchaser_number, 
                        info.receiver_name, info.receiver_number]
      if(transport.value == 1) verify_arr.push(info.address)

      let v = verify(...verify_arr)
      if(v) {
        if (transport.value !== '0' && 
            pay_method.value !== '0' &&
            (
              (store.value.Receipt === '0') || 
              (invoice_type.value === '1' || 
                (invoice_type.value ==='2' && invoice_title.value !== '' && invoice_uniNumber.value !== '')
              )
            )
          ) {
          await use_bonus_handler();
          methods.createOrder();
        }
      }
    },
    async cancelDiscountCodeCreateOrder() {
      discountCode.value = '';
      successUsedDiscountCode.value = '';
      await methods.getTotalHandler(1)
      isConfirmDiscountCodeUsed.value = false;
      methods.createOrder();
    },
    async createOrder() {
      isOrderIng.value = true;

      let cartStrObj = methods.createCartStrObj();

      let id = new Date().getTime();
      let saveAddressStr = '';
      if(userInfo.value.address_obj && Object.keys(userInfo.value.address_obj).length < 3 && !has_address.value && is_save_address.value) {
        saveAddressStr = `${id}_ _${receiver_address.value.replace(/ /g, '_ _')}`
      } 
      let formDataObj = {
        // 商店
        'Site': site.value.Site,
        'Name': site.value.Name,
        'productName': store.value.Name,
        'LogoUrl': location.origin + store.value.PayLogo,
        'Preview': site.value.Preview,

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
        'DiscountCode': successUsedDiscountCode.value,
  
        // 購買人
        'Email': info.value.purchaser_email.value,
        'Name': info.value.purchaser_name.value,
        'Phone': info.value.purchaser_number.value,
        'Receiver': info.value.receiver_name.value,
        'ReceiverPhone': info.value.receiver_number.value,
        'Address': receiver_address.value,
        saveAddressStr,
        'Message': info_message.value,
        'Type': invoice_type.value * 1,
        'Title': invoice_title.value,
        'UniNumber': invoice_uniNumber.value,

        // 運送方式 支付方式
        'SendWay': transport.value * 1,
        'PayMethod': pay_method.value,
        'PayType': store.value[pay_method],

        // 金額
        'Discount': total.value.Discount * 1,
        'DiscountPrice': total.value.DiscountCode*1,
        'Shipping': total.value.Shipping * 1,
        'Total': total.value.Sum * 1,
        
        // 購物金
        'MemberWallet': use_bonus.value,
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
            isOrderIng.value = false;
            isConfirmDiscountCodeUsed.value = true;
            return;
          }
  
          if(res.data.message.indexOf('數量不足') > -1) {
            methods.clearCart();
          }
          if(res.data.message.indexOf('購物金不足') > -1) {
            await getUserInfo();
            use_bonus.value = 0;
            methods.getTotalHandler(1);
          }
  
          isOrderIng.value = false;
          showMessage(res.data.message, false)
        }
        else {
          isOrderIng.value = false;
  
          payResult.value = res.data;
  
          // 沒有開啟會員功能
          if(!parseInt(site.value.MemberFuction)) isConfirmToPay = true;
          else {
            // 沒有登入
            if(!user_account.value) {
              let hasAcount = await methods.checkAccount();
              if(hasAcount) isConfirmToPay.value = true; 
              else isConfirmIsRegister.value = true;
            }
            // 登入
            else {
              isConfirmToPay.value = true;
              getUserInfo()
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
        "storeid": site.value.Name,
        "type": store.value.NotificationSystem,
        "phone": info.value.purchaser_number.value,
        "email": info.value.purchaser_email.value,
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
      isConfirmToPay.value = false;

      // LinePay
      if(pay_method.value == 'LinePay'){
        urlPush(payResult.value.payUrl)
      }
      // company account
      else if(pay_method.value == 'ATM' && store.value.ATM == 1){
        bank = require('@/json/bank.json');
        isConfirmATM.value = true;
      }
      else if(pay_method.value == 'PayOnDelivery') {

      }
      // ecpay
      else {

        if(location.origin.indexOf('demo.uniqcarttest') > -1){
          ECPay_form.value = `<form id="ECPay_form" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        } else {
          ECPay_form.value = `<form id="ECPay_form" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        }
        for(let item in payResult){
          if(item === 'success' || item === 'message' || item === 'membered') continue
          // EncryptType, TotalAmount, ExpireDate: number，other: string
          ECPay_form.value += `<input type="${item == 'EncryptType' || item == 'TotalAmount' || item == 'ExpireDate' ? 'number' : 'text'}" name="${item}" value="${payResult.value[item]}">`;
        }
        ECPay_form.value += `</form>`;

        setTimeout(()=> {
          let ECPay_form = document.querySelector('#ECPay_form');
          ECPay_form.submit();
        }, 1000)
      }
    },
    clearCart() {
      cart.value = [];
      setCart();
  
      discountCode.value = '';
      successUsedDiscountCode.value = '';

      is_use_bonus.value = false;
      use_bonus.value = 0;

      showPage.value = 'main'
      
      getCategories();
      getProductsHandler();
    }
  }

  return {
    ...methods
  }
})