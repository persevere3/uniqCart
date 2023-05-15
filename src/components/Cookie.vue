<template>
  <div class="cookie">
    <div class="close"> <i class="fa-solid fa-xmark"></i> </div>
    本網站中使用 cookie，欲查詢有關本網站使用 cookie 方式之詳情，及若您不希望在電腦上使用 cookie 時應如何變更電腦的 cookie 設定，請參閱本網站「隱私權及網站使用條款」之 Cookie 聲明。您繼續使用本網站即表示您同意本公司得按本網站使用條款之 Cookie 聲明使用 cookie。
    <div class="agree"> 我同意 </div>
  </div>
</template>

<script setup>

  onMounted(() => {
    let isCookie = localStorage.getItem('isCookie')
    if(isCookie) removeCookieDom() 
    else {
      document.querySelector('.cookie .close').addEventListener('click', removeCookieDom)
      document.querySelector('.cookie .agree').addEventListener('click', agreeCookie)
    }
  })

  function removeCookieDom() {
    let node = document.querySelector('.cookie')
    node.parentNode.removeChild(node)
  }
  function agreeCookie() {
    localStorage.setItem('isCookie', true)
    removeCookieDom()
  }
</script>

<style lang="scss">
  .cookie {
    width: 90%;
    left: 50%;
    transform: translateX(-50%);
    bottom: 10px;
    position: fixed;
    padding: 20px;
    background-color: #f5f5f5;
    color: #888;
    font-weight: bold;
    border-radius: 10px;
    box-shadow: 0 0 3px 1px #888;
    z-index: 1000;

    .close{
      width: 20px;
      height: 20px;
      position: absolute;
      top: 5px;
      right: 5px;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 20px;
      color: #07081d;
      cursor: pointer;
    }
    .agree{
      width: 60px;
      padding: 5px 0;
      margin: 5px auto 0;
      background-color: hsl(213, 39%, 12%);
      color: #ddd;
      display: flex;
      justify-content: center;
      cursor: pointer;
    }
  }
</style>