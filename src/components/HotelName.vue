<script setup>
import { inject } from 'vue';

const hotelMeta = inject('hotelMeta');
const city = inject('city');

const props = defineProps({
    hotelId: {
        type: String,
        required: true
    },
    selected: {
        type: Boolean,
        default: true
    },
    avatar: {
        type: Boolean,
        default: false
    },
    lineBreak: {
        type: Boolean,
        default: false
    }
})
</script>

<template>
    <v-avatar v-if="avatar" class="mr-4" color="#eee" :image="`./img/hotels/${city.name
        .replace(' ', '_')
        .toLowerCase()}/${hotelId=='Hotel_Review-g187147-d197610-Reviews-Paris_Marriott_Rive_Gauche_Hotel_Conference_Center-Paris_Ile_de_France.html'?'Hotel_Review-g187147-d197610-Reviews-Paris_Marriott_Rive_Gauche_Hotel_Conference_Center-Paris_Ile_de_':hotelId}.png`">
    </v-avatar>
    <br v-if="lineBreak" />
    <span class="hotel-name" :class="{ 'selected': selected }">
        {{ hotelMeta[hotelId].name }}
    </span>
</template>

<style scoped lang="scss">
.hotel-name {
    font-size: 1.1rem;

    &.selected {
        font-weight: bold;
    }
}
</style>