<template>
  <div class="stepTwo">
    <div class="title">
      填寫購買人資訊
    </div>
    <form class="info">
      <div class="left">
        <label for="email">購買人Email</label>
        <input type="text" :readonly="userInfo.Email" id="email" placeholder="購買人Email"
          :class="{inputError:info.purchaser_email.is_error}" v-model="info.purchaser_email.value"
          @blur="verify(info.purchaser_email)">
        <div class="prompt">{{ info.purchaser_email.message }}</div>

        <label for="name">購買人姓名</label>
        <input type="text" :readonly="userInfo.Name" id="name" placeholder="姓名" 
          :class="{inputError:info.purchaser_name.is_error}" v-model="info.purchaser_name.value" 
          @blur="verify(info.purchaser_name)" @change="input_purchaser">
        <div class="prompt">{{ info.purchaser_name.message }}</div>

        <label for="phone">購買人手機號碼</label>
        <input type="text" :readonly="userInfo.Phone" id="phone" placeholder="購買人手機號碼" 
          :class="{inputError:info.purchaser_number.is_error}"  v-model="info.purchaser_number.value" 
          @blur="verify(info.purchaser_number)" @change="input_purchaser">
        <div class="prompt">{{ info.purchaser_number.message }}</div>

        <div class="box">
          <input type="checkbox" id="isSame" v-model="isSame">
          <label for="isSame">收件人同購買人資料</label>
        </div>
        
        <label for="rname">收件人姓名</label>
        <input type="text" id="rname" placeholder="收件人姓名"
          :class="{inputError:info.receiver_name.is_error}" v-model="info.receiver_name.value" 
          @blur="verify(info.receiver_name)">
        <div class="prompt">{{ info.receiver_name.message }}</div>

        <label for="rphone">收件人聯絡電話</label>
        <input type="text" id="rphone" placeholder="收件人聯絡電話" 
          :class="{inputError:info.receiver_number.is_error}"  v-model="info.receiver_number.value" 
          @blur="verify(info.receiver_number)">
        <div class="prompt">{{ info.receiver_number.message }}</div>
      </div>

      <div class="right">
        <label for="transport">運送方式</label>
        <select id="transport" v-model="transport" name="運送方式" :class="{inputError:is_click_finish_order && transport === '0'}">
          <option value="0" disabled >=== 請選擇配送方式 ===</option>
          <option value="1" v-if="store.Shipping === '1' || store.Shipping === '2'" selected>一般宅配</option>
          <option value="2" v-if="store.Shipping === '1' || store.Shipping === '3'" selected>到店自取</option>
          <!-- 7-11 -->
          <option value="3" v-if="store.PayOnDelivery != 0" selected> 7-11 取貨付款 </option>
        </select>
        <div class="prompt" v-if="is_click_finish_order && transport === '0'"> 請選擇配送方式 </div>

        <label for="pay_method">支付方式</label>
        <select id="pay_method" v-model="pay_method" name="支付方式" :class="{inputError:is_click_finish_order && pay_method === '0'}">
          <option value="0" disabled >=== 請選擇支付方式 ===</option>
          <option value="CreditCard" v-if="(store.CreditCard != 0 && transport != 3)" selected>信用卡</option>
          <option value="ATM" v-if="(store.ATM != 0 && transport != 3)" selected>ATM/網路ATM</option>
          <option value="PayCode" v-if="(store.PayCode != 0 && transport != 3)" selected>超商代碼</option>
          <option value="PayBarCode" v-if="(store.PayBarCode != 0 && transport != 3)" selected>超商條碼</option>
          <option value="PayOnDelivery" v-if="(store.PayOnDelivery != 0 && transport != 3)" selected>取貨付款</option>
          <option value="LinePay" v-if="store.LinePay == 1 && transport != 3" selected>LINE Pay</option>
          
          <option value="PayOnDelivery" v-if="(store.PayOnDelivery != 0 && transport == 3)" selected> 7-11 取貨付款 </option>
        </select>
        <div class="prompt" v-if="is_click_finish_order && pay_method === '0'"> 請選擇支付方式 </div>

        <template v-if="transport == 1">
          <label>
            收件地址
            <template v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length < 3 && !has_address">
              <input style="margin-left: 10px;" type="checkbox" id="is_save_address" v-model="is_save_address">
              <label for="is_save_address"> 加入常用地址 </label>
            </template>
          </label>
          <select v-model="info.address.city_active" :class="{inputError: is_click_finish_order && info.address.city_active == ''}">
            <option value="" selected > 城市 </option>
            <option :value="key" v-for="(value, key) in city_district" :key="key"> {{ key }} </option>
          </select>
          <select v-model="info.address.district_active" :class="{inputError: is_click_finish_order && info.address.district_active == ''}">
            <option value="" selected > 鄉鎮市區 </option>
            <option :value="district" v-for="(zipCode, district) in city_district[info.address.city_active]" :key="district"> {{ district }} {{ zipCode }} </option>
          </select>
          <div style="display: flex;" class="input_container">
            <input style="width: 100%;" type='text' placeholder="請輸入詳細地址" v-model.trim='info.address.detail_address' :class="{inputError: is_click_finish_order && info.address.detail_address == ''}">
          </div>
          <div class="prompt" v-if="info.address.is_error"> {{ info.address.message }} </div>
          <div class="address" v-if="userInfo.address_obj && Object.keys(userInfo.address_obj).length">
            <div class="address_title"> 常用地址 : </div>
            <ul>
              <li v-for="(item, key) in userInfo.address_obj" :key="key" 
                  @click="info.address.city_active = item.address.split(' ')[0]; 
                          info.address.district_active = item.address.split(' ')[1]; 
                          info.address.detail_address = item.address.split(' ')[2];"
              >  
                {{ item.address }}  
                <i class="fa fa-check" v-if="item.address == receiver_address"></i>
              </li>
            </ul>
          </div>
        </template>

        <template v-if="transport == 3">
          <label> 選擇門市 </label>
          <div class="store_info">
            <div v-if="storeid"> 門市店號: {{ storeid }} </div>
            <div v-if="storename"> 門市名稱: {{ storename }} </div>
            <div v-if="storeaddress"> 門市地址: {{ storeaddress }} </div>
          </div>
          <div class="button" @click="pickStore"> 搜尋門市 </div>
          <div class="prompt" v-if="is_click_finish_order && storeaddress == ''"> 請選擇門市 </div>
        </template>

        <label for="feedback">留言給我們</label>
        <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info_message" @input="input_info_message"></textarea>
        <div class="info_messageLength"> {{info_message.length}}/150 </div>

        <template v-if="store.Receipt === '1'">
          <label for="invoice_type">發票類型</label>
          <select id="invoice_type" v-model="invoice_type" name="發票類型">
            <option value="0" disabled >=== 請選擇發票類型 ===</option>
            <option value="1" >二聯</option>
            <option value="2" >三聯</option>
          </select>
          <div class="prompt" v-if="invoice_type === '0'"> 請選擇發票類型 </div>

          <template v-if="invoice_type==='2'">
            <label for="invoice_title">公司抬頭</label>
            <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
            <div class="prompt" v-if="invoice_title === ''"> 請填寫公司抬頭 </div>
            <label for="invoice_uniNumber">統一編號</label>
            <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
            <div class="prompt" v-if="invoice_uniNumber === ''"> 請填寫統一編號 </div>
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
      <div class="info" v-if="user_account">
        <div class="left">
          <div class="bonus_container">
            購物金餘額: <span class="bonus"> {{numberThousands(total_bonus < 0 ? 0 : total_bonus)}} 點 </span>
          </div>
          <div class="box" v-if="total_bonus * 1">
            <input type="checkbox" id="is_use_bonus" v-model="is_use_bonus" @change="filter_use_bonus"> 
            <label for="is_use_bonus" > 使用購物金 </label>
            <input type="number" placeholder="購物金" v-model="use_bonus" @blur="filter_use_bonus">
          </div>
        </div>
        <div class="right"></div>
      </div>
      <div class="info login" v-else>
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

  watch(transport, () => {
    getTotal(1);
  })

  watch(() => info.value.address.city_active, (newV, oldV) => {
    for(let key in state.city_district[newV]) {
      if(key == info.value.address.district_active) return
    }
    info.value.address.district_active = ''
  }, {deep: true})
  
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
