<template>
  <div class="selectProduct">
    <div class="background">
      <div class="close" v-if="!isSingleProduct" @click="selectProduct = {}"> <i class="fa fa-times" aria-hidden="true"></i> </div>
      <div class="picContent">
        <div class="pic">
          <div class="mainPic" :style="{backgroundImage :`url(${selectProduct.imgArr[selectProduct.mainImgIndex]})`}"></div>
          <div class="allPic">
            <swiper :slides-per-view="3" @swiper="onSwiper">
              <swiper-slide          
                v-for="(item, index) in selectProduct.imgArr" :key="`${item}_${index}`"
                :class="{active:selectProduct.mainImgIndex === index}"
              >
                <div class="border"></div>
                <img :src="item" @click="selectProduct.mainImgIndex = index" alt="">
              </swiper-slide>
            </swiper>
            <div class="controler">
              <div class="prev" @click="useSwiper.slidePrev()"> <i class="fa-solid fa-caret-left"></i> </div>
              <div class="next" @click="useSwiper.slideNext()"> <i class="fa-solid fa-caret-right"></i> </div>
            </div>
          </div>
        </div>
        <div class="content">
            <div class="name">{{selectProduct.Name}}</div>
            <div class="price origin" v-if="parseInt(selectProduct.Price) > -1">NT$ {{numberThousands(selectProduct.Price)}}</div>
            <div class="price">NT$ {{numberThousands(selectProduct.NowPrice)}}</div>
            <div class="name"> <div v-html="unescapeEnter(selectProduct.Content)"></div> </div>

            <ProductBuyQtyBox :main="selectProduct" />

            <div class="goTo_cart_btn" v-if="!isSingleProduct && isShowGoToCart" @click="showPage = 'cart'">
              加入購物車 <i class="fa fa-shopping-cart" aria-hidden="true"></i>
            </div>

            <div class="addTo_favorite_btn" v-if="!isSingleProduct" @click.stop="toggleFavorite(selectProduct.ID)">
              加入我的最愛 <i class="fas fa-heart" :class="{is_favorite : favorite[selectProduct.ID]}"></i>
            </div>

            <div class="share_link_btn" @click="click_share_link">
              分享 <i class="fas fa-share"></i>
            </div>
            <input type="text" class="copy_input hide" readonly>
        </div>
      </div>

      <div class="addPrice" v-if="selectProduct.addPrice && selectProduct.addPrice.length">
        <div class="title">
          加價購
          <i v-if="isAddPrice" class="fa-solid fa-caret-up" @click="isAddPrice = false"></i>
          <i v-else class="fa-solid fa-caret-down" @click="isAddPrice = true"></i>
        </div>
        <ul v-show="isAddPrice">
          <div class="ulMask" v-if="!getMainTotalQty(selectProduct)"></div>
          <li v-for="item in selectProduct.addPrice" :key="item.ID">
            <div class="pic_div">
              <div class="pic" :style="{backgroundImage :`url(${item.Img})`,}"></div>
            </div>
            <div class="content">
              <div class="name">{{item.Name}}</div>
              <div class="price">NT$ {{numberThousands(item.Price)}}</div>
              <ProductBuyQtyBox :main="selectProduct" :addPrice="item"/>
            </div>
          </li>
        </ul>
      </div>

      <div class="detail">
        <div class="title">
          商品詳情
          <i v-if="isDetail" class="fa-solid fa-caret-up" @click="isDetail = false"></i>
          <i v-else class="fa-solid fa-caret-down" @click="isDetail = true"></i>
        </div>
        <div v-show="isDetail" class="content ql-editor" v-html="unescapeHTML(selectProduct.Detail)"></div>
      </div>

      <div class="buyNow" v-if="isSingleProduct && getMainTotalQty(selectProduct)">
        <div class="title"> 立即購買 </div>
        
        <CartContent />
      </div>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import ProductBuyQtyBox from '@/components/ProductBuyQtyBox.vue'
  import CartContent from '@/components/cart/CartContent.vue'

  // swiper ==================================================
  import { Swiper, SwiperSlide } from 'swiper/vue'
  import 'swiper/swiper.scss';

  // store ==================================================
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'

  let { showPage } = storeToRefs(useCommon())
  let { copy, showMessage } = useCommon()
  let { numberThousands, unescapeHTML, unescapeEnter } = useCommon()
  let { isSingleProduct, selectProduct, isAddPrice, isDetail, favorite } = storeToRefs(useProducts())
  let { getMainTotalQty, toggleFavorite } = useProducts()

  // computed ==================================================
  const isShowGoToCart = computed(() => {
    if(selectProduct.value.specArr) {
      let specBuyQty = selectProduct.value.selectSpecItem.buyQty
      return specBuyQty && specBuyQty != 0
    }
    else {
      return selectProduct.value.buyQty != 0
    }
  })
  
  // methods ==================================================
  let useSwiper
  function onSwiper(swiper) {
    useSwiper = swiper
  }
  function click_share_link() {
    if(!isSingleProduct) {
      copy( `${location.origin}${location.pathname}?id=${selectProduct.value.ID}`, '.copy_input');
    }
    else {
      copy( `${location.origin}${location.pathname}?spid=${selectProduct.value.ID}`, '.copy_input');
    }
    showMessage('複製分享連結', true);
  }
</script>
