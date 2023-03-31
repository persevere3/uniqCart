import { loginApi, getSiteApi, getStoreApi, getCategoriesApi } from '@/api/index';

export const useCommon = defineStore('common', () => {
  // state ==================================================
  const state = reactive({
    site: {},
    user_account: '',
    store: {},
    arrangement: 0,
    categories: [],
    category: '',
    
    showPage: 'main',

    //
    messageArr: [],
    
    // ================================================== 

    isConfirmToPay: false,
    isConfirmIsRegister: false,
    isConfirmATM: false,
    isConfirmRegister: false,

    api: '',
    protocol: ''
  })

  // methods ==================================================
  const methods = reactive({
    login() {
      state.site = JSON.parse(localStorage.getItem('site')) || {} ;      
      let params = `site=${state.site.Site}&store=${state.site.Name}&Preview=${state.site.Preview}&WebPreview=${state.site.WebPreview}`;
      try {
        loginApi(params)
      }
      catch (error) {
        throw new Error(error)
      }
    },
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
    get_user_account() {
      state.user_account = localStorage.getItem('user_account');
    },
    set_user_account() {
      localStorage.setItem('user_account', state.user_account);
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
    async showMessage(messageStr, isSuccess) {
      let message = state.messageArr.find(message => message.messageStr === messageStr)
      if(message) return

      let id = new Date().getTime();
      state.messageArr.push({
        id,
        messageStr,
        isSuccess,
        messageActive: false,
        messagefadeout: false
      })

      await methods.promiseSetTimeout(() => {
        state.messageArr.find(item => item.id === id).messageActive = true;
      }, 100)

      await methods.promiseSetTimeout(() => {
        state.messageArr.find(item => item.id === id).messagefadeout = true;
      }, 5000)

      await methods.promiseSetTimeout(() => {
        let index = state.messageArr.map(item => item.id).indexOf(id)
        state.messageArr.splice(index, 1);
      }, 500)
    },
    promiseSetTimeout(func, ms) {
      return new Promise(resolve => {
        setTimeout(() => {
          func()
          resolve()
        }, ms)
      })
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
  })

  return {
    ...toRefs(state),

    ...toRefs(methods)
  }
})