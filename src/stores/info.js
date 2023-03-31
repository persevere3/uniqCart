import { getUserInfoApi } from '@/api/index'

export const useInfo = defineStore('info', () => {

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
        district_active: '',
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

    // 運送方式
    transport: '0', // 1一般宅配 2到店自取
    // 支付方式, PayType: store[pay_method]
    pay_method: '0', // CreditCard ATM PayCode PayBarCode PayOnDelivery LinePay

    //
    info_message:'',

    //
    invoice_type: '0',
    invoice_title: '',
    invoice_uniNumber: '',

    // 
    userInfo: {}
  })

  // methods ==================================================
  const methods = reactive({
    async getUserInfo(origin_user_account) {
      let site = JSON.parse(localStorage.getItem('site')) || {} ;
      let user_account = localStorage.getItem('user_account') ;
      let formData = new FormData();
      formData.append("storeid", site.Name);
      formData.append("phone", user_account);
      try {
        let res = await getUserInfoApi(formData)
        if(res.data.errormessage) return {isSuccess: false, message: 'login'}

        if(res.data.status) {
          state.userInfo = res.data.datas[0][0]
          state.userInfo.address_obj = methods.createAddressObj(state.userInfo.address)

          state.info.purchaser_email.value = userInfo.Email;
          state.info.purchaser_name.value = userInfo.Name;
          state.info.purchaser_number.value = userInfo.Phone;

          return {isSuccess: true, message: ''}
        }
        else {
          state.userInfo = {};

          // 登入 => 登出
          if(origin_user_account != user_account) {
            info.purchaser_email.value = '';
            info.purchaser_name.value = '';
            info.purchaser_number.value = '';
            info.receiver_name.value = '';
            info.receiver_number.value = '';
          }

          return {isSuccess: false, message: 'logout'}
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
      for(let address of address_arr){
        let item = address.split('_ _');
        address_obj[item[0]] = {
          id: item[0],
          address: `${item[1]} ${item[2]} ${item[3]}`,
        }
      }
      return address_obj;
    }
  })

  return {
    ...toRefs(state),

    ...toRefs(methods)
  }
})