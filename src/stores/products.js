import { getCategoriesApi, getProductsApi, getAddPriceApi, getFavoriteApi, deleteFavoriteApi, addFavoriteApi } from '@/api/index';

import { useCommon }  from '@/stores/common/common'

export const useProducts = defineStore('products', () => {
  // store ==================================================
  let { site, user_account } = storeToRefs(useCommon())
  let { login } = useCommon()

  // state ==================================================
  const state = reactive({
    categories: [],
    category: '',

    products: [],
    productsRerndered: false,
    
    //
    selectProduct: {},

    //
    favorite: {},
  })

  // methods ==================================================
  const methods = {
    async getCategories() {
      let params = `Preview=${site.Preview}`;
      try {
        let res = await getCategoriesApi(params)
        if(res.data.errormessage) {
          await login();
          methods.getCategories();
          return
        }

        state.category = '0';
        state.categories = [{ID: "0", Name: "所有分類商品", Show: "1"}, ...res.data.data];
      } catch (error) {
        throw new Error(error)
      }
    },

    async getProducts() {
      let params = `Preview=${site.value.Preview}`;
      try {
        let res = await getProductsApi(params)
        if(res.data.errormessage) {
          await login();
          methods.getProducts()
          return
        }

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
          if(process.env.NODE_ENV === 'development') product.imgArr = product.imgArr.map(img => 'https://demo.uniqcarttest.tk' + img)
          product.mainImgIndex = 0;
          product.categoryArr = [product.Category1, product.Category2, product.Category3, product.Category4, product.Category5]
          product.categoryArr = product.categoryArr.filter(category => category)
          product.allPicLength = product.categoryArr.length;

          product.addPrice = null
        });
        state.products = products

        // nextTick
        setTimeout(() => {
          state.productsRerndered = true;
        }, 1000)
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

      const params = `id=${item.ID}&Preview=${site.value.Preview}`;

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
      // 登入
      if(user_account.value) {
        let formData = new FormData();
        formData.append("storeid", site.value.Name);
        formData.append("phone", user_account.value);

        try {
          let res = await getFavoriteApi(formData)
          if(res.data.errormessage) {
            await login();
            methods.getFavorite()
            return
          }

          if(res.data.status) {
            let favorite_list = res.data.datas[0];
            state.favorite = {};
            for(let favorite of favorite_list){
              state.favorite[favorite.Product] = state.products.find(product => product.ID == favorite.Product)
            }
          }
          else {
            state.favorite = {};

            if(res.data.msg.indexOf('登入') > -1) {
              user_account.value = ''
              methods.getFavorite()
            }
          }
        } catch (error) {
          throw new Error(error)
        }
      }
      // 登出
      else {
        let favoriteObj = JSON.parse(localStorage.getItem(`${site.value.Name}@favorite`)) || {};

        for(let key in favoriteObj) {
          favoriteObj[key] = state.products.find(product => product.ID === favoriteObj[key].ID);
        }

        state.favorite = favoriteObj
      }
    },
    async toggleFavorite(id) {
      // 登入
      if(user_account.value) {
        let formData = new FormData();
        formData.append("storeid", site.value.Name);
        formData.append("phone", user_account.value);
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
            if(res.data.msg.indexOf('登入') > -1) {
              user_account.value = ''
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
        localStorage.setItem(`${site.value.Name}@favorite`, JSON.stringify(state.favorite))
      }
    },

    // 主商品 購買數量
    getMainTotalQty(main) {
      if(main.specArr) return main.specArr.reduce((accumulator, currentSpec) => accumulator + currentSpec.buyQty, 0)
      else return main.buyQty
    },
  }

  return {
    ...toRefs(state),

    ...methods,
  }
})