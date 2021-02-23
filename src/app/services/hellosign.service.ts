import { Injectable } from '@angular/core';
import HelloSign from 'hellosign-embedded';

@Injectable({
    providedIn: 'root',
})
export class HelloSignService {

    API_KEY = '1d21122d55d199d3a813b23eae0f14a8993fd65dc59b02ddb7161863e95fcd84';
    CLIENT_ID = 'ed13bd512148181319db3152c8749516';

    client = new HelloSign();

    constructor(
    ) {}

    signContract(embedUrl, influencer, compleateSign) {
        this.client.open(embedUrl, {
            clientId: this.CLIENT_ID,
            skipDomainVerification: true,
        });

        this.client.on('sign', (data) => {
            // console.log('The document has been signed!');
            // console.log(`Signature ID: ${  data.signatureId}`);
            compleateSign(data.signatureId, influencer);
        });
    }
}
