<template>
  <div class="content">
    <nav class="header-label">Property Card</nav>
    <span class="label">Map Resolution</span>
    <Slider :value.sync="resolution" :step="step" :min="range.min" :max="range.max"></Slider>
    <span class="label" style="padding: 5px 85px;">Orientation</span>
        <b-form-select class="dropdown" v-model="orientation" :options="orientationOptions" style="cursor: pointer;"></b-form-select>
    <geoprocessor :url="configs.url"
                  :params="params"
                  :enabled="!disabled"
                  :options="gpOptions">

    </geoprocessor>
  </div>
</template>

<script>
  import Vue from 'vue';
  import Geoprocessor from './Geoprocessor.vue';
  import { FormSelect } from 'bootstrap-vue/es/components';
  import Slider from '../UI/Slider.vue';

  Vue.use(FormSelect);

  export default {
    name: 'export-property-card',
    components: {
      Slider, Geoprocessor
    },
    props: ['feature', 'configs', 'disabled'],
    data(){
      return {
        step: 50,
        range:{
          min: 50,
          max: 300
        },
        orientationOptions: [
          { value: 'Portrait', text: 'Portrait' },
          { value: 'Landscape', text: 'Landscape' },
        ],
        resolution: 100,
        orientation: 'Portrait',
        gpOptions: {
          downloadableOutput: true
        }
      }
    },

    computed: {
      params: function(){
        return {
          Resolution: this.resolution,
          Feature: JSON.stringify(this.feature),
          MapConfig: JSON.stringify(this.configs.element_map),
          WebMap: JSON.stringify(this.configs.webmap_json),
          Template: this.orientation
        }
      }
    },
    mounted(){
      hook.MapExport = this;
    }
  }
</script>

<style scoped lang="scss">

  .header-label{
    background-color: #2c3e50;
    border-radius: 3px;
    margin: 0 0 10px 0;
    color: white;
    font-size: 19px;
  }

  .label{
    background: #e4e4e4;
    padding: 5px 70px 5px 70px;
    border-radius: 3px;
  }

  .slider-wrapper{
    padding: 8px 0px 0px 0px;
    margin: 0px 3px 2px 12px;
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


  .top {
    margin-top: 20px;
  }

  .bottom {
    margin-bottom: 15px;;
  }

  .dropdown{
    width: 200px;
    margin: 17px 0 10px 0;
  }
</style>
