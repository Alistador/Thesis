-- CreateTable
CREATE TABLE "VerificationPageToken" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "VerificationPageToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationPageToken_token_key" ON "VerificationPageToken"("token");

-- CreateIndex
CREATE INDEX "VerificationPageToken_token_idx" ON "VerificationPageToken"("token");

-- AddForeignKey
ALTER TABLE "VerificationPageToken" ADD CONSTRAINT "VerificationPageToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
