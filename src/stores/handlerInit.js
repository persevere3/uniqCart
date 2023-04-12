import { storeToRefs } from 'pinia'
import { useCommon } from './common'
import { useCart } from './cart'
import { useInfo } from './info'
import { useHandlerProducts } from './handlerProducts'

export const useHandlerInit = defineStore('handlerInit', () => {
  // store ==================================================
  let { test, site, user_account, login, getSite, get_user_account, getStore, getCategories, showMessage } = storeToRefs(useCommon())
  let { bonus_array } = storeToRefs(useCart())
  let { getUserInfo } = storeToRefs(useInfo())
  let { getProductsHandler } = storeToRefs(useHandlerProducts())

  console.log(storeToRefs(useCommon()))

  // methods ==================================================
  const methods = reactive({
    async getSiteHandler() {
      let res = await getSite.value()
      if(res.isSuccess) {
        get_user_account()
        getStore();
        getCategories();
        getProductsHandler();
        getUserInfo(user_account);
        
        if(site.FeedbackFund) bonus_array = JSON.parse(site.FeedbackFund)
      }
    },
    
    async getUserInfoHandler() {
      let res = await getUserInfo(user_account)
      if(res.message === 'login') {
        await login();
        methods.getUserInfoHandler()
        return
      }
    },
  })

  return {
    ...toRefs(methods)
  }
})