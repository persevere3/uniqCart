import { useCommon }  from '@/stores/common/common'
import { useProducts } from './products'
import { useCart } from './cart'
import { useInfo } from './info'

export const useHandlerCommon = defineStore('handlerCommon', () => {
  // store ==================================================
  let { site, user_account, showPage } = storeToRefs(useCommon())
  let { getSite, getGA, getStore, showMessage, urlPush } = useCommon()
  let { isSingleProduct, category, products, selectProduct } = storeToRefs(useProducts())
  let { getCategories, getProducts, getAddPrice, getFavorite, showSelect, getMainTotalQty } = useProducts()
  let { cart, cartOLength, cartLength, stepIndex, discountCode, successUsedDiscountCode, transport, pay_method, 
    bonus_array, is_use_bonus, use_bonus
  } = storeToRefs(useCart())
  let { getCart, setCart, computedCartLength, filter_use_bonus, getTotal, getOthersAddPriceBuyQty } = useCart()
  let { info, info_message, invoice_type, personal_or_company, 
    phone_barCode, natural_barCode, invoice_title, invoice_uniNumber 
  } = storeToRefs(useInfo())
  let { getUserInfo } = useInfo()

  // methods ==================================================
  const methods = {
    async getSiteHandler() {
      await getSite()

      methods.handleQuery()

      user_account.value = localStorage.getItem('user_account')
      getGA();
      getStore();
      getCategories();
      methods.getProductsHandler();
      getUserInfo();
      
      if(site.value.FeedbackFund) bonus_array.value = JSON.parse(site.value.FeedbackFund)
    },

    async getProductsHandler() {
      await getProducts()

      category.value = '0'

      getFavorite();

      methods.handleQuery()

      if(!isSingleProduct.value) await methods.getCartHandler()
      else await methods.getCartHandler(selectProduct.value.ID);

      if(showPage.value == '') showPage.value = 'main'
    },

    getCartHandler() {
      return new Promise(resolve => {
        !isSingleProduct.value ? getCart() : getCart(selectProduct.value.ID)

        // 購物車有商品，列表沒有 => 商品從購物車中移除
        // 購物車商品有加價購，列表商品沒有加價購 => getAddPrice()
        let promises = []
        cart.value.forEach(cartItem => {
          let product = products.value.find(product => product.ID == cartItem.ID)
          // 購物車有商品，列表沒有
          if(!product) {
            cartItem = null
          } else {
            // 購物車商品有加價購，列表商品沒有加價購
            if(cartItem.addPrice && !product.addPrice)
            promises.push(getAddPrice(product))
          }
        })
        cart.value = cart.value.filter(item => item)

        Promise.all(promises).then(async() => {
          console.log('Promise.all')

          methods.asyncCart()
          computedCartLength();
          if(cartOLength.value != cartLength.value) showMessage('抱歉，您選購的商品已下架', false);
          await filter_use_bonus()
          await getTotal()
          resolve()
        });

        if(promises.length == 0) resolve()
      })
    },
    asyncCart() {
      console.log('asyncCart')
      cart.value.forEach((cartItem, cartIndex) => {
        let product = products.value.find(product => product.ID == cartItem.ID)
        if(product) {
          // 都有規格
          if(cartItem.specArr && product.specArr) {
            cartItem.specArr.forEach(cartItemSpec => {
              let productSpec = product.specArr.find(productSpec => productSpec.ID == cartItemSpec.ID)
              if(productSpec) {
                productSpec.buyQty = cartItemSpec.buyQty
                if(productSpec.Enable == 1 && productSpec.buyQty > productSpec.Amount){
                  productSpec.buyQty = productSpec.Amount;
                }
              }
            })
          }
          // 都沒規格
          else if(!cartItem.specArr && !product.specArr) {
            product.buyQty = cartItem.buyQty;
            if(product.Enable == 1 && product.buyQty > product.Amount){
              product.buyQty = product.Amount;
            }
          }

          // product的購買數量如果為0設為null
          let mainTotalQty = getMainTotalQty(product)
          if(mainTotalQty < 1) {
            cartItem = null
          }

          if(cartItem) {
            // 加價購
            methods.asyncAddPrice(cartItem, product)

            // copy列表item => 購物車item
            cart.value[cartIndex] = JSON.parse(JSON.stringify(product))
          }
        } 
      })
      cart.value = cart.value.filter(item => item)

      methods.setCartHandler();
    },
    asyncAddPrice(cartItem, product) {
      let mainTotalQty = getMainTotalQty(product)
      if(cartItem.addPrice && product.addPrice) {
        cartItem.addPrice.forEach(cartAddPriceItem => {
          let productAddPriceItem = product.addPrice.find(productAddPriceItem => productAddPriceItem.ID == cartAddPriceItem.ID)
          if(productAddPriceItem) {
            if(cartAddPriceItem.specArr && productAddPriceItem.specArr) {
              cartAddPriceItem.specArr.forEach(cartAddPriceItemSpec => {
                let productAddPriceItemSpec = productAddPriceItem.specArr.find(productAddPriceItemSpec => productAddPriceItemSpec.ID == cartAddPriceItemSpec.ID)
                if(productAddPriceItemSpec) {
                  productAddPriceItemSpec.buyQty = cartAddPriceItemSpec.buyQty

                  if(productAddPriceItemSpec.Enable == 1) {
                    let othersQty = getOthersAddPriceBuyQty(product.ID, productAddPriceItem, productAddPriceItemSpec);
                    if(productAddPriceItemSpec.buyQty + othersQty > productAddPriceItemSpec.Amount) {
                      if(othersQty == 0) {
                        productAddPriceItemSpec.buyQty = productAddPriceItemSpec.Amount;
                      }
                      else {
                        let leftQty = productAddPriceItemSpec.Amount - othersQty;
                        if(leftQty <= 0) productAddPriceItemSpec.buyQty = 0;
                        else productAddPriceItemSpec.buyQty = leftQty;
                      }
                    }
                  }

                  if(productAddPriceItemSpec.buyQty > mainTotalQty){
                    productAddPriceItemSpec.buyQty = mainTotalQty;
                  }
                }
              })
            }
            else if(!cartAddPriceItem.specArr && !productAddPriceItem.specArr) {
              productAddPriceItem.buyQty = cartAddPriceItem.buyQty;
              if(productAddPriceItem.Enable == 1) {
                let othersQty = getOthersAddPriceBuyQty(product.ID, productAddPriceItem);
                if( productAddPriceItem.buyQty + othersQty > productAddPriceItem.Amount ){
                  if(othersQty == 0) productAddPriceItem.buyQty = productAddPriceItem.Amount;
                  else {
                    let leftQty = productAddPriceItem.Amount - othersQty;
                    if( leftQty <= 0 ) productAddPriceItem.buyQty = 0;
                    else productAddPriceItem.buyQty = leftQty;
                  }
                }
              }
              if(productAddPriceItem.buyQty > mainTotalQty) {
                productAddPriceItem.buyQty = mainTotalQty;
              }
            }
          }
        })
      }
    },
    setCartHandler() {
      !isSingleProduct.value ? setCart() : setCart(selectProduct.value.ID)
    },

    handleQuery() {
      let searchArr = location.search.substring(1).split('&')
      let searchObj = {}
      searchArr.forEach(item => {
        let key = item.split('=')[0];
        let value = item.split('=')[1]
        if(key && value) searchObj[key] = value
      })
      console.log(searchObj)
      let replaceUrl = location.pathname

      // Line
      let account = searchObj['account']
      if(account) localStorage.setItem('user_account', account)
      let result = searchObj['result']
      if(result) {
        result = JSON.parse(decodeURI(result))
        if(!result.status) alert(result.msg)
        else localStorage.setItem('user_account', result.account)

        window.history.replaceState({}, document.title, replaceUrl);
        return
      }

      // RtnMsg 付款成功
      let RtnMsg = searchObj['RtnMsg']
      if(RtnMsg && RtnMsg == 'Succeeded') {
        window.history.replaceState({}, document.title, replaceUrl);
        if(user_account.value) localStorage.removeItem(`${site.value.Name}@${user_account.value}@cart`);
        else localStorage.removeItem(`${site.value.Name}@cart`);
        showMessage('已收到您的付款！', true)
      }

      // 超商取貨付款
      let storeid = searchObj['CVSStoreID']
      let storename = searchObj['CVSStoreName']
      let storeaddress = searchObj['CVSAddress']

      // spid singleProduct
      let spid = searchObj['spid'];
      if(spid) {
        let product = products.value.find(product => product.ID == spid)
        if(product) {
          window.history.replaceState({}, document.title, `${location.pathname}?spid=${spid}`);

          isSingleProduct.value = true
          showSelect(product)

          // 7-11
          if(storeid || storename || storeaddress) methods.getConvenienceStore(storeid, storename, storeaddress)
        }

        return
      }
      
      // id 查看某商品
      let id = searchObj['id'];
      if(id) {
        let product = products.value.find(product => product.ID == id)
        if(product) showSelect(product)
      }

      // open_cart 查看購物車
      let open_cart = searchObj['open_cart']
      if(open_cart) {
        window.history.replaceState({}, document.title, replaceUrl);
        showPage.value = 'cart'
      }

      // 超商取貨付款
      if(storeid || storename || storeaddress) methods.getConvenienceStore(storeid, storename, storeaddress)
    },

    // 超商取貨付款
    getConvenienceStore(id, name, address) {
      if(!id || !name || !address) return

      methods.returnInfo()

      storeid.value = id
      storename.value = decodeURI(name)
      storeaddress.value = decodeURI(address)

      if(!isSingleProduct.value) {
        showPage.value = 'cart'
        stepIndex.value = 2
      }
    },
    pickStore() {
      let order_info = {
        discountCode: discountCode.value,
        successUsedDiscountCode: successUsedDiscountCode.value,

        info: {
          purchaser_email: info.value.purchaser_email.value,
          purchaser_name: info.value.purchaser_name.value,
          purchaser_number: info.value.purchaser_number.value,
          receiver_name: info.value.receiver_name.value,
          receiver_number: info.value.receiver_number.value,
        },
        info_message: info_message.value,

        transport: transport.value,
        pay_method: pay_method.value,
  
        invoice_type: invoice_type.value,
        personal_or_company: personal_or_company.value,
        phone_barCode: phone_barCode.value,
        natural_barCode: natural_barCode.value,
        invoice_title: invoice_title.value,
        invoice_uniNumber: invoice_uniNumber.value,

        is_use_bonus: is_use_bonus.value,
        use_bonus: use_bonus.value,
      }
      localStorage.setItem('order_info', JSON.stringify(order_info));

      if(webVersion.value == 'demo') {
        ECPay_store_form.value = `<form id="ECPay_store_form" action="https://logistics-stage.ecpay.com.tw/Express/map" method="post">`
      } else {
        ECPay_store_form.value = `<form id="ECPay_store_form" action="https://logistics.ecpay.com.tw/Express/map" method="post">`
      }

      let MerchantID
      if(webVersion.value === 'demo') MerchantID = transport.value.indexOf('C2C') > -1 ? '2000933' : '2000132'
      else MerchantID = store.value.ECStore
      let LogisticsSubType = transport.value.replace('Delivery', '')
      let IsCollection = transport.value.indexOf('Delivery') > -1 ? 'Y' : 'N'
      let obj = {
        MerchantID,
        MerchantTradeNo: '',
        LogisticsType: 'CVS',
        LogisticsSubType,
        IsCollection,
        ServerReplyURL: `${location.origin}/interface/store/SpmarketAddress${showPage.value == 'singleProduct' ? '?spid=' + selectProduct.value.ID : ''}`,
        ExtraData: '',
        Device: ''
      }

      for(let key in obj) {
        ECPay_store_form.value += `<input type="${key == 'Device' ? 'number' : 'text'}" name="${key}" value="${obj[key]}">`;
      }
      ECPay_store_form.value += `</form>`;

      setTimeout(() => {
        let ECPay_store_form = document.querySelector('#ECPay_store_form');
        ECPay_store_form.submit();
      }, 1000)
    },
    returnInfo() {
      let order_info = JSON.parse(localStorage.getItem('order_info')) || {};

      discountCode.value = order_info.discountCode
      successUsedDiscountCode.value = order_info.successUsedDiscountCode

      info.value =  order_info.info
      info_message.value = order_info.info_message 

      transport.value = order_info.transport
      pay_method.value = order_info.pay_method
      
      invoice_type.value = order_info.invoice_type
      invoice_title.value = order_info.invoice_title
      invoice_uniNumber.value = order_info.invoice_uniNumber

      is_use_bonus.value = order_info.is_use_bonus
      use_bonus.value = order_info.use_bonus
    },
  }

  return {
    ...methods
  }
})