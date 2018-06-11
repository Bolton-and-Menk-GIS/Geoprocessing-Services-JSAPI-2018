<template>
  <div class="gp-container">
    <slot name="button" v-if="status === 'ready'">
      <i :class="'fas fa-check' + (enabled ? '': ' disabled')" @click="run" :disabled="!enabled" title="run task"></i>
    </slot>

    <slot name="running" v-if="status === 'running'">
      <i class="fas fa-spinner fa-spin" title="running task"></i>
    </slot>

    <slot name="complete" v-if="status === 'complete' && (options || {}).downloadableOutput">
      <i class="fas fa-download" @click="download" title="download file"></i>
    </slot>

    <slot name="error" v-if="status === 'failed'">
      <b-alert
              :show="5"
              @dismissed="status = 'ready'"
              variant="danger">
        {{ json.displayName }} Task Failed!
      </b-alert>
    </slot>

  </div>
</template>

<script>
  /* eslint-disable */
  import { loadModules } from "esri-loader";
  import Vue from 'vue';
  import { Alert } from 'bootstrap-vue/es/components';
  Vue.use(Alert);

  export default {
    props: ["url", "params", "enabled", 'options'],
    data() {
      return {
        status: "ready",
        gp: null,
        isSynchronous: false,
        out_params: [],
        jobId: null,
        json: {},
        syncResults: []
      };
    },
    mounted: function() {
      // enable by default
      if (this.enabled === null || this.enabled === undefined){
        this.enabled = true; //default
      }

      loadModules(['esri/tasks/Geoprocessor', 'esri/request']).then(
        async ([Geoprocessor, esriRequest]) => {

          // instantiate geoprocessor
          this.gp = new Geoprocessor(this.url);

          // read properties of this service
          let json = await esriRequest(this.url, {
            query: { f: 'json' },
            responseType: 'json'
          });
          this.json = json.data;

          // shorthand property for whether or not it is a synchronous task
          this.isSynchronous = json.data.executionType === 'esriExecutionTypeSynchronous';

          // set output params for later use
          this.out_params.push(...json.data.parameters.filter( p => p.direction === 'esriGPParameterDirectionOutput'));
        }
      );
    },

    methods: {
      run: function() {
        if (!this.enabled){
          return;
        }
        // set status to running for spinner
        this.$emit('task-started');
        this.status = 'running';

        // return a promise for all results
        return new Promise(async (resolve, reject) => {
          //console.log("PARAMS: ", this.params);
          try {
            if (this.isSynchronous) {

              // execute job (synchronous task)
              this.syncResults.length = 0;
              let result = await this.gp.execute(this.params, {
                responseType: 'json',
                query: {f: 'json'}
              });

              // if downloadable output, set to complete first
              this.status = (this.options || {}).downloadableOutput ? 'complete': 'ready';

              // fetch results as array
              let results = result.results.map(r =>{
                return { name: r.paramName, value: r.value, type: r.dataType }
              });

              // store in syncResults property for later use with download
              this.syncResults.push(...results);

              // set up output
              let output = {
                geoprocessor: this.gp,
                response: result,
                async: false,
                results: results
              };

              // emit the "task-completed" event for Vue
              this.$emit('task-complete', output);

              // resolve the promise
              resolve(output);

            } else {

              // submit job (asynchronous task)
              let result = await this.gp.submitJob(this.params, {
                responseType: 'json',
                f: 'json'
              });

              // get results
              this.jobId = result.jobId;

              // check if job failed, if so throw error
              if (result.jobStatus === 'job-failed') {
                this.status = 'failed';
                this.$emit('task-failed', {
                  geoprocessor: this.gp,
                  jobId: this.jobId,
                  response: result
                });

                // reject promise
                reject(result);

                throw Error(result);


              } else if (result.jobStatus === 'job-succeeded') {

                // job has succeeded, set status to complete for download, otherwise reset back to ready
                this.status = (this.options || {}).downloadableOutput ? 'complete': 'ready';

                // fetch result data as an array (outputs is an array of promises)
                let outputs = this.out_params.map(async (p) => {
                  let gpRes = await this.gp.getResultData(this.jobId, p.name, { responseType: 'json', query: {f: 'json'} });
                  return {
                    name: p.name,
                    value: gpRes.value,
                    type: gpRes.dataType
                  }
                });

                // wait for all gp result promises to resolve
                let resolvedOutputs = await Promise.all(outputs);

                // set up output object
                let output = {
                  geoprocessor: this.gp,
                  jobId: this.jobId,
                  response: result,
                  results: resolvedOutputs,
                  async: true
                };

                // emit "task-complete" event for Vue
                this.$emit('task-complete', output);

                // resolve promise
                resolve(output);
              }
            }
          } catch (err){
            this.status = 'failed';
            console.error(`GP TASK "${this.json.displayName}" FAILED: `, err);

            // reject promise
            reject(err);
          }

        });
      },

      download: async function() {
        // check to make sure there are output params
        if (this.out_params.length){
          let result;
          if (this.isSynchronous){
            // if synchronous, just grab first result
            result = this.syncResults[0];
          } else {
            // if async, fetch first result from server call
            result = await this.gp.getResultData(this.jobId, this.out_params[0].name, {
              responseType: "json",
              f: "json"
            });
          }

          // open hyperlink in new tab
          window.open(result.value, "_blank");
        }

        // reset status back to ready for Vue
        this.status = 'ready';
      }
    }
  };
</script>

<style scoped lang="scss">
  @import url(//use.fontawesome.com/releases/v5.0.13/css/all.css);

  .disabled {
    color: #e4e4e4 !important;
    cursor: not-allowed !important;
  }

  .gp-container > i {
    font-size: 1.5rem;
    color: #2c3e50;
    cursor: pointer;
    &:hover{
      color: #b2e9f8;
    }
  }
</style>
