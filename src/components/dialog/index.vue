<template>
  <div class="popup" v-if="visable">
    <div class="dialog">
      <div class="title" v-if="title">{{title}}</div>
      <div class="content">
        <slot></slot>
      </div>
      <div class="btn">
        <button v-if="cancelBtn" @click="cancel">{{cancelBtn?cancelBtn:'取消'}}</button>
        <button v-if="confirmBtn" @click="confirm">{{confirmBtn?confirmBtn:'确认'}}</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  
  props: {
    /*子组件的参数，
      参数名
      参数类型
      默认为空

  */
    title: {
      type: [String],
      default: ''
    },

    //取消按钮参数
    cancelBtn: {
      type: [String],
      default: ''
    },

    //确认按钮
    confirmBtn: {
      type: [String],
      default: ''
    }
  },

  //数据部分，用于展示是否展示对话框
  data(){
    return {
      visable: false
    }
  },
  methods: {
    show(){
      this.visable = true
    },
    hide(){
      this.visable = false
    },
    cancel(){
      this.hide()
      
    },
    confirm(){
      this.$emit('confirm')
      this.hide()
    }
  }
}
</script>

<style lang='stylus'>
  @import './index.styl';
</style>