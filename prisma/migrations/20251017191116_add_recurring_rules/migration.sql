-- CreateEnum
CREATE TYPE "RecurringType" AS ENUM ('WEEKLY', 'MONTHLY', 'CUSTOM');

-- AlterTable
ALTER TABLE "PriceRule" ADD COLUMN     "daysOfWeek" INTEGER[],
ADD COLUMN     "isRecurring" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "recurringEndDate" TIMESTAMP(3),
ADD COLUMN     "recurringType" "RecurringType";
