function getPreMonthObj(year:number, month:number) {
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 0)
  }
};

export function getPanelDays(year:number, month:number): {label:string, value:string}[] {
  // month start with 0
  // days start with 1
  let r = [];
  let preMonthObj = getPreMonthObj(year, month);
  let curMonthObj = {
    start: new Date(year, month, 1),
    end: new Date(year, month, 0)
  };

  let preMonthDays = preMonthObj.end.getDate();
  for (let i = 0; i < curMonthObj.start.getDay(); i++) {
    r.unshift({
      label: '',
      value: `${year}/${month - 2}/${preMonthDays - i - 1}`
    });
  }
  for (let i = 0; i < curMonthObj.end.getDate(); i++) {
    r.push({
      label: i + 1 + '',
      value: `${year}/${month - 1}/${i}`
    });
  }
  // let nextMonthDaysNum = 6 * 7 - curMonthObj.end.getDate() - curMonthObj.start.getDay();
  // for (let i = 0; i < nextMonthDaysNum; i++) {
  //   r.push({
  //     label: i + 1,
  //     value: `${year}/${month}/${i}`
  //   });
  // }
  return r;
}

export function getTitle(date: Date): string {
  return getMonthName(date.getMonth()) + ' ' + date.getFullYear();
}

export function getMonthName(i:number):string {
  let names = [
    'January',
    'February',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
  ];
  return names[i];
}

export function getWeekdayName(i:number):string {
  let days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday'
  ];
  return days[i];
}
