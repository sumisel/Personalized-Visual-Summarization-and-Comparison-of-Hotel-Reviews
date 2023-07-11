<template>
    <v-card class="elevation-6 pa-4">
        <v-img src="/logo.png"></v-img>
        <v-card-title>
            Welcome to <strong>ViSCitR</strong>
        </v-card-title>
        <v-card-subtitle>
            A research prototype for <i>
                <strong>Vi</strong>sual <strong>S</strong>ummarization and
                <strong>C</strong>ompar<strong>i</strong>son of
                Ho<strong>t</strong>el <strong>R</strong>eviews
            </i>
        </v-card-subtitle>
        <v-card-text>
            <p>The prototype demonstrates how a selection of hotels can be compared regarding customer ratings and reviews.
                It is not meant to compete with interfaces of hotel booking platforms, but to complement them with a detail
                comparison view after available accommodations are filtered by availability, price range, and area. Also,
                some information and features that you would expect when such a view is integrated in a booking platform are
                not available, for instance, information of prices or features to freely explore the map.</p>
            <p>Please note that, although we work with real review data of real hotels, we have obfuscated hotel names to
                allow hotel comparison without biases of familiarity and previous experience.</p>
        </v-card-text>
        <v-card-actions>
            <strong class="ml-2 mr-8">Please select a city to start:</strong>
            <v-btn href="?city=Berlin">Berlin</v-btn>
            <v-btn href="?city=New_York">New York</v-btn>
            <v-btn href="?city=Paris">Paris</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style lang="scss" scoped>
.v-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;

    & .v-img {
        height: 200px !important;
        margin: 2rem auto;
    }

    & p {
        margin: 0.5rem 0;
    }
}
</style>