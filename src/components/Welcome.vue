<template>
    <v-card>
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
                comparison view, after available accommodations are filtered by availability, price range, and area.</p>
        </v-card-text>
        <v-card-actions>
            <strong class="ml-2 mr-8">Please select a city to start:</strong>
            <v-btn href="?city=Berlin">Berlin</v-btn>
            <v-btn href="?city=New_York">New York</v-btn>
            <v-btn href="?city=Paris">Paris</v-btn>
        </v-card-actions>
    </v-card>
</template>

<style lang="scss">
.v-card {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 800px;
}
</style>