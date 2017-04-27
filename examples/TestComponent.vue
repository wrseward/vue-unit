<template>
  <div class="test-component">
    <div class="greeting">Hello {{ message }}</div>
    <button @click="$emit('button-click')">Click Me</button>
    <div class="default-slot"><slot></slot></div>
    <div class="test-slot"><slot name="named"></slot></div>
  </div>
</template>

<script>
  export default {
    name: 'test-component',

    props: ['message']
  }
</script>
