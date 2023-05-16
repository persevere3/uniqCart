import { loginApi, getSiteApi, getGAApi, getStoreApi } from '@/api/index';

import { useFilters }  from './filters'

export const useCommon = defineStore('common', () => {
  // state ==================================================
  const state = reactive({
    site: {},
    user_account: '',
    store: {},
    arrangement: 0,

    isShowFavorite: false,

    showPage: '',

    //
    messageArr: [],

    //
    webVersion: 'common'
  })

  // methods ==================================================
  const methods = {
    ...useFilters().methods,

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

    appendScript(text, tag) {
      if(!text) return

      // 
      let script_arr = [];

      let scriptItems = text.split('&lt;script');
      scriptItems.splice(0, 1);

      for(let i = 0; i < scriptItems.length; i++) {
        scriptItems[i] = '&lt;script '+ scriptItems[i].trim();
        let attr = scriptItems[i].split('&gt;')[0];

        let content = scriptItems[i].split('&gt;')[1].split("&lt;/script")[0];
        let arr = attr.split(" ");
        let obj = {};
        for(let i = 0; i < arr.length; i++){
          if(arr[i].indexOf('="') != -1){
            obj[arr[i].split('="')[0]] = arr[i].split('="')[1].split('"')[0];
          } 
        }

        let script = document.createElement('script');
        for(let item in obj){
          script.setAttribute(item, obj[item]);
        }
        script.textContent = content;

        script_arr.push(script);
      }

      // 
      for(let i = 0; i < script_arr.length; i++){
        document.querySelector(tag).appendChild(script_arr[i])
      }
    },
    async getGA() {
      let formData = new FormData();
      formData.append("WebPreview", state.site.WebPreview);
      try {
        let res = await getGAApi(formData)
        if(res.data.errormessage) {
          await methods.login();
          methods.getGA();
          return
        }

        let GAText = res.data.data[0].GA;

        if(GAText.indexOf('GTM-') > -1) {
          let GTMID = GAText.split('GTM-')[1].split('\')')[0]

          let noscript = document.createElement('noscript');
          noscript.setAttribute('src', `https://www.googletagmanager.com/ns.html?id=GTM-${GTMID}`);
          noscript.setAttribute('height', '0');
          noscript.setAttribute('width', '0');
          noscript.setAttribute('style', 'display:none; visibility:hidden');

          document.querySelector('body').insertBefore(noscript, document.querySelector('#app'));
        }

        methods.appendScript(GAText, 'head');
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

        let store = res.data.data[0]
        store.paymethodOrder = {}
        if(store.OrderPaymethod) {
          store.OrderPaymethod = JSON.parse(store.OrderPaymethod)
          store.OrderPaymethod.forEach(item => {
            store.paymethodOrder[item.name] = parseInt(item.order)
          })
        }

        state.store = store;
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
    getPathname(page) {
      let pageObj = {
        index: {
          'common': '/',
          'uniqm.com': '/',
          'uniqm.net': '/',
        },
        order: {
          'common': '/order.html',
          'uniqm.com': '/shoppingOrder.html',
          'uniqm.net': '/',
        },
        user: {
          'common': '/user.html',
          'uniqm.com': '/shoppingUser.html',
          'uniqm.net': '/',
        },
        info: {
          'common': '/user_info.html',
          'uniqm.com': '/shoppingInfo.html',
          'uniqm.net': '/',
        },
      }

      return pageObj[page][state.webVersion];
    },
  }

  return {
    ...toRefs(state),

    ...methods
  }
})