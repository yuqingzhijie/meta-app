<script setup lang="ts">
// import HelloWorld from './components/HelloWorld.vue'
import imagesLoaded from 'imagesloaded';
import Masonry from 'masonry-layout';
import { nextTick, onMounted, ref } from "vue";
import girl1Img from './assets/img/girl.jpg';
import girl2Img from './assets/img/girl2.jpg';

    const passageListRef = ref<HTMLElement>()
    const list = ref([] as any);
    const loading = ref(false);
    const finished = ref(false);
    const refreshing = ref(false);

    onMounted(() => {
      nextTick(() => {
        imagesLoaded(passageListRef.value, () => {
          new Masonry(passageListRef.value, {
            itemSelector: '.passage',
            columnWidth: '.passage',
            percentPosition: true
          })
        })
      })
    })

    const onLoad = () => {
      setTimeout(() => {
        if (refreshing.value) {
          list.value = [];
          refreshing.value = false;
        }

        for (let i = 0; i < 10; i++) {
          list.value.push({
            imgUrl: Math.random() < 0.5 ?
              girl1Img :
              girl2Img,
            text: '小啊小二郎，背着书包上学校~~~~~~~~~~~~~~~~~~~~~~~~',
            community: '小学语文',
            avatarUrl: girl1Img,
            userName: '小明',
            likes: Math.floor(Math.random() * 100)
          });
        }
        loading.value = false;

        if (list.value.length >= 40) {
          finished.value = true;
        }
      }, 1000);
    };

    const onRefresh = () => {
      // 清空列表数据
      finished.value = false;

      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      loading.value = true;
      onLoad();
    };
</script>

<template>
<van-pull-refresh v-model="refreshing" @refresh="onRefresh">
  <van-list
    v-model:loading="loading"
    :finished="finished"
    finished-text="没有更多了"
    @load="onLoad"
  >
      <div ref="passageListRef" class="passage-list">
        <article class="passage" v-for="(item, index) in list" :key="index">
          <img class="img" :src="item.imgUrl" />
          <div class="content">
            <p class="text">
              {{ item.text }}
            </p>
            <p class="community">
              {{ item.community }}
            </p>
            <div class="footer">
              <div class="user">
                <img :src="item.avatarUrl" />
                <span>{{ item.userName }}</span>
              </div>
              <div class="like-wrap">
                <van-icon name="good-job-o" />
                <span>{item.likes}</span>
              </div>
            </div>
          </div>
        </article>
      </div>
  </van-list>
</van-pull-refresh>
</template>

<style scoped lang="less">
.passage-list {
  // display: flex;
  // flex-wrap: wrap;

  .passage {
    display: flex;
    flex-direction: column;
    width: 11.4375rem;
    .img {
      width: 100%;
      height: auto;
    }
    .content {
      .text {
        height: 2rem;
      }
      .community {
        height: 1rem;
      }
      .footer {
        display: flex;
        justify-content: space-between;
        .user {
          img {
            width: 1rem;
            height: 1rem;
            border-radius: 50%;
          }
        }
        .like-wrap {
          font-size: .75rem;
        }
      }
    }
  }
}
</style>
