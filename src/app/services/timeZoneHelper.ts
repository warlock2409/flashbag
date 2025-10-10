import { Injectable } from '@angular/core';
import * as moment from 'moment-timezone';


@Injectable({
    providedIn: 'root'
})
export class TimeZoneHelperService {

    toTimeZoneSpecific(timeZone = 'Asia/Kolkata', utcTime: any) {
        const istTime = moment.utc(utcTime).tz(timeZone);
        return istTime.format('YYYY-MM-DD')
    }
}