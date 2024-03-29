import { useCommon }  from '@/stores/common/common'
import { useCart } from './cart'
import { useProducts } from './products'
import { useInfo } from './info'
import { useVerify } from './verify'
import { useHandlerCommon }  from '@/stores/handlerCommon'

import city_district_json from '@/json/city_district.json'

import { createOrderApi, registerApi } from '@/api/index'
import { reactive, toRefs } from 'vue'

export const useHandlerCart = defineStore('handlerCart', () => {
  // store ==================================================
  let { site, store, user_account, showPage } = storeToRefs(useCommon())
  let { login, showMessage, urlPush } = useCommon()
  let { cart, stepPage, successUsedDiscountCode, total, transport, pay_method, 
    is_use_bonus, use_bonus, member_bonus, is_click_finish_order, isOrderIng , payResult, ECPay_form_value
  } = storeToRefs(useCart())
  let { unDiscount, getTotal, createCartStrObj, filter_use_bonus } = useCart()
  let { isSingleProduct } = storeToRefs(useProducts())
  let { getCategories } = useProducts()
  let { info, invoice_type, phone_barCode, natural_barCode, invoice_title, invoice_uniNumber, info_message,
    has_address, is_save_address, userInfo, storeid, storename, storeaddress
  } = storeToRefs(useInfo())
  let { getUserInfo } = useInfo()
  let { verify } = useVerify()
  let { getProductsHandler, setCartHandler } = useHandlerCommon()

  // state 
  const state = reactive({
    isConfirmToPay: false,
    isConfirmDiscountCodeUsed: false,
    isConfirmATM: false,
    isConfirmIsRegister: false,
    isConfirmRegister: false,

    city_district: city_district_json
  })

  // computed ==================================================  
  const receiver_address = computed(() => {
    let address = `${info.value.address.city_active} ${info.value.address.district_active} ${info.value.address.detail_address}`
    if(userInfo.value.address_obj) {
      has_address.value = false;
      for(let key in userInfo.value.address_obj) {
        let item = userInfo.value.address_obj[key];
        if(item.address == address) {
          has_address.value = true;
        }
      }
    }
    return address;
  })

  // methods ==================================================
  const methods = {
    async checkOrder() {
      if(site.value.Preview == 2) {
        showMessage( '預覽模式不開放完成訂單', false);
        return;
      }
      if(isOrderIng.value) return;
      
      is_click_finish_order.value = true;

      // 資訊驗證
      let verify_arr = [info.value.purchaser_email, info.value.purchaser_name, info.value.purchaser_number, 
                        info.value.receiver_name, info.value.receiver_number]
      // 地址驗證
      if(transport.value == 1) verify_arr.push(info.value.address)
      let v = verify(...verify_arr)
      if(v) {
        if (
          // 運送驗證
          transport.value !== '0' && 
          // 支付驗證
          pay_method.value !== '0' &&
          // 發票驗證
          (
            (store.value.Receipt === '0') || 
            (invoice_type.value === '1') ||
            (invoice_type.value === '2' && invoice_title.value !== '' && invoice_uniNumber.value !== '') ||
            (invoice_type.value === '3' && phone_barCode.value !== '') ||
            (invoice_type.value === '4' && natural_barCode.value !== '')
          ) &&
          // 門市驗證
          ( is_store.value ? storeid.value !== '' : true)
        ) {
          await filter_use_bonus();
          methods.createOrder();
        }
      }
    },
    async cancelDiscountCodeCreateOrder() {
      unDiscount()
      await getTotal(1)
      state.isConfirmDiscountCodeUsed = false;
      methods.createOrder();
    },
    async createOrder() {
      isOrderIng.value = true;

      let cartStrObj = createCartStrObj();

      let formDataObj = {
        // 商店
        'Site': site.value.Site,
        'StoreName': site.value.Name,
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

        // 金額
        'Discount': total.value.Discount * 1,
        'DiscountPrice': total.value.DiscountCode * 1,
        'Shipping': total.value.Shipping * 1,
        'Total': total.value.Sum * 1,
  
        // 購買人
        'Email': info.value.purchaser_email.value,
        'Name': info.value.purchaser_name.value,
        'Phone': info.value.purchaser_number.value,
        'Phone2': info.value.purchaser_number.value,
        'Receiver': info.value.receiver_name.value,
        'ReceiverPhone': info.value.receiver_number.value,
        'Message': info_message.value,
        
        // 購物金
        'MemberWallet': use_bonus.value,
        'MemberBonus': member_bonus.value,
      }

      // 運送方式 支付方式
      if(transport.value === '1' || transport.value === '2') {
        formDataObj['SendWay'] = transport.value
        formDataObj['PayMethod'] = pay_method.value
        formDataObj['PayType'] = store.value[pay_method.value]
      }
      else {
        formDataObj['SendWay'] = 3
        formDataObj['Mart'] = transport.value

        if(transport.value.indexOf('Delivery') > -1) {
          formDataObj['PayMethod'] = transport.value
          formDataObj['PayType'] = 1
        }
        else {
          formDataObj['PayMethod'] = pay_method.value
          formDataObj['PayType'] = store.value[pay_method.value]
        }

        // 0 代收 1 不代收
        formDataObj['IsCollection'] = transport.value.indexOf('Delivery') > -1 ? 0 : 1
      }

      // 地址 
      if(is_store.value) formDataObj['Address'] = encodeURI(`${storeid.value} - ${storename.value} - ${storeaddress.value}`)
      else formDataObj['Address'] = encodeURI(receiver_address.value)
      if(userInfo.value.address_obj && Object.keys(userInfo.value.address_obj).length < 3 && !has_address.value && is_save_address.value) {
        let id = new Date().getTime();
        formDataObj['saveAddressStr'] = encodeURI(`${id}_ _${receiver_address.value.replace(/ /g, '_ _')}`)
      }
      else formDataObj['saveAddressStr'] = ''

      // 郵遞區號 
      if(userInfo.value.city_active && userInfo.value.district_active) {
        formDataObj['ZipCode'] = state.city_district[userInfo.value.city_active][userInfo.value.district_active]
      } else {
        formDataObj['ZipCode'] = ''
      }

      // 超商取貨付款 
      if(is_store.value) formDataObj['StoreID'] = storeid.value;

      // 發票
      formDataObj['Type'] = invoice_type.value * 1
      formDataObj['Title'] = invoice_title.value * 1
      if(invoice_type.value === '3') {
        formDataObj['UniNumber'] = phone_barCode.value
        formDataObj['savePhoneCode'] = phone_barCode.value
        formDataObj['saveNatureCode'] = ''
      }
      else if(invoice_type.value === '4') {
        formDataObj['UniNumber'] = natural_barCode.value
        formDataObj['savePhoneCode'] = ''
        formDataObj['saveNatureCode'] = natural_barCode.value
      }
      else formDataObj['UniNumber'] = invoice_uniNumber.value

      let formData = new FormData();
      for(let key in formDataObj) formData.append(key, formDataObj[key])

      try {
        let res = await createOrderApi(formData)
        if(res.data.errormessage) {
          await login()
          methods.createOrder()
          return
        }
        if(res.data.success) {
          payResult.value = res.data;
          // 沒有開啟會員功能
          if(!parseInt(site.value.MemberFuction)) state.isConfirmToPay = true;
          else {
            // 沒有登入
            if(!user_account.value) {
              let hasAcount = await methods.checkAccount();
              if(hasAcount) state.isConfirmToPay = true; 
              else state.isConfirmIsRegister = true;
            }
            // 登入
            else {
              state.isConfirmToPay = true;
              getUserInfo()
            }
          }
  
          methods.clearCart();

          isOrderIng.value = false;
        }
        else {
          if(res.data.message.indexOf('已使用過折扣碼') > -1) {
            isOrderIng.value = false;
            state.isConfirmDiscountCodeUsed = true;
            return;
          }
          
          if(res.data.message.indexOf('數量不足') > -1) {
            methods.clearCart();
          }
          if(res.data.message.indexOf('購物金不足') > -1) {
            await getUserInfo();
            use_bonus.value = 0;
            getTotal(1);
          }
          isOrderIng.value = false;
          showMessage(res.data.message, false)
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
      state.isConfirmToPay = false;

      // LinePay
      if(pay_method.value == 'LinePay'){
        urlPush(payResult.value.payUrl)
      }
      // company account
      else if(pay_method.value == 'ATM' && store.value.ATM == 1){
        state.isConfirmATM = true;
      }
      else if(pay_method.value == 'PayOnDelivery' || pay_method.value == 'MartPayOnDelivery') {

      }
      // ecpay
      else {
        if(webVersion.value === 'demo') {
          ECPay_form_value.value = `<form id="ECPay_form" action="https://payment-stage.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        } else {
          ECPay_form_value.value = `<form id="ECPay_form" action="https://payment.ecpay.com.tw/Cashier/AioCheckOut/V5" method="post">`
        }

        for(let item in payResult) {
          if(item === 'success' || item === 'message' || item === 'membered') continue
          // EncryptType, TotalAmount, ExpireDate: number，other: string
          ECPay_form_value.value += `<input type="${item == 'EncryptType' || item == 'TotalAmount' || item == 'ExpireDate' ? 'number' : 'text'}" name="${item}" value="${payResult.value[item]}">`;
        }

        ECPay_form_value.value += `</form>`;

        setTimeout(()=> {
          let ECPay_form_dom = document.querySelector('#ECPay_form');
          if(ECPay_form_dom) ECPay_form_dom.submit();
        }, 1000)
      }
    },
    clearCart() {
      cart.value = [];
      setCartHandler();
  
      unDiscount()

      is_use_bonus.value = false;
      use_bonus.value = 0;

      if(!isSingleProduct.value) {
        showPage.value = 'main'
        getCategories();
      } 
      else stepPage.value = 1;

      getProductsHandler();
    }
  }

  return {
    ...toRefs(state),
    receiver_address,
    ...methods
  }
})