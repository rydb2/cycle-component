function getPreMonthObj(year: number, month: number) {
  return {
    end: new Date(year, month, 0),
    start: new Date(year, month - 1, 1),
  };
}

export function getPanelDays(
  year: number,
  month: number,
  opts: {
    current?: Date,
  } = {},
): { label: string, value: string, cur?: boolean }[] {
  // month start with 0
  // days start with 1
  let r = [];
  const preMonthObj = getPreMonthObj(year, month);
  const curMonthObj = {
    end: new Date(year, month, 0),
    start: new Date(year, month, 1),
  };
  const preMonthDays = preMonthObj.end.getDate();

  for (let i = 0; i < curMonthObj.start.getDay(); i++) {
    r.unshift({
      label: '',
      value: `${year}/${month - 2}/${preMonthDays - i - 1}`,
    });
  }
  for (let i = 1; i <= curMonthObj.end.getDate(); i += 1) {
    if (opts.current &&
        opts.current.setHours(0, 0, 0, 0) === new Date(year, month, i).getTime()) {
      r.push({
        cur: true,
        label: i + '',
        value: `${year}/${month}/${i}`,
      });
    } else {
      r.push({
        label: i + '',
        value: `${year}/${month}/${i}`,
      });
    }
  }
  return r;
}

export function getTitle(date: Date): string {
  return getMonthName(date.getMonth()) + ' ' + date.getFullYear();
}

export function getMonthName(i: number): string {
  const names = [
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

export function getWeekdayName(i: number): string {
  let days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
  ];
  return days[i];
}

