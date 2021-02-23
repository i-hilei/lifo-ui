// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
    production: false,
    supportedLocale:['en-US', 'zh-CN', 'id'],
    campaignService: 'https://campaign-test.lifo.ai',
    discoverService: 'https://discover-test.lifo.ai',
    localApiService: 'http://localhost:8080',
    firebase: {
        apiKey: 'AIzaSyDUBT_LoUy-yZSbGkODOexwxN5jJgwaMw4',
        authDomain: 'influencer-272204.firebaseapp.com',
        databaseURL: 'https://influencer-272204.firebaseio.com',
        projectId: 'influencer-272204',
        storageBucket: 'influencer-272204.appspot.com',
        messagingSenderId: '65044462485',
        appId: '1:65044462485:web:04b7c9263f4cd45ec2549c',
        measurementId: 'G-X25NVBSCPH',
    },
    stripe: {
        token: 'pk_test_51HP08RJVRQRRLfBwHrEVd2YIbNrKpOvqIeSVQG7e6gLd23byQPwL5FFzMLmPkFXBxMyoGvkAyf3S477xcd8zlYg100iOzWclpK',
    },
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
