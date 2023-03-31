import { getProductsApi, getAddPriceApi, getFavoriteApi, deleteFavoriteApi, addFavoriteApi } from '@/api/index';

export const useProducts = defineStore('products', () => {
  // state ==================================================
  const state = reactive({
    products: [],
    productCompleted: false,
    
    //
    selectProduct: {},

    //
    favorite: {},
    
    // ?
    pageNum: 12,
    totalPage: 0,
    currentPage: 1, // position ???
  })

  // methods ==================================================
  const methods = reactive({
    // return {isSuccess, message}
    async getProducts() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let params = `Preview=${site.Preview}`;
      try {
        let res = await getProductsApi(params)
        if(res.data.errormessage) return {isSuccess: false, message: 'login'}

        let products = res.data.data;
        let specs =  res.data.data2; // 規格
        products.forEach(product => {
          // 規格 + buyQty
          let productSpecArr = specs.filter(spec => spec.ProductID == product.ID)
          if(productSpecArr.length > 0) {
            productSpecArr.forEach(spec => {
              spec.buyQty = 0
            })

            product.specArr = productSpecArr;
            product.selectSpecItem = {};
            product.isShowOption = false;
          }
          else product.buyQty = 0;

          // imgArr, mainImgIndex, categoryArr, allPicLength
          product.imgArr = [product.Img1, product.Img2, product.Img3, product.Img4, product.Img5];
          product.imgArr = product.imgArr.filter(img => img)
          product.mainImgIndex = 0;
          product.categoryArr = [product.Category1, product.Category2, product.Category3, product.Category4, product.Category5]
          product.categoryArr = product.categoryArr.filter(category => category)
          product.allPicLength = product.categoryArr.length;

          product.addPrice = null
        });
        state.products = products

        // nextTick
        setTimeout(() => {
          state.productCompleted = true;
        }, 1000)

        return {isSuccess: true, message: ''}
      } catch (error) {
        throw new Error(error)
      }
    },
    async getAddPrice(item) {
      if(item.addPrice) {
        console.log('item has addPrice', item.ID)
        return
      }
      console.log('getAddPrice', item.ID)

      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      const params = `id=${item.ID}&Preview=${site.Preview}`;

      try {
        let res = await getAddPriceApi(params)
        if(res.data.errormessage) {
          await login();
          methods.getAddPrice(item)
          return
        }

        let addPrice = res.data.data;
        let specs = res.data.data2; // 規格
        addPrice.forEach(addPriceItem => {
          let addPriceItemSpecArr = specs.filter(spec => spec.ProductID == addPriceItem.ID)
          if(addPriceItemSpecArr.length > 0) {
            addPriceItemSpecArr.forEach(spec => {
              spec.buyQty = 0
            })

            addPriceItem.specArr = addPriceItemSpecArr;
            addPriceItem.selectSpecItem = {};
            addPriceItem.isShowOption = false;
          }
          else addPriceItem.buyQty = 0
        })

        item.addPrice = addPrice
      } catch (error) {
        throw new Error(error)
      }
    },

    showFavorite(id) {
      let product = products.find(product => product.ID == id)
      methods.showSelect(product)
    },
    async showSelect(item) {
      console.log('showSelect => getAddPrice', item.ID)
      await methods.getAddPrice(item);
      
      state.selectProduct = item;

      setTimeout(() => {
        let event = new Event('resize');
        window.dispatchEvent(event);
      }, 100)
    },

    // favorite
    async getFavorite() {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let user_account = localStorage.getItem('user_account')
      // 登入
      if(user_account) {
        let formData = new FormData();
        formData.append("storeid", site.Name);
        formData.append("phone", user_account);

        try {
          let res = await getFavoriteApi(formData)
          if(res.data.errormessage) {
            await login();
            methods.getFavorite()
            return
          }

          if(!res.data.status) {
            if(res.data.msg == '請先登入會員') {
              localStorage.removeItem('user_account')
              methods.getFavorite()
            }

            state.favorite = {};
            return
          }

          let favorite_list = res.data.datas[0];
          state.favorite = {};
          for(let favorite of favorite_list){
            state.favorite[favorite.Product] = state.products.find(product => product.ID == favorite.Product)
          }
        } catch (error) {
          throw new Error(error)
        }
      }
      // 登出
      else {
        let favoriteObj = JSON.parse(localStorage.getItem(`${site.Name}@favorite`)) || {};

        for(let key in favoriteObj) {
          let item = favoriteObj[key];
          item = state.products.find(product => product.ID === item.ID);
        }

        state.favorite = favoriteObj
      }
    },
    async toggleFavorite(id) {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let user_account = localStorage.getItem('user_account');
      // 登入
      if(user_account) {
        let formData = new FormData();
        formData.append("storeid", site.Name);
        formData.append("phone", user_account);
        formData.append("productid[]", id);

        try {
          let res;
          if(state.favorite[id]) res = await deleteFavoriteApi(formData)
          else res = await addFavoriteApi(formData)

          if(res.data.errormessage) {
            await login();
            methods.toggleFavorite(id)
            return
          }

          if(!res.data.status) {
            if(res.data.msg == '請先登入會員') {
              localStorage.removeItem('user_account');
            }
          }
          methods.getFavorite();
        } catch (error) {
          throw new Error(error)
        }
      }
      // 登出
      else {
        if(state.favorite[id]) delete state.favorite[id];
        else state.favorite[id] = state.products.find(item => item.ID === id);
        localStorage.setItem(`${site.Name}@favorite`, JSON.stringify(state.favorite))
        methods.getFavorite();
      }
    },

    // 主商品 購買數量
    mainTotalQty(main) {
      if(main.specArr) return main.specArr.reduce((accumulator, currentSpec) => accumulator + currentSpec.buyQty, 0)
      else return main.buyQty
    },
  })

  return {
    ...toRefs(state),

    ...toRefs(methods),
  }
})