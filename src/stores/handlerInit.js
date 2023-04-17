import { useAll }  from '@/stores/all'
import { useProducts } from './products'
import { useCart } from './cart'
import { useInfo } from './info'
import { useHandlerCart } from '@/stores/handlerCart'

export const useHandlerInit = defineStore('handlerInit', () => {
  // store ==================================================
  let { site, user_account, showPage } = storeToRefs(useAll())
  let { getSite, getStore, showMessage } = useAll()
  let { category, products } = storeToRefs(useProducts())
  let { getCategories, getProducts, getAddPrice, getFavorite, showSelect, getMainTotalQty } = useProducts()
  let { cart, cartOLength, cartLength, bonus_array } = storeToRefs(useCart())
  let { getCart, setCart, computedCartLength, othersAddPriceBuyQty } = useCart()
  let { getUserInfo } = useInfo()
  let { use_bonus_handler } = useHandlerCart()

  // methods ==================================================
  const methods = {
    async getSiteHandler() {
      await getSite()

      user_account.value = localStorage.getItem('user_account')
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

      console.log('getProducts => getCart ====================')
      await methods.getCartHandler();

      methods.handleQuery()
    },

    getCartHandler() {
      return new Promise(resolve => {
        getCart()

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

        Promise.all(promises).then(() => {
          console.log('Promise.all')

          methods.asyncCart()
          computedCartLength();
          if(cartOLength.value != cartLength.value) showMessage('部分商品下架，請重新確認', false);
          use_bonus_handler()

          resolve()
        });

        if(promises.length == 0) resolve()
      })
    },
    asyncCart() {
      console.log('asyncCart')
      cart.value.forEach((cartItem, cartIndex) => {
        let product = products.value.find(product => product.ID == cartItem.ID)
        
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
      })
      cart.value = cart.value.filter(item => item)

      setCart();
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
                    let othersQty = othersAddPriceBuyQty(product.ID, productAddPriceItem, productAddPriceItemSpec);
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
                let othersQty = othersAddPriceBuyQty(product.ID, productAddPriceItem);
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

    handleQuery() {
      let searchArr = location.search.substring(1).split('&')
      let searchObj = {}
      searchArr.forEach(item => {
        let key = item.split('=')[0];
        let value = item.split('=')[1]
        if(key && value) searchObj[key] = value
      })
      console.log(searchObj)

      let replaceUrl = process.env.NODE_ENV === 'development' ? '/' : '/cart/'

      // RtnMsg 付款成功
      let RtnMsg = searchObj['RtnMsg']
      if(RtnMsg && RtnMsg == 'Succeeded') {
        window.history.replaceState({}, document.title, replaceUrl);
        if(user_account.value) localStorage.removeItem(`${site.value.Name}@${user_account.value}@cart`);
        else localStorage.removeItem(`${site.value.Name}@cart`);
        showMessage('付款成功', true)
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
    }
  }

  return {
    ...methods
  }
})