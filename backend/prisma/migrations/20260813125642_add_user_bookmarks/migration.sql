-- AlterTable
ALTER TABLE "users" ADD COLUMN     "bookmarks" TEXT[] DEFAULT ARRAY[]::TEXT[];
