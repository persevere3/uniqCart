<template>
  <div class="confirm">
    <div class="frame">
      <div class="border"></div>
      <div class="confirm_title"> 
        <i class="fas fa-registered"></i>
        <div class="text"> 加入會員！ </div>
      </div>
      <div class="form">
        <RegisterInput :input="r_name" />
        <RegisterInput :input="r_phone" />
        <RegisterInput :input="r_verify_code" v-if="store.NotificationSystem == 1 || store.NotificationSystem == 2" />
        <RegisterInput :input="r_mail" />
        <RegisterInput :input="r_verify_code2" v-if="store.NotificationSystem == 0 || store.NotificationSystem == 2" />

        <div class="button" style="margin-bottom: 20px;" @click="send_verify_code"> 獲取驗證碼 <span v-if="second > 0"> ( {{ second }}s ) </span> </div>
        <RegisterInput :input="r_birthday" />
        <div class="radio_container">
          <div class="radio">
            <input type="radio" name="sex" id="male" value="male" v-model="sex">
            <div class="circle" v-show="sex == 'male'"> </div>
          </div>
          <label for="male"> 男 </label>
          <div class="radio">
            <input type="radio" name="sex" id="female" value="female" v-model="sex">
            <div class="circle" v-show="sex == 'female'"> </div>
          </div>
          <label for="female"> 女 </label>
        </div>

        <RegisterInput :input="r_password" />
        <RegisterInput :input="r_confirm_password" />

        <div class="agree_container">
          <div class="checkbox">
            <input type="checkbox" name="" id="agree" v-model="r_is_agree">
            <i class="fas fa-check" v-show="r_is_agree"></i>
          </div>
          <label for="agree"> 我已同意 </label>
          <div class="modal_text" @click="is_userModal = true"> 會員條款與隱私權政策 </div>
        </div>
      </div>
      <div class="buttonGroup">
        <div class="button cancel" @click="isConfirmRegister = false; toPay()"> 
          <template v-if="pay_method != 'PayOnDelivery' && pay_method != 'MartPayOnDelivery'">
            前往付款頁面 
          </template>
          <template v-else>
            取消
          </template>
        </div>
        <div class="button determine" :class="{ disabled: !r_is_agree }" @click="register"> 註冊 </div>
      </div>
    </div>

    <!-- 會員條款與隱私權政策 modal -->
    <div class="member_and_privacy_container" v-if="is_userModal">
      <div class="close" @click="is_userModal = false;">
        <i class="fas fa-times"></i>
      </div>
      <div class="modal">
        <div class="content" v-html="unescapeHTML(site.TermsNotices)"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import RegisterInput from '@/components/register/RegisterInput.vue'

  // api ==================================================
  import { send_verify_codeApi, registerApi } from '@/api/index'

  // store ==================================================
  import { useCommon } from '@/stores/common/common'
  import { useHandlerCart } from '@/stores/handlerCart'
  import { useInfo } from '@/stores/info'
  import { useVerify } from '@/stores/verify'

  let { site, store } = storeToRefs(useCommon())
  let { login, showMessage } = useCommon()
  let { unescapeHTML } = useCommon()
  let { isConfirmRegister } = storeToRefs(useHandlerCart())
  let { toPay } = useHandlerCart()
  let { info, pay_method } = storeToRefs(useInfo())
  let { verify } = useVerify()

  // state ==================================================
  const state = reactive({
    r_name: {
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
      readonly: true,
      placeholder: '* 請輸入姓名',
    },
    r_phone: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
        cellphone: {
          message: '手機格式錯誤'
        }
      },
      is_error: false,
      message: '',
      readonly: true,
      placeholder: '* 請輸入手機(帳號)',
    },
    r_verify_code: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
        length: {
          min: 6,
          max: 6,
          message: '驗證碼為6位',
        }
      },
      is_error: false,
      message: '',
      readonly: false,
      placeholder: '* 請輸入手機驗證碼',
    },
    r_mail: {
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
      readonly: true,
      placeholder: '* 請輸入電子信箱',
    },
    r_verify_code2: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
        length: {
          min: 6,
          max: 6,
          message: '驗證碼為6位',
        }
      },
      is_error: false,
      message: '',
      readonly: false,
      placeholder: '* 請輸入電子信箱驗證碼',
    },

    second: 0,
    r_birthday: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
      },
      is_error: false,
      message: '',
      readonly: false,
      placeholder: '* 請輸入生日',
      type: 'date'
    },
    sex: 'male',
    
    r_password: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
        length: {
          min: 8,
          message: '不得少於8位',
        }
      },
      is_error: false,
      message: '',
      readonly: false,
      placeholder: '* 請輸入密碼',
      type: 'password',
      visible: false,
    },
    r_confirm_password: {
      value: '',
      rules: {
        required: {
          message: '此項目為必填'
        },
        confirm: {
          password: '',
          message: '密碼不正確',
        }
      },
      is_error: false,
      message: '',
      readonly: false,
      placeholder: '* 請再次輸入密碼',
      type: 'password',
      visible: false,
    },

    r_is_agree: false,

    // 會員條款與隱私權政策
    is_userModal: false,
  })
  let { r_name, r_phone, r_verify_code, r_mail, r_verify_code2, second, r_birthday, sex, r_password, r_confirm_password, r_is_agree, is_userModal } = toRefs(state)
  r_confirm_password.value.rules.confirm.password = r_password.value

  // onMounted ==================================================
  onMounted(() => {
    state.r_phone.value = info.value.purchaser_number.value;
    state.r_name.value = info.value.purchaser_name.value;
    state.r_mail.value = info.value.purchaser_email.value;
  })
  
  // methods ==================================================
  async function send_verify_code() {
    if(state.second > 0) return

    if(store.value.NotificationSystem == 0) {
      if( !verify(state.r_mail) ) return
    }
    else if(store.value.NotificationSystem == 1) {
      if( !verify(state.r_phone) ) return
    }
    else {
      if( !verify(state.r_phone) || !verify(state.r_mail) ) return
    }

    let formData = new FormData();
    formData.append("phone", state.r_phone.value.trim());
    formData.append("mail", state.r_mail.value.trim());

    formData.append("notificationsystem", store.value.NotificationSystem)
    formData.append("type", store.value.NotificationSystem)

    formData.append("storeName", store.value.Name);
    formData.append("storeid", site.value.Name);

    try {
      let res = await send_verify_codeApi(formData)
      if(res.data.errormessage) {
        await login();
        methods.send_verify_code()
        return
      }

      if(res.data.status) {
        state.second = 300;
        let interval =  setInterval(() => {
          state.second -= 1;
          if(state.second < 1){
            clearInterval(interval);
          }
        }, 1000)
        showMessage(res.data.msg, true)
      } else {
        showMessage(res.data.msg, false)
      }
    } catch (error) {
      throw new Error(error)
    }
  }
  async function register() {
    if (!state.r_is_agree) return

    let verify_code = [];
    if(store.value.NotificationSystem == 0) {
      verify_code.push(state.r_verify_code2)
    }
    else if(store.value.NotificationSystem == 1) {
      verify_code.push(state.r_verify_code)
    }
    else {
      verify_code.push(state.r_verify_code)
      verify_code.push(state.r_verify_code2)
    }

    if (!verify(state.r_name, state.r_mail, state.r_birthday, state.r_phone, ...verify_code, state.r_password, state.r_confirm_password)) {
      return
    }
    
    let formData = new FormData();
    formData.append("storeid", site.value.Name);
    formData.append("phone", state.r_phone.value);
    
    if(store.value.NotificationSystem == 0) {
      formData.append("validate2", state.r_verify_code2.value);
    }
    else if(store.value.NotificationSystem == 1) {
      formData.append("validate", state.r_verify_code.value);
    }
    else {
      formData.append("validate", state.r_verify_code.value);
      formData.append("validate2", state.r_verify_code2.value);
    }
    formData.append("type", store.value.NotificationSystem)

    formData.append("name", state.r_name.value);
    formData.append("email", state.r_mail.value);
    formData.append("password", state.r_password.value);
    let b = state.r_birthday.value
    let birthday
    if(b) {
      birthday = `${b.getFullYear()}/${b.getMonth() + 1 < 10  ? '0' : '' }${b.getMonth() + 1}/${b.getDate() < 10  ? '0' : '' }${b.getDate()}`
    }
    else {
      birthday = ''
    }
    formData.append("birthday", birthday);
    formData.append("gender", state.sex == 'male' ? 1 : 0 );
    formData.append("recommender", '');

    try {
      let res = await registerApi(formData)
      if(res.data.errormessage) {
        await login();
        methods.register()
        return
      }

      if(res.data.status){
        showMessage(res.data.msg, true)
        setTimeout(function() {
          isConfirmRegister.value = false;
          toPay()
        }, 3000)
      }
      else{
        showMessage(res.data.msg, false)
      }
    } catch (error) {
      throw new Error(error)
    }
  }
</script>
