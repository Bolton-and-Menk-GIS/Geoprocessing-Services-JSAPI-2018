<template>
  <div class="content">
    <nav class="header-label">Crash Analysis Task</nav>
    <span class="label">Buffer Distance</span>
    <Slider :value.sync="distance" :step="step" :min="range.min" :max="range.max" @update:value="slider_update"></Slider>
    <span class="label" style="padding: 5px 85px;">Crash Field</span>
    <b-form-select class="dropdown" v-model="selected" :options="crash_fields" @change="dropdown_update"></b-form-select>
    <div style="display:flex;">
    <i class="fas fa-pen-square draw" :class="{active:state.active}" @click="drawStart"></i>
    <geoprocessor class="gp-wrapper" :url="url" :params="params" :enabled="!state.disabled" @task-complete="taskComplete"></geoprocessor>
    </div>
    </div>
</template>
<script>
  import Vue from 'vue';
  import Slider from '../UI/Slider.vue';
  import Geoprocessor from './Geoprocessor.vue';
  import { FormSelect } from 'bootstrap-vue/es/components';

  Vue.use(FormSelect);

  export default {
    props: ['buffers', 'buffer_distance', 'selected', 'crash_fields', 'state', 'url'],
    name: "crash_tool",
    components:{Slider, Geoprocessor},
    data(){
      return{
        distance: 100,
        step: 50,
        range:{
          min: 50,
          max: 500
        }
      }
    },

    methods:{
      drawStart(evt){
        // this.active = true;
        // this.$emit('update:draw_active', this.active);
        this.$emit('evt_draw-start', evt);
      },
      taskComplete(evt) {
        // task complete event handler @task-complete from @Geoprocessor component
        this.$emit('evt_crash-gp-complete', evt);
      },
      dropdown_update(val){
        // dropdown event handler @change event
        this.$emit('evt_dropdown-field-changed', val);
      },
      slider_update(){
        // slider update event handler @update event
        this.$emit('update:buffer_distance', parseInt(this.distance));
      }
    },
    computed: {
      params(){
        return {
          Buffers: JSON.stringify(this.buffers)
        }
      }
    },
    created(){
      // buffer distance :prop to local buffer_distance property
      this.distance = this.buffer_distance;
    },
    mounted(){
      hook.CA = this;
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
    padding: 5px 70px;
    border-radius: 3px;
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

  .form-control:focus{
    background: none;
    box-shadow: none;
  }

  .draw{
    font-size: 24px;
    margin-left:auto;
    margin-right: 10px;
    color:#2c3e50;
    cursor: pointer;
    &.active{
      color: #e4e4e4;
    }
    &:hover{
      color: #b2e9f8;
    }
  }

  .gp-wrapper{
    margin-right:auto;
    margin-left: 10px;
  }

  .dropdown{
    width: 200px;
    margin: 17px 0 10px 0;
  }
</style>