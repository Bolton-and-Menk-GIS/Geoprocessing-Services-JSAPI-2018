<template>
  <div class="content">
    Export Map Properties

  </div>
</template>

<script>
  import { loadModules } from 'esri-loader';

  export default {
    name: "export_map",
    mounted(){
      loadModules(['esri/tasks/Geoprocessor'])
        .then(([Geoprocessor]) => {
          var gp = new Geoprocessor('//gis.bolton-menk.com/bmigis/rest/services/AGOL_MARKETING/ExportPropertyCard/GPServer/Export%20Property%20Card');
          console.log("LOAD GP ", Geoprocessor)

        })
    }
  }
</script>

<style scoped>
  .content{
    margin-top: 10px;
    bottom: 5px;
    width: 86%;
    background-color: white;
    margin-left: auto;
    margin-right: 42px;
    border-radius: 4px;
  }
</style>