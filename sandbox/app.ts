import { Temporal } from '@js-temporal/polyfill';

const isCurrentYearQuarter = (emissionDate): boolean => {
    const today = new Date();
    const eDate = new Date(emissionDate);
    const currentQuarter = Math.floor((today.getMonth() + 3) / 3);
    const eQuarter = Math.floor((eDate.getMonth() + 3) / 3);
    return currentQuarter == eQuarter;
};

(() => {
    console.log(isCurrentYearQuarter('10-26-2022'));
})();