<template>
  <div class="stepTwo">
    <div class="title">
      填寫購買人資訊
    </div>
    <form class="info">
      <div class="left">
        <label for="email">購買人Email</label>
        <input type="text" id="email" placeholder="購買人Email"
          :readonly="(user_account && userInfo.Registermethod == 2) ? false : userInfo.Email"
          :class="{inputError:info.purchaser_email.is_error}"
          v-model="info.purchaser_email.value"
          @blur="verify(info.purchaser_email)"
        >
        <div class="errorMessage">{{ info.purchaser_email.message }}</div>


        <label for="name">購買人姓名</label>
        <input type="text" id="name" placeholder="姓名"
          :readonly="userInfo.Registermethod < 2"
          :class="{inputError:info.purchaser_name.is_error}"
          v-model="info.purchaser_name.value" 
          @blur="verify(info.purchaser_name)" @change="input_purchaser"
        >
        <div class="errorMessage">{{ info.purchaser_name.message }}</div>

        <label for="phone">購買人手機號碼</label>
        <input type="text" id="phone" placeholder="購買人手機號碼" 
          :readonly="userInfo.Phone2"
          :class="{inputError:info.purchaser_number.is_error}"
          v-model="info.purchaser_number.value" 
          @blur="verify(info.purchaser_number)" @change="input_purchaser"
        >
        <div class="errorMessage">{{ info.purchaser_number.message }}</div>

        <div class="custom_option isSame" @click="isSame = !isSame">
          <label>收件人同購買人資料</label>
          <i class="fa-regular fa-square-check" v-if="isSame"></i>
          <i class="fa-regular fa-square" v-else></i>
        </div>
        
        <label for="rname">收件人姓名</label>
        <input type="text" id="rname" placeholder="收件人姓名"
          :class="{inputError:info.receiver_name.is_error}" v-model="info.receiver_name.value" 
          @blur="verify(info.receiver_name)">
        <div class="errorMessage">{{ info.receiver_name.message }}</div>

        <label for="rphone">收件人聯絡電話</label>
        <input type="text" id="rphone" placeholder="收件人聯絡電話" 
          :class="{inputError:info.receiver_number.is_error}"  v-model="info.receiver_number.value" 
          @blur="verify(info.receiver_number)">
        <div class="errorMessage">{{ info.receiver_number.message }}</div>
      </div>

      <div class="right">
        <label for="transport">運送方式</label>
        <div class="custom_option" @click="transport = '1'" v-if="store.Shipping === '1' || store.Shipping === '2'"> 
          一般宅配
          <i class="fa-regular fa-square-check" v-if="transport === '1'"></i>
          <i class="fa-regular fa-square" v-else></i>
        </div>
        <div class="custom_option" @click="transport = '2'" v-if="store.Shipping === '1' || store.Shipping === '3'"> 
          到店自取
          <i class="fa-regular fa-square-check" v-if="transport === '2'"></i>
          <i class="fa-regular fa-square" v-else></i>
        </div>
        <div class="custom_option" @click="transport = '3'" v-if="store.PayOnDelivery != 0"> 
          7-11 取貨付款
          <i class="fa-regular fa-square-check" v-if="transport === '3'"></i>
          <i class="fa-regular fa-square" v-else></i>
        </div>
        <div class="errorMessage" v-if="is_click_finish_order && transport === '0'"> 請選擇配送方式 </div>

        <label for="pay_method">支付方式</label>
        <div class="custom_select">
          <div class="custom_option" :style="`order: ${store.paymethodOrder['CreditCard']}`" @click="pay_method = 'CreditCard'" v-if="(store.CreditCard != 0 && transport != 3)"> 
            信用卡
            <i class="fa-regular fa-square-check" v-if="pay_method === 'CreditCard'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['ATM']}`" @click="pay_method = 'ATM'" v-if="(store.ATM != 0 && transport != 3)"> 
            ATM/網路ATM
            <i class="fa-regular fa-square-check" v-if="pay_method === 'ATM'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['PayCode']}`" @click="pay_method = 'PayCode'" v-if="(store.PayCode != 0 && transport != 3)"> 
            超商代碼
            <i class="fa-regular fa-square-check" v-if="pay_method === 'PayCode'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['PayBarCode']}`" @click="pay_method = 'PayBarCode'" v-if="(store.PayBarCode != 0 && transport != 3)"> 
            超商條碼
            <i class="fa-regular fa-square-check" v-if="pay_method === 'PayBarCode'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'PayOnDelivery'" v-if="(store.PayOnDelivery != 0 && transport != 3)"> 
            取貨付款
            <i class="fa-regular fa-square-check" v-if="pay_method === 'PayOnDelivery'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['LinePay']}`" @click="pay_method = 'LinePay'" v-if="store.LinePay == 1 && transport != 3"> 
            LINE Pay
            <i class="fa-regular fa-square-check" v-if="pay_method === 'LinePay'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'PayOnDelivery'" v-if="store.PayOnDelivery != 0 && transport == 3"> 
            7-11 取貨付款
            <i class="fa-regular fa-square-check" v-if="pay_method === 'PayOnDelivery'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
        </div>
        <div class="errorMessage" v-if="is_click_finish_order && pay_method === '0'"> 請選擇支付方式 </div>

        <template v-if="transport == 1">
          <label>
            收件地址
            <template v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length < 3 && !has_address">
              <input style="margin-left: 10px;" type="checkbox" id="is_save_address" v-model="is_save_address">
              <label for="is_save_address"> 加入常用地址 </label>
            </template>
          </label>

          <div class="select"
            :class="{selectError: is_click_finish_order && !info.address.city_active}" 
            @click="info.address.is_show_city = !info.address.is_show_city" tabindex="0" 
            @blur="info.address.is_show_city = false"
          >
            <div class="text"> {{ !info.address.city_active ? "城市 / 縣" : info.address.city_active }} </div>
            <div class="icon" :class="{iconActive:info.address.is_show_city}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
            <ul class="option" :class="{showOption:info.address.is_show_city}">                                                                  
              <li v-for="(value, key) in city_district" :key="key" @click.stop="info.address.city_active = key; info.address.is_show_city = false;">
                {{key}}
              </li>
            </ul>
          </div>

          <div class="select"
            :class="{selectError: is_click_finish_order && !info.address.district_active}" 
            @click="city_district[info.address.city_active] ? info.address.is_show_district = !info.address.is_show_district : ''" 
            tabindex="0" @blur="info.address.is_show_district = false"
          >
            <div class="text"> {{ !info.address.district_active ? "地區" : info.address.district_active }} </div>
            <div class="icon" :class="{iconActive:info.address.is_show_district}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
            <ul class="option" :class="{showOption:info.address.is_show_district}">                                                                  
              <li v-for="(zipCode, district) in city_district[info.address.city_active]" :key="district" @click.stop="info.address.district_active = district; info.address.is_show_district = false;">
                {{ district }} {{ zipCode }}
              </li>
            </ul>
          </div>

          <div style="display: flex;" class="input_container">
            <input style="width: 100%;" type='text' placeholder="請輸入詳細地址" v-model.trim='info.address.detail_address' :class="{inputError: is_click_finish_order && info.address.detail_address == ''}">
          </div>
          <div class="errorMessage" v-if="info.address.is_error"> {{ info.address.message }} </div>

          <div class="addressOption" v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length">
            <label> 常用地址 : </label>
            <div class="custom_select">
              <div class="custom_option"  v-for="(item, key) in userInfo.address_obj" :key="key"
                @click="info.address.city_active = item.address.split(' ')[0]; 
                        info.address.district_active = item.address.split(' ')[1]; 
                        info.address.detail_address = item.address.split(' ')[2];"
              > 
                {{ item.address }} 
                <i class="fa-regular fa-square-check" v-if="item.address == receiver_address"></i>
                <i class="fa-regular fa-square" v-else></i>
              </div>
            </div>
          </div>
        </template>

        <template v-if="transport == 3">
          <label> 選擇門市 </label>
          <div class="storeInfo">
            <div v-if="storeid"> 門市店號: {{ storeid }} </div>
            <div v-if="storename"> 門市名稱: {{ storename }} </div>
            <div v-if="storeaddress"> 門市地址: {{ storeaddress }} </div>
          </div>
          <div class="button" @click="pickStore"> 搜尋門市 </div>
          <div class="errorMessage" v-if="is_click_finish_order && storeaddress == ''"> 請選擇門市 </div>
        </template>

        <label for="feedback">留言給我們</label>
        <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info_message" @input="input_info_message"></textarea>
        <div class="info_messageLength"> {{info_message.length}}/150 </div>

        <template v-if="store.Receipt === '1'">
          <label>發票類型</label>
          <div class="custom_option" @click="invoice_type = '1'"> 
            二聯
            <i class="fa-regular fa-square-check" v-if="invoice_type === '1'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="custom_option" @click="invoice_type = '2'"> 
            三聯
            <i class="fa-regular fa-square-check" v-if="invoice_type === '2'"></i>
            <i class="fa-regular fa-square" v-else></i>
          </div>
          <div class="errorMessage" v-if="invoice_type === '0'"> 請選擇發票類型 </div>

          <template v-if="invoice_type==='2'">
            <label for="invoice_title">公司抬頭</label>
            <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
            <div class="errorMessage" v-if="invoice_title === ''"> 請填寫公司抬頭 </div>
            <label for="invoice_uniNumber">統一編號</label>
            <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
            <div class="errorMessage" v-if="invoice_uniNumber === ''"> 請填寫統一編號 </div>
          </template>
        </template>
      </div>
    </form>

    <!--  有點數 或 有設定回饋% -->
    <template v-if="total_bonus * 1 || bonus_array.length">
      <div class="title">
        購物金 
        <span v-if="bonus_array.length">
          (<span v-if="!user_account" > 會員 </span>
          <span> 訂單完成後 </span>
          <template v-for="item in bonus_array">
            <template v-if="item.shipping">
              <template v-if="item.lower == 0">
                ，消費即送 {{ item.shipping }}% 購物金
              </template>
              <template v-else>
                ，滿 NT${{ numberThousands(item.lower) }} 送 {{ item.shipping }}% 購物金 
              </template>
            </template>
          </template>)
        </span>
      </div>
      <div class="bonus" v-if="user_account">
        <div class="leftBonus">
          購物金餘額 : {{numberThousands(total_bonus < 0 ? 0 : total_bonus)}} 點
        </div>

        <div class="custom_option" @click="is_use_bonus = !is_use_bonus" v-if="total_bonus * 1">
          <i class="fa-regular fa-square-check" v-if="is_use_bonus"></i>
          <i class="fa-regular fa-square" v-else></i>
          使用購物金
          <input type="number" placeholder="購物金" v-model="use_bonus" @click.stop @blur="filter_use_bonus">
        </div>
      </div>
      <div class="noLogin" v-else>
        請先 <span class="a" @click="urlPush(getPathname('user'))"> 登入會員 </span>
      </div>
    </template>

    <CartStepTotal />
    
    <div class="buttonGroup">
      <div class="button" @click="stepPage = 1">上一步</div>
      <div class="button" @click="checkOrder()">
        <i  v-show="isOrderIng" class="fas fa-spinner fa-spin" style="margin-right: 5px"></i>
        完成訂單
      </div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import CartStepTotal from '@/components/cart/CartStepTotal.vue'

  import city_district_json from '@/json/city_district.json'

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useCart }  from '@/stores/cart'
  import { useInfo }  from '@/stores/info'
  import { useVerify }  from '@/stores/verify'
  import { useHandlerCommon }  from '@/stores/handlerCommon'
  import { useHandlerCart }  from '@/stores/handlerCart'

  let { store, user_account } = storeToRefs(useCommon())
  let { urlPush, getPathname } = useCommon()
  let { numberThousands } = useCommon()
  let { stepPage, is_click_finish_order, isOrderIng, transport, pay_method,
    total_bonus, is_use_bonus, use_bonus, bonus_array 
  } = storeToRefs(useCart())
  let { getTotal, filter_use_bonus } = useCart()
  let { info, has_address, is_save_address, invoice_type, invoice_title,
    invoice_uniNumber, info_message, userInfo, storeid, storename, storeaddress
  } = storeToRefs(useInfo())
  let { verify } = useVerify()
  let { pickStore } = useHandlerCommon()
  let { receiver_address } = storeToRefs(useHandlerCart())
  let { checkOrder } = useHandlerCart()

  // props ==================================================
  let props = defineProps(['main', 'addPrice', 'event'])

  // state ==================================================
  const state = reactive({
    isSame: false,
    city_district: city_district_json
  })
  let { isSame, city_district } = toRefs(state)

  // watch ==================================================
  watch(isSame, (v) => {
    if(v) {
      info.value.receiver_name.value = info.value.purchaser_name.value;
      info.value.receiver_number.value = info.value.purchaser_number.value;
    }
    verify(info.value.receiver_name, info.value.receiver_number)
  })

  watch(transport, (v) => {
    if(v == 3) pay_method.value = 'PayOnDelivery'
    getTotal(1);
  })

  watch(() => info.value.address.city_active, (newV, oldV) => {
    for(let key in state.city_district[newV]) {
      if(key == info.value.address.district_active) return
    }
    info.value.address.district_active = ''
  }, {deep: true})

  watch(() => [info.value.address.city_active, info.value.address.district_active, info.value.address.detail_address], () => {
    if(is_click_finish_order.value) verify(info.value.address)
  }, {deep: true})

  // watch(is_use_bonus, () => {
  //   filter_use_bonus()
  // })
  
  // methods ==================================================
  // 同步 購買人 收件人 資訊 
  function input_purchaser() {
    if(state.isSame) {
      info.value.receiver_name.value = info.value.purchaser_name.value;
      info.value.receiver_number.value = info.value.purchaser_number.value;
      verify(info.value.receiver_name, info.value.receiver_number)
    }
  }
  // 留言字數控制在150以下
  function input_info_message() {
    if(info_message.value.length > 150) info_message.value = info_message.value.substring(0, 150);
  }
</script>
