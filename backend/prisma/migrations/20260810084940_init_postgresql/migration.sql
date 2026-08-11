-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'user',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "personalInfo" JSONB NOT NULL DEFAULT '{"fullName":"","phoneNumber":null,"location":null,"profilePicture":null,"bio":null}',
    "onboarding" JSONB NOT NULL DEFAULT '{"skills":[],"interests":[],"budget":0,"experience":"","goals":[]}',
    "preferences" JSONB NOT NULL DEFAULT '{"notifications":true,"darkMode":false,"publicProfile":true}',
    "achievements" TEXT[],
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "refreshTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "isRevoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "refreshTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emailVerificationTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emailVerificationTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "passwordResetTokens" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "passwordResetTokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentors" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "specialization" TEXT NOT NULL,
    "skills" TEXT[],
    "languages" TEXT[],
    "availability" JSONB NOT NULL DEFAULT '[]',
    "rating" DOUBLE PRECISION NOT NULL DEFAULT 5.0,
    "reviewsCount" INTEGER NOT NULL DEFAULT 0,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "documents" TEXT[],
    "socialLinks" JSONB NOT NULL DEFAULT '{"linkedin":null,"website":null}',
    "ratePerHour" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorBookings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "bookingDate" TIMESTAMP(3) NOT NULL,
    "timeSlot" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "notes" TEXT,
    "meetingLink" TEXT,
    "feedback" JSONB,
    "rescheduleRequests" JSONB,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "mentorBookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businessIdeas" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "subcategory" TEXT,
    "investmentMin" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "investmentMax" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "expectedRevenue" TEXT NOT NULL,
    "difficultyLevel" TEXT NOT NULL,
    "riskLevel" TEXT NOT NULL,
    "requiredSkills" TEXT[],
    "requiredEquipment" TEXT[],
    "marketDemand" TEXT NOT NULL,
    "successTips" TEXT[],
    "commonChallenges" TEXT[],
    "images" TEXT[],
    "videos" TEXT[],
    "learningResources" TEXT[],
    "tags" TEXT[],
    "status" TEXT NOT NULL DEFAULT 'pending',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "bookmarkCount" INTEGER NOT NULL DEFAULT 0,
    "popularityScore" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "businessIdeas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentorBusinessIdeas" (
    "id" TEXT NOT NULL,
    "mentorId" TEXT NOT NULL,
    "businessIdeaId" TEXT NOT NULL,

    CONSTRAINT "mentorBusinessIdeas_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmaps" (
    "id" TEXT NOT NULL,
    "businessIdeaId" TEXT NOT NULL,
    "overview" TEXT NOT NULL,
    "duration" TEXT NOT NULL,
    "costMarketing" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costRegistration" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costEquipment" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "costScaling" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmaps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roadmapSteps" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "stepNumber" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "estimatedTime" TEXT NOT NULL,
    "videoUrl" TEXT,
    "articleUrl" TEXT,
    "checklist" JSONB NOT NULL DEFAULT '[]',
    "resources" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roadmapSteps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "progress" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "roadmapProgress" JSONB NOT NULL DEFAULT '[]',
    "learningProgress" JSONB NOT NULL DEFAULT '[]',
    "totalLearningHours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "certificates" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "learningResources" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "duration" TEXT,
    "category" TEXT NOT NULL,
    "skillTags" TEXT[],
    "isPremium" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "learningResources_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "skills" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "skills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interests" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_isDeleted_idx" ON "users"("isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "refreshTokens_token_key" ON "refreshTokens"("token");

-- CreateIndex
CREATE INDEX "refreshTokens_expiresAt_idx" ON "refreshTokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "emailVerificationTokens_token_key" ON "emailVerificationTokens"("token");

-- CreateIndex
CREATE INDEX "emailVerificationTokens_expiresAt_idx" ON "emailVerificationTokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "passwordResetTokens_token_key" ON "passwordResetTokens"("token");

-- CreateIndex
CREATE INDEX "passwordResetTokens_expiresAt_idx" ON "passwordResetTokens"("expiresAt");

-- CreateIndex
CREATE UNIQUE INDEX "mentors_userId_key" ON "mentors"("userId");

-- CreateIndex
CREATE INDEX "mentors_isVerified_isDeleted_idx" ON "mentors"("isVerified", "isDeleted");

-- CreateIndex
CREATE INDEX "mentorBookings_mentorId_bookingDate_timeSlot_status_idx" ON "mentorBookings"("mentorId", "bookingDate", "timeSlot", "status");

-- CreateIndex
CREATE UNIQUE INDEX "businessIdeas_title_key" ON "businessIdeas"("title");

-- CreateIndex
CREATE UNIQUE INDEX "businessIdeas_slug_key" ON "businessIdeas"("slug");

-- CreateIndex
CREATE INDEX "businessIdeas_status_isDeleted_idx" ON "businessIdeas"("status", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "mentorBusinessIdeas_mentorId_businessIdeaId_key" ON "mentorBusinessIdeas"("mentorId", "businessIdeaId");

-- CreateIndex
CREATE UNIQUE INDEX "roadmaps_businessIdeaId_key" ON "roadmaps"("businessIdeaId");

-- CreateIndex
CREATE INDEX "roadmapSteps_roadmapId_stepNumber_idx" ON "roadmapSteps"("roadmapId", "stepNumber");

-- CreateIndex
CREATE UNIQUE INDEX "progress_userId_key" ON "progress"("userId");

-- CreateIndex
CREATE INDEX "learningResources_category_isDeleted_idx" ON "learningResources"("category", "isDeleted");

-- CreateIndex
CREATE UNIQUE INDEX "skills_name_key" ON "skills"("name");

-- CreateIndex
CREATE UNIQUE INDEX "skills_slug_key" ON "skills"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "interests_name_key" ON "interests"("name");

-- CreateIndex
CREATE UNIQUE INDEX "interests_slug_key" ON "interests"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "categories_slug_key" ON "categories"("slug");

-- AddForeignKey
ALTER TABLE "refreshTokens" ADD CONSTRAINT "refreshTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emailVerificationTokens" ADD CONSTRAINT "emailVerificationTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "passwordResetTokens" ADD CONSTRAINT "passwordResetTokens_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentors" ADD CONSTRAINT "mentors_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorBookings" ADD CONSTRAINT "mentorBookings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorBookings" ADD CONSTRAINT "mentorBookings_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorBusinessIdeas" ADD CONSTRAINT "mentorBusinessIdeas_mentorId_fkey" FOREIGN KEY ("mentorId") REFERENCES "mentors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentorBusinessIdeas" ADD CONSTRAINT "mentorBusinessIdeas_businessIdeaId_fkey" FOREIGN KEY ("businessIdeaId") REFERENCES "businessIdeas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmaps" ADD CONSTRAINT "roadmaps_businessIdeaId_fkey" FOREIGN KEY ("businessIdeaId") REFERENCES "businessIdeas"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "roadmapSteps" ADD CONSTRAINT "roadmapSteps_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "roadmaps"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "progress" ADD CONSTRAINT "progress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
