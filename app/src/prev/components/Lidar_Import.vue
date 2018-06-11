<template>
  <div class="content">
    LIDAR IMPORT Properties
    <div style="display: flex;">
      <nav class="slider-wrapper">50</nav>
        <b-form-input type="range" min="50" max="300" step="50" :title=val v-model="val"></b-form-input>
      <nav class="slider-wrapper">300</nav>

    </div>
  </div>
</template>

<script>
  import { loadModules } from 'esri-loader';

  export default {
    name: "lidar_import",
    data(){
      return{
        val: "100"
      }
    },
    mounted(){
      window.Lidar_Comp = this;
      loadModules(['esri/tasks/Geoprocessor'])
        .then(([Geoprocessor]) => {

          console.log("LIDAR: LOAD GP ", Geoprocessor)

        })
    }
  }
</script>

<style scoped>

  .slider-wrapper{
    padding: 8px 0 0 0; margin: 0 0 2px 15px;
  }

/*  $slider: rgba(190, 226, 236,1);*/

  input[type="range" i] {
    /*background: rgba(190, 226, 236,1);*/
  }

.form-control:focus{
  background: none;
  box-shadow: none;
}

  input[type="range" i] {
    -webkit-appearance: slider-horizontal;
    cursor: pointer;
    padding: initial;
    border: initial;
    margin: 2px;
  }

  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: rgba(190, 226, 236,1);
    border-radius: 1.3px;
    border: 0.2px solid #010101;
  }
  input[type=range]::-webkit-slider-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 22px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -7px;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
    background: #ac0b30;
  }
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: rgba(190, 226, 236,1);
    border-radius: 1.3px;
    border: 0.2px solid #010101;
  }
  input[type=range]::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 15px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    border-width: 16px 0;
    color: transparent;
  }
  input[type=range]::-ms-fill-lower {
    background: #2a6495;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-fill-upper {
    background: #3071a9;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    margin: -20px 0;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]:focus::-ms-fill-lower {
    background: rgba(190, 226, 236,1);
  }
  input[type=range]:focus::-ms-fill-upper {
    background: rgba(190, 226, 236,1);
  }

  .content{
    margin-top: 10px;
    bottom: 5px;
    width: 86%;
    padding: 10px;
    background-color: white;
    margin-left: auto;
    margin-right: 42px;
    border-radius: 4px;
  }

  input[type=range] {
    -webkit-appearance: none;
    padding-left: 10px;
    padding-right: 0px;
    -moz-margin: 0px 5px 5px;
  }

  input[type=range]:focus {
    outline: none;
  }

  input[type=range]::-webkit-slider-runnable-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1.5px 1.5px 1.5px #565656, 0px 0px 1px #0d0d0d;
    background: rgba(178, 233, 248, 1);
    border-radius: 1.3px;
    border: 0.2px solid #010101;
  }
  input[type=range]::-webkit-slider-thumb {
    box-shadow: 1.5px 1.5px 1.5px #565656, 0px 0px 1px #565656;
    border: 1px solid #e1e1e1;
    height: 22px;
    width: 14px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
    -webkit-appearance: none;
    margin-top: -7px;
  }
  input[type=range]:focus::-webkit-slider-runnable-track {
    border:none;
    background: rgba(178, 233, 248, 1);
  }
  input[type=range]::-moz-range-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    background: #ac0b30;
    border-radius: 1.3px;
    border: 0.2px solid #010101;
  }
  input[type=range]::-moz-range-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 15px;
    width: 16px;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]::-ms-track {
    width: 100%;
    height: 8.4px;
    cursor: pointer;
    animate: 0.2s;
    background: transparent;
    border-color: transparent;
    border-width: 16px 0;
    color: transparent;
  }
  input[type=range]::-ms-fill-lower {
    background: #2a6495;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-fill-upper {
    background: #3071a9;
    border: 0.2px solid #010101;
    border-radius: 2.6px;
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
  }
  input[type=range]::-ms-thumb {
    box-shadow: 1px 1px 1px #000000, 0px 0px 1px #0d0d0d;
    border: 1px solid #000000;
    height: 36px;
    width: 16px;
    margin: -20px 0;
    border-radius: 3px;
    background: #ffffff;
    cursor: pointer;
  }
  input[type=range]:focus::-ms-fill-lower {
    background: #ac0b30;
  }
  input[type=range]:focus::-ms-fill-upper {
    background: #ac0b30;
  }

</style>