<template>
  <div class="parent-test-component">
    <TestComponent v-if="message" :message="message">
      Default Slot
      <span slot="named">Named Slot</span>
    </TestComponent>
  </div>
</template>

<script>
  import TestComponent from './TestComponent.vue'
  export default {
    name: 'parent-test-component',

    props: ['message'],

    components: { TestComponent }
  }
</script>
