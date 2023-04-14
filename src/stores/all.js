

export const useAll = defineStore('all', () => {
  // state ==================================================
  const state = reactive({
    site: {},
    user_account: '',

    //
    messageArr: [],
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
  }

  return {
    ...toRefs(state),

    ...methods
  }
})