import { useCommon } from './common'
import { useProducts } from './products'
import { useCart } from './cart'
import { useFilters } from './filters'
import { useHandlerCart } from './handlerCart'
import { useHandlerProducts } from './handlerProducts'

import { getAmountApi } from '@/api/index';

export const useHandlerChangeQty = defineStore('handlerChangeQty', () => {
  // store ==================================================
  let { login, showMessage } = useCommon()
  let { products } = storeToRefs(useProducts())
  let { getMainTotalQty } = useProducts()
  let { cart } = storeToRefs(useCart())
  let { setCart, othersAddPriceBuyQty } = useCart()
  let { number } = useFilters()
  let { getTotalHandler } = useHandlerCart()
  let { getProductsHandler } = useHandlerProducts()

  // state ==================================================
  const state = reactive({
    flyItem: null,
    flyImgTop: 100,
    flyImgLeft: 0,
    isShrink: 0,
  })

  // methods ==================================================
  const methods = {
    // 改變 主商品數量 ==================================================
    async changeMainBuyQty(main, specIndex, qty, e) {
      let spec = specIndex == null ? null : main.specArr[specIndex]
      let target = spec ? spec : main

      // getAmount => update庫存, 檢查是否上架
      if(spec) {
        let isMarket = await methods.getAmount(main, null, target)
        if(!isMarket) {
          showMessage('此規格已下架', false)
          getProductsHandler()
          return
        }
      }
      else {
        let isMarket = await methods.getAmount(target)
        if(!isMarket) {
          showMessage('此商品已下架', false)
          getProductsHandler()
          return
        }
      }

      // 基本校驗 非文字 or >999 => 0
      qty = number(qty)
      if(qty > 999) qty = 0
      // 庫存校驗
      if(target.Enable == 1 && qty > target.Amount * 1) {
        qty = target.Amount * 1;
        showMessage(`目前數量僅剩 ${target.Amount < 1 ? 0 : target.Amount} 組`, false);
      }

      // 動畫
      if(e) {
        let variation = qty - target.buyQty;
        if(variation) methods.flyHandler(main, variation, e);
      }

      // 更新 產品列表
      let product = products.value.find(product => product.ID == main.ID)
      let productSpec
      if(spec) {
        productSpec = product.specArr.find(productSpec => productSpec.ID == spec.ID)
        productSpec.buyQty = qty
      }
      else product.buyQty = qty;

      // 更新 購物車
      let mainTotalQty = getMainTotalQty(product);
      let cartItemIndex = cart.value.map(cartItem => cartItem.ID)
                                 .indexOf(main.ID)
      // 購物車原本就有
      if(cartItemIndex > -1) {
        // 要放進購物車
        if(mainTotalQty) {
          let cartItem = cart.value[cartItemIndex]
          if(productSpec) {
            cartItem.specArr.find(cartSpec => cartSpec.ID == productSpec.ID).buyQty = productSpec.buyQty
          }
          else cartItem.buyQty = product.buyQty
        } 
        // 不用放進購物車
        else {
          cart.value.splice(cartItemIndex, 1);

          setCart()
          
          getTotalHandler(0);
          return
        }
      }
      // 購物車原本沒有
      else {
        // 要放進購物車
        if(mainTotalQty) cart.value.push(JSON.parse(JSON.stringify(product)))
      }

     setCart()

      // 更新加價購
      if(product.addPrice) {
        product.addPrice.forEach((addPriceItem, addPriceIndex) => {
          if(addPriceItem.specArr) {
            addPriceItem.specArr.forEach((addPriceSpec, addPriceSpecIndex) => {
              if(addPriceSpec.buyQty > mainTotalQty) {
                methods.updateAddpriceBuyQty(product, addPriceIndex, addPriceSpecIndex, mainTotalQty)
              }
            })
          }
          else {
            if(addPriceItem.buyQty > mainTotalQty) {
              methods.updateAddpriceBuyQty(product, addPriceIndex, null, mainTotalQty);
            }
          }
        });
      }

      // 取得 金額總計
      getTotalHandler(0);
    },
    // 改變 加價購數量 ==================================================
    async changeAddpriceBuyQty(main, addPriceIndex, specIndex, qty){
      let addPriceItem = main.addPrice[addPriceIndex]
      let addPriceItemSpec = specIndex == null ? null : addPriceItem.specArr[specIndex]
      let target = addPriceItemSpec ? addPriceItemSpec : addPriceItem

      // getAmount => update庫存, 檢查是否上架
      if(addPriceItemSpec) {
        let isMarket = await methods.getAmount(main, addPriceItem, target)
        if(!isMarket) {
          showMessage('此規格已下架', false)
          getProductsHandler()
          return
        }
      }
      else {
        let isMarket = await methods.getAmount(main, target);
        if(!isMarket) {
          showMessage('此商品已下架', false)
          getProductsHandler()
          return
        }
      }

      // 基本校驗 非文字 or >999 => 0
      qty = number(qty)
      if(qty > 999) qty = 0
      // 其他主商品下 此加價購商品的購買數量 總和
      let othersAddPriceBuyQty = 0
      if(addPriceItemSpec) {
        othersAddPriceBuyQty = othersAddPriceBuyQty(main.ID, addPriceItem, target);
      } 
      else {
        othersAddPriceBuyQty = othersAddPriceBuyQty(main.ID, target);
      }
      // 庫存校驗
      if(target.Enable == 1) {
        if(qty + othersAddPriceBuyQty > target.Amount * 1) {
          if(othersAddPriceBuyQty == 0) qty = target.Amount * 1
          else {
            let leftBuyQty = target.Amount * 1 - othersQty;
            if(leftBuyQty <= 0) qty = 0
            else qty = leftBuyQty
          }
          showMessage(`目前數量僅剩 ${target.Amount * 1 < 1 ? 0 : target.Amount} 組`, false);
        }
      }
      // 主商品總數量限制校驗
      let maxBuyQty = getMainTotalQty(main)
      if(qty > maxBuyQty) qty = maxBuyQty

      // 更新 產品列表
      let product = products.value.find(product => product.ID == main.ID)
      let productAddPriceItem = product.addPrice.find(productAddPriceItem => productAddPriceItem.ID == addPriceItem.ID)
      if(addPriceItemSpec) {
        let productAddPriceItemSpec = productAddPriceItem.specArr.find(productAddPriceItemSpec => productAddPriceItemSpec.ID == target.ID)
        productAddPriceItemSpec.buyQty = qty
      } 
      else productAddPriceItem.buyQty = qty

      // 更新 購物車
      cart.value.find(cartItem => cartItem.ID == main.ID).addPrice = JSON.parse(JSON.stringify(product.addPrice))
      setCart()

      // 取得 金額總計
      getTotalHandler(0);
    },

    // 取得 庫存 type 1: 沒有規格主商品, 2: 沒有規格加價購, 3: 有規格主商品和加價購
    async getAmount(main, addPrice, spec) {
      // 加價購商品 or 主商品
      let product = addPrice ? addPrice : main
      // 商品某規格 or 商品沒規格 
      let target = spec ? spec : product

      let type
      if(spec) type = 3
      else if(addPrice) type = 2
      else type = 1

      let formData = new FormData();
      formData.append('type' , type);
      formData.append('id' , target.ID);
      if(addPrice) formData.append('pid' , main.ID);

      try {
        let res = await getAmountApi(formData)
        if(res.data.errormessage) {
          await login();
          return await methods.getAmount(type, id, pid)
        }

        if(!res.data.data[0]) return false

        let {Enable, Amount} = res.data.data[0]
        target.Enable = Enable
        target.Amount = Amount
        return true
      } catch (error) {
        throw new Error(error)
      }
    },
    
    // 改變 主商品數量 動畫 ==================================================
    flyHandler(product, variation, {pageX, pageY}) {
      // click position
      let clickPosition = {
        pageX,
        pageY
      }

      // cartIcon position
      let scrollTop = document.querySelector('html').scrollTop || 0;
      let cartIcon = document.querySelector('.cartIcon');
      let cartIconPosition = {
        pageX: cartIcon.offsetLeft + 12.5,
        pageY: cartIcon.offsetTop + scrollTop + 12.5
      }
      
      // set start, end
      let start;
      let end;
      if(variation > 0){
        start = clickPosition;
        end = cartIconPosition;
      } else {
        start = cartIconPosition;
        end = clickPosition;
      }

      // img, position 
      state.flyItem = product;
      state.flyImgTop = start.pageY;
      state.flyImgLeft = start.pageX;

      // 設定 interval times, moveX, moveY
      let intervalTimes = 50;
      let moveX = (end.pageX - start.pageX)/intervalTimes;
      let moveY = (end.pageY - start.pageY)/intervalTimes;

      // 
      if(variation < 0){
        methods.shrinkHandler();
      }
      let interval = setInterval(function() {
        intervalTimes -= 1;

        state.flyImgTop += moveY;
        state.flyImgLeft += moveX;

        if(intervalTimes < 1){
          clearInterval(interval);
          state.flyItem = null;
          
          if(variation > 0){
            methods.shrinkHandler();
          }
        }
      }, 10);
    },
    shrinkHandler(){
      state.isShrink = 1;
      setTimeout(function(){
        state.isShrink = 0;
      }, 200);
    },
  }

  return {
    ...toRefs(state),

    ...methods
  }
})