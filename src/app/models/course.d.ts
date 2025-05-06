type Course = {
  id: number;
  title: string;
  description: string;
  startDatetime: Date;
  endDatetime: Date;
  maxCapacity: number;
  price: number;
  club: null;
  coach: Coach;
  courseType: CourseType;
};
