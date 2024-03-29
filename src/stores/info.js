import { getUserInfoApi } from '@/api/index'

import { useCommon }  from '@/stores/common/common'

export const useInfo = defineStore('info', () => {
  // store ==================================================
  let { site, user_account } = storeToRefs(useCommon())
  let { login } = useCommon()

  // state ==================================================
  const state = reactive({
    info: {
      purchaser_email: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          mail: {
            message: 'email格式不符',
          }
        },
        is_error: false,
        message: '',
      },
      purchaser_name: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          name: {
            message: '請輸入全中文或全英文'
          },
          nameLength: {
            message: '中文長度請介於2~5，英文長度請介於4~10'
          },
        },
        is_error: false,
        message: '',
      },
      purchaser_number: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          cellphone: {
            message: '格式錯誤'
          }
        },
        is_error: false,
        message: '',
      },
      receiver_name: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          name: {
            message: '請輸入全中文或全英文'
          },
          nameLength: {
            message: '中文長度請介於2~5，英文長度請介於4~10'
          },
        },
        is_error: false,
        message: '',
      },
      receiver_number: {
        value: '',
        rules: {
          required: {
            message: '此項目為必填'
          },
          cellphone: {
            message: '格式錯誤'
          }
        },
        is_error: false,
        message: '',
      },

      //
      address: {
        city_active: '',
        is_show_city: false,
        district_active: '',
        is_show_district: false,
        detail_address: '',
        rules: {
          required: {
            message: '請輸入收件地址'
          },
        },
        is_error: false,
        message: '',
      },
    },
    has_address: false,
    is_save_address: false,

    // 
    storeid: '',
    storename: '',
    storeaddress: '',

    //
    info_message:'',

    //
    invoice_type: '0',
    personal_or_company: '',
    // is_show_personal_or_company_options: false,
    phone_barCode: '',
    natural_barCode: '',
    invoice_title: '',
    invoice_uniNumber: '',

    // 
    userInfo: {}
  })

  // methods ==================================================
  const methods = {
    async getUserInfo() {
      let formData = new FormData();
      formData.append("storeid", site.value.Name);
      formData.append("phone", user_account.value);
      try {
        let res = await getUserInfoApi(formData)
        if(res.data.errormessage) {
          await login();
          methods.getUserInfo()
          return
        }

        if(res.data.status) {
          state.userInfo = res.data.datas[0][0]
          state.userInfo.address_obj = methods.createAddressObj(decodeURI(state.userInfo.Adress))

          state.info.purchaser_email.value = state.userInfo.Email;
          state.info.purchaser_name.value = state.userInfo.Name;
          state.info.purchaser_number.value = state.userInfo.Phone2;

          state.phone_barCode   = state.userInfo.PhoneCode;
          state.natural_barCode  = state.userInfo.NatureCode;
          if(state.userInfo.ThreeLinkCode) {
            let invoice_arr = state.userInfo.ThreeLinkCode.split('|')
            if(!state.invoice_title) state.invoice_title = invoice_arr[0] || ''
            if(!state.invoice_uniNumber) state.invoice_uniNumber = invoice_arr[1] || ''
          }
        }
        else {
          user_account.value = '';
        }
      } catch (error) {
        throw new Error(error)
      }
    },
    createAddressObj(address) {
      // userInfo.Adress => userInfo.address_obj
      // id: {id, address(`${city} ${district} ${detail}`)}
      let address_obj = {};
      let address_arr = address.split('_#_');
      address_arr.length -= 1;
      for(let address of address_arr) {
        let item = address.split('_ _');
        address_obj[item[0]] = {
          id: item[0],
          address: `${item[1]} ${item[2]} ${item[3]}`,
        }
      }
      return address_obj;
    }
  }

  return {
    ...toRefs(state),

    ...methods
  }
})