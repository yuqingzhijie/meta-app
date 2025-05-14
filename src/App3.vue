<!-- Waterfall.vue: 手动两列分发 + rem 计算宽度/高度 -->
<template>
  <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
    <van-list
      v-model:loading="loading"
      :finished="finished"
      finished-text="没有更多了"
      @load="onLoad"
    >
      <div class="waterfall-container">
        <div class="column">
          <div v-for="item in leftColumn" :key="item.id" class="passage">
            <!-- <img v-if="item.type === MediaEnum.image" :src="item.url" class="img" />
            <img v-else :src="item.url" class="img" /> -->
            <!-- <img :src="item.url" class="img" /> -->
            <div class="media-wrap">
              <img v-if="item.type === MediaEnum.image" :src="item.url" />
              <video v-else @click="togglePlay($event, item.id)" :src="item.url" muted playsinline loop></video>
              <div v-if="item.type === MediaEnum.video" class="play-icon">
                <!-- <van-icon name="play-circle-o" /> -->
                <van-icon :name="item.isActive ? 'pause-circle-o' : 'play-circle-o'" />
              </div>
            </div>
            <div class="content">
              <p class="text">{{ item.text }}</p>
              <p class="community">{{ item.community }}</p>
              <div class="footer">
                <div class="user">
                  <img :src="item.avatarUrl" />
                  <span>{{ item.userName }}</span>
                </div>
                <div class="like-wrap">
                  <van-icon name="good-job-o" />
                  <span>{{ item.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="column">
          <div v-for="item in rightColumn" :key="item.id" class="passage">
            <div class="media-wrap">
              <img v-if="item.type === MediaEnum.image" :src="item.url" />
              <video v-else :src="item.url" muted playsinline></video>
              <div v-if="item.type === MediaEnum.video" class="play-icon">
                <van-icon name="play-circle-o" />
              </div>
            </div>
            <div class="content">
              <p class="text">{{ item.text }}</p>
              <p class="community">{{ item.community }}</p>
              <div class="footer">
                <div class="user">
                  <img :src="item.avatarUrl" />
                  <span>{{ item.userName }}</span>
                </div>
                <div class="like-wrap">
                  <van-icon name="good-job-o" />
                  <span>{{ item.likes }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </van-list>
  </van-pull-refresh>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import girl1Img from './assets/img/girl.jpg';
import girl2Img from './assets/img/girl2.jpg';
import animal1Mp4 from './assets/movie/animal.mp4';
import animal2Mp4 from './assets/movie/animal2.mp4';

const enum MediaEnum {
  image,
  video
}

interface Item {
  id: number;
  url: string;
  type: MediaEnum;
  text: string;
  community: string;
  avatarUrl: string;
  userName: string;
  likes: number;
  height: number;
  isActive?: boolean;
}

const loading = ref(false);
const finished = ref(false);
const refreshing = ref(false);
const leftColumn = ref<Item[]>([]);
const rightColumn = ref<Item[]>([]);
let lastPlayedVideoId = -1;
let lastPlayedVideo: HTMLVideoElement|null = null;


const togglePlay = (ev: MouseEvent, id: number)=> {
  console.log(ev.target);
  let item: Item | null = null
  item = leftColumn.value.find((child) => child.id === id) || null
  !item && (item = rightColumn.value.find((child) => child.id === id) || null)
  let vedio = ev.target as HTMLVideoElement;
  if (vedio && item) {
    if (item.isActive) {
      vedio.pause()
      item.isActive = false
      lastPlayedVideo = null
      lastPlayedVideoId = -1
    } else {
      (ev.target as HTMLVideoElement).play()
      item.isActive = true
  
  
      if (lastPlayedVideo) {
        lastPlayedVideo.pause();
        let lastItem: Item | null = null
        lastItem = leftColumn.value.find((child) => child.id === lastPlayedVideoId) || null
        !lastItem && (lastItem = rightColumn.value.find((child) => child.id === lastPlayedVideoId) || null)
        lastItem && (lastItem.isActive = false);
      }
      lastPlayedVideoId = id;
      lastPlayedVideo = vedio
    }
  }
}

// 模拟数据
function mockData(): Item[] {
  return Array.from({ length: 10 }).map(() => {
    let num = Math.random()
    return {
    id: Date.now() + Math.random(),
    type: num < 0.5 ? MediaEnum.image : MediaEnum.video,
    url: num < 0.25 ? girl1Img : (num < 0.5 ? girl2Img : (num < 0.75 ? animal1Mp4 : animal2Mp4)),
    text: '小啊小二郎，背着书包上学校，忘记后面内容了，不完整文本展示…',
    community: '小学语文版块',
    avatarUrl: girl1Img,
    userName: '小明',
    likes: Math.floor(Math.random() * 100),
    height: 0
  }});
}

// 将 rem 转换为 px
function remToPx(rem: number): number {
  const fontSize = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16;
  return rem * fontSize;
}

// 预加载图片并计算渲染高度（px）
async function measureItem(item: Item, columnWidthRem: number): Promise<Item> {
  const widthPx = remToPx(columnWidthRem);
  return new Promise<Item>(resolve => {
    const img = new Image();
    img.src = item.url;
    img.onload = () => {
      const h = (img.naturalHeight / img.naturalWidth) * widthPx;
      resolve({ ...item, height: h });
    };
    img.onerror = () => resolve({ ...item, height: widthPx });
  });
}

async function onLoad() {
  loading.value = true;
  if (refreshing.value) {
    leftColumn.value = [];
    rightColumn.value = [];
    finished.value = false;
    refreshing.value = false;
  }
  // 定义每列宽度 rem 单位（可调整）
  const columnWidthRem = 11.25; // 例如 11.44rem

  const batch = mockData();
  for (const raw of batch) {
    const item = await measureItem(raw, columnWidthRem);
    // 计算当前左右高度总和
    const leftHeight = leftColumn.value.reduce((sum, it) => sum + it.height, 0);
    const rightHeight = rightColumn.value.reduce((sum, it) => sum + it.height, 0);
    if (leftHeight <= rightHeight) {
      leftColumn.value.push(item);
    } else {
      rightColumn.value.push(item);
    }
  }
  loading.value = false;
  if (leftColumn.value.length + rightColumn.value.length >= 40) {
    finished.value = true;
  }
}

function onRefresh() {
  refreshing.value = true;
  onLoad();
}

// 初始加载
onLoad();
</script>

<style scoped lang="less">
.waterfall-container {
  display: flex;
  gap: 0.1875rem; /* 12px */
  padding: 0.375rem;
}
.column {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.1875rem;
}
.passage {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.5rem rgba(0,0,0,0.1);
}
  // img, video {
  //   width: 100%;
  //   display: block;
  // }
.media-wrap {
  position: relative;
  width: 100%;

  img, video {
    width: 100%;
    display: block;
  }

  .play-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: white;
    font-size: 1.5rem;
    background: rgba(0,0,0,0.4);
    border-radius: 50%;
  }
}
.content {
  padding: 0.375rem;
}
.text {
  max-height: 3rem;
  line-height: 1.5rem;
  overflow: hidden;
  margin: 0 0 0.25rem;
}
.community {
  margin: 0 0 0.5rem;
  font-size: 0.75rem;
  color: #666;
}
.footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.75rem;
  color: #666;
}
.user {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.user img {
  width: 1rem;
  height: 1rem;
  object-fit: cover;
  border-radius: 50%;
  margin-right: 0.25rem;
}
.like-wrap {
  font-size: 0.75rem;
  display: flex;
  align-items: center;
}
.like-wrap span {
  margin-left: 0.25rem;
}
</style>
