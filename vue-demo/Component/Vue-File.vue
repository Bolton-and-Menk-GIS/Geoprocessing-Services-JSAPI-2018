<!--sample-component.vue-->
<template>
  <!-- injected into parent component -->
  <div>
    <p>HTML Structure</p>
    <div class="someClass">{{ text }}</div>
  </div>
  <!-- injected into parent component -->
</template>

<script>
  export default{
    data(){
      return {
        text: 'Welcome to ITAG!'
      }
    }
  }
</script>

<style>
  .someClass{
    color: red;
    background-color: black;
    height: 500px;
    width: 500px;
  }
</style>
