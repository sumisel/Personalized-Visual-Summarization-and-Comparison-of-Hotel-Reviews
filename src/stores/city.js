import { defineStore } from 'pinia'

const cities = {
    "Berlin": {
        name: "Berlin",
        center: [52.51827, 13.37767],
        zoom: 13,
        img: {
            url: "https://upload.wikimedia.org/wikipedia/commons/3/3b/Siegessaeule_Aussicht_10-13_img4_Tiergarten.jpg",
            attribution: "A. Savin, Wikimedia Commons",
            license: "CC BY-SA 3.0",
            href: "https://commons.wikimedia.org/wiki/File:Siegessaeule_Aussicht_10-13_img4_Tiergarten.jpg"
        }
    },
    "Paris": {
        name: "Paris",
        center: [48.8615, 2.3209],
        zoom: 13,
        img: {
            url: "https://upload.wikimedia.org/wikipedia/commons/1/15/Paris_from_the_Arc_de_Triomphe%2C_17_October_2019.jpg",
            attribution: "Pierre Blaché, Wikimedia Commons",
            license: "CC0 1.0",
            href: "https://commons.wikimedia.org/wiki/File:Paris_from_the_Arc_de_Triomphe,_17_October_2019.jpg"
        },
    },
    "New_York": {
        name: "New York",
        center: [40.7549, -73.9781],
        zoom: 14,
        img: {
            url: "https://upload.wikimedia.org/wikipedia/commons/0/03/New_York_City_%28New_York%2C_USA%29%2C_Empire_State_Building_--_2012_--_6436.jpg",
            attribution: "Dietmar Rabich, Wikimedia Commons",
            license: "CC BY-SA 4.0",
            href: "https://commons.wikimedia.org/wiki/File:New_York_City_(New_York,_USA),_Empire_State_Building_--_2012_--_6436.jpg"
        }
    },
}

export const useCityStore = defineStore({
    id: 'city',
    state: () => ({
        city: cities.Berlin
    }),
    actions: {
        setCity(id) { this.city = cities[id] },
    }
})
