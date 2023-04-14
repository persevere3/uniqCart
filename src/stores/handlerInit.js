import { storeToRefs } from 'pinia'

import { useAll }  from '@/stores/all'
import { useCommon } from './common'
import { useCart } from './cart'
import { useInfo } from './info'
import { useHandlerProducts } from './handlerProducts'

export const useHandlerInit = defineStore('handlerInit', () => {
  // store ==================================================
  let { site, user_account } = storeToRefs(useAll())
  let { login } = useAll()
  let { getSite, getStore, getCategories } = useCommon()
  let { bonus_array } = storeToRefs(useCart())
  let { getUserInfo } = useInfo()
  let { getProductsHandler } = useHandlerProducts()

  // methods ==================================================
  const methods = {
    async getSiteHandler() {
      let res = await getSite()
      if(res.isSuccess) {
        user_account.value = localStorage.getItem('user_account')
        getStore();
        getCategories();
        getProductsHandler();
        getUserInfo();
        
        if(site.value.FeedbackFund) bonus_array.value = JSON.parse(site.value.FeedbackFund)
      }
    },
    
    async getUserInfoHandler() {
      let res = await getUserInfo()
      if(res.message === 'login') {
        await login();
        methods.getUserInfoHandler()
        return
      }
    },
  }

  return {
    ...methods
  }
})