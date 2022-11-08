import { Temporal } from '@js-temporal/polyfill';

const isLastFifteenMin = (emissionDate) => {
    const eDate = Temporal.PlainDateTime.from(emissionDate);
    const todayDate = Temporal.PlainDateTime.from(new Date(Date.now()).toISOString().split('.')[0]);
    return eDate.until(todayDate).years == 0 && eDate.until(todayDate).days == 0 && eDate.until(todayDate).minutes <= 15;
}
(() => {
    console.log(isLastFifteenMin('2022-11-08T10:35:30'));
})();