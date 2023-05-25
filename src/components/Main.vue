<template>
  <div class="main">
    <div class="logo_name">
      <img :src="store.Logo" class="logo" v-if="store.Logo" @click="urlPush(getPathname('index'))">
    </div>
    <div class="menu" v-if="webVersion != 'uniqm.net'">
      <ul>
        <li @click="urlPush(getPathname('index'))">
          <i class="fa-solid fa-house"></i> 
          <span> 首頁 </span>
        </li>
        <li @click="urlPush(getPathname('order'))">
          <i class="fas fa-clipboard-list"></i>
          <span class="none650"> 訂單 </span>
        </li>
        <li v-if="site.MemberFuction * 1" @click="user_account ? urlPush(getPathname('info')) : urlPush(getPathname('user'))">
          <i class="fa-solid fa-user"></i> 
          <span class="none650"> 會員中心 </span>
        </li>
      </ul>
    </div>
    <div class="categories">
      <ul>
        <li v-for="item in categories" :key="item.ID" 
            :class="{active:item.ID === category}"
            @click="category = item.ID; currentPage = 1;" 
        >
          {{item.Name}}
        </li>
      </ul>
    </div>
    <div class="arrangement" v-if="pageFilterProducts.length !== 0">
      <ul>
        <li> 排列方式 </li>
        <li :class="{active:arrangement == 0}" @click="arrangement = 0">
          <i class="fa fa-th-large" aria-hidden="true"></i>
        </li>
        <li :class="{active:arrangement == 1}" @click="arrangement = 1">
          <i class="fa fa-th-list" aria-hidden="true"></i>
        </li>
      </ul>
    </div>

    <div class="products" :class="{type1:arrangement == 1}">
      <ul>
        <li v-for="item in pageFilterProducts" :key="item.ID" >
          <div class="pic_div">
            <div class="pic" :style="{backgroundImage :`url(${item.imgArr[0]})`}" @click="showSelect(item)">
              <div class="detailButton">
                查看詳情
                <i class="fas fa-heart" :class="{is_favorite : favorite[item.ID]}" @click.stop="toggleFavorite(item.ID)"></i>
              </div>
            </div>
          </div>

          <div class="content">
            <div class="name">{{item.Name}}</div>
            <div class="price origin">NT$ {{numberThousands(item.Price)}}</div>
            <div class="price">NT$ {{numberThousands(item.NowPrice)}}</div>
            <ProductBuyQtyBox :main="item" :event="1" />
          </div>
        </li>
      </ul>
      <div class="noProduct" v-if="productsRerndered && pageFilterProducts.length === 0">
        目前沒有銷售任何產品
      </div>
    </div>
    <div class="pages" v-if="pageFilterProducts.length !== 0">
      <ul>
        <li :class="{'pageDisabled':currentPage === 1}" @click="changePage(currentPage - 1)">
          Previous
        </li>

        <li v-for="page in totalPage" :key="`page_${page}`" 
            :class="{'liActive':currentPage === page}"
            @click="changePage(page)">
          {{page}}
        </li>

        <li :class="{'pageDisabled':currentPage === totalPage}" @click="changePage(currentPage + 1)">
          Next
        </li>
      </ul>
    </div>

    <div class="notice">
      <ul>
        <li v-if="store.Content" @click="showPage = 'Content'">
          訂購須知
        </li>
        <li v-if="store.Description" @click="showPage = 'Description'">
          配送須知
        </li>
        <li v-if="store.PrivacyPolicy" @click="showPage = 'PrivacyPolicy'">
          隱私權聲明
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup>
  // component ==================================================
  import ProductBuyQtyBox from '@/components/ProductBuyQtyBox.vue'

  // store
  import { useCommon }  from '@/stores/common/common'
  import { useProducts }  from '@/stores/products'

  let { site, store, arrangement, showPage, webVersion } = storeToRefs(useCommon())
  let { urlPush, getPathname } = useCommon()
  let { numberThousands } = useCommon()
  let { categories, category, products, productsRerndered, favorite } = storeToRefs(useProducts())
  let { showSelect, toggleFavorite } = useProducts()

  // state ==================================================
  const state = reactive({
    pageNum: 12,
    totalPage: 0,
    currentPage: 1
  })
  let { pageNum, totalPage, currentPage } = toRefs(state)

  // computed ==================================================
  const filterProducts = computed(() => {
    let arr = [];
    if(category.value == 0) arr = products.value 
    else arr = products.value.filter(product => product.categoryArr.find(categoryItem => categoryItem == category.value))
    state.totalPage = Math.ceil(arr.length / state.pageNum);
    return arr;
  })
  const pageFilterProducts = computed(() => {
    let startIndex = (state.currentPage - 1) * state.pageNum;
    let endIndex = state.currentPage * state.pageNum - 1;
    return filterProducts.value.filter((product, index) => {
      return index >= startIndex && index <= endIndex
    })
  })

  // watch ==================================================
  watch(products, () => {
    console.log('watch: products')
    state.currentPage = 1;
  })

  // methods ==================================================
  function changePage(p) {
    state.currentPage = p < 1 ? 1 : (p > state.totalPage ? state.totalPage : p);
  }
</script>
