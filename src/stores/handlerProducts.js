import { useCommon } from './common'
import { useProducts } from './products'
import { useCart } from './cart'

export const useHandlerProducts = defineStore('handlerProducts', () => {
  // store ==================================================
  let { site, user_account, category, showPage, login, showMessage } = storeToRefs(useCommon())
  let { products, getProducts, getAddPrice, getFavorite, showSelect, mainTotalQty } = storeToRefs(useProducts())
  let { 
    cart, cartOLength, cartLength,
    getCart, setCart, computedCartLength, othersAddPriceBuyQty, use_bonus_handler 
  } = storeToRefs(useCart())

  // methods ==================================================
  const methods = reactive({
    async getProductsHandler() {
      let res = await getProducts()
      if(res.message === 'login') {
        await login();
        methods.getProductsHandler()
        return
      }

      if(res.success) {
        category = '0'

        let searchArr = location.search.substring(1).split('&')
        let searchObj = {}
        searchArr.forEach(item => {
          let key = item.split('=')[0];
          let value = item.split('=')[1]
          if(key && value) searchObj[key] = value
        })
        console.log(searchObj)

        let replaceUrl = '/cart/'

        // RtnMsg 付款成功
        let RtnMsg = searchObj['RtnMsg']
        if(RtnMsg && RtnMsg == 'Succeeded') {
          window.history.replaceState({}, document.title, replaceUrl);
          if(user_account) {
            localStorage.removeItem(`${site.Name}@${user_account}@cart`);
          }
          else {
            localStorage.removeItem(`${site.Name}@cart`);
          }
          showMessage('付款成功', true)
        }
  
        getFavorite();
        console.log('getProducts => getCart ====================')
        await getCartHandler();
  
        // id 查看某商品
        let id = searchObj['id']
        let replace = searchObj['replace']
        if(id) {
          let product = products.find(product => product.ID == id)
          if(product) {
            showSelect(product)
            if(!replace) window.history.replaceState({}, document.title, replaceUrl);
          }
        }
        // open_cart 查看購物車
        let is_open_cart = searchObj['open_cart']
        if(is_open_cart) {
          window.history.replaceState({}, document.title, replaceUrl);
          showPage = 'cart'
        }
      }
    },

    getCartHandler() {
      return new Promise(resolve => {
        getCart()

        // 購物車有商品，列表沒有 => 商品從購物車中移除
        // 購物車商品有加價購，列表商品沒有加價購 => getAddPrice()
        let promises = []
        cart.forEach(cartItem => {
          let product = products.find(product => product.ID == cartItem.ID)
          // 購物車有商品，列表沒有
          if(!product) {
            cartItem = null
          } else {
            // 購物車商品有加價購，列表商品沒有加價購
            if(cartItem.addPrice && !product.addPrice)
            promises.push(getAddPrice(product))
          }
        })
        cart = cart.filter(item => item)

        Promise.all(promises).then(() => {
          console.log('Promise.all')

          methods.asyncCart()
          computedCartLength();
          if(cartOLength != cartLength) showMessage('部分商品下架，請重新確認', false);
          use_bonus_handler('notGetTotal')

          resolve()
        });

        if(promises.length == 0) resolve()
      })
    },
    asyncCart() {
      console.log('asyncCart')
      cart.forEach((cartItem, cartIndex) => {
        let isContinue = true;

        let product = products.find(product => product.ID == cartItem.ID)
        
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
        let mainTotalQty = mainTotalQty(product)
        if(mainTotalQty < 1) {
          cartItem = null
          isContinue = false
        }

        if(isContinue) {
          // 加價購
          methods.asyncAddPrice(cartItem, product)

          // copy列表item => 購物車item
          cart[cartIndex] = JSON.parse(JSON.stringify(product))
        }
      })
      cart = cart.filter(item => item)

      setCart();
    },
    asyncAddPrice(cartItem, product) {
      let mainTotalQty = mainTotalQty(product)
      if(cartItem.addPrice && product.addPrice) {
        cartItem.addPrice.forEach(cartAddPriceItem => {
          let productAddPriceItem = product.addPrice.find(productAddPriceItem => productAddPriceItem.ID == cartAddPriceItem.ID)
          if(productAddPriceItem) {
            if(cartAddPriceItem.specArr && productAddPriceItem.specArr){
              cartAddPriceItem.specArr.forEach(cartAddPriceItemSpec => {
                let productAddPriceItemSpec = productAddPriceItem.specArr.find(productAddPriceItemSpec => productAddPriceItemSpec.ID == cartAddPriceItemSpec.ID)
                if(productAddPriceItemSpec) {
                  productAddPriceItemSpec.buyQty = cartAddPriceItemSpec.buyQty

                  if ( productAddPriceItemSpec.Enable == 1 ) {
                    let othersQty = othersAddPriceBuyQty(product.ID, productAddPriceItem, productAddPriceItemSpec);
                    if( productAddPriceItemSpec.buyQty + othersQty > productAddPriceItemSpec.Amount ){
                      if(othersQty == 0) {
                        productAddPriceItemSpec.buyQty = productAddPriceItemSpec.Amount;
                      }
                      else {
                        let leftQty = productAddPriceItemSpec.Amount - othersQty;
                        if( leftQty <= 0 ){
                          productAddPriceItemSpec.buyQty = 0;
                        }
                        else{
                          productAddPriceItemSpec.buyQty = leftQty;
                        }
                      }
                    }
                  }

                  if(productAddPriceItemSpec.buyQty > mainTotalQty){
                    productAddPriceItemSpec.buyQty = mainTotalQty;
                  }
                }
              })
            }
            else if(!cartAddPriceItem.specArr && !productAddPriceItem.specArr){
              productAddPriceItem.buyQty = cartAddPriceItem.buyQty;
              if ( productAddPriceItem.Enable == 1 ) {
                let othersQty = othersAddPriceBuyQty(product.ID, productAddPriceItem);
                if( productAddPriceItem.buyQty + othersQty > productAddPriceItem.Amount ){
                  if(othersQty == 0){
                    productAddPriceItem.buyQty = productAddPriceItem.Amount;
                  }
                  else {
                    let leftQty = productAddPriceItem.Amount - othersQty;
                    if( leftQty <= 0 ){
                      productAddPriceItem.buyQty = 0;
                    }
                    else{
                      productAddPriceItem.buyQty = leftQty;
                    }
                  }
                }
              }
              if(productAddPriceItem.buyQty > mainTotalQty){
                productAddPriceItem.buyQty = mainTotalQty;
              }
            }
          }
        })
      }
    },
  })

  return {
    ...toRefs(methods)
  }
})