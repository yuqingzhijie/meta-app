<template>
          <div :key="passage.id" class="passage">
            <div class="media-wrap">
              <img v-if="isImg" :src="passage.imgUrl" />
              <video v-else ref="videoRef" @click="togglePlay" :src="passage.videoUrl" playsinline loop></video>
              <div v-if="!isImg" class="play-icon">
                <van-icon v-show="!isActive" name="play-circle-o" />
              </div>
            </div>
            <div class="content">
              <p class="text">{{ passage.text }}</p>
              <p class="community">{{ passage.community }}</p>
              <div class="footer">
                <div class="user">
                  <img :src="passage.avatarUrl" />
                  <span>{{ passage.userName }}</span>
                </div>
                <div class="like-wrap">
                  <van-icon name="good-job-o" />
                  <span>{{ passage.likes }}</span>
                </div>
              </div>
            </div>
          </div>
</template>

<script setup lang="ts">
import { type Passage } from '../types/passageList.types';

import { computed, ref, watch } from 'vue';
import { MediaTypeEnum } from "../types/passageList.types";

const props = defineProps<{ passage: Passage }>();
const emit = defineEmits<{
  (event: 'togglePlay', id: string): void
}>();

const videoRef = ref<HTMLVideoElement | null>(null);
const isImg = computed(() => props.passage.type === MediaTypeEnum.image)
const isActive =  computed(() => props.passage.isActive)

watch(() => props.passage.isActive, (isActive: boolean) => {
  if (!videoRef) return

  if (isActive) {
    videoRef.value!.play()
  } else {
    videoRef.value!.pause()
  }
})

const togglePlay = () => {
  emit('togglePlay', props.passage.id);
};
</script>

<style scoped lang="less">
.passage {
  background: #fff;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 0.125rem 0.5rem rgba(0, 0, 0, 0.1);
}
.media-wrap {
  position: relative;
  width: 100%;

  img,
  video {
    width: 100%;
    display: block;
  }

  .play-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    color: white;
    font-size: 1.5rem;
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
