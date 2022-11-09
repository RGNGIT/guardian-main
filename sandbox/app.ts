import { Temporal } from '@js-temporal/polyfill';

const fixDateTime = (date) => {
    return Temporal.ZonedDateTime.from(date);
};

(() => {
    console.log(fixDateTime('2022-10-26T12:46:27.010Z').toString());
})();