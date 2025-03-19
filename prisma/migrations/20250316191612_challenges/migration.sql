-- AlterTable
ALTER TABLE "Challenge" ADD COLUMN     "difficulty" TEXT,
ADD COLUMN     "expectedOutput" TEXT,
ADD COLUMN     "initialCode" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "memoryLimit" INTEGER,
ADD COLUMN     "sampleInput" TEXT,
ADD COLUMN     "solutionCode" TEXT,
ADD COLUMN     "timeLimit" INTEGER;

-- CreateTable
CREATE TABLE "ChallengeType" (
    "id" SERIAL NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeType_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeTestCase" (
    "id" SERIAL NOT NULL,
    "challengeId" TEXT NOT NULL,
    "input" TEXT,
    "expectedOutput" TEXT,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ChallengeTestCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ChallengeAttempt" (
    "id" SERIAL NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userCode" TEXT NOT NULL,
    "aiCode" TEXT NOT NULL,
    "userExecutionTime" DOUBLE PRECISION,
    "userMemory" INTEGER,
    "aiExecutionTime" DOUBLE PRECISION,
    "aiMemory" INTEGER,
    "userCorrect" BOOLEAN NOT NULL DEFAULT false,
    "aiCorrect" BOOLEAN NOT NULL DEFAULT false,
    "winner" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "ChallengeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserChallengeStats" (
    "id" SERIAL NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "wins" INTEGER NOT NULL DEFAULT 0,
    "ties" INTEGER NOT NULL DEFAULT 0,
    "bestTime" DOUBLE PRECISION,
    "bestMemory" INTEGER,
    "bestCodeLength" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,
    "challengeId" TEXT NOT NULL,

    CONSTRAINT "UserChallengeStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserGlobalStats" (
    "id" SERIAL NOT NULL,
    "totalChallengesAttempted" INTEGER NOT NULL DEFAULT 0,
    "challengesWon" INTEGER NOT NULL DEFAULT 0,
    "challengesTied" INTEGER NOT NULL DEFAULT 0,
    "codeGolfRating" INTEGER NOT NULL DEFAULT 1000,
    "timeTrialRating" INTEGER NOT NULL DEFAULT 1000,
    "memoryOptRating" INTEGER NOT NULL DEFAULT 1000,
    "debuggingRating" INTEGER NOT NULL DEFAULT 1000,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserGlobalStats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ChallengeToChallengeType" (
    "A" TEXT NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ChallengeToChallengeType_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "ChallengeType_type_key" ON "ChallengeType"("type");

-- CreateIndex
CREATE INDEX "ChallengeAttempt_userId_challengeId_idx" ON "ChallengeAttempt"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserChallengeStats_userId_challengeId_key" ON "UserChallengeStats"("userId", "challengeId");

-- CreateIndex
CREATE UNIQUE INDEX "UserGlobalStats_userId_key" ON "UserGlobalStats"("userId");

-- CreateIndex
CREATE INDEX "_ChallengeToChallengeType_B_index" ON "_ChallengeToChallengeType"("B");

-- AddForeignKey
ALTER TABLE "ChallengeTestCase" ADD CONSTRAINT "ChallengeTestCase_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChallengeAttempt" ADD CONSTRAINT "ChallengeAttempt_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeStats" ADD CONSTRAINT "UserChallengeStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserChallengeStats" ADD CONSTRAINT "UserChallengeStats_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserGlobalStats" ADD CONSTRAINT "UserGlobalStats_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToChallengeType" ADD CONSTRAINT "_ChallengeToChallengeType_A_fkey" FOREIGN KEY ("A") REFERENCES "Challenge"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ChallengeToChallengeType" ADD CONSTRAINT "_ChallengeToChallengeType_B_fkey" FOREIGN KEY ("B") REFERENCES "ChallengeType"("id") ON DELETE CASCADE ON UPDATE CASCADE;
