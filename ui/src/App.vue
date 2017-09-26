<template>
  <div id="app">
    <div>
      <label for="query-name">Query Name</label>
      <input v-model="queryParameters.queryName" id="query-name" type="text"/>
    </div>
    <div>
      <label for="start-node-type">Start Node Type</label>
      <select v-model="queryParameters.startNodeType" id="start-node-type">
        <option value="IP_ADDRESS">IP Address</option>
        <option value="DOMAIN">Domain</option>
      </select>
    </div>
    <div>
      <label for="degrees-of-separation">Degrees of separation</label>
      <input v-model="queryParameters.degreesOfSeparation" id="degrees-of-separation" type="number"/>
    </div>
    <button v-on:click="createObservableQuery">Create</button>
    <div>{{createQueryResult}}</div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      name: 'app',
      createQueryResult: '',
      queryParameters: {
        queryName: 'My Query',
        startNodeType: 'DOMAIN',
        degreesOfSeparation: 2
      }
    }
  },

  methods: {
    createObservableQuery() {
      this.$http.post('http://localhost:3000/api/v1/hyperlinkQueries', this.queryParameters)
      .then(response => {
        console.log(response);
        this.createQueryResult = JSON.stringify(response);
      }, (response) => {
        console.log(response);
        this.createQueryResult = JSON.stringify(response);
      });
    }
  }
}
</script>

<style>
</style>
