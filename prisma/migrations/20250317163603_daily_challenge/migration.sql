-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "source" TEXT DEFAULT 'manual';

-- CreateTable
CREATE TABLE "DailyChallenge" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "userId" INTEGER NOT NULL,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "DailyChallenge_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "DailyChallenge_userId_idx" ON "DailyChallenge"("userId");

-- CreateIndex
CREATE INDEX "DailyChallenge_challengeId_idx" ON "DailyChallenge"("challengeId");

-- CreateIndex
CREATE INDEX "DailyChallenge_createdAt_idx" ON "DailyChallenge"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "DailyChallenge_userId_challengeId_key" ON "DailyChallenge"("userId", "challengeId");

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyChallenge" ADD CONSTRAINT "DailyChallenge_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
