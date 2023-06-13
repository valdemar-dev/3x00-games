-- CreateTable
CREATE TABLE "Transaction" (
    "id" SERIAL NOT NULL,
    "transactionAmount" TEXT NOT NULL,
    "transactionCategory" TEXT NOT NULL,
    "transactionType" TEXT NOT NULL,
    "walletId" INTEGER NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_walletId_fkey" FOREIGN KEY ("walletId") REFERENCES "UserWallet"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
