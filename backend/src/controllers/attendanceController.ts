import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../middleware/auth';

const prisma = new PrismaClient();

// Get employee ID from user
const getEmployeeId = async (userId: number) => {
  const employee = await prisma.employee.findUnique({
    where: { userId }
  });
  return employee?.id;
};

// Get today's date
const getTodayDate = () => {
  const today = new Date();
  return new Date(today.getFullYear(), today.getMonth(), today.getDate());
};

export const timeIn = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const employeeId = await getEmployeeId(userId);

    if (!employeeId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = getTodayDate();

    // Check if already timed in today
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        employee_id_date: {
          employeeId: employeeId,
          date: today
        }
      }
    });

    if (existingRecord && existingRecord.timeIn) {
      return res.status(400).json({ error: 'Already timed in today' });
    }

    // Create or update attendance record
    const attendance = await prisma.attendanceRecord.upsert({
      where: {
        employee_id_date: {
          employeeId: employeeId,
          date: today
        }
      },
      update: {
        timeIn: new Date()
      },
      create: {
        employeeId: employeeId,
        timeIn: new Date(),
        date: today
      }
    });

    res.json({
      message: 'Time in recorded',
      data: attendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Time in failed' });
  }
};

export const timeOut = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const employeeId = await getEmployeeId(userId);

    if (!employeeId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = getTodayDate();

    // Find today's record
    const existingRecord = await prisma.attendanceRecord.findUnique({
      where: {
        employee_id_date: {
          employeeId: employeeId,
          date: today
        }
      }
    });

    if (!existingRecord) {
      return res.status(400).json({ error: 'No time in record found for today' });
    }

    if (!existingRecord.timeIn) {
      return res.status(400).json({ error: 'Please time in first' });
    }

    // Calculate hours worked
    const timeOut = new Date();
    const hoursWorked = (timeOut.getTime() - existingRecord.timeIn.getTime()) / (1000 * 60 * 60);
    const isCompleted = hoursWorked >= 8;

    // Update attendance record
    const updatedAttendance = await prisma.attendanceRecord.update({
      where: {
        employee_id_date: {
          employeeId: employeeId,
          date: today
        }
      },
      data: {
        timeOut: timeOut,
        hoursWorked: parseFloat(hoursWorked.toFixed(2)),
        isCompleted: isCompleted,
        updatedAt: new Date()
      }
    });

    res.json({
      message: 'Time out recorded',
      data: updatedAttendance
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Time out failed' });
  }
};

export const getTodayAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const employeeId = await getEmployeeId(userId);

    if (!employeeId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const today = getTodayDate();

    const attendance = await prisma.attendanceRecord.findUnique({
      where: {
        employee_id_date: {
          employeeId: employeeId,
          date: today
        }
      }
    });

    res.json({
      data: attendance || {
        message: 'No attendance record for today',
        status: 'not_started'
      }
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch attendance' });
  }
};

export const getAttendanceHistory = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { limit = 30, offset = 0 } = req.query;

    const employeeId = await getEmployeeId(userId);

    if (!employeeId) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: employeeId },
      orderBy: { date: 'desc' },
      take: parseInt(limit as string),
      skip: parseInt(offset as string)
    });

    res.json({ data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch history' });
  }
};

export const getEmployeeAttendance = async (req: AuthRequest, res: Response) => {
  try {
    const { employeeId } = req.params;

    const records = await prisma.attendanceRecord.findMany({
      where: { employeeId: parseInt(employeeId) },
      include: {
        employee: true
      }
    });

    res.json({ data: records });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch employee attendance' });
  }
};
