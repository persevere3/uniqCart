import { loginApi, getSiteApi, getStoreApi, getCategoriesApi } from '@/api/index';

export const useCommon = defineStore('common', () => {
  // state ==================================================
  const state = reactive({
    store: {},
    arrangement: 0,
    categories: [],
    category: '',
    
    showPage: 'main',
    
    // ================================================== 

    isConfirmToPay: false,
    isConfirmIsRegister: false,
    isConfirmATM: false,
    isConfirmRegister: false,

    api: '',
    protocol: ''
  })

  // methods ==================================================
  const methods = {
    // return {isSuccess, message}
    async getSite() {
      try {
        let res = await getSiteApi()
        if(res.data.errormessage) {
          await methods.login();
          return await methods.getSite();
        }

        state.site = res.data.data[0];
        if(!state.site.Site) return {isSuccess: false, message: 'null'}
        localStorage.setItem('site', JSON.stringify(state.site));
        return {isSuccess: true, message: ''}
      } catch (error) {
        throw new Error(error)
      }
    },
    async getStore() {
      let params = `Preview=${state.site.Preview}`;
      try {
        let res = await getStoreApi(params)
        if(res.data.errormessage) {
          await methods.login();
          methods.getStore();
          return
        }

        state.store = res.data.data[0];
        state.arrangement = state.store.Sort || "0";
        document.title = state.store.Name;
        if(process.env.NODE_ENV === 'development') state.store.Logo = 'https://demo.uniqcarttest.tk' + state.store.Logo
      } catch (error) {
        throw new Error(error)
      }
    },
    async getCategories() {
      let params = `Preview=${state.site.Preview}`;
      try {
        let res = await getCategoriesApi(params)
        if(res.data.errormessage) {
          await methods.login();
          methods.getCategories();
          return
        }

        state.category = '0';
        state.categories = [{ID: "0", Name: "所有分類商品", Show: "1"}, ...res.data.data];
      } catch (error) {
        throw new Error(error)
      }
    },

    //
    copy(text, selector){
      let copy_input = document.querySelector(selector);
      copy_input.value = text;
      copy_input.select();
      document.execCommand('copy');
    },

    // 
    urlPush(url, is_open) {
      if(is_open) {
        window.open(url);
      }
      else {
        window.location.href = url;
      }
    },
  }

  return {
    ...toRefs(state),

    ...methods
  }
})