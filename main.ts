// @deno-types="https://cdn.sheetjs.com/xlsx-0.20.0/package/types/index.d.ts"
import * as XLSX from "https://cdn.sheetjs.com/xlsx-0.20.0/package/xlsx.mjs";
// XLSX.set_cptable(cptable);

const file = "./Book1.xlsx";

const workbook = XLSX.readFile(file);

const worksheet = workbook.Sheets[workbook.SheetNames[0]];
// console.log(worksheet)

const raw_data = XLSX.utils.sheet_to_json(worksheet);

console.log(raw_data);

const grades = {
  NA: 34,
  "1": 9,
  "2": 10,
  "3": 11,
  "4": 12,
  "5": 1,
  "6": 2,
  "7": 3,
  "8": 4,
  "9": 5,
  "10": 6,
  "11": 7,
  "12": 8,
  PK: 13,
  K: 14,
};

type ROW_TYPE = {
  District: string;
  School: string;
  Grades: string;
  "Early Dismissal": string | null;
  "Late Start": string | null;
  Dates: string;
  Holiday: string | null;
  Calendar: string | number;
  AMBell: string | null;
  PMBell: string | null;
  Days: string | null;
};

const earlyDismissals = raw_data.filter((row: ROW_TYPE) => {
  return (
    row.hasOwnProperty("Early Dismissal") || row.hasOwnProperty("Late Start")
  );
});

const holidays = raw_data.filter((row: ROW_TYPE) =>
  row.hasOwnProperty("Holiday")
);

console.log(raw_data.length, earlyDismissals.length, holidays.length);

// holidays.forEach(holiday => {
//   const {Dates}= holiday;
//
//   Dates.split(',').forEach(date => {
//     if (date.length) {
//
//
//
//     console.log(`insert into datamanagement.school_holiday (school_calendar_id, holiday, start_date, end_date, status, created_at, updated_at) values(${holiday.Calendar}, '${holiday.Holiday}', '${date}', '${date}', 'ACTIVE', now(), now());`)
//     }
//   })
//
// })

earlyDismissals.forEach((ed: ROW_TYPE) => {
  const { Grades, Dates } = ed;

  const gradesList = Grades.split(",");
  const datesList = Dates.split(",");
  const erType = ed["Early Dismissal"] ? "EARLY_RELEASE_DAY" : "LATE_START_DAY";
  const time = ed["Early Dismissal"] ?? ed["Late Start"];

  gradesList.forEach((grade) => {
    datesList.forEach((date) => {
      if (date.length > 1) {
        console.log(
          `insert into datamanagement.school_release_time ( school_calendar_id, release_type, release_date, release_time, status, created_at, updated_at, grade_type_id) values (${
            ed.Calendar
          }, '${erType}', '${date.trim()}', '${time}', 'ACTIVE', now(), now(), ${
            grades[grade.trim()]
          });`
        );
      }
    });
  });
});

const days = {
  M: "MONDAY",
  T: "TUESDAY",
  W: "WEDNESDAY",
  H: "THURSDAY",
  F: "FRIDAY",
};

const bellTimes: [ROW_TYPE] = raw_data.filter((row: ROW_TYPE) =>
  row.hasOwnProperty("AMBell")
);

const created = [1145, 1235, 954, 1078, 985, 1310, 964, 1141, 944, 947, 1084];

bellTimes.forEach((bellTime: ROW_TYPE) => {
  const { Days, AMBell, PMBell } = bellTime;

  const daysList = Days.split(",");

  daysList.forEach((day) => {
    const dayComplete = days[day];

    if (created.includes(+bellTime.Calendar)) {
      console.log(
        `update datamanagement.school_time set am_bell_time = '${AMBell}', pm_bell_time = '${PMBell}', updated_at=now() where school_calendar_id = ${bellTime.Calendar} and day_of_the_week='${dayComplete}';`
      );
    } else {
      console.log(
        `insert into datamanagement.school_time(school_calendar_id, day_of_the_week, am_bell_time, drop_off_window, pm_bell_time, pick_up_window, status, created_at, updated_at) values(${bellTime.Calendar}, '${dayComplete}', '${AMBell}', 5, '${PMBell}', 5, 'ACTIVE', now(), now());`
      );
    }
  });
});
