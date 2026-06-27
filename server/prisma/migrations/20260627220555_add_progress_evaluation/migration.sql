-- CreateEnum
CREATE TYPE "PeerReviewStatus" AS ENUM ('PENDING', 'COMPLETED');

-- CreateTable
CREATE TABLE "peer_reviews" (
    "id" TEXT NOT NULL,
    "reviewer_id" TEXT NOT NULL,
    "reviewee_id" TEXT NOT NULL,
    "assignment_id" TEXT,
    "week_number" INTEGER NOT NULL,
    "scores_json" JSONB,
    "strengths" TEXT,
    "improvements" TEXT,
    "status" "PeerReviewStatus" NOT NULL DEFAULT 'PENDING',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "peer_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "weekly_reports" (
    "id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "mentor_id" TEXT,
    "week_number" INTEGER NOT NULL,
    "summary_json" JSONB NOT NULL,
    "mentor_comments" TEXT,
    "overall_score" DOUBLE PRECISION,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "weekly_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "mentor_evaluations" (
    "id" TEXT NOT NULL,
    "intern_id" TEXT NOT NULL,
    "mentor_id" TEXT NOT NULL,
    "week_number" INTEGER NOT NULL,
    "technical_score" DOUBLE PRECISION NOT NULL,
    "soft_skill_score" DOUBLE PRECISION NOT NULL,
    "attendance_score" DOUBLE PRECISION NOT NULL,
    "overall_score" DOUBLE PRECISION NOT NULL,
    "feedback" TEXT,
    "areas_of_improvement" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "mentor_evaluations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "peer_reviews_reviewer_id_reviewee_id_week_number_key" ON "peer_reviews"("reviewer_id", "reviewee_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "weekly_reports_intern_id_week_number_key" ON "weekly_reports"("intern_id", "week_number");

-- CreateIndex
CREATE UNIQUE INDEX "mentor_evaluations_intern_id_mentor_id_week_number_key" ON "mentor_evaluations"("intern_id", "mentor_id", "week_number");

-- AddForeignKey
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_reviewer_id_fkey" FOREIGN KEY ("reviewer_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_reviewee_id_fkey" FOREIGN KEY ("reviewee_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "peer_reviews" ADD CONSTRAINT "peer_reviews_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "weekly_reports" ADD CONSTRAINT "weekly_reports_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_evaluations" ADD CONSTRAINT "mentor_evaluations_intern_id_fkey" FOREIGN KEY ("intern_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "mentor_evaluations" ADD CONSTRAINT "mentor_evaluations_mentor_id_fkey" FOREIGN KEY ("mentor_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
