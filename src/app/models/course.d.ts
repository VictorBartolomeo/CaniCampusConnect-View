type Course = {
  id: number;
  title: string;
  description: string;
  startDatetime: string;
  endDatetime: string;
  maxCapacity: number;
  price: number;
  club: null;
  coach: Coach;
  courseType: CourseType;
};
