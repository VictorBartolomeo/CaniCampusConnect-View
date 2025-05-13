import {Coach} from './coach'
import {Registration} from './registration';
import {Club} from './club'
import {CourseType} from './courseType';

type Course = {
  id: number;
  title: string;
  description: string;
  startDatetime: Date;
  endDatetime: Date;
  maxCapacity: number;
  price: number;
  registrations: Registration[];
  club: Club;
  coach: Coach;
  courseType: CourseType;
};
