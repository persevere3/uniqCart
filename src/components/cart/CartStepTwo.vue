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
        <div class="errorMessage">
          {{ info.purchaser_name.message }}
          <span v-if="user_account && info.purchaser_name_error" @click="urlPush(getPathname('info'))"> 前往修改會員姓名 </span> 
        </div>

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

        <label for="feedback">留言給我們</label>
        <textarea name="" id="feedback" cols="30" rows="5" placeholder="留言給我們" v-model="info_message" @input="input_info_message"></textarea>
        <div class="info_messageLength"> {{info_message.length}}/150 </div>
      </div>

      <div class="right">
        <!-- 運送方式 -->
        <label> 運送方式 </label>
        <template v-if="transport_number < 6">
          <div class="custom_option2" :class="{active : transport === '1'}" 
            @click="transport = '1'" v-if="store.Shipping === '1' || store.Shipping === '2'"
          >
            一般宅配
          </div>
          <div class="custom_option2" :class="{active:transport === '2'}" 
            @click="transport = '2'" v-if="store.Shipping === '1' || store.Shipping === '3'"
          > 
            到店自取
          </div>
          <!-- 7-11 -->
          <div class="custom_option2" :class="{active:transport === 'UNIMARTDelivery' || transport === 'UNIMARTC2CDelivery'}" 
            @click="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'" 
            v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
          > 
            7-11 取貨付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'UNIMART' || transport === 'UNIMARTC2C'}" 
            @click="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'" 
            v-if="store.UNIMART || store.UNIMARTC2C"
          > 
            7-11 取貨不付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZEDelivery'}" 
            @click="transport = 'UNIMARTFREEZEDelivery'" 
            v-if="store.UNIMARTFREEZEDelivery"
          > 
            7-11冷凍 取貨付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'UNIMARTFREEZE'}" 
            @click="transport = 'UNIMARTFREEZE'" 
            v-if="store.UNIMARTFREEZE"
          > 
            7-11冷凍 取貨不付款
          </div>

          <!-- 全家 -->
          <div class="custom_option2" :class="{active:transport === 'FAMIDelivery' || transport === 'FAMIC2CDelivery'}" 
            @click="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'" 
            v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
          > 
            全家 取貨付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'FAMI' || transport === 'FAMIC2C'}" 
            @click="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'" 
            v-if="store.FAMI || store.FAMIC2C"
          > 
            全家 取貨不付款
          </div>

          <!-- 萊爾富 -->
          <div class="custom_option2" :class="{active:transport === 'HILIFEDelivery' || transport === 'HILIFEC2CDelivery'}" 
            @click="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'" 
            v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
          > 
            萊爾富 取貨付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'HILIFE' || transport === 'HILIFEC2C'}" 
            @click="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'" 
            v-if="store.HILIFE || store.HILIFEC2C"
          > 
            萊爾富 取貨不付款
          </div>

          <!-- OK超商 -->
          <div class="custom_option2" :class="{active:transport === 'OKMARTC2CDelivery'}" 
            @click="transport = 'OKMARTC2CDelivery'" 
            v-if="store.OKMARTC2CCDelivery"
          > 
            OK超商 取貨付款
          </div>
          <div class="custom_option2" :class="{active:transport === 'OKMARTC2C'}" 
            @click="transport = 'OKMARTC2C'" 
            v-if="store.OKMARTC2C"
          > 
            OK超商 取貨不付款
          </div>
        </template>
        <template v-else>
          <div tabindex="0" class="select" @click="is_show_transport_options = !is_show_transport_options" @blur="is_show_transport_options = false"> 
            <div class="text">{{ transport !== '0' ? transport_obj[transport] : "請選擇運送方式" }}</div>
            <div class="icon" :class="{iconActive:is_show_transport_options}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
            <ul class="option" :class="{showOption:is_show_transport_options}">                                                               
              <li @click.stop="transport = '1'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '2'"> 一般宅配 </li>
              <li @click.stop="transport = '2'; is_show_transport_options = false" v-if="store.Shipping === '1' || store.Shipping === '3'"> 到店自取 </li>

              <!-- 7-11 -->
              <li @click.stop="transport = store.UNIMARTDelivery ? 'UNIMARTDelivery' : 'UNIMARTC2CDelivery'; is_show_transport_options = false" 
                v-if="store.UNIMARTDelivery || store.UNIMARTC2CDelivery"
              > 
                7-11 取貨付款 
              </li>
              <li @click.stop="transport = store.UNIMART ? 'UNIMART' : 'UNIMARTC2C'; is_show_transport_options = false" 
                v-if="store.UNIMART || store.UNIMARTC2C"
              > 
                7-11 取貨不付款 
              </li>
              <li @click.stop="transport = 'UNIMARTFREEZEDelivery'; is_show_transport_options = false" 
                v-if="store.UNIMARTFREEZEDelivery"
              > 
                7-11冷凍 取貨付款 
              </li>
              <li @click.stop="transport = 'UNIMARTFREEZE'; is_show_transport_options = false" 
                v-if="store.UNIMARTFREEZE"
              > 
                7-11冷凍 取貨不付款 
              </li>

              <!-- 全家 -->
              <li @click.stop="transport = store.FAMIDelivery ? 'FAMIDelivery' : 'FAMIC2CDelivery'; is_show_transport_options = false" 
                v-if="store.FAMIDelivery || store.FAMIC2CDelivery"
              > 
                全家 取貨付款 
              </li>
              <li @click.stop="transport = store.FAMI ? 'FAMI' : 'FAMIC2C'; is_show_transport_options = false" 
                v-if="store.FAMI || store.FAMIC2C"
              > 
                全家 取貨不付款 
              </li>

              <!-- 萊爾富 -->
              <li @click.stop="transport = store.HILIFEDelivery ? 'HILIFEDelivery' : 'HILIFEC2CDelivery'; is_show_transport_options = false" 
                v-if="store.HILIFEDelivery || store.HILIFEC2CDelivery"
              > 
                萊爾富 取貨付款 
              </li>
              <li @click.stop="transport = store.HILIFE ? 'HILIFE' : 'HILIFEC2C'; is_show_transport_options = false" 
                v-if="store.HILIFE || store.HILIFEC2C"
              > 
                萊爾富 取貨不付款 
              </li>

              <!-- OK超商 -->
              <li @click.stop="transport = 'OKMARTC2CDelivery'; is_show_transport_options = false" 
                v-if="store.OKMARTC2CCDelivery"
              > 
                OK超商 取貨付款 
              </li>
              <li @click.stop="transport = 'OKMARTC2C'; is_show_transport_options = false" 
                v-if="store.OKMARTC2C"
              > 
                OK超商 取貨不付款 
              </li>
            </ul>
          </div>
        </template>
        <div class="errorMessage" v-if="is_click_finish_order && transport === '0'"> 請選擇配送方式 </div>

        <!-- 支付方式 -->
        <label for="pay_method">支付方式</label>
        <div class="custom_select" v-if="store.paymethodOrder">
          <div class="custom_option2" :class="{active:pay_method === 'CreditCard'}" :style="`order: ${store.paymethodOrder['CreditCard']}`" @click="pay_method = 'CreditCard'" v-if="store.CreditCard != 0 && !is_collection"> 
            信用卡
          </div>
          <div class="custom_option2" :class="{active:pay_method === 'ATM'}" :style="`order: ${store.paymethodOrder['ATM']}`" @click="pay_method = 'ATM'" v-if="store.ATM != 0 && !is_collection"> 
            ATM/網路ATM
          </div>
          <div class="custom_option2" :class="{active:pay_method === 'PayCode'}" :style="`order: ${store.paymethodOrder['PayCode']}`" @click="pay_method = 'PayCode'" v-if="store.PayCode != 0 && !is_collection"> 
            超商代碼
          </div>
          <div class="custom_option2" :class="{active:pay_method === 'PayBarCode'}" :style="`order: ${store.paymethodOrder['PayBarCode']}`" @click="pay_method = 'PayBarCode'" v-if="store.PayBarCode != 0 && !is_collection"> 
            超商條碼
          </div>
          <div class="custom_option2" :class="{active:pay_method === 'PayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'PayOnDelivery'" v-if="store.PayOnDelivery != 0 && !is_store"> 
            取貨付款
          </div>
          <div class="custom_option2" :class="{active:pay_method === 'LinePay'}" :style="`order: ${store.paymethodOrder['LinePay']}`" @click="pay_method = 'LinePay'" v-if="store.LinePay == 1 && !is_collection"> 
            LINE Pay
          </div>

          <!-- 超商取貨付款 -->
          <div class="custom_option2" :class="{active:pay_method === 'MartPayOnDelivery'}" :style="`order: ${store.paymethodOrder['PayOnDelivery']}`" @click="pay_method = 'MartPayOnDelivery'" v-if="is_collection"> 
            超商取貨付款
          </div>
        </div>
        <div class="errorMessage" v-if="is_click_finish_order && pay_method === '0'"> 請選擇支付方式 </div>

        <!-- 一般宅配 地址 -->
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
            @click="info.address.is_show_city = !info.address.is_show_city" 
            tabindex="0" @blur="info.address.is_show_city = false"
          >
            <div class="text"> {{ !info.address.city_active ? "城市 / 縣" : info.address.city_active }} </div>
            <div class="icon" :class="{iconActive:info.address.is_show_city}"> <i class="fa fa-caret-down" aria-hidden="true"></i> </div>
            <ul class="option" :class="{showOption:info.address.is_show_city}">                                                                  
              <li v-for="(value, city) in city_district" :key="key"
                @click.stop="info.address.city_active = city; info.address.is_show_city = false;"
              >
                {{ city }}
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
          <div class="input_container flex">
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

        <!-- 超商取貨 選擇門市 -->
        <template v-if="is_store">
          <label v-if="!storeid" > 請選擇門市 </label>
          <div class="storeInfo" v-else>
            <div v-if="storeid"> 門市店號: {{ storeid }} </div>
            <div v-if="storename"> 門市名稱: {{ storename }} </div>
            <div v-if="storeaddress"> 門市地址: {{ storeaddress }} </div>
          </div>
          <div class="button" @click="pickStore"> 搜尋門市 </div>
          <div class="button2" v-if="!storeid || !storename || !storeaddress" @click="pickStore"> 搜尋門市 </div>
          <div class="button2" v-else @click="pickStore"> 更改門市 </div>
          <div class="errorMessage" v-if="is_click_finish_order && storeaddress == ''"> 請選擇門市 </div>
        </template>

        <!-- 發票 -->
        <template v-if="store.Receipt === '1'">
          <label>發票類型</label>
          <div class="custom_option2" :class="{active:personal_or_company === '個人發票'}"
            @click="personal_or_company = '個人發票'; invoice_type = is_other_invoice_type ? '0' : '1'"
          >
            個人發票
          </div>
          <div class="custom_option2" :class="{active:personal_or_company === '公司發票'}"
            @click="personal_or_company = '公司發票'; invoice_type = '2'"
          > 
            公司發票
          </div>

          <template v-if="personal_or_company === '個人發票' && is_other_invoice_type">
            <label>個人發票類型</label>

            <div class="custom_option2" :class="{active:invoice_type === '1'}" @click="invoice_type = '1'"> 
              個人紙本發票
            </div>
            <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '3'}" @click="invoice_type = '3'"> 
              手機條碼載具
            </div>
            <div v-if="invoice_type === '3'">
              <input type="text" placeholder="手機條碼載具" v-model="phone_barCode">
              <div class="prompt" v-if="is_click_finish_order && phone_barCode === ''"> 請填寫手機條碼載具 </div>
            </div>
            <div class="custom_option2" v-if="store.NatureCode === '1'" :class="{active:invoice_type === '4'}" @click="invoice_type = '4'"> 
              自然人憑證載具
            </div>
            <div v-if="invoice_type === '4'">
              <input type="text" placeholder="自然人憑證載具" v-model="natural_barCode">
              <div class="prompt" v-if="is_click_finish_order && natural_barCode === ''"> 請填寫自然人憑證載具 </div>
            </div>
          </template>

          <div class="prompt" v-if="is_click_finish_order && invoice_type === '0'"> 請選擇發票類型 </div>

          <template v-if="invoice_type==='2'">
            <div>
              <input type="text" id="invoice_title" name="公司抬頭" placeholder="公司抬頭" v-model="invoice_title">
              <div class="errorMessage" v-if="is_click_finish_order && invoice_title === ''"> 請填寫公司抬頭 </div>
            </div>
            <div>
              <input type="text" id="invoice_uniNumber" name="統一編號" placeholder="統一編號" v-model="invoice_uniNumber">
              <div class="errorMessage" v-if="is_click_finish_order && invoice_uniNumber === ''"> 請填寫統一編號 </div>
            </div>
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
  let { stepPage, is_click_finish_order, isOrderIng,
    total_bonus, is_use_bonus, use_bonus, bonus_array,
    transport, transport_obj, is_show_transport_options, pay_method
  } = storeToRefs(useCart())
  let { getTotal, filter_use_bonus } = useCart()
  let { info, has_address, is_save_address, personal_or_company, phone_barCode, natural_barCode,
    invoice_type, invoice_title, invoice_uniNumber, info_message, userInfo, storeid, storename, storeaddress
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

  // computed ==================================================
  const transport_number = computed(() => {
    let number = 0;
    if(store.value.Shipping === '1') number += 2
    if(store.value.Shipping === '2') number += 1
    if(store.value.Shipping === '3') number += 1

    if(store.value.UNIMARTDelivery || store.value.UNIMARTC2CDelivery) number += 1
    if(store.value.UNIMART || store.value.UNIMARTC2C) number += 1
    if(store.value.UNIMARTFREEZEDelivery) number += 1
    if(store.value.UNIMARTFREEZE) number += 1

    if(store.value.HILIFEDelivery || store.value.HILIFEC2CDelivery) number += 1
    if(store.value.HILIFE|| store.value.HILIFEC2C) number += 1

    if(store.value.OKMARTC2C) number += 1
    if(store.value.OKMARTC2CCDelivery) number += 1

    return number
  })

  const is_store = computed(() => {
    if(transport.value == 0) return undefined
    else if(transport.value === '1' || transport.value === '2') return false
    else return true
  })

  const is_collection = computed(() => {
    if(transport.value == 0) return undefined
    else if(transport.value.indexOf('Delivery') > -1) return true
    else return false
  })

  const is_other_invoice_type = computed(() => {
    if(store.value.PhoneCode === '1' || store.value.NatureCode === '1') return true
    return false
  })


  // watch ==================================================
  watch(isSame, (v) => {
    if(v) {
      info.value.receiver_name.value = info.value.purchaser_name.value;
      info.value.receiver_number.value = info.value.purchaser_number.value;
    }
    verify(info.value.receiver_name, info.value.receiver_number)
  })

  watch(transport, (newV, oldV) => {
    if(v.indexOf('Delivery') > -1) pay_method.value = 'MartPayOnDelivery' 
    let newMart = newV.replace('C2CC', '').replace('C2C', '').replace('Delivery', '')
    let oldMart = oldV.replace('C2CC', '').replace('C2C', '').replace('Delivery', '')
    if(newMart != oldMart) {
      storeid.value = ''
      storename.value = ''
      storeaddress.value = ''
    }

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
