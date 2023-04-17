import { getSiteApi, getStoreApi } from '@/api/index';

export const useAll = defineStore('all', () => {
  // state ==================================================
  const state = reactive({
    site: {},
    user_account: '',
    store: {},
    arrangement: 0,

    showPage: 'main',

    //
    messageArr: [],

    // ??? 
    isConfirmToPay: false,
    isConfirmIsRegister: false,
    isConfirmATM: false,
    isConfirmRegister: false,
  })

  // methods ==================================================
  const methods = {
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

    async getSite() {
      try {
        let res = await getSiteApi()
        if(res.data.errormessage) {
          await methods.login();
          methods.getSite();
          return
        }

        state.site = res.data.data[0];
        localStorage.setItem('site', JSON.stringify(state.site));
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
    copy(text, selector) {
      let copy_input = document.querySelector(selector);
      copy_input.value = text;
      copy_input.select();
      document.execCommand('copy');
    },

    // 
    urlPush(url, is_open) {
      if(is_open) window.open(url);
      else window.location.href = url;
    },
  }

  return {
    ...toRefs(state),

    ...methods
  }
})