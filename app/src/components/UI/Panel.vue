<template>
  <div>
    <div style="position: absolute;" :class="[{ isOpen: isOpen }, setDirection.panel, setClassOverride.panel]">
      <div class='tab_base' :class="[setDirection.tab, setClassOverride.tab]"
           @click="toggle()">{{setlabel}}</div>
      <slot name="content">
        <div style="color: white;">DEFAULT CONTENT</div>
      </slot>
    </div>
  </div>
</template>

<script>
  export default {
    name: "Panel",
    components: {},
    props: {
      direction: String,
      options: Object,
      label: String,
      class_override: Object,
      css: Object,
      trigger: Boolean
    },
    watch: {
      trigger: function(val, ov) {
        val?this.toggle('trigger'):false;
      }
    },
    data: () => {
      return {
        tabLabel: this.label?this.label:"Open",
        isOpen: false,
        defaultStyles: {
          _class: {},
          _style: {}
        }
      };
    },
    methods: {
      toggle(trigger) {
        this.isOpen = !this.isOpen;
        this.tabLabel = this.isOpen ? "Close":this.label?this.label:"Open" ;
        this.$emit('evt_isOpen', this.isOpen, trigger);
      }
    },
    computed: {
      setlabel(){
        return this.tabLabel;
      },
      setDirection() {
        let { speed } = this.options ? this.options : false;

        let tab = this.direction
          ? this.direction === "Right" ? "tab_right" : "tab_left"
          : "tab_left";

        let panel = this.direction
          ? this.direction === "Right" ? "slide_right" : "slide_left"
          : "slide_left";

        let spd = speed
          ? speed === "fast" ? "f" : speed === "slow" ? "s" : "m"
          : "m";
        return { tab: tab, panel: `${panel} ${spd}` };
      },
      setClassOverride() {
        let panelOverride = this.class_override
          ? this.class_override.panel
            ? this.class_override.panel
            : "panel_default"
          : "panel_default";

        let tabOverride = this.class_override
          ? this.class_override.tab ? this.class_override.tab : "tab_default"
          : "tab_default";

        return { tab: tabOverride, panel: panelOverride };
      }
    },
    mounted() {
      this.tabLabel = this.isOpen ? "Close":this.label?this.label:"Open" ;
      window.m = this;
    }
  };
</script>

<style lang='scss' scoped>
  .panel_default {
    width: 350px;
    /*height: 50vh;*/
    top: 20px;
    padding: 0px;
    background-color: #2c3e50;
  }

  .slide_left {
    left: 0;
    border-radius: 0 4px 4px 0;
    transform: translateX(-100%);
    transition: transform 0.6s cubic-bezier(0.58, -0.53, 0.18, 1.49);
  }

  .slide_left.isOpen {
    transform: translateX(-10%);
  }

  .slide_right {
    right: 0;
    border-radius: 4px 0px 0px 4px;
    transform: translateX(100%);
    transition: transform 0.6s cubic-bezier(0.58, -0.53, 0.18, 1.49);
  }

  .slide_right.isOpen {
    transform: translateX(10%);
  }

  .tab_base {
    position: absolute;
    cursor: pointer;
  }

  .tab_default {
    top: 20px;
    background-color: #e3e3e3;
    padding: 8px;
    border-radius: 0 4px 4px 0;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    color: black;
    &:hover {
      background-color: #2c3e50;
      color: white;
      opacity: 0.75;
    }
  }

  .tab_left {
    border-radius: 0 4px 4px 0;
    left: 100%;
  }

  .tab_right {
    border-radius: 4px 0 0 4px;
    right: 100%;
  }
</style>
