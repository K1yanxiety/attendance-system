import { Router } from 'express';
import {
  timeIn,
  timeOut,
  getTodayAttendance,
  getAttendanceHistory,
  getEmployeeAttendance
} from '../controllers/attendanceController';

const router = Router();

router.post('/time-in', timeIn);
router.post('/time-out', timeOut);
router.get('/today', getTodayAttendance);
router.get('/history', getAttendanceHistory);
router.get('/:employeeId', getEmployeeAttendance);

export default router;
